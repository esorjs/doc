## 2024-05-23 - Playground Tabs Accessibility
**Learning:** Static HTML playgrounds often use button-based navigation that lacks ARIA semantics. Implementing `role="tablist"`, `tab`, and `tabpanel` with roving tabindex significantly improves screen reader and keyboard usability without complex dependencies.
**Action:** When working on standalone examples or playgrounds, check if "tabs" are just `div`s or `button`s and upgrade them to semantic tab components.

## 2024-05-23 - Contrast in Embedded Iframes
**Learning:** Embedded playgrounds (via iframe) often try to "blend in" by setting transparent backgrounds. If the parent page has a light theme and the playground has a dark theme syntax highlighter, this results in unreadable white-on-white text.
**Action:** Always enforce the playground's native background color (e.g., dark mode) even when embedded, or implement a proper theme switch that syncs with the parent.
