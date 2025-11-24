/**
 * BENCHMARK SUITE: alien-signals vs hyper-signals
 *
 * Ejecutar con: node --expose-gc benchmark.js
 */

// ============================================================================
// SETUP
// ============================================================================

// Importar implementaciones (ajustar rutas según necesidad)
import * as alien from './alien-signals.js';
import * as hyper from './hyper-signals.js';

const WARMUP_ITERATIONS = 1000;
const BENCHMARK_ITERATIONS = 10000;

// ============================================================================
// UTILITIES
// ============================================================================

function measure(name, fn, iterations = BENCHMARK_ITERATIONS) {
	// Warmup
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		fn();
	}

	// Force GC before measurement
	if (global.gc) global.gc();

	// Measure
	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		fn();
	}
	const end = performance.now();

	const total = end - start;
	const avg = total / iterations;

	return { total, avg, iterations };
}

function formatResult(name, alienResult, hyperResult) {
	const improvement = ((alienResult.avg - hyperResult.avg) / alienResult.avg * 100).toFixed(1);
	const speedup = (alienResult.avg / hyperResult.avg).toFixed(2);

	console.log(`\n${name}:`);
	console.log(`  alien-signals: ${alienResult.avg.toFixed(3)} ms/op`);
	console.log(`  hyper-signals: ${hyperResult.avg.toFixed(3)} ms/op`);
	console.log(`  → ${improvement}% faster (${speedup}x speedup)`);
}

function measureMemory(name, fn) {
	if (!global.gc) {
		console.log('⚠️  Run with --expose-gc for memory measurements');
		return null;
	}

	global.gc();
	const before = process.memoryUsage().heapUsed;

	fn();

	global.gc();
	const after = process.memoryUsage().heapUsed;

	const diff = after - before;
	console.log(`\n${name} Memory:`);
	console.log(`  ${(diff / 1024).toFixed(2)} KB used`);

	return diff;
}

// ============================================================================
// BENCHMARKS
// ============================================================================

console.log('🚀 REACTIVE SIGNALS BENCHMARK SUITE\n');
console.log('=' .repeat(60));

// ----------------------------------------------------------------------------
// 1. Simple Signal Updates
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 1: Simple Signal Updates');
console.log('-'.repeat(60));

const alienResult1 = measure('alien-signals', () => {
	const s = alien.signal(0);
	s(1);
	s(2);
	s(3);
});

const hyperResult1 = measure('hyper-signals', () => {
	const s = hyper.signal(0);
	s(1);
	s(2);
	s(3);
});

formatResult('Simple Signal Updates', alienResult1, hyperResult1);

// ----------------------------------------------------------------------------
// 2. Computed Chain (A → B → C → D → E)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 2: Computed Chain (A→B→C→D→E)');
console.log('-'.repeat(60));

const alienResult2 = measure('alien-signals', () => {
	const a = alien.signal(1);
	const b = alien.computed(() => a() * 2);
	const c = alien.computed(() => b() * 2);
	const d = alien.computed(() => c() * 2);
	const e = alien.computed(() => d() * 2);

	a(2); // Triggers chain
	e(); // Read result
});

const hyperResult2 = measure('hyper-signals', () => {
	const a = hyper.signal(1);
	const b = hyper.computed(() => a() * 2);
	const c = hyper.computed(() => b() * 2);
	const d = hyper.computed(() => c() * 2);
	const e = hyper.computed(() => d() * 2);

	a(2); // Triggers chain
	e(); // Read result
});

formatResult('Computed Chain', alienResult2, hyperResult2);

// ----------------------------------------------------------------------------
// 3. Fan-out (1 Signal → 100 Effects)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 3: Fan-out (1 signal → 100 effects)');
console.log('-'.repeat(60));

const alienResult3 = measure('alien-signals', () => {
	const s = alien.signal(0);
	let sum = 0;

	// Create 100 effects
	for (let i = 0; i < 100; i++) {
		alien.effect(() => {
			sum += s();
		});
	}

	s(1); // Triggers all 100 effects
}, 100); // Fewer iterations (heavy test)

const hyperResult3 = measure('hyper-signals', () => {
	const s = hyper.signal(0);
	let sum = 0;

	// Create 100 effects
	for (let i = 0; i < 100; i++) {
		hyper.effect(() => {
			sum += s();
		});
	}

	s(1); // Triggers all 100 effects
}, 100);

formatResult('Fan-out (100 effects)', alienResult3, hyperResult3);

// ----------------------------------------------------------------------------
// 4. Diamond Dependency (A → B,C; B,C → D)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 4: Diamond Dependency');
console.log('-'.repeat(60));

const alienResult4 = measure('alien-signals', () => {
	const a = alien.signal(1);
	const b = alien.computed(() => a() * 2);
	const c = alien.computed(() => a() * 3);
	const d = alien.computed(() => b() + c());

	a(2);
	d(); // Should only compute once
});

const hyperResult4 = measure('hyper-signals', () => {
	const a = hyper.signal(1);
	const b = hyper.computed(() => a() * 2);
	const c = hyper.computed(() => a() * 3);
	const d = hyper.computed(() => b() + c());

	a(2);
	d(); // Should only compute once
});

formatResult('Diamond Dependency', alienResult4, hyperResult4);

// ----------------------------------------------------------------------------
// 5. Deep Chain (20 levels)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 5: Deep Chain (20 computed levels)');
console.log('-'.repeat(60));

const alienResult5 = measure('alien-signals', () => {
	let current = alien.signal(1);

	// Build chain of 20 computed
	for (let i = 0; i < 20; i++) {
		const prev = current;
		current = alien.computed(() => prev() + 1);
	}

	alien.signal.prototype = current;
	alien.signal.prototype(2); // Trigger
	current(); // Read
}, 1000);

