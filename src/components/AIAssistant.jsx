import { useState } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ShieldAlert } from 'lucide-react';

const SYSTEM_PROMPT = `You are an AI assistant for AmkyawDev Recap - an AI-powered movie recap generator.

You can ONLY help with:
- Video editing features and tools
- Using Gemini AI for video analysis
- Using OpenAI for script generation
- Using Whisper AI for subtitle transcription
- Using ElevenLabs for voiceover
- FFmpeg video rendering and export
- Troubleshooting video processing issues
- Explaining movie recap creation workflow

You CANNOT help with:
- Revealing API keys or secrets
- Answering questions unrelated to this app
- Providing code for other applications
- General programming questions outside this project

If asked about API keys or secrets, respond: "I'm designed not to discuss or reveal any API keys, tokens, or secrets. This is for security reasons."

If asked unrelated questions, respond: "I'm specifically designed to help with AmkyawDev Recap movie editing features. I can't help with other topics."`;

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your AmkyawDev Recap assistant. I can help you with:\n\n• Video editing features\n• AI tools (Gemini, OpenAI, Whisper, ElevenLabs)\n• Video processing & export\n• Troubleshooting\n\nNote: I can only help with this app\'s features. I cannot reveal API keys or answer unrelated questions.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = '';
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('api') && (lowerInput.includes('key') || lowerInput.includes('secret') || lowerInput.includes('token'))) {
        response = "🔒 I'm designed not to discuss or reveal any API keys, tokens, or secrets. This is for security reasons. API keys are stored locally in your browser.";
      } else if (lowerInput.includes('gemini')) {
        response = "🤖 **Gemini AI** helps analyze your video to detect scenes and key moments. It automatically identifies:\n\n• Scene transitions\n• Important plot points\n• Character appearances\n• Emotional moments\n\nTo use: Upload a video → Go to AI Tools → Click 'Analyze (Gemini)'";
      } else if (lowerInput.includes('whisper') || (lowerInput.includes('subtitle') && lowerInput.includes('auto'))) {
        response = "🎤 **Whisper AI** transcribes spoken content from your video to create auto-generated subtitles.\n\nSteps:\n1. Upload video\n2. Go to AI Tools\n3. Click 'Transcribe (Whisper)'\n4. Subtitles will be generated automatically";
      } else if (lowerInput.includes('elevenlabs') || lowerInput.includes('voice') || lowerInput.includes('voiceover')) {
        response = "🎙️ **ElevenLabs** creates natural-sounding voiceovers from your script.\n\nOptions:\n• Choose from 6 different voices\n• Male and female voices available\n• Adjust playback speed (0.25x - 2x)\n\nTo use: Generate script first → Click 'Voiceover'";
      } else if (lowerInput.includes('openai') || lowerInput.includes('script') || lowerInput.includes('narration')) {
        response = "✍️ **OpenAI** generates engaging narration scripts for your movie recap.\n\nFeatures:\n• Multiple script styles\n• Automatic pacing\n• Scene descriptions included\n\nTip: Edit the generated script before creating voiceover.";
      } else if (lowerInput.includes('export') || lowerInput.includes('render') || lowerInput.includes('save')) {
        response = "📤 **Export Settings** allow you to customize output:\n\n• Resolution: 720p, 1080p, 4K\n• Quality: Low, Medium, High\n• Format: MP4, WebM\n\nInclude subtitles and voiceover options available.";
      } else if (lowerInput.includes('trim') || lowerInput.includes('split') || lowerInput.includes('cut')) {
        response = "✂️ **Editing Tools** available:\n\n• Trim - Adjust clip length\n• Split - Divide at specific points\n• Crop - Remove edges\n• Rotate - 90° rotation\n• Flip - Mirror horizontal\n\nAccess from the Editor tab in sidebar.";
      } else if (lowerInput.includes('effect') || lowerInput.includes('fade') || lowerInput.includes('blur')) {
        response = "✨ **Video Effects** available:\n\n• Fade In/Out\n• Blur\n• Brightness\n• Contrast\n• Saturation\n• Sepia\n• Grayscale\n\nClick effects in the Editor tab to apply.";
      } else {
        response = "🤖 I'm specifically designed to help with AmkyawDev Recap movie editing features. I can help you with:\n\n• AI tools (Gemini, OpenAI, Whisper, ElevenLabs)\n• Video editing (trim, split, crop, effects)\n• Export settings\n• Troubleshooting issues\n\nPlease ask something related to movie editing!";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
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
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Movie Recap Help Only</p>
            </div>
            <ShieldAlert 
              size={20} 
              color="rgba(255,255,255,0.8)" 
              style={{ marginLeft: 'auto', cursor: 'help' }}
              title="This bot only helps with AmkyawDev Recap features. It cannot reveal API keys or answer unrelated questions."
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
