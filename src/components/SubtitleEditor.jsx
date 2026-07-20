import { Type, Edit3, Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function SubtitleEditor() {
  const { subtitles, setSubtitles, setCurrentTime, videoFile } = useAppStore();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const handleSubtitleClick = (subtitle) => {
    setCurrentTime(subtitle.startTime);
  };

  const handleEditSubtitle = (index, newText) => {
    const newSubs = [...subtitles];
    newSubs[index] = { ...newSubs[index], text: newText };
    setSubtitles(newSubs);
  };

  const handleDeleteSubtitle = (index) => {
    const newSubs = subtitles.filter((_, i) => i !== index);
    setSubtitles(newSubs);
  };

  const handleAddSubtitle = () => {
    const newSub = {
      startTime: 0,
      endTime: 3,
      text: 'New subtitle'
    };
    setSubtitles([...subtitles, newSub]);
  };

  if (!videoFile) {
    return null;
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Type size={18} />
          Subtitle Editor
          {subtitles.length > 0 && (
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'var(--accent-primary)', 
              padding: '2px 8px', 
              borderRadius: '10px',
              color: 'white'
            }}>
              {subtitles.length} items
            </span>
          )}
        </h3>
        <button className="btn btn-secondary" onClick={handleAddSubtitle}>
          <Plus size={16} />
          Add
        </button>
      </div>

      {subtitles.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <Type size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No subtitles yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            Generate subtitles using AI or add manually
          </p>
        </div>
      ) : (
        <div className="subtitle-list">
          {subtitles.map((sub, index) => (
            <div 
              key={index} 
              className="subtitle-item"
              onClick={() => handleSubtitleClick(sub)}
            >
              <span className="subtitle-index">{index + 1}</span>
              <span className="subtitle-time">
                {formatTime(sub.startTime)} → {formatTime(sub.endTime)}
              </span>
              <input
                type="text"
                value={sub.text}
                onChange={(e) => handleEditSubtitle(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem'
                }}
              />
              <button 
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubtitle(index);
                }}
                style={{ color: 'var(--error)' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Subtitle Style Presets
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Netflix Style', 'YouTube Classic', 'Modern Minimal', 'Retro Cinema'].map((style) => (
            <button
              key={style}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
