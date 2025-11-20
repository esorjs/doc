# Introduction

## What is Esor?

Esor is a modern, minimalist web framework based on Web Components, designed to create interactive, high-performance user interfaces. It combines the power of native web standards with an elegant reactive system, providing a smooth and productive development experience.

```javascript
import { component, html } from "esor";

component("hello-world", () => {
  return html`<h1>Hello, World!</h1>`;
});
```

## Why Esor?

### 🚀 Exceptional Performance

Esor uses native Web Components and a fine-grained reactivity system based on signals, resulting in fast and efficient applications with minimal bundle size (**~3KB**).

### 💡 Intuitive and Familiar

If you know HTML, CSS, and JavaScript, you'll feel right at home. Esor adopts familiar patterns and enhances them with modern features:

```javascript
import { component, html, signal } from "esor";

component("user-profile", () => {
  const name = signal("Ana");

  return html`
    <div class="profile">
      <h2>${name()}</h2>
      <button @click=${() => name("Juan")}>Change Name</button>
    </div>
  `;
});
```

### 🔧 Flexible and Extensible

- Uses modern web tools and standards
- Integrates seamlessly with other libraries
- Works with your favorite development tools

### 📦 Everything You Need, Nothing More

- Standards-based component system
- Fine-grained reactivity with signals
- Powerful and efficient template system
- Intuitive reactive primitives for state and effects
- Zero dependencies

## Getting Started

### Installation

```bash
npm install esor
```

### Your First Component

```javascript
import { component, html, signal } from "esor";

component("counter-app", () => {
  const count = signal(0);

  return html`
    <div>
      <h1>Count: ${count()}</h1>
      <button @click=${() => count(count() + 1)}>Increment</button>
    </div>
  `;
});
```

### Using in HTML

```html
<!DOCTYPE html>
<html>
  <body>
    <counter-app></counter-app>
    <script type="module" src="/src/counter.js"></script>
  </body>
</html>
```

## Key Features

### 🔌 Native Web Components

Reusable components based on web standards.

### ⚡ Fine-Grained Reactivity

Signal-based system for precise and efficient updates.

### 📝 Expressive Templates

Declarative and powerful syntax for defining interfaces.

### 🎯 Developer Experience

Intuitive APIs and modern development tools.

## Comparison with Other Frameworks

| Feature         | Esor           | Lit            | SolidJS     | React       |
| --------------- | -------------- | -------------- | ----------- | ----------- |
| Base            | Web Components | Web Components | Custom      | Virtual DOM |
| Reactivity      | Signals        | Properties     | Signals     | Hooks       |
| Bundle Size     | ~3KB           | ~5KB           | ~7KB        | ~40KB       |
| Learning Curve  | Low            | Medium         | Low-Medium  | Medium      |
| Runtime         | Direct DOM     | Direct DOM     | Direct DOM  | Virtual DOM |

## Who is Esor For?

Esor is ideal for:

- 🎯 Developers who value simplicity and performance
- 🔧 Projects that need reusable web components
- 🚀 Applications requiring high performance
- 📚 Teams that prefer modern web standards
- 💼 Developers familiar with SolidJS or signals-based reactivity

## Next Steps

- [Try the Playground](./playground) - Experiment with Esor in your browser
- [Quick Start Guide](./getting-started) - Set up your first project
- [Basic Tutorial](./tutorial) - Learn the fundamentals
- [API Documentation](./api) - Complete reference
- [Examples](./examples) - Real-world use cases

::: tip TIP
Esor is designed to be adopted gradually. You can start with a single component in your existing application and grow from there.
:::

::: warning NOTE
Esor requires modern browsers that support Web Components (Custom Elements, Shadow DOM). All evergreen browsers (Chrome, Firefox, Safari, Edge) support these features.
:::
