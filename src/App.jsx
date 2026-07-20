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
import './index.css';

function App() {
  return (
    <div className="app">
      <Header />
      
      <div className="main-layout">
        <Sidebar />
        
        <main className="workspace">
          <VideoPreview />
          <Timeline />
          <ScriptEditor />
          <SubtitleEditor />
        </main>
      </div>
      
      <Footer />
      <ProcessingModal />
      <ToastContainer />
    </div>
  );
}

export default App;
