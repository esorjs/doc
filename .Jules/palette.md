## 2026-01-12 - Playground Accessibility Pattern
**Learning:** Playground UI relies on vanilla JS and custom elements (`playground-ide`), requiring manual ARIA management unlike the main Vue app.
**Action:** When modifying the playground, ensure ARIA attributes (`aria-selected`, `aria-controls`) are manually toggled in the vanilla JS handlers.
