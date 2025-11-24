/**
 * FINAL BENCHMARK: The Ultimate Showdown
 *
 * alien-signals vs hyper-signals-v3
 *
 * V3 Focus: Stack-based propagation to fix signal write gap
 */

import * as alien from 'alien-signals';
import * as hyperV3 from './hyper-signals-v3.js';

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

function compare(testName, alienFn, hyperFn, v2Result = null) {
	console.log(`\n${'='.repeat(70)}`);
	console.log(`📊 ${testName}`);
	console.log('='.repeat(70));

	const alienResult = benchmark('alien', alienFn);
	const hyperResult = benchmark('hyper-v3', hyperFn);

	console.log(`\nalien-signals: ${alienResult.avgNs.toFixed(2)} ns/op`);
	console.log(`hyper-v3:      ${hyperResult.avgNs.toFixed(2)} ns/op`);

	const speedup = alienResult.avgNs / hyperResult.avgNs;
	const improvement = ((alienResult.avgNs - hyperResult.avgNs) / alienResult.avgNs * 100);

	if (speedup > 1) {
		console.log(`\n✅ hyper-v3 is ${speedup.toFixed(2)}x FASTER (${improvement.toFixed(1)}% improvement)`);
	} else {
		console.log(`\n${Math.abs(improvement) < 5 ? '🤝' : '❌'} alien is ${(1/speedup).toFixed(2)}x FASTER (hyper-v3 is ${improvement.toFixed(1)}% slower)`);
	}

	if (v2Result) {
		const v2Speedup = v2Result.alien / v2Result.hyper;
		const v3Speedup = speedup;
		const delta = v3Speedup - v2Speedup;
		console.log(`   V2→V3 improvement: ${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}% speedup change`);
	}

	return { alien: alienResult, hyper: hyperResult, speedup };
}

console.log('🏆 FINAL BENCHMARK: alien-signals vs hyper-signals-v3');
console.log(`Iterations: ${ITERATIONS} each\n`);

const results = [];

// Track V2 results for comparison
const v2Results = {
	effect: { alien: 1002.27, hyper: 646.53 },
	memo: { alien: 453.49, hyper: 475.19 },
	write: { alien: 157.30, hyper: 296.70 }, // KEY TARGET
	diamond: { alien: 812.45, hyper: 852.38 },
	batch: { alien: 737.45, hyper: 785.63 },
};

// ============================================================================
// PRIORITY #1: Signal Writes (V2's worst gap: 89% slower)
// ============================================================================

results.push(compare(
	'Test 1: Signal Write - V2 worst case! (was 89% slower)',
	() => {
		const s = alien.signal(0);
		s(1); s(2); s(3);
	},
	() => {
		const s = hyperV3.signal(0);
		s(1); s(2); s(3);
	},
	v2Results.write
));

// ============================================================================
// CORE TESTS
// ============================================================================

results.push(compare(
	'Test 2: Effect Creation + Trigger (V2: 1.55x faster ✅)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		s(1);
	},
	() => {
		const s = hyperV3.signal(0);
		let sum = 0;
		hyperV3.effect(() => { sum += s(); });
		s(1);
	},
	v2Results.effect
));

results.push(compare(
	'Test 3: Computed Memoization (V2: 4.8% slower 🤝)',
	() => {
		const s = alien.signal(1);
		const c = alien.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	},
	() => {
		const s = hyperV3.signal(1);
		const c = hyperV3.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	},
	v2Results.memo
));

results.push(compare(
	'Test 4: Diamond Dependency (V2: 4.9% slower 🤝)',
	() => {
		const a = alien.signal(1);
		const b = alien.computed(() => a() * 2);
		const c = alien.computed(() => a() * 3);
		const d = alien.computed(() => b() + c());
		a(2);
		d();
	},
	() => {
		const a = hyperV3.signal(1);
		const b = hyperV3.computed(() => a() * 2);
		const c = hyperV3.computed(() => a() * 3);
		const d = hyperV3.computed(() => b() + c());
		a(2);
		d();
	},
	v2Results.diamond
));

results.push(compare(
	'Test 5: Batching (V2: 6.5% slower 🤝)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		alien.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		alien.endBatch();
	},
	() => {
		const s = hyperV3.signal(0);
		let sum = 0;
		hyperV3.effect(() => { sum += s(); });
		hyperV3.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		hyperV3.endBatch();
	},
	v2Results.batch
));

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
		const a = hyperV3.signal(1);
		const b = hyperV3.computed(() => a() * 2);
		const c = hyperV3.computed(() => b() * 2);
		const d = hyperV3.computed(() => c() * 2);
		const e = hyperV3.computed(() => d() * 2);
		a(2);
		e();
	}
));

