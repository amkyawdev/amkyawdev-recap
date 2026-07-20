import { useState, useEffect } from 'react';
import { Film, Settings, Download, User, LogOut, Shield } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Auth from './Auth';

export default function Header() {
  const { setActivePanel, videoFile, processingStatus, setApiKey } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Clear API keys
    ['gemini', 'openai', 'elevenlabs', 'whisper'].forEach(key => {
      setApiKey(key, '');
    });
    useAppStore.getState().addToast({ type: 'info', message: 'Logged out successfully' });
  };

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <Film size={24} color="white" />
        </div>
        <span className="logo-text">AMKYAWDEV RECAP</span>
      </div>

      <div className="header-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {user && !user.isGuest && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 10px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem'
          }}>
            <User size={14} />
            <span style={{ display: 'none' }}>{user.name || user.email?.split('@')[0]}</span>
          </div>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => setActivePanel('settings')}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <Settings size={16} />
          <span style={{ display: 'inline' }}>Settings</span>
        </button>
        
        <button 
          className="btn btn-primary"
          disabled={!videoFile || processingStatus !== 'idle'}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </header>
  );
}
