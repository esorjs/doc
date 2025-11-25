// ultra-signals.js
let CURRENT_EFFECT = null;
let BATCH_DEPTH = 0;
let QUEUE = [];
let QUEUE_LENGTH = 0;

let VERSION = 0;

// Sistema ultra-optimizado sin clases, usando objetos planos
const createSignal = (value) => {
  const node = {
    value,
    version: 0,
    dependents: null,
    pendingValue: value,
  };

  const getter = () => {
    if (CURRENT_EFFECT) {
      if (!node.dependents) node.dependents = new Set();
      if (!node.dependents.has(CURRENT_EFFECT)) {
        node.dependents.add(CURRENT_EFFECT);
        CURRENT_EFFECT.dependencies.add(node);
      }
    }
    return node.value;
  };

  getter.set = (newValue) => {
    if (node.pendingValue !== newValue) {
      node.pendingValue = newValue;
      node.version++;
      markDirty(node);
    }
  };

  getter.node = node;
  return getter;
};

const createComputed = (fn) => {
  const node = {
    value: undefined,
    version: 0,
    dependents: null,
    dependencies: new Set(),
    fn,
    state: 1, // DIRTY
  };

  const getter = () => {
    if (node.state !== 0) {
      // Not CLEAN
      updateComputed(node);
    }

    if (CURRENT_EFFECT && node.dependents) {
      if (!node.dependents.has(CURRENT_EFFECT)) {
        node.dependents.add(CURRENT_EFFECT);
        CURRENT_EFFECT.dependencies.add(node);
      }
    }

    return node.value;
  };

  getter.node = node;
  return getter;
};

const createEffect = (fn) => {
  const effect = {
    fn,
    dependencies: new Set(),
    state: 0, // CLEAN
    scheduled: false,
  };

  const run = () => {
    const previous = CURRENT_EFFECT;
    CURRENT_EFFECT = effect;

    try {
      // Limpiar dependencias anteriores
      for (const dep of effect.dependencies) {
        if (dep.dependents) dep.dependents.delete(effect);
      }
      effect.dependencies.clear();

      effect.fn();
      effect.state = 0; // CLEAN
    } finally {
      CURRENT_EFFECT = previous;
    }
  };

  run();

  return () => {
    for (const dep of effect.dependencies) {
      if (dep.dependents) dep.dependents.delete(effect);
    }
    effect.dependencies.clear();
  };
};

const batch = (fn) => {
  BATCH_DEPTH++;
  try {
    fn();
  } finally {
    BATCH_DEPTH--;
    if (BATCH_DEPTH === 0) {
      flush();
    }
  }
};

// Funciones internas ultra-optimizadas
const markDirty = (node) => {
  if (node.dependents) {
    for (const effect of node.dependents) {
      if (effect.state === 0) {
        // CLEAN
        effect.state = 1; // DIRTY
        if (!effect.scheduled) {
          effect.scheduled = true;
          if (QUEUE_LENGTH < 10000) {
            // Prevenir crecimiento excesivo
            QUEUE[QUEUE_LENGTH++] = effect;
          }
        }
      }
    }
  }
};

const updateComputed = (node) => {
  const previous = CURRENT_EFFECT;
  CURRENT_EFFECT = node;

  try {
    // Limpiar dependencias antiguas
    for (const dep of node.dependencies) {
      if (dep.dependents) dep.dependents.delete(node);
    }
    node.dependencies.clear();

    const newValue = node.fn(node.value);
    if (newValue !== node.value) {
      node.value = newValue;
      node.version++;
      markDirty(node);
    }
    node.state = 0; // CLEAN
  } finally {
    CURRENT_EFFECT = previous;
  }
};

const flush = () => {
  VERSION++;
  let count = QUEUE_LENGTH;

  for (let i = 0; i < count; i++) {
    const effect = QUEUE[i];
    if (effect && effect.state === 1) {
      // DIRTY
      effect.scheduled = false;
      effect.state = 0; // CLEAN

      const previous = CURRENT_EFFECT;
      CURRENT_EFFECT = effect;

      try {
        // Limpiar antes de ejecutar
        for (const dep of effect.dependencies) {
          if (dep.dependents) dep.dependents.delete(effect);
        }
        effect.dependencies.clear();

        effect.fn();
      } finally {
        CURRENT_EFFECT = previous;
      }
    }
    QUEUE[i] = null;
  }

  QUEUE_LENGTH = 0;
};

// API para benchmarks
export const signal = createSignal;
export const computed = createComputed;
export const effect = createEffect;
export { batch };

// Funciones de utilidad para benchmarks
export const getVersion = () => VERSION;

// Utilidades de diagnóstico
export const getActiveEffect = () => CURRENT_EFFECT;
export const getBatchDepth = () => BATCH_DEPTH;
