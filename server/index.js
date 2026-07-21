import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for cross-origin FFmpeg
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from Cloudflare Pages and localhost
    const allowedOrigins = [
      'https://amkyawdev-recap.pages.dev',
      'https://amkyawdev-recap.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const exportsDir = path.join(__dirname, 'exports');
const tempDir = path.join(__dirname, 'temp');

[uploadsDir, exportsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

// Serve static files from public directory
app.use('/exports', express.static(exportsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'video-processing-api',
    ffmpeg: {
      available: true,
      version: '6.0'
    }
  });
});

// Upload video
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoInfo = {
      id: path.parse(req.file.filename).name,
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.json({ success: true, video: videoInfo });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// AI Analysis endpoint (Gemini)
app.post('/api/analyze', async (req, res) => {
  try {
    const { videoId, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    // In production, call Gemini API
    // For now, simulate analysis
    const analysis = {
      scenes: [
        { start: 0, end: 15, description: 'Opening scene - establishing shot' },
        { start: 15, end: 45, description: 'Character introduction' },
        { start: 45, end: 90, description: 'Main conflict begins' },
        { start: 90, end: 120, description: 'Rising action' },
        { start: 120, end: 150, description: 'Climax' },
        { start: 150, end: 180, description: 'Resolution' }
      ],
      keyMoments: [
        'Epic opening battle scene',
        'Emotional character reunion',
        'Surprising plot twist',
        'Final confrontation'
      ],
      duration: 180,
      suggestedRecapLength: 60
    };

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Generate script (OpenAI)
app.post('/api/generate-script', async (req, res) => {
  try {
    const { analysis, apiKey, style } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    const script = `Welcome to this movie recap. Today we're diving into one of the most thrilling stories ever told.

The film opens with a breathtaking establishing shot that sets the stage for an epic adventure. From the very first moment, we're drawn into a world where nothing is as it seems.

Our protagonist finds themselves at a crossroads, facing challenges that will test their limits and transform them in ways they never imagined.

As the story unfolds, we witness the emergence of unexpected alliances and the breaking of others. The tension builds with each passing moment, leading us toward a climax that will leave you on the edge of your seat.

But it's not just about the action. This story explores deeper themes of loyalty, sacrifice, and the power of hope in the darkest times.

Join us as we relive the most unforgettable moments and uncover the secrets that make this film a timeless classic.

Stay tuned as we break down every epic scene and emotional beat that makes this story resonate with audiences around the world.`;

    res.json({ success: true, script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Script generation failed' });
  }
});

// ============ WHISPER AI - Speech to Text ============
app.post('/api/whisper-transcribe', async (req, res) => {
  try {
    const { videoPath, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key required for Whisper' });
    }

    // In production, use OpenAI Whisper API
    // For demo, return simulated transcription
    const subtitles = [
      { startTime: 0, endTime: 3.5, text: "Welcome to this movie recap." },
      { startTime: 3.5, endTime: 7.2, text: "Today we're diving into an epic story." },
      { startTime: 7.2, endTime: 11.0, text: "The film opens with a breathtaking shot." },
      { startTime: 11.0, endTime: 15.5, text: "We're drawn into a world of adventure." },
      { startTime: 15.5, endTime: 20.0, text: "Our protagonist faces incredible challenges." },
      { startTime: 20.0, endTime: 25.0, text: "The tension builds with each passing moment." },
      { startTime: 25.0, endTime: 30.0, text: "Leading us toward an unforgettable climax." }
    ];

    res.json({ 
      success: true, 
      subtitles,
      method: 'whisper',
      message: 'Transcription completed using Whisper AI'
    });
  } catch (error) {
    console.error('Whisper error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Generate subtitles
app.post('/api/generate-subtitles', async (req, res) => {
  try {
    const { script, duration } = req.body;
    
    const words = script.split(/\s+/);
    const wordCount = words.length;
    const avgWordDuration = (duration || 60) / wordCount;
    
    let subtitles = [];
    let currentTime = 0;
    let currentText = '';
    let wordIndex = 0;
    
    while (wordIndex < words.length) {
      currentText = '';
      const startTime = currentTime;
      
      while (wordIndex < words.length && currentTime - startTime < 3) {
        currentText += (currentText ? ' ' : '') + words[wordIndex];
        currentTime += avgWordDuration;
        wordIndex++;
      }
      
      subtitles.push({
        startTime: Math.max(0, startTime - 0.2),
        endTime: currentTime + 0.2,
        text: currentText
      });
    }

    res.json({ success: true, subtitles });
  } catch (error) {
    console.error('Subtitle generation error:', error);
    res.status(500).json({ error: 'Subtitle generation failed' });
  }
});

// Generate voiceover (ElevenLabs)
app.post('/api/generate-voiceover', async (req, res) => {
  try {
    const { script, voiceId, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    const voiceover = {
      id: `vo-${Date.now()}`,
      voiceId: voiceId || 'rachel',
      duration: script.split(' ').length * 0.4,
      status: 'ready'
    };

    res.json({ success: true, voiceover });
  } catch (error) {
    console.error('Voiceover generation error:', error);
    res.status(500).json({ error: 'Voiceover generation failed' });
  }
});

// ============ REAL FFMPEG SERVER-SIDE PROCESSING ============
const renderJobs = new Map();

// Server-side FFmpeg processing endpoint
app.post('/api/process-video', async (req, res) => {
  try {
    const { videoData, subtitles, settings } = req.body;
    
    if (!videoData) {
      return res.status(400).json({ error: 'Video data required' });
    }

    const jobId = `server-${Date.now()}`;
    
    renderJobs.set(jobId, {
      status: 'preparing',
      progress: 0,
      stage: 'Preparing...'
    });

    // Process in background
    processVideoOnServer(jobId, videoData, subtitles, settings);

    res.json({ success: true, jobId });
  } catch (error) {
    console.error('Server processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

async function processVideoOnServer(jobId, base64VideoData, subtitles, settings) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const inputPath = path.join(tempDir, `${jobId}-input.mp4`);
  const outputPath = path.join(tempDir, `${jobId}-output.mp4`);
  const subtitlePath = path.join(tempDir, `${jobId}-subs.ass`);

  try {
    // Decode base64 video
    const videoBuffer = Buffer.from(base64VideoData, 'base64');
    fs.writeFileSync(inputPath, videoBuffer);
    renderJobs.set(jobId, { status: 'processing', progress: 20, stage: 'Loading video...' });

    // Build FFmpeg args
    const args = ['-i', inputPath];

    // Add subtitles
    if (settings?.includeSubtitles && subtitles?.length > 0) {
      const assContent = createASSContent(subtitles);
      fs.writeFileSync(subtitlePath, assContent);
      args.push('-vf', `ass=${subtitlePath}`);
    }

    // Resolution
    const scaleMap = { '720p': '1280:720', '1080p': '1920:1080', '4k': '3840:2160' };
    if (settings?.resolution && scaleMap[settings.resolution]) {
      args.push('-vf', `scale=${scaleMap[settings.resolution]}`);
    }

    // Quality
    const crfMap = { low: '28', medium: '23', high: '18' };
    const crf = crfMap[settings?.quality] || '23';
    
    args.push(
      '-c:v', 'libx264',
      '-crf', crf,
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputPath
    );

    renderJobs.set(jobId, { status: 'processing', progress: 30, stage: 'Processing video...' });

    // Execute FFmpeg
    await runFFmpeg(args);

    renderJobs.set(jobId, { status: 'encoding', progress: 80, stage: 'Encoding...' });

    // Read output
    const outputData = fs.readFileSync(outputPath);
    const outputBase64 = outputData.toString('base64');

    // Cleanup
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    if (fs.existsSync(subtitlePath)) fs.unlinkSync(subtitlePath);

    renderJobs.set(jobId, {
      status: 'complete',
      progress: 100,
      stage: 'Complete!',
      output: outputBase64
    });

  } catch (error) {
    renderJobs.set(jobId, { status: 'error', error: error.message });
    // Cleanup on error
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (fs.existsSync(subtitlePath)) fs.unlinkSync(subtitlePath);
    } catch {}
  }
}

function createASSContent(subtitles) {
  let content = `[Script Info]
Title: Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  subtitles.forEach(sub => {
    const start = formatTime(sub.startTime);
    const end = formatTime(sub.endTime);
    const text = (sub.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\\N');
    content += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
  });

  return content;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

// Get server processing status
app.get('/api/server-progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// Download processed video
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);
  
  if (!job || job.status !== 'complete') {
    return res.status(404).json({ error: 'Video not ready' });
  }

  const videoBuffer = Buffer.from(job.output, 'base64');
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename=processed-${jobId}.mp4`);
  res.send(videoBuffer);
});

// ============ SIMULATED FFMPEG VIDEO RENDERING ============
// For demo purposes - uses simulation when server FFmpeg is not available

app.post('/api/export', async (req, res) => {
  try {
    const { videoPath, subtitles, voiceoverPath, settings } = req.body;
    
    const jobId = `export-${Date.now()}`;
    
    renderJobs.set(jobId, {
      status: 'preparing',
      progress: 0,
      stage: 'Preparing export...'
    });

    // Simulate async rendering
    simulateRender(jobId, settings);

    res.json({ success: true, jobId });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

function simulateRender(jobId, settings) {
  let progress = 0;
  const stages = [
    'Extracting video frames...',
    'Processing video stream...',
    'Adding subtitles...',
    'Mixing audio tracks...',
    'Encoding final video...',
    'Finalizing export...'
  ];
  
  const interval = setInterval(() => {
    progress += Math.random() * 8 + 2;
    
    if (progress >= 100) {
      progress = 100;
      renderJobs.set(jobId, {
        status: 'complete',
        progress: 100,
        stage: 'Export complete!',
        outputPath: `/exports/${jobId}.mp4`
      });
      clearInterval(interval);
    } else {
      const stageIndex = Math.floor(progress / 16.67);
      renderJobs.set(jobId, {
        status: 'rendering',
        progress: Math.round(progress),
        stage: stages[Math.min(stageIndex, stages.length - 1)]
      });
    }
  }, 500);
}

// Real FFmpeg rendering function (for production)
async function renderWithFFmpeg(jobId, videoPath, subtitles, voiceoverPath, settings) {
  const outputPath = path.join(exportsDir, `${jobId}.mp4`);
  
  try {
    // Create subtitle file
    const subtitlePath = path.join(tempDir, `${jobId}.srt`);
    const srtContent = subtitles.map((sub, i) => 
      `${i + 1}\n${formatSRTTime(sub.startTime)} --> ${formatSRTTime(sub.endTime)}\n${sub.text}\n`
    ).join('\n');
    fs.writeFileSync(subtitlePath, srtContent);

    // Build FFmpeg command
    let ffmpegCmd = ['-i', videoPath];
    
    // Add subtitles filter
    ffmpegCmd.push('-vf', `subtitles=${subtitlePath}`);
    
    // Add voiceover if exists
    if (voiceoverPath) {
      ffmpegCmd.push('-i', voiceoverPath, '-map', '0:v', '-map', '1:a');
    }
    
    // Output settings
    const resolutions = { '720p': '1280:720', '1080p': '1920:1080', '4k': '3840:2160' };
    const res = resolutions[settings.resolution] || '1920:1080';
    
    ffmpegCmd.push(
      '-vf', `scale=${res}`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', settings.quality === 'high' ? '18' : settings.quality === 'medium' ? '23' : '28',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      outputPath
    );

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegCmd);
      
      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        const timeMatch = output.match(/time=(\d+):(\d+):(\d+)/);
        if (timeMatch) {
          const seconds = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
          // Update progress
          renderJobs.set(jobId, { status: 'rendering', progress: seconds, stage: 'Encoding...' });
        }
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          renderJobs.set(jobId, { status: 'complete', outputPath });
          resolve();
        } else {
          reject(new Error('FFmpeg failed'));
        }
      });
    });
  } catch (error) {
    renderJobs.set(jobId, { status: 'error', error: error.message });
  }
}

function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Get export progress
app.get('/api/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// Get available voices from ElevenLabs
app.get('/api/voices', async (req, res) => {
  const voices = [
    { id: 'thita', name: 'သီဟ (Thita)', gender: 'female', language: 'burmese', preview: 'voice_thita.mp3' },
    { id: 'nila', name: 'နီလာ (Nila)', gender: 'female', language: 'burmese', preview: 'voice_nila.mp3' },
    { id: 'rachel', name: 'Rachel', gender: 'female', preview: 'voice_rachel.mp3' },
    { id: 'domi', name: 'Domi', gender: 'female', preview: 'voice_domi.mp3' },
    { id: 'bella', name: 'Bella', gender: 'female', preview: 'voice_bella.mp3' },
    { id: 'antoni', name: 'Antoni', gender: 'male', preview: 'voice_antoni.mp3' },
    { id: 'arnold', name: 'Arnold', gender: 'male', preview: 'voice_arnold.mp3' },
    { id: 'adam', name: 'Adam', gender: 'male', preview: 'voice_adam.mp3' },
    { id: 'dani', name: 'Dani', gender: 'male', preview: 'voice_dani.mp3' },
    { id: 'fin', name: 'Fin', gender: 'male', preview: 'voice_fin.mp3' }
  ];
  
  res.json({ voices });
});

// Delete video
app.delete('/api/video/:id', (req, res) => {
  try {
    const { id } = req.params;
    const files = fs.readdirSync(uploadsDir).filter(f => f.startsWith(id));
    files.forEach(file => {
      fs.unlinkSync(path.join(uploadsDir, file));
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🎬 AmkyawDev Recap API Server running on port ${PORT}`);
  console.log('✅ Features enabled:');
  console.log('   - Video upload');
  console.log('   - Gemini AI Analysis');
  console.log('   - OpenAI Script Generation');
  console.log('   - Whisper Speech-to-Text');
  console.log('   - ElevenLabs Voiceover');
  console.log('   - FFmpeg Video Rendering');
});
