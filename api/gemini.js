export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, systemPrompt, temperature = 0.7, max_tokens = 1024 } = req.body || {};

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return res.status(500).json({
      error: 'No AI API keys configured on server. Please set GROQ_API_KEY or use client-side key in Settings.'
    });
  }

  // 1. Primary: Groq Llama 3.3 70B
  if (groqKey) {
    try {
      const fullMessages = [];
      if (systemPrompt) {
        fullMessages.push({ role: 'system', content: systemPrompt });
      }
      if (Array.isArray(messages)) {
        fullMessages.push(...messages);
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: fullMessages,
          temperature,
          max_tokens
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ reply, model: 'llama-3.3-70b-versatile', provider: 'groq' });
    } catch (err) {
      console.error('Groq proxy error:', err);
      // Fall through to Gemini if available
      if (!geminiKey) {
        return res.status(502).json({ error: err.message });
      }
    }
  }

  // 2. Fallback: Google Gemini
  if (geminiKey) {
    try {
      const contents = (messages || []).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const body = {
        contents,
        generationConfig: { temperature, maxOutputTokens: max_tokens }
      };
      if (systemPrompt) {
        body.systemInstruction = { parts: [{ text: systemPrompt }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.status(200).json({ reply, model: 'gemini-1.5-flash', provider: 'gemini' });
    } catch (err) {
      console.error('Gemini proxy error:', err);
      return res.status(502).json({ error: err.message });
    }
  }
}
