/**
 * BENCHMARK V2: alien-signals vs hyper-signals-v2
 *
 * Testing second iteration with aggressive optimizations
 */

import * as alien from 'alien-signals';
import * as hyperV2 from './hyper-signals-v2.js';

const WARMUP = 100;
const ITERATIONS = 10000;

function benchmark(name, fn) {
	for (let i = 0; i < WARMUP; i++) fn();
	if (global.gc) global.gc();

	const start = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		fn();
	}
	const end = performance.now();

	const totalMs = end - start;
	const avgNs = (totalMs / ITERATIONS) * 1_000_000;

	return { totalMs, avgNs };
}

function compare(testName, alienFn, hyperFn) {
	console.log(`\n${'='.repeat(70)}`);
	console.log(`📊 ${testName}`);
	console.log('='.repeat(70));

	const alienResult = benchmark('alien', alienFn);
	const hyperResult = benchmark('hyper-v2', hyperFn);

	console.log(`\nalien-signals: ${alienResult.avgNs.toFixed(2)} ns/op`);
	console.log(`hyper-v2:      ${hyperResult.avgNs.toFixed(2)} ns/op`);

	const speedup = alienResult.avgNs / hyperResult.avgNs;
	const improvement = ((alienResult.avgNs - hyperResult.avgNs) / alienResult.avgNs * 100);

	if (speedup > 1) {
		console.log(`\n✅ hyper-v2 is ${speedup.toFixed(2)}x FASTER (${improvement.toFixed(1)}% improvement)`);
	} else {
		console.log(`\n❌ alien is ${(1/speedup).toFixed(2)}x FASTER (hyper-v2 is ${improvement.toFixed(1)}% slower)`);
	}

	return { alien: alienResult, hyper: hyperResult, speedup };
}

console.log('🚀 BENCHMARK V2: alien-signals vs hyper-signals-v2');
console.log(`Iterations: ${ITERATIONS} each\n`);

const results = [];

// ============================================================================
// FOCUSED TESTS ON WORST CASES
// ============================================================================

// Test 1: Effects (was 3.11x slower - PRIORITY)
results.push(compare(
	'Test 1: Effect Creation + Trigger (was 3.11x slower)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		s(1);
	},
	() => {
		const s = hyperV2.signal(0);
		let sum = 0;
		hyperV2.effect(() => { sum += s(); });
		s(1);
	}
));

// Test 2: Memoization (was 2.79x slower - PRIORITY)
results.push(compare(
	'Test 2: Computed Memoization (was 2.79x slower)',
	() => {
		const s = alien.signal(1);
		const c = alien.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	},
	() => {
		const s = hyperV2.signal(1);
		const c = hyperV2.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	}
));

// Test 3: Signal Write (was 1.51x slower - PRIORITY)
results.push(compare(
	'Test 3: Signal Write (was 1.51x slower)',
	() => {
		const s = alien.signal(0);
		s(1); s(2); s(3);
	},
	() => {
		const s = hyperV2.signal(0);
		s(1); s(2); s(3);
	}
));

// Test 4: Diamond Dependency (was 1.72x slower)
results.push(compare(
	'Test 4: Diamond Dependency (was 1.72x slower)',
	() => {
		const a = alien.signal(1);
		const b = alien.computed(() => a() * 2);
		const c = alien.computed(() => a() * 3);
		const d = alien.computed(() => b() + c());
		a(2);
		d();
	},
	() => {
		const a = hyperV2.signal(1);
		const b = hyperV2.computed(() => a() * 2);
		const c = hyperV2.computed(() => a() * 3);
		const d = hyperV2.computed(() => b() + c());
		a(2);
		d();
	}
));

// Test 5: Batching (was 2.12x slower)
results.push(compare(
	'Test 5: Batching (was 2.12x slower)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		alien.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		alien.endBatch();
	},
	() => {
		const s = hyperV2.signal(0);
		let sum = 0;
		hyperV2.effect(() => { sum += s(); });
		hyperV2.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		hyperV2.endBatch();
	}
));

