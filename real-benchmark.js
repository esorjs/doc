/**
 * REAL BENCHMARK: alien-signals vs hyper-signals
 *
 * Prueba fiel y honesta de performance real
 */

import * as alien from 'alien-signals';
import * as hyper from './hyper-signals.js';

const WARMUP = 100;
const ITERATIONS = 10000;

// High-precision timing
function benchmark(name, fn) {
	// Warmup
	for (let i = 0; i < WARMUP; i++) fn();

	// Force GC if available
	if (global.gc) global.gc();

	// Measure
	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		fn();
	}
	const end = performance.now();

	const totalMs = end - start;
	const avgMs = totalMs / ITERATIONS;
	const avgNs = avgMs * 1_000_000; // Convert to nanoseconds

	return { totalMs, avgMs, avgNs, iterations: ITERATIONS };
}

function compare(testName, alienFn, hyperFn) {
	console.log(`\n${'='.repeat(70)}`);
	console.log(`📊 ${testName}`);
	console.log('='.repeat(70));

	const alienResult = benchmark('alien-signals', alienFn);
	const hyperResult = benchmark('hyper-signals', hyperFn);

	console.log(`\nalien-signals: ${alienResult.avgNs.toFixed(2)} ns/op (${alienResult.totalMs.toFixed(2)} ms total)`);
	console.log(`hyper-signals: ${hyperResult.avgNs.toFixed(2)} ns/op (${hyperResult.totalMs.toFixed(2)} ms total)`);

	const speedup = alienResult.avgNs / hyperResult.avgNs;
	const improvement = ((alienResult.avgNs - hyperResult.avgNs) / alienResult.avgNs * 100);

	if (speedup > 1) {
		console.log(`\n✅ hyper-signals is ${speedup.toFixed(2)}x FASTER (${improvement.toFixed(1)}% improvement)`);
	} else {
		console.log(`\n❌ alien-signals is ${(1/speedup).toFixed(2)}x FASTER (hyper is ${improvement.toFixed(1)}% SLOWER)`);
	}

	return { alien: alienResult, hyper: hyperResult, speedup };
}

console.log('🚀 REAL BENCHMARK: alien-signals vs hyper-signals');
console.log(`Warmup: ${WARMUP} iterations`);
console.log(`Test: ${ITERATIONS} iterations each`);
console.log(`Node: ${process.version}`);

const results = [];

// ============================================================================
// Test 1: Simple Signal Create + Read
// ============================================================================

results.push(compare(
	'Test 1: Signal Create + Read',
	() => {
		const s = alien.signal(42);
		s();
	},
	() => {
		const s = hyper.signal(42);
		s();
	}
));

// ============================================================================
// Test 2: Signal Write
// ============================================================================

results.push(compare(
	'Test 2: Signal Write',
	() => {
		const s = alien.signal(0);
		s(1);
		s(2);
		s(3);
	},
	() => {
		const s = hyper.signal(0);
		s(1);
		s(2);
		s(3);
	}
));

// ============================================================================
// Test 3: Computed Chain (5 levels)
// ============================================================================

results.push(compare(
	'Test 3: Computed Chain (A→B→C→D→E)',
	() => {
		const a = alien.signal(1);
		const b = alien.computed(() => a() * 2);
		const c = alien.computed(() => b() * 2);
		const d = alien.computed(() => c() * 2);
		const e = alien.computed(() => d() * 2);
		a(2);
		e();
	},
	() => {
		const a = hyper.signal(1);
		const b = hyper.computed(() => a() * 2);
		const c = hyper.computed(() => b() * 2);
		const d = hyper.computed(() => c() * 2);
		const e = hyper.computed(() => d() * 2);
		a(2);
		e();
	}
));

// ============================================================================
// Test 4: Diamond Dependency
// ============================================================================

results.push(compare(
	'Test 4: Diamond Dependency (A→B,C→D)',
	() => {
		const a = alien.signal(1);
		const b = alien.computed(() => a() * 2);
		const c = alien.computed(() => a() * 3);
		const d = alien.computed(() => b() + c());
		a(2);
		d();
	},
	() => {
		const a = hyper.signal(1);
		const b = hyper.computed(() => a() * 2);
		const c = hyper.computed(() => a() * 3);
		const d = hyper.computed(() => b() + c());
		a(2);
		d();
	}
));

