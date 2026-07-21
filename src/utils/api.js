// Vercel backend URL
const API_BASE = 'https://amkyawdev-recap.vercel.app/api';

export const api = {
  async uploadVideo(file) {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  },

  async analyzeVideo(videoId, apiKey) {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, apiKey }),
    });
    
    return response.json();
  },

  async generateScript(analysis, apiKey, style = 'dramatic') {
    const response = await fetch(`${API_BASE}/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, apiKey, style }),
    });
    
    return response.json();
  },

  async generateSubtitles(script, duration) {
    const response = await fetch(`${API_BASE}/generate-subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, duration }),
    });
    
    return response.json();
  },

  async generateVoiceover(script, voiceId, apiKey) {
    const response = await fetch(`${API_BASE}/generate-voiceover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, voiceId, apiKey }),
    });
    
    return response.json();
  },

  async exportVideo(videoId, subtitles, voiceover, settings) {
    const response = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, subtitles, voiceover, settings }),
    });
    
    return response.json();
  },

  async getProgress(jobId) {
    const response = await fetch(`${API_BASE}/progress/${jobId}`);
    return response.json();
  },

  async getVoices() {
    const response = await fetch(`${API_BASE}/voices`);
    return response.json();
  },

  async deleteVideo(videoId) {
    const response = await fetch(`${API_BASE}/video/${videoId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};

export default api;
