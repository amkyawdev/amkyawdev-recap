/**
 * FFmpeg Web Worker
 * Handles video processing in a separate thread for better performance
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;
let isLoaded = false;

// Message handlers
self.onmessage = async (event) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'LOAD':
        await loadFFmpeg(id);
        break;
      case 'PROCESS':
        await processVideo(payload, id);
        break;
      case 'CANCEL':
        cancelProcessing(id);
        break;
      default:
        sendResponse(id, { error: `Unknown message type: ${type}` }, 'error');
    }
  } catch (error) {
    sendResponse(id, { error: error.message }, 'error');
  }
};

async function loadFFmpeg(id) {
  sendProgress(id, { stage: 'loading', progress: 0, message: 'Loading FFmpeg engine...' });

  if (ffmpeg && isLoaded) {
    sendResponse(id, { success: true, message: 'FFmpeg already loaded' });
    return;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    sendProgress(id, { stage: 'loading', progress: Math.round(progress * 100) });
  });

  ffmpeg.on('log', ({ message }) => {
    sendProgress(id, { stage: 'log', message });
  });

  try {
    // Use a lighter FFmpeg core for faster loading
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    sendResponse(id, { success: true, message: 'FFmpeg loaded successfully' });
  } catch (error) {
    isLoaded = false;
    sendResponse(id, { error: 'Failed to load FFmpeg: ' + error.message }, 'error');
  }
}

async function processVideo(payload, id) {
  const { videoData, subtitles, settings, voiceoverData } = payload;

  if (!ffmpeg || !isLoaded) {
    sendResponse(id, { error: 'FFmpeg not loaded' }, 'error');
    return;
  }

  try {
    sendProgress(id, { stage: 'init', progress: 5, message: 'Initializing...' });

    // Write input video
    sendProgress(id, { stage: 'init', progress: 10, message: 'Loading video...' });
    await ffmpeg.writeFile('input.mp4', videoData);

    // Build FFmpeg arguments
    const args = ['-i', 'input.mp4'];

    // Resolution scaling
    const scaleMap = { '720p': '1280:720', '1080p': '1920:1080', '4k': '3840:2160' };
    if (settings.resolution && scaleMap[settings.resolution]) {
      args.push('-vf', `scale=${scaleMap[settings.resolution]}`);
    }

    // Add subtitles at bottom
    if (settings.includeSubtitles && subtitles && subtitles.length > 0) {
      sendProgress(id, { stage: 'subtitles', progress: 20, message: 'Adding subtitles...' });
      const assContent = createASSFile(subtitles);
      await ffmpeg.writeFile('subtitles.ass', new TextEncoder().encode(assContent));
      // Force subtitles to bottom (Alignment=2) with bottom margin
      args.push('-vf', `ass=subtitles.ass:force_style='Alignment=2,MarginV=30'`);
    }

    // Add voiceover audio
    if (settings.includeVoiceover && voiceoverData) {
      sendProgress(id, { stage: 'audio', progress: 30, message: 'Mixing audio...' });
      await ffmpeg.writeFile('voiceover.mp3', voiceoverData);
      args.push('-i', 'voiceover.mp3', '-c:a', 'aac', '-b:a', '128k', '-shortest');
    }

    // Quality settings
    const crfMap = { low: '28', medium: '23', high: '18' };
    const crf = crfMap[settings.quality] || '23';
    args.push('-c:v', 'libx264', '-crf', crf, '-preset', 'fast', '-movflags', '+faststart');

    // Output
    args.push('-y', 'output.mp4');

    // Execute
    sendProgress(id, { stage: 'processing', progress: 40, message: 'Processing video...' });
    
    // Track progress during encoding
    ffmpeg.on('progress', ({ progress }) => {
      const encodedProgress = 40 + Math.round(progress * 55);
      sendProgress(id, { stage: 'processing', progress: encodedProgress });
    });

    await ffmpeg.exec(args);

    // Read output
    sendProgress(id, { stage: 'complete', progress: 95, message: 'Finalizing...' });
    const data = await ffmpeg.readFile('output.mp4');

    // Cleanup
    await cleanup();

    sendProgress(id, { stage: 'complete', progress: 100, message: 'Complete!' });
    sendResponse(id, { success: true, data: data.buffer });
  } catch (error) {
    await cleanup();
    sendResponse(id, { error: 'Processing failed: ' + error.message }, 'error');
  }
}

function createASSFile(subtitles) {
  // Alignment=2 = bottom center, MarginV=30 pushes up from bottom
  let content = `[Script Info]
Title: Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  subtitles.forEach((sub) => {
    const start = formatASS(sub.startTime);
    const end = formatASS(sub.endTime);
    const text = (sub.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\\N');
    // MarginV=30 pushes subtitle up from bottom
    content += `Dialogue: 0,${start},${end},Default,,0,0,30,,${text}\n`;
  });

  return content;
}

function formatASS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

async function cleanup() {
  try {
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp4');
    try { await ffmpeg.deleteFile('subtitles.ass'); } catch {}
    try { await ffmpeg.deleteFile('voiceover.mp3'); } catch {}
  } catch (e) {
    // Ignore cleanup errors
  }
}

function cancelProcessing(id) {
  sendResponse(id, { cancelled: true });
}

function sendResponse(id, data, type = 'response') {
  self.postMessage({ id, type, ...data });
}

function sendProgress(id, progress) {
  self.postMessage({ id, type: 'progress', ...progress });
}

export {};
