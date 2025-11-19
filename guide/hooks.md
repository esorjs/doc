# Reactivity System

Esor's reactivity system is built on **signals**, inspired by SolidJS. This guide covers all reactive primitives and their advanced usage.

## Signals

### signal(initialValue)

Signals are the foundation of Esor's reactivity. They are getter/setter functions that track changes automatically.

```javascript
import { signal } from "esor";

const count = signal(0);

// Read value
console.log(count()); // 0

// Write value
count(5);

// Update based on current value
count(count() + 1);
```

#### Signal Behavior

**✅ Correct usage:**
```javascript
const name = signal("Ana");
console.log(name()); // Read
name("Juan"); // Write
```

**❌ Incorrect usage:**
```javascript
const count = signal(0);
count++; // ❌ Won't work
count.value = 5; // ❌ Not supported
const [val, set] = count; // ❌ Not supported (this is React, not Esor)
```

#### Complex Values

Signals can hold any type of value:

```javascript
const user = signal({
  name: "Ana",
  email: "ana@example.com",
  age: 25
});

// Read
console.log(user().name); // "Ana"

// Update (immutable pattern recommended)
user({
  ...user(),
  age: 26
});
```

**For arrays:**
```javascript
const items = signal([1, 2, 3]);

// Add item
items([...items(), 4]);

// Filter
items(items().filter(x => x !== 2));

// Map
items(items().map(x => x * 2));
```

::: tip Best Practice
For complex objects and arrays, always create new references instead of mutating:
```javascript
// ✅ Good - creates new reference
items([...items(), newItem]);

// ❌ Bad - mutates without signaling
items().push(newItem);
```
:::

## Computed Values

### computed(fn)

Computed signals automatically recalculate when their dependencies change.

```javascript
import { signal, computed } from "esor";

const firstName = signal("Ana");
const lastName = signal("Garcia");

const fullName = computed(() => {
  return `${firstName()} ${lastName()}`;
});

console.log(fullName()); // "Ana Garcia"

firstName("María");
console.log(fullName()); // "María Garcia"
```

#### Computed Chains

Computed values can depend on other computed values:

```javascript
const price = signal(100);
const quantity = signal(2);
const taxRate = signal(0.21);

const subtotal = computed(() => price() * quantity());
const tax = computed(() => subtotal() * taxRate());
const total = computed(() => subtotal() + tax());

console.log(total()); // 242
```

#### Performance

Computed values are **lazy** and **cached**:
- They only recalculate when accessed AND dependencies changed
- They cache the result until dependencies change

```javascript
const expensive = computed(() => {
  console.log("Computing...");
  return items().reduce((a, b) => a + b, 0);
});

// Doesn't compute yet
expensive(); // Logs: "Computing..." Returns: result
expensive(); // Cached, no log
expensive(); // Still cached

items([1, 2, 3, 4]); // Dependency changed
expensive(); // Logs: "Computing..." Returns: new result
```

## Effects

### effect(fn)

Effects run side effects automatically when their dependencies change.

```javascript
import { signal, effect } from "esor";

const count = signal(0);

effect(() => {
  console.log(`Count is: ${count()}`);
});

// Immediately logs: "Count is: 0"

count(1); // Logs: "Count is: 1"
count(2); // Logs: "Count is: 2"
```

#### Effect Cleanup

Effects can return a cleanup function:

```javascript
const userId = signal(1);

effect(() => {
  const id = userId();

  console.log(`Subscribing to user ${id}`);
  const unsubscribe = subscribeToUser(id);

  // Cleanup runs before next effect
  return () => {
    console.log(`Unsubscribing from user ${id}`);
    unsubscribe();
  };
});

userId(2);
// Logs: "Unsubscribing from user 1"
// Logs: "Subscribing to user 2"
```

#### Stopping Effects

The `effect` function returns a dispose function:

```javascript
const dispose = effect(() => {
  console.log(count());
});

count(1); // Logs: 1
count(2); // Logs: 2

dispose(); // Stop the effect

count(3); // No log
```

#### Common Use Cases

**Data fetching:**
```javascript
const userId = signal(1);
const userData = signal(null);

effect(() => {
  fetch(`/api/users/${userId()}`)
    .then(r => r.json())
    .then(data => userData(data));
});
```

**LocalStorage sync:**
```javascript
const theme = signal(localStorage.getItem("theme") || "light");

effect(() => {
  localStorage.setItem("theme", theme());
});
```

**DOM measurements:**
```javascript
import { onMount } from "esor";

const width = signal(0);

onMount(() => {
  const updateWidth = () => width(window.innerWidth);

  effect(() => {
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  });
});
```

## Memoization

### memo(fn, equals?)

Similar to `computed`, but with optional custom equality checking:

```javascript
import { signal, memo } from "esor";

const items = signal([1, 2, 3]);

const sum = memo(
  () => items().reduce((a, b) => a + b, 0),
  (prev, next) => prev === next // Optional custom equality
);
```

### When to Use memo vs computed

- Use `computed` for simple derived values
- Use `memo` when:
  - You need custom equality checks
  - You have expensive computations
  - You want explicit control over recalculation

```javascript
const largeList = signal([/* thousands of items */]);

// Expensive computation
const processedList = memo(() => {
  return largeList().map(item => /* complex processing */);
});
```

## Batched Updates

### batch(fn)

Group multiple signal updates to trigger effects only once:

```javascript
import { signal, effect, batch } from "esor";

const firstName = signal("Ana");
const lastName = signal("Garcia");

effect(() => {
  console.log(`${firstName()} ${lastName()}`);
});

// Without batch: logs twice
firstName("María");
lastName("Lopez");

// With batch: logs once
batch(() => {
  firstName("María");
  lastName("Lopez");
});
```

