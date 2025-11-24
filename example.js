/**
 * HYPER-SIGNALS: Ejemplos de Uso
 *
 * Demuestra la API completa con casos de uso reales
 */

import {
	signal,
	computed,
	effect,
	effectScope,
	trigger,
	startBatch,
	endBatch,
} from './hyper-signals.js';

// ============================================================================
// 1. BÁSICO: Signals y Effects
// ============================================================================

console.log('1️⃣  Ejemplo Básico: Counter');
console.log('-'.repeat(50));

const count = signal(0);

effect(() => {
	console.log(`Count is: ${count()}`);
});
// Output: Count is: 0

count(1); // Output: Count is: 1
count(2); // Output: Count is: 2

// ============================================================================
// 2. COMPUTED: Valores Derivados
// ============================================================================

console.log('\n2️⃣  Ejemplo: Computed Values');
console.log('-'.repeat(50));

const firstName = signal('John');
const lastName = signal('Doe');

const fullName = computed(() => {
	const full = `${firstName()} ${lastName()}`;
	console.log(`Computing fullName: ${full}`);
	return full;
});

console.log(fullName()); // Output: Computing fullName: John Doe
console.log(fullName()); // No output (cached, no recompute!)

firstName('Jane');
console.log(fullName()); // Output: Computing fullName: Jane Doe

// ============================================================================
// 3. BATCHING: Múltiples Updates
// ============================================================================

console.log('\n3️⃣  Ejemplo: Batching');
console.log('-'.repeat(50));

const x = signal(0);
const y = signal(0);

let effectRunCount = 0;

effect(() => {
	console.log(`Sum: ${x() + y()}`);
	effectRunCount++;
});
// Output: Sum: 0

// Sin batching: effect se ejecuta 2 veces
x(1); // Output: Sum: 1
y(1); // Output: Sum: 2
console.log(`Effect ran ${effectRunCount} times\n`);

// Con batching: effect se ejecuta solo 1 vez
effectRunCount = 0;

startBatch();
x(10);
y(10);
endBatch(); // Output: Sum: 20

console.log(`Effect ran ${effectRunCount} times (batched!)`);

// ============================================================================
// 4. DIAMOND DEPENDENCY
// ============================================================================

console.log('\n4️⃣  Ejemplo: Diamond Dependency');
console.log('-'.repeat(50));

const source = signal(1);

const left = computed(() => {
	console.log('Computing left');
	return source() * 2;
});

const right = computed(() => {
	console.log('Computing right');
	return source() * 3;
});

const result = computed(() => {
	console.log('Computing result');
	return left() + right();
});

console.log(`Result: ${result()}`);
// Output:
// Computing left
// Computing right
// Computing result
// Result: 5

source(2);
console.log(`Result: ${result()}`);
// Output:
// Computing left
// Computing right
// Computing result (only once!)
// Result: 10

// ============================================================================
// 5. DYNAMIC DEPENDENCIES
// ============================================================================

console.log('\n5️⃣  Ejemplo: Dynamic Dependencies');
console.log('-'.repeat(50));

const condition = signal(true);
const a = signal('A');
const b = signal('B');

const dynamic = computed(() => {
	return condition() ? a() : b();
});

console.log(dynamic()); // Output: A

condition(false);
console.log(dynamic()); // Output: B

// Cambiar 'a' no afecta porque ya no es dependencia
a('A2');
console.log(dynamic()); // Output: B (no recompute!)

// Cambiar 'b' sí afecta
b('B2');
console.log(dynamic()); // Output: B2

// ============================================================================
// 6. EFFECT SCOPE: Cleanup de Múltiples Effects
// ============================================================================

console.log('\n6️⃣  Ejemplo: Effect Scope');
console.log('-'.repeat(50));

const counter = signal(0);

const dispose = effectScope(() => {
	effect(() => {
		console.log(`Effect 1: ${counter()}`);
	});

	effect(() => {
		console.log(`Effect 2: ${counter() * 2}`);
	});

	effect(() => {
		console.log(`Effect 3: ${counter() * 3}`);
	});
});

