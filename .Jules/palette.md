## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-18 - Roving Tabindex for Standalone Tabs

**Learning:** For standalone tab interfaces (like in the playground), simply adding `role="tab"` is insufficient. Users expect arrow key navigation. The "Roving Tabindex" pattern (setting `tabindex="0"` for the active tab and `-1` for others) coupled with a `keydown` listener provides the expected accessible experience.

**Action:** Always implement Roving Tabindex logic (JS + attributes) whenever building custom tab components in vanilla JS.
