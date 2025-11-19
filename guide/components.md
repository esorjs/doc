# Components Guide

Deep dive into Esor components, advanced patterns, styling, and composition.

## Component Basics

### Anatomy of a Component

An Esor component consists of:
1. A name (must contain a hyphen)
2. A setup function
3. A returned template

```javascript
import { component, html } from "esor";

component("component-name", (props) => {
  // 1. Setup code
  // 2. State, computed values, effects
  // 3. Event handlers

  // Return template
  return html`<div>Component content</div>`;
});
```

### Component Registration

Components are registered globally and can be used anywhere in your HTML:

```javascript
// user-card.js
import { component, html } from "esor";

component("user-card", ({ name, role }) => {
  return html`
    <div class="card">
      <h3>${name}</h3>
      <p>${role}</p>
    </div>
  `;
});
```

```html
<!-- index.html -->
<script type="module" src="/user-card.js"></script>
<user-card name="Ana" role="Developer"></user-card>
```

## Props

### Basic Props

Props are passed as HTML attributes and received as function parameters:

```javascript
component("greeting", (props) => {
  return html`<h1>Hello, ${props.name}!</h1>`;
});
```

```html
<greeting name="World"></greeting>
```

### Destructuring Props

Use destructuring for cleaner code:

```javascript
component("user-badge", ({ name, email, avatar }) => {
  return html`
    <div class="badge">
      <img src=${avatar} alt=${name} />
      <div>
        <h3>${name}</h3>
        <p>${email}</p>
      </div>
    </div>
  `;
});
```

### Default Values

Provide default values in destructuring:

```javascript
component("button", ({ label = "Click me", variant = "primary" }) => {
  return html`
    <button class="btn btn-${variant}">
      ${label}
    </button>
  `;
});
```

```html
<my-button></my-button> <!-- Uses defaults -->
<my-button label="Submit" variant="success"></my-button>
```

### Complex Props

For complex data, use JSON:

```javascript
component("data-table", ({ columns, data }) => {
  const cols = JSON.parse(columns || "[]");
  const rows = JSON.parse(data || "[]");

  return html`
    <table>
      <thead>
        <tr>
          ${cols.map(col => html`<th>${col}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => html`
          <tr>
            ${cols.map(col => html`<td>${row[col]}</td>`)}
          </tr>
        `)}
      </tbody>
    </table>
  `;
});
```

```html
<data-table
  columns='["Name", "Email", "Role"]'
  data='[
    {"Name": "Ana", "Email": "ana@example.com", "Role": "Admin"},
    {"Name": "Juan", "Email": "juan@example.com", "Role": "User"}
  ]'>
</data-table>
```

## Styling Components

### Inline Styles

Use template strings for dynamic styles:

```javascript
import { component, html, signal } from "esor";

component("colored-box", () => {
  const color = signal("#3498db");

  return html`
    <div style="background: ${color()}; padding: 20px;">
      <input type="color" value=${color()} @input=${(e) => color(e.target.value)} />
    </div>
  `;
});
```

### CSS Classes

Dynamic class names:

```javascript
import { component, html, signal } from "esor";

component("toggle-button", () => {
  const isActive = signal(false);

  return html`
    <button
      class="btn ${isActive() ? 'active' : ''}"
      @click=${() => isActive(!isActive())}
    >
      ${isActive() ? 'Active' : 'Inactive'}
    </button>
  `;
});
```

### Shadow DOM and Scoped Styles

Esor components use Shadow DOM by default, allowing for scoped styles:

```javascript
component("styled-card", () => {
  return html`
    <style>
      :host {
        display: block;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
      }

      h2 {
        margin: 0 0 12px;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    </style>

    <div class="card">
      <h2>Card Title</h2>
      <p>Card content goes here</p>
    </div>
  `;
});
```

**Key selectors for Shadow DOM:**
- `:host` - Targets the component itself
- `:host(.class)` - Targets the host with a specific class
- `:host-context(.class)` - Styles based on ancestor elements
- `::slotted(*)` - Targets slotted content

### CSS Variables

Use CSS custom properties for themeable components:

```javascript
component("themed-button", ({ label }) => {
  return html`
    <style>
      :host {
        --btn-bg: #3498db;
        --btn-color: white;
        --btn-hover-bg: #2980b9;
      }

      button {
        background: var(--btn-bg);
        color: var(--btn-color);
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        background: var(--btn-hover-bg);
      }
    </style>

    <button>${label}</button>
  `;
});
```

**Usage with custom properties:**
```html
<style>
  themed-button {
    --btn-bg: #e74c3c;
    --btn-hover-bg: #c0392b;
  }
