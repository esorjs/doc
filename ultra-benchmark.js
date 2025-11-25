// ultra-benchmark.js
import { signal as alienSignal, computed as alienComputed, effect as alienEffect, startBatch, endBatch } from 'alien-signals';
import { signal, computed, effect, batch } from './ultra-signals.js';

// Test básico de funcionamiento
const count = signal(1);
const doubleCount = computed(() => count() * 2);

effect(() => {
  console.log(`Count is: ${count()}`);
}); // Console: Count is: 1

console.log(doubleCount()); // 2

count.set(2); // Console: Count is: 2

console.log(doubleCount()); // 4

function runBenchmark(name, setup, test, iterations = 100000) {
    // Setup una vez antes del warmup
    const context = setup();

    // Warmup
    for (let i = 0; i < 1000; i++) {
        test(context, i);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        test(context, i);
    }
    const end = performance.now();

    const time = end - start;
    const opsPerMs = iterations / time;

    console.log(`${name}: ${opsPerMs.toFixed(3)} ops/ms (${time.toFixed(2)}ms for ${iterations} iterations)`);

    return opsPerMs;
}

console.log('\n=== ULTRA BENCHMARK - Signal Operations ===\n');

// Test 1: Creación y lectura básica de señales
const alien1 = runBenchmark('AlienSignals - Basic Signal RW',
    () => {
        const s = alienSignal(0);
        return s;
    },
    (s, i) => {
        s(i);
        return s();
    }
);

const ultra1 = runBenchmark('UltraSignals - Basic Signal RW',
    () => {
        const s = signal(0);
        return s;
    },
    (s, i) => {
        s.set(i);
        return s();
    }
);

// Test 2: Computadas con dependencias
const alien2 = runBenchmark('AlienSignals - Computed Chain',
    () => {
        const a = alienSignal(1);
        const b = alienSignal(2);
        const c = alienComputed(() => a() + b());
        const d = alienComputed(() => c() * 2);
        return { a, b, c, d };
    },
    (nodes, i) => {
        nodes.a(i);
        nodes.b(i + 1);
        return nodes.d();
    }
);

const ultra2 = runBenchmark('UltraSignals - Computed Chain',
    () => {
        const a = signal(1);
        const b = signal(2);
        const c = computed(() => a() + b());
        const d = computed(() => c() * 2);
        return { a, b, c, d };
    },
    (nodes, i) => {
        nodes.a.set(i);
        nodes.b.set(i + 1);
        return nodes.d();
    }
);

// Test 3: Efectos y batch operations
const alien3 = runBenchmark('AlienSignals - Effects + Batch',
    () => {
        const signals = Array.from({ length: 100 }, (_, i) => alienSignal(i));
        let effectCount = 0;
        const dispose = alienEffect(() => {
            signals.forEach(s => s());
            effectCount++;
        });
        return { signals, dispose };
    },
    (ctx, i) => {
        startBatch();
        ctx.signals.forEach((s, idx) => s(idx + i));
        endBatch();
    }
);

const ultra3 = runBenchmark('UltraSignals - Effects + Batch',
    () => {
        const signals = Array.from({ length: 100 }, (_, i) => signal(i));
        let effectCount = 0;
        const dispose = effect(() => {
            signals.forEach(s => s());
            effectCount++;
        });
        return { signals, dispose };
    },
    (ctx, i) => {
        batch(() => {
            ctx.signals.forEach((s, idx) => s.set(idx + i));
        });
    }
);

// Test 4: Deep dependency chains (100 niveles)
const alien4 = runBenchmark('AlienSignals - Deep Chain 100',
    () => {
        const base = alienSignal(0);
        let current = base;
        for (let i = 0; i < 100; i++) {
            const prev = current;
            current = alienComputed(() => prev() + 1);
        }
        return { base, last: current };
    },
    (ctx, i) => {
        ctx.base(i);
        return ctx.last();
    }
);

const ultra4 = runBenchmark('UltraSignals - Deep Chain 100',
    () => {
        const base = signal(0);
        let current = base;
        for (let i = 0; i < 100; i++) {
            const prev = current;
            current = computed(() => prev() + 1);
        }
        return { base, last: current };
    },
    (ctx, i) => {
        ctx.base.set(i);
        return ctx.last();
    }
);

// Resultados comparativos
console.log('\n=== RESULTADOS COMPARATIVOS ===');
const tests = [
    { alien: alien1, ultra: ultra1, name: 'Basic Signal RW' },
    { alien: alien2, ultra: ultra2, name: 'Computed Chain' },
    { alien: alien3, ultra: ultra3, name: 'Effects + Batch' },
    { alien: alien4, ultra: ultra4, name: 'Deep Chain 100' }
];

tests.forEach(test => {
    const improvement = ((test.ultra - test.alien) / test.alien) * 100;
    const status = improvement >= 0 ? 'MÁS RÁPIDO' : 'más lento';
    console.log(`${test.name}: UltraSignals es ${Math.abs(improvement).toFixed(2)}% ${status} (${test.ultra.toFixed(3)} vs ${test.alien.toFixed(3)} ops/ms)`);
});

// Test específico para alcanzar el target de 1,692 ops/ms
console.log('\n=== TARGET TEST: 1,692 ops/ms ===');
const targetTest = runBenchmark('UltraSignals - Target Challenge',
    () => {
        const a = signal(1);
        const b = signal(2);
        const c = computed(() => a() + b());
        const d = computed(() => c() * 2);
        const e = computed(() => d() + a());
        return { a, b, c, d, e };
    },
    (nodes, i) => {
        nodes.a.set(i % 100);
        nodes.b.set((i + 1) % 100);
        return nodes.e();
    },
    500000 // Más iteraciones para mejor precisión
);

console.log(`RESULTADO FINAL: ${targetTest.toFixed(3)} ops/ms`);
console.log(targetTest >= 1692 ? '✅ OBJETIVO SUPERADO' : '❌ OBJETIVO NO ALCANZADO');
