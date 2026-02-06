## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-05-22 - Roving Tabindex in Vanilla JS
**Learning:** Implementing the "Roving Tabindex" pattern (Arrow key navigation) on vanilla JS tabs requires careful synchronization of `tabindex` (0 vs -1) and `aria-selected` attributes, especially when the initial state is static HTML but interaction is dynamic.
**Action:** Always ensure the `keydown` handler explicitly prevents default scrolling and manages both focus and activation (click) for a snappy user experience.
