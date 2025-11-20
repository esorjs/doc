# API Reference

Complete reference for all Esor exports and APIs.

## Core API

### component(name, setup)

Registers a custom Web Component.

**Parameters:**
- `name` (string): Component name (must contain a hyphen)
- `setup` (function): Setup function that returns a template

**Returns:** void

```javascript
import { component, html } from "esor";

component("my-button", (props) => {
  return html`
    <button>${props.label || "Click me"}</button>
  `;
});
```

The `setup` function receives `props` as its first argument and should return a template created with the `html` template tag.

### html

Template tag function for creating reactive templates.

```javascript
import { html, signal } from "esor";

const name = signal("World");

const template = html`
  <div>
    <h1>Hello ${name()}!</h1>
    <p>Static content</p>
  </div>
`;
```

**Features:**
- Reactive interpolation: `${signal()}`
- Event handlers: `@click`, `@input`, etc.
- Dynamic attributes: `class=${value}`, `disabled=${condition}`
- Conditional rendering: `${condition ? html`...` : ""}`
- List rendering: `${array.map(item => html`...`)}`

## Reactivity

### signal(initialValue)

Creates a reactive signal.

**Parameters:**
- `initialValue` (any): Initial value

**Returns:** Signal function (getter/setter)

```javascript
import { signal } from "esor";

const count = signal(0);

// Read value
console.log(count()); // 0

// Set value
count(5);
console.log(count()); // 5

// Update based on current value
count(count() + 1);
console.log(count()); // 6
```

::: warning Important
Always call signals as functions:
- ✅ `count()` to read
- ✅ `count(newValue)` to write
- ❌ `count.value` (not supported)
:::

### computed(fn)

Creates a computed signal that automatically updates when its dependencies change.

**Parameters:**
- `fn` (function): Computation function

**Returns:** Computed signal (read-only)

```javascript
import { signal, computed } from "esor";

const firstName = signal("John");
const lastName = signal("Doe");

const fullName = computed(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

firstName("Jane");
console.log(fullName()); // "Jane Doe"
```

Computed signals automatically track their dependencies and only re-compute when necessary.

### effect(fn)

Runs a side effect that automatically re-runs when its dependencies change.

**Parameters:**
- `fn` (function): Effect function (can return a cleanup function)

**Returns:** Dispose function

```javascript
import { signal, effect } from "esor";

const count = signal(0);

const dispose = effect(() => {
  console.log(`Count is: ${count()}`);

  // Optional cleanup
  return () => {
    console.log("Cleaning up");
  };
});

count(1); // Logs: "Count is: 1"
count(2); // Logs: "Cleaning up", then "Count is: 2"

// Stop the effect
dispose();
```

Effects are useful for:
- Logging and debugging
- Syncing with external systems
- Triggering animations
- Managing subscriptions

### memo(fn, equals?)

Creates a memoized computation with custom equality check.

**Parameters:**
- `fn` (function): Computation function
- `equals` (function, optional): Custom equality function

**Returns:** Memoized signal

```javascript
import { signal, memo } from "esor";

const items = signal([1, 2, 3]);

const sum = memo(() => {
  console.log("Computing sum...");
  return items().reduce((a, b) => a + b, 0);
});

console.log(sum()); // Logs "Computing sum..." then 6
console.log(sum()); // 6 (no recomputation)

items([1, 2, 3, 4]);
console.log(sum()); // Logs "Computing sum..." then 10
```

## Lifecycle Hooks

### onMount(callback)

Runs after the component is mounted to the DOM.

**Parameters:**
- `callback` (function): Function to run on mount

```javascript
import { component, html, onMount } from "esor";

component("data-fetcher", () => {
  onMount(() => {
    console.log("Component mounted!");
    // Fetch data, start timers, etc.
  });

  return html`<div>Content</div>`;
});
```

### onDestroy(callback)

Runs before the component is removed from the DOM.

