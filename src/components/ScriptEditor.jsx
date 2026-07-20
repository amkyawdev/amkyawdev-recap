import { FileText, Save } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function ScriptEditor() {
  const { script, setScript, videoFile, addToast } = useAppStore();

  const handleSave = () => {
    if (script) {
      localStorage.setItem('cinecap_script', script);
      addToast({ type: 'success', message: 'Script saved successfully!' });
    }
  };

  if (!videoFile) {
    return null;
  }

  return (
    <div className="script-editor fade-in">
      <div className="script-header">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} />
          Script Editor
        </h3>
        <button className="btn btn-secondary" onClick={handleSave}>
          <Save size={16} />
          Save
        </button>
      </div>
      
      <textarea
        className="script-textarea"
        placeholder="AI-generated script will appear here... You can also write your own narration script.

Tips:
• Write in present tense for dynamic narration
• Keep sentences concise (10-15 words)
• Include emotional descriptions
• Add scene transitions naturally"
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />
      
      <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Character count: {script.length}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          |
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Est. narration time: {Math.ceil(script.split(' ').length / 150)} min
        </span>
      </div>
    </div>
  );
}
