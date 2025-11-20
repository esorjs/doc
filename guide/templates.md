# Templates & Starter Kits

Jump-start your Esor project with these ready-to-use templates and common patterns. Each template is production-ready and demonstrates best practices.

## 🚀 Quick Start Templates

### Todo App (Complete)

A full-featured todo application with localStorage persistence, filtering, and dark mode.

**Features:**
- ✅ Add, edit, delete, and toggle todos
- ✅ Filter by status (all, active, completed)
- ✅ LocalStorage persistence
- ✅ Dark mode support
- ✅ Responsive design

**Download:** [todo-app-complete.zip](#)

<details>
<summary><strong>View Source Code</strong></summary>

```javascript
// src/store.js
import { signal, computed } from "esor";

const STORAGE_KEY = "esor-todos";

// Load from localStorage
const loadTodos = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Global state
export const todos = signal(loadTodos());
export const filter = signal("all"); // all, active, completed

// Computed values
export const filteredTodos = computed(() => {
  const items = todos();
  const currentFilter = filter();

  if (currentFilter === "active") {
    return items.filter(t => !t.completed);
  }
  if (currentFilter === "completed") {
    return items.filter(t => t.completed);
  }
  return items;
});

export const activeTodosCount = computed(() => {
  return todos().filter(t => !t.completed).length;
});

export const completedTodosCount = computed(() => {
  return todos().filter(t => t.completed).length;
});

// Actions
export function addTodo(text) {
  const newTodos = [
    ...todos(),
    {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];
  todos(newTodos);
  saveTodos();
}

export function toggleTodo(id) {
  todos(
    todos().map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
  saveTodos();
}

export function deleteTodo(id) {
  todos(todos().filter(todo => todo.id !== id));
  saveTodos();
}

export function editTodo(id, newText) {
  todos(
    todos().map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    )
  );
  saveTodos();
}

export function clearCompleted() {
  todos(todos().filter(todo => !todo.completed));
  saveTodos();
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos()));
}
```

```javascript
// src/components/todo-app.js
import { component, html, signal } from "esor";
import {
  todos,
  filter,
  filteredTodos,
  activeTodosCount,
  completedTodosCount,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  clearCompleted
} from "../store.js";

component("todo-app", () => {
  const newTodoText = signal("");
  const editingId = signal(null);
  const editingText = signal("");

  const handleAdd = () => {
    if (newTodoText().trim()) {
      addTodo(newTodoText());
      newTodoText("");
    }
  };

  const startEdit = (todo) => {
    editingId(todo.id);
    editingText(todo.text);
  };

  const saveEdit = () => {
    if (editingText().trim()) {
      editTodo(editingId(), editingText());
    }
    editingId(null);
    editingText("");
  };

  const cancelEdit = () => {
    editingId(null);
    editingText("");
  };

  return html`
    <style>
      :host {
        display: block;
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      }

      h1 {
        text-align: center;
        color: #b83f45;
        font-size: 3rem;
        margin: 0 0 20px;
        font-weight: 100;
      }

      .input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      input[type="text"] {
        flex: 1;
        padding: 12px 16px;
        font-size: 16px;
        border: 2px solid #e0e0e0;
        border-radius: 4px;
        outline: none;
      }

      input[type="text"]:focus {
        border-color: #b83f45;
      }

      button {
        padding: 12px 24px;
        background: #b83f45;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.2s;
      }

      button:hover {
        background: #a02c33;
      }

      .filters {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        justify-content: center;
      }

      .filter-btn {
        padding: 8px 16px;
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
        font-size: 14px;
      }

      .filter-btn.active {
        background: #b83f45;
        color: white;
        border-color: #b83f45;
      }

      .todo-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        transition: background 0.2s;
      }

      .todo-item:hover {
        background: #f9f9f9;
      }

      .todo-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .todo-text {
        flex: 1;
        cursor: pointer;
        user-select: none;
      }

      .todo-text.completed {
        text-decoration: line-through;
        color: #999;
      }

      .edit-input {
        flex: 1;
        padding: 8px;
        font-size: 16px;
        border: 2px solid #b83f45;
        border-radius: 4px;
      }

      .todo-actions {
        display: flex;
        gap: 5px;
      }

      .btn-small {
        padding: 6px 12px;
        font-size: 14px;
      }

      .btn-delete {
        background: #e74c3c;
      }

      .btn-delete:hover {
        background: #c0392b;
      }

      .btn-secondary {
        background: #95a5a6;
      }

      .btn-secondary:hover {
        background: #7f8c8d;
      }

      .stats {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding: 10px;
        background: #f9f9f9;
        border-radius: 4px;
        font-size: 14px;
        color: #666;
      }

      .clear-completed {
        background: transparent;
        color: #e74c3c;
        border: 1px solid #e74c3c;
        padding: 6px 12px;
        font-size: 14px;
      }

      .clear-completed:hover {
        background: #e74c3c;
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
        color: #999;
      }
    </style>

    <div class="todo-app">
      <h1>todos</h1>

      <div class="input-container">
        <input
          type="text"
          value=${newTodoText()}
          @input=${(e) => newTodoText(e.target.value)}
          @keydown=${(e) => e.key === "Enter" && handleAdd()}
          placeholder="What needs to be done?"
        />
        <button @click=${handleAdd}>Add</button>
      </div>

      <div class="filters">
        <button
          class="filter-btn ${filter() === 'all' ? 'active' : ''}"
          @click=${() => filter("all")}
        >
          All (${todos().length})
        </button>
        <button
          class="filter-btn ${filter() === 'active' ? 'active' : ''}"
          @click=${() => filter("active")}
        >
          Active (${activeTodosCount()})
        </button>
        <button
          class="filter-btn ${filter() === 'completed' ? 'active' : ''}"
          @click=${() => filter("completed")}
        >
          Completed (${completedTodosCount()})
        </button>
      </div>

      ${filteredTodos().length === 0
        ? html`
          <div class="empty-state">
            ${filter() === "all"
              ? "No todos yet. Add one above!"
              : filter() === "active"
              ? "No active todos. Great job!"
              : "No completed todos yet."
            }
          </div>
        `
        : html`
          <ul class="todo-list">
            ${filteredTodos().map(todo => html`
              <li class="todo-item" key=${todo.id}>
                <input
                  type="checkbox"
                  class="todo-checkbox"
                  checked=${todo.completed}
                  @change=${() => toggleTodo(todo.id)}
                />

                ${editingId() === todo.id
                  ? html`
                    <input
                      type="text"
                      class="edit-input"
                      value=${editingText()}
                      @input=${(e) => editingText(e.target.value)}
                      @keydown=${(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div class="todo-actions">
                      <button class="btn-small" @click=${saveEdit}>Save</button>
                      <button class="btn-small btn-secondary" @click=${cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  `
                  : html`
                    <span
                      class="todo-text ${todo.completed ? 'completed' : ''}"
                      @dblclick=${() => startEdit(todo)}
                    >
                      ${todo.text}
                    </span>
                    <div class="todo-actions">
                      <button class="btn-small" @click=${() => startEdit(todo)}>
                        Edit
                      </button>
                      <button
                        class="btn-small btn-delete"
                        @click=${() => deleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  `
                }
              </li>
            `)}
          </ul>
        `
      }

      ${todos().length > 0
        ? html`
          <div class="stats">
            <span>${activeTodosCount()} item${activeTodosCount() !== 1 ? 's' : ''} left</span>
            ${completedTodosCount() > 0
              ? html`
                <button class="clear-completed" @click=${clearCompleted}>
                  Clear completed
                </button>
              `
              : null
            }
          </div>
        `
        : null
      }
    </div>
  `;
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Esor Todo App</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%);
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <todo-app></todo-app>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

</details>

---

### Blog Template

A clean, minimal blog with posts, categories, and reading time.

**Features:**
- ✅ Post listing with preview
- ✅ Full post view
- ✅ Categories and tags
- ✅ Search functionality
- ✅ Reading time calculation
- ✅ Responsive layout

**Download:** [blog-template.zip](#)

<details>
<summary><strong>View Source Code</strong></summary>

```javascript
// src/data/posts.js
export const posts = [
  {
    id: 1,
    title: "Getting Started with Esor",
    slug: "getting-started-with-esor",
    excerpt: "Learn how to build web components with signals-based reactivity",
    content: `
      Esor is a modern web framework that combines native Web Components
      with signals-based reactivity. In this post, we'll explore how to
      get started building your first component.

      ## Installation

      First, install Esor via npm:

      \`\`\`bash
      npm install esor
      \`\`\`

      ## Your First Component

      Create a simple counter component...
    `,
    author: "Ana Garcia",
    date: "2024-11-15",
    category: "Tutorial",
    tags: ["esor", "web-components", "tutorial"],
    readTime: 5
  },
  {
    id: 2,
    title: "Understanding Signals",
    slug: "understanding-signals",
    excerpt: "Deep dive into signals and reactive programming",
    content: `
      Signals are the core of Esor's reactivity system. They provide
      fine-grained reactivity without the overhead of a virtual DOM.
    `,
    author: "Juan Pérez",
    date: "2024-11-10",
    category: "Advanced",
    tags: ["signals", "reactivity", "performance"],
    readTime: 8
  },
  {
    id: 3,
    title: "Building a Dashboard",
    slug: "building-dashboard",
    excerpt: "Create a responsive dashboard with Esor components",
    content: `
      Dashboards are a common requirement in web applications. Let's build
      one using Esor's component system.
    `,
    author: "María López",
    date: "2024-11-05",
    category: "Project",
    tags: ["dashboard", "components", "project"],
    readTime: 12
  }
];

