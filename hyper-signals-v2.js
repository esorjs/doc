/**
 * HYPER-SIGNALS V2: Ultra-Aggressive Optimizations
 *
 * Second iteration based on REAL benchmark findings:
 * - Adopted linked lists (faster in V8 than arrays)
 * - depsTail optimization (from alien-signals)
 * - Inline everything (minimal function calls)
 * - Ultra-compact bitwise flags
 * - No object pooling (V8 GC is better)
 * - Early exits everywhere
 *
 * Target gaps to close:
 * - Effects: 3.11x slower → optimize dependency tracking
 * - Memoization: 2.79x slower → inline all checks
 * - Signal writes: 1.51x slower → optimize propagation
 */

// ============================================================================
// FLAGS (ultra-compact bitwise)
// ============================================================================

const CLEAN = 0;
const DIRTY = 1;
const NOTIFYING = 2;
const TRACKING = 4;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let tracking = null;
let batchDepth = 0;
let queueIndex = 0;
const effectQueue = [];

// ============================================================================
// LINKING (inline, with depsTail optimization)
// ============================================================================

function link(source, target) {
	// depsTail optimization: check if already linked to last dep
	const lastDep = target.depsTail;
	if (lastDep !== undefined && lastDep.source === source) {
		return; // Early exit!
	}

	// Check next dep (common case: sequential re-linking)
	const nextDep = lastDep !== undefined ? lastDep.nextDep : target.deps;
	if (nextDep !== undefined && nextDep.source === source) {
		target.depsTail = nextDep;
		return; // Early exit!
	}

	// Check if already subscribed to source
	const lastSub = source.subsTail;
	if (lastSub !== undefined && lastSub.target === target) {
		return; // Early exit!
	}

	// Create new link (trust V8 GC, no pooling)
	const newLink = {
		source,
		target,
		prevDep: lastDep,
		nextDep,
		prevSub: lastSub,
		nextSub: undefined,
	};

	// Wire up dependency list
	if (nextDep !== undefined) {
		nextDep.prevDep = newLink;
	}
	if (lastDep !== undefined) {
		lastDep.nextDep = newLink;
	} else {
		target.deps = newLink;
	}

	// Wire up subscriber list
	if (lastSub !== undefined) {
		lastSub.nextSub = newLink;
	} else {
		source.subs = newLink;
	}

	// Update tails
	target.depsTail = newLink;
	source.subsTail = newLink;
}

function unlink(link, target = link.target) {
	const source = link.source;
	const prevDep = link.prevDep;
	const nextDep = link.nextDep;
	const prevSub = link.prevSub;
	const nextSub = link.nextSub;

	// Remove from dependency list
	if (nextDep !== undefined) {
		nextDep.prevDep = prevDep;
	} else {
		target.depsTail = prevDep;
	}
	if (prevDep !== undefined) {
		prevDep.nextDep = nextDep;
	} else {
		target.deps = nextDep;
	}

	// Remove from subscriber list
	if (nextSub !== undefined) {
		nextSub.prevSub = prevSub;
	} else {
		source.subsTail = prevSub;
	}
	if (prevSub !== undefined) {
		prevSub.nextSub = nextSub;
	} else {
		source.subs = nextSub;
		// Cleanup unused computed
		if (source.fn && !source.effect) {
			cleanupDeps(source);
		}
	}

	return nextDep;
}

function cleanupDeps(node) {
	if (!node.deps) return;

	const tail = node.depsTail;
	let dep = tail !== undefined ? tail.nextDep : node.deps;

	while (dep !== undefined) {
		dep = unlink(dep, node);
	}
}

// ============================================================================
// PROPAGATION (inline, minimal branches)
// ============================================================================

function markDirty(node) {
	node.flags |= DIRTY;

	const subs = node.subs;
	if (!subs) return;

	let link = subs;
	do {
		const target = link.target;
		const flags = target.flags;

		// Effect: queue for execution
		if (target.effect) {
			if (!(flags & NOTIFYING)) {
				target.flags |= NOTIFYING;
				effectQueue[queueIndex++] = target;
			}
		}
		// Computed: mark dirty and propagate
		else if (target.fn) {
			if (!(flags & DIRTY)) {
				target.flags |= DIRTY;
				markDirty(target); // Inline recursion
			}
		}

		link = link.nextSub;
	} while (link !== undefined);
}

// ============================================================================
// UPDATES (inline, no function calls)
// ============================================================================

