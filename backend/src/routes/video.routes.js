import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { supabaseAdmin } from '../config/supabase.js';
import { createTempWorkspace, getFilePath, cleanupWorkspace } from '../utils/fileManager.js';
import { downloadFileFromUrl } from '../services/storage.service.js';
import { generateCaptions } from '../services/deepgram.service.js';
import { findVideoHighlights, generateViralCopy, generateBRollPrompts } from '../services/ai.service.js';

const router = express.Router();

/**
 * HELPER: Extracts a highly compressed, audio-only MP3 from a video file using FFmpeg.
 */
const extractAudio = (inputVideoPath, outputAudioPath) => {
  return new Promise((resolve, reject) => {
    console.log(`🎵 Extracting audio to ${outputAudioPath}...`);
    ffmpeg(inputVideoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioChannels(1)
      .audioFrequency(16000)
      .output(outputAudioPath)
      .on('end', () => resolve(outputAudioPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

// =========================================
// 1. DEEPGRAM PROCESSING ENDPOINT
// =========================================
router.post('/process', async (req, res) => {
  const { videoId } = req.body;
  
  if (!videoId) return res.status(400).json({ error: 'videoId is required' });

  let workspacePath = null;

  try {
    const { data: video, error: dbError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (dbError || !video) throw new Error(`Video not found in database: ${dbError?.message}`);

    workspacePath = await createTempWorkspace(`process_${videoId}_${Date.now()}`);
    const localVideoPath = getFilePath(workspacePath, 'source.mp4');
    const localAudioPath = getFilePath(workspacePath, 'audio.mp3');

    await downloadFileFromUrl(video.video_url, localVideoPath);
    await extractAudio(localVideoPath, localAudioPath);
    const captionsJson = await generateCaptions(localAudioPath);

    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ captions_json: captionsJson })
      .eq('id', videoId);

    if (updateError) throw new Error(`Failed to update database with captions: ${updateError.message}`);

    return res.status(200).json({
      message: 'Video processed successfully!',
      wordCount: captionsJson.length
    });

  } catch (error) {
    console.error('❌ Error processing video:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  } finally {
    await cleanupWorkspace(workspacePath);
  }
});

// =========================================
// 2. AI HIGHLIGHT FINDER ENDPOINT
// =========================================
router.post('/highlights', async (req, res) => {
  const { captions, category } = req.body;

  if (!captions || !Array.isArray(captions)) {
    return res.status(400).json({ error: 'Valid captions array is required.' });
  }

  try {
    const highlights = await findVideoHighlights(captions, category || 'lecture');
    return res.status(200).json({ highlights });
  } catch (error) {
    console.error('❌ Endpoint Error [Highlights]:', error);
    return res.status(500).json({ error: 'Failed to generate highlights.' });
  }
});

// =========================================
// 3. ON-DEMAND VIRAL COPYWRITER ENDPOINT
// =========================================
router.post('/social-copy', async (req, res) => {
  const { transcriptText, language } = req.body;

  if (!transcriptText) {
    return res.status(400).json({ error: 'transcriptText is required.' });
  }

  try {
    const { socialCaption } = await generateViralCopy(transcriptText, language || 'English');
    return res.status(200).json({ socialCaption });
  } catch (error) {
    console.error('❌ Endpoint Error [Social Copy]:', error);
    return res.status(500).json({ error: 'Failed to generate social media copy.' });
  }
});

// =========================================
// 4. AI B-ROLL PROMPTS ENDPOINT
// =========================================
router.post('/broll-prompts', async (req, res) => {
  const { captions, promptType } = req.body;

  if (!captions || !Array.isArray(captions)) {
    return res.status(400).json({ error: 'Valid captions array is required.' });
  }

  try {
    const bRollPrompts = await generateBRollPrompts(captions, promptType || 'image');
    return res.status(200).json({ bRollPrompts });
  } catch (error) {
    console.error('❌ Endpoint Error [B-Roll Prompts]:', error);
    return res.status(500).json({ error: 'Failed to generate B-Roll prompts.' });
  }
});

// =========================================
// 5. TRACK CLIP DOWNLOAD ENDPOINT
// =========================================
router.post('/clips/:id/download', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch the clip to get current downloads and user_id
    const { data: clip, error: clipError } = await supabaseAdmin
      .from('clips')
      .select('user_id, downloads')
      .eq('id', id)
      .single();

    if (clipError || !clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // 2. Increment clip downloads
    const newClipDownloads = (clip.downloads || 0) + 1;
    await supabaseAdmin
      .from('clips')
      .update({ downloads: newClipDownloads })
      .eq('id', id);

    // 3. Update the creator's total downloads
    if (clip.user_id) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('total_downloads')
        .eq('id', clip.user_id)
        .single();
        
      if (!profileError && profile) {
        const newTotal = (profile.total_downloads || 0) + 1;
        await supabaseAdmin
          .from('profiles')
          .update({ total_downloads: newTotal })
          .eq('id', clip.user_id);
      }
    }

    return res.status(200).json({ success: true, downloads: newClipDownloads });
  } catch (error) {
    console.error('❌ Endpoint Error [Download Track]:', error);
    return res.status(500).json({ error: 'Failed to track download.' });
  }
});

export default router;