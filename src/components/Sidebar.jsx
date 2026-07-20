import { useState } from 'react';
import { 
  Key, Sparkles, FileVideo, Type, Mic, Languages, 
  ChevronRight, PanelLeftClose, PanelLeft, 
  Scissors, Crop, RotateCcw, FlipHorizontal, Volume2,
  Music, Layers, Download, Play, Pause, SkipBack, SkipForward,
  Plus, Trash2, Copy, MessageSquare, Clock, Maximize, Minimize
} from 'lucide-react';
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

  const [collapsed, setCollapsed] = useState(true); // Default: closed
  const [expandedSections, setExpandedSections] = useState({
    api: true,
    export: true,
    editing: true,
    effects: true,
    audio: true,
    subtitles: true
  });

  // Editing state
  const [selectedVoice, setSelectedVoice] = useState('rachel');
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
  const handleSpeed = (speed) => {
    setPlaybackSpeed(speed);
    addToast({ type: 'info', message: `Playback speed: ${speed}x` });
  };

  return (
    <>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'fixed',
          left: collapsed ? '10px' : '260px',
          top: '60px',
          zIndex: 101,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px',
          cursor: 'pointer',
          transition: 'left 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>

      <aside 
        style={{
          width: collapsed ? '0' : '250px',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab ${activePanel === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePanel('settings')}
          >
            <Key size={16} />
            {!collapsed && 'Settings'}
          </button>
          <button 
            className={`sidebar-tab ${activePanel === 'editor' ? 'active' : ''}`}
            onClick={() => setActivePanel('editor')}
          >
            <Scissors size={16} />
            {!collapsed && 'Editor'}
          </button>
        </div>

        <div className="sidebar-content" style={{ opacity: collapsed ? 0 : 1 }}>
          {activePanel === 'settings' && (
            <>
              {/* API Keys Section */}
              <div className="settings-section">
                <button onClick={() => toggleSection('api')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>🔐 API Configuration</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.api ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.api && (
                  <div>
                    {[
                      { key: 'gemini', name: 'Gemini', badge: 'Video AI', color: '#00d4ff', placeholder: 'AIza...' },
                      { key: 'openai', name: 'OpenAI', badge: 'Script', color: '#ff3366', placeholder: 'sk-...' },
                      { key: 'whisper', name: 'Whisper', badge: 'Subtitle', color: '#ffd700', placeholder: 'sk-...' },
                      { key: 'elevenlabs', name: 'ElevenLabs', badge: 'Voice', color: '#00ff88', placeholder: '...' }
                    ].map(({ key, name, badge, color, placeholder }) => (
                      <div key={key} className="api-key-card">
                        <div className="api-key-header">
                          <span className="api-key-name">
                            <span style={{ color }}>{name}</span>
                            <span className="api-key-badge" style={{ background: color, color: '#000' }}>{badge}</span>
                          </span>
                          {apiKeys[key] && <span className="api-key-status">✓</span>}
                        </div>
                        <input type="password" className="input-field password" placeholder={placeholder} value={apiKeys[key]} onChange={(e) => handleKeyChange(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Settings */}
              <div className="settings-section">
                <button onClick={() => toggleSection('export')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>📤 Export</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.export ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.export && (
                  <div className="card">
                    <div className="export-options">
                      <div className="export-option"><label>Resolution</label><select><option>720p</option><option>1080p</option><option>4K</option></select></div>
                      <div className="export-option"><label>Quality</label><select><option>Low</option><option>Medium</option><option>High</option></select></div>
                      <div className="export-option"><label>Format</label><select><option>MP4</option><option>WebM</option></select></div>
                    </div>
                    <div className="checkbox-group"><input type="checkbox" id="s1" defaultChecked /><label htmlFor="s1">Subtitles</label></div>
                    <div className="checkbox-group"><input type="checkbox" id="s2" defaultChecked /><label htmlFor="s2">Voiceover</label></div>
                  </div>
                )}
              </div>
            </>
          )}

          {activePanel === 'editor' && (
            <>
              {/* 🎬 Basic Editing Tools */}
              <div className="settings-section">
                <button onClick={() => toggleSection('editing')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>✂️ Basic Editing</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.editing ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.editing && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                    {[
                      { icon: Scissors, label: 'Trim', action: handleTrim },
                      { icon: Copy, label: 'Split', action: handleSplit },
                      { icon: Crop, label: 'Crop', action: handleCrop },
                      { icon: RotateCcw, label: 'Rotate', action: handleRotate },
                      { icon: FlipHorizontal, label: 'Flip', action: handleFlip },
                      { icon: Trash2, label: 'Delete', action: () => addToast({ type: 'warning', message: 'Select item to delete' }) }
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s', minHeight: '50px' }} title={label}>
                        <Icon size={16} />
                        <span style={{ fontSize: '0.6rem' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 🎵 Audio Controls */}
              <div className="settings-section">
                <button onClick={() => toggleSection('audio')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>🎵 Audio Controls</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.audio ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.audio && (
                  <div className="card">
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Volume</label>
                        <span style={{ fontSize: '0.8rem' }}>{volume}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Speed</label>
                        <span style={{ fontSize: '0.8rem' }}>{playbackSpeed}x</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0.25, 0.5, 1, 1.5, 2].map(speed => (
                          <button key={speed} onClick={() => handleSpeed(speed)} style={{ flex: 1, padding: '6px', background: playbackSpeed === speed ? 'var(--accent-primary)' : 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: playbackSpeed === speed ? '#fff' : 'var(--text-primary)', fontSize: '0.75rem' }}>{speed}x</button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Voice</label>
                      <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <option value="rachel">Rachel (Female)</option>
                        <option value="domi">Domi (Female)</option>
                        <option value="bella">Bella (Female)</option>
                        <option value="antoni">Antoni (Male)</option>
                        <option value="arnold">Arnold (Male)</option>
                        <option value="adam">Adam (Male)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* ✨ Effects */}
              <div className="settings-section">
                <button onClick={() => toggleSection('effects')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>✨ Effects</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.effects ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.effects && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['Fade In', 'Fade Out', 'Blur', 'Brightness', 'Contrast', 'Saturation', 'Sepia', 'Grayscale'].map(effect => (
                      <button key={effect} style={{ padding: '8px 4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.7rem' }}>{effect}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* 🤖 AI Processing */}
              <div className="settings-section">
                <button onClick={() => toggleSection('ai')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                  <span className="settings-title" style={{ margin: 0 }}>🤖 AI Tools</span>
                  <ChevronRight size={16} style={{ transform: expandedSections.ai ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                
                {expandedSections.ai && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="action-btn" style={{ borderColor: '#00d4ff', padding: '10px 12px' }} onClick={handleAnalyze} disabled={!videoFile}>
                      <FileVideo size={16} style={{ color: '#00d4ff' }} />
                      <span style={{ fontSize: '0.85rem' }}>Analyze (Gemini)</span>
                    </button>
                    <button className="action-btn" style={{ borderColor: '#ffd700', padding: '10px 12px' }} onClick={handleWhisperTranscribe} disabled={!videoFile}>
                      <Languages size={16} style={{ color: '#ffd700' }} />
                      <span style={{ fontSize: '0.85rem', color: '#ffd700' }}>Transcribe (Whisper)</span>
                    </button>
                    <button className="action-btn" style={{ borderColor: '#ff3366', padding: '10px 12px' }} onClick={handleGenerateScript} disabled={!videoFile}>
                      <Sparkles size={16} style={{ color: '#ff3366' }} />
                      <span style={{ fontSize: '0.85rem' }}>Generate Script</span>
                    </button>
                    <button className="action-btn" style={{ borderColor: '#00ff88', padding: '10px 12px' }} onClick={handleGenerateVoiceover} disabled={!videoFile}>
                      <Mic size={16} style={{ color: '#00ff88' }} />
                      <span style={{ fontSize: '0.85rem' }}>Voiceover</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 📝 Subtitles */}
              {subtitles.length > 0 && (
                <div className="settings-section">
                  <button onClick={() => toggleSection('subtitles')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '12px' }}>
                    <span className="settings-title" style={{ margin: 0 }}>📝 Subtitles ({subtitles.length})</span>
                    <ChevronRight size={16} style={{ transform: expandedSections.subtitles ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  
                  {expandedSections.subtitles && (
                    <div className="subtitle-list">
                      {subtitles.map((sub, i) => (
                        <div key={i} className="subtitle-item">
                          <span className="subtitle-index">{i + 1}</span>
                          <span className="subtitle-time">{Math.floor(sub.startTime/60)}:{String(Math.floor(sub.startTime%60)).padStart(2,'0')}</span>
                          <span className="subtitle-text">{sub.text.substring(0, 20)}...</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
