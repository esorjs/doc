---
layout: doc
---

<script type="module" src="https://unpkg.com/playground-elements@0.18.1/playground-ide.js"></script>

<style>
  playground-ide {
    height: 500px;
    margin: 20px 0;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
  }
</style>

# Interactive Playground

Try Esor directly in your browser! Edit the code and see the results instantly.

## Counter Example

A simple reactive counter demonstrating signals and event handling.

<playground-ide editable-file-system line-numbers resizable>
  <script type="sample/html" filename="index.html">
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Esor Counter</title>
      </head>
      <body>
        <counter-app></counter-app>
        <script type="module" src="./counter.js"></script>
      </body>
    </html>
  </script>

  <script type="sample/js" filename="counter.js">
    import { component, html, signal } from "https://unpkg.com/esor@latest/dist/esor.js";

    component("counter-app", () => {
      const count = signal(0);

      const increment = () => count(count() + 1);
      const decrement = () => count(count() - 1);
      const reset = () => count(0);

      return html`
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
            padding: 20px;
            text-align: center;
          }

          h1 {
            color: #e74c3c;
            font-size: 3rem;
            margin: 0;
          }

          .buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
          }

          button {
            background: #3498db;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 10px 20px;
            transition: background 0.2s;
          }

          button:hover {
            background: #2980b9;
          }

          button:active {
            transform: scale(0.95);
          }

          .reset {
            background: #95a5a6;
          }

          .reset:hover {
            background: #7f8c8d;
          }
        </style>

        <div>
          <h1>${count()}</h1>
          <div class="buttons">
            <button @click=${decrement}>-</button>
            <button @click=${reset} class="reset">Reset</button>
            <button @click=${increment}>+</button>
          </div>
        </div>
      `;
    });
  </script>
</playground-ide>

## Todo List

A complete todo list with add, toggle, and remove functionality.

<playground-ide editable-file-system line-numbers resizable>
  <script type="sample/html" filename="index.html">
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Esor Todo List</title>
      </head>
      <body>
        <todo-app></todo-app>
        <script type="module" src="./todo.js"></script>
      </body>
    </html>
  </script>

  <script type="sample/js" filename="todo.js">
    import { component, html, signal } from "https://unpkg.com/esor@latest/dist/esor.js";

    component("todo-app", () => {
      const todos = signal([
        { id: 1, text: "Learn Esor", done: false },
        { id: 2, text: "Build something awesome", done: false }
      ]);
      const input = signal("");

      const addTodo = () => {
        if (input().trim()) {
          todos([
            ...todos(),
            { id: Date.now(), text: input(), done: false }
          ]);
          input("");
        }
      };

      const toggleTodo = (id) => {
        todos(
          todos().map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
          )
        );
      };

      const removeTodo = (id) => {
        todos(todos().filter(todo => todo.id !== id));
      };

      return html`
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
            max-width: 500px;
            margin: 20px auto;
            padding: 20px;
          }

          h1 {
            color: #2c3e50;
            text-align: center;
          }

          .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }

          input {
            flex: 1;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            padding: 10px;
          }

          input:focus {
            border-color: #3498db;
            outline: none;
          }

          button {
            background: #3498db;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 10px 20px;
          }

          button:hover {
            background: #2980b9;
          }

          ul {
            list-style: none;
            padding: 0;
          }

          li {
            align-items: center;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
            padding: 12px;
            transition: background 0.2s;
          }

          li:hover {
            background: #e9ecef;
          }

          .todo-text {
            cursor: pointer;
            flex: 1;
            user-select: none;
          }

          .done {
            color: #95a5a6;
            text-decoration: line-through;
          }

          .remove-btn {
            background: #e74c3c;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            padding: 4px 8px;
          }

          .remove-btn:hover {
            background: #c0392b;
          }
        </style>

        <div>
          <h1>📝 Todo List</h1>

          <div class="input-group">
            <input
              type="text"
              value=${input()}
              @input=${(e) => input(e.target.value)}
              @keydown=${(e) => e.key === "Enter" && addTodo()}
              placeholder="What needs to be done?"
            />
            <button @click=${addTodo}>Add</button>
          </div>

          <ul>
            ${todos().map(todo => html`
              <li key=${todo.id}>
                <span
                  class="todo-text ${todo.done ? 'done' : ''}"
                  @click=${() => toggleTodo(todo.id)}
                >
                  ${todo.done ? '✓' : '○'} ${todo.text}
                </span>
                <button class="remove-btn" @click=${() => removeTodo(todo.id)}>
                  ✕
                </button>
              </li>
            `)}
          </ul>
        </div>
      `;
    });
  </script>
</playground-ide>

## User Card with Computed Values

Demonstrates computed signals for derived state.

