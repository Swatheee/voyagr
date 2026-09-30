export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, destination, interests = [] } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallback =
      "I’d suggest a balanced route with a little room for slow travel and local flavour. Keep your stay walkable and save a little extra for slower evenings and good local food.";

    return res.json({ reply: fallback });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful travel planner for a trip planning app. Give concise, warm, practical advice. Keep responses under 180 words.',
          },
          {
            role: 'user',
            content: `Destination: ${destination || 'not specified'}; interests: ${(interests || []).join(', ') || 'general travel'}; question: ${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'OpenAI request failed');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return res.json({ reply: reply || 'I can help with that trip idea too.' });
  } catch (error) {
    return res.status(500).json({
      reply:
        'I can still help practically: choose one anchor destination, keep your stay walkable, and leave a little room for spontaneous local meals and slow evenings.',
      error: error.message,
    });
  }
}
