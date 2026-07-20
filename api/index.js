export default function handler(req, res) {
  const { method, url } = req;
  const path = url.split('?')[0];
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Health check
  if (path === '/api/health' || path === '/api') {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }
  
  // Voices endpoint
  if (path === '/api/voices' && method === 'GET') {
    const voices = [
      { id: 'thita', name: 'သီဟ (Thita)', gender: 'female', language: 'burmese' },
      { id: 'nila', name: 'နီလာ (Nila)', gender: 'female', language: 'burmese' },
      { id: 'rachel', name: 'Rachel', gender: 'female' },
      { id: 'domi', name: 'Domi', gender: 'female' },
      { id: 'bella', name: 'Bella', gender: 'female' },
      { id: 'antoni', name: 'Antoni', gender: 'male' },
      { id: 'arnold', name: 'Arnold', gender: 'male' },
      { id: 'adam', name: 'Adam', gender: 'male' },
    ];
    return res.status(200).json({ voices });
  }
  
  // Analyze
  if (path === '/api/analyze' && method === 'POST') {
    return res.status(200).json({ 
      success: true, 
      analysis: {
        scenes: [
          { start: 0, end: 15, description: 'Opening scene' },
          { start: 15, end: 45, description: 'Character introduction' },
        ],
        keyMoments: ['Epic opening', 'Emotional reunion'],
        duration: 90,
        suggestedRecapLength: 30
      }
    });
  }
  
  // Generate Script
  if (path === '/api/generate-script' && method === 'POST') {
    const script = `Welcome to this movie recap. Today we're diving into one of the most thrilling stories ever told.
    
The film opens with a breathtaking establishing shot that sets the stage for an epic adventure.`;
    return res.status(200).json({ success: true, script });
  }
  
  // Generate Subtitles
  if (path === '/api/generate-subtitles' && method === 'POST') {
    const subtitles = [
      { startTime: 0, endTime: 3.5, text: "Welcome to this movie recap." },
      { startTime: 3.5, endTime: 7.2, text: "Today we're diving into an epic story." },
    ];
    return res.status(200).json({ success: true, subtitles });
  }
  
  // Generate Voiceover
  if (path === '/api/generate-voiceover' && method === 'POST') {
    return res.status(200).json({ 
      success: true, 
      voiceover: { id: `vo-${Date.now()}`, status: 'ready' } 
    });
  }
  
  // Whisper
  if (path === '/api/whisper-transcribe' && method === 'POST') {
    return res.status(200).json({ 
      success: true, 
      subtitles: [
        { startTime: 0, endTime: 3.5, text: "Welcome to this movie recap." },
      ],
      method: 'whisper'
    });
  }
  
  // Export
  if (path === '/api/export' && method === 'POST') {
    return res.status(200).json({ success: true, jobId: `export-${Date.now()}` });
  }
  
  // Progress
  if (path.startsWith('/api/progress/') && method === 'GET') {
    return res.status(200).json({ status: 'complete', progress: 100 });
  }
  
  return res.status(404).json({ error: 'Not found', path });
}
