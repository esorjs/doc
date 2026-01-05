# Palette's UX Journal
## 2024-05-22 - [Playground Tab Accessibility]
**Learning:** Vanilla JS tabs in static HTML often lack ARIA roles and keyboard support. Retrofitting them is high-impact and low-code (<50 lines).
**Action:** When seeing custom tab implementations, always check for `role="tablist"`, `aria-selected`, and arrow key support. Use `keydown` listeners for "delightful" keyboard navigation.
