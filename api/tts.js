const VOICE_ID = 'iJE6v4eo6I08m5mH67Ss';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const text = req.body?.text;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  const apiKey = (process.env.ELEVENLABS_KEY || '').replace(/^﻿/, '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ELEVENLABS_KEY not configured' });

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`ElevenLabs ${response.status}:`, err);
      return res.status(response.status).json({ error: err });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');

    const chunks = [];
    for await (const chunk of response.body) {
      chunks.push(chunk);
    }
    return res.send(Buffer.concat(chunks));
  } catch (err) {
    console.error('TTS fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