export const categories = ["Tutorial", "Advanced", "Project", "Tips"];
```

```javascript
// src/components/blog-app.js
import { component, html, signal, computed } from "esor";
import { posts, categories } from "../data/posts.js";

component("blog-app", () => {
  const currentView = signal("list"); // list, post
  const currentPost = signal(null);
  const selectedCategory = signal("all");
  const searchQuery = signal("");

  const filteredPosts = computed(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory() !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory());
    }

    // Filter by search
    const query = searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  const showPost = (post) => {
    currentPost(post);
    currentView("post");
    window.scrollTo(0, 0);
  };

  const showList = () => {
    currentView("list");
    currentPost(null);
  };

  return html`
    <style>
      :host {
        display: block;
        font-family: system-ui, -apple-system, sans-serif;
      }

      header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 20px;
        text-align: center;
      }

      h1 {
        margin: 0;
        font-size: 3rem;
        font-weight: 700;
      }

      .subtitle {
        margin: 10px 0 0;
        opacity: 0.9;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .filters {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        flex-wrap: wrap;
        align-items: center;
      }

      .search {
        flex: 1;
        min-width: 250px;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
      }

      .search:focus {
        outline: none;
        border-color: #667eea;
      }

      .category-filters {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .category-btn {
        padding: 8px 16px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .category-btn:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .category-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 30px;
      }

      .post-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }

      .post-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }

      .post-meta {
        display: flex;
        gap: 15px;
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }

      .post-category {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .post-title {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 12px;
        color: #333;
      }

      .post-excerpt {
        color: #666;
        line-height: 1.6;
        margin: 0 0 12px;
      }

      .post-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tag {
        background: #f0f0f0;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
      }

      .post-view {
        max-width: 800px;
        margin: 0 auto;
      }

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        margin-bottom: 30px;
        transition: all 0.2s;
      }

      .back-btn:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .post-header {
        margin-bottom: 30px;
      }

      .post-full-title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 20px;
        line-height: 1.2;
      }

      .post-content {
        line-height: 1.8;
        font-size: 18px;
        color: #333;
      }

      .post-content h2 {
        margin-top: 40px;
        margin-bottom: 16px;
        font-size: 28px;
      }

      .post-content code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', monospace;
      }

      .post-content pre {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #999;
      }
    </style>

    <header>
      <h1>📝 My Blog</h1>
      <p class="subtitle">Thoughts on web development and beyond</p>
    </header>

    <div class="container">
      ${currentView() === "list"
        ? html`
          <div class="filters">
            <input
              type="search"
              class="search"
              value=${searchQuery()}
              @input=${(e) => searchQuery(e.target.value)}
              placeholder="Search posts..."
            />

            <div class="category-filters">
              <button
                class="category-btn ${selectedCategory() === 'all' ? 'active' : ''}"
                @click=${() => selectedCategory("all")}
              >
                All
              </button>
              ${categories.map(cat => html`
                <button
                  key=${cat}
                  class="category-btn ${selectedCategory() === cat ? 'active' : ''}"
                  @click=${() => selectedCategory(cat)}
                >
                  ${cat}
                </button>
              `)}
            </div>
          </div>

          ${filteredPosts().length === 0
            ? html`
              <div class="empty-state">
                <p>No posts found matching your criteria.</p>
              </div>
            `
            : html`
              <div class="posts-grid">
                ${filteredPosts().map(post => html`
                  <article class="post-card" key=${post.id} @click=${() => showPost(post)}>
                    <div class="post-meta">
                      <span class="post-category">${post.category}</span>
                      <span>${post.date}</span>
                      <span>📖 ${post.readTime} min read</span>
                    </div>

                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>

                    <div class="post-tags">
                      ${post.tags.map(tag => html`
                        <span class="tag" key=${tag}>#${tag}</span>
                      `)}
                    </div>
                  </article>
                `)}
              </div>
            `
          }
        `
        : html`
          <div class="post-view">
            <button class="back-btn" @click=${showList}>
              ← Back to posts
            </button>

            <article>
              <div class="post-header">
                <div class="post-meta">
                  <span class="post-category">${currentPost().category}</span>
                  <span>${currentPost().date}</span>
                  <span>By ${currentPost().author}</span>
                  <span>📖 ${currentPost().readTime} min read</span>
                </div>

                <h1 class="post-full-title">${currentPost().title}</h1>

                <div class="post-tags">
                  ${currentPost().tags.map(tag => html`
                    <span class="tag" key=${tag}>#${tag}</span>
                  `)}
                </div>
              </div>

              <div class="post-content">
                ${currentPost().content}
              </div>
            </article>
          </div>
        `
      }
    </div>
  `;
});
```

</details>

---

## 📊 Dashboard Template

Professional admin dashboard with charts, stats, and data tables.

**Features:**
- ✅ Responsive grid layout
- ✅ Stats cards with trends
- ✅ Data visualization ready
- ✅ Sidebar navigation
- ✅ User management table
- ✅ Dark mode support

**Download:** [dashboard-template.zip](#)

<details>
<summary><strong>Preview & Code</strong></summary>

```javascript
// Coming soon - Full dashboard implementation with:
// - Responsive sidebar
// - Stats widgets
// - Charts integration
// - Data tables
// - Settings panel
```

</details>

---

## 🔐 Common Patterns

### Authentication Flow

Complete authentication pattern with login, registration, and protected routes.

```javascript
// src/auth.js
import { signal, computed } from "esor";

