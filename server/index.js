import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const exportsDir = path.join(__dirname, 'exports');

[uploadsDir, exportsDir].forEach(dir => {
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

    // Simulate AI analysis
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

    // Sample script based on analysis
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

// Generate subtitles
app.post('/api/generate-subtitles', async (req, res) => {
  try {
    const { script, duration } = req.body;
    
    // Generate timed subtitles from script
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
      
      // Group words into subtitle lines (approximately 2-3 seconds each)
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

    // In production, this would call ElevenLabs API
    // For now, we'll return a placeholder response
    const voiceover = {
      id: `vo-${Date.now()}`,
      voiceId: voiceId || 'rachel',
      duration: script.split(' ').length * 0.4, // Approximate
      status: 'ready'
    };

    res.json({ success: true, voiceover });
  } catch (error) {
    console.error('Voiceover generation error:', error);
    res.status(500).json({ error: 'Voiceover generation failed' });
  }
});

// Export video
app.post('/api/export', async (req, res) => {
  try {
    const { videoId, subtitles, voiceover, settings } = req.body;
    
    // Simulate export progress
    const jobId = `export-${Date.now()}`;
    
    res.json({ success: true, jobId });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Get export progress
app.get('/api/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  // Simulate progress
  const progress = Math.min(100, Math.random() * 100);
  
  res.json({
    jobId,
    progress,
    stage: progress < 20 ? 'Processing video...' :
           progress < 40 ? 'Adding subtitles...' :
           progress < 60 ? 'Mixing audio...' :
           progress < 80 ? 'Encoding...' :
           'Finalizing...'
  });
});

// Get available voices from ElevenLabs
app.get('/api/voices', async (req, res) => {
  const voices = [
    { id: 'rachel', name: 'Rachel', gender: 'female' },
    { id: 'domi', name: 'Domi', gender: 'female' },
    { id: 'bella', name: 'Bella', gender: 'female' },
    { id: 'antoni', name: 'Antoni', gender: 'male' },
    { id: 'arnold', name: 'Arnold', gender: 'male' },
    { id: 'adam', name: 'Adam', gender: 'male' },
    { id: 'dani', name: 'Dani', gender: 'male' },
    { id: 'fin', name: 'Fin', gender: 'male' }
  ];
  
  res.json({ voices });
});

// Delete video
app.delete('/api/video/:id', (req, res) => {
  try {
    const { id } = req.params;
    const videoPath = path.join(uploadsDir, `${id}.*`);
    
    // Find and delete files matching the pattern
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
  console.log(`🎬 CineRecap API Server running on port ${PORT}`);
});
