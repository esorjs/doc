## 2026-01-11 - [Accessibility] Adding ARIA to Custom Tabs
**Learning:** Custom tab interfaces implemented with `div`s or `button`s need explicit `role="tablist"`, `role="tab"`, and `role="tabpanel"` attributes, along with state management (`aria-selected`), to be perceptible to screen readers.
**Action:** Always check "tab-like" interfaces for these attributes and verify that the active state is programmatically communicated, not just visually styled.
