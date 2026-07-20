import { useState } from 'react';
import { X, Send, Bot, ShieldAlert, AlertCircle } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `👋 Hi! I'm your AmkyawDev Recap assistant powered by Zhipu AI.

I can help you with:
• Video editing features
• AI tools (Gemini, OpenAI, Whisper, ElevenLabs)
• Video processing & export
• Troubleshooting

Ask me anything about movie editing!`
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else if (data.fallbackMessage) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.fallbackMessage }]);
        if (data.error) {
          setError(data.error);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      // Fallback to keyword-based responses
      const response = getKeywordResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getKeywordResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('api') && (lowerInput.includes('key') || lowerInput.includes('secret') || lowerInput.includes('token'))) {
      return "🔒 I'm designed not to discuss or reveal any API keys, tokens, or secrets. This is for security reasons.";
    } else if (lowerInput.includes('gemini')) {
      return "🤖 **Gemini AI** helps analyze your video to detect scenes and key moments.\n\nTo use: Upload a video → Go to AI Tools → Click 'Analyze (Gemini)'";
    } else if (lowerInput.includes('whisper') || (lowerInput.includes('subtitle') && lowerInput.includes('auto'))) {
      return "🎤 **Whisper AI** transcribes spoken content from your video.\n\nSteps:\n1. Upload video\n2. Go to AI Tools\n3. Click 'Transcribe (Whisper)'";
    } else if (lowerInput.includes('elevenlabs') || lowerInput.includes('voice') || lowerInput.includes('voiceover')) {
      return "🎙️ **ElevenLabs** creates natural-sounding voiceovers from your script.\n\nTip: Generate script first → Click 'Voiceover'";
    } else if (lowerInput.includes('openai') || lowerInput.includes('script') || lowerInput.includes('narration')) {
      return "✍️ **OpenAI** generates engaging narration scripts for your movie recap.\n\nTip: Edit the generated script before creating voiceover.";
    } else if (lowerInput.includes('export') || lowerInput.includes('render') || lowerInput.includes('save')) {
      return "📤 **Export Settings**:\n\n• Resolution: 720p, 1080p, 4K\n• Quality: Low, Medium, High\n• Format: MP4, WebM";
    } else if (lowerInput.includes('trim') || lowerInput.includes('split') || lowerInput.includes('cut')) {
      return "✂️ **Editing Tools**:\n\n• Trim - Adjust clip length\n• Split - Divide at specific points\n• Crop - Remove edges";
    } else {
      return "🤖 I'm specifically designed to help with AmkyawDev Recap movie editing features. Please ask something related to movie editing!";
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255, 51, 102, 0.4)',
          zIndex: 1000,
          transition: 'transform 0.3s, box-shadow 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(255, 51, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 51, 102, 0.4)';
        }}
      >
        {isOpen ? (
          <X size={28} color="white" />
        ) : (
          <Bot size={28} color="white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          maxHeight: '500px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Bot size={24} color="white" />
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>AI Assistant</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                {error ? '⚠️ Zhipu AI Unavailable' : '✨ Powered by Zhipu AI'}
              </p>
            </div>
            <ShieldAlert 
              size={20} 
              color="rgba(255,255,255,0.8)" 
              style={{ marginLeft: 'auto', cursor: 'help' }}
              title="Powered by Zhipu AI (glm-4-flash). Only helps with AmkyawDev Recap features."
            />
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  background: msg.role === 'assistant' ? 'var(--bg-elevated)' : 'var(--accent-primary)',
                  color: 'white',
                  alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--bg-elevated)',
                alignSelf: 'flex-start',
                display: 'flex',
                gap: '4px'
              }}>
                <span style={{ animation: 'bounce 1s infinite', fontSize: '1.2rem' }}>•</span>
                <span style={{ animation: 'bounce 1s infinite 0.2s', fontSize: '1.2rem' }}>•</span>
                <span style={{ animation: 'bounce 1s infinite 0.4s', fontSize: '1.2rem' }}>•</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about video editing..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: input.trim() ? 1 : 0.5
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
