
# Copilot Instructions for AI Agents

## Project Overview
- **Framework:** React + TypeScript (Vite)
- **Purpose:** Audio recording, upload, detail, summary, and transcript for speech minutes

## Architecture & Structure
- All source code is in `src/`
  - `components/`: Feature-based UI (e.g. `RecordingPage.tsx`, `AudioDetailPage.tsx`, `Home.tsx`)
    - Shared UI primitives: `components/ui/` (color mode, toaster, provider, tooltip)
  - `api.ts`: Centralizes backend API calls (audio, auth, transcript, summary)
  - `summaryApi.ts`: Handles external summary API
- Routing: Managed in `App.tsx` using React Router v7
- State: Managed with React hooks and context (no Redux/MobX)
- Styling: Global CSS (`App.css`, `index.css`) and per-component imports

## Key Patterns & Conventions
- **Component Pattern:** Always use function components and React hooks
- **API Access:**
  - Use `api.ts` for backend, `summaryApi.ts` for external summary
  - Always handle errors at the call site (no global error boundary)
- **Authentication:**
  - JWT token stored in `localStorage` as `token`
  - `ProtectedRoute.tsx` enforces login for protected pages
- **Notifications:** Use `toaster.tsx` (`toaster.create({ title, type, ... })`)
- **Color Mode:** Use `provider.tsx` and `color-mode.tsx` for theme context
- **Navigation:** Use `useNavigate` from `react-router-dom` for programmatic routing
- **File Upload:** Use `uploadAudioFile` in `api.ts` with `FormData`
- **Audio/Transcript/Summary Flow:**
  1. User records or uploads audio (`RecordingPage.tsx`)
  2. Audio list fetched from backend
  3. Selecting audio opens `AudioDetailPage.tsx` (transcript/summary tabs)
  4. Transcript and summary fetched/generated via API helpers

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (Vite with HMR)
- **Build for production:** `npm run build`
- **Lint:** `npm run lint` (see `eslint.config.js`)
- **No tests:** No test scripts or test folders present

## Integration & External Dependencies
- **Chakra UI:** All UI components/layout
- **Vite plugins:** See `vite.config.ts` (React, tsconfig paths)
- **ESLint:** See `eslint.config.js` (TypeScript, React, hooks)
- **Other:**
  - `next-themes` for color mode
  - `wavesurfer.js` for audio waveform (if used)
  - `axios` for API calls (see `api.ts`)

## Examples
- Add a feature page: create in `src/components/`, import and route in `App.tsx`, use function component + hooks
- Add a backend API call: add to `api.ts`, use async/await, handle errors at call site
- Add a notification: use `toaster.create({ title, type, ... })`

## References
- `README.md`: Vite/React/ESLint setup
- `src/components/`: UI and feature structure
- `vite.config.ts`: Build customization
- `api.ts`, `summaryApi.ts`: API patterns

---
If any conventions or flows are unclear, check the referenced files or ask for clarification.
