## 2025-12-27 - [Accessible Tabs Implementation]
**Learning:** Vanilla JS tabs require manual management of `aria-selected` and `tabindex` to support keyboard navigation properly. Relying on `click` events alone ignores arrow key users.
**Action:** Always implement the WAI-ARIA Tabs pattern (Roles + Keyboard Support) when building custom tab interfaces.
