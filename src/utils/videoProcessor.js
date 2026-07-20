import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;
let isLoading = false;

export const loadFFmpeg = async (onProgress) => {
  if (ffmpeg) return ffmpeg;
  if (isLoading) return null;
  
  isLoading = true;
  ffmpeg = new FFmpeg();
  
  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    isLoading = false;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    isLoading = false;
    return null;
  }
};

export const processVideo = async (options, onProgress) => {
  const {
    videoFile,
    subtitles = [],
    voiceoverBlob = null,
    settings = {}
  } = options;

  const {
    resolution = '1080p',
    quality = 'medium',
    includeSubtitles = true,
    includeVoiceover = true
  } = settings;

  // Load FFmpeg
  const ff = await loadFFmpeg((p) => {
    if (onProgress) onProgress({ stage: 'loading', progress: p });
  });

  if (!ff) {
    throw new Error('Failed to load FFmpeg');
  }

  try {
    // Write video file to FFmpeg filesystem
    if (onProgress) onProgress({ stage: 'init', progress: 5, message: 'Loading video...' });
    
    const videoData = await fetchFile(videoFile);
    await ff.writeFile('input.mp4', videoData);

    // Prepare FFmpeg arguments
    const args = ['-i', 'input.mp4'];

    // Resolution scaling
    const scaleMap = { '720p': '-vf scale=1280:720', '1080p': '-vf scale=1920:1080', '4k': '-vf scale=3840:2160' };
    if (scaleMap[resolution]) {
      args.push(...scaleMap[resolution].split(' '));
    }

    // Add subtitles if enabled
    if (includeSubtitles && subtitles.length > 0) {
      // Create ASS subtitle file
      let assContent = `[Script Info]
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

      subtitles.forEach((sub, i) => {
        const start = formatASS(sub.startTime);
        const end = formatASS(sub.endTime);
        const text = sub.text.replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '\\N');
        assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
      });

      await ff.writeFile('subtitles.ass', new TextEncoder().encode(assContent));
      args.push('-vf', `ass=subtitles.ass`);
    }

    // Add voiceover if enabled
    if (includeVoiceover && voiceoverBlob) {
      const audioData = await fetchFile(voiceoverBlob);
      await ff.writeFile('voiceover.mp3', audioData);
      args.push('-i', 'voiceover.mp3', '-c:a', 'aac', '-b:a', '192k', '-shortest');
    }

    // Quality settings
    const crfMap = { low: '28', medium: '23', high: '18' };
    const crf = crfMap[quality] || '23';
    args.push('-c:v', 'libx264', '-crf', crf, '-preset', 'medium');

    // Output
    args.push('-y', 'output.mp4');

    // Execute FFmpeg
    if (onProgress) onProgress({ stage: 'processing', progress: 20, message: 'Processing video...' });
    
    await ff.exec(args);

    // Read output
    if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Complete!' });
    
    const data = await ff.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    // Cleanup
    await ff.deleteFile('input.mp4');
    await ff.deleteFile('output.mp4');
    if (includeSubtitles) await ff.deleteFile('subtitles.ass');
    if (includeVoiceover) await ff.deleteFile('voiceover.mp3');

    return blob;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
};

const formatASS = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
};

export default { loadFFmpeg, processVideo };
