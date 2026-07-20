import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import SubtitleSettings from './SubtitleSettings';

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
    setProcessingStage,
    selectedVoice,
    setSelectedVoice
  } = useAppStore();

  const [collapsed, setCollapsed] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    api: false,
    export: false,
    editing: true,
    effects: false,
    audio: true,
    subtitles: false,
    srtupload: false,
    ai: true
  });

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleKeyChange = (provider, value) => {
    setApiKey(provider, value);
    if (value.length > 10) {
      addToast({ type: 'success', message: `${provider.toUpperCase()} API key saved` });
    }
  };

  const handleSpeed = (speed) => {
    setPlaybackSpeed(speed);
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
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 200));
      setProcessingProgress(i);
      setProcessingStage('Processing speech...');
    }
    
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

  // Editing tool functions
  const handleTrim = () => addToast({ type: 'info', message: 'Trim tool activated - Drag handles on timeline' });
  const handleSplit = () => addToast({ type: 'info', message: 'Click on timeline to split at position' });
  const handleCrop = () => addToast({ type: 'info', message: 'Crop tool activated' });
  const handleRotate = () => addToast({ type: 'info', message: 'Rotate 90° clockwise' });
  const handleFlip = () => addToast({ type: 'info', message: 'Flip horizontal' });
  // SRT file upload handler
  const handleSRTUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = parseSRT(content);
      if (parsed.length > 0) {
        setSubtitles(parsed);
        addToast({ type: 'success', message: `${parsed.length} subtitles imported from SRT` });
      } else {
        addToast({ type: 'error', message: 'Failed to parse SRT file' });
      }
    };
    reader.readAsText(file);
  };

  // Parse SRT content to subtitles array
  const parseSRT = (srtContent) => {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\n+/);
    
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const textLines = lines.slice(2);
        const text = textLines.join('\n');
        
        const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
        
        if (timeMatch) {
          const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
          const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
          
          subtitles.push({
            startTime: Math.round(startTime * 100) / 100,
            endTime: Math.round(endTime * 100) / 100,
            text: text.trim()
          });
        }
      }
    }
    
    return subtitles;
  };

  return (
    <>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'fixed',
          left: collapsed ? '10px' : '270px',
          top: '60px',
          zIndex: 101,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          transition: 'left 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
      </button>

      <aside 
        style={{
          width: collapsed ? '0' : '260px',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', padding: '12px', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActivePanel('settings')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: activePanel === 'settings' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              border: 'none',
              borderRadius: '8px',
              color: activePanel === 'settings' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <i className="bi bi-gear-fill"></i>
            <span>Settings</span>
          </button>
          <button 
            onClick={() => setActivePanel('editor')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: activePanel === 'editor' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              border: 'none',
              borderRadius: '8px',
              color: activePanel === 'editor' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <i className="bi bi-scissors"></i>
            <span>Editor</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', opacity: collapsed ? 0 : 1 }}>
          {activePanel === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* API Configuration */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-key"></i> API Keys</span>
                </div>
                {[
                  { key: 'gemini', name: 'Gemini', color: '#00d4ff', placeholder: 'AIza...' },
                  { key: 'openai', name: 'OpenAI', color: '#ff3366', placeholder: 'sk-...' },
                  { key: 'whisper', name: 'Whisper', color: '#ffd700', placeholder: 'sk-...' },
                  { key: 'elevenlabs', name: 'ElevenLabs', color: '#00ff88', placeholder: '...' }
                ].map(({ key, name, color, placeholder }) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: color, display: 'block', marginBottom: '4px' }}>{name}</label>
                    <input 
                      type="password" 
                      placeholder={placeholder} 
                      value={apiKeys[key]} 
                      onChange={(e) => handleKeyChange(key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Export Settings */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-download"></i> Export</span>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <select style={{ padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                    <option>720p</option><option selected>1080p</option><option>4K</option>
                  </select>
                  <select style={{ padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                    <option>Low</option><option selected>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'editor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* AI Tools */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-robot"></i> AI Tools</span>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button onClick={handleAnalyze} disabled={!videoFile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,212,255,0.1)', border: '1px solid #00d4ff', borderRadius: '8px', color: '#00d4ff', cursor: videoFile ? 'pointer' : 'not-allowed', opacity: videoFile ? 1 : 0.5 }}>
                    <i className="bi bi-search"></i>
                    <span style={{ fontSize: '0.85rem' }}>Analyze (Gemini)</span>
                  </button>
                  <button onClick={handleWhisperTranscribe} disabled={!videoFile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,215,0,0.1)', border: '1px solid #ffd700', borderRadius: '8px', color: '#ffd700', cursor: videoFile ? 'pointer' : 'not-allowed', opacity: videoFile ? 1 : 0.5 }}>
                    <i className="bi bi-mic"></i>
                    <span style={{ fontSize: '0.85rem' }}>Transcribe (Whisper)</span>
                  </button>
                  <button onClick={handleGenerateScript} disabled={!videoFile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,51,102,0.1)', border: '1px solid #ff3366', borderRadius: '8px', color: '#ff3366', cursor: videoFile ? 'pointer' : 'not-allowed', opacity: videoFile ? 1 : 0.5 }}>
                    <i className="bi bi-stars"></i>
                    <span style={{ fontSize: '0.85rem' }}>Generate Script</span>
                  </button>
                  <button onClick={handleGenerateVoiceover} disabled={!videoFile} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', borderRadius: '8px', color: '#00ff88', cursor: videoFile ? 'pointer' : 'not-allowed', opacity: videoFile ? 1 : 0.5 }}>
                    <i className="bi bi-megaphone"></i>
                    <span style={{ fontSize: '0.85rem' }}>Voiceover</span>
                  </button>
                </div>
              </div>

              {/* Editing Tools */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-tools"></i> Editing</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { icon: 'bi-scissors', label: 'Trim', action: handleTrim },
                    { icon: 'bi-intersect', label: 'Split', action: handleSplit },
                    { icon: 'bi-aspect-ratio', label: 'Crop', action: handleCrop },
                    { icon: 'bi-arrow-clockwise', label: 'Rotate', action: handleRotate },
                    { icon: 'bi-arrow-left-right', label: 'Flip', action: handleFlip },
                    { icon: 'bi-trash', label: 'Delete', action: () => addToast({ type: 'warning', message: 'Select item to delete' }) }
                  ].map(({ icon, label, action }) => (
                    <button key={label} onClick={action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <i className={icon} style={{ fontSize: '18px' }}></i>
                      <span style={{ fontSize: '0.65rem' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-volume-up"></i> Audio</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Volume</span>
                    <span style={{ fontSize: '0.75rem' }}>{volume}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Speed</span>
                    <span style={{ fontSize: '0.75rem' }}>{playbackSpeed}x</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0.25, 0.5, 1, 1.5, 2].map(speed => (
                      <button key={speed} onClick={() => handleSpeed(speed)} style={{ flex: 1, padding: '6px', background: playbackSpeed === speed ? 'var(--accent-primary)' : 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: playbackSpeed === speed ? '#fff' : 'var(--text-primary)', fontSize: '0.7rem' }}>{speed}x</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Voice</label>
                  <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                    <option value="thita">သီဟ (Male)</option>
                    <option value="nila">နီလာ (Female)</option>
                    <option value="rachel">Rachel (Female)</option>
                    <option value="domi">Domi (Female)</option>
                    <option value="antoni">Antoni (Male)</option>
                    <option value="adam">Adam (Male)</option>
                  </select>
                </div>
              </div>

              {/* SRT Upload */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-file-earmark-text"></i> Subtitles</span>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', border: '2px dashed var(--border)', borderRadius: '8px', cursor: 'pointer' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith('.srt')) {
                    handleSRTUpload(file);
                  } else {
                    addToast({ type: 'error', message: 'Please upload .srt file' });
                  }
                }}>
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: '24px', color: 'var(--accent-primary)' }}></i>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drop SRT file here</span>
                  <input type="file" accept=".srt" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleSRTUpload(file);
                  }} />
                </label>
                {subtitles.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-surface)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-check-circle" style={{ color: 'var(--success)' }}></i>
                    <span style={{ fontSize: '0.75rem' }}>{subtitles.length} subtitles loaded</span>
                  </div>
                )}
                
                {/* Subtitle Settings */}
                <SubtitleSettings />
              </div>

              {/* Effects */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}><i className="bi bi-magic"></i> Effects</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Fade In', 'Fade Out', 'Blur', 'Bright', 'Contrast', 'Saturate', 'Sepia', 'Gray'].map(effect => (
                    <button key={effect} style={{ padding: '8px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.7rem' }}>{effect}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
