export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const groq = !!process.env.GROQ_API_KEY;
  const gemini = !!process.env.GEMINI_API_KEY;
  const supabase = !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_ANON_KEY;

  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      groq: groq ? 'configured' : 'missing',
      gemini: gemini ? 'configured' : 'missing',
      supabase: supabase ? 'configured' : 'missing'
    }
  });
}