<playground-ide editable-file-system line-numbers resizable>
  <script type="sample/html" filename="index.html">
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Esor User Card</title>
      </head>
      <body>
        <user-form></user-form>
        <script type="module" src="./app.js"></script>
      </body>
    </html>
  </script>

  <script type="sample/js" filename="app.js">
    import { component, html, signal, computed } from "https://unpkg.com/esor@latest/dist/esor.js";

    component("user-form", () => {
      const firstName = signal("Ana");
      const lastName = signal("Garcia");
      const age = signal(25);

      // Computed values
      const fullName = computed(() => `${firstName()} ${lastName()}`);
      const isAdult = computed(() => age() >= 18);
      const yearOfBirth = computed(() => new Date().getFullYear() - age());

      return html`
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
            max-width: 500px;
            margin: 20px auto;
            padding: 20px;
          }

          .card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
            margin-bottom: 20px;
            padding: 30px;
            text-align: center;
          }

          .card h1 {
            font-size: 2rem;
            margin: 0 0 10px;
          }

          .badge {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
            padding: 5px 15px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
          }

          input {
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            padding: 10px;
            width: 100%;
            box-sizing: border-box;
          }

          input:focus {
            border-color: #667eea;
            outline: none;
          }
        </style>

        <div>
          <div class="card">
            <h1>${fullName()}</h1>
            <p>Age: ${age()} (Born in ${yearOfBirth()})</p>
            <div class="badge">
              ${isAdult() ? '🎓 Adult' : '👶 Minor'}
            </div>
          </div>

          <div class="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value=${firstName()}
              @input=${(e) => firstName(e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value=${lastName()}
              @input=${(e) => lastName(e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Age:</label>
            <input
              type="number"
              value=${age()}
              @input=${(e) => age(Number(e.target.value))}
              min="0"
              max="120"
            />
          </div>
        </div>
      `;
    });
  </script>
</playground-ide>

## Fetch Data Example

Real API integration with loading and error states.

<playground-ide editable-file-system line-numbers resizable>
  <script type="sample/html" filename="index.html">
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Esor Data Fetching</title>
      </head>
      <body>
        <user-list></user-list>
        <script type="module" src="./app.js"></script>
      </body>
    </html>
  </script>

  <script type="sample/js" filename="app.js">
    import { component, html, signal, onMount } from "https://unpkg.com/esor@latest/dist/esor.js";

    component("user-list", () => {
      const users = signal([]);
      const loading = signal(true);
      const error = signal(null);

      onMount(async () => {
        try {
          const response = await fetch("https://jsonplaceholder.typicode.com/users");
          if (!response.ok) throw new Error("Failed to fetch");
          const data = await response.json();
          users(data);
        } catch (err) {
          error(err.message);
        } finally {
          loading(false);
        }
      });

      return html`
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
          }

          h1 {
            color: #2c3e50;
            text-align: center;
          }

          .loading, .error {
            padding: 20px;
            text-align: center;
          }

          .error {
            background: #fee;
            border-radius: 4px;
            color: #c00;
          }

          .user-grid {
            display: grid;
            gap: 15px;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }

          .user-card {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            border-radius: 4px;
            padding: 15px;
            transition: transform 0.2s;
          }

          .user-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          .user-card h3 {
            color: #2c3e50;
            margin: 0 0 8px;
          }

          .user-card p {
            color: #7f8c8d;
            font-size: 14px;
            margin: 4px 0;
          }

          .company {
            background: #e8f4f8;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 8px;
            padding: 4px 8px;
          }
        </style>

        <div>
          <h1>👥 User Directory</h1>

          ${loading()
            ? html`<div class="loading">⏳ Loading users...</div>`
            : error()
            ? html`<div class="error">❌ Error: ${error()}</div>`
            : html`
              <div class="user-grid">
                ${users().map(user => html`
                  <div class="user-card" key=${user.id}>
                    <h3>${user.name}</h3>
                    <p>📧 ${user.email}</p>
                    <p>📱 ${user.phone}</p>
                    <p>🌐 ${user.website}</p>
                    <div class="company">
                      🏢 ${user.company.name}
                    </div>
                  </div>
                `)}
              </div>
            `
          }
        </div>
      `;
    });
  </script>
</playground-ide>

## Tips for Using the Playground

### Editing Code
- Click on any code section to start editing
- Changes are reflected in real-time in the preview pane
- Use the file tabs to switch between different files

### Available Exports
Esor is loaded from CDN and provides these exports:
```javascript
import {
  component,    // Create components
  html,         // Template tag
  signal,       // Reactive state
  computed,     // Computed signals
  effect,       // Side effects
  memo,         // Memoization
  batch,        // Batch updates
  onMount,      // Lifecycle hook
  onDestroy,    // Lifecycle hook
  onUpdate,     // Lifecycle hook
  onBeforeMount,
  onBeforeUpdate
} from "https://unpkg.com/esor@latest/dist/esor.js";
```

### Creating Multi-File Projects
You can create additional JavaScript or CSS files by adding more `<script>` tags in your playground. Just make sure to import them correctly!

### Troubleshooting
- **Nothing showing?** Check the browser console for errors
- **Syntax error?** Make sure you're calling signals as functions: `count()` not `count`
- **Import error?** Verify the import statement is correct

## Next Steps

- [Learn the Tutorial](./tutorial) - Step-by-step guide
- [Read the API Docs](./api) - Complete API reference
- [View More Examples](./examples) - Real-world examples
- [GitHub Repository](https://github.com/esorjs/esor) - Source code and issues

::: tip Experiment!
Try modifying the examples above! Change colors, add new features, or combine different patterns. The playground is a safe space to learn and experiment.
:::
