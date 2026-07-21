/**
 * Lightweight Video Processor
 * Uses Web Worker for FFmpeg processing to avoid blocking the main thread
 */

import { fetchFile } from '@ffmpeg/util';

// Singleton worker instance
let ffmpegWorker = null;
let isLoading = false;
let messageId = 0;
const pendingCallbacks = new Map();

// Initialize the FFmpeg worker
const initWorker = () => {
  if (ffmpegWorker) return ffmpegWorker;
  
  ffmpegWorker = new Worker(
    new URL('../workers/ffmpeg.worker.js', import.meta.url),
    { type: 'module' }
  );

  ffmpegWorker.onmessage = (event) => {
    const { id, type, ...data } = event.data;
    const callback = pendingCallbacks.get(id);
    
    if (callback) {
      if (type === 'progress') {
        callback.onProgress?.(data);
      } else if (type === 'response' || type === 'error') {
        callback.resolve(data);
        pendingCallbacks.delete(id);
      }
    }
  };

  ffmpegWorker.onerror = (error) => {
    console.error('FFmpeg Worker error:', error);
    pendingCallbacks.forEach(({ reject }) => {
      reject(new Error('Worker crashed'));
    });
    pendingCallbacks.clear();
  };

  return ffmpegWorker;
};

// Send message to worker with promise-based response
const sendToWorker = (type, payload, onProgress) => {
  return new Promise((resolve, reject) => {
    const worker = initWorker();
    const id = ++messageId;
    
    pendingCallbacks.set(id, { resolve, reject, onProgress });
    worker.postMessage({ type, payload, id });
  });
};

// Load FFmpeg (runs in worker)
export const loadFFmpeg = async (onProgress) => {
  if (isLoading) return null;
  isLoading = true;
  
  try {
    const result = await sendToWorker('LOAD', {}, onProgress);
    isLoading = false;
    return result.success ? true : null;
  } catch (error) {
    isLoading = false;
    throw error;
  }
};

// Check if FFmpeg is loaded
export const isFFmpegLoaded = () => {
  return ffmpegWorker !== null;
};

// Process video with progress tracking
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

  // Read video file as ArrayBuffer
  if (onProgress) onProgress({ stage: 'loading', progress: 0, message: 'Loading video...' });
  
  const videoData = await fetchFile(videoFile);
  
  // Read voiceover if provided
  let voiceoverData = null;
  if (includeVoiceover && voiceoverBlob) {
    voiceoverData = await fetchFile(voiceoverBlob);
  }

  // Send to worker for processing
  const result = await sendToWorker('PROCESS', {
    videoData: videoData.buffer,
    subtitles,
    voiceoverData: voiceoverData?.buffer,
    settings: {
      resolution,
      quality,
      includeSubtitles,
      includeVoiceover
    }
  }, onProgress);

  if (result.error) {
    throw new Error(result.error);
  }

  if (result.cancelled) {
    throw new Error('Processing cancelled');
  }

  // Create blob from ArrayBuffer
  return new Blob([result.data], { type: 'video/mp4' });
};

// Cancel current processing
export const cancelProcessing = () => {
  if (ffmpegWorker) {
    sendToWorker('CANCEL', {});
  }
};

// Cleanup worker
export const destroyWorker = () => {
  if (ffmpegWorker) {
    ffmpegWorker.terminate();
    ffmpegWorker = null;
  }
};

export default {
  loadFFmpeg,
  processVideo,
  isFFmpegLoaded,
  cancelProcessing,
  destroyWorker
};
