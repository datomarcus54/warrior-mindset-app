exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { prompt, jsonMode } = JSON.parse(event.body || '{}');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
    }
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {}
        })
      }
    );
    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'Gemini API failed', detail: errText }) };
    }
    const data = await geminiRes.json();
    const plan = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', detail: error.message }) };
  }
};