## Advanced Patterns

### Store Pattern

Create a global store using signals:

```javascript
import { signal, computed } from "esor";

// store.js
export const store = {
  // State
  user: signal(null),
  cart: signal([]),

  // Computed
  cartTotal: computed(() => {
    return store.cart().reduce((sum, item) => sum + item.price, 0);
  }),

  // Actions
  addToCart(item) {
    store.cart([...store.cart(), item]);
  },

  removeFromCart(id) {
    store.cart(store.cart().filter(item => item.id !== id));
  }
};
```

**Usage:**
```javascript
import { component, html } from "esor";
import { store } from "./store.js";

component("cart-total", () => {
  return html`
    <div>Total: $${store.cartTotal()}</div>
  `;
});
```

### Derived Signals

Create signals that derive from others:

```javascript
function createDebouncedSignal(source, delay = 300) {
  const debounced = signal(source());
  let timeout;

  effect(() => {
    const value = source();
    clearTimeout(timeout);
    timeout = setTimeout(() => debounced(value), delay);
  });

  return debounced;
}

const search = signal("");
const debouncedSearch = createDebouncedSignal(search, 500);

effect(() => {
  console.log("Searching for:", debouncedSearch());
});
```

### Async Signals

Handle async operations with signals:

```javascript
import { signal, effect } from "esor";

function createAsyncSignal(fetcher) {
  const data = signal(null);
  const loading = signal(false);
  const error = signal(null);

  const load = async (...args) => {
    loading(true);
    error(null);

    try {
      const result = await fetcher(...args);
      data(result);
    } catch (err) {
      error(err.message);
    } finally {
      loading(false);
    }
  };

  return { data, loading, error, load };
}

// Usage
const userApi = createAsyncSignal(
  (id) => fetch(`/api/users/${id}`).then(r => r.json())
);

component("user-profile", () => {
  const userId = signal(1);

  effect(() => {
    userApi.load(userId());
  });

  return html`
    <div>
      ${userApi.loading()
        ? html`<p>Loading...</p>`
        : userApi.error()
        ? html`<p>Error: ${userApi.error()}</p>`
        : html`<div>${userApi.data()?.name}</div>`
      }
    </div>
  `;
});
```

## Lifecycle Hooks

### onMount(callback)

Called after component is added to the DOM:

```javascript
import { component, html, signal, onMount } from "esor";

component("data-component", () => {
  const data = signal(null);

  onMount(async () => {
    const response = await fetch("/api/data");
    data(await response.json());
  });

  return html`<div>${data() ? data().name : "Loading..."}</div>`;
});
```

### onDestroy(callback)

Called before component is removed from the DOM:

```javascript
import { component, html, signal, onMount, onDestroy } from "esor";

component("timer-component", () => {
  const time = signal(0);
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      time(time() + 1);
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  return html`<div>Time: ${time()}s</div>`;
});
```

### onUpdate(callback)

Called after each update:

```javascript
import { onUpdate } from "esor";

component("tracked-component", () => {
  onUpdate(() => {
    console.log("Component updated");
    // Analytics, logging, etc.
  });

  return html`<div>Content</div>`;
});
```

### onBeforeMount(callback)

Called before component is mounted:

```javascript
import { onBeforeMount } from "esor";

component("pre-mount", () => {
  onBeforeMount(() => {
    console.log("About to mount");
  });

  return html`<div>Content</div>`;
});
```

### onBeforeUpdate(callback)

Called before each update:

```javascript
import { onBeforeUpdate } from "esor";

component("pre-update", () => {
  onBeforeUpdate(() => {
    console.log("About to update");
  });

  return html`<div>Content</div>`;
});
```

## Best Practices

### 1. Keep Signals Simple

✅ **Good:**
```javascript
const firstName = signal("Ana");
const lastName = signal("Garcia");
const fullName = computed(() => `${firstName()} ${lastName()}`);
```

❌ **Bad:**
```javascript
const everything = signal({
  firstName: "Ana",
  lastName: "Garcia",
  fullName: "Ana Garcia" // Derived data shouldn't be in state
});
```

### 2. Use Computed for Derived Values

✅ **Good:**
```javascript
const price = signal(100);
const quantity = signal(2);
const total = computed(() => price() * quantity());
```

❌ **Bad:**
```javascript
const price = signal(100);
const quantity = signal(2);
const total = signal(200); // Manually updated - error-prone
```

### 3. Clean Up Effects

✅ **Good:**
```javascript
effect(() => {
  const handler = () => console.log("resize");
  window.addEventListener("resize", handler);

  return () => {
    window.removeEventListener("resize", handler);
  };
});
```

❌ **Bad:**
```javascript
effect(() => {
  window.addEventListener("resize", handler); // Memory leak!
});
```

### 4. Avoid Deep Nesting

✅ **Good:**
```javascript
const user = signal(null);
const userName = computed(() => user()?.name || "Guest");
```

❌ **Bad:**
```javascript
const app = signal({
  state: {
    user: {
      profile: {
        name: "Ana"
      }
    }
  }
});
```

## Performance Tips

1. **Use computed for expensive calculations** - They cache results
2. **Batch updates** when changing multiple signals
3. **Use memo** for expensive operations with custom equality
4. **Avoid unnecessary signal reads** in loops
5. **Cleanup effects** to prevent memory leaks

## See Also

- [API Reference](./api) - Complete API documentation
- [Tutorial](./tutorial) - Step-by-step guide
- [Components Guide](./components) - Component patterns
- [Examples](./examples) - Real-world examples
