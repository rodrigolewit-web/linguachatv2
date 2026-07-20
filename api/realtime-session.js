export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { system, voice } = req.body;
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: voice || 'alloy',
        instructions: system,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700
        }
      })
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}
