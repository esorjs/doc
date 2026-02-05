## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-18 - Roving Tabindex for Tabs
**Learning:** For standalone tab components (like in the playground), implementing the Roving Tabindex pattern (tabindex="0" for active, "-1" for others, plus Arrow navigation) significantly improves keyboard accessibility compared to default button tabbing.
**Action:** Apply this pattern to any future tab interfaces in the public/ directory or custom components.
