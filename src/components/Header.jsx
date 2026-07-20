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

      <div className="header-actions">
        {user && !user.isGuest && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginRight: '12px',
            padding: '8px 12px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem'
          }}>
            <User size={16} />
            <span>{user.name || user.email?.split('@')[0]}</span>
          </div>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => setActivePanel('settings')}
        >
          <Settings size={18} />
          API Settings
        </button>
        
        {user ? (
          <button 
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ color: 'var(--error)' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAuth(true)}
          >
            <Shield size={18} />
            Login
          </button>
        )}
        
        <button 
          className="btn btn-primary"
          disabled={!videoFile || processingStatus !== 'idle'}
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </header>
  );
}
