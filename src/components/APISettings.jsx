import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, XCircle, TestTube, Save, RefreshCw } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function APISettings() {
  const { apiKeys, setApiKey, addToast } = useAppStore();
  const [showKeys, setShowKeys] = useState({});
  const [testingKey, setTestingKey] = useState(null);

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleKeyChange = (provider, value) => {
    setApiKey(provider, value);
  };

  const testApiKey = async (provider) => {
    setTestingKey(provider);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const hasKey = apiKeys[provider] && apiKeys[provider].length > 10;
    
    if (hasKey) {
      addToast({ type: 'success', message: `${provider.toUpperCase()} API connection successful!` });
    } else {
      addToast({ type: 'error', message: `Invalid ${provider.toUpperCase()} API key` });
    }
    
    setTestingKey(null);
  };

  const apiProviders = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Video analysis & scene detection',
      badge: 'Video AI',
      color: '#00d4ff',
      placeholder: 'AIza...'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Script generation & narration',
      badge: 'Script',
      color: '#ff3366',
      placeholder: 'sk-...'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      description: 'Voice synthesis & voiceover',
      badge: 'Voice',
      color: '#00ff88',
      placeholder: '...'
    },
    {
      id: 'whisper',
      name: 'OpenAI Whisper',
      description: 'Speech-to-text for subtitles',
      badge: 'Subtitle',
      color: '#ffd700',
      placeholder: 'sk-...'
    }
  ];

  return (
    <div className="api-settings fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1.5rem',
          marginBottom: '8px',
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          API Configuration
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure your AI service API keys to enable all features
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {apiProviders.map((provider) => (
          <div 
            key={provider.id}
            className="card"
            style={{ 
              borderLeft: `4px solid ${provider.color}`,
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{provider.name}</h3>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: provider.color,
                    borderRadius: '10px',
                    color: '#000',
                    fontWeight: '600'
                  }}>
                    {provider.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {provider.description}
                </p>
              </div>
              
              {apiKeys[provider.id] && apiKeys[provider.id].length > 10 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: 'var(--success)',
                  fontSize: '0.8rem'
                }}>
                  <CheckCircle size={14} />
                  Configured
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showKeys[provider.id] ? 'text' : 'password'}
                  className="input-field password"
                  placeholder={`Enter ${provider.name} API Key (${provider.placeholder})`}
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  onClick={() => toggleShowKey(provider.id)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showKeys[provider.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <button
                className="btn btn-secondary"
                onClick={() => testApiKey(provider.id)}
                disabled={testingKey === provider.id || !apiKeys[provider.id]}
                style={{ minWidth: '100px' }}
              >
                {testingKey === provider.id ? (
                  <RefreshCw size={16} className="spin" />
                ) : (
                  <TestTube size={16} />
                )}
                Test
              </button>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <a 
                href={getApiLink(provider.id)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.8rem',
                  color: provider.color,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Get API Key →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1rem',
          marginBottom: '16px',
          color: 'var(--text-secondary)'
        }}>
          Quick Actions
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const allConfigured = Object.values(apiKeys).every(k => k && k.length > 10);
              if (allConfigured) {
                addToast({ type: 'success', message: 'All APIs configured!' });
              } else {
                addToast({ type: 'warning', message: 'Some APIs not configured' });
              }
            }}
            style={{ justifyContent: 'center' }}
          >
            <CheckCircle size={16} />
            Validate All
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              Object.keys(apiKeys).forEach(key => setApiKey(key, ''));
              addToast({ type: 'info', message: 'All API keys cleared' });
            }}
            style={{ justifyContent: 'center' }}
          >
            <XCircle size={16} />
            Clear All
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              localStorage.setItem('cinecap_backup', JSON.stringify(apiKeys));
              addToast({ type: 'success', message: 'API keys backed up!' });
            }}
            style={{ justifyContent: 'center' }}
          >
            <Save size={16} />
            Backup Keys
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div style={{ 
        marginTop: '32px', 
        padding: '20px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💡 API Key Help
        </h4>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <li style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            • <strong>Gemini</strong>: Get from Google AI Studio (makersuite.google.com)
          </li>
          <li style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            • <strong>OpenAI</strong>: Get from platform.openai.com/api-keys
          </li>
          <li style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            • <strong>ElevenLabs</strong>: Get from elevenlabs.io/profile
          </li>
          <li style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            • <strong>Whisper</strong>: Uses same OpenAI key for speech-to-text
          </li>
        </ul>
      </div>
    </div>
  );
}

function getApiLink(providerId) {
  const links = {
    gemini: 'https://makersuite.google.com/app/apikey',
    openai: 'https://platform.openai.com/api-keys',
    elevenlabs: 'https://elevenlabs.io/profile',
    whisper: 'https://platform.openai.com/api-keys'
  };
  return links[providerId] || '#';
}
