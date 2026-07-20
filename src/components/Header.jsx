import { Film, Settings, Download } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Header() {
  const { setActivePanel, videoFile, processingStatus } = useAppStore();

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <Film size={24} color="white" />
        </div>
        <span className="logo-text">AMKYAWDEV RECAP</span>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => setActivePanel('settings')}
        >
          <Settings size={18} />
          Settings
        </button>
        
        <button 
          className="btn btn-primary"
          disabled={!videoFile || processingStatus !== 'idle'}
        >
          <Download size={18} />
          Export Video
        </button>
      </div>
    </header>
  );
}
