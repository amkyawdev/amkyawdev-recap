/**
 * Cloudflare Worker - Video Processing API
 * Lightweight server-side processing for larger videos
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'video-processing-api',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Process video endpoint
      if (path === '/api/process' && request.method === 'POST') {
        return await handleVideoProcess(request, corsHeaders);
      }

      // Get video info
      if (path.startsWith('/api/video/')) {
        return await handleVideoInfo(request, corsHeaders);
      }

      // Not found
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message || 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleVideoProcess(request, corsHeaders) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video');
    const subtitlesJson = formData.get('subtitles');
    const settingsJson = formData.get('settings');

    if (!videoFile) {
      return new Response(JSON.stringify({ error: 'No video file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const subtitles = subtitlesJson ? JSON.parse(subtitlesJson) : [];
    const settings = settingsJson ? JSON.parse(settingsJson) : {
      resolution: '1080p',
      quality: 'medium'
    };

    // For Cloudflare, we'd use their Stream or Media Processing
    // This is a placeholder for server-side processing
    const jobId = `job-${Date.now()}`;
    
    // In production, you would:
    // 1. Upload video to R2 storage
    // 2. Queue a processing job
    // 3. Return job ID for polling

    return new Response(JSON.stringify({
      success: true,
      jobId,
      message: 'Video processing queued. Use /api/progress/{jobId} to check status.',
      instructions: {
        note: 'Server-side processing requires Cloudflare R2 + Queues setup',
        alternatives: [
          'Browser-based FFmpeg.wasm (default)',
          'Self-hosted Node.js server with FFmpeg',
          'Cloudflare Stream + Functions (paid)'
        ]
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Process error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleVideoInfo(request, corsHeaders) {
  const path = url.pathname;
  const videoId = path.split('/').pop();

  // Return video info or status
  return new Response(JSON.stringify({
    videoId,
    status: 'processing',
    message: 'Video is being processed'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