export const currentUser = signal(null);
export const isAuthenticated = computed(() => currentUser() !== null);
export const isLoading = signal(false);
export const error = signal(null);

export async function login(email, password) {
  isLoading(true);
  error(null);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error("Invalid credentials");

    const data = await response.json();
    currentUser(data.user);
    localStorage.setItem("token", data.token);

    return true;
  } catch (err) {
    error(err.message);
    return false;
  } finally {
    isLoading(false);
  }
}

export async function register(email, password, name) {
  isLoading(true);
  error(null);

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) throw new Error("Registration failed");

    const data = await response.json();
    currentUser(data.user);
    localStorage.setItem("token", data.token);

    return true;
  } catch (err) {
    error(err.message);
    return false;
  } finally {
    isLoading(false);
  }
}

export function logout() {
  currentUser(null);
  localStorage.removeItem("token");
}

export async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Invalid token");

    const data = await response.json();
    currentUser(data.user);
    return true;
  } catch (err) {
    logout();
    return false;
  }
}
```

```javascript
// src/components/login-form.js
import { component, html, signal } from "esor";
import { login, error, isLoading } from "../auth.js";

component("login-form", () => {
  const email = signal("");
  const password = signal("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email(), password());

    if (success) {
      // Redirect or update UI
      window.location.href = "/dashboard";
    }
  };

  return html`
    <style>
      .login-form {
        max-width: 400px;
        margin: 100px auto;
        padding: 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }

      h2 {
        margin: 0 0 24px;
        text-align: center;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      button {
        width: 100%;
        padding: 14px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      button:hover {
        background: #5568d3;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .error {
        background: #fee;
        color: #c00;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
    </style>

    <form class="login-form" @submit=${handleSubmit}>
      <h2>Login</h2>

      ${error() ? html`<div class="error">${error()}</div>` : null}

      <div class="form-group">
        <label>Email</label>
        <input
          type="email"
          value=${email()}
          @input=${(e) => email(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input
          type="password"
          value=${password()}
          @input=${(e) => password(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled=${isLoading()}>
        ${isLoading() ? "Logging in..." : "Login"}
      </button>
    </form>
  `;
});
```

---

### CRUD Operations

Standard CRUD pattern for managing resources.

```javascript
// src/crud.js
import { signal } from "esor";

