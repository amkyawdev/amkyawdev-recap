import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';

export default function ExportModal({ isOpen, onClose }) {
  const { videoFile, subtitles, voiceover, addToast } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [stages, setStages] = useState([
    { id: 'init', name: 'Initializing export...', done: false },
    { id: 'video', name: 'Processing video...', done: false },
    { id: 'subtitles', name: 'Adding subtitles...', done: false },
    { id: 'voiceover', name: 'Adding voiceover...', done: false },
    { id: 'encoding', name: 'Encoding video...', done: false },
    { id: 'complete', name: 'Export complete!', done: false },
  ]);

  useEffect(() => {
    if (isOpen && videoFile) {
      startExport();
    }
  }, [isOpen]);

  const startExport = async () => {
    setProgress(0);
    setStatus('processing');
    setDownloadUrl(null);

    const steps = [
      { id: 'init', progress: 10, delay: 800 },
      { id: 'video', progress: 30, delay: 1200 },
      { id: 'subtitles', progress: 50, delay: 1000 },
      { id: 'voiceover', progress: 70, delay: 1000 },
      { id: 'encoding', progress: 90, delay: 1500 },
      { id: 'complete', progress: 100, delay: 500 },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      setProgress(step.progress);
      setStages(prev => prev.map(s => 
        s.id === step.id ? { ...s, done: true } : s
      ));
    }

    setStatus('complete');
    
    // Create a blob URL for the original video (for demo)
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setDownloadUrl(url);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `recap_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast({ type: 'success', message: 'Video downloaded!' });
    }
  };

  const handleClose = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setProgress(0);
    setStatus('idle');
    setDownloadUrl(null);
    setStages(stages.map(s => ({ ...s, done: false })));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        padding: '32px',
        width: '90%',
        maxWidth: '480px',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: status === 'complete' 
              ? 'linear-gradient(135deg, #00ff88, #00d4ff)' 
              : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {status === 'complete' ? (
              <i className="bi bi-check-lg" style={{ fontSize: '32px', color: '#fff' }}></i>
            ) : (
              <i className="bi bi-hourglass-split" style={{ fontSize: '28px', color: '#fff', animation: 'spin 1s linear infinite' }}></i>
            )}
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            {status === 'complete' ? 'Export Complete!' : 'Processing Video...'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {status === 'complete' 
              ? 'Your video is ready to download' 
              : 'Please wait while we process your video'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            height: '8px',
            background: 'var(--bg-elevated)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: status === 'complete' 
                ? 'linear-gradient(90deg, #00ff88, #00d4ff)' 
                : 'var(--accent-primary)',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>{progress}%</span>
            <span>{progress < 100 ? 'Processing...' : 'Done!'}</span>
          </div>
        </div>

        {/* Stages */}
        <div style={{ marginBottom: '24px' }}>
          {stages.map((stage, i) => (
            <div key={stage.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
              opacity: stage.done || progress > (i * 15 + 5) ? 1 : 0.4,
              transition: 'opacity 0.3s'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: stage.done ? '#00ff88' : 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {stage.done ? (
                  <i className="bi bi-check" style={{ fontSize: '14px', color: '#000' }}></i>
                ) : (
                  <i className="bi bi-circle" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}></i>
                )}
              </div>
              <span style={{ 
                fontSize: '0.9rem',
                color: stage.done ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {stage.name}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>
          
          {status === 'complete' && (
            <button 
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-download"></i>
              Download Video
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
