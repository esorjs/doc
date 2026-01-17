## 2026-01-17 - Manual ARIA for Standalone Apps
**Learning:** Standalone HTML apps in `public/` (like the playground) don't inherit VitePress's built-in accessibility. They require manual implementation of ARIA patterns (like `role="tablist"`).
**Action:** When touching files in `public/`, manually check and implement WAI-ARIA patterns instead of relying on framework defaults.
