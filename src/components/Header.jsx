import { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Auth from './Auth';

export default function Header({ onExport }) {
  const { setActivePanel, videoFile, processingStatus } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.isLoggedIn && !parsedUser.isGuest) {
        setUser(parsedUser);
      }
    }
    
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
          localStorage.removeItem('user');
          setUser(null);
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
        {!user ? (
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => openAuth('login')}
              title="Login"
              style={{ padding: '8px 12px' }}
            >
              <i className="bi bi-box-arrow-in-right"></i>
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => openAuth('register')}
              title="Register"
              style={{ padding: '8px 12px' }}
            >
              <i className="bi bi-person-plus"></i>
            </button>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 10px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem'
          }}>
            <i className="bi bi-person-circle" style={{ fontSize: '18px' }}></i>
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
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => setActivePanel('settings')}
          title="Settings"
          style={{ padding: '8px 12px' }}
        >
          <i className="bi bi-gear"></i>
        </button>
        
        <button 
          className="btn btn-primary"
          disabled={!videoFile || !user}
          onClick={onExport}
          title="Export"
          style={{ padding: '8px 12px' }}
        >
          <i className="bi bi-download"></i>
        </button>
      </div>

      {showAuth && <Auth mode={authMode} onClose={() => setShowAuth(false)} onModeChange={setAuthMode} />}
    </header>
  );
}
