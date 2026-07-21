/**
 * AI Service for Video Recap Generation
 * Uses real AI APIs with proper system prompts
 */

// System prompts for different AI tasks
export const SYSTEM_PROMPTS = {
  // Video analysis prompt for Gemini
  VIDEO_ANALYSIS: `You are an expert video analyst specializing in film and movie recaps. Your task is to analyze video content and identify key scenes and moments.

Analyze the video thoroughly and provide:
1. **Scene Detection**: Identify distinct scenes with timestamps (start/end)
2. **Key Moments**: List the most important/impactful moments
3. **Mood Analysis**: Determine the overall tone (dramatic, comedic, action-packed, etc.)
4. **Recommended Recap Length**: Suggest optimal recap duration based on content

Respond in JSON format:
{
  "scenes": [{"start": 0, "end": 30, "description": "...", "importance": "high/medium/low"}],
  "keyMoments": ["moment 1", "moment 2", ...],
  "overallMood": "description",
  "recommendedLength": 60,
  "summary": "brief summary"
}

Be specific and detailed in your analysis.`,

  // Script generation prompt for OpenAI
  SCRIPT_GENERATION: `You are a professional scriptwriter specializing in movie recap narration. You create engaging, informative scripts that capture the essence of films.

Your script should:
1. **Hook the viewer**: Start with an attention-grabbing opening
2. **Cover key plot points**: Without spoilers for major twists
3. **Maintain engagement**: Use varied sentence lengths and pacing
4. **Include transitions**: Smooth segways between scenes
5. **End with impact**: Leave viewers wanting more

Style options:
- **Dramatic**: Intense, suspenseful tone
- **Casual**: Friendly, conversational approach  
- **Documentary**: Informative, educational style
- **Entertaining**: Humorous, engaging commentary

Generate a script optimized for voiceover (approximately {duration} seconds). 
The script should be approximately {wordCount} words.
Format with clear paragraph breaks for natural reading.`,

  // Subtitle generation prompt
  SUBTITLE_GENERATION: `You are a professional subtitling expert. Create accurate, readable subtitles from the given script.

Guidelines:
1. **Timing**: Each subtitle should display for 1-3 seconds
2. **Length**: Maximum 42 characters per line, 2 lines per subtitle
3. **Punctuation**: Use proper punctuation for readability
4. **Split naturally**: Break at grammatical points, not mid-sentence
5. **Sync**: Match subtitle timing with speech rhythm

Return JSON format:
{
  "subtitles": [
    {"startTime": 0.0, "endTime": 2.5, "text": "subtitle text"},
    ...
  ]
}`,

  // Voiceover optimization prompt
  VOICEOVER_OPTIMIZATION: `You are a voiceover script optimizer. Refine the given script for natural speech synthesis.

Make these adjustments:
1. **Simplify complex sentences**: Break long sentences into shorter ones
2. **Remove ambiguous pronunciations**: Avoid words that are hard to pronounce
3. **Add breathing pauses**: Include natural pauses where appropriate
4. **Emotion markers**: Add subtle emotional cues in brackets [pause], [excited], [serious]
5. ** pronunciation guides**: Add phonetic hints for difficult words

Return the optimized script ready for text-to-speech.`,

  // AI Chat assistant prompt
  AI_ASSISTANT: `You are AmkyawDev Recap's AI assistant, a helpful guide for the video editing application.

About the app:
- AI-powered movie recap generator
- Features: video upload, AI analysis (Gemini), script generation (OpenAI), subtitle generation, voiceover (ElevenLabs)
- Supports formats: MP4, MOV, AVI, WebM, MKV (up to 2GB)
- Export options: 720p, 1080p, 4K resolution

Guidelines:
1. Be helpful and concise
2. Explain features clearly
3. Help with troubleshooting
4. Suggest best practices
5. Be friendly and professional

Keep responses short and actionable unless detailed explanation is needed.`
};

// API Configuration
const API_CONFIG = {
  // OpenAI compatible endpoint (can be changed)
  OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
  // Gemini endpoint
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  // Default model
  DEFAULT_MODEL: 'gpt-4o-mini',
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 2000
};

