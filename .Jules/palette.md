## 2025-01-20 - Playground Tabs Accessibility
**Learning:** Custom tab implementations often miss `aria-selected` and `role="tablist"`/`role="tab"`. Standard buttons are keyboard accessible via Tab, but `aria-selected` is crucial for screen readers to know which tab is active.
**Action:** When implementing tabs, always ensure `role="tablist"`, `role="tab"`, and `aria-selected` state management are present.
