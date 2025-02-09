# Hooks de Esor

## Hooks de Estado y Reactividad

### useSignal(initialValue)

Hook fundamental para crear estados reactivos.

```javascript
import { useSignal } from "esor";

// Uso básico
const [count, setCount] = useSignal(0);

// Leer valor
console.log(count);

// Establecer nuevo valor
setCount(1);

// Actualizar basado en valor previo
setCount(count + 1); //correcto

setCount((prev) => prev + 1); //incorrecto
```

::: warning
Para actualizar el signal se debe pasar el getter: js`setCount(count + 1)`, o directamente el valor js`setCount(1)`, esto se mostrará como un String:
js`setCount((prev) => prev + 1); ` a diferencia de otros.

:::

### useComputed(fn)

Crea una señal computada que se actualiza automáticamente cuando sus dependencias cambian.

```javascript
import { useSignal, useComputed } from "esor";

const [count, setCount] = useSignal(0);
const doubled = useComputed(() => count * 2);

// o simplemente hacer:
const doubled = () => count * 2;

// doubled() se actualizará automáticamente cuando count cambie
```

## Hooks de Efectos

### useEffect(fn)

Ejecuta efectos secundarios que se sincronizan con los cambios de estado.

```javascript
import { useEffect } from "esor";

useEffect(() => {
  // Este código se ejecuta cuando las dependencias cambian

  // Opcional: retornar función de limpieza
  return () => {
    // Cleanup
  };
});
```

## Hooks de Memorización

### useMemo(fn, deps)

Memoriza un valor calculado y solo lo recalcula cuando las dependencias cambian.

```javascript
import { useMemo } from "esor";

const memoizedValue = useMemo(() => computeExpensiveValue(dep), [dep]);
```

## Hooks de Referencias

### useRef()

Crea una referencia mutable que persiste entre renderizados.

```javascript
import { useRef } from "esor";

const ref = useRef();
// Acceder al valor actual
console.log(ref.current);
```

## Hooks de Store

### useStore(initialState, options)

Crea un store global con estado persistente opcional.

```javascript
import { useStore } from "esor";

const [state, store] = useStore(
  {
    count: 0,
  },
  {
    persist: "app-state", // opcional, para persistencia
  }
);

// Usar el store
store.setState((prev) => ({ ...prev, count: prev.count + 1 }));

// Suscribirse a cambios
store.subscribe((newState) => {
  console.log("State updated:", newState);
});
```

## Hooks de Ciclo de Vida

### onBeforeMount, onMount, onBeforeUpdate, onUpdate, onDestroy

Hooks para manejar el ciclo de vida del componente.

```javascript
import {
  onBeforeMount,
  onMount,
  onBeforeUpdate,
  onUpdate,
  onDestroy,
} from "esor";

// Se ejecuta antes de montar el componente
onBeforeMount(() => {
  console.log("Antes de montar");
});

// Se ejecuta después de montar el componente
onMount(() => {
  console.log("Componente montado");
});

// Se ejecuta antes de actualizar
onBeforeUpdate(() => {
  console.log("Antes de actualizar");
});

// Se ejecuta después de actualizar
onUpdate(() => {
  console.log("Componente actualizado");
});

// Se ejecuta cuando el componente se destruye
onDestroy(() => {
  console.log("Componente destruido");
});
```

## Hooks de Eventos

### useEmit(name, detail)

Hook para emitir eventos personalizados.

```javascript
import { useEmit } from "esor";

const event = useEmit("custom-event", {
  data: "some data",
});
```

## Hooks de Utilidad

### useBatch(fn)

Agrupa múltiples actualizaciones de estado en una sola actualización.

```javascript
import { useBatch } from "esor";

useBatch(() => {
  setCount(count + 1);
  setName("John");
  // Solo provocará una actualización
});
```
