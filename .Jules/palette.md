## 2024-05-23 - Accessibility in Embedded Code Snippets
**Learning:** In a playground environment where code is presented as strings inside `<script type="sample/js">`, modifying these strings to include accessibility attributes (like `aria-label`) is a powerful way to propagate best practices. Users copying the code will inherit accessible patterns by default.
**Action:** Always check if code examples can be made accessible by default without complicating the example logic.

## 2024-05-23 - Hiding Decorative Arrows
**Learning:** Navigation links often use arrows (←, →) for visual direction. These should be hidden from screen readers using `<span aria-hidden="true">` to prevent them from reading the character name (e.g., "Leftwards Arrow").
**Action:** Check all "Back" or "Next" links for unhidden decorative characters.
