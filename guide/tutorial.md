# Tutorial Básico

## Creando tu Primer Componente

### 1. Estructura Básica

```javascript
import { component, html } from "esor";

component("my-component", () => {
  return html` <div>Mi primer componente</div> `;
});
```

### 2. Añadiendo Estado

```javascript
import { component, html, useSignal } from "esor";

component("counter-app", () => {
  const [count, setCount] = useSignal(0);

  return html`
    <div>
      <h2>Contador: ${count}</h2>
      <button @click=${() => setCount(count() + 1)}>Incrementar</button>
    </div>
  `;
});

// o

import { component, html, useSignal } from "esor";

component("counter-app", () => {
  const [count, setCount] = useSignal(0);

  return html`
    <div>
      <h2>Contador: ${count}</h2>
      <button @click=${() => setCount(count + 1)}>Incrementar</button> //
      directamente count
    </div>
  `;
});
```

### 3. Usando Props

```javascript
import { component, html } from "esor";

component("user-card", (props) => {
  return html`
    <div class="card">
      <h3>${props.name}</h3>
      <p>${props.email}</p>
    </div>
  `;
});

//o con destructuracion:

component("user-card", (props) => {
  const { name, email } = props;
  return html`
    <div class="card">
      <h3>${name}</h3>
      <p>${email}</p>
    </div>
  `;
});

// Uso:
// <user-card name="Juan" email="juan@example.com"></user-card>
```

### 4. Manejo de Eventos

```javascript
import { component, html, useSignal } from "esor";

component("todo-list", () => {
  const [todos, setTodos] = useSignal([]);
  const [input, setInput] = useSignal("");

  const addTodo = () => {
    if (input()) {
      setTodos([...todos, input()]);
      setInput("");
    }
  };

  return html`
    <div>
      <input value=${input} @input=${(e) => setInput(e.target.value)} />
      <button @click=${addTodo}>Añadir</button>
      <ul>
        ${todos.map((todo) => html`<li>${todo}</li>`)}
      </ul>
    </div>
  `;
});
```

### 5. Ciclo de Vida

```javascript
import { component, html, onMount, onDestroy } from "esor";

component("lifecycle-demo", () => {
  onMount(() => {
    console.log("Componente montado");
  });

  onDestroy(() => {
    console.log("Componente destruido");
  });

  return html`<div>Demo del ciclo de vida</div>`;
});
```
