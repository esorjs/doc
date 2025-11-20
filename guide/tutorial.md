# Basic Tutorial

This tutorial will guide you through the fundamental concepts of Esor by building increasingly complex components. Each step introduces a new concept that builds upon the previous one.

## 1. Your First Component

Let's start with the simplest possible component:

```javascript
import { component, html } from "esor";

component("hello-world", () => {
  return html`<h1>Hello, World!</h1>`;
});
```

**Usage:**
```html
<hello-world></hello-world>
```

::: tip
Component names must contain a hyphen (`-`) to comply with the Custom Elements specification. This prevents conflicts with standard HTML elements.
:::

## 2. Adding Reactive State

Now let's add reactivity using signals:

```javascript
import { component, html, signal } from "esor";

component("counter-app", () => {
  const count = signal(0);

  return html`
    <div>
      <h2>Count: ${count()}</h2>
      <button @click=${() => count(count() + 1)}>Increment</button>
    </div>
  `;
});
```

**Key concepts:**
- `signal(initialValue)` creates a reactive value
- Call `count()` to **read** the current value
- Call `count(newValue)` to **update** the value
- The template automatically re-renders when the signal changes

## 3. Working with Props

Components can receive data through attributes:

```javascript
import { component, html } from "esor";

component("user-card", (props) => {
  return html`
    <div class="card">
      <h3>${props.name}</h3>
      <p>${props.email}</p>
      <p>Role: ${props.role || "User"}</p>
    </div>
  `;
});
```

**Usage:**
```html
<user-card
  name="Ana Garcia"
  email="ana@example.com"
  role="Developer">
</user-card>
```

You can also destructure props:

```javascript
component("user-card", ({ name, email, role = "User" }) => {
  return html`
    <div class="card">
      <h3>${name}</h3>
      <p>${email}</p>
      <p>Role: ${role}</p>
    </div>
  `;
});
```

## 4. Event Handling

Esor uses the `@event` syntax for event listeners:

```javascript
import { component, html, signal } from "esor";

component("text-input", () => {
  const text = signal("");
  const charCount = signal(0);

  const handleInput = (e) => {
    const value = e.target.value;
    text(value);
    charCount(value.length);
  };

  return html`
    <div>
      <input
        type="text"
        value=${text()}
        @input=${handleInput}
        placeholder="Type something..."
      />
      <p>Characters: ${charCount()}</p>
      <p>You typed: ${text()}</p>
    </div>
  `;
});
```

**Common events:**
- `@click` - Click events
- `@input` - Input changes
- `@change` - Value changes
- `@submit` - Form submissions
- `@keydown`, `@keyup` - Keyboard events

## 5. Rendering Lists

Use JavaScript's array methods to render lists:

```javascript
import { component, html, signal } from "esor";

component("task-list", () => {
  const tasks = signal([
    { id: 1, text: "Learn Esor", done: false },
    { id: 2, text: "Build a component", done: false },
  ]);

  const newTask = signal("");

  const addTask = () => {
    if (newTask().trim()) {
      tasks([
        ...tasks(),
        { id: Date.now(), text: newTask(), done: false }
      ]);
      newTask("");
    }
  };

  const toggleTask = (id) => {
    tasks(
      tasks().map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return html`
    <div>
      <input
        value=${newTask()}
        @input=${(e) => newTask(e.target.value)}
        @keydown=${(e) => e.key === "Enter" && addTask()}
        placeholder="New task..."
      />
      <button @click=${addTask}>Add</button>

      <ul>
        ${tasks().map(task => html`
          <li
            style="text-decoration: ${task.done ? 'line-through' : 'none'}"
            @click=${() => toggleTask(task.id)}
          >
            ${task.text}
          </li>
        `)}
      </ul>
    </div>
  `;
});
```

## 6. Lifecycle Hooks

Lifecycle hooks let you run code at specific moments:

```javascript
import { component, html, signal, onMount, onDestroy } from "esor";

component("timer-app", () => {
  const seconds = signal(0);
  let interval;

  onMount(() => {
    console.log("Timer started");
    interval = setInterval(() => {
      seconds(seconds() + 1);
    }, 1000);
  });

  onDestroy(() => {
    console.log("Timer stopped");
    clearInterval(interval);
  });

  return html`
    <div>
      <h2>Timer: ${seconds()}s</h2>
    </div>
  `;
});
```

**Available lifecycle hooks:**
- `onMount()` - Called after the component is added to the DOM
- `onDestroy()` - Called before the component is removed from the DOM

## 7. Computed Values

Use `computed` to derive values from signals:

```javascript
import { component, html, signal, computed } from "esor";

component("price-calculator", () => {
  const price = signal(100);
  const quantity = signal(1);
  const taxRate = signal(0.21); // 21% tax

  const subtotal = computed(() => price() * quantity());
  const tax = computed(() => subtotal() * taxRate());
  const total = computed(() => subtotal() + tax());

  return html`
    <div>
      <label>
        Price: $<input
          type="number"
          value=${price()}
          @input=${(e) => price(Number(e.target.value))}
        />
      </label>

      <label>
        Quantity: <input
          type="number"
          value=${quantity()}
          @input=${(e) => quantity(Number(e.target.value))}
        />
      </label>

      <hr>
      <p>Subtotal: $${subtotal().toFixed(2)}</p>
      <p>Tax (21%): $${tax().toFixed(2)}</p>
      <h3>Total: $${total().toFixed(2)}</h3>
    </div>
  `;
});
```

## Next Steps

You now know the basics of Esor! Continue learning:

- [API Reference](./api) - Detailed API documentation
- [Reactivity System](./hooks) - Deep dive into signals and effects
- [Components Guide](./components) - Advanced component patterns
- [Examples](./examples) - Real-world examples

::: tip Practice Project
Try building a simple notes app that combines everything you've learned:
- Create, edit, and delete notes
- Store notes in localStorage
- Filter notes by search term
- Use lifecycle hooks to load/save data
:::
