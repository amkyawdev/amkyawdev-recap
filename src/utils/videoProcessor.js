/**
 * Lightweight Video Processor
 * Browser-based processing with server fallback
 */

// Check if we're in a browser environment with Worker support
const isWorkerSupported = typeof Worker !== 'undefined' && 
  typeof URL !== 'undefined' && 
  typeof import.meta.url !== 'undefined';

let ffmpegWorker = null;
let isLoading = false;
let messageId = 0;
const pendingCallbacks = new Map();

// Initialize the FFmpeg worker
const initWorker = () => {
  if (!isWorkerSupported) {
    return null;
  }
  
  if (ffmpegWorker) return ffmpegWorker;
  
  try {
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
  } catch (e) {
    console.warn('Worker not supported, using fallback');
    return null;
  }
};

// Send message to worker with promise-based response
const sendToWorker = (type, payload, onProgress) => {
  return new Promise((resolve, reject) => {
    const worker = initWorker();
    
    if (!worker) {
      reject(new Error('Worker not supported'));
      return;
    }
    
    const id = ++messageId;
    
    pendingCallbacks.set(id, { resolve, reject, onProgress });
    worker.postMessage({ type, payload, id });
  });
};

// Load FFmpeg (runs in worker)
export const loadFFmpeg = async (onProgress) => {
  if (!isWorkerSupported) {
    throw new Error('Worker not supported in this environment');
  }
  
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

// Process video with progress tracking - uses server-side processing
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

  // Try server-side processing first (works on Cloudflare Pages)
  if (onProgress) onProgress({ stage: 'loading', progress: 10, message: 'Preparing video...' });

  try {
    // Convert video to base64 for server processing
    const videoBase64 = await fileToBase64(videoFile);
    
    if (onProgress) onProgress({ stage: 'processing', progress: 30, message: 'Processing video...' });

    // Call server API
    const response = await fetch('/api/process-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoData: videoBase64,
        subtitles,
        settings: {
          resolution,
          quality,
          includeSubtitles,
          includeVoiceover
        }
      })
    });

    if (!response.ok) {
      throw new Error('Server processing failed');
    }

    const result = await response.json();
    
    if (onProgress) onProgress({ stage: 'encoding', progress: 70, message: 'Encoding...' });

    if (result.jobId) {
      // Poll for completion
      const finalResult = await pollForResult(result.jobId, onProgress);
      return base64ToBlob(finalResult.output, 'video/mp4');
    }

    // Fallback: return original video if no processing needed
    if (onProgress) onProgress({ stage: 'complete', progress: 100 });
    return videoFile;
    
  } catch (error) {
    console.error('Server processing failed:', error);
    
    // Fallback: Return original video without processing
    if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Using original video' });
    return videoFile;
  }
};

// Poll for server processing result
async function pollForResult(jobId, onProgress) {
  const maxAttempts = 60;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/api/server-progress/${jobId}`);
      const result = await response.json();
      
      if (result.status === 'complete') {
        return result;
      }
      
      if (result.status === 'error') {
        throw new Error(result.error);
      }
      
      if (onProgress && result.progress) {
        onProgress({ stage: 'processing', progress: Math.min(90, result.progress) });
      }
      
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
  }
  
  throw new Error('Processing timeout');
}

// Helper: Convert File to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Convert Base64 to Blob
function base64ToBlob(base64, type) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

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