// Output:
// Effect 1: 0
// Effect 2: 0
// Effect 3: 0

counter(1);
// Output:
// Effect 1: 1
// Effect 2: 2
// Effect 3: 3

// Cleanup: detiene todos los effects a la vez
dispose();

counter(2); // No output (effects disposed)

// ============================================================================
// 7. TRIGGER: Forzar Actualizaciones
// ============================================================================

console.log('\n7️⃣  Ejemplo: Trigger');
console.log('-'.repeat(50));

const external = { value: 0 };
const s = signal(0);

effect(() => {
	console.log(`External: ${external.value}, Signal: ${s()}`);
});
// Output: External: 0, Signal: 0

// Cambio externo (no reactivo)
external.value = 10;
console.log('External changed, but no effect triggered...');

// Forzar actualización con trigger
trigger(() => {
	external.value; // Track dependencia
	s(); // Track signal
});
// Output: External: 10, Signal: 0

// ============================================================================
// 8. CASO REAL: TodoMVC
// ============================================================================

console.log('\n8️⃣  Ejemplo Real: TodoMVC');
console.log('-'.repeat(50));

class TodoStore {
	constructor() {
		this.todos = signal([]);
		this.filter = signal('all');

		this.filteredTodos = computed(() => {
			const todos = this.todos();
			const f = this.filter();

			if (f === 'active') return todos.filter(t => !t.done);
			if (f === 'completed') return todos.filter(t => t.done);
			return todos;
		});

		this.stats = computed(() => {
			const todos = this.todos();
			return {
				total: todos.length,
				active: todos.filter(t => !t.done).length,
				completed: todos.filter(t => t.done).length,
			};
		});

		// Auto-save to localStorage
		effect(() => {
			const todos = this.todos();
			console.log(`Saving ${todos.length} todos to localStorage...`);
			// localStorage.setItem('todos', JSON.stringify(todos));
		});
	}

	addTodo(text) {
		this.todos([...this.todos(), { id: Date.now(), text, done: false }]);
	}

	toggleTodo(id) {
		this.todos(
			this.todos().map(t => t.id === id ? { ...t, done: !t.done } : t)
		);
	}

	removeTodo(id) {
		this.todos(this.todos().filter(t => t.id !== id));
	}
}

const store = new TodoStore();

// Render effect
effect(() => {
	const todos = store.filteredTodos();
	const stats = store.stats();

	console.log('\n📋 Todo List:');
	todos.forEach(t => {
		console.log(`  ${t.done ? '✅' : '⬜'} ${t.text}`);
	});
	console.log(`\n📊 Stats: ${stats.active} active, ${stats.completed} completed`);
});

// Usar la store
store.addTodo('Learn hyper-signals');
store.addTodo('Build amazing apps');
store.addTodo('Optimize performance');

store.toggleTodo(store.todos()[0].id); // Toggle first todo
store.filter('active'); // Show only active todos
store.filter('all'); // Show all todos

// ============================================================================
// 9. PERFORMANCE: Muchas Actualizaciones
// ============================================================================

console.log('\n9️⃣  Ejemplo: Performance (10k updates)');
console.log('-'.repeat(50));

const perf = signal(0);
let perfEffectCount = 0;

effect(() => {
	perf();
	perfEffectCount++;
});

console.time('10k updates');

startBatch();
for (let i = 0; i < 10000; i++) {
	perf(i);
}
endBatch();

console.timeEnd('10k updates');
console.log(`Effect ran ${perfEffectCount} times (should be 2: initial + batch)`);

// ============================================================================
// 10. CLEANUP: Disposal
// ============================================================================

console.log('\n🔟 Ejemplo: Cleanup');
console.log('-'.repeat(50));

const temp = signal(0);

const dispose1 = effect(() => {
	console.log(`Temp: ${temp()}`);
});
// Output: Temp: 0

temp(1); // Output: Temp: 1

dispose1(); // Stop effect

temp(2); // No output (disposed)

console.log('\n✅ All examples complete!');
