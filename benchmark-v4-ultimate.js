/**
 * ULTIMATE BENCHMARK: The Final Showdown
 *
 * V4 Strategy: Near-identical to alien-signals + micro-optimizations
 *
 * Goal: WIN or TIE (within 2%)
 */

import * as alien from 'alien-signals';
import * as hyperV4 from './hyper-signals-v4-extreme.js';

const WARMUP = 200; // More warmup for stability
const ITERATIONS = 20000; // More iterations for accuracy

function benchmark(name, fn) {
	// Extended warmup
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
	const hyperResult = benchmark('hyper-v4', hyperFn);

	console.log(`\nalien-signals: ${alienResult.avgNs.toFixed(2)} ns/op`);
	console.log(`hyper-v4:      ${hyperResult.avgNs.toFixed(2)} ns/op`);

	const speedup = alienResult.avgNs / hyperResult.avgNs;
	const pctDiff = ((hyperResult.avgNs - alienResult.avgNs) / alienResult.avgNs * 100);

	let status;
	if (Math.abs(pctDiff) <= 2) {
		status = '🤝 TIE';
	} else if (speedup > 1) {
		status = '🏆 WIN';
	} else {
		status = '❌ LOSS';
	}

	console.log(`\n${status}: ${speedup.toFixed(3)}x speedup (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}%)`);

	return { alien: alienResult, hyper: hyperResult, speedup, pctDiff, status };
}

console.log('⚡ ULTIMATE BENCHMARK: alien-signals vs hyper-signals-v4');
console.log(`Warmup: ${WARMUP}, Iterations: ${ITERATIONS}`);
console.log(`Goal: WIN or TIE (within 2%) in majority of tests\n`);

const results = [];

// ============================================================================
// COMPREHENSIVE TEST SUITE
// ============================================================================

results.push(compare(
	'Test 1: Signal Create + Read',
	() => {
		const s = alien.signal(42);
		s();
	},
	() => {
		const s = hyperV4.signal(42);
		s();
	}
));

results.push(compare(
	'Test 2: Signal Write (3x)',
	() => {
		const s = alien.signal(0);
		s(1); s(2); s(3);
	},
	() => {
		const s = hyperV4.signal(0);
		s(1); s(2); s(3);
	}
));

results.push(compare(
	'Test 3: Computed Create + Read',
	() => {
		const s = alien.signal(1);
		const c = alien.computed(() => s() * 2);
		c();
	},
	() => {
		const s = hyperV4.signal(1);
		const c = hyperV4.computed(() => s() * 2);
		c();
	}
));

results.push(compare(
	'Test 4: Computed Memoization (5x read)',
	() => {
		const s = alien.signal(1);
		const c = alien.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	},
	() => {
		const s = hyperV4.signal(1);
		const c = hyperV4.computed(() => s() * 2);
		c(); c(); c(); c(); c();
	}
));

results.push(compare(
	'Test 5: Effect Creation + Trigger',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		s(1);
	},
	() => {
		const s = hyperV4.signal(0);
		let sum = 0;
		hyperV4.effect(() => { sum += s(); });
		s(1);
	}
));

results.push(compare(
	'Test 6: Computed Chain (5 levels)',
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
		const a = hyperV4.signal(1);
		const b = hyperV4.computed(() => a() * 2);
		const c = hyperV4.computed(() => b() * 2);
		const d = hyperV4.computed(() => c() * 2);
		const e = hyperV4.computed(() => d() * 2);
		a(2);
		e();
	}
));

results.push(compare(
	'Test 7: Diamond Dependency',
	() => {
		const a = alien.signal(1);
		const b = alien.computed(() => a() * 2);
		const c = alien.computed(() => a() * 3);
		const d = alien.computed(() => b() + c());
		a(2);
		d();
	},
	() => {
		const a = hyperV4.signal(1);
		const b = hyperV4.computed(() => a() * 2);
		const c = hyperV4.computed(() => a() * 3);
		const d = hyperV4.computed(() => b() + c());
		a(2);
		d();
	}
));

