## 2025-01-20 - Playground Tab Interface A11y
**Learning:** Manual tab implementations using `div` and `button` elements must be explicitly augmented with ARIA roles (`tablist`, `tab`, `tabpanel`) and states (`aria-selected`, `aria-controls`) to be accessible to screen readers. Standard `onclick` handlers are insufficient for communicating state changes.
**Action:** Always verify custom tab components against the WAI-ARIA Tabs pattern. Use `role="tablist"` on container, `role="tab"` on triggers, and `role="tabpanel"` on content areas.
