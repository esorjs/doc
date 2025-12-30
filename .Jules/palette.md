# Palette's Journal

This journal tracks critical UX and accessibility learnings for the EsorJS documentation project.

## 2024-05-20 - [Playground Contrast Issue]
**Learning:** The embedded playground uses a transparent background by default, which causes poor contrast against the white documentation background for code snippets and UI elements designed for dark mode.
**Action:** Always ensure the playground container has a hardcoded dark background (`#1e1e1e`) to maintain readability and visual consistency with the VS Code-like theme.
