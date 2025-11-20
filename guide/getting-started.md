# Quick Start Guide

## Installation

### NPM

```bash
npm install esor
```

### Yarn

```bash
yarn add esor
```

### PNPM

```bash
pnpm add esor
```

### CDN

For quick prototyping or demos, you can use Esor directly from a CDN:

```html
<script type="module">
  import { component, html, signal } from "https://unpkg.com/esor/dist/esor.js";
</script>
```

## Basic Usage

Create your first component:

```javascript
import { component, html, signal } from "esor";

// Create a reactive component
component("hello-world", () => {
  // Local reactive state
  const name = signal("World");

  return html`
    <div>
      <h1>Hello ${name()}!</h1>
      <input value=${name()} @input=${(e) => name(e.target.value)} />
    </div>
  `;
});
```

## Using in Your Project

### HTML File

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Esor App</title>
    <script type="module" src="/src/components/hello-world.js"></script>
  </head>
  <body>
    <hello-world></hello-world>
  </body>
</html>
```

### With a Build Tool

If you're using Vite, webpack, or another bundler:

**src/components/counter.js**
```javascript
import { component, html, signal } from "esor";

component("my-counter", () => {
  const count = signal(0);
  const increment = () => count(count() + 1);
  const decrement = () => count(count() - 1);

  return html`
    <div class="counter">
      <button @click=${decrement}>-</button>
      <span>${count()}</span>
      <button @click=${increment}>+</button>
    </div>
  `;
});
```

**src/main.js**
```javascript
import "./components/counter.js";
```

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <my-counter></my-counter>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## Next Steps

Now that you have Esor installed and running, you can:

- [Try the Interactive Playground](./playground) - Experiment without setup
- [Learn the basics with the Tutorial](./tutorial)
- [Explore the API Documentation](./api)
- [See practical examples](./examples)
- [Understand Components in depth](./components)

::: tip Development Server
We recommend using [Vite](https://vitejs.dev/) for the best development experience with Esor. Simply run:

```bash
npm create vite@latest my-esor-app
cd my-esor-app
npm install esor
npm run dev
```
:::
