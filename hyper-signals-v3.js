/**
 * HYPER-SIGNALS V3: Final Boss - Stack-Based Propagation
 *
 * V2 Gap Analysis:
 * - Effects: ✅ 1.55x faster (WINNING!)
 * - Most tests: 🤝 Within 7% (competitive)
 * - Signal writes: ❌ 1.89x slower (89% slower)
 *
 * V3 Focus: Replace recursive markDirty with stack-based propagation
 * - Copy alien-signals' propagate pattern exactly
 * - Use stack simulation instead of recursion
 * - Inline all checks for maximum speed
 *
 * Target: Close signal write gap to <10%
 */

// ============================================================================
// FLAGS
// ============================================================================

const CLEAN = 0;
const DIRTY = 1;
const NOTIFYING = 2;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let tracking = null;
let batchDepth = 0;
let queueIndex = 0;
const effectQueue = [];

// ============================================================================
// LINKING (from V2 - already optimized)
// ============================================================================

function link(source, target) {
	const lastDep = target.depsTail;
	if (lastDep !== undefined && lastDep.source === source) {
		return;
	}

	const nextDep = lastDep !== undefined ? lastDep.nextDep : target.deps;
	if (nextDep !== undefined && nextDep.source === source) {
		target.depsTail = nextDep;
		return;
	}

	const lastSub = source.subsTail;
	if (lastSub !== undefined && lastSub.target === target) {
		return;
	}

	const newLink = {
		source,
		target,
		prevDep: lastDep,
		nextDep,
		prevSub: lastSub,
		nextSub: undefined,
	};

	if (nextDep !== undefined) nextDep.prevDep = newLink;
	if (lastDep !== undefined) {
		lastDep.nextDep = newLink;
	} else {
		target.deps = newLink;
	}

	if (lastSub !== undefined) {
		lastSub.nextSub = newLink;
	} else {
		source.subs = newLink;
	}

	target.depsTail = newLink;
	source.subsTail = newLink;
}

function unlink(link, target = link.target) {
	const source = link.source;
	const prevDep = link.prevDep;
	const nextDep = link.nextDep;
	const prevSub = link.prevSub;
	const nextSub = link.nextSub;

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

	if (nextSub !== undefined) {
		nextSub.prevSub = prevSub;
	} else {
		source.subsTail = prevSub;
	}
	if (prevSub !== undefined) {
		prevSub.nextSub = nextSub;
	} else {
		source.subs = nextSub;
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
// PROPAGATION (V3 - Stack-based, NO RECURSION)
// ============================================================================

function propagate(link) {
	let next = link.nextSub;
	let stack;

	top: do {
		const target = link.target;
		const flags = target.flags;

		// Skip if already marked
		if (!(flags & DIRTY)) {
			target.flags = flags | DIRTY;

			// Queue effect for execution
			if (target.effect) {
				if (!(flags & NOTIFYING)) {
					target.flags |= NOTIFYING;
					effectQueue[queueIndex++] = target;
				}
			}
			// Propagate to computed's subscribers
			else if (target.fn) {
				const subSubs = target.subs;
				if (subSubs !== undefined) {
					const nextSub = (link = subSubs).nextSub;
					if (nextSub !== undefined) {
						// Save current position and dive into subscribers
						stack = { value: next, prev: stack };
						next = nextSub;
					}
					continue;
				}
			}
		}

		// Move to next sibling
		if ((link = next) !== undefined) {
			next = link.nextSub;
			continue;
		}

		// Unwind stack
		while (stack !== undefined) {
			link = stack.value;
			stack = stack.prev;
			if (link !== undefined) {
				next = link.nextSub;
				continue top;
			}
		}

		break;
	} while (true);
}

// ============================================================================
// UPDATES
// ============================================================================

function updateComputed(node) {
	node.depsTail = undefined;

	const oldTracking = tracking;
	tracking = node;

	const oldValue = node.value;
	node.value = node.fn(oldValue);

	tracking = oldTracking;

	cleanupDeps(node);
	node.flags = CLEAN;

	return oldValue !== node.value;
}

function updateEffect(node) {
	node.depsTail = undefined;

	const oldTracking = tracking;
	tracking = node;

	node.fn();

	tracking = oldTracking;

	cleanupDeps(node);
	node.flags = CLEAN;
}

// ============================================================================
// BATCHING & FLUSHING
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
			// WRITE (optimized hot path!)
			if (node.value !== newValue) {
				node.value = newValue;

				const subs = node.subs;
				if (subs !== undefined) {
					// Use stack-based propagation (NO RECURSION!)
					propagate(subs);
					flush();
				}
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
		// Inline memoization check
		if (node.flags & DIRTY) {
			if (updateComputed(node)) {
				// Value changed, propagate to subscribers
				const subs = node.subs;
				if (subs) {
					// Shallow propagate (inline for computed)
					let link = subs;
					do {
						const target = link.target;
						const flags = target.flags;
						if (!(flags & DIRTY)) {
							target.flags = flags | DIRTY;
							if (target.effect && !(flags & NOTIFYING)) {
								target.flags |= NOTIFYING;
								effectQueue[queueIndex++] = target;
							}
						}
						link = link.nextSub;
					} while (link !== undefined);
				}
			}
		}

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

	// Run immediately
	const oldTracking = tracking;
	tracking = node;
	fn();
	tracking = oldTracking;

	return function dispose() {
		node.flags = DIRTY;
		cleanupDeps(node);
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
		flags: CLEAN,
	};

	const oldTracking = tracking;
	tracking = node;
	fn();
	tracking = oldTracking;

	if (node.deps) {
		let dep = node.deps;
		do {
			const link = dep;
			dep = dep.nextDep;
			const source = link.source;
			if (source.subs) {
				propagate(source.subs);
			}
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
