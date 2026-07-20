/**
 * Cloudflare Pages Function: Zhipu AI Chat API
 * Endpoint: /api/chat
 * 
 * Requires ZHIPU_AI_API_KEY secret in Cloudflare Pages settings
 */

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

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

export async function onRequest(context) {
  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await context.request.json();
    const apiKey = context.env.ZHIPU_AI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Zhipu AI API key not configured',
        fallback: true 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages array with system prompt
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'system')
    ];

    // Call Zhipu AI API
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zhipu API error:', response.status, errorText);
      throw new Error(`Zhipu API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 
      "I'm having trouble responding right now. Please try again.";

    return new Response(JSON.stringify({ 
      success: true, 
      message: assistantMessage 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get AI response',
      fallback: true,
      fallbackMessage: "🤖 I'm having trouble connecting to the AI service. Please check your ZHIPU_AI_API_KEY in Cloudflare Pages settings."
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
