import { useState } from 'react';
import useAppStore from '../store/useAppStore';

export default function SubtitleSettings() {
  const { subtitles, setSubtitles, addToast } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  
  // Subtitle styling settings
  const [settings, setSettings] = useState({
    fontFamily: 'Arial',
    fontSize: 48,
    fontColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.75)',
    textAlign: 'center',
    position: 'bottom', // top, center, bottom
    bold: true,
    shadow: true,
    padding: '10px 20px',
    marginBottom: '50px'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    if (subtitles.length === 0) {
      addToast({ type: 'warning', message: 'No subtitles to export' });
      return;
    }
    
    // Generate SRT with styling info
    let srtContent = '';
    subtitles.forEach((sub, i) => {
      const startTime = formatSRTTime(sub.startTime);
      const endTime = formatSRTTime(sub.endTime);
      srtContent += `${i + 1}\n${startTime} --> ${endTime}\n${sub.text}\n\n`;
    });
    
    // Create styled subtitles for preview
    const styledSubtitles = subtitles.map(sub => ({
      ...sub,
      style: settings
    }));
    
    setSubtitles(styledSubtitles);
    setShowSettings(false);
    addToast({ type: 'success', message: 'Subtitle settings applied!' });
  };

  const formatSRTTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          width: '100%',
          padding: '10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span><i className="bi bi-gear"></i> Subtitle Settings</span>
        <i className={`bi ${showSettings ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
      </button>

      {showSettings && (
        <div style={{
          marginTop: '12px',
          padding: '16px',
          background: 'var(--bg-elevated)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Position */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Position
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['top', 'center', 'bottom'].map(pos => (
                <button
                  key={pos}
                  onClick={() => handleSettingChange('position', pos)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: settings.position === pos ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: settings.position === pos ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="24"
              max="72"
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Font Color */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Text Color
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="color"
                value={settings.fontColor}
                onChange={(e) => handleSettingChange('fontColor', e.target.value)}
                style={{ width: '50px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={settings.fontColor}
                onChange={(e) => handleSettingChange('fontColor', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Background
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="color"
                value={settings.backgroundColor.startsWith('#') ? settings.backgroundColor : '#000000'}
                onChange={(e) => handleSettingChange('backgroundColor', `${e.target.value}`)}
                style={{ width: '50px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
            </select>
          </div>

          {/* Bold & Shadow */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.bold}
                onChange={(e) => handleSettingChange('bold', e.target.checked)}
              />
              <span style={{ fontSize: '0.85rem' }}>Bold</span>
            </label>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.shadow}
                onChange={(e) => handleSettingChange('shadow', e.target.checked)}
              />
              <span style={{ fontSize: '0.85rem' }}>Shadow</span>
            </label>
          </div>

          {/* Preview */}
          <div style={{
            padding: '16px',
            background: '#000',
            borderRadius: '8px',
            textAlign: settings.textAlign,
            marginTop: '8px'
          }}>
            <span style={{
              fontFamily: settings.fontFamily,
              fontSize: `${Math.min(settings.fontSize * 0.5, 24)}px`,
              color: settings.fontColor,
              background: settings.backgroundColor,
              padding: settings.padding,
              borderRadius: '4px',
              fontWeight: settings.bold ? 'bold' : 'normal',
              textShadow: settings.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
              display: 'inline-block'
            }}>
              Sample Subtitle
            </span>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleExport}
            style={{
              padding: '12px',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <i className="bi bi-check"></i> Apply Settings
          </button>
        </div>
      )}
    </div>
  );
}