results.push(compare(
	'Test 7: Signal Create + Read',
	() => {
		const s = alien.signal(42);
		s();
	},
	() => {
		const s = hyperV3.signal(42);
		s();
	}
));

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
		const cond = hyperV3.signal(true);
		const a = hyperV3.signal(1);
		const b = hyperV3.signal(2);
		const c = hyperV3.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
	}
));

results.push(compare(
	'Test 9: Many Signals (100)',
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(alien.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	},
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(hyperV3.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	}
));

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
		let current = hyperV3.signal(1);
		const signals = [current];
		for (let i = 0; i < 19; i++) {
			const prev = current;
			current = hyperV3.computed(() => prev() + 1);
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
console.log('🏆 FINAL RESULTS');
console.log('='.repeat(70));

let wins = 0;
let nearTies = 0; // Within 5%
let losses = 0;
let totalSpeedup = 0;

results.forEach((r) => {
	if (r.speedup > 1) {
		wins++;
	} else if (r.speedup > 0.95) {
		nearTies++;
	} else {
		losses++;
	}
	totalSpeedup += r.speedup;
});

const avgSpeedup = totalSpeedup / results.length;

console.log(`\n📊 Score:`);
console.log(`   Wins (hyper-v3 faster): ${wins}/${results.length}`);
console.log(`   Near-ties (within 5%): ${nearTies}/${results.length}`);
console.log(`   Losses: ${losses}/${results.length}`);
console.log(`   Competitive tests: ${wins + nearTies}/${results.length}`);

console.log(`\n⚡ Average speedup: ${avgSpeedup.toFixed(2)}x`);

if (avgSpeedup >= 0.95 && avgSpeedup <= 1.05) {
	console.log(`\n🎉 ESSENTIALLY TIED! (within 5%)`);
	console.log(`We achieved parity with alien-signals!`);
} else if (avgSpeedup > 1) {
	console.log(`\n🏆 VICTORY! hyper-v3 is ${((avgSpeedup - 1) * 100).toFixed(1)}% faster on average!`);
	console.log(`\n✅ WE BEAT ALIEN-SIGNALS!`);
} else {
	const gap = ((1 - avgSpeedup) * 100).toFixed(1);
	console.log(`\n⚠️  hyper-v3 is ${gap}% slower on average`);

	if (parseFloat(gap) < 10) {
		console.log(`\n🤝 Within 10% - highly competitive!`);
	}
}

// Evolution tracking
console.log(`\n\n${'='.repeat(70)}`);
console.log('📈 EVOLUTION: V1 → V2 → V3');
console.log('='.repeat(70));

console.log(`\nV1: 32.4% slower (1 win, 9 losses)`);
console.log(`V2: 12.6% slower (1 win, 4 near-ties, 5 losses)`);
console.log(`V3: ${((1 - avgSpeedup) * 100).toFixed(1)}% ${avgSpeedup >= 1 ? 'FASTER' : 'slower'} (${wins} wins, ${nearTies} near-ties, ${losses} losses)`);

const v1ToV3 = 32.4 - ((1 - avgSpeedup) * 100);
console.log(`\n🚀 Total improvement from V1: ${v1ToV3.toFixed(1)} percentage points!`);

// Signal Write improvement (our target!)
const writeResult = results[0];
const writeSpeedup = writeResult.speedup;
const writeV2Speedup = v2Results.write.alien / v2Results.write.hyper;

console.log(`\n\n${'='.repeat(70)}`);
console.log('🎯 SIGNAL WRITE IMPROVEMENT (V3 Focus)');
console.log('='.repeat(70));
console.log(`\nV2: ${((1/writeV2Speedup - 1) * 100).toFixed(1)}% slower`);
console.log(`V3: ${writeSpeedup >= 1 ? `${((writeSpeedup - 1) * 100).toFixed(1)}% FASTER ✅` : `${((1/writeSpeedup - 1) * 100).toFixed(1)}% slower`}`);

if (writeSpeedup > writeV2Speedup) {
	const improvement = (writeSpeedup - writeV2Speedup) * 100;
	console.log(`\n🎉 Improvement: ${improvement.toFixed(1)} percentage points!`);
	if (writeSpeedup >= 0.95) {
		console.log(`✅ Signal write gap CLOSED!`);
	}
}

console.log('\n');
