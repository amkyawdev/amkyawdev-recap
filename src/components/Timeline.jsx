import { useState } from 'react';
import { ZoomIn, ZoomOut, Scissors, Trash2, Plus, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Timeline() {
  const { 
    videoFile, 
    videoMeta, 
    currentTime, 
    subtitles, 
    voiceover,
    script,
    setCurrentTime,
    videoSegments,
    addVideoSegment,
    removeVideoSegment,
    clearVideoSegments,
    addToast
  } = useAppStore();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);

  if (!videoFile) {
    return null;
  }

  const videoWidth = videoMeta.duration > 0 ? (currentTime / videoMeta.duration) * 100 : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (e) => {
    if (!isSelecting) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const clickTime = clickPercent * videoMeta.duration;
    
    if (selectionStart === null) {
      setSelectionStart(clickTime);
    } else {
      const start = Math.min(selectionStart, clickTime);
      const end = Math.max(selectionStart, clickTime);
      
      if (end - start > 1) {
        addVideoSegment(start, end);
        addToast({ type: 'success', message: `Added segment: ${formatTime(start)} - ${formatTime(end)}` });
      }
      
      setSelectionStart(null);
      setIsSelecting(false);
    }
  };

  const handleCutAtPlayhead = () => {
    if (currentTime > 0 && currentTime < videoMeta.duration) {
      addVideoSegment(0, currentTime);
      addToast({ type: 'success', message: `Cut at ${formatTime(currentTime)}` });
    }
  };

  const totalSegmentDuration = videoSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);

  return (
    <div className="timeline fade-in">
      <div className="timeline-header">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          Timeline {videoSegments.length > 0 && `(${videoSegments.length} segments, ${formatTime(totalSegmentDuration)}s)`}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-icon" 
            onClick={handleCutAtPlayhead}
            title="Cut at playhead"
          >
            <Scissors size={18} />
          </button>
          <button 
            className={`btn-icon ${isSelecting ? 'active' : ''}`}
            onClick={() => {
              setIsSelecting(!isSelecting);
              setSelectionStart(null);
            }}
            title="Select segment"
            style={{ background: isSelecting ? 'var(--accent-primary)' : undefined }}
          >
            <Plus size={18} />
          </button>
          {videoSegments.length > 0 && (
            <button 
              className="btn-icon" 
              onClick={() => {
                clearVideoSegments();
                addToast({ type: 'info', message: 'All segments cleared' });
              }}
              title="Clear all segments"
              style={{ color: 'var(--error)' }}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="timeline-tracks">
        {/* Video Track */}
        <div className="timeline-track">
          <span className="track-label">Video</span>
          <div 
            className="track-content"
            onClick={handleTrackClick}
            style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
          >
            {/* Full video background */}
            <div 
              style={{ 
                position: 'absolute',
                left: '0%', 
                width: '100%', 
                height: '100%',
                background: 'rgba(255,51,102,0.2)',
                borderRadius: '4px'
              }}
            />
            
            {/* Selected segments */}
            {videoSegments.map((seg, i) => {
              const left = (seg.start / videoMeta.duration) * 100;
              const width = ((seg.end - seg.start) / videoMeta.duration) * 100;
              return (
                <div
                  key={seg.id}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${width}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ff3366, #cc2952)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'white',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ 
                    position: 'absolute',
                    right: '4px',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    padding: '2px',
                    display: 'flex'
                  }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideoSegment(seg.id);
                    }}
                  >
                    <X size={12} />
                  </span>
                </div>
              );
            })}
            
            {/* Playhead */}
            <div 
              style={{
                position: 'absolute',
                left: `${videoWidth}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--accent-secondary)',
                boxShadow: '0 0 10px var(--accent-secondary)',
                zIndex: 10
              }}
            />
          </div>
        </div>

        {/* Audio Track */}
        <div className="timeline-track">
          <span className="track-label">Audio</span>
          <div className="track-content">
            {voiceover ? (
              <div 
                className="track-clip"
                style={{ left: '0%', width: '100%', background: 'linear-gradient(90deg, #00ff88, #00cc6a)' }}
              >
                Voiceover Track
              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
              }}>
                Original Audio
              </div>
            )}
            <div 
              style={{
                position: 'absolute',
                left: `${videoWidth}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--accent-secondary)',
                zIndex: 10
              }}
            />
          </div>
        </div>

        {/* Subtitle Track */}
        <div className="timeline-track">
          <span className="track-label">Subtitle</span>
          <div className="track-content">
            {subtitles.length > 0 ? (
              subtitles.map((sub, i) => {
                const startPercent = (sub.startTime / videoMeta.duration) * 100;
                const width = ((sub.endTime - sub.startTime) / videoMeta.duration) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${startPercent}%`,
                      width: `${Math.max(width, 1)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-tertiary), #e6c200)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 4px',
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      opacity: 0.8
                    }}
                  >
                    {sub.text.substring(0, 15)}...
                  </div>
                );
              })
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
              }}>
                {script ? 'Subtitles generated' : 'No subtitles yet'}
              </div>
            )}
            <div 
              style={{
                position: 'absolute',
                left: `${videoWidth}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--accent-secondary)',
                zIndex: 10
              }}
            />
          </div>
        </div>
      </div>
      
      {isSelecting && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'rgba(0,255,136,0.1)',
          border: '1px solid #00ff88',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#00ff88',
          textAlign: 'center'
        }}>
          Click on timeline to select segment start, then click again for end point
        </div>
      )}
    </div>
  );
}