**Parameters:**
- `callback` (function): Cleanup function

```javascript
import { component, html, signal, onMount, onDestroy } from "esor";

component("interval-timer", () => {
  const count = signal(0);
  let intervalId;

  onMount(() => {
    intervalId = setInterval(() => {
      count(count() + 1);
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
    console.log("Cleaned up interval");
  });

  return html`<div>Seconds: ${count()}</div>`;
});
```

### onUpdate(callback)

Runs after each component update.

**Parameters:**
- `callback` (function): Function to run after updates

```javascript
import { onUpdate } from "esor";

onUpdate(() => {
  console.log("Component updated");
});
```

## Template Syntax

### Event Handlers

Use the `@` prefix for event listeners:

```javascript
html`
  <button @click=${handleClick}>Click</button>
  <input @input=${handleInput} />
  <form @submit=${handleSubmit}>...</form>
`
```

**Common events:**
- `@click` - Mouse clicks
- `@input` - Input value changes
- `@change` - Input change (on blur)
- `@submit` - Form submission
- `@keydown`, `@keyup` - Keyboard events
- `@focus`, `@blur` - Focus events
- `@mouseenter`, `@mouseleave` - Mouse hover

### Dynamic Attributes

```javascript
const isActive = signal(true);
const theme = signal("dark");

html`
  <div
    class=${theme()}
    disabled=${!isActive()}
    data-value=${someValue()}
  >
    Content
  </div>
`
```

### Conditional Rendering

```javascript
const isLoggedIn = signal(false);

html`
  <div>
    ${isLoggedIn()
      ? html`<p>Welcome back!</p>`
      : html`<p>Please log in</p>`
    }
  </div>
`
```

### List Rendering

```javascript
const items = signal([
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
]);

html`
  <ul>
    ${items().map(item => html`
      <li key=${item.id}>${item.name}</li>
    `)}
  </ul>
`
```

## Component Props

Props are passed as attributes and received as the first argument in the setup function:

```javascript
component("user-badge", (props) => {
  return html`
    <div class="badge">
      <span>${props.name}</span>
      <span>${props.role}</span>
    </div>
  `;
});
```

**Usage:**
```html
<user-badge name="Ana" role="Admin"></user-badge>
```

**With destructuring:**
```javascript
component("user-badge", ({ name, role = "User" }) => {
  return html`
    <div class="badge">
      <span>${name}</span>
      <span>${role}</span>
    </div>
  `;
});
```

## TypeScript Support

Esor includes TypeScript definitions. Here's how to use types:

```typescript
import { component, html, signal, Signal } from "esor";

interface UserProps {
  name: string;
  email: string;
  role?: string;
}

component("user-card", (props: UserProps) => {
  const isExpanded: Signal<boolean> = signal(false);

  return html`
    <div>
      <h3>${props.name}</h3>
      <button @click=${() => isExpanded(!isExpanded())}>
        Toggle
      </button>
    </div>
  `;
});
```

## Best Practices

### Signal Usage

✅ **Do:**
```javascript
const count = signal(0);
count(count() + 1); // Correct
```

❌ **Don't:**
```javascript
const count = signal(0);
count++; // Won't work
count.value++; // Not supported
```

### Effect Cleanup

✅ **Do:**
```javascript
effect(() => {
  const listener = () => console.log("resize");
  window.addEventListener("resize", listener);

  return () => {
    window.removeEventListener("resize", listener);
  };
});
```

❌ **Don't:**
```javascript
effect(() => {
  window.addEventListener("resize", listener);
  // No cleanup - memory leak!
});
```

### Computed vs Memo

- Use `computed()` for simple derived values
- Use `memo()` when you need custom equality checks or expensive computations

## See Also

- [Reactivity Guide](./hooks) - Deep dive into reactivity
- [Components Guide](./components) - Component patterns
- [Tutorial](./tutorial) - Step-by-step guide
- [Examples](./examples) - Real-world examples
