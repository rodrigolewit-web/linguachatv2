export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { system, voice } = req.body;
    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          instructions: system,
          audio: {
            input: {
              transcription: { model: 'whisper-1' },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 700
              }
            },
            output: { voice: voice || 'marin' }
          }
        }
      })
    });
    const data = await r.json();
    if (!r.ok || data.error) return res.status(400).json({ error: data.error || { message: JSON.stringify(data) } });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}
