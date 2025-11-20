# Practical Examples

Real-world examples demonstrating common patterns and use cases with Esor.

## Shopping Cart

A complete shopping cart with add, remove, and total calculation.

```javascript
import { component, html, signal, computed } from "esor";

component("shopping-cart", () => {
  const cart = signal([]);

  const total = computed(() => {
    return cart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const addItem = (product) => {
    const existing = cart().find(item => item.id === product.id);

    if (existing) {
      cart(cart().map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      cart([...cart(), { ...product, quantity: 1 }]);
    }
  };

  const removeItem = (id) => {
    cart(cart().filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      cart(cart().map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  // Sample products
  const products = [
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 29 },
    { id: 3, name: "Keyboard", price: 79 },
  ];

  return html`
    <div class="shopping-cart">
      <h2>Products</h2>
      <div class="products">
        ${products.map(product => html`
          <div class="product">
            <span>${product.name} - $${product.price}</span>
            <button @click=${() => addItem(product)}>Add to Cart</button>
          </div>
        `)}
      </div>

      <h2>Cart</h2>
      ${cart().length === 0
        ? html`<p>Cart is empty</p>`
        : html`
          <div class="cart-items">
            ${cart().map(item => html`
              <div class="cart-item" key=${item.id}>
                <span>${item.name}</span>
                <input
                  type="number"
                  min="0"
                  value=${item.quantity}
                  @input=${(e) => updateQuantity(item.id, Number(e.target.value))}
                />
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button @click=${() => removeItem(item.id)}>Remove</button>
              </div>
            `)}
          </div>
          <h3>Total: $${total().toFixed(2)}</h3>
        `
      }
    </div>
  `;
});
```

## User Search with Debounce

Search users with debounced API calls to avoid excessive requests.

```javascript
import { component, html, signal, effect, onDestroy } from "esor";

component("user-search", () => {
  const searchTerm = signal("");
  const results = signal([]);
  const loading = signal(false);
  let debounceTimeout;

  effect(() => {
    const term = searchTerm();

    // Clear previous timeout
    clearTimeout(debounceTimeout);

    if (term.length < 2) {
      results([]);
      return;
    }

    loading(true);

    // Debounce search
    debounceTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?q=${term}`
        );
        const data = await response.json();
        results(data);
      } catch (error) {
        console.error("Search failed:", error);
        results([]);
      } finally {
        loading(false);
      }
    }, 300);
  });

  onDestroy(() => {
    clearTimeout(debounceTimeout);
  });

  return html`
    <div class="user-search">
      <input
        type="text"
        placeholder="Search users..."
        value=${searchTerm()}
        @input=${(e) => searchTerm(e.target.value)}
      />

      ${loading()
        ? html`<p>Searching...</p>`
        : results().length > 0
        ? html`
          <ul>
            ${results().map(user => html`
              <li key=${user.id}>
                <strong>${user.name}</strong> - ${user.email}
              </li>
            `)}
          </ul>
        `
        : searchTerm().length >= 2
        ? html`<p>No results found</p>`
        : null
      }
    </div>
  `;
});
```

## Form Validation

A contact form with real-time validation.

```javascript
import { component, html, signal, computed } from "esor";

component("contact-form", () => {
  const name = signal("");
  const email = signal("");
  const message = signal("");
  const submitted = signal(false);

  // Validation
  const nameError = computed(() => {
    return submitted() && name().trim().length < 2
      ? "Name must be at least 2 characters"
      : "";
  });

  const emailError = computed(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return submitted() && !emailPattern.test(email())
      ? "Please enter a valid email"
      : "";
  });

  const messageError = computed(() => {
    return submitted() && message().trim().length < 10
      ? "Message must be at least 10 characters"
      : "";
  });

  const isValid = computed(() => {
    return !nameError() && !emailError() && !messageError();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitted(true);

    if (isValid()) {
      console.log("Form submitted:", {
        name: name(),
        email: email(),
        message: message()
      });

      // Reset form
      name("");
      email("");
      message("");
      submitted(false);

      alert("Message sent successfully!");
    }
  };

  return html`
    <form @submit=${handleSubmit} class="contact-form">
      <div class="field">
        <label>Name:</label>
        <input
          type="text"
          value=${name()}
          @input=${(e) => name(e.target.value)}
          class=${nameError() ? "error" : ""}
        />
        ${nameError() ? html`<span class="error-msg">${nameError()}</span>` : null}
      </div>

      <div class="field">
        <label>Email:</label>
        <input
          type="email"
          value=${email()}
          @input=${(e) => email(e.target.value)}
          class=${emailError() ? "error" : ""}
        />
        ${emailError() ? html`<span class="error-msg">${emailError()}</span>` : null}
      </div>

      <div class="field">
        <label>Message:</label>
        <textarea
          value=${message()}
          @input=${(e) => message(e.target.value)}
          class=${messageError() ? "error" : ""}
        ></textarea>
        ${messageError() ? html`<span class="error-msg">${messageError()}</span>` : null}
      </div>

      <button type="submit">Send Message</button>
    </form>
  `;
});
```

## Dark Mode Toggle with Persistence

Toggle dark mode and persist the preference in localStorage.

```javascript
import { component, html, signal, effect, onMount } from "esor";