results.push(compare(
	'Test 8: Batching (10 updates)',
	() => {
		const s = alien.signal(0);
		let sum = 0;
		alien.effect(() => { sum += s(); });
		alien.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		alien.endBatch();
	},
	() => {
		const s = hyperV4.signal(0);
		let sum = 0;
		hyperV4.effect(() => { sum += s(); });
		hyperV4.startBatch();
		for (let i = 0; i < 10; i++) s(i);
		hyperV4.endBatch();
	}
));

results.push(compare(
	'Test 9: Dynamic Dependencies',
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
		const cond = hyperV4.signal(true);
		const a = hyperV4.signal(1);
		const b = hyperV4.signal(2);
		const c = hyperV4.computed(() => cond() ? a() : b());
		c();
		cond(false);
		c();
	}
));

results.push(compare(
	'Test 10: Many Signals (100)',
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(alien.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	},
	() => {
		const signals = [];
		for (let i = 0; i < 100; i++) signals.push(hyperV4.signal(i));
		for (let i = 0; i < 100; i++) signals[i]();
	}
));

// ============================================================================
// FINAL RESULTS
// ============================================================================

console.log('\n\n' + '='.repeat(70));
console.log('🏆 FINAL RESULTS - V4 EXTREME');
console.log('='.repeat(70));

let wins = 0;
let ties = 0;
let losses = 0;
let totalSpeedup = 0;

results.forEach((r) => {
	if (r.status === '🏆 WIN') wins++;
	else if (r.status === '🤝 TIE') ties++;
	else losses++;
	totalSpeedup += r.speedup;
});

const avgSpeedup = totalSpeedup / results.length;
const avgPctDiff = ((avgSpeedup - 1) * 100);

console.log(`\n📊 Score:`);
console.log(`   Wins:   ${wins}/${results.length}`);
console.log(`   Ties:   ${ties}/${results.length} (within 2%)`);
console.log(`   Losses: ${losses}/${results.length}`);
console.log(`   Competitive: ${wins + ties}/${results.length}`);

console.log(`\n⚡ Average: ${avgSpeedup.toFixed(3)}x (${avgPctDiff >= 0 ? '+' : ''}${avgPctDiff.toFixed(1)}%)`);

// Victory conditions
const competitive = wins + ties;
const majority = results.length / 2;

if (wins > losses) {
	console.log(`\n🎉🎉🎉 VICTORY! We WON more tests than we lost!`);
	console.log(`✅ hyper-signals-v4 BEATS alien-signals!`);
} else if (competitive >= majority) {
	console.log(`\n🎉 SUCCESS! We're competitive in ${competitive}/${results.length} tests!`);
	if (Math.abs(avgPctDiff) <= 5) {
		console.log(`✅ Average within 5% - ESSENTIALLY TIED!`);
	}
} else {
	console.log(`\n⚠️  Not enough wins/ties. Need more optimization.`);
	console.log(`Competitive: ${competitive}/${results.length} (need ${Math.ceil(majority)}+)`);
}

// Evolution summary
console.log(`\n\n${'='.repeat(70)}`);
console.log('📈 EVOLUTION SUMMARY');
console.log('='.repeat(70));

console.log(`\nV1: -32.4% (theoretically "optimized" - FAILED)`);
console.log(`V2: -12.6% (adopted linked lists - BEST BALANCE)`);
console.log(`V3: -14.5% (stack propagation - MIXED)`);
console.log(`V4: ${avgPctDiff >= 0 ? '+' : ''}${avgPctDiff.toFixed(1)}% (near-identical + micro-opts - ${wins > losses ? 'VICTORY' : competitive >= majority ? 'COMPETITIVE' : 'FINAL ATTEMPT'})`);

if (avgPctDiff >= -2 && avgPctDiff <= 2) {
	console.log(`\n🏆 ACHIEVEMENT UNLOCKED: Within 2% of alien-signals!`);
	console.log(`This is effectively a TIE in real-world usage!`);
}

console.log('\n');
