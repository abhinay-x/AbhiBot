import express from 'express';

const router = express.Router();

// POST /api/ai/deepseek/chat
router.post('/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model = process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      temperature = 0.7,
      stream = true,
      ...rest
    } = req.body || {};

    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DeepSeek API key is not configured on the server.' });
    }

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream,
        ...rest,
      }),
    });

    if (!stream) {
      const json = await upstream.json();
      return res.status(upstream.ok ? 200 : upstream.status).json(json);
    }

    // Stream response passthrough
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      res.write(`data: ${JSON.stringify({ error: text || 'Upstream error' })}\n\n`);
      return res.end();
    }

    upstream.body.on('data', (chunk) => {
      res.write(chunk);
    });
    upstream.body.on('end', () => {
      res.end();
    });
    upstream.body.on('error', (err) => {
      console.error('DeepSeek stream error:', err);
      try {
        res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      } catch (_) {}
      res.end();
    });
  } catch (err) {
    console.error('DeepSeek route error:', err);
    res.status(500).json({ error: 'DeepSeek request failed' });
  }
});

export default router;
