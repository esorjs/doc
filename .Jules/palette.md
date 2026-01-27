## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-27 - Roving Tabindex for Custom Tabs
**Learning:** When implementing custom tab interfaces in vanilla JS, simply using buttons is insufficient for true accessibility. The "Roving Tabindex" pattern (managing `tabindex="-1"` vs `0`) coupled with arrow key navigation is required to meet user expectations for a "Tabs" component.
**Action:** For any custom tab implementation, add a `keydown` handler for Arrow keys and manage `tabindex` state dynamically.
