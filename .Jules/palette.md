## 2024-05-22 - Static Playground Accessibility
**Learning:** Static HTML playgrounds often implement custom tab interfaces that lack ARIA roles and keyboard navigation, making them inaccessible to screen readers and keyboard users.
**Action:** When encountering custom tab implementations in static sites, always check for `role="tablist"`, `tab`, and `tabpanel`. Implement standard WAI-ARIA patterns including `aria-selected` toggling and Arrow key navigation logic to ensure full accessibility without relying on complex frameworks.
