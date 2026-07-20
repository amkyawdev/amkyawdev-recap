import { useState, useEffect } from 'react';
import { Film, Settings, Download, User, LogOut, Shield, LogIn, UserPlus, KeyRound } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Auth from './Auth';

export default function Header() {
  const { setActivePanel, videoFile, processingStatus, setApiKey, addToast } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Listen for Firebase auth state changes
    if (typeof firebase !== 'undefined') {
      firebase.auth().onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isLoggedIn: true
          };
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } else {
          // Don't clear if localStorage user is guest or exists
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.isGuest) {
              setUser(parsed);
            }
          }
        }
      });
    }
  }, []);

  const handleLogout = () => {
    if (typeof firebase !== 'undefined') {
      firebase.auth().signOut();
    }
    localStorage.removeItem('user');
    setUser(null);
    ['gemini', 'openai', 'elevenlabs', 'whisper'].forEach(key => {
      setApiKey(key, '');
    });
    addToast({ type: 'info', message: 'Logged out successfully' });
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
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
        {!user && (
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => openAuth('login')}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => openAuth('register')}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <UserPlus size={16} />
              <span>Register</span>
            </button>
          </>
        )}
        
        {user && (
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
            <span>{user.name || user.email?.split('@')[0]}</span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => setActivePanel('settings')}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <Settings size={16} />
          <span>Settings</span>
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

      {showAuth && <Auth mode={authMode} onClose={() => setShowAuth(false)} onModeChange={setAuthMode} />}
    </header>
  );
}
