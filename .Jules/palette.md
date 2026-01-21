## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-21 - Manual Roving Tabindex Implementation

**Learning:** Implementing "Roving Tabindex" for tab lists in standalone HTML files requires manually managing `tabindex` (0 for focused, -1 for others) and `keydown` events for arrow navigation, as native HTML buttons do not provide this behavior automatically within a `role="tablist"`.

**Action:** Use the `roving-tabindex` pattern for any custom interactive lists (tabs, toolbars, grids) in `public/` files to ensure WCAG keyboard accessibility compliance.