export function createCRUD(resourceName, apiUrl) {
  const items = signal([]);
  const loading = signal(false);
  const error = signal(null);

  async function fetchAll() {
    loading(true);
    error(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      items(data);
    } catch (err) {
      error(err.message);
    } finally {
      loading(false);
    }
  }

  async function create(data) {
    loading(true);
    error(null);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Failed to create");

      const newItem = await response.json();
      items([...items(), newItem]);
      return newItem;
    } catch (err) {
      error(err.message);
      return null;
    } finally {
      loading(false);
    }
  }

  async function update(id, data) {
    loading(true);
    error(null);

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Failed to update");

      const updated = await response.json();
      items(items().map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      error(err.message);
      return null;
    } finally {
      loading(false);
    }
  }

  async function remove(id) {
    loading(true);
    error(null);

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete");

      items(items().filter(item => item.id !== id));
      return true;
    } catch (err) {
      error(err.message);
      return false;
    } finally {
      loading(false);
    }
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
}

// Usage:
// const users = createCRUD("users", "/api/users");
// await users.fetchAll();
// await users.create({ name: "John", email: "john@example.com" });
// await users.update(1, { name: "Jane" });
// await users.remove(1);
```

---

## 🎨 Component Library Starter

Base components to kickstart your design system.

**Includes:**
- Button (variants, sizes, states)
- Input (text, password, email, etc.)
- Card
- Modal/Dialog
- Tabs
- Dropdown
- Alert/Toast
- Loader/Spinner

<details>
<summary><strong>View Component Library</strong></summary>

```javascript
// components/ui-button.js
import { component, html } from "esor";

