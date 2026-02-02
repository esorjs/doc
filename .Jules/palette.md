## 2026-01-18 - Standalone Public Files and A11y

**Learning:** Standalone HTML applications in `public/` (like the playground) completely bypass the built-in accessibility features of the VitePress theme. They require manual implementation of ARIA roles (tablist, tab, tabpanel) and keyboard navigation logic, as they are served raw without the framework's layout wrapper.

**Action:** When adding or modifying static HTML files in `public/`, explicitly audit and implement WAI-ARIA patterns, as the global theme's a11y protections do not apply.

## 2026-01-24 - Roving Tabindex in Vanilla JS
**Learning:** When implementing tabs in vanilla JS (e.g. standalone files), simply using `role="tab"` isn't enough. You must implement the Roving Tabindex pattern (tabindex="0" for active, "-1" for others) and handle Arrow/Home/End keys manually to meet accessibility standards.
**Action:** Use a standardized event listener for `keydown` on the `tablist` container to handle focus management for all tab interfaces.