// ============================================================================
// Test 5: Effect Execution
// ============================================================================

results.push(compare(
	'Test 5: Effect Creation + Trigger',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		s(1);
	},
	() => {
		const s = hyper.signal(0);
		let sum = 0;
		hyper.effect(() => { sum += s(); });
		s(1);
	}
));

// ============================================================================
// Test 6: Batching (10 updates)
// ============================================================================

results.push(compare(
	'Test 6: Batching (10 updates)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		alien.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		alien.endBatch();
	},
	() => {
		const s = hyper.signal(0);
		let sum = 0;
		hyper.effect(() => { sum += s(); });
		hyper.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		hyper.endBatch();
	}
));

// ============================================================================
// Test 7: Dynamic Dependencies
// ============================================================================

results.push(compare(
	'Test 7: Dynamic Dependencies',
	() => {
		const cond = alien.signal(true);
		const a = alien.signal(1);
		const b = alien.signal(2);
		const c = alien.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
		a(10);
		c();
	},
	() => {
		const cond = hyper.signal(true);
		const a = hyper.signal(1);
		const b = hyper.signal(2);
		const c = hyper.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
		a(10);
		c();
	}
));

// ============================================================================
// Test 8: Many Signals (100 signals)
// ============================================================================

results.push(compare(
	'Test 8: Many Signals (100 signals)',
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) {
			signals.push(alien.signal(i));
		}
		for (let i = 0; i < 100; i++) {
			signals[i]();
		}
	},
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) {
			signals.push(hyper.signal(i));
		}
		for (let i = 0; i < 100; i++) {
			signals[i]();
		}
	}
));

// ============================================================================
// Test 9: Computed Memoization
// ============================================================================

results.push(compare(
	'Test 9: Computed Memoization (no change)',
	() => {
		const s = alien.signal(1);
		const c = alien.computed(() => s() * 2);
		c();
		c();
		c();
		c();
		c();
	},
	() => {
		const s = hyper.signal(1);
		const c = hyper.computed(() => s() * 2);
		c();
		c();
		c();
		c();
		c();
	}
));

// ============================================================================
// Test 10: Stress Test (deep chain)
// ============================================================================

results.push(compare(
	'Test 10: Deep Chain (20 levels)',
	() => {
		let current = alien.signal(1);
		const signals = [current];
		for (let i = 0; i < 19; i++) {
			const prev = current;
			current = alien.computed(() => prev() + 1);
			signals.push(current);
		}
		signals[0](2);
		current();
	},
	() => {
		let current = hyper.signal(1);
		const signals = [current];
		for (let i = 0; i < 19; i++) {
			const prev = current;
			current = hyper.computed(() => prev() + 1);
			signals.push(current);
		}
		signals[0](2);
		current();
	}
));

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n\n' + '='.repeat(70));
console.log('📈 SUMMARY');
console.log('='.repeat(70));

let wins = 0;
let losses = 0;
let totalSpeedup = 0;

results.forEach((r, i) => {
	if (r.speedup > 1) {
		wins++;
	} else {
		losses++;
	}
	totalSpeedup += r.speedup;
});

const avgSpeedup = totalSpeedup / results.length;

console.log(`\nTests won by hyper-signals: ${wins}/${results.length}`);
console.log(`Tests won by alien-signals: ${losses}/${results.length}`);
console.log(`\nAverage speedup: ${avgSpeedup.toFixed(2)}x`);

if (avgSpeedup > 1) {
	console.log(`\n✅ RESULT: hyper-signals is ${((avgSpeedup - 1) * 100).toFixed(1)}% faster on average`);
} else {
	console.log(`\n❌ RESULT: hyper-signals is ${((1 - avgSpeedup) * 100).toFixed(1)}% SLOWER on average`);
	console.log(`\n⚠️  HONEST ASSESSMENT: We did NOT beat alien-signals yet.`);
	console.log(`Need to analyze and optimize further.`);
}

console.log('\n');
