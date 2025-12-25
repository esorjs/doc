## 2025-12-25 - Embedded Content Contrast
**Learning:** Embedded playground content (iframe) defaults to transparent background, which causes text invisibility when the host page has a light background and the embedded content assumes a dark theme.
**Action:** Always hardcode background colors on embedded content containers to ensure sufficient contrast regardless of the host environment.
