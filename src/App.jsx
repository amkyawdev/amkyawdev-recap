import { useState } from 'react';
import { Film } from 'lucide-react';
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
import './index.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
