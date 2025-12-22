## 2024-05-21 - Accessible Tabs Pattern
**Learning:** The static playground used div/button based tabs without any ARIA roles or keyboard navigation, making it inaccessible to screen readers.
**Action:** When encountering custom tab implementations, always ensure `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, and `aria-controls` are present, along with arrow key navigation.
