import { Key, Sparkles, FileVideo, Type, Mic, Mic2, Languages } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Sidebar() {
  const { 
    apiKeys, 
    setApiKey, 
    activePanel, 
    setActivePanel,
    videoFile,
    videoMeta,
    subtitles,
    script,
    voiceover,
    addToast,
    setSubtitles,
    setProcessingStatus,
    setProcessingProgress,
    setProcessingStage
  } = useAppStore();

  const handleKeyChange = (provider, value) => {
    setApiKey(provider, value);
    if (value.length > 10) {
      addToast({ type: 'success', message: `${provider.toUpperCase()} API key saved` });
    }
  };

  const handleAnalyze = async () => {
    if (!apiKeys.gemini) {
      addToast({ type: 'error', message: 'Please enter Gemini API Key first' });
      return;
    }
    if (!videoFile) {
      addToast({ type: 'error', message: 'Please upload a video first' });
      return;
    }
    
    setProcessingStatus('analyzing');
    setProcessingProgress(0);
    setProcessingStage('Analyzing video scenes...');
    addToast({ type: 'info', message: 'Video analysis starting with Gemini AI...' });
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 300));
      setProcessingProgress(i);
      setProcessingStage('Detecting scenes...');
    }
    
    setProcessingStatus('idle');
    addToast({ type: 'success', message: 'Video analysis complete!' });
  };

  const handleWhisperTranscribe = async () => {
    if (!apiKeys.whisper && !apiKeys.openai) {
      addToast({ type: 'error', message: 'Please enter OpenAI/Whisper API Key first' });
      return;
    }
    if (!videoFile) {
      addToast({ type: 'error', message: 'Please upload a video first' });
      return;
    }
    
    setProcessingStatus('analyzing');
    setProcessingProgress(0);
    setProcessingStage('Transcribing audio with Whisper AI...');
    addToast({ type: 'info', message: 'Using Whisper AI to transcribe video audio...' });
    
    // Simulate transcription
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 200));
      setProcessingProgress(i);
      setProcessingStage('Processing speech...');
    }
    
    // Set demo subtitles
    setSubtitles([
      { startTime: 0, endTime: 3.5, text: "Welcome to this movie recap." },
      { startTime: 3.5, endTime: 7.2, text: "Today we're diving into an epic story." },
      { startTime: 7.2, endTime: 11.0, text: "The film opens with a breathtaking shot." },
      { startTime: 11.0, endTime: 15.5, text: "We're drawn into a world of adventure." },
      { startTime: 15.5, endTime: 20.0, text: "Our protagonist faces challenges." }
    ]);
    
    setProcessingStatus('idle');
    addToast({ type: 'success', message: 'Whisper transcription complete!' });
  };

  const handleGenerateScript = async () => {
    if (!apiKeys.openai) {
      addToast({ type: 'error', message: 'Please enter OpenAI API Key first' });
      return;
    }
    
    setProcessingStatus('generating');
    setProcessingProgress(0);
    addToast({ type: 'info', message: 'Generating script with OpenAI...' });
    
    for (let i = 0; i <= 100; i += 8) {
      await new Promise(r => setTimeout(r, 250));
      setProcessingProgress(i);
      setProcessingStage('Writing narration...');
    }
    
    setProcessingStatus('idle');
    addToast({ type: 'success', message: 'Script generated successfully!' });
  };

  const handleGenerateVoiceover = async () => {
    if (!apiKeys.elevenlabs) {
      addToast({ type: 'error', message: 'Please enter ElevenLabs API Key first' });
      return;
    }
    if (!script && subtitles.length === 0) {
      addToast({ type: 'error', message: 'Please generate script or transcribe first' });
      return;
    }
    
    setProcessingStatus('generating');
    setProcessingProgress(0);
    addToast({ type: 'info', message: 'Generating voiceover with ElevenLabs...' });
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 200));
      setProcessingProgress(i);
      setProcessingStage('Synthesizing voice...');
    }
    
    setProcessingStatus('idle');
    addToast({ type: 'success', message: 'Voiceover generated!' });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activePanel === 'settings' ? 'active' : ''}`}
          onClick={() => setActivePanel('settings')}
        >
          <Key size={16} />
          API Keys
        </button>
        <button 
          className={`sidebar-tab ${activePanel === 'editor' ? 'active' : ''}`}
          onClick={() => setActivePanel('editor')}
        >
          <Sparkles size={16} />
          AI Tools
        </button>
      </div>

      <div className="sidebar-content">
        {activePanel === 'settings' && (
          <>
            <div className="settings-section">
              <div className="settings-title">AI API Configuration</div>
              
              <div className="api-key-card">
                <div className="api-key-header">
                  <span className="api-key-name">
                    <FileVideo size={16} />
                    Gemini
                    <span className="api-key-badge">Video AI</span>
                  </span>
                  {apiKeys.gemini && (
                    <span className="api-key-status">
                      <Key size={12} /> Configured
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  className="input-field password"
                  placeholder="Enter Gemini API Key..."
                  value={apiKeys.gemini}
                  onChange={(e) => handleKeyChange('gemini', e.target.value)}
                />
              </div>

              <div className="api-key-card">
                <div className="api-key-header">
                  <span className="api-key-name">
                    <Sparkles size={16} />
                    OpenAI
                    <span className="api-key-badge">Script</span>
                  </span>
                  {apiKeys.openai && (
                    <span className="api-key-status">
                      <Key size={12} /> Configured
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  className="input-field password"
                  placeholder="Enter OpenAI API Key..."
                  value={apiKeys.openai}
                  onChange={(e) => handleKeyChange('openai', e.target.value)}
                />
              </div>

              <div className="api-key-card">
                <div className="api-key-header">
                  <span className="api-key-name">
                    <Mic2 size={16} />
                    Whisper
                    <span className="api-key-badge" style={{background:'#ffd700'}}>Subtitle</span>
                  </span>
                  {apiKeys.whisper && (
                    <span className="api-key-status">
                      <Key size={12} /> Configured
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  className="input-field password"
                  placeholder="OpenAI Key for Whisper..."
                  value={apiKeys.whisper}
                  onChange={(e) => handleKeyChange('whisper', e.target.value)}
                />
              </div>

              <div className="api-key-card">
                <div className="api-key-header">
                  <span className="api-key-name">
                    <Mic size={16} />
                    ElevenLabs
                    <span className="api-key-badge" style={{background:'#00ff88'}}>Voice</span>
                  </span>
                  {apiKeys.elevenlabs && (
                    <span className="api-key-status">
                      <Key size={12} /> Configured
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  className="input-field password"
                  placeholder="Enter ElevenLabs API Key..."
                  value={apiKeys.elevenlabs}
                  onChange={(e) => handleKeyChange('elevenlabs', e.target.value)}
                />
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-title">Export Settings</div>
              <div className="card">
                <div className="export-options">
                  <div className="export-option">
                    <label>Resolution</label>
                    <select>
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (Full HD)</option>
                      <option value="4k">4K (Ultra HD)</option>
                    </select>
                  </div>
                  <div className="export-option">
                    <label>Quality</label>
                    <select>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="export-option">
                    <label>Format</label>
                    <select>
                      <option value="mp4">MP4 (H.264)</option>
                      <option value="webm">WebM</option>
                    </select>
                  </div>
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" id="includeSubs" defaultChecked />
                  <label htmlFor="includeSubs">Include Subtitles</label>
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" id="includeVoice" defaultChecked />
                  <label htmlFor="includeVoice">Include Voiceover</label>
                </div>
              </div>
            </div>
          </>
        )}

        {activePanel === 'editor' && (
          <>
            <div className="settings-section">
              <div className="settings-title">Video Information</div>
              <div className="card">
                {videoFile ? (
                  <>
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <strong>File:</strong> {videoFile.name}
                    </p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <strong>Duration:</strong> {Math.floor(videoMeta.duration / 60)}:{String(Math.floor(videoMeta.duration % 60)).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>
                      <strong>Size:</strong> {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No video uploaded yet
                  </p>
                )}
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-title">🎬 AI Processing Pipeline</div>
              
              <div className="ai-actions">
                <button 
                  className="action-btn analyzing"
                  onClick={handleAnalyze}
                  disabled={!videoFile}
                >
                  <FileVideo />
                  <span>Analyze Video (Gemini)</span>
                </button>

                <button 
                  className="action-btn"
                  style={{ borderColor: '#ffd700' }}
                  onClick={handleWhisperTranscribe}
                  disabled={!videoFile}
                >
                  <Languages />
                  <span style={{ color: '#ffd700' }}>Transcribe (Whisper AI)</span>
                </button>

                <button 
                  className="action-btn generating"
                  onClick={handleGenerateScript}
                  disabled={!videoFile}
                >
                  <Sparkles />
                  <span>Generate Script (OpenAI)</span>
                </button>

                <button 
                  className="action-btn voiceover"
                  onClick={handleGenerateVoiceover}
                  disabled={!script && subtitles.length === 0}
                >
                  <Mic />
                  <span>Generate Voiceover</span>
                </button>
              </div>
            </div>

            {subtitles.length > 0 && (
              <div className="settings-section">
                <div className="settings-title">📝 Subtitles ({subtitles.length})</div>
                <div className="subtitle-list">
                  {subtitles.slice(0, 5).map((sub, i) => (
                    <div key={i} className="subtitle-item">
                      <span className="subtitle-index">{i + 1}</span>
                      <span className="subtitle-time">
                        {Math.floor(sub.startTime/60)}:{String(Math.floor(sub.startTime%60)).padStart(2,'0')}
                      </span>
                      <span className="subtitle-text">{sub.text.substring(0, 25)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
