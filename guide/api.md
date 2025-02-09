# Documentación de la API

## Componentes

### component(name, setup)

Crea un nuevo componente web personalizado.

```javascript
component("my-component", (props) => {
  // setup code
  return html`...`,
  });
```

## Hooks

### useSignal(initialValue)

Crea una señal reactiva.

```javascript
const [value, setValue] = useSignal(initialValue);
```

### useEffect(callback)

Ejecuta efectos secundarios.

```javascript
useEffect(() => {
  // efecto
  return () => {
    // cleanup
  };
});
```

### useMemo(fn, deps)

Memoriza un valor computado.

```javascript
const memoized = useMemo(() => computeValue(dep), [dep]);
```

## Template System

### html

Template tag para crear templates HTML reactivos y estaticos.

```javascript
html`
  <div class=${className}>
    ${dynamicContent}
    <button @click=${handleClick}>Click</button>
  </div>
`;
```

## Lifecycle Hooks

### onMount

```javascript
onMount(() => {
  // código a ejecutar al montar
});
```

### onDestroy

```javascript
onDestroy(() => {
  // código a ejecutar al destruir
});
```

## Event Handling

### Eventos DOM

```javascript
html`<button @click=${handler}>Click</button>`;
```