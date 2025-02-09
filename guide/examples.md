# Ejemplos

## Counter App

```javascript
import { component, html, useSignal } from "esor";

component("counter-app", () => {
  const [count, setCount] = useSignal(0);

  return html`
    <div>
      <h1>Count: ${count}</h1>
      <button @click=${() => setCount(count + 1)}>+</button>
      <button @click=${() => setCount(count - 1)}>-</button>
    </div>
  `;
});
```

## Todo List

```javascript
import { component, html, useSignal } from "esor";

component("todo-list", () => {
  const [todos, setTodos] = useSignal([]);
  const [input, setInput] = useSignal("");

  const addTodo = () => {
    if (input()) {
      setTodos([...todos(), { id: Date.now(), text: input() }]);
      setInput("");
    }
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return html`
    <div>
      <input
        value=${input}
        @input=${(e) => setInput(e.target.value)}
        @keyup=${(e) => e.key === "Enter" && addTodo()}
      />
      <button @click=${addTodo}>Add Todo</button>

      <ul>
        ${todos().map(
          (todo) => html`
            <li key=${todo.id}>
              ${todo.text}
              <button @click=${() => removeTodo(todo.id)}>❌</button>
            </li>
          `
        )}
      </ul>
    </div>
  `;
});
```

## Fetch Data

```javascript
import { component, html, useSignal, useEffect } from "esor";

component("user-list", () => {
  const [users, setUsers] = useSignal([]);
  const [loading, setLoading] = useSignal(true);
  const [error, setError] = useSignal(null);

  useEffect(() => {
    fetch("https://api.example.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  });

  return html`
    <div>
      ${loading ? html`<p>Loading...</p>` : null} ${error
        ? html`<p>Error: ${error}</p>`
        : null}

      <ul>
        ${users.map(
          (user) => html`
            <li key=${user.id}>
              <h3>${user.name}</h3>
              <p>${user.email}</p>
            </li>
          `
        )}
      </ul>
    </div>
  `;
});
```
