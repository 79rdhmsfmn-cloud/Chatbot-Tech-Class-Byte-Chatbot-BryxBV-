// Groq's chat API is OpenAI-compatible, so this is a single plain `fetch`
// call — no SDK, no extra dependency. Docs: https://console.groq.com/docs
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// A fast, currently-available model on Groq's free tier (~1,000 tokens/sec
// on their LPU hardware). Groq does retire models from time to time (it
// happened to a previous default in August 2026) — if this one ever stops
// working, set GROQ_MODEL in your environment instead of editing code.
// Current models: https://console.groq.com/docs/models
const DEFAULT_MODEL = 'openai/gpt-oss-20b';

// Only the most recent turns are sent to keep requests small and fast.
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 4000;
const DEFAULT_SYSTEM_PROMPT =
    'You are Byte, a friendly, concise AI companion. Keep answers short by default, use simple language, and only go into detail if the user asks for it.';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const { messages, systemPrompt, prompt } = req.body || {};

        // Accept either the new `messages` (conversation history) shape, or the
        // older single `prompt` string, so nothing that already worked breaks.
        const conversation = Array.isArray(messages) && messages.length > 0
            ? messages
            : (prompt ? [{ role: 'user', content: prompt }] : null);

        if (!conversation) {
            return res.status(400).json({ message: 'A message is required' });
        }

        const lastMessage = conversation[conversation.length - 1];
        if (!lastMessage?.content || !String(lastMessage.content).trim()) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error('GROQ_API_KEY is missing');
            return res.status(500).json({
                message: 'Groq API key not found. Please add GROQ_API_KEY in your Vercel Environment Variables.'
            });
        }

        const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

        // Keep only the most recent messages, trimmed, so the request stays fast
        // and cheap — no need for a large context window for casual chat.
        const recentHistory = conversation
            .slice(-MAX_HISTORY_MESSAGES)
            .map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH),
            }));

        const chatMessages = [
            {
                role: 'system',
                content: systemPrompt && String(systemPrompt).trim()
                    ? String(systemPrompt).trim()
                    : DEFAULT_SYSTEM_PROMPT,
            },
            ...recentHistory,
        ];

        const groqResponse = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: chatMessages,
                max_tokens: 400,
            }),
        });

        if (!groqResponse.ok) {
            const errorBody = await groqResponse.text().catch(() => '');
            console.error(`Groq API error (${groqResponse.status}):`, errorBody);

            if (groqResponse.status === 429) {
                return res.status(429).json({ message: 'Rate limit reached' });
            }
            return res.status(500).json({ message: 'Failed to generate response' });
        }

        const data = await groqResponse.json();
        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error('Empty response from model');
        }

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Groq:', error);
        return res.status(500).json({ message: 'Failed to generate response' });
    }
}
