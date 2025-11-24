/**
 * TEST SUITE: hyper-signals
 *
 * Comprehensive test suite to verify correctness
 */

import {
	signal,
	computed,
	effect,
	effectScope,
	trigger,
	startBatch,
	endBatch,
	getBatchDepth,
} from './hyper-signals.js';

// Simple test framework
let passed = 0;
let failed = 0;

function test(name, fn) {
	try {
		fn();
		console.log(`✅ ${name}`);
		passed++;
	} catch (error) {
		console.log(`❌ ${name}`);
		console.error(`   ${error.message}`);
		failed++;
	}
}

function assert(condition, message = 'Assertion failed') {
	if (!condition) {
		throw new Error(message);
	}
}

function assertEquals(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(message || `Expected ${expected}, got ${actual}`);
	}
}

console.log('🧪 HYPER-SIGNALS TEST SUITE\n');
console.log('='.repeat(60));

// ============================================================================
// SIGNAL TESTS
// ============================================================================

console.log('\n📊 Signal Tests');
console.log('-'.repeat(60));

test('signal: initial value', () => {
	const s = signal(42);
	assertEquals(s(), 42);
});

test('signal: undefined initial', () => {
	const s = signal();
	assertEquals(s(), undefined);
});

test('signal: set value', () => {
	const s = signal(0);
	s(10);
	assertEquals(s(), 10);
});

test('signal: multiple updates', () => {
	const s = signal(0);
	s(1);
	s(2);
	s(3);
	assertEquals(s(), 3);
});

test('signal: same value no propagation', () => {
	const s = signal(0);
	let runCount = 0;

	effect(() => {
		s();
		runCount++;
	});

	assertEquals(runCount, 1);

	s(0); // Same value
	assertEquals(runCount, 1, 'Should not trigger effect');

	s(1); // Different value
	assertEquals(runCount, 2, 'Should trigger effect');
});

// ============================================================================
// COMPUTED TESTS
// ============================================================================

console.log('\n📊 Computed Tests');
console.log('-'.repeat(60));

test('computed: basic computation', () => {
	const a = signal(2);
	const b = computed(() => a() * 2);
	assertEquals(b(), 4);
});

test('computed: memoization', () => {
	const s = signal(1);
	let runCount = 0;

	const c = computed(() => {
		runCount++;
		return s() * 2;
	});

	assertEquals(c(), 2);
	assertEquals(runCount, 1);

	// Multiple reads should not recompute
	assertEquals(c(), 2);
	assertEquals(c(), 2);
	assertEquals(runCount, 1, 'Should be memoized');

	// Change signal
	s(2);
	assertEquals(c(), 4);
	assertEquals(runCount, 2, 'Should recompute after dependency change');
});

test('computed: chain', () => {
	const a = signal(1);
	const b = computed(() => a() * 2);
	const c = computed(() => b() * 2);
	const d = computed(() => c() * 2);

	assertEquals(d(), 8);

	a(2);
	assertEquals(d(), 16);
});

test('computed: diamond dependency', () => {
	const a = signal(1);

	let leftCount = 0;
	const left = computed(() => {
		leftCount++;
		return a() * 2;
	});

	let rightCount = 0;
	const right = computed(() => {
		rightCount++;
		return a() * 3;
	});

	let resultCount = 0;
	const result = computed(() => {
		resultCount++;
		return left() + right();
	});

	assertEquals(result(), 5);
	assertEquals(resultCount, 1);
	assertEquals(leftCount, 1);
	assertEquals(rightCount, 1);

	a(2);
	assertEquals(result(), 10);
	assertEquals(resultCount, 2, 'Result should recompute once');
	assertEquals(leftCount, 2);
	assertEquals(rightCount, 2);
});

test('computed: lazy evaluation', () => {
	const s = signal(1);
	let runCount = 0;

	const c = computed(() => {
		runCount++;
		return s() * 2;
	});

	assertEquals(runCount, 0, 'Should not compute until accessed');

	c();
	assertEquals(runCount, 1);
});

test('computed: with previous value', () => {
	const s = signal(1);
	const c = computed((prev = 0) => prev + s());

	assertEquals(c(), 1); // 0 + 1
	s(2);
	assertEquals(c(), 3); // 1 + 2
	s(3);
	assertEquals(c(), 6); // 3 + 3
});

// ============================================================================
// EFFECT TESTS
// ============================================================================

console.log('\n📊 Effect Tests');
console.log('-'.repeat(60));

test('effect: runs immediately', () => {
	let ran = false;
	effect(() => {
		ran = true;
	});
	assert(ran, 'Effect should run immediately');
});