function updateComputed(node) {
	// Clean old deps
	node.depsTail = undefined;

	const oldTracking = tracking;
	tracking = node;

	const oldValue = node.value;
	node.value = node.fn(oldValue);

	tracking = oldTracking;

	// Remove stale dependencies
	cleanupDeps(node);

	node.flags = CLEAN;

	return oldValue !== node.value;
}

function updateEffect(node) {
	// Clean old deps
	node.depsTail = undefined;

	const oldTracking = tracking;
	tracking = node;

	node.fn();

	tracking = oldTracking;

	// Remove stale dependencies
	cleanupDeps(node);

	node.flags = CLEAN;
}

// ============================================================================
// BATCHING & FLUSHING (optimized queue)
// ============================================================================

function flush() {
	if (batchDepth > 0) return;

	while (queueIndex > 0) {
		const effects = effectQueue.slice(0, queueIndex);
		queueIndex = 0;

		for (let i = 0; i < effects.length; i++) {
			const effect = effects[i];
			if (effect.flags & DIRTY) {
				updateEffect(effect);
			} else {
				effect.flags = CLEAN;
			}
		}
	}
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function signal(initialValue) {
	const node = {
		value: initialValue,
		subs: undefined,
		subsTail: undefined,
		flags: CLEAN,
	};

	return function accessor(newValue) {
		if (arguments.length === 0) {
			// READ
			if (tracking) {
				link(node, tracking);
			}
			return node.value;
		} else {
			// WRITE
			if (node.value !== newValue) {
				node.value = newValue;
				markDirty(node);
				flush();
			}
		}
	};
}

export function computed(fn) {
	const node = {
		value: undefined,
		fn,
		effect: false,
		deps: undefined,
		depsTail: undefined,
		subs: undefined,
		subsTail: undefined,
		flags: DIRTY,
	};

	return function accessor() {
		// INLINE memoization check (no function call!)
		if (node.flags & DIRTY) {
			if (updateComputed(node)) {
				// Value changed, notify subscribers
				const subs = node.subs;
				if (subs) {
					let link = subs;
					do {
						const target = link.target;
						if (!(target.flags & DIRTY)) {
							target.flags |= DIRTY;
							if (target.effect && !(target.flags & NOTIFYING)) {
								target.flags |= NOTIFYING;
								effectQueue[queueIndex++] = target;
							}
						}
						link = link.nextSub;
					} while (link !== undefined);
				}
			}
		}

		// Track dependency
		if (tracking) {
			link(node, tracking);
		}

		return node.value;
	};
}

export function effect(fn) {
	const node = {
		fn,
		effect: true,
		deps: undefined,
		depsTail: undefined,
		subs: undefined,
		subsTail: undefined,
		flags: CLEAN,
	};

	// Run immediately (inline)
	const oldTracking = tracking;
	tracking = node;
	fn();
	tracking = oldTracking;

	return function dispose() {
		// Mark as disposed and cleanup
		node.flags = DIRTY; // Prevent re-execution
		cleanupDeps(node);

		// Remove from parent scope if any
		if (node.subs) {
			unlink(node.subs);
		}
	};
}

export function effectScope(fn) {
	const node = {
		deps: undefined,
		depsTail: undefined,
		subs: undefined,
		subsTail: undefined,
		flags: CLEAN,
	};

	const oldTracking = tracking;
	tracking = node;
	fn();
	tracking = oldTracking;

	return function dispose() {
		cleanupDeps(node);
		if (node.subs) {
			unlink(node.subs);
		}
	};
}

export function trigger(fn) {
	const node = {
		deps: undefined,
		depsTail: undefined,
		flags: TRACKING,
	};

	const oldTracking = tracking;
	tracking = node;
	fn();
	tracking = oldTracking;

	// Trigger all tracked dependencies
	if (node.deps) {
		let dep = node.deps;
		do {
			const link = dep;
			dep = dep.nextDep;
			markDirty(link.source);
		} while (dep !== undefined);

		cleanupDeps(node);
	}

	flush();
}

export function startBatch() {
	batchDepth++;
}

export function endBatch() {
	if (--batchDepth === 0) {
		flush();
	}
}

export function getBatchDepth() {
	return batchDepth;
}

export function getActiveSub() {
	return tracking;
}

export function setActiveSub(sub) {
	const prev = tracking;
	tracking = sub;
	return prev;
}

// Compatibility
export function isSignal(fn) {
	return fn.name === 'accessor';
}

export function isComputed(fn) {
	return fn.name === 'accessor';
}

export function isEffect(fn) {
	return fn.name === 'dispose';
}

export function isEffectScope(fn) {
	return fn.name === 'dispose';
}
