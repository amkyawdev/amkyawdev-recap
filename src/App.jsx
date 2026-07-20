import { useState, useEffect } from 'react';
import { Film, Shield } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoPreview from './components/VideoPreview';
import Timeline from './components/Timeline';
import ScriptEditor from './components/ScriptEditor';
import SubtitleEditor from './components/SubtitleEditor';
import ProcessingModal from './components/ProcessingModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Auth from './components/Auth';
import './index.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isLoggedIn && !parsedUser.isGuest) {
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      }
      
      // Listen for Firebase auth
      if (typeof firebase !== 'undefined' && firebase.auth) {
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
            setShowAuth(true);
          }
          setLoading(false);
        });
      } else {
        // Firebase not loaded, show auth
        setShowAuth(true);
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Film size={48} color="var(--accent-primary)" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        {showAuth && <Auth mode={authMode} onClose={() => {}} onModeChange={setAuthMode} />}
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <div className="main-layout">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="workspace" style={{
          marginLeft: sidebarCollapsed ? '0' : '0',
          transition: 'margin-left 0.3s ease'
        }}>
          <VideoPreview />
          <Timeline />
          <ScriptEditor />
          <SubtitleEditor />
        </main>
      </div>
      
      <Footer />
      <ProcessingModal />
      <ToastContainer />
      <AIAssistant />
    </div>
  );
}

export default App;
