# Copilot Instructions for AI Agents

## Project Overview
- **Framework:** React + TypeScript, built with Vite
- **Structure:**
  - `src/` contains all source code
    - `components/` holds UI components, organized by feature
    - `api.ts` and `summaryApi.ts` handle API communication
  - `public/` for static assets
  - `vite.config.ts` for Vite build configuration
- **Purpose:** This app provides audio detail, recording, summary, and transcript features for speech minutes.

## Key Patterns & Conventions
- **Component Structure:**
  - Use function components with hooks (no class components)
  - UI is split into feature folders (e.g., `AudioDetailPage.tsx`, `RecordingPage.tsx`)
  - Shared UI primitives are in `components/ui/`
- **Styling:**
  - Use CSS modules (`.css` files imported per component)
  - Global styles in `App.css` and `index.css`
- **API Calls:**
  - Use `api.ts` and `summaryApi.ts` for all backend communication
  - Prefer async/await and handle errors at the call site
- **State Management:**
  - Use React's built-in state/hooks (no Redux or MobX)
  - Context is used for color mode and notifications (`provider.tsx`, `toaster.tsx`)

## Developer Workflows
- **Install dependencies:**
  - `npm install`
- **Start dev server:**
  - `npm run dev` (runs Vite with HMR)
- **Build for production:**
  - `npm run build`
- **Lint:**
  - `npm run lint` (uses ESLint, see `eslint.config.js`)
- **No test suite is present by default.**

## Integration & External Dependencies
- **Vite plugins:** See `vite.config.ts` for plugin usage
- **ESLint:** Configured for TypeScript and React, see `eslint.config.js`
- **No custom code generation or build steps beyond Vite.**

## Examples
- To add a new feature page, create a new file in `src/components/`, import it in `App.tsx`, and follow the function component pattern.
- For new API endpoints, add functions to `api.ts` or `summaryApi.ts` and call them from components.

## References
- See `README.md` for Vite/React/ESLint setup details
- See `src/components/` for UI and feature structure
- See `vite.config.ts` for build customization

---
For questions about project-specific patterns, check the referenced files or ask for clarification.
