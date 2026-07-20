import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function ProcessingModal() {
  const { processingStatus, processingProgress, processingStage } = useAppStore();

  if (processingStatus === 'idle') {
    return null;
  }

  const stageLabels = {
    analyzing: 'Analyzing Video',
    generating: 'Generating Content',
    rendering: 'Rendering Video'
  };

  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (processingProgress / 100) * circumference;

  return (
    <div className="processing-overlay">
      <div className="processing-modal">
        <div className="progress-ring">
          <svg width="120" height="120">
            <circle className="bg" cx="60" cy="60" r="50" />
            <circle 
              className="progress" 
              cx="60" 
              cy="60" 
              r="50"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="progress-text">{Math.round(processingProgress)}%</div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          {stageLabels[processingStatus] || 'Processing...'}
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {processingStage}
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          {['Analyzing', 'Scripting', 'Subtitles', 'Voice', 'Rendering'].map((step, i) => {
            const stepStatus = 
              (processingProgress >= (i + 1) * 20) ? 'done' :
              (processingProgress >= i * 20) ? 'active' : 'pending';
            
            return (
              <div
                key={step}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: stepStatus === 'done' ? 'var(--success)' :
                             stepStatus === 'active' ? 'var(--accent-primary)' :
                             'var(--border)'
                }}
              />
            );
          })}
        </div>

        <button 
          className="btn btn-secondary"
          style={{ marginTop: '24px' }}
          onClick={() => useAppStore.getState().setProcessingStatus('idle')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
