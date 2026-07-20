import { AlertTriangle, X, Clock } from 'lucide-react';

export default function DurationValidator({ isOpen, onClose, duration }) {
  if (!isOpen) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '2px solid var(--error)',
        padding: '32px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(255, 68, 68, 0.3)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertTriangle size={48} color="var(--error)" />
        </div>

        <h2 style={{
          color: 'var(--error)',
          marginBottom: '12px',
          fontSize: '1.5rem'
        }}>
          Video Too Long
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          Your video is <strong style={{ color: 'var(--error)' }}>{formatDuration(duration)}</strong> long.
          <br /><br />
          For optimal AI processing and recap quality, please use videos under <strong>5 minutes</strong>.
        </p>

        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h4 style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} /> Tips:
          </h4>
          <ul style={{ 
            color: 'var(--text-secondary)', 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.8'
          }}>
            <li>Split longer videos into shorter clips</li>
            <li>Focus on key scenes for best recap</li>
            <li>Use trim tool to select best moments</li>
            <li>Consider making multiple short recaps</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            background: 'var(--error)',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <X size={18} />
          Close
        </button>
      </div>
    </div>
  );
}
