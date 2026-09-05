# Byte 🤖✨

Byte is a small, fast, friendly AI companion you can open on a phone, tablet, or desktop and just... ask stuff. It's built on **React (Vite)**, styled with a simplified dark-mode glassmorphism look, and powered by **Groq's** free, ultra-fast inference API.

This project started life as **AI-Hub** and keeps its architecture (React/Vite frontend, a single Vercel serverless function as the backend, `localStorage` for chat history) — it's been re-skinned and tightened up around one goal: a quick, casual chat experience, not a ChatGPT clone.

---

## ⚡ Key Features

- **Byte, a small AI companion:** friendly, concise, a little playful — short answers by default, more detail only if you ask.
- **Fast by design:** powered by [Groq](https://groq.com), which runs open models on custom LPU hardware at very high token-per-second speeds. A live "⚡ 0.42s" response-time badge shows exactly how fast each reply was.
- **Quick-action buttons:** *Learn Something*, *Surprise Me*, *Fun Fact*, *Quiz Me* — one tap sends a ready-made prompt. The main input is always there for anything else.
- **Conversation memory:** follow-up questions work — Byte sends your recent chat history (not just the last message) with each request.
- **Serverless backend:** a single Vercel function (`api/chat.js`) calls Groq's API server-side, so your API key never reaches the browser.
- **Chat history in your browser:** conversations are saved to `localStorage`, survive a refresh (including which chat was open), and can be deleted individually or all at once.
- **Profile & settings:** pick a display name and emoji avatar, and optionally tweak Byte's system prompt — no login required, works instantly.
- **Mobile-first:** collapsible sidebar, large tap targets, no horizontal scroll, and layout fixes so the on-screen keyboard doesn't break the chat.
- **Graceful errors:** network issues, rate limits, and missing config all show a friendly in-chat message instead of a raw error; full details still land in the browser/server console for developers.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Vanilla CSS (CSS variables, Flexbox, keyframe animations) — no CSS framework
- **Backend / Hosting:** Vercel Serverless Functions
- **AI:** [Groq API](https://console.groq.com/docs) (OpenAI-compatible REST endpoint, called with a plain `fetch` — no extra SDK), default model `openai/gpt-oss-20b`
- **State:** React `useState`/`useEffect` with `localStorage` persistence — no database

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/shettyprasad-git/AI-Hub.git
cd AI-Hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Get a free Groq API key
Sign up at [console.groq.com](https://console.groq.com) (no credit card required) and create an API key.

### 4. Add environment variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY="gsk_your_generated_key_here"

# Optional — override the default model if you want to try another one,
# or if Groq retires the current default. See console.groq.com/docs/models
# GROQ_MODEL="openai/gpt-oss-20b"
```

### 5. Run it
```bash
npm run dev
```
This starts the Vite dev server. The `/api/chat` serverless function needs Vercel's dev runtime to work locally — the easiest way is:
```bash
npx vercel dev
```
which serves both the frontend and the API function together (matching how it runs in production).

---

## ☁️ Deployment (Vercel)

1. Import the GitHub repo into Vercel.
2. In **Project Settings → Environment Variables**, add `GROQ_API_KEY` (and optionally `GROQ_MODEL`).
3. Deploy. Vercel builds the Vite app and deploys `api/chat.js` as a serverless function automatically — `vercel.json` is already set up for this.

---

## ⚠️ Limitations of the free AI service

Groq's free tier is genuinely free (no credit card, no spend-based credits) but it **is rate-limited**, and those limits are shared across everyone using this deployment's API key. As of when this was set up, the default model (`openai/gpt-oss-20b`) allows roughly:

- 30 requests per minute
- 1,000 requests per day
- 8,000 tokens per minute / 200,000 tokens per day

If you hit a limit, Byte will show a friendly "rate-limited, try again in a moment" message rather than crashing. These numbers are set by Groq and can change — check [console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits) for current values.

Groq also periodically retires older models in favor of newer/faster ones (this has already happened once, in August 2026). If Byte suddenly stops responding and the server logs mention a model error, the model has likely been retired — check [console.groq.com/docs/models](https://console.groq.com/docs/models) for the current list and set `GROQ_MODEL` in your environment to the replacement. No code changes needed.

This project intentionally does not add a paid fallback — if the free tier's limits don't work for your use case, that's a deliberate tradeoff to keep this project free to run.

---

*A small, fast AI buddy you can open on your phone and casually ask things.*
