## 2024-05-23 - Playground Tabs Accessibility
**Learning:** Custom tab implementations often miss the "roving tabindex" pattern, making keyboard navigation cumbersome for screen reader users who expect arrow key support.
**Action:** When auditing tabs, always check for `role="tablist"`, `aria-selected`, and arrow key support, not just visual clickability.
