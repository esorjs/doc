## 2024-05-23 - [Playground Tab Accessibility]
**Learning:** The playground uses vanilla JS for tabs, requiring manual management of ARIA states (selected/hidden) unlike modern component libraries.
**Action:** When modifying the playground shell, ensure `switchExample` updates `aria-selected` attributes alongside class names.