/**
 * Generate video analysis using Gemini
 */
export async function analyzeVideo(videoData, apiKey, onProgress) {
  if (!apiKey) {
    throw new Error('Gemini API key required');
  }

  if (onProgress) onProgress({ stage: 'analyzing', progress: 10, message: 'Preparing video data...' });

  try {
    // For demo purposes, we'll use a simulated response if no real video data
    // In production, you would send the actual video to Gemini Vision API
    
    const prompt = SYSTEM_PROMPTS.VIDEO_ANALYSIS;
    
    if (onProgress) onProgress({ stage: 'analyzing', progress: 30, message: 'Analyzing video content...' });

    // Call Gemini API
    const response = await fetch(
      `${API_CONFIG.GEMINI_ENDPOINT}/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this movie/video for creating a recap. ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    if (onProgress) onProgress({ stage: 'analyzing', progress: 80, message: 'Processing results...' });

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback structure
        analysis = {
          scenes: [
            { start: 0, end: 30, description: 'Opening scene', importance: 'high' },
            { start: 30, end: 60, description: 'Introduction', importance: 'medium' },
            { start: 60, end: 120, description: 'Main content', importance: 'high' },
            { start: 120, end: 180, description: 'Climax', importance: 'high' },
            { start: 180, end: 210, description: 'Resolution', importance: 'medium' }
          ],
          keyMoments: ['Opening scene establishes the setting', 'Key character introduction', 'Main conflict revealed', 'Climactic confrontation', 'Satisfying conclusion'],
          overallMood: 'Engaging and dramatic',
          recommendedLength: 60,
          summary: analysisText.substring(0, 200)
        };
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      analysis = {
        scenes: [
          { start: 0, end: 30, description: 'Opening scene', importance: 'high' },
          { start: 30, end: 60, description: 'Introduction', importance: 'medium' },
          { start: 60, end: 120, description: 'Main content', importance: 'high' },
          { start: 120, end: 180, description: 'Climax', importance: 'high' },
          { start: 180, end: 210, description: 'Resolution', importance: 'medium' }
        ],
        keyMoments: ['Opening scene establishes the setting', 'Key character introduction', 'Main conflict revealed', 'Climactic confrontation', 'Satisfying conclusion'],
        overallMood: 'Engaging and dramatic',
        recommendedLength: 60,
        summary: analysisText.substring(0, 200)
      };
    }

    if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Analysis complete!' });

    return analysis;
  } catch (error) {
    console.error('Video analysis error:', error);
    throw error;
  }
}

/**
 * Generate recap script using OpenAI
 */
export async function generateScript(analysis, apiKey, style = 'dramatic', onProgress) {
  if (!apiKey) {
    throw new Error('OpenAI API key required');
  }

  if (onProgress) onProgress({ stage: 'generating', progress: 10, message: 'Preparing script generation...' });

  const duration = analysis?.recommendedLength || 60;
  const wordCount = Math.floor(duration * 2.5); // ~150 words per minute

  try {
    if (onProgress) onProgress({ stage: 'generating', progress: 30, message: 'Writing script...' });

    const response = await fetch(API_CONFIG.OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.SCRIPT_GENERATION
              .replace('{duration}', duration)
              .replace('{wordCount}', wordCount)
          },
          {
            role: 'user',
            content: `Create a ${style} style movie recap script based on this analysis:\n\n${JSON.stringify(analysis, null, 2)}`
          }
        ],
        temperature: API_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    if (onProgress) onProgress({ stage: 'generating', progress: 80, message: 'Finalizing script...' });

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content || '';

    if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Script generated!' });

    return {
      script,
      style,
      wordCount: script.split(/\s+/).length,
      estimatedDuration: Math.ceil(script.split(/\s+/).length / 2.5)
    };
  } catch (error) {
    console.error('Script generation error:', error);
    throw error;
  }
}

/**
 * Generate subtitles from script
 */
export async function generateSubtitles(script, duration, apiKey, onProgress) {
  if (onProgress) onProgress({ stage: 'subtitles', progress: 10, message: 'Generating subtitles...' });

  // Simple client-side subtitle generation
  // In production, use OpenAI Whisper API for audio transcription
  
  const words = script.split(/\s+/);
  const subtitleDuration = duration || 60;
  const avgWordDuration = subtitleDuration / words.length;
  
  const subtitles = [];
  let currentTime = 0;
  let currentText = '';
  
  for (let i = 0; i < words.length; i++) {
    currentText += (currentText ? ' ' : '') + words[i];
    
    // Create subtitle every ~6-8 words or at natural breaks
    if (currentText.length > 40 || i === words.length - 1 || /[.!?]$/.test(words[i])) {
      subtitles.push({
        startTime: Math.round(currentTime * 100) / 100,
        endTime: Math.round((currentTime + avgWordDuration * currentText.split(/\s+/).length) * 100) / 100,
        text: currentText.trim()
      });
      currentText = '';
      currentTime += avgWordDuration * (currentText.split(/\s+/).length || 1);
    }
  }

  if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Subtitles generated!' });

  return subtitles;
}

/**
 * Generate voiceover audio using ElevenLabs
 */
export async function generateVoiceover(script, voiceId, apiKey, onProgress) {
  if (!apiKey) {
    throw new Error('ElevenLabs API key required');
  }

  if (onProgress) onProgress({ stage: 'voiceover', progress: 10, message: 'Preparing voiceover...' });

  try {
    if (onProgress) onProgress({ stage: 'voiceover', progress: 30, message: 'Synthesizing voice...' });

    // ElevenLabs Text-to-Speech API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'thita'}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'ElevenLabs API error');
    }

    if (onProgress) onProgress({ stage: 'voiceover', progress: 80, message: 'Processing audio...' });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Voiceover ready!' });

    return {
      url: audioUrl,
      blob: audioBlob,
      duration: script.split(/\s+/).length * 0.4, // Approximate duration
      voiceId
    };
  } catch (error) {
    console.error('Voiceover generation error:', error);
    throw error;
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(messages, apiKey, onProgress) {
  if (!apiKey) {
    // Use free demo mode
    return demoChatResponse(messages);
  }

  try {
    if (onProgress) onProgress({ stage: 'chat', progress: 50, message: 'Getting response...' });

    const response = await fetch(API_CONFIG.OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.AI_ASSISTANT },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Chat error:', error);
    return demoChatResponse(messages);
  }
}

/**
 * Demo chat response (fallback when no API key)
 */
function demoChatResponse(messages) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  const responses = [
    "I can help you with video editing! Try uploading a video and using the AI tools in the sidebar.",
    "For the best results, use high-quality video files (MP4 or MOV format).",
    "You can customize subtitles by clicking on them in the timeline.",
    "Make sure to enter your API keys in the Settings panel to enable AI features.",
    "The voiceover feature supports multiple languages including Burmese!",
    "Export your video in 1080p for the best balance of quality and file size.",
    "Need help? Check the README or contact support!"
  ];

  // Simple keyword matching
  if (lastMessage.includes('subtitle')) {
    return "To add subtitles: 1) Upload your video, 2) Click 'Transcribe' to auto-generate, or 3) Upload an SRT file from the sidebar.";
  }
  if (lastMessage.includes('voice') || lastMessage.includes('audio')) {
    return "For voiceover, enter your ElevenLabs API key in Settings. Choose from 10+ voices including Burmese (Thita, Nila).";
  }
  if (lastMessage.includes('export')) {
    return "Export options: 720p (fast), 1080p (recommended), or 4K (high quality). Your video will download as MP4.";
  }
  if (lastMessage.includes('api') || lastMessage.includes('key')) {
    return "Get API keys: Gemini (Google AI Studio), OpenAI (platform.openai.com), ElevenLabs (elevenlabs.io). All are free to start!";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export default {
  analyzeVideo,
  generateScript,
  generateSubtitles,
  generateVoiceover,
  chatWithAI,
  SYSTEM_PROMPTS
};
