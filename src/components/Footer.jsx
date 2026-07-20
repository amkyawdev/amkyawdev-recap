import { HardDrive, Wifi } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Footer() {
  const { videoFile, videoMeta, processingStatus } = useAppStore();

  return (
    <footer className="footer">
      <div className="footer-status">
        <span className="status-dot" style={{ 
          background: processingStatus === 'idle' ? 'var(--success)' : 'var(--warning)'
        }} />
        <span>
          {processingStatus === 'idle' ? 'Ready' : 'Processing...'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {videoFile && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={14} />
              {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
            </span>
            <span>
              {videoMeta.duration > 0 && (
                `${Math.floor(videoMeta.duration / 60)}:${String(Math.floor(videoMeta.duration % 60)).padStart(2, '0')}`
              )}
            </span>
          </>
        )}
        
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={14} />
          Local Mode
        </span>
      </div>
    </footer>
  );
}
