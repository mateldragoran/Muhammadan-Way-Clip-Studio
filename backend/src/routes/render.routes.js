import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { createTempWorkspace, getFilePath, cleanupWorkspace } from '../utils/fileManager.js';
import { downloadFileFromUrl, uploadRenderedClip } from '../services/storage.service.js';
import { generateAssSubtitleFile } from '../utils/subtitleGenerator.js';
import { renderClip } from '../services/render.service.js';

const router = express.Router();

/**
 * POST /api/render
 * The master render orchestrator. Now stripped of AI calls for maximum speed!
 */
router.post('/', async (req, res) => {
  const {
    userId,
    videoId,
    trimStart,
    trimEnd,
    template,
    bRoll = [],
    captions = [],
    cropX = 50,
    bgMusic = null,
    isPublic = true,
    category = 'lecture',
    showCaptions = true,
    uppercaseOnly = false,
    fontSize = 'md',
    captionBg = 'none',
    highlightColor = 'gold',
    videoFilter = 'none',
    karaokeEnabled = true,
    addIntro = false,
  } = req.body;

  if (!userId || !videoId || trimStart === undefined || trimEnd === undefined) {
    return res.status(400).json({ error: 'Missing required render parameters.' });
  }

  let workspacePath = null;

  try {
    console.log(`🎬 Received render request for video ${videoId} from user ${userId}`);

    // 1. Create workspace
    const shortUserId = userId.toString().slice(0, 8);
    const jobId = `job_${shortUserId}_${Date.now()}`;
    workspacePath = await createTempWorkspace(jobId);

    // 2. Fetch source video
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('videos')
      .select('video_url')
      .eq('id', videoId)
      .single();

    if (dbError || !videoRecord) {
      throw new Error('Could not find the source video in the database.');
    }

    // 3. Download Source Video
    const localVideoPath = getFilePath(workspacePath, 'source.mp4');
    await downloadFileFromUrl(videoRecord.video_url, localVideoPath);

    // 4. Download B-Roll
    const bRollItems = await Promise.all(
      bRoll.map(async (item, index) => {
        let ext = 'png';
        if (item.url.startsWith('data:')) {
          const mime = item.url.substring(5, item.url.indexOf(';'));
          ext = mime.split('/')[1] || 'png';
          if (ext === 'jpeg') ext = 'jpg';
        } else {
          ext = item.url.split('.').pop().split('?')[0] || 'png';
          if (ext.length > 5) ext = 'png';
        }

        const localBRollPath = getFilePath(workspacePath, `broll_${index}.${ext}`);
        await downloadFileFromUrl(item.url, localBRollPath);

        return {
          localPath: localBRollPath,
          startTime: item.startTime,
          endTime: item.endTime,
          type: item.type || 'image',
          layout: item.layout || 'fullscreen',
          panX: item.panX ?? 50,
        };
      })
    );

    // 5. Download Background Music
    let localBgMusicItem = null;
    if (bgMusic && bgMusic.url) {
      let musicExt = 'mp3';
      if (bgMusic.url.startsWith('data:')) {
        const mime = bgMusic.url.substring(5, bgMusic.url.indexOf(';'));
        const sub = mime.split('/')[1] || 'mp3';
        if (sub === 'mpeg' || sub === 'mp3') musicExt = 'mp3';
        else if (sub === 'wav') musicExt = 'wav';
        else musicExt = 'mp3';
      } else {
        musicExt = bgMusic.url.split('.').pop().split('?')[0] || 'mp3';
        if (musicExt.length > 5) musicExt = 'mp3';
      }

      const localMusicPath = getFilePath(workspacePath, `bgmusic.${musicExt}`);
      await downloadFileFromUrl(bgMusic.url, localMusicPath);
      
      localBgMusicItem = {
        localPath: localMusicPath,
        volume: bgMusic.volume ?? 0.1,
        startTime: bgMusic.startTime,
        endTime: bgMusic.endTime,
        isLooping: bgMusic.isLooping ?? true,
      };
    }

    // 6. Generate Subtitles (.ass file) ONLY IF subtitles are toggled ON
    let subtitlePath = null;
    if (showCaptions && captions && captions.length > 0) {
      subtitlePath = getFilePath(workspacePath, 'captions.ass');
      const styles = { uppercaseOnly, fontSize, captionBg, highlightColor, karaokeEnabled };
      await generateAssSubtitleFile(captions, styles, trimStart, subtitlePath);
    }

    // 7. Run the FFmpeg Engine (AI Call completely removed from here!)
    const finalOutputPath = getFilePath(workspacePath, 'final_render.mp4');
    await renderClip({
      sourceVideoPath: localVideoPath,
      bRollItems,
      subtitlePath,
      bgMusicItem: localBgMusicItem,
      trimStart,
      trimEnd,
      cropX,
      videoFilter,
      captionBg,
      addIntro,
      outputPath: finalOutputPath,
    });

    // 8. Upload final MP4
    const finalClipUrl = await uploadRenderedClip(finalOutputPath, userId);

    let clipId = null;

    if (userId !== 'guest') {
      // 9. Save Project State
      const { data: projectRecord, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          user_id: userId,
          video_id: videoId,
          state_json: req.body,
        })
        .select()
        .single();

      if (projectError) throw new Error(`Failed to save project: ${projectError.message}`);

      // 10. Save Clip Record
      const { data: clipRecord, error: clipError } = await supabaseAdmin
        .from('clips')
        .insert({
          user_id: userId,
          video_id: videoId,
          project_id: projectRecord.id,
          clip_url: finalClipUrl,
          template_used: template,
          downloads: 0,
          is_public: isPublic,
          category: category,
        })
        .select()
        .single();

      if (clipError) throw new Error(`Failed to save clip record: ${clipError.message}`);
      
      clipId = clipRecord.id;

      // 11. Increment video clip count
      try {
        const { data: vData, error: vErr } = await supabaseAdmin
          .from('videos')
          .select('clip_count')
          .eq('id', videoId)
          .single();
          
        if (vData && !vErr) {
          await supabaseAdmin
            .from('videos')
            .update({ clip_count: (vData.clip_count || 0) + 1 })
            .eq('id', videoId);
        }
      } catch (err) {
        console.warn("Increment clip count warning:", err.message);
      }
    }

    // 12. Return Success
    return res.status(200).json({
      message: 'Render complete!',
      clipUrl: finalClipUrl,
      clipId: clipId,
      // Removed socialCaption and hashtags from return payload
    });

  } catch (error) {
    console.error('❌ Render Job Failed:', error);
    return res.status(500).json({
      error: 'Render failed',
      message: error.message,
    });
  } finally {
    // 13. STRICT CLEANUP
    await cleanupWorkspace(workspacePath);
  }
});

export default router;