// Test 6: Computed Chain
results.push(compare(
	'Test 6: Computed Chain (A→B→C→D→E)',
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
		const a = hyperV2.signal(1);
		const b = hyperV2.computed(() => a() * 2);
		const c = hyperV2.computed(() => b() * 2);
		const d = hyperV2.computed(() => c() * 2);
		const e = hyperV2.computed(() => d() * 2);
		a(2);
		e();
	}
));

// Test 7: Signal Create + Read
results.push(compare(
	'Test 7: Signal Create + Read',
	() => {
		const s = alien.signal(42);
		s();
	},
	() => {
		const s = hyperV2.signal(42);
		s();
	}
));

// Test 8: Dynamic Dependencies
results.push(compare(
	'Test 8: Dynamic Dependencies',
	() => {
		const cond = alien.signal(true);
		const a = alien.signal(1);
		const b = alien.signal(2);
		const c = alien.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
	},
	() => {
		const cond = hyperV2.signal(true);
		const a = hyperV2.signal(1);
		const b = hyperV2.signal(2);
		const c = hyperV2.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
	}
));

// Test 9: Many Signals (our only win in v1!)
results.push(compare(
	'Test 9: Many Signals (100) - v1 won this',
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(alien.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	},
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(hyperV2.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	}
));

// Test 10: Deep Chain
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
		let current = hyperV2.signal(1);
		const signals = [current];
		for (let i = 0; i < 19; i++) {
			const prev = current;
			current = hyperV2.computed(() => prev() + 1);
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
console.log('📈 SUMMARY - V2 Results');
console.log('='.repeat(70));

let wins = 0;
let losses = 0;
let totalSpeedup = 0;

results.forEach((r, i) => {
	if (r.speedup > 1) wins++;
	else losses++;
	totalSpeedup += r.speedup;
});

const avgSpeedup = totalSpeedup / results.length;

console.log(`\nTests won by hyper-v2: ${wins}/${results.length}`);
console.log(`Tests won by alien: ${losses}/${results.length}`);
console.log(`\nAverage speedup: ${avgSpeedup.toFixed(2)}x`);

if (avgSpeedup > 1) {
	console.log(`\n🎉 SUCCESS! hyper-v2 is ${((avgSpeedup - 1) * 100).toFixed(1)}% faster on average!`);
	console.log(`\n✅ WE BEAT ALIEN-SIGNALS!`);
} else {
	const gap = ((1 - avgSpeedup) * 100).toFixed(1);
	console.log(`\n⚠️  hyper-v2 is still ${gap}% slower on average`);

	if (Math.abs(1 - avgSpeedup) < 0.1) {
		console.log(`\n🤝 We're within 10% - basically tied!`);
	} else {
		console.log(`\nGap vs V1 (was 32.4% slower):`);
		console.log(`V2 gap: ${gap}%`);
		console.log(`Improvement: ${(32.4 - parseFloat(gap)).toFixed(1)} percentage points better!`);
	}
}

// Show biggest improvements
console.log(`\n\n${'='.repeat(70)}`);
console.log('🎯 Priority Tests (Worst Cases from V1)');
console.log('='.repeat(70));

const priorities = [
	{ name: 'Effects', v1: 3.11, result: results[0] },
	{ name: 'Memoization', v1: 2.79, result: results[1] },
	{ name: 'Signal Write', v1: 1.51, result: results[2] },
	{ name: 'Diamond Deps', v1: 1.72, result: results[3] },
	{ name: 'Batching', v1: 2.12, result: results[4] },
];

priorities.forEach(p => {
	const v1Gap = ((p.v1 - 1) * 100).toFixed(1);
	const v2Gap = ((1/p.result.speedup - 1) * 100).toFixed(1);
	const improvement = (parseFloat(v1Gap) - parseFloat(v2Gap)).toFixed(1);

	console.log(`\n${p.name}:`);
	console.log(`  V1: ${v1Gap}% slower`);
	console.log(`  V2: ${v2Gap}% ${p.result.speedup > 1 ? 'FASTER' : 'slower'}`);
	console.log(`  Improvement: ${improvement} percentage points!`);
});

console.log('\n');
