import { ZoomIn, ZoomOut, Scissors, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Timeline() {
  const { 
    videoFile, 
    videoMeta, 
    currentTime, 
    subtitles, 
    voiceover,
    script,
    setCurrentTime 
  } = useAppStore();

  if (!videoFile) {
    return null;
  }

  const videoWidth = videoMeta.duration > 0 ? (currentTime / videoMeta.duration) * 100 : 0;

  return (
    <div className="timeline fade-in">
      <div className="timeline-header">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          Timeline
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon">
            <ZoomOut size={18} />
          </button>
          <button className="btn-icon">
            <ZoomIn size={18} />
          </button>
          <button className="btn-icon">
            <Scissors size={18} />
          </button>
          <button className="btn-icon" style={{ color: 'var(--error)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="timeline-tracks">
        {/* Video Track */}
        <div className="timeline-track">
          <span className="track-label">Video</span>
          <div className="track-content">
            <div 
              className="track-clip"
              style={{ left: '0%', width: '100%', background: 'linear-gradient(90deg, #ff3366, #cc2952)' }}
            >
              {videoFile?.name}
            </div>
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
    </div>
  );
}
