import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { processVideo } from '../utils/videoProcessor';

export default function ExportModal({ isOpen, onClose }) {
  const { 
    videoFile, 
    subtitles, 
    addToast, 
    videoSegments, 
    exportSettings,
    subtitleStyle 
  } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [currentStage, setCurrentStage] = useState('');
  const [stages] = useState([
    { id: 'load', name: 'Loading FFmpeg...', icon: 'bi-hourglass-split' },
    { id: 'init', name: 'Initializing...', icon: 'bi-gear' },
    { id: 'cutting', name: 'Cutting segments...', icon: 'bi-scissors' },
    { id: 'video', name: 'Processing video...', icon: 'bi-film' },
    { id: 'subtitles', name: 'Adding subtitles...', icon: 'bi-text-left' },
    { id: 'encoding', name: 'Encoding...', icon: 'bi bi-filetype-mp4' },
    { id: 'complete', name: 'Complete!', icon: 'bi-check-lg' },
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
    setCurrentStage('load');

    try {
      const result = await processVideo({
        videoFile,
        subtitles,
        settings: {
          resolution: exportSettings?.resolution || '1080p',
          quality: exportSettings?.quality || 'medium',
          includeSubtitles: exportSettings?.includeSubtitles ?? true,
          includeVoiceover: exportSettings?.includeVoiceover ?? true,
          segments: videoSegments || [],
          subtitleStyle: subtitleStyle || 'fade'
        }
      }, ({ stage, progress: p, message }) => {
        setCurrentStage(stage);
        if (stage === 'complete') {
          setProgress(100);
        } else if (stage === 'loading') {
          setProgress(p);
        } else {
          setProgress(Math.min(95, p));
        }
      });

      setStatus('complete');
      const url = URL.createObjectURL(result);
      setDownloadUrl(url);
      addToast({ type: 'success', message: 'Video processed successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      setStatus('error');
      addToast({ type: 'error', message: 'Export failed: ' + error.message });
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
    setCurrentStage('');
    onClose();
  };

  if (!isOpen) return null;

  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '20px',
        padding: '40px',
        width: '90%',
        maxWidth: '500px',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: status === 'complete' 
              ? 'linear-gradient(135deg, #00ff88, #00d4ff)' 
              : status === 'error'
              ? 'linear-gradient(135deg, #ff3366, #ff6b6b)'
              : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: status === 'processing' ? 'pulse 2s infinite' : 'none'
          }}>
            {status === 'complete' ? (
              <i className="bi bi-check-lg" style={{ fontSize: '40px', color: '#fff' }}></i>
            ) : status === 'error' ? (
              <i className="bi bi-x-lg" style={{ fontSize: '40px', color: '#fff' }}></i>
            ) : (
              <i className="bi bi-gear-wide-connected" style={{ fontSize: '36px', color: '#fff' }}></i>
            )}
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            {status === 'complete' ? 'Export Complete!' : status === 'error' ? 'Export Failed' : 'Processing Video...'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {status === 'complete' 
              ? 'Your video is ready to download' 
              : status === 'error'
              ? 'An error occurred during processing'
              : 'Please wait while we process your video'}
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <span>{stages.find(s => s.id === currentStage)?.name || 'Initializing...'}</span>
            <span>{progress}%</span>
          </div>
          <div style={{
            height: '10px',
            background: 'var(--bg-elevated)',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: status === 'complete' 
                ? 'linear-gradient(90deg, #00ff88, #00d4ff)' 
                : status === 'error'
                ? 'linear-gradient(90deg, #ff3366, #ff6b6b)'
                : 'var(--accent-primary)',
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Stages */}
        <div style={{ marginBottom: '32px' }}>
          {stages.map((stage, i) => {
            const isDone = i < currentIndex || (currentIndex === -1 && i === 0);
            const isActive = stages[currentIndex]?.id === stage.id || (currentIndex === -1 && i === 0 && status === 'processing');
            const isPending = i > currentIndex && !(currentIndex === -1 && i === 0);
            
            return (
              <div key={stage.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 0',
                opacity: isPending ? 0.35 : 1,
                transition: 'opacity 0.3s'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone 
                    ? '#00ff88' 
                    : isActive 
                    ? 'var(--accent-primary)'
                    : 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.3s'
                }}>
                  {isDone ? (
                    <i className="bi bi-check" style={{ fontSize: '14px', color: '#000' }}></i>
                  ) : (
                    <i className={isActive ? 'bi bi-arrow-right' : 'bi bi-circle'} style={{ fontSize: isActive ? '12px' : '6px', color: isActive ? '#fff' : 'var(--text-secondary)' }}></i>
                  )}
                </div>
                <span style={{ 
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '400',
                  color: isDone || isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}>
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {status === 'complete' ? 'Close' : 'Cancel'}
          </button>
          
          {status === 'complete' && (
            <button 
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <i className="bi bi-download" style={{ fontSize: '18px' }}></i>
              Download MP4
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
