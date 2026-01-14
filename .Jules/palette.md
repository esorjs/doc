## 2026-01-14 - Playground Structure
**Learning:** The playground is a standalone vanilla JS app in `public/playground/index.html` that uses `playground-elements`. It handles its own routing/tabs via simple JS functions and must work both standalone and inside an iframe (hiding headers).
**Action:** When modifying the playground, ensure changes work in both contexts and use standard HTML/JS patterns (no build step for this file specifically, though it's copied by VitePress).
