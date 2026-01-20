## 2026-01-20 - [Standalone Playground Accessibility]
**Learning:** Standalone HTML apps in `public/` bypass the VitePress theme's built-in a11y features. Specifically, custom tab implementations often lack basic ARIA roles (`tablist`, `tab`, `tabpanel`) and state management (`aria-selected`).
**Action:** Always verify `public/` applications for manual ARIA implementation. Use a pattern of ID-based state toggling in vanilla JS to manage `aria-selected` alongside class-based styling.