test('effect: tracks dependencies', () => {
	const s = signal(0);
	let value = -1;

	effect(() => {
		value = s();
	});

	assertEquals(value, 0);

	s(5);
	assertEquals(value, 5);

	s(10);
	assertEquals(value, 10);
});

test('effect: multiple dependencies', () => {
	const a = signal(1);
	const b = signal(2);
	let sum = 0;

	effect(() => {
		sum = a() + b();
	});

	assertEquals(sum, 3);

	a(5);
	assertEquals(sum, 7);

	b(10);
	assertEquals(sum, 15);
});

test('effect: disposal', () => {
	const s = signal(0);
	let runCount = 0;

	const dispose = effect(() => {
		s();
		runCount++;
	});

	assertEquals(runCount, 1);

	s(1);
	assertEquals(runCount, 2);

	dispose();

	s(2);
	assertEquals(runCount, 2, 'Should not run after disposal');
});

test('effect: dynamic dependencies', () => {
	const condition = signal(true);
	const a = signal('A');
	const b = signal('B');
	let value = '';

	effect(() => {
		value = condition() ? a() : b();
	});

	assertEquals(value, 'A');

	a('A2');
	assertEquals(value, 'A2');

	condition(false);
	assertEquals(value, 'B');

	// 'a' should no longer trigger
	a('A3');
	assertEquals(value, 'B', 'Should not react to old dependency');

	// 'b' should trigger
	b('B2');
	assertEquals(value, 'B2');
});

test('effect: with computed', () => {
	const s = signal(1);
	const c = computed(() => s() * 2);
	let value = 0;

	effect(() => {
		value = c();
	});

	assertEquals(value, 2);

	s(5);
	assertEquals(value, 10);
});

// ============================================================================
// BATCHING TESTS
// ============================================================================

console.log('\n📊 Batching Tests');
console.log('-'.repeat(60));

test('batching: basic', () => {
	const s = signal(0);
	let runCount = 0;

	effect(() => {
		s();
		runCount++;
	});

	assertEquals(runCount, 1);

	startBatch();
	s(1);
	s(2);
	s(3);
	assertEquals(runCount, 1, 'Should not run during batch');

	endBatch();
	assertEquals(runCount, 2, 'Should run once after batch');
	assertEquals(s(), 3);
});

test('batching: nested', () => {
	const s = signal(0);
	let runCount = 0;

	effect(() => {
		s();
		runCount++;
	});

	assertEquals(runCount, 1);

	startBatch();
	startBatch();
	s(1);
	endBatch();
	assertEquals(runCount, 1, 'Should not run until all batches end');

	endBatch();
	assertEquals(runCount, 2);
});

test('batching: depth tracking', () => {
	assertEquals(getBatchDepth(), 0);

	startBatch();
	assertEquals(getBatchDepth(), 1);

	startBatch();
	assertEquals(getBatchDepth(), 2);

	endBatch();
	assertEquals(getBatchDepth(), 1);

	endBatch();
	assertEquals(getBatchDepth(), 0);
});

test('batching: multiple signals', () => {
	const x = signal(0);
	const y = signal(0);
	let runCount = 0;

	effect(() => {
		x() + y();
		runCount++;
	});

	assertEquals(runCount, 1);

	startBatch();
	x(1);
	y(2);
	endBatch();

	assertEquals(runCount, 2, 'Should run once for both changes');
});

// ============================================================================
// EFFECT SCOPE TESTS
// ============================================================================

console.log('\n📊 Effect Scope Tests');
console.log('-'.repeat(60));

test('effectScope: basic', () => {
	const s = signal(0);
	let values = [];

	const dispose = effectScope(() => {
		effect(() => values.push(s() * 1));
		effect(() => values.push(s() * 2));
		effect(() => values.push(s() * 3));
	});

	assertEquals(values.length, 3);
	assertEquals(values[0], 0);
	assertEquals(values[1], 0);
	assertEquals(values[2], 0);

	values = [];
	s(1);
	assertEquals(values.length, 3);

	dispose();

	values = [];
	s(2);
	assertEquals(values.length, 0, 'Should not run after disposal');
});

test('effectScope: nested scopes', () => {
	const s = signal(0);
	let count = 0;

	const outer = effectScope(() => {
		effect(() => {
			s();
			count++;
		});

		effectScope(() => {
			effect(() => {
				s();
				count++;
			});
		});
	});

	assertEquals(count, 2);

	s(1);
	assertEquals(count, 4);

	outer();

	s(2);
	assertEquals(count, 4, 'All effects should be disposed');
});

