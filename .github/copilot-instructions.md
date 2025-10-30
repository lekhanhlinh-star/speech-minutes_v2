
# Copilot Instructions for AI Agents

## Project Overview
- **Framework:** React + TypeScript, built with Vite
- **Purpose:** Audio recording, upload, detail, summary, and transcript for speech minutes

## Architecture & Structure
- All source code is in `src/`
  - `components/` contains feature-based UI (e.g. `RecordingPage.tsx`, `AudioDetailPage.tsx`)
    - Shared UI primitives: `components/ui/` (color mode, toaster, provider, tooltip)
  - `api.ts` and `summaryApi.ts` centralize all backend and external API calls
- Routing is handled in `App.tsx` using React Router v7
- State is managed with React hooks and context (no Redux/MobX)
- Styling uses global CSS (`App.css`, `index.css`) and per-component imports
- No test suite or custom build steps beyond Vite

## Key Patterns & Conventions
- **Component Pattern:** Always use function components and hooks
- **API Access:**
  - Use `api.ts` for backend (audio, auth, transcript, summary)
  - Use `summaryApi.ts` for external summary API
  - Always handle errors at the call site
- **Authentication:**
  - JWT token is stored in `localStorage` as `token`
  - `ProtectedRoute.tsx` enforces login for protected pages
- **Notifications:** Use `toaster.tsx` for user feedback
- **Color Mode:** Use `provider.tsx` and `color-mode.tsx` for theme context
- **Navigation:** Use `useNavigate` from `react-router-dom` for programmatic routing
- **File Upload:** Audio files are uploaded via `uploadAudioFile` in `api.ts` using `FormData`
- **Audio/Transcript/Summary Flow:**
  1. User records or uploads audio (`RecordingPage.tsx`)
  2. Audio list is fetched from backend
  3. Selecting an audio opens `AudioDetailPage.tsx` (shows transcript and summary tabs)
  4. Transcript and summary are fetched/generated via API helpers

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (Vite with HMR)
- **Build for production:** `npm run build`
- **Lint:** `npm run lint` (see `eslint.config.js`)
- **No tests:** No test scripts or test folders present

## Integration & External Dependencies
- **Chakra UI:** Used for all UI components and layout
- **Vite plugins:** See `vite.config.ts` (React, tsconfig paths)
- **ESLint:** See `eslint.config.js` for rules (TypeScript, React, hooks)
- **Other:**
  - `next-themes` for color mode
  - `wavesurfer.js` for audio waveform (if used)
  - `axios` for some API calls (see `api.ts`)

## Examples
- To add a new feature page: create a file in `src/components/`, import and route it in `App.tsx`, use function component + hooks
- To add a backend API call: add to `api.ts`, use async/await, handle errors, and call from components
- To add a notification: use `toaster.create({ title, type, ... })`

## References
- `README.md`: Vite/React/ESLint setup
- `src/components/`: UI and feature structure
- `vite.config.ts`: Build customization
- `api.ts`, `summaryApi.ts`: API patterns

---
If any conventions or flows are unclear, check the referenced files or ask for clarification.