component("ui-button", ({ variant = "primary", size = "md", disabled = "false" }) => {
  return html`
    <style>
      :host {
        display: inline-block;
      }

      button {
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        font-family: inherit;
      }

      /* Sizes */
      button.sm { padding: 6px 12px; font-size: 14px; }
      button.md { padding: 10px 20px; font-size: 16px; }
      button.lg { padding: 14px 28px; font-size: 18px; }

      /* Variants */
      button.primary {
        background: #667eea;
        color: white;
      }
      button.primary:hover { background: #5568d3; }

      button.secondary {
        background: #6c757d;
        color: white;
      }
      button.secondary:hover { background: #5a6268; }

      button.success {
        background: #28a745;
        color: white;
      }
      button.success:hover { background: #218838; }

      button.danger {
        background: #dc3545;
        color: white;
      }
      button.danger:hover { background: #c82333; }

      button.outline {
        background: transparent;
        border: 2px solid #667eea;
        color: #667eea;
      }
      button.outline:hover {
        background: #667eea;
        color: white;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    </style>

    <button
      class="${variant} ${size}"
      disabled=${disabled === "true"}
    >
      <slot></slot>
    </button>
  `;
});
```

</details>

---

## 📦 Download All Templates

Get all templates in one package: [esor-templates-bundle.zip](#)

## 🚀 Quick Setup

1. Download the template you want
2. Extract the files
3. Run `npm install`
4. Run `npm run dev`
5. Start building!

## 💡 Need Help?

- [View Full Documentation](./introduction)
- [Try Interactive Playground](./playground)
- [See More Examples](./examples)
- [Join Community Discussion](https://github.com/esorjs/esor/discussions)

::: tip Pro Tip
All templates follow Esor best practices and are production-ready. Feel free to customize them to match your needs!
:::