</style>

<themed-button label="Custom Colors"></themed-button>
```

## Component Composition

### Parent-Child Communication

**Using props (parent to child):**

```javascript
import { component, html, signal } from "esor";

// Parent component
component("parent-comp", () => {
  const message = signal("Hello from parent");

  return html`
    <div>
      <child-comp message=${message()}></child-comp>
      <button @click=${() => message("Updated!")}>Update</button>
    </div>
  `;
});

// Child component
component("child-comp", ({ message }) => {
  return html`<p>Message: ${message}</p>`;
});
```

**Using custom events (child to parent):**

```javascript
// Child component
component("child-button", () => {
  const handleClick = () => {
    const event = new CustomEvent("childClick", {
      detail: { data: "some data" },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  };

  return html`
    <button @click=${handleClick}>Click Me</button>
  `;
});

// Parent component
component("parent-comp", () => {
  const handleChildClick = (e) => {
    console.log("Child clicked:", e.detail);
  };

  return html`
    <div @childClick=${handleChildClick}>
      <child-button></child-button>
    </div>
  `;
});
```

### Shared State (Global Store)

For complex applications, use a shared store:

```javascript
// store.js
import { signal, computed } from "esor";

export const userStore = {
  currentUser: signal(null),
  isLoggedIn: computed(() => userStore.currentUser() !== null),

  login(user) {
    this.currentUser(user);
  },

  logout() {
    this.currentUser(null);
  }
};
```

```javascript
// login-button.js
import { component, html } from "esor";
import { userStore } from "./store.js";

component("login-button", () => {
  const handleLogin = () => {
    userStore.login({ name: "Ana", email: "ana@example.com" });
  };

  return html`
    <button @click=${handleLogin}>Login</button>
  `;
});
```

```javascript
// user-display.js
import { component, html } from "esor";
import { userStore } from "./store.js";

component("user-display", () => {
  return html`
    <div>
      ${userStore.isLoggedIn()
        ? html`<p>Welcome, ${userStore.currentUser().name}!</p>`
        : html`<p>Please log in</p>`
      }
    </div>
  `;
});
```

## Slots and Content Projection

### Basic Slots

Slots allow parent components to inject content:

```javascript
component("card-wrapper", () => {
  return html`
    <div class="card">
      <slot></slot>
    </div>
  `;
});
```

```html
<card-wrapper>
  <h2>My Title</h2>
  <p>My content</p>
</card-wrapper>
```

### Named Slots

Use named slots for multiple injection points:

```javascript
component("article-card", () => {
  return html`
    <article>
      <header>
        <slot name="header"></slot>
      </header>

      <div class="content">
        <slot></slot> <!-- Default slot -->
      </div>

      <footer>
        <slot name="footer"></slot>
      </footer>
    </article>
  `;
});
```

```html
<article-card>
  <h1 slot="header">Article Title</h1>
  <p>Article body content...</p>
  <div slot="footer">Author: Ana Garcia</div>
</article-card>
```

## Conditional Rendering

### Ternary Operator

```javascript
import { component, html, signal } from "esor";

component("conditional-demo", () => {
  const isLoggedIn = signal(false);

  return html`
    <div>
      ${isLoggedIn()
        ? html`<p>Welcome back!</p>`
        : html`<p>Please log in</p>`
      }
    </div>
  `;
});
```

### Multiple Conditions

```javascript
component("status-display", () => {
  const status = signal("loading"); // "loading" | "error" | "success"

  return html`
    <div>
      ${status() === "loading"
        ? html`<p>Loading...</p>`
        : status() === "error"
        ? html`<p>Error occurred!</p>`
        : html`<p>Success!</p>`
      }
    </div>
  `;
});
```

### Conditional Attributes

```javascript
const disabled = signal(true);

html`
  <button disabled=${disabled() ? true : null}>
    Submit
  </button>
`;
```

## List Rendering

### Basic Lists

```javascript
import { component, html, signal } from "esor";

component("user-list", () => {
  const users = signal([
    { id: 1, name: "Ana" },
    { id: 2, name: "Juan" },
    { id: 3, name: "Maria" }
  ]);

  return html`
    <ul>
      ${users().map(user => html`
        <li key=${user.id}>${user.name}</li>
      `)}
    </ul>
  `;
});
```

### Dynamic Lists

```javascript
component("todo-list", () => {
  const todos = signal([]);
  const input = signal("");

  const addTodo = () => {
    if (input().trim()) {
      todos([...todos(), { id: Date.now(), text: input(), done: false }]);
      input("");
    }
  };

  const toggleTodo = (id) => {
    todos(todos().map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  return html`
    <div>
      <input
        value=${input()}
        @input=${(e) => input(e.target.value)}
        @keydown=${(e) => e.key === "Enter" && addTodo()}
      />
      <button @click=${addTodo}>Add</button>

      <ul>
        ${todos().map(todo => html`
          <li
            key=${todo.id}
            style="text-decoration: ${todo.done ? 'line-through' : 'none'}"
            @click=${() => toggleTodo(todo.id)}
          >
            ${todo.text}
          </li>
        `)}
      </ul>
    </div>
  `;
});
```

## Performance Optimization

### Memoization

Use `computed` or `memo` for expensive calculations:

```javascript
import { component, html, signal, computed } from "esor";

component("expensive-list", () => {
  const items = signal(Array.from({ length: 10000 }, (_, i) => i));

  const filteredItems = computed(() => {
    console.log("Filtering...");
    return items().filter(n => n % 2 === 0);
  });

  return html`
    <ul>
      ${filteredItems().slice(0, 100).map(n => html`
        <li key=${n}>${n}</li>
      `)}
    </ul>
  `;
});
```

### Batched Updates

Batch multiple signal updates:

```javascript
import { component, html, signal, batch } from "esor";

component("batch-demo", () => {
  const firstName = signal("Ana");
  const lastName = signal("Garcia");

  const updateName = () => {
    batch(() => {
      firstName("María");
      lastName("Lopez");
    });
    // Only triggers one re-render
  };

  return html`
    <div>
      <p>${firstName()} ${lastName()}</p>
      <button @click=${updateName}>Update</button>
    </div>
  `;
});
```

## Best Practices

### 1. Keep Components Small

✅ **Good:**
```javascript
component("user-card", ({ user }) => {...});
component("user-avatar", ({ url }) => {...});
component("user-info", ({ name, email }) => {...});
```

❌ **Bad:**
```javascript
component("user-everything", () => {
  // 500 lines of code
});
```

### 2. Use Meaningful Names

✅ **Good:**
```javascript
component("user-profile-card", ...);
component("shopping-cart-item", ...);
```

❌ **Bad:**
```javascript
component("comp-1", ...);
component("thing", ...);
```

### 3. Separate Concerns

```javascript
// ✅ Good: Separate logic from template
component("user-list", () => {
  const users = signal([]);
  const loading = signal(false);

  const loadUsers = async () => {
    loading(true);
    const data = await fetchUsers();
    users(data);
    loading(false);
  };

  onMount(loadUsers);

  return html`...`;
});
```

### 4. Clean Up Resources

```javascript
component("timer", () => {
  let interval;

  onMount(() => {
    interval = setInterval(() => {...}, 1000);
  });

  onDestroy(() => {
    clearInterval(interval); // ✅ Always cleanup
  });

  return html`...`;
});
```

## See Also

- [API Reference](./api) - Complete API documentation
- [Reactivity](./hooks) - Signals and effects
- [Tutorial](./tutorial) - Step-by-step guide
- [Examples](./examples) - Real-world examples