component("dark-mode-toggle", () => {
  const isDark = signal(false);

  // Load preference on mount
  onMount(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      isDark(saved === "true");
    }
  });

  // Sync with localStorage and apply theme
  effect(() => {
    const dark = isDark();
    localStorage.setItem("darkMode", String(dark));
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  });

  const toggle = () => isDark(!isDark());

  return html`
    <button @click=${toggle} class="theme-toggle">
      ${isDark() ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  `;
});
```

## Tabs Component

Reusable tabs component demonstrating component composition.

```javascript
import { component, html, signal } from "esor";

component("tab-group", ({ tabs: tabsData }) => {
  const tabs = JSON.parse(tabsData || "[]");
  const activeTab = signal(0);

  return html`
    <div class="tab-group">
      <div class="tab-headers">
        ${tabs.map((tab, index) => html`
          <button
            key=${index}
            class=${activeTab() === index ? "active" : ""}
            @click=${() => activeTab(index)}
          >
            ${tab.title}
          </button>
        `)}
      </div>

      <div class="tab-content">
        ${tabs[activeTab()]?.content || ""}
      </div>
    </div>
  `;
});
```

**Usage:**
```html
<tab-group tabs='[
  {"title": "Tab 1", "content": "Content for tab 1"},
  {"title": "Tab 2", "content": "Content for tab 2"},
  {"title": "Tab 3", "content": "Content for tab 3"}
]'></tab-group>
```

## Infinite Scroll List

Load more items as you scroll to the bottom.

```javascript
import { component, html, signal, onMount, onDestroy } from "esor";

component("infinite-list", () => {
  const items = signal([]);
  const page = signal(1);
  const loading = signal(false);
  const hasMore = signal(true);
  let scrollContainer;

  const loadMore = async () => {
    if (loading() || !hasMore()) return;

    loading(true);

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page()}&_limit=10`
      );
      const newItems = await response.json();

      if (newItems.length === 0) {
        hasMore(false);
      } else {
        items([...items(), ...newItems]);
        page(page() + 1);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      loading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  };

  onMount(() => {
    loadMore(); // Load initial items
  });

  return html`
    <div class="infinite-list" @scroll=${handleScroll}>
      ${items().map(item => html`
        <div class="item" key=${item.id}>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </div>
      `)}

      ${loading() ? html`<div class="loader">Loading...</div>` : null}
      ${!hasMore() ? html`<div class="end">No more items</div>` : null}
    </div>
  `;
});
```

## Timer with Controls

A timer with start, pause, and reset controls.

```javascript
import { component, html, signal, onMount, onDestroy } from "esor";

component("timer-app", () => {
  const seconds = signal(0);
  const isRunning = signal(false);
  let interval;

  const start = () => {
    if (!isRunning()) {
      isRunning(true);
      interval = setInterval(() => {
        seconds(seconds() + 1);
      }, 1000);
    }
  };

  const pause = () => {
    isRunning(false);
    clearInterval(interval);
  };

  const reset = () => {
    pause();
    seconds(0);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hours, minutes, secs]
      .map(n => String(n).padStart(2, "0"))
      .join(":");
  };

  onDestroy(() => {
    clearInterval(interval);
  });

  return html`
    <div class="timer">
      <h1>${formatTime(seconds())}</h1>
      <div class="controls">
        ${!isRunning()
          ? html`<button @click=${start}>Start</button>`
          : html`<button @click=${pause}>Pause</button>`
        }
        <button @click=${reset}>Reset</button>
      </div>
    </div>
  `;
});
```

## See Also

- [Tutorial](./tutorial) - Learn the basics step by step
- [API Reference](./api) - Complete API documentation
- [Reactivity](./hooks) - Deep dive into signals and effects
- [Components](./components) - Component patterns and best practices
