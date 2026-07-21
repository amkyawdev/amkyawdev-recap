import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ShieldAlert, ChevronDown, Mail, Globe } from 'lucide-react';
import { chatWithAI, SYSTEM_PROMPTS } from '../utils/aiService';
import useAppStore from '../store/useAppStore';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `👋 Welcome to AmkyawDev Recap!

I'm your AI assistant for video recap creation. Here's what I can help you with:

**Getting Started:**
1. Upload a video (MP4, MOV, AVI, WebM, MKV - up to 2GB)
2. Enter your API keys in Settings
3. Use AI tools to analyze, generate scripts, and create voiceovers

**AI Features:**
• Gemini AI - Video scene analysis
• OpenAI - Script generation  
• ElevenLabs - Natural voiceover
• Whisper - Audio transcription

Ask me anything about movie editing or the app features!`
};

// Simple markdown parser
const parseMarkdown = (text) => {
  let result = text;
  // Bold
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  result = result.replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
  // Line breaks
  result = result.replace(/\n/g, '<br/>');
  return result;
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  const apiKeys = useAppStore(state => state.apiKeys);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAnimating && displayedText) {
      scrollToBottom();
    }
  }, [displayedText, isAnimating]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const animateText = (text, callback) => {
    setIsAnimating(true);
    setDisplayedText('');
    let index = 0;
    const speed = 15; // ms per character
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        if (callback) callback();
      }
    }, speed);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);
    
    try {
      // Use AI service for chat
      const allMessages = [...messages, userMessage];
      const responseText = await chatWithAI(
        allMessages,
        apiKeys.openai,
        (progress) => console.log('Chat progress:', progress)
      );
      
      setIsTyping(false);
      
      // Animate the response text
      const assistantMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, assistantMessage]);
      animateText(responseText);
      
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      setError(err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or check your API key settings.' 
      }]);
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
    } else if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('developer')) {
      return "📧 **Contact Developer**\n\nClick the contact button below to get in touch!";
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
          width: '400px',
          height: '550px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
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
            <button
              onClick={() => setShowContact(!showContact)}
              style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Mail size={14} />
              Contact
            </button>
          </div>

          {/* Contact Section */}
          {showContact && (
            <div style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.95)',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              animation: 'slideDown 0.3s ease'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#000000', fontSize: '0.9rem' }}>📬 Contact Developer</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href="mailto:contact@amkyawdev.com" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', background: 'white',
                  borderRadius: '8px', color: '#000000',
                  textDecoration: 'none', fontSize: '0.8rem',
                  border: '1px solid rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }}>
                  <Mail size={14} /> Email
                </a>
                <a href="https://github.com/amkyawdev" target="_blank" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', background: 'white',
                  borderRadius: '8px', color: '#000000',
                  textDecoration: 'none', fontSize: '0.8rem',
                  border: '1px solid rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
                <a href="https://amkyawdev.com" target="_blank" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', background: 'white',
                  borderRadius: '8px', color: '#000000',
                  textDecoration: 'none', fontSize: '0.8rem',
                  border: '1px solid rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }}>
                  <Globe size={14} /> Website
                </a>
              </div>
            </div>
          )}

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}
          >
            {messages.map((msg, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  background: msg.role === 'assistant' ? 'rgba(255,255,255,0.9)' : 'var(--accent-primary)',
                  color: msg.role === 'assistant' ? '#000000' : 'white',
                  alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Thinking indicator */}
                {msg.role === 'assistant' && i === messages.length - 1 && isAnimating && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666666',
                    marginBottom: '8px',
                    padding: '4px 8px',
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: '4px',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <think>thinking...</think>
                  </div>
                )}
                <div 
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.role === 'assistant' && i === messages.length - 1 && isAnimating ? displayedText : msg.content) }}
                  style={{ whiteSpace: 'pre-wrap', color: '#000000' }}
                />
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.9)',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#666666' }}>thinking...</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ animation: 'bounce 1s infinite', fontSize: '1rem', color: '#000' }}>•</span>
                  <span style={{ animation: 'bounce 1s infinite 0.2s', fontSize: '1rem', color: '#000' }}>•</span>
                  <span style={{ animation: 'bounce 1s infinite 0.4s', fontSize: '1rem', color: '#000' }}>•</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            
            {/* Scroll to bottom button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: 'absolute',
                  bottom: '80px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <ChevronDown size={18} color="#000" />
              </button>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.95)'
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
                border: '1px solid rgba(0,0,0,0.2)',
                background: 'white',
                color: '#000000',
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
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
        think {
          font-family: monospace;
          color: var(--accent-secondary);
        }
      `}</style>
    </>
  );
}
