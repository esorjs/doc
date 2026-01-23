## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-23 - Roving Tabindex for Standalone Tabs
**Learning:** For standalone HTML files with custom tab implementations, simply adding `role="tab"` is insufficient. Users expect arrow key navigation (Roving Tabindex). Without it, keyboard users must tab through every button.
**Action:** When auditing custom tab components, always verify arrow key support and `tabindex` management (active=0, inactive=-1).
