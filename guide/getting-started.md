# Guía de Inicio Rápido

## Instalación

### NPM

```bash
npm install esor
```

### CDN

```html
<script type="module">
  import { component, html } from "https://unpkg.com/esor/dist/esor.js";
</script>
```

## Uso Básico

```javascript
import { component, html, useSignal } from "esor";

// Crear un componente
component("hello-world", () => {
  // Estado local
  const [name, setName] = useSignal("Mundo");

  return html`
    <div>
      <h1>Hola ${name}!</h1>
      <input value=${name} @input=${(e) => setName(e.target.value)} />
    </div>
  `;
});
```

## Uso en el Proyecto

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/src/components/hello-world.js"></script>
  </head>
  <body>
    <hello-world></hello-world>
  </body>
</html>
```
