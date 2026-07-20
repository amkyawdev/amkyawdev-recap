import { useState, useEffect } from 'react';
import { Film, Settings, Download, User, LogOut } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Header() {
  const { setActivePanel, videoFile, processingStatus } = useAppStore();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.isLoggedIn) {
        setUser(parsedUser);
      }
    }
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <Film size={24} color="white" />
        </div>
        <span className="logo-text">AMKYAWDEV RECAP</span>
      </div>

      <div className="header-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
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
    </header>
  );
}
