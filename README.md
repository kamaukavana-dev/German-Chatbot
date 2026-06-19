# HANS — Learn German (Duolingo-style)

A Duolingo-style German learning app: a winding lesson path, hearts/gems/streak,
an adaptive lesson engine, a 5-question placement test, a **3D mascot** (Three.js),
and a **Gemini-powered AI tutor** you can chat with in German.

> ⚠️ Private-use clone. This intentionally mimics Duolingo's look for personal
> learning. Duolingo's branding/assets are trademarked — don't publish or ship it.

## Run

```bash
npm install

# For the AI tutor: copy the env template and add your Google Gemini key
cp .env.example .env       # then edit .env -> GEMINI_API_KEY=AIza...

npm run dev                # runs the web app (:5173) + AI backend (:3001) together
```

Open http://localhost:5173. Without an API key, everything works except the AI
Tutor tab (it shows a friendly "configure your key" message).

Other scripts: `npm run dev:web`, `npm run dev:api`, `npm run build`, `npm run preview`.

## What's inside

```
backend/server.js          Express API: POST /api/chat -> Gemini (key stays server-side)
src/
  engine.js                Cognitive engine: answer eval, XP, streak, spaced repetition
  data/
    profile.js             Persistent progress (hearts/gems/streak/XP) in localStorage
    curriculum.js          Lesson registry + the home learning path
    placement.js           5-question placement test (A1→B1)
  lessons/L001.js          Erste Schritte (A1)
  lessons/L002.js          Familie & Zahlen (A1)
  components/
    Mascot3D.jsx           react-three-fiber owl: idle / happy / sad moods
    Home.jsx               Winding lesson path with locked/active/done nodes
    LessonPlayer.jsx       Duolingo lesson screen: progress bar, hearts, feedback sheet
    Exercise.jsx           All 5 exercise types, Duolingo-styled
    PlacementTest.jsx      Placement flow -> sets starting CEFR level
    AITutor.jsx            Chat UI for the Gemini tutor
    TopBar / BottomNav / Profile
```

## Features mapped to the HANS spec

- **Two layers**: `engine.js` is pure logic (unit-tested); React is the UI layer.
- **8-phase loop**: intro → exercise → eval → feedback → spaced repetition (every
  3rd item) → XP/level check → next/complete, in `LessonPlayer.jsx`.
- **5 exercise types**: fill-in-blank, translation, error-correction, word-match,
  sentence-build.
- **Gamification**: hearts (lose one per wrong answer, refill when empty), gems,
  day streak, XP with CEFR promotion (A1→A2→… carry-over).
- **3D mascot** reacts to your performance (waves when you win, slumps when you lose).
- **AI tutor**: real conversational German practice via Gemini, level-aware,
  corrects your mistakes inline.
- **The owl speaks German** 🔊: browser-native text-to-speech (Web Speech API,
  no key). It auto-reads the lesson intro, the correct answer in feedback, and
  the AI tutor's replies — and the 3D owl flaps its beak while talking. Tap any
  🔊 button to replay a word/sentence; toggle the owl's voice in the tutor header.
  Best in Chrome/Edge (they ship high-quality German voices); see Notes.

## Notes

- The production bundle is ~1.1 MB (mostly Three.js). Fine for local use; could be
  code-split later.
- `npm audit` flags 2 dev-only advisories in the Vite toolchain — they don't affect
  the running app.
- Model defaults to `gemini-2.5-flash`; override with `GEMINI_MODEL` in `.env`.
- **Voices**: text-to-speech uses whatever German voice your browser/OS provides.
  Chrome and Edge include good `de-DE` voices out of the box. On Linux with
  Firefox you may need `speech-dispatcher` + a German voice (e.g. `espeak-ng`)
  installed, otherwise it falls back to the default voice (which reads German
  text with the wrong accent). The 🔊 buttons hide automatically if the browser
  has no speech support.
```
