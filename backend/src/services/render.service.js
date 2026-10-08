import ffmpeg from 'fluent-ffmpeg';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Builds and executes the ultimate FFmpeg rendering pipeline.
 * @param {Object} options
 */
export const renderClip = (options) => {
  return new Promise((resolve, reject) => {
    const {
      sourceVideoPath,
      bRollItems = [],
      subtitlePath,
      bgMusicItem,
      trimStart,
      trimEnd,
      cropX = 50,
      videoFilter = 'none',
      captionBg = 'none',
      addIntro,
      outputPath
    } = options;

    console.log(`🎬 Starting Ultimate FFmpeg Render to ${outputPath}...`);

    let activeBRollItems = [...(bRollItems || [])];
    if (addIntro) {
      activeBRollItems.unshift({
        localPath: path.resolve(__dirname, '../assets/intro.mp4'),
        type: 'video',
        layout: 'fullscreen',
        startTime: trimStart,
        endTime: trimStart + 5.03,
        panX: 50,
        isIntro: true
      });
    }

    const command = ffmpeg();
    const duration = trimEnd - trimStart;

    // 1. INPUT 0: Main source video
    command.input(sourceVideoPath)
           .setStartTime(trimStart)
           .setDuration(duration);

    // 2. INPUT 1 to N: B-roll assets
    activeBRollItems.forEach((bRoll) => {
      if (bRoll.type === 'image') {
        command.input(bRoll.localPath).inputOptions(['-loop 1']);
      } else {
        command.input(bRoll.localPath).inputOptions(['-stream_loop -1']);
      }
    });

    // 3. INPUT N+1: Background Music (Infinite Loop to span full clip duration)
    let bgMusicInputIndex = -1;
    if (bgMusicItem && bgMusicItem.localPath) {
      bgMusicInputIndex = activeBRollItems.length + 1;
      command.input(bgMusicItem.localPath).inputOptions(['-stream_loop -1']);
    }

    // =========================================
    // BUILD THE COMPLEX FILTER GRAPH
    // =========================================
    let filterGraph = [];

    // Step A: Base Video - Camera Pan Crop & Scale
    filterGraph.push(
      `[0:v]crop=ih*9/16:ih:(iw-ow)*${cropX}/100:0,scale=1080:1920,setsar=1[v_base]`
    );

    let currentVideoStream = 'v_base';

    // Step B: Advanced B-Roll Overlays
    activeBRollItems.forEach((bRoll, index) => {
      const inputIndex = index + 1;
      const adjustedStart = Math.max(0, bRoll.startTime - trimStart);
      const adjustedEnd = Math.max(0, bRoll.endTime - trimStart);
      const bDuration = Math.max(0.1, adjustedEnd - adjustedStart);
      const fadeDuration = Math.min(0.5, bDuration / 2);

      const targetH = bRoll.layout === 'fullscreen' ? 1920 : 960;
      const yPos = bRoll.layout === 'split-bottom' ? 960 : 0;
      const bPanX = bRoll.panX ?? 50;

      const scaledStream = `b_scaled_${index}`;
      const fadedStream = `b_faded_${index}`;
      const nextVideoStream = `v_broll_${index}`;

      filterGraph.push(
        `[${inputIndex}:v]scale=1080:${targetH}:force_original_aspect_ratio=increase,crop=1080:${targetH}:(in_w-1080)*${bPanX}/100:(in_h-${targetH})/2,setsar=1[${scaledStream}]`
      );

      if (bRoll.isIntro) {
        // Smooth 1s fade-out at the end, no fade-in at the start
        const introFadeDuration = 1.0;
        filterGraph.push(
          `[${scaledStream}]format=yuva420p,fade=t=out:st=${adjustedEnd - introFadeDuration}:d=${introFadeDuration}:alpha=1[${fadedStream}]`
        );
      } else {
        filterGraph.push(
          `[${scaledStream}]format=yuva420p,fade=t=in:st=${adjustedStart}:d=${fadeDuration}:alpha=1,fade=t=out:st=${adjustedEnd - fadeDuration}:d=${fadeDuration}:alpha=1[${fadedStream}]`
        );
      }

      filterGraph.push(
        `[${currentVideoStream}][${fadedStream}]overlay=x=0:y=${yPos}:enable='between(t,${adjustedStart},${adjustedEnd})'[${nextVideoStream}]`
      );

      currentVideoStream = nextVideoStream;
    });

    // Step C: Color Grading (Video Filters)
    if (videoFilter && videoFilter !== 'none') {
      let eqFilter = '';
      if (videoFilter === 'warm') eqFilter = 'eq=saturation=1.2:gamma_r=1.05:gamma_b=0.95';
      else if (videoFilter === 'cinematic') eqFilter = 'eq=contrast=1.15:saturation=0.85';
      else if (videoFilter === 'moody') eqFilter = 'eq=gamma=0.8:contrast=1.2:saturation=0.8';
      else if (videoFilter === 'vibrant') eqFilter = 'eq=saturation=1.5:contrast=1.1';

      if (eqFilter) {
        filterGraph.push(`[${currentVideoStream}]${eqFilter}[v_graded]`);
        currentVideoStream = 'v_graded';
      }
    }

    // Step D: Gradient Background Generator (Optimized via single-frame geq loop)
    if (captionBg === 'gradient' && subtitlePath) {
      filterGraph.push(`color=c=black:s=1080x800:d=${duration},format=rgba,geq=lum='p(X,Y)':a='(Y/H)*230',loop=loop=-1:size=1:start=0[grad_alpha]`);
      filterGraph.push(`[${currentVideoStream}][grad_alpha]overlay=x=0:y=1120:shortest=1[v_grad]`);
      currentVideoStream = 'v_grad';
    }

    // Step E: Muhammadan Way Watermark Burn-in
    const watermarkStream = 'v_watermark';
    filterGraph.push(
      `[${currentVideoStream}]drawtext=text='MUHAMMADAN WAY':fontsize=28:fontcolor=white@0.9:box=1:boxcolor=black@0.5:boxborderw=12:x=40:y=h-th-50[${watermarkStream}]`
    );
    currentVideoStream = watermarkStream;

    // Step F: Subtitle Burning
    let finalVideoStream = currentVideoStream;
    if (subtitlePath) {
      const safeSubPath = subtitlePath.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '$1\\:');
      
      // Resolve absolute path to the downloaded Google Fonts and escape it for FFmpeg
      const fontsDir = path.resolve(__dirname, '../assets/fonts');
      const safeFontsDir = fontsDir.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '$1\\:');
      
      filterGraph.push(`[${currentVideoStream}]ass='${safeSubPath}':fontsdir='${safeFontsDir}'[v_out]`);
      finalVideoStream = 'v_out';
    } else {
      filterGraph.push(`[${currentVideoStream}]copy[v_out]`);
      finalVideoStream = 'v_out';
    }

    // Step G: Streamlined Audio Mixing (Loops smoothly across full clip)
    let finalAudioStream = null;
    if (bgMusicInputIndex !== -1 && bgMusicItem) {
      const musicVol = bgMusicItem.volume ?? 0.1;
      
      filterGraph.push(`[0:a]volume=1.0[a_speaker]`);
      filterGraph.push(`[${bgMusicInputIndex}:a]volume=${musicVol}[a_bg]`);
      filterGraph.push(`[a_speaker][a_bg]amix=inputs=2:duration=first:dropout_transition=2[a_out]`);
      
      finalAudioStream = 'a_out';
    }

    // =========================================
    // APPLY FILTERS & EXPORT
    // =========================================
    const outputMap = [finalVideoStream];
    if (finalAudioStream) {
      outputMap.push(finalAudioStream);
    }

    command.complexFilter(filterGraph, outputMap);

    const outputOptions = [
      '-c:v libx264',
      '-preset fast',
      '-crf 23',
      '-pix_fmt yuv420p',
      '-c:a aac',
      '-b:a 192k'
    ];

    if (!finalAudioStream) {
      outputOptions.unshift('-map 0:a?'); 
    }

    command
      .outputOptions(outputOptions)
      .output(outputPath)
      .on('start', (cmdLine) => {
        console.log('🚀 FFmpeg Process Started.');
      })
      .on('error', (err, stdout, stderr) => {
        console.error('❌ FFmpeg Render Error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error('Video rendering failed.'));
      })
      .on('end', () => {
        console.log(`✅ Streamlined FFmpeg Render Complete: ${outputPath}`);
        resolve(outputPath);
      })
      .run();
  });
};