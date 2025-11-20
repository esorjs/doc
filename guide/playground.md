---
layout: doc
---

<script setup>
import { onMounted } from 'vue';

const examples = {
  counter: {
    title: 'Counter Example',
    description: 'A simple reactive counter demonstrating signals and event handling.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esor Counter</title>
  </head>
  <body>
    <counter-app></counter-app>
    <script type="module" src="./counter.js"><` + `/script>
  </body>
</html>`,
      'counter.js': `import { component, html, signal } from "https://unpkg.com/esor@latest/dist/esor.js";

component("counter-app", () => {
  const count = signal(0);

  const increment = () => count(count() + 1);
  const decrement = () => count(count() - 1);
  const reset = () => count(0);

  return html\`
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
    </` + `style>

    <div>
      <h1>\${count()}</h1>
      <div class="buttons">
        <button @click=\${decrement}>-</button>
        <button @click=\${reset} class="reset">Reset</button>
        <button @click=\${increment}>+</button>
      </div>
    </div>
  \`;
});`
    }
  },
  todo: {
    title: 'Todo List',
    description: 'A complete todo list with add, toggle, and remove functionality.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Esor Todo List</title>
  </head>
  <body>
    <todo-app></todo-app>
    <script type="module" src="./todo.js"><` + `/script>
  </body>
</html>`,
      'todo.js': `import { component, html, signal } from "https://unpkg.com/esor@latest/dist/esor.js";

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
    todos(todos().map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTodo = (id) => {
    todos(todos().filter(t => t.id !== id));
  };

  return html\`
    <style>
      :host {
        display: block;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        font-family: system-ui, sans-serif;
      }

      h1 {
        text-align: center;
        color: #2c3e50;
      }

      .input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
      }

      input {
        flex: 1;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }

      button {
        padding: 10px 20px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      button:hover {
        background: #2980b9;
      }

      .todo-list {
        list-style: none;
        padding: 0;
      }

      .todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #f8f9fa;
        margin-bottom: 8px;
        border-radius: 4px;
      }

      .todo-item.done {
        opacity: 0.6;
      }

      .todo-item.done span {
        text-decoration: line-through;
      }

      .todo-item input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .todo-item span {
        flex: 1;
      }

      .remove-btn {
        padding: 4px 8px;
        background: #e74c3c;
        font-size: 14px;
      }

      .remove-btn:hover {
        background: #c0392b;
      }
    </` + `style>

    <div>
      <h1>📝 My Tasks</h1>
      <div class="input-group">
        <input
          type="text"
          placeholder="Add a new task..."
          :value=\${input()}
          @input=\${(e) => input(e.target.value)}
          @keypress=\${(e) => e.key === 'Enter' && addTodo()}
        />
        <button @click=\${addTodo}>Add</button>
      </div>
      <ul class="todo-list">
        \${todos().map(todo => html\`
          <li class="\${todo.done ? 'todo-item done' : 'todo-item'}" key=\${todo.id}>
            <input
              type="checkbox"
              :checked=\${todo.done}
              @change=\${() => toggleTodo(todo.id)}
            />
            <span>\${todo.text}</span>
            <button class="remove-btn" @click=\${() => removeTodo(todo.id)}>
              ✕
            </button>
          </li>
        \`)}
      </ul>
    </div>
  \`;
});`
    }
  },
  userCard: {
    title: 'User Card Component',
    description: 'A reusable user card component with props and custom styling.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Esor User Card</title>
  </head>
  <body>
    <user-card name="Alice" role="Developer" avatar="👩‍💻"></user-card>
    <script type="module" src="./user-card.js"><` + `/script>
  </body>
</html>`,
      'user-card.js': `import { component, html } from "https://unpkg.com/esor@latest/dist/esor.js";

component("user-card", ({ name, role, avatar }) => {
  return html\`
    <style>
      :host {
        display: block;
        max-width: 300px;
        margin: 20px;
      }

      .card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 30px;
        color: white;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        text-align: center;
      }

      .avatar {
        font-size: 4rem;
        margin-bottom: 15px;
      }

      h2 {
        margin: 0 0 5px 0;
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        opacity: 0.9;
        font-size: 1rem;
      }
    </` + `style>

    <div class="card">
      <div class="avatar">\${avatar}</div>
      <h2>\${name}</h2>
      <p>\${role}</p>
    </div>
  \`;
});`
    }
  },
  randomUser: {
    title: 'Fetch Data Example',
    description: 'Fetching data from an API and displaying it reactively with loading states.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Esor Data Fetching</title>
  </head>
  <body>
    <random-user></random-user>
    <script type="module" src="./random-user.js"><` + `/script>
  </body>
</html>`,
      'random-user.js': `import { component, html, signal, effect } from "https://unpkg.com/esor@latest/dist/esor.js";

component("random-user", () => {
  const user = signal(null);
  const loading = signal(false);

  const fetchUser = async () => {
    loading(true);
    try {
      const res = await fetch('https://randomuser.me/api/');
      const data = await res.json();
      user(data.results[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      loading(false);
    }
  };

  // Fetch on mount
  effect(() => {
    fetchUser();
  });

  return html\`
    <style>
      :host {
        display: block;
        max-width: 400px;
        margin: 20px auto;
        font-family: system-ui, sans-serif;
      }

      .container {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 20px;
      }

      .user-info {
        margin: 20px 0;
      }

      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto 15px;
      }

      .name {
        font-size: 1.5rem;
        font-weight: bold;
        color: #34495e;
        margin: 10px 0 5px;
      }

      .email {
        color: #7f8c8d;
        margin: 5px 0;
      }

      button {
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;
      }

      button:hover {
        background: #2980b9;
      }

      button:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }

      .loading {
        color: #7f8c8d;
        padding: 40px;
      }
    </` + `style>

    <div class="container">
      <h2>🎲 Random User Generator</h2>
      \${loading() ? html\`
        <div class="loading">Loading...</div>
      \` : user() ? html\`
        <div class="user-info">
          <img class="avatar" src="\${user().picture.large}" alt="User avatar" />
          <div class="name">
            \${user().name.first} \${user().name.last}
          </div>
          <div class="email">\${user().email}</div>
        </div>
        <button @click=\${fetchUser}>Get Another User</button>
      \` : null}
    </div>
  \`;
});`
    }
  }
};

onMounted(() => {
  // Load playground-elements
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://unpkg.com/playground-elements@0.18.1/playground-ide.js';
  document.head.appendChild(script);

  script.onload = () => {
    setTimeout(() => {
      createPlaygrounds();
      initTheme();
    }, 200);
  };
});

function createPlaygrounds() {
  Object.entries(examples).forEach(([id, example]) => {
    const container = document.getElementById(`playground-${id}`);
    if (!container) return;

    const ide = document.createElement('playground-ide');
    ide.setAttribute('editable-file-system', '');
    ide.setAttribute('line-numbers', '');
    ide.setAttribute('resizable', '');

    Object.entries(example.files).forEach(([filename, content]) => {
      const script = document.createElement('script');
      const ext = filename.split('.').pop();
      script.setAttribute('type', `sample/${ext === 'js' ? 'js' : ext}`);
      script.setAttribute('filename', filename);
      script.textContent = content;
      ide.appendChild(script);
    });

    container.appendChild(ide);
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem('playground-theme') ||
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('playground-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('playground-theme', newTheme);
    });
  });
}

function applyTheme(theme) {
  document.querySelectorAll('playground-ide').forEach(ide => {
    ide.classList.remove('light-theme', 'dark-theme');
    ide.classList.add(`${theme}-theme`);
  });

  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    const icon = toggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'light' ? '🌙' : '☀️';
      toggle.querySelector('.theme-label').textContent =
        theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  });
}
</script>

<style>
  .playground-controls {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin: 20px 0 12px;
    align-items: center;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .theme-toggle:hover {
    background: var(--vp-c-bg-mute);
  }

  .example-section {
    margin: 40px 0;
  }

  .example-section h3 {
    margin-bottom: 8px;
  }

  .example-section p {
    margin-bottom: 16px;
    color: var(--vp-c-text-2);
  }

  .playground-container {
    margin: 20px 0;
    min-height: 400px;
  }

  /* Dark mode theme for playground */
  playground-ide.dark-theme {
    --playground-code-background: #1e1e1e;
    --playground-code-default-color: #d4d4d4;
    --playground-code-comment-color: #6a9955;
    --playground-code-keyword-color: #569cd6;
    --playground-code-number-color: #b5cea8;
    --playground-code-string-color: #ce9178;
    --playground-code-atom-color: #4ec9b0;
    --playground-code-property-color: #9cdcfe;
    --playground-code-variable-color: #9cdcfe;
    --playground-code-callee-color: #dcdcaa;
    --playground-code-operator-color: #d4d4d4;
    --playground-border-color: #3e3e3e;
    --playground-preview-toolbar-background: #252526;
    --playground-preview-toolbar-foreground: #cccccc;
    --playground-bar-background: #252526;
    --playground-highlight-color: #094771;
  }

  /* Light mode theme for playground */
  playground-ide.light-theme {
    --playground-code-background: #ffffff;
    --playground-code-default-color: #000000;
    --playground-code-comment-color: #008000;
    --playground-code-keyword-color: #0000ff;
    --playground-code-number-color: #098658;
    --playground-code-string-color: #a31515;
    --playground-code-atom-color: #0451a5;
    --playground-code-property-color: #001080;
    --playground-code-variable-color: #001080;
    --playground-code-callee-color: #795e26;
    --playground-code-operator-color: #000000;
    --playground-border-color: #e5e5e5;
    --playground-preview-toolbar-background: #f3f3f3;
    --playground-preview-toolbar-foreground: #383838;
    --playground-bar-background: #f3f3f3;
    --playground-highlight-color: #add6ff;
  }
</style>

# Interactive Playground

Try Esor directly in your browser! Edit the code and see the results instantly.

<div class="playground-controls">
  <div class="theme-toggle">
    <span class="theme-icon">🌙</span>
    <span class="theme-label">Dark Mode</span>
  </div>
</div>

## Counter Example

<div class="example-section">
  <p>A simple reactive counter demonstrating signals and event handling.</p>
  <div id="playground-counter" class="playground-container"></div>
</div>

## Todo List

<div class="example-section">
  <p>A complete todo list with add, toggle, and remove functionality.</p>
  <div id="playground-todo" class="playground-container"></div>
</div>

## User Card Component

<div class="example-section">
  <p>A reusable user card component with props and custom styling.</p>
  <div id="playground-userCard" class="playground-container"></div>
</div>

## Fetch Data Example

<div class="example-section">
  <p>Fetching data from an API and displaying it reactively with loading states.</p>
  <div id="playground-randomUser" class="playground-container"></div>
</div>

## Next Steps

- Check out the [Templates & Starter Kits](/guide/templates) for production-ready code
- Learn more about [Esor's API](/guide/api)
- Explore [practical examples](/guide/examples)