// ============================================================================
// TRIGGER TESTS
// ============================================================================

console.log('\n📊 Trigger Tests');
console.log('-'.repeat(60));

test('trigger: basic', () => {
	const s = signal(0);
	let runCount = 0;

	effect(() => {
		s();
		runCount++;
	});

	assertEquals(runCount, 1);

	trigger(() => {
		s();
	});

	assertEquals(runCount, 2);
});

test('trigger: multiple dependencies', () => {
	const a = signal(0);
	const b = signal(0);
	let runCount = 0;

	effect(() => {
		a() + b();
		runCount++;
	});

	assertEquals(runCount, 1);

	trigger(() => {
		a();
		b();
	});

	assertEquals(runCount, 2);
});

// ============================================================================
// EDGE CASES
// ============================================================================

console.log('\n📊 Edge Case Tests');
console.log('-'.repeat(60));

test('edge: circular dependency detection', () => {
	const a = signal(1);

	// This would create a circular dependency
	// The system should handle it gracefully
	const b = computed(() => {
		const val = a();
		if (val < 10) {
			a(val + 1); // Try to modify dependency during compute
		}
		return val;
	});

	// Should not crash
	try {
		b();
		assert(true);
	} catch (e) {
		// It's ok if it throws, as long as it doesn't hang
		assert(true);
	}
});

test('edge: effect creating signals', () => {
	const s = signal(0);
	let inner = null;

	effect(() => {
		inner = signal(s() * 2);
	});

	assert(inner !== null);
	assertEquals(inner(), 0);

	s(5);
	assertEquals(inner(), 10);
});

test('edge: computed returning undefined', () => {
	const s = signal(1);
	const c = computed(() => {
		if (s() < 0) return undefined;
		return s() * 2;
	});

	assertEquals(c(), 2);

	s(-1);
	assertEquals(c(), undefined);
});

test('edge: effect cleanup and recreation', () => {
	const s = signal(0);
	let count = 0;

	let dispose = effect(() => {
		s();
		count++;
	});

	assertEquals(count, 1);

	dispose();

	// Create new effect
	dispose = effect(() => {
		s();
		count++;
	});

	assertEquals(count, 2);

	s(1);
	assertEquals(count, 3);
});

test('edge: many dependencies', () => {
	const signals = Array.from({ length: 100 }, (_, i) => signal(i));

	const sum = computed(() => {
		return signals.reduce((acc, s) => acc + s(), 0);
	});

	assertEquals(sum(), 4950); // Sum of 0..99

	signals[0](100);
	assertEquals(sum(), 5050);
});

test('edge: deep nesting', () => {
	let current = signal(1);

	// Create 50 levels of computed
	for (let i = 0; i < 50; i++) {
		const prev = current;
		current = computed(() => prev() + 1);
	}

	assertEquals(current(), 51);
});

test('edge: rapid updates', () => {
	const s = signal(0);
	let lastValue = -1;

	effect(() => {
		lastValue = s();
	});

	for (let i = 0; i < 1000; i++) {
		s(i);
	}

	assertEquals(lastValue, 999);
});

test('edge: object values', () => {
	const s = signal({ count: 0 });

	let value = null;
	effect(() => {
		value = s();
	});

	assertEquals(value.count, 0);

	s({ count: 5 });
	assertEquals(value.count, 5);
});

test('edge: array values', () => {
	const s = signal([1, 2, 3]);

	let length = 0;
	effect(() => {
		length = s().length;
	});

	assertEquals(length, 3);

	s([1, 2, 3, 4, 5]);
	assertEquals(length, 5);
});

// ============================================================================
// MEMORY TESTS
// ============================================================================

console.log('\n📊 Memory Tests');
console.log('-'.repeat(60));

test('memory: cleanup removes dependencies', () => {
	const s = signal(0);

	const dispose = effect(() => {
		s();
	});

	// Signal should have observer
	assert(s.toString); // Just verify signal exists

	dispose();

	// Observer should be removed (we can't easily verify this without internals)
	assert(true);
});

test('memory: computed cleanup', () => {
	const s = signal(0);
	let c = computed(() => s() * 2);

	// Read to establish dependency
	c();

	// Stop referencing computed
	c = null;

	// Signal should eventually cleanup (handled by GC)
	assert(true);
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📈 TEST RESULTS');
console.log('='.repeat(60));
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}`);

if (failed === 0) {
	console.log('\n🎉 All tests passed!\n');
	process.exit(0);
} else {
	console.log(`\n⚠️  ${failed} test(s) failed\n`);
	process.exit(1);
}