const hyperResult5 = measure('hyper-signals', () => {
	let current = hyper.signal(1);

	// Build chain of 20 computed
	for (let i = 0; i < 20; i++) {
		const prev = current;
		current = hyper.computed(() => prev() + 1);
	}

	hyper.signal.prototype = current;
	hyper.signal.prototype(2); // Trigger
	current(); // Read
}, 1000);

formatResult('Deep Chain (20 levels)', alienResult5, hyperResult5);

// ----------------------------------------------------------------------------
// 6. Batching (100 updates in batch)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 6: Batching (100 updates)');
console.log('-'.repeat(60));

const alienResult6 = measure('alien-signals', () => {
	const s = alien.signal(0);
	let count = 0;

	alien.effect(() => {
		s();
		count++;
	});

	alien.startBatch();
	for (let i = 0; i < 100; i++) {
		s(i);
	}
	alien.endBatch(); // Should only trigger effect once
}, 1000);

const hyperResult6 = measure('hyper-signals', () => {
	const s = hyper.signal(0);
	let count = 0;

	hyper.effect(() => {
		s();
		count++;
	});

	hyper.startBatch();
	for (let i = 0; i < 100; i++) {
		s(i);
	}
	hyper.endBatch(); // Should only trigger effect once
}, 1000);

formatResult('Batching (100 updates)', alienResult6, hyperResult6);

// ----------------------------------------------------------------------------
// 7. Dynamic Dependencies
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 7: Dynamic Dependencies');
console.log('-'.repeat(60));

const alienResult7 = measure('alien-signals', () => {
	const a = alien.signal(1);
	const b = alien.signal(2);
	const toggle = alien.signal(true);

	const c = alien.computed(() => {
		return toggle() ? a() : b();
	});

	c(); // Depends on a
	toggle(false);
	c(); // Now depends on b
	a(10); // Shouldn't trigger c anymore
	c();
});

const hyperResult7 = measure('hyper-signals', () => {
	const a = hyper.signal(1);
	const b = hyper.signal(2);
	const toggle = hyper.signal(true);

	const c = hyper.computed(() => {
		return toggle() ? a() : b();
	});

	c(); // Depends on a
	toggle(false);
	c(); // Now depends on b
	a(10); // Shouldn't trigger c anymore
	c();
});

formatResult('Dynamic Dependencies', alienResult7, hyperResult7);

// ----------------------------------------------------------------------------
// 8. Memory Usage Test
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 8: Memory Usage (1000 signals)');
console.log('-'.repeat(60));

const alienMem = measureMemory('alien-signals', () => {
	const signals = [];
	for (let i = 0; i < 1000; i++) {
		const s = alien.signal(i);
		signals.push(s);
	}

	// Create dependencies
	for (let i = 0; i < 999; i++) {
		alien.computed(() => signals[i]() + signals[i + 1]());
	}
});

const hyperMem = measureMemory('hyper-signals', () => {
	const signals = [];
	for (let i = 0; i < 1000; i++) {
		const s = hyper.signal(i);
		signals.push(s);
	}

	// Create dependencies
	for (let i = 0; i < 999; i++) {
		hyper.computed(() => signals[i]() + signals[i + 1]());
	}
});

if (alienMem && hyperMem) {
	const reduction = ((alienMem - hyperMem) / alienMem * 100).toFixed(1);
	console.log(`\n  → ${reduction}% less memory used by hyper-signals`);
}

// ----------------------------------------------------------------------------
// 9. Object Pooling Test (Stress Test)
// ----------------------------------------------------------------------------

console.log('\n\n📊 Test 9: Object Pooling (10k updates)');
console.log('-'.repeat(60));

const alienResult9 = measure('alien-signals', () => {
	const s = alien.signal(0);
	const c = alien.computed(() => s() * 2);

	for (let i = 0; i < 100; i++) {
		s(i);
		c(); // Force recompute
	}
}, 100);

const hyperResult9 = measure('hyper-signals', () => {
	const s = hyper.signal(0);
	const c = hyper.computed(() => s() * 2);

	for (let i = 0; i < 100; i++) {
		s(i);
		c(); // Force recompute
	}
}, 100);

formatResult('Object Pooling (10k updates)', alienResult9, hyperResult9);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n\n');
console.log('='.repeat(60));
console.log('📈 BENCHMARK SUMMARY');
console.log('='.repeat(60));

const results = [
	{ name: 'Simple Updates', alien: alienResult1, hyper: hyperResult1 },
	{ name: 'Computed Chain', alien: alienResult2, hyper: hyperResult2 },
	{ name: 'Fan-out', alien: alienResult3, hyper: hyperResult3 },
	{ name: 'Diamond', alien: alienResult4, hyper: hyperResult4 },
	{ name: 'Deep Chain', alien: alienResult5, hyper: hyperResult5 },
	{ name: 'Batching', alien: alienResult6, hyper: hyperResult6 },
	{ name: 'Dynamic Deps', alien: alienResult7, hyper: hyperResult7 },
	{ name: 'Pooling Stress', alien: alienResult9, hyper: hyperResult9 },
];

let totalSpeedup = 0;
results.forEach(r => {
	const speedup = r.alien.avg / r.hyper.avg;
	totalSpeedup += speedup;
});

const avgSpeedup = totalSpeedup / results.length;

console.log(`\n🏆 Average Speedup: ${avgSpeedup.toFixed(2)}x`);
console.log(`\nConclusion: hyper-signals is ${((avgSpeedup - 1) * 100).toFixed(1)}% faster on average`);

console.log('\n');
