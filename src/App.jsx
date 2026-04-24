import { useState, useMemo } from "react";

const CATEGORIES = [
{
    id: "js-core", label: "JS Core", icon: "📜", color: "#F7DF1E", section: "JavaScript",
    def_en: "JavaScript is a single-threaded, dynamically typed, prototype-based scripting language. It runs in browsers and servers (Node.js) and uses an event loop to handle async work without blocking the main thread.",
    def_hi: "JavaScript ek single-threaded, dynamically typed, prototype-based scripting language hai. Ye browsers aur servers (Node.js) dono jagah chalti hai, aur event loop use karke async kaam handle karti hai — main thread ko block kiye bina.",
    questions: [
      {
        q: "What are the 7 primitive types in JavaScript?",
        a_en: "JavaScript has 7 primitives: string, number, bigint, boolean, undefined, null, and symbol. Primitives are immutable and compared by value. Everything else is an Object, compared by reference. typeof null === 'object' is a historical bug.",
        a_hi: "Seven primitives: string, number, bigint, boolean, undefined, null, aur symbol. Primitives immutable hote hain aur value se compare hote hain. Baaki sab Object hai jo reference se compare hota hai. typeof null === 'object' ek historical bug hai.",
        code: `// Compared by value
let a = 5, b = 5;
console.log(a === b); // true

// Compared by reference
let obj1 = { x: 1 };
let obj2 = { x: 1 };
console.log(obj1 === obj2); // false

typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" ← legacy bug!
typeof Symbol()   // "symbol"`
      },
      {
        q: "What is the difference between == and ===?",
        a_en: "=== is strict equality — no type coercion. == is loose equality — coerces types. Quirks: null == undefined is true, but null == 0 is false. Always prefer === to avoid subtle coercion bugs.",
        a_hi: "=== strict equality hai — coercion nahi karta. == loose hai — types coerce karta hai. Quirks: null == undefined true, lekin null == 0 false. Hamesha === use karo.",
        code: `// === strict
1 === "1"        // false
0 === false      // false

// == loose
1 == "1"         // true
0 == false       // true
null == undefined // true
null == 0        // false ← quirk!`
      },
      {
        q: "Explain var, let, and const differences.",
        a_en: "var is function-scoped, hoisted to undefined. let and const are block-scoped, hoisted but in TDZ. const cannot be reassigned but content can mutate. Use const by default, let for reassignment, avoid var.",
        a_hi: "var function-scoped hai, hoisted hoke undefined se init. let/const block-scoped hai, hoisted par TDZ mein. const reassign nahi ho sakta but content mutate ho sakta hai. Default const, zaroorat pe let, var avoid.",
        code: `// var — function-scoped
function ex() {
  console.log(x); // undefined
  var x = 5;
  if (true) { var y = 10; }
  console.log(y); // 10 — leaked!
}

// let — block-scoped
if (true) { let z = 20; }
// console.log(z); ReferenceError

// const — can mutate content
const user = { name: "Raj" };
user.name = "Aman"; // ✓
// user = {}; ✗ TypeError`
      },
      {
        q: "What is hoisting?",
        a_en: "Declarations are moved to top of scope before code runs. var is hoisted to undefined. Function declarations are fully hoisted. let/const stay in Temporal Dead Zone.",
        a_hi: "Declarations code run hone se pehle scope ke top pe chale jaate hain. var undefined se init hoti hai. Function declarations fully hoist hoti hain. let/const TDZ mein rehti hain.",
        code: `console.log(x); // undefined (hoisted)
var x = 5;

sayHi(); // "Hi!" ← works!
function sayHi() { console.log("Hi!"); }

// sayBye(); TypeError
var sayBye = function() {};

// console.log(a); ReferenceError
let a = 10;`
      },
      {
        q: "What is the Temporal Dead Zone (TDZ)?",
        a_en: "TDZ is the period between entering a block and the let/const declaration. Any access during this window throws ReferenceError. Prevents use-before-declare bugs that var silently allows.",
        a_hi: "TDZ wo period hai jab block start hua par let/const declaration abhi nahi hui. Is window mein access karne pe ReferenceError. Use-before-declare bugs rokta hai jo var silently allow karta tha.",
        code: `{
  // TDZ starts here
  // console.log(x); ← ReferenceError!
  let x = 5; // TDZ ends
  console.log(x); // 5 ✓
}

function test(val = x) {
  let x = 10;
  return val;
}
test(); // ReferenceError!`
      },
      {
        q: "What is type coercion with surprising examples?",
        a_en: "Automatic type conversion. [] + [] = '', '5' - 1 = 4 (numeric), '5' + 1 = '51' (string). Use explicit conversion: Number(), String(), Boolean().",
        a_hi: "Automatic type conversion. [] + [] = '', '5' - 1 = 4 (numeric), '5' + 1 = '51' (string). Explicit conversion use karo: Number(), String(), Boolean().",
        code: `[] + []        // ""
[] + {}        // "[object Object]"
"5" - 1        // 4  (- numeric)
"5" + 1        // "51" (+ string)
true + 1       // 2
null + 1       // 1
undefined + 1  // NaN

// Safe
Number("5") + 1    // 6
String(5) + "px"   // "5px"`
      },
      {
        q: "What is the difference between null and undefined?",
        a_en: "undefined = declared but not assigned, missing arg, missing property. null = intentional absence, explicitly assigned. typeof undefined === 'undefined'; typeof null === 'object' (legacy bug).",
        a_hi: "undefined = declared par assigned nahi, missing arg, missing property. null = intentional 'koi value nahi', explicitly set. typeof null === 'object' legacy bug hai.",
        code: `let a;
console.log(a); // undefined

let b = null;
console.log(b); // null

function greet(name) { console.log(name); }
greet(); // undefined

const user = { name: "Raj" };
console.log(user.age); // undefined

let selectedUser = null; // intentional

typeof undefined // "undefined"
typeof null      // "object" ← bug!`
      },
      {
        q: "What is NaN and how to check for it?",
        a_en: "Result of invalid numeric operations. Only value not equal to itself: NaN !== NaN. Correct: Number.isNaN(v). Wrong: isNaN('abc') returns true (misleading due to coercion).",
        a_hi: "Invalid numeric operations ka result. Ekmatra value jo khud ke barabar nahi: NaN !== NaN. Correct: Number.isNaN(v). Wrong: isNaN('abc') true aayega coercion ki wajah se.",
        code: `0 / 0              // NaN
parseInt("abc")    // NaN
Math.sqrt(-1)      // NaN

NaN === NaN        // false
NaN !== NaN        // true ← check trick

// Correct
Number.isNaN(NaN)     // true
Number.isNaN("abc")   // false

// Wrong
isNaN("abc")          // true (misleading!)`
      },
      {
        q: "Deep copy vs shallow copy?",
        a_en: "Shallow copies only top-level — nested objects shared. Methods: spread, Object.assign. Deep clones everything: structuredClone() (modern), JSON.parse(JSON.stringify()) (loses functions/undefined).",
        a_hi: "Shallow sirf top-level copy karti hai — nested shared. Methods: spread, Object.assign. Deep sab recursively clone: structuredClone() (modern), JSON.parse(JSON.stringify()) — functions/undefined lose.",
        code: `const original = {
  name: "Raj",
  address: { city: "Mumbai" }
};

// Shallow
const shallow = { ...original };
shallow.address.city = "Delhi";
console.log(original.address.city); // "Delhi" ✗

// Deep — modern
const deep = structuredClone(original);
deep.address.city = "Pune";
console.log(original.address.city); // unchanged ✓

// JSON method (limited)
const jsonCopy = JSON.parse(JSON.stringify(original));
// Lost: functions, undefined, Date, Symbol`
      },
      {
        q: "How does JavaScript handle floating point precision?",
        a_en: "Uses IEEE 754 doubles: 0.1 + 0.2 !== 0.3. Safe integer range: MAX_SAFE_INTEGER (2^53 - 1). Use BigInt for large ints, integer cents for money.",
        a_hi: "IEEE 754 doubles use karta hai: 0.1 + 0.2 !== 0.3. Safe integer range: 2^53 - 1. Large integers ke liye BigInt, paise ke liye integer cents use karo.",
        code: `0.1 + 0.2          // 0.30000000000000004
0.1 + 0.2 === 0.3  // false!

Number.MAX_SAFE_INTEGER // 9007199254740991

// BigInt for large
9007199254740993n === 9007199254740992n // false ✓

// Money — use paise (integer)
const price = 9999; // ₹99.99
const total = price * 3; // 29997

// Approx equal
function approxEqual(a, b, ε = 1e-10) {
  return Math.abs(a - b) < ε;
}`
      },
    ],
  },

  {
    id: "js-scope", label: "Scope & This", icon: "🎯", color: "#FF9F43", section: "JavaScript",
    def_en: "Scope defines variable accessibility. JS has global, function, and block scope. 'this' is a dynamic binding — depends on call context, not definition location (except arrow functions).",
    def_hi: "Scope define karti hai variables kahan accessible hain. Global, function, aur block scope hoti hai. 'this' dynamic binding hai — call context pe depend karti hai, definition location pe nahi (arrow functions lexical hain).",
    questions: [
      {
        q: "Explain lexical scope and the scope chain.",
        a_en: "Function scope is determined by where written, not where called. Variable lookup walks up: current → enclosing → global. Closures build on lexical scope.",
        a_hi: "Function ka scope tay hota hai ki kahan likha hai, kahan call hua isse nahi. Variable lookup upar walk karti hai: current → enclosing → global. Closures isi pe based hain.",
        code: `const globalVar = "I'm global";

function outer() {
  const outerVar = "I'm outer";
  
  function inner() {
    const innerVar = "I'm inner";
    console.log(innerVar);  // own
    console.log(outerVar);  // walks up
    console.log(globalVar); // reaches global
  }
  inner();
}`
      },
      {
        q: "What are the different values of 'this'?",
        a_en: "Global: window. Method call: obj. Plain function: undefined (strict). Arrow: lexically inherited. Constructor (new): new object. call/apply/bind: explicit. DOM event: the element.",
        a_hi: "Global: window. Method call: obj. Plain function: undefined (strict). Arrow: lexically inherit. Constructor (new): naya object. call/apply/bind: explicit. DOM event: wo element.",
        code: `// Method call
const user = {
  name: "Raj",
  greet() { console.log(this.name); }
};
user.greet(); // "Raj"

// Arrow — lexical
const obj = {
  name: "Aman",
  arrow: () => console.log(this.name), // undefined!
  regular() {
    const inner = () => console.log(this.name); // "Aman"
    inner();
  }
};

// Explicit
function say() { console.log(this.name); }
say.call({ name: "Ravi" }); // "Ravi"`
      },
      {
        q: "call, apply, and bind differences?",
        a_en: "call(ctx, a, b) invokes immediately, listed args. apply(ctx, [a,b]) invokes immediately, array args. bind(ctx, a) returns new function, not invoked.",
        a_hi: "call(ctx, a, b) immediately invoke, args listed. apply(ctx, [a,b]) invoke, args array. bind(ctx, a) naya function return karta hai — immediately invoke nahi hota.",
        code: `const person = { name: "Raj" };

function greet(greeting, punct) {
  console.log(greeting + ", " + this.name + punct);
}

greet.call(person, "Hello", "!");  // "Hello, Raj!"
greet.apply(person, ["Hi", "."]);  // "Hi, Raj."

const greetRaj = greet.bind(person, "Namaste");
greetRaj("!");  // "Namaste, Raj!"

// Partial application
const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
double(5); // 10`
      },
      {
        q: "How do arrow functions differ for 'this'?",
        a_en: "No own 'this' — captured lexically at definition. Cannot be constructor, no arguments, cannot be generator. Ideal for callbacks inside class methods.",
        a_hi: "Apna this nahi — define time pe lexically capture. Constructor nahi ban sakte, arguments nahi, generator nahi. Class methods ke andar callbacks mein ideal.",
        code: `class Timer {
  constructor() { this.seconds = 0; }
  
  // Regular — 'this' lost
  startBroken() {
    setInterval(function() {
      this.seconds++; // undefined!
    }, 1000);
  }
  
  // Arrow — captures 'this'
  startFixed() {
    setInterval(() => {
      this.seconds++; // ✓ Timer instance
    }, 1000);
  }
}`
      },
      {
        q: "What is variable shadowing?",
        a_en: "When inner scope declares a variable with the same name as outer. Inner takes precedence within its block. ESLint's no-shadow rule warns about accidental shadowing.",
        a_hi: "Jab inner scope mein outer ke same name ka variable declare ho. Inner priority leti hai us block mein. ESLint no-shadow rule accidental shadowing warn karta hai.",
        code: `let x = 1;
{
  let x = 2;           // shadows outer
  console.log(x);      // 2
}
console.log(x);        // 1

// Common gotcha
function findUser(users, user) {
  return users.find(u => u.name === user);
  // 'user' param — different from element
}`
      },
      {
        q: "What does 'use strict' do?",
        a_en: "Throws errors for unsafe ops: undeclared variables, deleting non-configurable props, duplicate params. this in plain functions = undefined. ES modules & classes are strict by default.",
        a_hi: "Unsafe operations pe errors throw karta hai: undeclared variables, duplicate params, etc. Plain functions mein this = undefined. ES modules aur classes default strict mein chalte hain.",
        code: `"use strict";

// x = 10; ReferenceError

// function fn(a, a) {} SyntaxError

function check() {
  console.log(this); // undefined (not window)
}
check();

// ES Modules — strict by default
class MyClass {
  method() {
    // strict auto-enabled
  }
}`
      },
      {
        q: "How does module scope work in ES modules?",
        a_en: "Each ES module has own top-level scope — no global leak. Strict mode by default. Code runs once; exports are live bindings. Top-level await supported. import() for dynamic loading.",
        a_hi: "Har ES module ka apna scope hota hai — global mein leak nahi. Strict mode default. Code ek baar chalta hai; exports live bindings hain. Top-level await ESM mein supported.",
        code: `// counter.js
let count = 0;
export function increment() { count++; }
export function getCount() { return count; }

// app.js
// import { increment, getCount } @ "./counter.js";
increment();
increment();
console.log(getCount()); // 2

// Live bindings — always latest
// config.js
export let apiUrl = "http://localhost";
export function updateUrl(u) { apiUrl = u; }

// main.js sees updates!`
      },
    ],
  },

  {
    id: "js-closures", label: "Closures", icon: "🔒", color: "#FFA552", section: "JavaScript",
    def_en: "A closure is a function that retains access to its lexical scope — the variables from its outer function — even after that outer function has finished executing. Every function in JavaScript forms a closure over the scope where it was defined.",
    def_hi: "Closure ek aisa function hota hai jo apne lexical scope ka access retain karta hai — outer function ke variables ka — even after outer function khatam ho chuka ho. JavaScript mein har function apne define hone wale scope ka closure banata hai.",
    questions: [
      {
        q: "What is a closure?",
        a_en: "A function bundled with references to its surrounding lexical environment. Inner function retains access to outer variables even after outer returns. The function 'closes over' those variables.",
        a_hi: "Ek function jo surrounding lexical environment ke references ke saath bundle hota hai. Inner function outer ke variables ko access rakhta hai even after outer return ho jaaye. Function un variables ko 'close over' karta hai.",
        code: `function makeCounter() {
  let count = 0; // private
  
  return function() {
    count++;
    return count;
  };
}

const c1 = makeCounter();
const c2 = makeCounter();

c1(); // 1
c1(); // 2
c2(); // 1 — separate closure
c1(); // 3

// count is private — can't access outside`
      },
      {
        q: "How do closures enable data encapsulation?",
        a_en: "Factory returns methods that close over internal variables unreachable outside. This is the Module pattern — standard encapsulation before ES modules.",
        a_hi: "Factory function methods return karti hai jo internal variables close karte hain jo baahar se unreachable. Ye Module pattern hai — ES modules aane se pehle encapsulation ka standard.",
        code: `function createWallet(initial) {
  let balance = initial;  // PRIVATE
  let txns = [];          // PRIVATE
  
  return {
    deposit(n) { balance += n; txns.push({in: n}); },
    withdraw(n) {
      if (n > balance) throw new Error("Insufficient");
      balance -= n;
    },
    getBalance() { return balance; },
    getHistory() { return [...txns]; }
  };
}

const w = createWallet(1000);
w.deposit(500);
console.log(w.getBalance()); // 1500
// w.balance → undefined — truly private!`
      },
      {
        q: "What is the classic loop + closure bug and fix?",
        a_en: "for(var i=0;i<3;i++) setTimeout(()=>console.log(i),0) logs 3,3,3 — all closures share same i. Fix 1: let (block-scoped). Fix 2: IIFE to capture current value.",
        a_hi: "for(var i=0;i<3;i++) setTimeout(()=>console.log(i),0) — 3,3,3 print karta hai, saare closures same i share karte hain. Fix 1: let use karo. Fix 2: IIFE se current value capture karo.",
        code: `// BUG — all share same 'i'
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 3, 3, 3

// FIX 1 — let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 0, 1, 2

// FIX 2 — IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}

// React — use item ID not index
items.map(item => (
  <button onClick={() => handleClick(item.id)}>
    {item.name}
  </button>
));`
      },
      {
        q: "What is a stale closure in React?",
        a_en: "References a variable from a previous render's scope. useEffect with setInterval reading state not in deps = forever reads initial value. Fixes: add to deps, ref, or functional updater.",
        a_hi: "Previous render ke scope ka variable reference karti hai. useEffect mein setInterval state read kar raha par deps mein nahi — hamesha initial value. Fixes: deps mein add, ref use, ya functional updater.",
        code: `// BUG
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // always 0+1!
    }, 1000);
    return () => clearInterval(id);
  }, []); // frozen at 0
}

// FIX 1 — functional
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // ✓ latest
  }, 1000);
  return () => clearInterval(id);
}, []);

// FIX 2 — ref pattern
const countRef = useRef(count);
countRef.current = count;
useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // ✓ latest
  }, 1000);
  return () => clearInterval(id);
}, []);`
      },
      {
        q: "How are closures related to useCallback?",
        a_en: "useCallback memoizes a function reference. Without it, new closure every render → memoized children re-render. With wrong deps, closure holds stale values.",
        a_hi: "useCallback memoized function reference return karta hai. Iske bina har render naya closure — memoized children re-render hote hain. Galat deps hon toh closure stale values hold karega.",
        code: `// Without — new closure every render
function Parent() {
  const handleClick = () => console.log("clicked");
  return <Child onClick={handleClick} />;
  // Child re-renders even if memoized!
}

// With useCallback — stable
function Parent() {
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // empty deps
  return <Child onClick={handleClick} />;
}

// Stale closure trap
const handleClick = useCallback(() => {
  console.log(count); // may be stale!
}, []); // missing count!

// Correct
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);`
      },
      {
        q: "How do closures cause memory leaks?",
        a_en: "Closures keep outer scope alive. Leak: event listener closure references large data but never removed — data stays in memory. useEffect cleanup prevents this.",
        a_hi: "Closures outer scope zinda rakhte hain. Leak: event listener closure bade data ko reference kare aur remove na ho — data memory mein rahega. useEffect cleanup isse bachata hai.",
        code: `// LEAK
function setup() {
  const huge = new Array(1000000).fill("data");
  document.addEventListener("click", () => {
    console.log(huge.length); // closure
  });
  // huge never freed!
}

// CLEAN
function setupClean() {
  const huge = new Array(1000000).fill("data");
  const handler = () => console.log(huge.length);
  document.addEventListener("click", handler);
  return () => {
    document.removeEventListener("click", handler);
  };
}

// React
useEffect(() => {
  const handler = () => process();
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);`
      },
      {
        q: "How do closures interact with async/await?",
        a_en: "Async function closes over state at call time. If state changes during await, closure holds old values. Use AbortController to cancel stale fetches, or capture values before await.",
        a_hi: "Async function call time pe state close karta hai. Await ke beech state change ho toh closure purani values hold karta hai. AbortController use karo stale fetches cancel karne ke liye.",
        code: `// Race condition bug
function Profile({ userId }) {
  useEffect(() => {
    async function load() {
      const data = await fetch('/user/' + userId)
        .then(r => r.json());
      setUser(data); // may set wrong user!
    }
    load();
  }, [userId]);
}

// Fix — AbortController
useEffect(() => {
  const ctrl = new AbortController();
  
  async function load() {
    try {
      const data = await fetch('/user/' + userId, {
        signal: ctrl.signal
      }).then(r => r.json());
      setUser(data);
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
  }
  load();
  
  return () => ctrl.abort();
}, [userId]);`
      },
      {
        q: "What is the IIFE pattern?",
        a_en: "Immediately Invoked Function Expression creates a private scope that runs once. Variables don't leak. Was the original module pattern before ES modules.",
        a_hi: "IIFE private scope banata hai jo turant run hota hai. Variables leak nahi hote. ES modules aane se pehle original module pattern tha.",
        code: `// Basic IIFE
(function() {
  var private1 = "hidden";
  var private2 = "also hidden";
})();

// Module pattern via IIFE
const calc = (function() {
  let result = 0; // private
  return {
    add(n) { result += n; return this; },
    sub(n) { result -= n; return this; },
    get() { return result; }
  };
})();

calc.add(5).sub(2).get(); // 3
// calc.result ✗ undefined`
      },
    ],
  },

  {
    id: "js-async", label: "Async JS", icon: "⏳", color: "#48DBFB", section: "JavaScript",
    def_en: "JavaScript is single-threaded but handles concurrency via the Event Loop. Async operations are offloaded to browser/Node APIs and their results are queued. Promises and async/await provide ergonomic patterns over callbacks.",
    def_hi: "JavaScript single-threaded hai par Event Loop se concurrency handle karta hai. Async operations browser/Node APIs ko offload hote hain aur results queue mein aate hain. Promises aur async/await callbacks ke upar ergonomic patterns dete hain.",
    questions: [
      {
        q: "Explain the JavaScript Event Loop.",
        a_en: "Manages Call Stack, Web APIs, Macrotask Queue (setTimeout), Microtask Queue (Promise). After each macrotask, ENTIRE microtask queue drains. That's why Promise.resolve().then() runs before setTimeout(fn, 0).",
        a_hi: "Call Stack, Web APIs, Macrotask Queue (setTimeout), Microtask Queue (Promise) manage karta hai. Har macrotask ke baad POORA microtask queue drain hota hai. Isi liye Promise.resolve().then() hamesha setTimeout(fn, 0) se pehle.",
        code: `console.log("1"); // sync
setTimeout(() => console.log("2"), 0); // macrotask
Promise.resolve().then(() => console.log("3")); // microtask
console.log("4"); // sync

// Output: 1, 4, 3, 2
// Microtasks drain BEFORE next macrotask

// Event Loop order:
// 1. Run sync code
// 2. Drain ENTIRE microtask queue
// 3. Render
// 4. Pick ONE macrotask
// 5. Repeat from step 2`
      },
      {
        q: "Microtasks vs macrotasks?",
        a_en: "Macrotasks: setTimeout, setInterval, I/O, UI events. Microtasks: Promise callbacks, queueMicrotask, MutationObserver. All microtasks flush after each macrotask. Infinite microtask chains can starve the loop.",
        a_hi: "Macrotasks: setTimeout, setInterval, I/O, UI events. Microtasks: Promise callbacks, queueMicrotask, MutationObserver. Har macrotask ke baad saari microtasks flush. Infinite microtask chain loop starve kar sakti hai.",
        code: `Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => {
    console.log("micro 2"); // runs before macro!
  });
});
setTimeout(() => console.log("macro"), 0);
// Output: micro 1, micro 2, macro

// Starvation
function starve() {
  Promise.resolve().then(starve);
}
// starve(); ← freezes everything

queueMicrotask(() => {
  console.log("before next macrotask");
});`
      },
      {
        q: "How do Promises work internally?",
        a_en: "3 states: pending, fulfilled, rejected (irreversible). Executor runs synchronously. .then() registers microtask callbacks. Chainable — each .then returns new Promise.",
        a_hi: "3 states: pending, fulfilled, rejected (irreversible). Executor sync run hota hai. .then() microtask callbacks register karta hai. Chainable — har .then naya Promise return karta hai.",
        code: `const p = new Promise((resolve, reject) => {
  console.log("1. Executor (sync)");
  setTimeout(() => {
    resolve("success"); // → fulfilled
    reject("too late"); // ignored!
  }, 100);
});

console.log("2. After new Promise");
p.then(v => console.log("3. Got:", v));
// Output: 1, 2, 3 (after 100ms)

// Chaining
fetch("/api/user")
  .then(res => res.json())
  .then(user => user.name)
  .then(name => name.toUpperCase())
  .catch(err => console.error(err));`
      },
      {
        q: "Promise.all vs allSettled vs race vs any?",
        a_en: "all: all resolve or first reject. allSettled: waits for all, never rejects. race: first to settle. any: first fulfilled, rejects if all reject.",
        a_hi: "all: sab resolve ya first reject. allSettled: sab settle tak wait, kabhi reject nahi. race: first settled. any: first fulfilled, sab reject hon toh reject.",
        code: `const fast = new Promise(r => setTimeout(() => r("fast"), 100));
const slow = new Promise(r => setTimeout(() => r("slow"), 500));
const fail = new Promise((_, r) => setTimeout(() => r("err"), 200));

// all — fail-fast
Promise.all([fast, slow]).then(([f,s]) => console.log(f,s));

// allSettled — never rejects
Promise.allSettled([fast, fail]).then(results => {
  results.forEach(r => {
    r.status === "fulfilled"
      ? console.log(r.value)
      : console.log(r.reason);
  });
});

// race — first to finish
Promise.race([fast, slow, fail])
  .then(v => console.log(v)); // "fast"

// any — first success
Promise.any([fail, fast])
  .then(v => console.log(v)); // "fast"

// Timeout pattern
Promise.race([
  fetch("/api"),
  new Promise((_, r) => setTimeout(() => r("timeout"), 5000))
]);`
      },
      {
        q: "async/await and how it relates to Promises?",
        a_en: "async functions always return Promise. await suspends until Promise settles. Syntactic sugar over .then(). Use try/catch for errors. Sequential awaits are slow — use Promise.all for parallel.",
        a_hi: "async functions hamesha Promise return karte hain. await Promise settle tak suspend karta hai. .then() ka syntactic sugar. Errors ke liye try/catch. Sequential awaits slow — parallel ke liye Promise.all.",
        code: `// Promise version
function loadUser(id) {
  return fetch('/api/user/' + id)
    .then(r => r.json())
    .then(data => data.name);
}

// async/await — cleaner
async function loadUser(id) {
  try {
    const res = await fetch('/api/user/' + id);
    const data = await res.json();
    return data.name;
  } catch (err) {
    console.error(err);
  }
}

// Sequential (slow)
async function slow() {
  const a = await fetchA(); // 1s
  const b = await fetchB(); // 1s
  return [a, b]; // Total: 2s
}

// Parallel (fast)
async function fast() {
  const [a,b] = await Promise.all([fetchA(), fetchB()]);
  return [a,b]; // Total: ~1s
}`
      },
      {
        q: "Common async/await pitfalls?",
        a_en: "1) Missing await. 2) Sequential when parallel possible. 3) Unhandled rejections. 4) forEach doesn't await. 5) Top-level await only in ESM.",
        a_hi: "1) await bhool jaana. 2) Parallel possible hote hue sequential. 3) Unhandled rejections. 4) forEach await nahi karta. 5) Top-level await sirf ESM mein.",
        code: `// 1. Missing await
async function bug() {
  const data = fetch('/api'); // Promise, not data!
}

// 2. forEach doesn't await
async function broken() {
  [1,2,3].forEach(async id => {
    await save(id); // fire-and-forget!
  });
  console.log("done"); // runs immediately
}

// Fix — use for...of
async function correct() {
  for (const id of [1,2,3]) {
    await save(id);
  }
}

// 3. Parallel ops
async function allAtOnce() {
  await Promise.all([save(1), save(2), save(3)]);
}`
      },
      {
        q: "What is callback hell and how do Promises solve it?",
        a_en: "Deeply nested callbacks — hard to read, error-prone. Promises flatten via .then() chain. async/await makes it look synchronous with try/catch.",
        a_hi: "Deeply nested callbacks — padhna mushkil, errors handle karna tough. Promises .then() chain se flat karte hain. async/await sync jaisa dikhta hai try/catch ke saath.",
        code: `// Callback hell
getUser(id, (err, user) => {
  if (err) return handle(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handle(err);
    getProducts(orders[0].id, (err, prods) => {
      if (err) return handle(err);
      // ...pyramid of doom
    });
  });
});

// Promises — flat
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => getProducts(orders[0].id))
  .catch(err => handle(err));

// async/await — sync-like
async function process() {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    const prods = await getProducts(orders[0].id);
    return prods;
  } catch (err) {
    handle(err);
  }
}`
      },
      {
        q: "Generators and their relationship to async?",
        a_en: "Generators (function*) can pause at yield and resume. Precursor to async/await. Still useful for: lazy infinite sequences, iterators, state machines, cancelable workflows.",
        a_hi: "Generators (function*) yield pe pause kar sakte hain aur resume. async/await ke precursor the. Aaj bhi useful: lazy infinite sequences, iterators, state machines, cancelable workflows.",
        code: `function* counter() {
  let i = 0;
  while (true) yield i++;
}

const gen = counter();
gen.next(); // { value: 0, done: false }
gen.next(); // { value: 1, done: false }

// Infinite Fibonacci (lazy)
function* fib() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Async generator — streaming
async function* fetchPages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next).then(r => r.json());
    yield res.data;
    next = res.nextUrl;
  }
}

// Consume
for await (const page of fetchPages('/api')) {
  console.log(page);
}`
      },
      {
        q: "How does requestAnimationFrame relate to the event loop?",
        a_en: "rAF callbacks run after microtasks and before paint — ~16ms for 60fps. Synchronized with refresh cycle unlike setTimeout which drifts. Use for animations and DOM measurements.",
        a_hi: "rAF callbacks microtasks ke baad aur paint se pehle run hote hain — ~16ms 60fps ke liye. Refresh cycle ke saath synchronized, setTimeout drift karta hai. Animations aur DOM measurements ke liye.",
        code: `// Smooth animation
let pos = 0;
function animate() {
  pos += 2;
  element.style.left = pos + 'px';
  if (pos < 500) requestAnimationFrame(animate);
}
animate();

// Throttle with rAF
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateUI();
      ticking = false;
    });
    ticking = true;
  }
});

const id = requestAnimationFrame(animate);
cancelAnimationFrame(id);

// Order: sync → microtasks → rAF → render`
      },
    ],
  },

  {
    id: "js-proto", label: "Prototypes & OOP", icon: "🧬", color: "#A29BFE", section: "JavaScript",
    def_en: "JavaScript uses prototypal inheritance — objects have a [[Prototype]] link to another object from which they inherit properties. ES6 classes are syntactic sugar over this prototype chain.",
    def_hi: "JavaScript prototypal inheritance use karti hai — har object ke paas [[Prototype]] link hota hai kisi dusre object se jahan se wo properties inherit karta hai. ES6 classes isi prototype chain ke upar syntactic sugar hain.",
    questions: [
      {
        q: "Explain prototypal inheritance.",
        a_en: "Every object has [[Prototype]] (Object.getPrototypeOf or __proto__). Lookup walks chain: own → prototype → prototype's prototype → Object.prototype → null.",
        a_hi: "Har object ke paas [[Prototype]] (Object.getPrototypeOf ya __proto__). Lookup chain walk karti hai: own → prototype → prototype's prototype → Object.prototype → null.",
        code: `const animal = {
  eats: true,
  walk() { console.log("walking"); }
};

const dog = Object.create(animal);
dog.bark = function() { console.log("woof"); };

dog.bark();  // "woof" (own)
dog.walk();  // "walking" (inherited)
console.log(dog.eats); // true

Object.getPrototypeOf(dog) === animal; // true

// Null prototype — no inheritance
const pure = Object.create(null);
// pure.toString ✗ undefined`
      },
      {
        q: "How does 'new' work internally?",
        a_en: "new Foo() : 1) Create empty object. 2) Set [[Prototype]] to Foo.prototype. 3) Call Foo with this = new object. 4) Return new object (unless constructor explicitly returns another object).",
        a_hi: "new Foo() : 1) Empty object banaye. 2) [[Prototype]] Foo.prototype pe set. 3) Foo ko call kare this = new object. 4) New object return kare (jab tak constructor kisi aur object ko return na kare).",
        code: `function User(name) { this.name = name; }
User.prototype.greet = function() {
  return "Hi, " + this.name;
};

const u = new User("Raj");
u.greet(); // "Hi, Raj"

// Manual equivalent
function manualNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  return result instanceof Object ? result : obj;
}

// Gotcha — constructor returning object
function Weird() {
  this.a = 1;
  return { b: 2 }; // overrides!
}
const w = new Weird();
console.log(w); // { b: 2 }`
      },
      {
        q: "Classical vs prototypal inheritance?",
        a_en: "Classical: instances from class blueprints, strict hierarchy. Prototypal: objects inherit from objects directly. ES6 class is sugar — still prototypal underneath. Prototypes allow flexible composition.",
        a_hi: "Classical: instances class blueprints se, strict hierarchy. Prototypal: objects direct objects se inherit. ES6 class sugar hai — underneath still prototypal. Prototypes flexible composition allow karte hain.",
        code: `// Classical style
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(this.name + " eating"); }
}
class Dog extends Animal {
  bark() { console.log("woof"); }
}

// Prototypal style
const animal = {
  init(name) { this.name = name; return this; },
  eat() { console.log(this.name + " eating"); }
};
const dog = Object.create(animal);
dog.bark = function() { console.log("woof"); };
const rex = Object.create(dog).init("Rex");`
      },
      {
        q: "Object.create, Object.assign, Object.freeze?",
        a_en: "Object.create(proto): new object with specified prototype. Object.assign(target, ...sources): shallow copy, mutates target. Object.freeze(obj): immutable, shallow freeze.",
        a_hi: "Object.create(proto): specified prototype wala naya object. Object.assign(target, ...sources): shallow copy, target mutate karta hai. Object.freeze(obj): immutable, shallow freeze.",
        code: `// create
const proto = { greet() { return "hi"; } };
const obj = Object.create(proto);
obj.greet(); // "hi"

// assign
const merged = Object.assign({}, { a: 1 }, { b: 2 });
// { a: 1, b: 2 }

// freeze
const config = Object.freeze({ apiUrl: "..." });
config.apiUrl = "new"; // fails silently (or throws in strict)
Object.isFrozen(config); // true

// Shallow — nested unaffected
const nested = Object.freeze({ inner: { x: 1 } });
nested.inner.x = 99; // ✓ works (inner not frozen)`
      },
      {
        q: "What are property descriptors?",
        a_en: "Every property has: value, writable, enumerable, configurable. Object.defineProperty to set. Class methods are non-enumerable by default.",
        a_hi: "Har property ke paas: value, writable, enumerable, configurable. Object.defineProperty se set. Class methods default non-enumerable.",
        code: `const obj = {};
Object.defineProperty(obj, 'name', {
  value: 'Raj',
  writable: false,
  enumerable: false,
  configurable: false
});

obj.name = 'Aman'; // silently fails
console.log(obj.name); // "Raj"

Object.getOwnPropertyDescriptor(obj, 'name');

// Class methods non-enumerable
class Foo {
  method() {}
}
for (const k in new Foo()) console.log(k); // nothing!
Object.getOwnPropertyNames(Foo.prototype);
// ['constructor', 'method']`
      },
      {
        q: "What are mixins in JS?",
        a_en: "Mixins add behavior without deep inheritance. Higher-order class: const M = Base => class extends Base {...}. Or Object.assign on prototype. Compose horizontally.",
        a_hi: "Mixins behavior add karte hain bina deep inheritance ke. Higher-order class: const M = Base => class extends Base {...}. Ya Object.assign on prototype. Horizontally compose karte hain.",
        code: `// Higher-order class mixin
const Serializable = (Base) => class extends Base {
  serialize() { return JSON.stringify(this); }
};

const Loggable = (Base) => class extends Base {
  log(msg) { console.log("[" + this.constructor.name + "] " + msg); }
};

class Entity {
  constructor(data) { Object.assign(this, data); }
}

class User extends Loggable(Serializable(Entity)) {
  greet() { this.log("hi @ " + this.name); }
}

// Simpler — Object.assign
const CanFly = { fly() { console.log(this.name + " flying"); } };
class Duck { constructor(name) { this.name = name; } }
Object.assign(Duck.prototype, CanFly);`
      },
      {
        q: "ES6 classes vs constructor functions?",
        a_en: "Both use prototypal inheritance. Class: strict body, TDZ, non-enumerable methods, super, static, private fields, must use new. But typeof is 'function', instanceof works same.",
        a_hi: "Dono prototypal inheritance use karte hain. Class: strict body, TDZ, non-enumerable methods, super, static, private fields, new lazmi. But typeof 'function' hai, instanceof same kaam karta hai.",
        code: `// ES5
function User(name) { this.name = name; }
User.prototype.greet = function() {
  return "Hi, " + this.name;
};

// ES6 — same thing
class UserES6 {
  constructor(name) { this.name = name; }
  greet() { return "Hi, " + this.name; }
  static create(name) { return new UserES6(name); }
}

// Differences
// Class MUST use new
// UserES6("Raj"); ✗ TypeError

// Class in TDZ
// new Foo(); ✗ ReferenceError
// class Foo {}

typeof User === "function";      // true
typeof UserES6 === "function";   // true`
      },
      {
        q: "What are private class fields?",
        a_en: "Private fields (#name) are truly private — inaccessible outside, not on prototype, invisible to Object.keys/JSON.stringify. SyntaxError at parse time if accessed externally.",
        a_hi: "Private fields (#name) truly private hote hain — baahar se inaccessible, prototype pe nahi, Object.keys/JSON.stringify mein nahi dikhte. Baahar se access ka SyntaxError parse time pe.",
        code: `class BankAccount {
  #balance = 0;
  #transactions = [];
  
  deposit(amount) {
    this.#balance += amount;
    this.#transactions.push({ type: 'in', amount });
    this.#log('deposit');
  }
  
  #log(action) { // private method
    console.log("[" + action + "] " + this.#balance);
  }
  
  get balance() { return this.#balance; }
}

const acc = new BankAccount();
acc.deposit(1000);
console.log(acc.balance); // 1000

// acc.#balance; ✗ SyntaxError
// Object.keys(acc); → []
// JSON.stringify(acc); → '{}'`
      },
    ],
  },

  {
    id: "js-es6", label: "ES6+ Features", icon: "✨", color: "#55EFC4", section: "JavaScript",
    def_en: "ES6 (2015) and later versions introduced destructuring, spread/rest, classes, modules, Promises, generators, Proxy, Symbol, Map/Set, optional chaining — the backbone of modern JS.",
    def_hi: "ES6 (2015) aur baad ke versions ne destructuring, spread/rest, classes, modules, Promises, generators, Proxy, Symbol, Map/Set, optional chaining introduce kiye — modern JS ki backbone hain.",
    questions: [
      {
        q: "Explain destructuring with examples.",
        a_en: "Array: const [a, b, ...rest] = [1,2,3,4]. Object: const { name, age = 25, address: { city } } = user. Rename: { name: firstName }. Function params too. Makes intent clear.",
        a_hi: "Array: const [a, b, ...rest] = [1,2,3,4]. Object: const { name, age = 25, address: { city } } = user. Rename: { name: firstName }. Function params mein bhi. Intent clear banati hai.",
        code: `// Array
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Swap
let a = 1, b = 2;
[a, b] = [b, a];

// Object
const user = {
  name: "Raj",
  age: 30,
  address: { city: "Mumbai" }
};
const { name, age = 18, address: { city } } = user;

// Rename
const { name: userName } = user;

// Function params
function render({ color = 'blue', size = 'md' } = {}) {
  return color + "-" + size;
}
render({ color: 'red' });`
      },
      {
        q: "Spread vs rest?",
        a_en: "Spread (...) expands iterable. Rest collects remaining into real Array. Same syntax, opposite semantic direction. Rest must be last parameter.",
        a_hi: "Spread (...) iterable expand karta hai. Rest remaining ko real Array mein collect karta hai. Same syntax, opposite direction. Rest last parameter honi chahiye.",
        code: `// SPREAD — expands
const arr = [1, 2, 3];
const copy = [...arr];
const extended = [...arr, 4, 5];
Math.max(...[3, 1, 4, 1, 5]); // 5

const user = { name: "Raj", age: 30 };
const updated = { ...user, age: 31 };

// REST — collects
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// Rest in destructuring
const [a, ...others] = [1, 2, 3, 4];

// React
function Button({ label, ...rest }) {
  return <button {...rest}>{label}</button>;
}`
      },
      {
        q: "Tagged template literals?",
        a_en: "tag\`text \${expr}\` calls tag(strings, ...values). Tag function processes or sanitizes. Used by styled-components, gql, sql (injection prevention), i18n.",
        a_hi: "tag\`text \${expr}\` tag(strings, ...values) ko call karta hai. Tag function output process karta hai. styled-components, gql, sql injection prevention, i18n mein use hota hai.",
        code: `function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const v = values[i] ? "<b>" + values[i] + "</b>" : '';
    return result + str + v;
  }, '');
}

const name = "Raj";
highlight\`Hello \${name}!\`;
// "Hello <b>Raj</b>!"

// SQL injection prevention
function sql(strings, ...values) {
  return strings.reduce((q, str, i) => {
    const safe = values[i] ? escape(values[i]) : '';
    return q + str + safe;
  }, '');
}

// styled-components
const Button = styled.button\`
  background: \${p => p.primary ? 'blue' : 'white'};
\`;`
      },
      {
        q: "Symbol and its use cases?",
        a_en: "Symbol() creates unique immutable primitive. Use for: unique object keys (no collisions), well-known symbols (Symbol.iterator, Symbol.toPrimitive), semi-private properties.",
        a_hi: "Symbol() unique immutable primitive banata hai. Use: unique object keys (no collisions), well-known symbols (Symbol.iterator, Symbol.toPrimitive), semi-private properties.",
        code: `// Uniqueness
const s1 = Symbol("id");
const s2 = Symbol("id");
s1 === s2; // false

// As key — no collisions
const ID = Symbol("userId");
const user = {
  name: "Raj",
  [ID]: 123
};

// Hidden from iteration
Object.keys(user); // ["name"]
JSON.stringify(user); // {"name":"Raj"}
Object.getOwnPropertySymbols(user); // [Symbol(userId)]

// Make iterable
class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  [Symbol.iterator]() {
    let i = this.from;
    const to = this.to;
    return {
      next: () => i <= to
        ? { value: i++, done: false }
        : { done: true }
    };
  }
}

for (const n of new Range(1, 3)) console.log(n); // 1,2,3`
      },
      {
        q: "Map vs plain Object?",
        a_en: "Map: any value as key, insertion order preserved, .size, iterable. Object: only string/symbol keys, prototype chain pollution. Use Map for dynamic stores, Object for known-shape records.",
        a_hi: "Map: any value as key, insertion order preserve, .size, iterable. Object: sirf string/symbol keys, prototype chain pollution. Map dynamic stores ke liye, Object known-shape records ke liye.",
        code: `// Object — string keys
const obj = {};
obj[1] = "a"; // key is "1"
obj["1"] = "b"; // overwrites!

// Map — any key
const map = new Map();
const keyObj = {};
map.set(1, "num");
map.set("1", "str"); // different!
map.set(keyObj, "obj key");

console.log(map.size); // 3
for (const [k, v] of map) console.log(k, v);

// Use Map for
const scores = new Map();
scores.set(userObj, 100);

// Use Object for
const config = { apiUrl: "...", timeout: 5000 };`
      },
      {
        q: "Set and when useful?",
        a_en: "Set: unique values only. O(1) .has(). Classic use: deduplication — [...new Set(arr)]. WeakSet holds objects weakly, no iteration.",
        a_hi: "Set: unique values only. O(1) .has(). Classic use: deduplication — [...new Set(arr)]. WeakSet objects weakly hold karta hai, iteration nahi.",
        code: `// Deduplication
const arr = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(arr)]; // [1,2,3,4]

const set = new Set();
set.add("a");
set.add("b");
set.add("a"); // ignored
set.size; // 2
set.has("a"); // O(1)

// Intersection
function intersect(a, b) {
  return new Set([...a].filter(x => b.has(x)));
}

// WeakSet — doesn't prevent GC
const visited = new WeakSet();
visited.add(domNode);
visited.has(domNode);`
      },
      {
        q: "Optional chaining (?.) and nullish coalescing (??)?",
        a_en: "?. returns undefined instead of throwing. ?? returns fallback only for null/undefined (not 0, '', false). Unlike || which treats all falsy as trigger.",
        a_hi: "?. undefined return karti hai throw ke bajay. ?? sirf null/undefined pe fallback (0, '', false nahi). || sab falsy ko trigger karta hai.",
        code: `const user = { name: "Raj" };

// Old verbose
const city = user && user.address && user.address.city;

// Optional chaining
const city2 = user?.address?.city; // undefined

user.greet?.(); // safe call
user?.logs?.[0]; // safe index

// || vs ??
let count = 0;
count || 10; // 10 (0 is falsy)
count ?? 10; // 0  ✓

let name = "";
name || "Anon"; // "Anon"
name ?? "Anon"; // "" ✓ preserved

// Combined
const theme = settings?.theme ?? "light";`
      },
      {
        q: "Iterators and iterable protocol?",
        a_en: "Iterable implements [Symbol.iterator]() returning iterator. Iterator has next() returning {value, done}. Powers for-of, spread, destructuring, Array.from.",
        a_hi: "Iterable [Symbol.iterator]() implement karta hai jo iterator return karta hai. Iterator ka next() {value, done} return karta hai. for-of, spread, destructuring, Array.from isi pe.",
        code: `class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  [Symbol.iterator]() {
    let i = this.from;
    const last = this.to;
    return {
      next() {
        return i <= last
          ? { value: i++, done: false }
          : { done: true };
      }
    };
  }
}

const r = new Range(1, 3);
for (const n of r) console.log(n); // 1,2,3
[...r]; // [1,2,3]
Array.from(r); // [1,2,3]

// Generator shortcut
class RangeGen {
  constructor(from, to) { this.from = from; this.to = to; }
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  }
}`
      },
      {
        q: "Proxy and Reflect?",
        a_en: "Proxy wraps object, intercepts via traps (get, set, has, etc.). Reflect mirrors traps — use inside handlers to forward. Used for: validation, reactive systems, logging.",
        a_hi: "Proxy object wrap karta hai, traps (get, set, has) se operations intercept. Reflect traps ko mirror karta hai — handlers mein forward ke liye. Validation, reactive, logging.",
        code: `const user = { name: "", age: 0 };

const validated = new Proxy(user, {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be number");
    }
    target[prop] = value;
    return true;
  }
});

validated.age = 30; // ✓
// validated.age = "old"; TypeError

// Reactive (Vue-style)
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      track(target, prop);
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value);
      trigger(target, prop);
      return result;
    }
  });
}`
      },
      {
        q: "WeakRef and FinalizationRegistry?",
        a_en: "WeakRef: weak object reference, GC can collect. obj.deref() returns object or undefined. FinalizationRegistry runs callback after GC. Niche APIs for resource management.",
        a_hi: "WeakRef: object ka weak reference, GC collect kar sakta hai. obj.deref() object ya undefined. FinalizationRegistry GC ke baad callback run karta hai. Niche APIs resource management ke liye.",
        code: `let heavy = { data: new Array(1e6) };
const weak = new WeakRef(heavy);

console.log(weak.deref()); // still alive

heavy = null; // remove strong ref
// Eventually after GC:
// weak.deref() → undefined

// Cache that doesn't leak
class WeakCache {
  #cache = new Map();
  set(key, value) {
    this.#cache.set(key, new WeakRef(value));
  }
  get(key) {
    const ref = this.#cache.get(key);
    return ref?.deref() ?? null;
  }
}

// FinalizationRegistry
const reg = new FinalizationRegistry(heldValue => {
  console.log("Cleaned: " + heldValue);
});
class File {
  constructor(name) {
    this.name = name;
    reg.register(this, name, this);
  }
}`
      },
    ],
  },

  {
    id: "js-functions", label: "Functions", icon: "λ", color: "#FD79A8", section: "JavaScript",
    def_en: "Functions are first-class citizens in JS — they can be stored in variables, passed as arguments, and returned from other functions. This enables functional patterns: higher-order functions, currying, composition, memoization.",
    def_hi: "Functions first-class citizens hain JS mein — variables mein store, arguments ke roop mein pass, aur return ho sakte hain. Functional patterns enable karte hain: higher-order functions, currying, composition, memoization.",
    questions: [
      {
        q: "What is a higher-order function?",
        a_en: "A function that takes a function as argument or returns a function. Built-in: map, filter, reduce. HOFs abstract over behavior — write the shape once, inject the logic. Foundation of functional programming and React.",
        a_hi: "Ek function jo function ko argument le ya function return kare. Built-in: map, filter, reduce. HOFs behavior pe abstraction dete hain — shape ek baar likho, logic inject karo. Functional programming aur React ki foundation.",
        code: `const numbers = [1, 2, 3, 4, 5];

// Built-in HOFs
const doubled = numbers.map(n => n * 2);     // [2,4,6,8,10]
const even = numbers.filter(n => n % 2 === 0); // [2,4]
const sum = numbers.reduce((a, b) => a + b, 0); // 15

// Function returning function
function createMultiplier(factor) {
  return function(num) {
    return num * factor;
  };
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
double(5); // 10

// React HOC
function withLoading(Component) {
  return function(props) {
    if (props.loading) return <Spinner />;
    return <Component {...props} />;
  };
}`
      },
      {
        q: "Currying and partial application?",
        a_en: "Currying transforms f(a,b,c) into f(a)(b)(c). Partial application pre-fills some arguments. Enables reusable specialized functions and point-free style.",
        a_hi: "Currying f(a,b,c) ko f(a)(b)(c) mein transform karti hai. Partial application kuch arguments pre-fill karti hai. Reusable specialized functions aur point-free style enable karti hai.",
        code: `// Regular
function add(a, b, c) { return a + b + c; }
add(1, 2, 3); // 6

// Curried
const addC = a => b => c => a + b + c;
addC(1)(2)(3); // 6

// Reusable
const add10 = addC(10);
add10(5)(3); // 18

// Generic curry
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Partial with bind
function greet(greeting, name) {
  return greeting + ", " + name + "!";
}
const sayHi = greet.bind(null, "Hi");
sayHi("Raj"); // "Hi, Raj!"

// Logger factory
const logLevel = level => message => {
  console.log("[" + level + "] " + message);
};
const error = logLevel("ERROR");
const info = logLevel("INFO");`
      },
      {
        q: "What is function composition?",
        a_en: "Composition chains functions: compose(f, g)(x) = f(g(x)). pipe is left-to-right. Enables declarative pipelines without intermediate variables.",
        a_hi: "Composition functions ko chain karta hai: compose(f, g)(x) = f(g(x)). pipe left-to-right. Declarative pipelines banata hai bina intermediate variables ke.",
        code: `const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

// f(g(h(x)))
square(double(addOne(3))); // 64

// compose — right to left
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const computed = compose(square, double, addOne);
computed(3); // 64

// pipe — left to right (more readable)
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const process = pipe(addOne, double, square);
process(3); // 64

// Data transformation
const users = [{ name: "raj", age: 30 }];
const transform = pipe(
  arr => arr.map(u => ({ ...u, name: u.name.toUpperCase() })),
  arr => arr.filter(u => u.age >= 18),
  arr => arr.map(u => u.name)
);
transform(users); // ["RAJ"]`
      },
      {
        q: "How to implement memoization?",
        a_en: "Cache results by arguments. Only works for pure functions. React's useMemo is memoization at the render level.",
        a_hi: "Results ko arguments ke hisaab se cache karo. Sirf pure functions ke liye. React ka useMemo render level pe memoization hai.",
        code: `function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  console.log("computing...");
  return n * n;
};

const fastSquare = memoize(slowSquare);
fastSquare(5); // "computing..." → 25
fastSquare(5); // (cached) → 25
fastSquare(6); // "computing..." → 36

// Fibonacci
const fib = memoize(function(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
});
fib(40); // fast!

// React
function Component({ items, filter }) {
  const filtered = useMemo(() => {
    return items.filter(i => i.name.includes(filter));
  }, [items, filter]);
  return <List items={filtered} />;
}`
      },
      {
        q: "Pure functions vs side effects?",
        a_en: "Pure: same inputs → same output, no side effects. Side effects: mutation, I/O, random, date. Pure functions are predictable, testable, memoizable. React components should be pure.",
        a_hi: "Pure: same inputs → same output, no side effects. Side effects: mutation, I/O, random, date. Pure functions predictable, testable, memoizable hain. React components pure honi chahiye.",
        code: `// PURE
function add(a, b) { return a + b; }
function double(arr) { return arr.map(x => x * 2); }

// IMPURE — mutation
function addItem(arr, item) {
  arr.push(item); // mutates!
  return arr;
}

// Pure version
function addItemPure(arr, item) {
  return [...arr, item];
}

// IMPURE — external state
let counter = 0;
function increment() {
  counter++; // side effect
  return counter;
}

// IMPURE — non-deterministic
function timestamp() {
  return Date.now(); // different every call
}

// React — pure component
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

// Side effects go in useEffect
function Good() {
  useEffect(() => {
    document.title = "Hello"; // side effect OK here
  }, []);
  return <div>Hello</div>;
}`
      },
      {
        q: "arguments object vs rest parameters?",
        a_en: "arguments is array-like (not real Array), in regular functions only. Rest params (...args) are real Arrays, explicit, work in arrow functions. Always prefer rest params.",
        a_hi: "arguments array-like hai (real Array nahi), sirf regular functions mein. Rest params (...args) real Arrays hain, explicit, arrow functions mein kaam karte hain. Hamesha rest params prefer karo.",
        code: `// arguments (old)
function oldSum() {
  // arguments.map() ✗
  const args = [...arguments]; // convert
  return args.reduce((a, b) => a + b, 0);
}

// Rest params (modern)
function newSum(...nums) {
  return nums.reduce((a, b) => a + b, 0); // works!
}

// Mixed params
function greet(greeting, ...names) {
  console.log(greeting);
  console.log(names); // ["Raj", "Aman"]
}

// arguments NOT in arrow
const arrowFn = () => {
  // console.log(arguments); ReferenceError
};

const arrowRest = (...args) => {
  console.log(args); // ✓
};

// Best practice
function log(...args) {
  console.log(new Date(), ...args);
}`
      },
      {
        q: "What is a closure factory?",
        a_en: "Factory returning specialized closures. React: handleField = field => value => setForm(f => ({...f, [field]: value})) creates per-field handlers.",
        a_hi: "Factory specialized closures return karti hai. React: handleField = field => value => setForm(f => ({...f, [field]: value})) per-field handlers banati hai.",
        code: `// Simple factory
const makeMultiplier = (n) => (x) => x * n;
const double = makeMultiplier(2);
const triple = makeMultiplier(3);

// Configured validators
const minLength = (min) => (value) => value.length >= min;
const pattern = (regex) => (value) => regex.test(value);

const username = pattern(/^[a-z0-9_]+$/);
username("raj_30"); // true

// React handler factory
function Form() {
  const [form, setForm] = useState({ name: "", email: "" });
  
  const handleField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };
  
  return (
    <>
      <input onChange={handleField('name')} />
      <input onChange={handleField('email')} />
    </>
  );
}

// Event bus
function createBus() {
  const listeners = new Map();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    emit(event, data) {
      listeners.get(event)?.forEach(fn => fn(data));
    }
  };
}`
      },
    ],
  },

  {
    id: "js-memory", label: "Memory & Perf", icon: "💾", color: "#BADC58", section: "JavaScript",
    def_en: "JS uses automatic garbage collection (mark-and-sweep). Objects are collected when no references reach them. Understanding memory, event loop, and CPU-heavy work is key to fast apps.",
    def_hi: "JS automatic garbage collection use karta hai (mark-and-sweep). Objects collect hote hain jab reference nahi bacha. Memory, event loop, aur CPU-heavy kaam samajhna fast apps ke liye zaroori hai.",
    questions: [
      {
        q: "How does garbage collection work?",
        a_en: "Mark-and-sweep: from roots (global, stack), mark reachable objects, sweep unreachable. Modern engines use generational GC, incremental/concurrent marking. Can't force GC, but help by releasing refs.",
        a_hi: "Mark-and-sweep: roots se (global, stack) reachable objects mark, unreachable sweep. Modern engines generational GC, incremental marking use karte hain. GC force nahi kar sakte, but references release karke help kar sakte ho.",
        code: `// Object becomes unreachable → GC collects
let user = { name: "Raj" };
user = null; // reference removed

// Closures keep outer alive
function outer() {
  const big = new Array(1e6);
  return () => console.log(big.length);
}
const fn = outer(); // 'big' still in memory
// fn = null; // now GC can collect

// Circular references handled correctly
let a = {}; let b = {};
a.ref = b;
b.ref = a;
a = null; b = null; // both collected`
      },
      {
        q: "Common memory leaks in JS?",
        a_en: "1) Global variables (undeclared vars). 2) Timers holding closures. 3) Unremoved event listeners. 4) Detached DOM nodes in JS. 5) Growing caches. Chrome DevTools Memory panel reveals leaks.",
        a_hi: "1) Global variables (undeclared vars). 2) Timers closures hold karte hain. 3) Event listeners remove nahi hue. 4) Detached DOM nodes JS mein. 5) Growing caches. Chrome DevTools Memory panel reveal karta hai.",
        code: `// 1. Global leak
function bad() {
  leaked = "oops"; // no var/let/const → global!
}

// 2. Timer leak
function timerLeak() {
  const huge = new Array(1e6);
  setInterval(() => console.log(huge.length), 1000);
  // huge never freed
}

// Fix
function timerClean() {
  const huge = new Array(1e6);
  const id = setInterval(() => {}, 1000);
  return () => clearInterval(id);
}

// 3. Event listener leak
button.addEventListener("click", handler);
button.remove(); // but listener still registered!

// Fix
button.removeEventListener("click", handler);
button.remove();

// 4. React cleanup
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`
      },
      {
        q: "Debouncing vs throttling?",
        a_en: "Debounce: delays execution until calls pause. Fires once after last call. Use for: search autocomplete, resize finish. Throttle: limits to once per N ms. Use for: scroll, API rate limits.",
        a_hi: "Debounce: calls ruk jaayein tak delay karti hai. Last call ke baad ek baar fire. Use: search autocomplete, resize finish. Throttle: N ms mein ek baar. Use: scroll, API rate limits.",
        code: `// Debounce
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce((query) => {
  fetch('/api/search?q=' + query);
}, 300);

// Throttle
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const handleScroll = throttle(() => {
  console.log("scroll position:", window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);`
      },
      {
        q: "Sync vs async performance?",
        a_en: "Sync blocks call stack — long tasks freeze UI. Async offloaded to browser APIs, returned via event loop. For CPU work in browser, use Web Workers. requestIdleCallback for non-urgent tasks.",
        a_hi: "Sync call stack block karta hai — long tasks UI freeze karte hain. Async browser APIs ko offload hota hai, event loop se return. CPU work browser mein ke liye Web Workers. Non-urgent tasks requestIdleCallback.",
        code: `// Sync — freezes UI
function sync() {
  for (let i = 0; i < 1e9; i++) {} // freezes
}

// Break into chunks
function asyncChunked(done) {
  let i = 0;
  function chunk() {
    const end = Math.min(i + 10000, 1e9);
    for (; i < end; i++) {}
    if (i < 1e9) {
      setTimeout(chunk, 0); // let event loop breathe
    } else {
      done();
    }
  }
  chunk();
}

// requestIdleCallback
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    processTask(tasks.shift());
  }
}, { timeout: 2000 });`
      },
      {
        q: "What are Web Workers?",
        a_en: "JS on separate OS thread. No DOM access. postMessage/onmessage for communication. Use for CPU-intensive work (crypto, image processing). Comlink library simplifies with Proxy.",
        a_hi: "Separate OS thread pe JS. No DOM access. postMessage/onmessage se communication. CPU-intensive kaam (crypto, image processing) ke liye. Comlink library Proxy se simplify karti hai.",
        code: `// main.js
const worker = new Worker('worker.js');

worker.postMessage({ numbers: [1, 2, 3] });

worker.onmessage = (e) => {
  console.log("Result:", e.data);
};

// worker.js
self.onmessage = (e) => {
  const { numbers } = e.data;
  const sum = numbers.reduce((a, b) => a + b, 0);
  self.postMessage(sum);
};

// Terminate
worker.terminate();

// Comlink style (simpler)
// const api = Comlink.wrap(new Worker('worker.js'));
// await api.heavyCalc(data);`
      },
      {
        q: "How to measure JavaScript performance?",
        a_en: "performance.now() for high-res timestamps. performance.mark/measure for named intervals. Chrome DevTools Performance tab for profiling. Lighthouse for overall. vitest bench for algorithmic.",
        a_hi: "performance.now() high-res timestamps ke liye. performance.mark/measure named intervals ke liye. Chrome DevTools Performance tab profiling. Lighthouse overall. vitest bench algorithmic.",
        code: `// Quick timing
console.time("operation");
doWork();
console.timeEnd("operation"); // "operation: 12.3ms"

// High precision
const start = performance.now();
doWork();
const elapsed = performance.now() - start;

// Named intervals
performance.mark("start");
doWork();
performance.mark("end");
performance.measure("duration", "start", "end");

const measures = performance.getEntriesByType("measure");
console.log(measures[0].duration);

// Web Vitals
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });`
      },
    ],
  },

  {
    id: "js-error", label: "Error Handling", icon: "🚨", color: "#FF6B6B", section: "JavaScript",
    def_en: "Robust error handling prevents crashes and improves debuggability. JS provides try/catch/finally, Error types, Promise rejection handling, and global error events.",
    def_hi: "Robust error handling crashes rokti hai aur debugging improve karti hai. JS try/catch/finally, Error types, Promise rejection handling, aur global error events deti hai.",
    questions: [
      {
        q: "How does try/catch/finally work?",
        a_en: "try runs code that may throw. catch(e) handles thrown value. finally always runs, even with return. finally return overrides try/catch. Doesn't catch async errors unless inside async function.",
        a_hi: "try try karta hai code jo throw kar sakta hai. catch(e) handle karta hai. finally hamesha run hota hai, return ke saath bhi. finally return try/catch ko override karta hai. Async errors ke liye async function ke andar.",
        code: `try {
  riskyOp();
} catch (err) {
  console.error(err.message);
  console.error(err.stack);
} finally {
  cleanup(); // always runs
}

// Rethrow selectively
try {
  parseJSON(input);
} catch (err) {
  if (err instanceof SyntaxError) {
    return null;
  }
  throw err; // rethrow others
}

// Async errors
async function load() {
  try {
    const data = await fetch('/api');
    return await data.json();
  } catch (err) {
    console.error(err);
  }
}

// finally gotcha
function getValue() {
  try {
    return "try";
  } finally {
    return "finally"; // overrides!
  }
}
getValue(); // "finally"`
      },
      {
        q: "Built-in Error types?",
        a_en: "Error (base), TypeError (wrong type), ReferenceError (undeclared), SyntaxError (invalid syntax), RangeError (out of range), URIError. Custom: extend Error with name, Object.setPrototypeOf for TS.",
        a_hi: "Error (base), TypeError (wrong type), ReferenceError (undeclared), SyntaxError (invalid syntax), RangeError (out of range), URIError. Custom: Error extend karo name ke saath, TS ke liye Object.setPrototypeOf.",
        code: `// Built-in types
null.foo;          // TypeError
undefinedVar;      // ReferenceError
new Array(-1);     // RangeError
decodeURI("%");    // URIError

// Custom error class
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Usage
try {
  throw new ApiError("Not found", 404);
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.status); // 404
  }
}

// Type-check errors
if (err instanceof TypeError) { /* ... */ }
if (err instanceof ApiError) { /* ... */ }`
      },
      {
        q: "Unhandled Promise rejections?",
        a_en: "Crash Node.js, warn in browser. Global handlers: window.unhandledrejection or process.on('unhandledRejection'). Best: always .catch() or try/catch on await.",
        a_hi: "Node.js crash karte hain, browser mein warn karte hain. Global handlers: window.unhandledrejection ya process.on('unhandledRejection'). Best: hamesha .catch() ya await pe try/catch.",
        code: `// Browser
window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
  console.error('Unhandled:', e.reason);
  logToServer(e.reason);
});

// Node.js
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled:', reason);
});

// Explicit fire-and-forget
void fireAndForgetTask();

// Safer pattern
async function main() {
  try {
    await riskyOp();
  } catch (err) {
    handle(err);
  }
}
main().catch(fatal); // last-resort catch`
      },
      {
        q: "Error boundaries vs try/catch in React?",
        a_en: "try/catch works for sync code and inside async functions — can't catch React render errors. Error boundaries (class components with componentDidCatch) catch rendering errors. Use both.",
        a_hi: "try/catch sync code aur async functions ke andar kaam karta hai — React render errors nahi catch karta. Error boundaries (class components with componentDidCatch) render errors catch karte hain. Dono use karo.",
        code: `// Error boundary class
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    logErrorToService(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <UnsafeComponent />
</ErrorBoundary>

// try/catch for events/async
function Form() {
  async function handleSubmit() {
    try {
      await submit(data);
    } catch (err) {
      setError(err.message);
    }
  }
  return <button onClick={handleSubmit}>Submit</button>;
}`
      },
      {
        q: "How to create custom error classes?",
        a_en: "extend Error, set name, call super(message). Object.setPrototypeOf fixes instanceof when transpiled. Custom errors enable structured handling and better debugging.",
        a_hi: "Error extend karo, name set karo, super(message) call karo. Object.setPrototypeOf transpile hone pe instanceof fix karta hai. Custom errors structured handling aur better debugging enable karte hain.",
        code: `class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(resource + ' ' + id + ' not found');
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

// Usage
function getUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) throw new NotFoundError('User', id);
  return user;
}

try {
  getUser(999);
} catch (err) {
  if (err instanceof NotFoundError) {
    return { status: 404, message: err.message };
  }
  if (err instanceof ValidationError) {
    return { status: 400, field: err.field };
  }
  throw err;
}`
      },
    ],
  },

  {
    id: "js-dom", label: "DOM & Browser", icon: "🌐", color: "#74B9FF", section: "JavaScript",
    def_en: "The DOM is a tree representation of HTML that JS can query and manipulate. Browser APIs enable rich apps: fetch, storage, History API, IntersectionObserver, Web APIs.",
    def_hi: "DOM HTML ka tree representation hai jise JS query aur manipulate kar sakti hai. Browser APIs rich apps enable karti hain: fetch, storage, History API, IntersectionObserver, Web APIs.",
    questions: [
      {
        q: "What is event bubbling and capturing?",
        a_en: "Events propagate in two phases: capture (top→target) then bubble (target→top). addEventListener with useCapture=true for capture. stopPropagation halts it. Bubbling enables event delegation.",
        a_hi: "Events do phases mein propagate karte hain: capture (top→target) phir bubble (target→top). addEventListener with useCapture=true capture ke liye. stopPropagation rokta hai. Bubbling event delegation enable karta hai.",
        code: `document.addEventListener('click', (e) => {
  console.log('1. Capture phase');
}, true); // useCapture=true

document.addEventListener('click', (e) => {
  console.log('3. Bubble phase');
}, false);

button.addEventListener('click', (e) => {
  console.log('2. Target');
  // e.stopPropagation(); // stops bubble
});

// Order when button clicked:
// 1. Capture (document)
// 2. Target (button)
// 3. Bubble (document)

// Prevent default behavior
form.addEventListener('submit', (e) => {
  e.preventDefault(); // don't reload page
  submitData();
});`
      },
      {
        q: "What is event delegation and why useful?",
        a_en: "Attach one listener to parent instead of N to children. Uses bubbling. Benefits: fewer listeners, works for dynamic children, cleaner code. React uses delegation internally.",
        a_hi: "Parent pe ek listener, children pe N ki bajay. Bubbling use karta hai. Benefits: kam listeners, dynamic children ke liye kaam karta hai, cleaner code. React internally isi use karta hai.",
        code: `// Instead of N listeners
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// One delegated listener
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e);
  }
  if (e.target.matches('.delete')) {
    handleDelete(e);
  }
});

// Works for dynamically added items too!
list.appendChild(newItem); // handler still works

// React — single listener at root
function App() {
  return (
    <ul onClick={(e) => {
      if (e.target.tagName === 'LI') {
        console.log('Item clicked:', e.target.textContent);
      }
    }}>
      {items.map(i => <li key={i}>{i}</li>)}
    </ul>
  );
}`
      },
      {
        q: "innerHTML vs textContent vs innerText?",
        a_en: "innerHTML: parses HTML — XSS risk. textContent: raw text, no parsing, no XSS, cheap. innerText: layout-aware, triggers reflow when read. Prefer textContent for security and performance.",
        a_hi: "innerHTML: HTML parse karta hai — XSS risk. textContent: raw text, no parsing, no XSS, cheap. innerText: layout-aware, read pe reflow trigger karta hai. Security aur performance ke liye textContent prefer karo.",
        code: `const div = document.createElement('div');
div.innerHTML = '<b>Hello</b>';
// Creates <b> element

// XSS risk
const userInput = '<script>steal()</script>';
div.innerHTML = userInput; // ✗ dangerous!

// Safe
div.textContent = userInput; // raw text, no parsing

// textContent — fast
const text = div.textContent; // cheap read

// innerText — triggers reflow
const visibleText = div.innerText; // expensive, layout-aware
// Respects CSS display:none

// Safe HTML rendering
// load DOMPurify @ 'dompurify'
div.innerHTML = DOMPurify.sanitize(userInput);`
      },
      {
        q: "What is Intersection Observer?",
        a_en: "Detects when elements enter/exit viewport efficiently — no scroll listeners. Callback receives entries with intersectionRatio and isIntersecting. Use for lazy loading, infinite scroll, animations.",
        a_hi: "Elements viewport mein enter/exit hone ka efficiently detect karta hai — no scroll listeners. Callback entries deta hai intersectionRatio aur isIntersecting ke saath. Lazy loading, infinite scroll, animations ke liye.",
        code: `const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src; // lazy load
      observer.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '100px', // pre-load
  threshold: 0.1 // 10% visible
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});

// React hook
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting)
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}`
      },
      {
        q: "localStorage vs sessionStorage vs cookies?",
        a_en: "localStorage: persists, 5-10MB, JS-only (XSS risk). sessionStorage: tab-only. Cookies: sent with every HTTP request, httpOnly blocks JS, small (4KB). Use httpOnly cookies for auth.",
        a_hi: "localStorage: persists, 5-10MB, JS-only (XSS risk). sessionStorage: tab-only. Cookies: har HTTP request ke saath, httpOnly JS block karta hai, small (4KB). Auth ke liye httpOnly cookies.",
        code: `// localStorage — persists
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme'); // "dark"
localStorage.removeItem('theme');
localStorage.clear();

// Store objects (serialize)
const user = { name: "Raj", age: 30 };
localStorage.setItem('user', JSON.stringify(user));
const stored = JSON.parse(localStorage.getItem('user'));

// sessionStorage — tab only
sessionStorage.setItem('draft', 'text');
// Cleared when tab closes

// Cookies (via document.cookie)
document.cookie = 'lang=en; path=/; max-age=3600';

// httpOnly cookies (server-side only)
// Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict
// JS can't read these — safe from XSS`
      },
      {
        q: "What is the History API?",
        a_en: "history.pushState/replaceState changes URL without reload. popstate fires on back/forward. SPAs use this for client routing. React Router wraps this API.",
        a_hi: "history.pushState/replaceState URL change karti hai bina reload ke. popstate back/forward pe fire hota hai. SPAs client routing ke liye use karte hain. React Router isi ko wrap karta hai.",
        code: `// Change URL without reload
history.pushState({ page: 1 }, '', '/page1');

// Replace current entry
history.replaceState({ page: 1 }, '', '/page1');

// Listen to navigation
window.addEventListener('popstate', (e) => {
  console.log('Back/forward:', e.state);
  renderPage(location.pathname);
});

// Programmatic navigation
history.back();    // browser back
history.forward(); // browser forward
history.go(-2);    // 2 steps back

// SPA router skeleton
function navigate(path) {
  history.pushState({ path }, '', path);
  renderPage(path);
}

// Current URL parts
location.pathname  // "/page1"
location.search    // "?q=hello"
location.hash      // "#section"`
      },
      {
        q: "How does fetch work?",
        a_en: "Returns Promise of Response. Only rejects on network failure — 4xx/5xx still resolve! Always check response.ok. Use AbortController for cancellation.",
        a_hi: "Response ka Promise return karta hai. Sirf network failure pe reject karta hai — 4xx/5xx still resolve hote hain! Hamesha response.ok check karo. Cancellation ke liye AbortController.",
        code: `async function getUser(id) {
  const res = await fetch('/api/user/' + id);
  if (!res.ok) {
    throw new Error('HTTP ' + res.status);
  }
  return res.json();
}

// POST with body
await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Raj' })
});

// Cancellation
const controller = new AbortController();

async function fetchWithTimeout(url, ms = 5000) {
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Timeout');
    }
    throw err;
  }
}

// React cleanup
useEffect(() => {
  const ctrl = new AbortController();
  fetch('/api', { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => {
      if (e.name !== 'AbortError') setError(e);
    });
  return () => ctrl.abort();
}, []);`
      },
    ],
  },

  {
    id: "js-patterns", label: "JS Patterns", icon: "🧩", color: "#E17055", section: "JavaScript",
    def_en: "Design patterns are proven solutions to recurring problems. JS patterns leverage closures, prototypes, and first-class functions for flexible, maintainable architecture.",
    def_hi: "Design patterns recurring problems ke proven solutions hain. JS patterns closures, prototypes, first-class functions use karte hain flexible, maintainable architecture ke liye.",
    questions: [
      {
        q: "What is the Module pattern?",
        a_en: "IIFE creates private scope and returns public API. Variables inside are private. Standard encapsulation before ES modules. Now replaced by ESM but concept remains.",
        a_hi: "IIFE private scope banata hai aur public API return karta hai. Andar ke variables private hote hain. ES modules ke pehle standard encapsulation tha. Ab ESM ne replace kar diya but concept rahega.",
        code: `// Module pattern
const calculator = (function() {
  let result = 0; // private
  
  return {
    add(n) { result += n; return this; },
    sub(n) { result -= n; return this; },
    get() { return result; }
  };
})();

calculator.add(5).sub(2).get(); // 3
// calculator.result → undefined (private)

// Modern equivalent — ES module
// file: calculator.js
let result = 0;
export const add = n => { result += n; };
export const sub = n => { result -= n; };
export const get = () => result;`
      },
      {
        q: "What is Observer/PubSub pattern?",
        a_en: "Subject notifies observers. PubSub decouples via broker — subscribers listen to topics, publishers emit without knowing subscribers. Used in EventEmitter, Redux, custom event buses.",
        a_hi: "Subject observers ko notify karta hai. PubSub broker se decouple karta hai — subscribers topics sunte hain, publishers emit karte hain subscribers jaane bina. EventEmitter, Redux, custom buses mein use hota hai.",
        code: `class EventBus {
  constructor() { this.listeners = new Map(); }
  
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }
  
  emit(event, data) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

const bus = new EventBus();
const unsub = bus.on('user:login', user => console.log(user));
bus.emit('user:login', { name: 'Raj' });
unsub();

// Node.js built-in
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('data', d => console.log(d));
emitter.emit('data', 'hello');`
      },
      {
        q: "Singleton pattern and its downsides?",
        a_en: "Ensures one instance. Module-level exports are singletons by default. Downsides: shared mutable state (hard to test), implicit global dependencies. Use sparingly.",
        a_hi: "Ek instance ensure karta hai. Module-level exports default singletons hote hain. Downsides: shared mutable state (testing tough), implicit global dependencies. Sparingly use karo.",
        code: `// Simplest — module export
// config.js
const config = {
  apiUrl: process.env.API_URL,
  timeout: 5000
};
export default config;

// Class singleton
class Database {
  static instance = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
  
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = connect();
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
db1 === db2; // true

// Downside — testing
// Hard to substitute mock in tests
// Prefer dependency injection`
      },
      {
        q: "What is Factory pattern?",
        a_en: "Function creates and returns objects without exposing constructor. Enables conditional creation, hides complexity, easy to substitute in tests. Removes tight coupling to concrete classes.",
        a_hi: "Function objects banata aur return karta hai bina constructor expose kiye. Conditional creation, complexity hide karta hai, tests mein substitute karna easy. Concrete classes se tight coupling hataata hai.",
        code: `// Simple factory
function createUser(type, data) {
  switch(type) {
    case 'admin':  return new Admin(data);
    case 'guest':  return new Guest(data);
    default:       return new User(data);
  }
}

const admin = createUser('admin', { name: 'Raj' });

// Factory with defaults
function createButton(config = {}) {
  return {
    color: config.color ?? 'blue',
    size: config.size ?? 'md',
    disabled: config.disabled ?? false,
    onClick: config.onClick ?? (() => {})
  };
}

// Abstract factory
const DatabaseFactory = {
  create(type) {
    if (type === 'postgres') return new PostgresDB();
    if (type === 'mysql')    return new MySqlDB();
    throw new Error('Unknown DB');
  }
};`
      },
      {
        q: "What is Strategy pattern?",
        a_en: "Encapsulates interchangeable algorithms behind a common interface. Context delegates to strategy. In functional JS, pass strategy as argument. Avoids if/else chains.",
        a_hi: "Interchangeable algorithms ko common interface ke peeche encapsulate karta hai. Context strategy ko delegate karta hai. Functional JS mein strategy argument ke roop mein pass. if/else chains avoid karta hai.",
        code: `// Sorting strategies
const strategies = {
  byName: (a, b) => a.name.localeCompare(b.name),
  byAge:  (a, b) => a.age - b.age,
  byScore:(a, b) => b.score - a.score
};

function sortUsers(users, strategy) {
  return [...users].sort(strategies[strategy]);
}

sortUsers(users, 'byName');
sortUsers(users, 'byScore');

// Payment strategies
class PaymentContext {
  constructor(strategy) { this.strategy = strategy; }
  pay(amount) { return this.strategy.pay(amount); }
}

const upi = { pay: amt => processUPI(amt) };
const card = { pay: amt => processCard(amt) };

const payment = new PaymentContext(upi);
payment.pay(1000);

// Functional
function process(data, pipeline) {
  return pipeline.reduce((acc, fn) => fn(acc), data);
}
process(data, [validate, normalize, save]);`
      },
    ],
  },

  {
    id: "js-modules", label: "Modules & Build", icon: "📦", color: "#6C5CE7", section: "JavaScript",
    def_en: "ES Modules standardize code organization. Modern tooling (Vite, webpack, esbuild, Rollup) bundles and optimizes module graphs. Understanding module systems is essential for production engineering.",
    def_hi: "ES Modules code organization ko standardize karti hain. Modern tooling (Vite, webpack, esbuild, Rollup) module graphs bundle aur optimize karti hain. Production engineering ke liye module systems samajhna zaroori hai.",
    questions: [
      {
        q: "CommonJS vs ES Modules?",
        a_en: "CJS: require() synchronous, runtime. ESM: import/export static (parse-time), async, live bindings, tree-shakeable. Node supports both. ESM can import CJS; CJS cannot require() ESM.",
        a_hi: "CJS: require() synchronous, runtime. ESM: import/export static (parse-time), async, live bindings, tree-shakeable. Node dono support karta hai. ESM CJS import kar sakta hai; CJS ESM require nahi kar sakta.",
        code: `// CommonJS (old Node.js)
const fs = require('fs');
const { readFile } = require('fs/promises');
module.exports = { myFunc };
module.exports.helper = () => {};

// ES Modules (modern)
// load fs @ 'fs'
// load { readFile } @ 'fs/promises'
export function myFunc() {}
export default class MyClass {}

// Dynamic import
const module = await loadModule('./lazy.js');

// Interop — ESM reading CJS
// load cjsDefault @ './cjs-module.cjs'
// default export = module.exports object

// package.json
{
  "type": "module",  // .js files are ESM
  "main": "index.js"
}`
      },
      {
        q: "What is tree shaking?",
        a_en: "Static analysis removes unused exports from bundle. Requires ESM syntax (not require), sideEffects: false, no dynamic property access. Rollup and webpack implement this.",
        a_hi: "Static analysis unused exports ko bundle se hata deti hai. Requires: ESM syntax (require nahi), sideEffects: false, no dynamic property access. Rollup aur webpack isse implement karte hain.",
        code: `// utils.js
export function used() { return 1; }
export function unused() { return 2; }

// main.js
// load { used } @ './utils.js'
used(); // 'unused' is tree-shaken out

// package.json
{
  "sideEffects": false  // tells bundler "safe to shake"
}

// Or mark specific files
{
  "sideEffects": ["./src/polyfills.js", "*.css"]
}

// Avoid in barrel files
// ✗ Bad — everything imported
// index.js: export * @ './utils';

// ✓ Good — explicit exports
// index.js: export { used } @ './utils';`
      },
      {
        q: "Vite vs webpack?",
        a_en: "Webpack bundles everything upfront — slow dev, mature ecosystem. Vite serves native ESM in dev — instant HMR, fast cold start. Vite uses Rollup for prod. esbuild is 10-100x faster than JS bundlers.",
        a_hi: "Webpack sab upfront bundle karta hai — slow dev, mature ecosystem. Vite dev mein native ESM serve karta hai — instant HMR, fast cold start. Vite prod ke liye Rollup use karta hai. esbuild JS bundlers se 10-100x faster.",
        code: `// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\\.jsx?$/, use: 'babel-loader' },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};

// vite.config.js
// load { defineConfig } @ 'vite'
// load react @ '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});

// Commands
// vite         — dev server
// vite build   — production build
// vite preview — preview prod locally`
      },
      {
        q: "What does Babel do?",
        a_en: "JS transpiler — converts modern syntax to older JS for browser compat. preset-env with browserslist only transpiles what target browsers don't support. Also handles JSX, TypeScript stripping.",
        a_hi: "JS transpiler — modern syntax ko older JS mein convert karta hai browser compat ke liye. preset-env + browserslist sirf target browsers jo support nahi karte wo transpile karta hai. JSX, TypeScript stripping bhi handle karta hai.",
        code: `// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { esmodules: true }
    }],
    '@babel/preset-react'
  ]
};

// browserslist in package.json
{
  "browserslist": [
    "> 0.25%",
    "not dead",
    "not ie 11"
  ]
}

// Input — modern JS
const greet = async (name = 'Guest') => {
  const data = await fetch('/api');
  return { ...data, greeting: \`Hi \${name}\` };
};

// Output (simplified, for old browsers) — 
// converted to ES5 equivalent with regenerator runtime

// Modern alternatives
// — esbuild: 10-100x faster (used by Vite)
// — SWC: Rust-based (used by Next.js)`
      },
      {
        q: "What is dynamic import?",
        a_en: "import('./module.js') returns a Promise of the module namespace. Enables on-demand loading, route splitting. Combine with React.lazy for component-level splitting.",
        a_hi: "import('./module.js') Promise return karta hai module namespace ka. On-demand loading, route splitting enable karta hai. React.lazy ke saath component-level splitting ke liye.",
        code: `// Dynamic — loaded on demand
async function loadChart() {
  const { Chart } = await import('./Chart.js');
  return new Chart();
}

// Conditional loading
if (user.isAdmin) {
  const { AdminPanel } = await import('./AdminPanel.js');
  renderAdmin(AdminPanel);
}

// React lazy
const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}

// Preload on hover
function Link({ to }) {
  return (
    <a 
      href={to}
      onMouseEnter={() => import('./Page')} // preload
    >
      Go
    </a>
  );
}`
      },
    ],
  },

  // ═══════════════════ REACT ═══════════════════
  {
    id: "react-core", label: "React Core", icon: "⚛", color: "#61DAFB", section: "React",
    def_en: "React is a declarative UI library. Components are functions returning JSX (virtual DOM descriptors). React reconciles the virtual tree with the real DOM, batching and optimizing updates.",
    def_hi: "React ek declarative UI library hai. Components functions hote hain jo JSX (virtual DOM descriptors) return karte hain. React virtual tree ko real DOM ke saath reconcile karta hai, batching aur optimization karta hai.",
    questions: [
      {
        q: "What is the Virtual DOM and reconciliation?",
        a_en: "Virtual DOM is an in-memory JS representation of the real DOM. On render, React diffs new tree against previous and applies only changed patches. React 18's Fiber makes this incremental and interruptible.",
        a_hi: "Virtual DOM real DOM ka in-memory JS representation hai. Har render pe React naye tree ko previous se diff karta hai aur sirf changed patches apply karta hai. React 18 ka Fiber isse incremental aur interruptible banata hai.",
        code: `// Virtual DOM concept
const vdom = {
  type: 'div',
  props: { className: 'card' },
  children: [
    { type: 'h1', props: {}, children: ['Hello'] },
    { type: 'p', props: {}, children: ['World'] }
  ]
};

// React's simplified flow
function render(vdom, container) {
  const dom = document.createElement(vdom.type);
  // Apply props...
  // Render children recursively...
  container.appendChild(dom);
}

// Reconciliation with keys
function List({ items }) {
  return items.map(item => (
    <li key={item.id}>{item.name}</li>
    // Without key, React can't efficiently diff reorders
  ));
}`
      },
      {
        q: "Controlled vs uncontrolled components?",
        a_en: "Controlled: value driven by React state — every change goes through setState. Uncontrolled: value lives in DOM, accessed via refs. Prefer controlled for logic; uncontrolled for simple non-critical inputs.",
        a_hi: "Controlled: value React state se drive hoti hai — har change setState se. Uncontrolled: value DOM mein hoti hai, refs se access. Logic ke liye controlled prefer karo; simple non-critical inputs ke liye uncontrolled.",
        code: `// Controlled — React owns the value
function Controlled() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// Uncontrolled — DOM owns the value
function Uncontrolled() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return (
    <>
      <input ref={inputRef} defaultValue="initial" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

// File inputs — always uncontrolled
<input type="file" ref={fileRef} />`
      },
      {
        q: "Explain React's one-way data flow.",
        a_en: "Data flows parent → child via props only. Child can't mutate parent state — it calls a callback passed as prop. Makes flow explicit and traceable. For siblings, lift state to common ancestor.",
        a_hi: "Data parent → child props se flow karta hai. Child parent state mutate nahi kar sakta — prop se pass callback call karta hai. Flow explicit aur traceable banata hai. Siblings ke liye common ancestor mein state lift karo.",
        code: `// Parent owns state
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <Display value={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </>
  );
}

// Child receives via props
function Display({ value }) {
  return <div>Count: {value}</div>;
}

// Child calls back to parent
function Controls({ onIncrement }) {
  return <button onClick={onIncrement}>+</button>;
}

// Siblings communicate through parent
function App() {
  const [theme, setTheme] = useState('light');
  return (
    <>
      <Header theme={theme} onToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      <Content theme={theme} />
    </>
  );
}`
      },
      {
        q: "What is JSX and how is it compiled?",
        a_en: "JSX is syntactic sugar for React.createElement(). <Button color='red'>Click</Button> becomes createElement(Button, {color:'red'}, 'Click'). React 17+ has automatic JSX transform — no need to import React in every file.",
        a_hi: "JSX React.createElement() ka syntactic sugar hai. <Button color='red'>Click</Button> createElement(Button, {color:'red'}, 'Click') ban jaata hai. React 17+ automatic JSX transform hai — har file mein React import karne ki zaroorat nahi.",
        code: `// JSX
const el = <div className="card">
  <h1>Hello</h1>
  <p>World</p>
</div>;

// Compiled (classic transform)
const el = React.createElement(
  'div',
  { className: 'card' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
);

// JSX expressions
const name = "Raj";
<div>
  <h1>Hello {name}</h1>
  <p>{count > 0 ? 'Items' : 'Empty'}</p>
  {items.map(i => <li key={i.id}>{i.name}</li>)}
</div>

// Spread props
<Button {...rest} onClick={handleClick} />`
      },
      {
        q: "Why must list keys be stable and unique?",
        a_en: "Keys help React identify added, removed, reordered items. Unique among siblings, stable across renders. Array index as key breaks on reorders — React reuses wrong instances, causing state bugs.",
        a_hi: "Keys React ko added, removed, reordered items identify karne mein madad karti hain. Siblings mein unique, renders ke beech stable. Array index as key reorders pe break hota hai — React galat instances reuse karta hai, state bugs aate hain.",
        code: `// ✓ Good — stable database IDs
items.map(item => (
  <li key={item.id}>{item.name}</li>
))

// ✗ Bad — index as key
items.map((item, i) => (
  <li key={i}>{item.name}</li>
))
// Breaks on:
// - Reorder (wrong state attaches)
// - Insertion at top (all shift, all re-render)
// - Deletion

// Why it matters — input state survives
// If user typed in item[0].input and list reorders
// with index keys, the typed value stays on index 0
// (wrong item!)

// Use IDs
<Item key={item.id} data={item} />

// UUID if no ID
items.map((item, i) => ({
  ...item,
  _key: item._key ?? crypto.randomUUID()
}))`
      },
      {
        q: "What are React Fragments?",
        a_en: "<> </> or <React.Fragment> let you return multiple elements without a wrapper DOM node. Use when a wrapper div breaks CSS layout or adds incorrect nesting. Keys need explicit <React.Fragment key={id}>.",
        a_hi: "<> </> ya <React.Fragment> multiple elements return karne dete hain bina wrapper DOM node ke. Use when wrapper div CSS layout todega ya incorrect nesting karega. Keys ke liye explicit <React.Fragment key={id}>.",
        code: `// Without fragment — extra div
function Bad() {
  return (
    <div>
      <td>A</td>
      <td>B</td>
    </div>
  ); // Invalid HTML inside <tr>
}

// With fragment — no wrapper
function Good() {
  return (
    <>
      <td>A</td>
      <td>B</td>
    </>
  );
}

// Flex/grid layouts
function Card() {
  return (
    <>
      <img src="..." />
      <h3>Title</h3>
    </>
  );
}

// Keyed fragment in lists
{items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </React.Fragment>
))}`
      },
      {
        q: "Props vs state?",
        a_en: "Props: immutable inputs from parent — component can't change own props. State: internal mutable data — changes trigger re-renders. Parent's state becomes child's props. Enforces clear data ownership.",
        a_hi: "Props: parent se immutable inputs — component apne props change nahi kar sakta. State: internal mutable data — changes re-renders trigger karte hain. Parent ka state child ka props ban jaata hai. Clear data ownership enforce karta hai.",
        code: `function Profile({ userId }) { // userId is prop
  const [user, setUser] = useState(null); // user is state
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  // Can't do: userId = 5  ✗ (props immutable)
  // Can do: setUser(newUser) ✓ (state mutable)
  
  if (!user) return <Spinner />;
  return <Card user={user} />;
}

// Parent-to-child data flow
function App() {
  const [users, setUsers] = useState([]); // state here
  return users.map(u => (
    <Profile userId={u.id} /> // passed as prop
  ));
}

// Never mutate props
function Bad({ items }) {
  items.push('new'); // ✗ mutating prop!
  return items.map(...);
}

// Create new
function Good({ items }) {
  const extended = [...items, 'new']; // ✓
  return extended.map(...);
}`
      },
    ],
  },

  {
    id: "react-hooks", label: "Hooks", icon: "🎣", color: "#FF6B6B", section: "React",
    def_en: "Hooks let function components use state, effects, and other React features. They must be called at the top level and only inside React functions — rules that preserve the stable hook call order React relies on.",
    def_hi: "Hooks function components ko state, effects, aur dusre React features use karne dete hain. Top level pe aur sirf React functions ke andar call karne chahiye — ye rules hook call order ko stable rakhte hain jo React ko chahiye.",
    questions: [
      {
        q: "What are the rules of hooks and why?",
        a_en: "1) Only call hooks at top level — no conditions, loops, nested functions. 2) Only in React function components or custom hooks. React tracks hooks by call order per component instance (linked list). Conditional calls would corrupt state mapping.",
        a_hi: "1) Sirf top level pe call karo — no conditions, loops, nested functions. 2) Sirf React function components ya custom hooks mein. React hooks ko call order se track karta hai per component instance (linked list). Conditional calls state mapping corrupt kar denge.",
        code: `// ✗ WRONG
function Bad() {
  if (condition) {
    const [state, setState] = useState(0); // ✗
  }
  for (let i = 0; i < 5; i++) {
    useEffect(() => {}); // ✗
  }
  return null;
}

// ✓ CORRECT
function Good() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    if (condition) { // condition INSIDE, not around hook
      // ...
    }
  }, [condition]);
  
  return null;
}

// ESLint catches violations
// eslint-plugin-react-hooks / rules-of-hooks`
      },
      {
        q: "useMemo vs useCallback?",
        a_en: "useMemo memoizes a computed value. useCallback memoizes a function reference. useCallback(fn, deps) is useMemo(() => fn, deps) under the hood. Use useMemo for heavy computations; useCallback for stable function props.",
        a_hi: "useMemo computed value memoize karta hai. useCallback function reference memoize karta hai. useCallback(fn, deps) underneath useMemo(() => fn, deps) hai. Heavy computations ke liye useMemo; stable function props ke liye useCallback.",
        code: `// useMemo — memoize value
function List({ items, filter }) {
  const filtered = useMemo(() => {
    return items.filter(i => i.name.includes(filter));
  }, [items, filter]); // recompute only when deps change
  
  return <Rows items={filtered} />;
}

// useCallback — memoize function
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);
  
  return <Child onClick={handleClick} />;
  // Child memoized won't re-render unless handleClick changes
}

// useCallback equivalent
const handleClick = useMemo(
  () => () => console.log(count),
  [count]
);

// When NOT to use
// — If child is not memoized, useCallback adds overhead without benefit`
      },
      {
        q: "How do you prevent stale closures in useEffect?",
        a_en: "Include referenced vars in dep array. For values needed without retriggering, use a ref. eslint-plugin-react-hooks catches missing deps.",
        a_hi: "Referenced vars ko dep array mein include karo. Values jo retrigger kiye bina chahiye ke liye ref use karo. eslint-plugin-react-hooks missing deps catch karta hai.",
        code: `// ✗ Stale closure
function Bad() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // stale!
    }, 1000);
    return () => clearInterval(id);
  }, []); // missing count dep
}

// ✓ Fix 1 — add to deps
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, [count]); // recreates interval each change

// ✓ Fix 2 — functional updater
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // always latest
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✓ Fix 3 — ref for latest value
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // always latest
  }, 1000);
  return () => clearInterval(id);
}, []);`
      },
      {
        q: "What can useRef do beyond DOM refs?",
        a_en: "Mutable container whose .current persists across renders without triggering re-renders. Uses: previous values, interval IDs, mutable values effects read without deps, imperative handles for child APIs.",
        a_hi: "Mutable container jiska .current renders ke beech persist hota hai bina re-render trigger kiye. Uses: previous values, interval IDs, mutable values effects bina deps read karte hain, child APIs ke imperative handles.",
        code: `// 1. DOM ref
const inputRef = useRef();
<input ref={inputRef} />
inputRef.current.focus();

// 2. Previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

// 3. Timer cleanup
function Timer() {
  const intervalRef = useRef();
  
  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);
}

// 4. Instance variable
function Counter() {
  const renderCount = useRef(0);
  renderCount.current++;
  return <p>Rendered {renderCount.current} times</p>;
}

// 5. isMounted
useEffect(() => {
  let mounted = true;
  fetchData().then(data => {
    if (mounted) setData(data);
  });
  return () => { mounted = false; };
}, []);`
      },
      {
        q: "useReducer vs useState?",
        a_en: "Use useReducer when: state has multiple related sub-values, next state depends non-trivially on previous, you want centralized transition logic, or need stable dispatch reference.",
        a_hi: "useReducer use karo jab: state ke multiple related sub-values hon, next state previous pe non-trivially depend kare, centralized transition logic chahiye, ya stable dispatch reference chahiye.",
        code: `// Simple — useState
const [count, setCount] = useState(0);

// Complex — useReducer
const initial = { items: [], filter: 'all', loading: false };

function reducer(state, action) {
  switch(action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, items: action.payload, loading: false };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}

function List() {
  const [state, dispatch] = useReducer(reducer, initial);
  
  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    fetchItems().then(data => 
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    );
  }, []);
  
  const filtered = state.items.filter(/* ... */);
  return <Items items={filtered} />;
}`
      },
      {
        q: "useLayoutEffect vs useEffect?",
        a_en: "useLayoutEffect fires synchronously after DOM mutations, before paint. useEffect fires asynchronously after paint. Use useLayoutEffect for DOM measurements/mutations that must be invisible to user.",
        a_hi: "useLayoutEffect synchronously DOM mutations ke baad fire hota hai, paint se pehle. useEffect async paint ke baad fire hota hai. useLayoutEffect use karo DOM measurements/mutations ke liye jo user ko invisible hone chahiye.",
        code: `// Layout-sensitive — use useLayoutEffect
function Tooltip({ target, content }) {
  const tooltipRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useLayoutEffect(() => {
    const rect = target.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    setPosition({
      x: rect.left,
      y: rect.top - tip.height - 10
    });
  }, [target]);
  
  return (
    <div ref={tooltipRef} style={{ left: position.x, top: position.y }}>
      {content}
    </div>
  );
}

// Most side effects — useEffect
useEffect(() => {
  fetchData().then(setData);
  document.title = 'Page ' + name;
}, [name]);

// SSR gotcha — useLayoutEffect doesn't run on server
// Use useEffect or guard`
      },
      {
        q: "What is the useId hook for?",
        a_en: "Generates unique IDs consistent between server and client renders. Solves hydration mismatches. Use to link form labels to inputs. Not for list keys.",
        a_hi: "Server aur client renders ke beech consistent unique IDs generate karta hai. Hydration mismatches solve karta hai. Form labels ko inputs se link karne ke liye. List keys ke liye nahi.",
        code: `function FormField({ label }) {
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}

// Multiple IDs from one useId
function PasswordField() {
  const id = useId();
  
  return (
    <>
      <label htmlFor={\`\${id}-password\`}>Password</label>
      <input id={\`\${id}-password\`} />
      <p id={\`\${id}-hint\`}>At least 8 chars</p>
      <input aria-describedby={\`\${id}-hint\`} />
    </>
  );
}

// ✗ Don't use for list keys
items.map(item => (
  <Row key={useId()} data={item} /> // ✗
));

// ✓ Use stable data keys
items.map(item => (
  <Row key={item.id} data={item} /> // ✓
));`
      },
      {
        q: "useDeferredValue vs useTransition?",
        a_en: "useDeferredValue takes a value, returns a 'lagged' copy. useTransition wraps your own state updates. Both defer rendering but suit different ownership. useDeferredValue for props, useTransition for your own setState.",
        a_hi: "useDeferredValue value leta hai, 'lagged' copy return karta hai. useTransition apne state updates wrap karta hai. Dono rendering defer karte hain but different ownership ke liye. Props ke liye useDeferredValue, apne setState ke liye useTransition.",
        code: `// useTransition — you own the state
function Search() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    setQuery(e.target.value); // urgent — keep input responsive
    startTransition(() => {
      // non-urgent — can be interrupted
      performExpensiveSearch(e.target.value);
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results />
    </>
  );
}

// useDeferredValue — you don't own the state
function ResultsList({ query }) {
  const deferredQuery = useDeferredValue(query);
  // Renders with OLD query while new one is being prepared
  // Smooth UX without blocking input
  
  const results = useMemo(
    () => expensiveFilter(deferredQuery),
    [deferredQuery]
  );
  
  return <List items={results} />;
}`
      },
      {
        q: "How does useImperativeHandle work?",
        a_en: "Customizes the ref exposed by forwardRef. Instead of full DOM node, expose specific methods. Keeps parent-child contracts minimal.",
        a_hi: "forwardRef ke through expose ki gayi ref ko customize karta hai. Full DOM node ki bajay, specific methods expose karo. Parent-child contracts minimal rakhta hai.",
        code: `const Input = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    reset: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value
  }));
  
  return <input ref={inputRef} {...props} />;
});

function Form() {
  const inputRef = useRef();
  
  const handleReset = () => {
    inputRef.current.reset();
    inputRef.current.focus();
  };
  
  return (
    <>
      <Input ref={inputRef} />
      <button onClick={handleReset}>Reset</button>
    </>
  );
}

// Use sparingly — most cases can use props + state
// Only for truly imperative APIs (focus, play, scroll)`
      },
      {
        q: "How do custom hooks work?",
        a_en: "Functions prefixed with 'use' that call other hooks. Extract reusable stateful logic without changing tree structure. Examples: useFetch, useWindowSize, useLocalStorage. Each call gets own isolated state.",
        a_hi: "'use' prefix wale functions jo dusre hooks call karte hain. Reusable stateful logic extract karte hain bina tree structure change kiye. Examples: useFetch, useWindowSize, useLocalStorage. Har call ko apna isolated state milta hai.",
        code: `// Custom hook — useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    
    fetch(url, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => { setData(data); setLoading(false); })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err); setLoading(false);
        }
      });
    
    return () => ctrl.abort();
  }, [url]);
  
  return { data, error, loading };
}

// useLocalStorage
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Usage
function App() {
  const { data, loading } = useFetch('/api/users');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
}`
      },
    ],
  },

  {
    id: "react-concurrent", label: "Concurrent", icon: "⚡", color: "#F7DC6F", section: "React",
    def_en: "Concurrent React (React 18) allows React to prepare multiple UI versions simultaneously and interrupt/resume/abandon rendering. Enabled via createRoot(). Features: automatic batching, transitions, Suspense on data, streaming SSR.",
    def_hi: "Concurrent React (React 18) multiple UI versions ek saath prepare karne aur interrupt/resume/abandon rendering karne deta hai. createRoot() se enable. Features: automatic batching, transitions, Suspense on data, streaming SSR.",
    questions: [
      {
        q: "What is Concurrent Mode?",
        a_en: "Enables React to interrupt and resume rendering. High-priority updates preempt low-priority ones. Enabled by createRoot() in React 18. Doesn't break existing code, unlocks new features.",
        a_hi: "React ko interrupt aur resume rendering karne deta hai. High-priority updates low-priority ko preempt karte hain. React 18 mein createRoot() se enable. Existing code ko break nahi karta, new features unlock karta hai.",
        code: `// React 17 — legacy
// load ReactDOM @ 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'));

// React 18 — concurrent
// load { createRoot } @ 'react-dom/client'
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Unlocks:
// - automatic batching
// - useTransition / useDeferredValue
// - Suspense for data fetching
// - Streaming SSR

// Strict Mode — helps find concurrency bugs
<StrictMode>
  <App />
</StrictMode>
// Double-invokes effects/renders in dev`
      },
      {
        q: "What is automatic batching in React 18?",
        a_en: "React 17 batched only in event handlers. React 18 batches ALL state updates — in setTimeout, Promises, native listeners. Opt out with flushSync() for immediate DOM reads.",
        a_hi: "React 17 sirf event handlers mein batch karta tha. React 18 saare state updates batch karta hai — setTimeout, Promises, native listeners mein bhi. Immediate DOM reads ke liye flushSync() se opt out.",
        code: `// React 17 behavior
setTimeout(() => {
  setCount(c => c + 1); // re-render 1
  setFlag(f => !f);     // re-render 2
}, 100);

// React 18 — auto batched!
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Single re-render ✓
}, 100);

// Opt out when needed
// load { flushSync } @ 'react-dom'
flushSync(() => {
  setCount(c => c + 1);
}); // DOM updated immediately
flushSync(() => {
  setFlag(f => !f);
}); // DOM updated immediately

// Useful for reading DOM between updates
const handleClick = () => {
  flushSync(() => setCount(c => c + 1));
  // can measure DOM now
  element.scrollTo({ top: element.scrollHeight });
};`
      },
      {
        q: "How does useTransition work?",
        a_en: "Marks state updates as non-urgent. Urgent interactions (typing) aren't blocked. Returns [isPending, startTransition]. Transitions render in background; show loading indicator if needed.",
        a_hi: "State updates ko non-urgent mark karta hai. Urgent interactions (typing) block nahi hote. [isPending, startTransition] return karta hai. Transitions background mein render karte hain; zaroorat pade toh loading indicator dikhao.",
        code: `function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    setQuery(e.target.value); // urgent — input stays responsive
    
    startTransition(() => {
      // non-urgent — can be interrupted
      const filtered = expensiveFilter(e.target.value);
      setResults(filtered);
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating...</span>}
      <ResultsList items={results} />
    </>
  );
}

// Use cases
// - Large list filtering
// - Tab switching with heavy content
// - Route changes with data
// - Navigation in search results`
      },
      {
        q: "What is Suspense and data fetching?",
        a_en: "Catches components that 'suspend' (throw a Promise) and shows fallback. Works with React.lazy for code splitting. With React 18+ and Next.js, async server components suspend natively.",
        a_hi: "Components jo 'suspend' hote hain (Promise throw karte hain) catch karta hai aur fallback dikhata hai. React.lazy ke saath code splitting ke liye. React 18+ aur Next.js ke saath async server components natively suspend hote hain.",
        code: `// Code splitting with Suspense
const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}

// Nested boundaries
<Suspense fallback={<PageSpinner />}>
  <Layout>
    <Suspense fallback={<SidebarSpinner />}>
      <Sidebar />
    </Suspense>
    <Suspense fallback={<ContentSpinner />}>
      <Content />
    </Suspense>
  </Layout>
</Suspense>

// React 19+ use() hook
function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends
  return <div>{user.name}</div>;
}

// Server components (Next.js App Router)
async function Page() {
  const data = await fetchData(); // suspends on server
  return <div>{data.title}</div>;
}`
      },
      {
        q: "What are React Server Components (RSC)?",
        a_en: "Run only on server, never shipped to client. Can access DB, filesystem, secrets directly. Cannot use state, effects, or browser APIs. Marked server by default in Next.js App Router; 'use client' for Client Components.",
        a_hi: "Sirf server pe run hote hain, client pe nahi bheje jaate. DB, filesystem, secrets direct access kar sakte hain. State, effects, browser APIs use nahi kar sakte. Next.js App Router mein default server hote hain; 'use client' Client Components ke liye.",
        code: `// Server Component (default in App Router)
// app/users/page.js
async function UsersPage() {
  const users = await db.user.findMany(); // direct DB access!
  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// Client Component
'use client';
// load { useState } @ 'react'
export function Counter() {
  const [count, setCount] = useState(0); // only client can have state
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Mixing
async function Page() {
  const data = await fetchData(); // server
  
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter />  {/* client */}
    </div>
  );
}

// Benefits
// - Smaller JS bundle (server code not shipped)
// - Direct backend access (no API layer needed)
// - Better SEO and faster initial load`
      },
      {
        q: "What is streaming SSR?",
        a_en: "renderToPipeableStream sends HTML chunks as ready. Suspense boundaries define streaming split points. Shell renders first, deferred content streams in. Dramatically improves TTFB and FCP.",
        a_hi: "renderToPipeableStream HTML chunks ready hone par bhejta hai. Suspense boundaries streaming split points define karti hain. Shell pehle render, deferred content stream in. TTFB aur FCP dramatically improve karta hai.",
        code: `// server.js (Node.js)
// load { renderToPipeableStream } @ 'react-dom/server'
app.get('/', (req, res) => {
  const stream = renderToPipeableStream(<App />, {
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      stream.pipe(res);
    },
    onError(err) {
      console.error(err);
    }
  });
});

// App — shell renders first
function App() {
  return (
    <html>
      <body>
        <Header /> {/* renders immediately */}
        <Suspense fallback={<Spinner />}>
          <SlowContent /> {/* streams in when ready */}
        </Suspense>
        <Footer /> {/* renders immediately */}
      </body>
    </html>
  );
}

// User sees shell + spinner fast
// Then content streams in progressively`
      },
      {
        q: "createRoot vs ReactDOM.render?",
        a_en: "ReactDOM.render (React 17) is synchronous, legacy mode. createRoot (React 18) enables concurrent: batching, transitions, Suspense improvements. Can't mix legacy render with new concurrent APIs.",
        a_hi: "ReactDOM.render (React 17) synchronous hai, legacy mode. createRoot (React 18) concurrent enable karta hai: batching, transitions, Suspense improvements. Legacy render aur new concurrent APIs mix nahi kar sakte.",
        code: `// React 17 — legacy
// load ReactDOM @ 'react-dom'
ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// React 18 — concurrent
// load { createRoot } @ 'react-dom/client'
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// Unmount
root.unmount();

// Hydration (SSR)
// load { hydrateRoot } @ 'react-dom/client'
hydrateRoot(container, <App />);

// Migration note — just swap these two lines
// No other code changes needed
// Concurrent features are opt-in via new APIs`
      },
    ],
  },

  {
    id: "react-perf", label: "Performance", icon: "🚀", color: "#82E0AA", section: "React",
    def_en: "React performance optimizations prevent unnecessary re-renders, reduce bundle sizes, and keep interactions fast. Profile first, optimize second — premature optimization adds complexity without guaranteed gains.",
    def_hi: "React performance optimizations unnecessary re-renders rokti hain, bundle sizes kam karti hain, interactions fast rakhti hain. Pehle profile karo, phir optimize — premature optimization complexity badhaati hai bina guaranteed gains ke.",
    questions: [
      {
        q: "How to identify and fix unnecessary re-renders?",
        a_en: "React DevTools Profiler — record, see which components render and why. Why-did-you-render library logs prop diffs. Root causes: unstable object/array literals as props, inline arrow functions, bad context design.",
        a_hi: "React DevTools Profiler — record karo, dekho kaunse components render hue aur kyun. Why-did-you-render library prop diffs log karti hai. Root causes: unstable object/array literals as props, inline arrows, bad context design.",
        code: `// ✗ Problem — new object every render
function Parent() {
  return <Child config={{ theme: 'dark' }} />;
  //                    ^ new object every time!
}

// ✓ Fix 1 — stable ref
function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <Child config={config} />;
}

// ✓ Fix 2 — hoist constant
const CONFIG = { theme: 'dark' };
function Parent() {
  return <Child config={CONFIG} />;
}

// ✗ Inline arrows break memo
<Button onClick={() => handleClick(id)} />

// ✓ Use useCallback
const handleClick = useCallback(() => { /* ... */ }, [id]);
<Button onClick={handleClick} />

// Memoize child
const Child = React.memo(function Child(props) {
  return <div>{props.value}</div>;
});`
      },
      {
        q: "How does React.memo work?",
        a_en: "Shallowly compares props — skips re-render if unchanged. Don't use when component always gets new props, renders are trivial, or you haven't profiled a real problem. Premature memoization adds complexity.",
        a_hi: "Props ko shallow compare karta hai — unchanged hon toh re-render skip. Use na karo jab component hamesha naye props le, renders trivial hon, ya real problem profile nahi kiya. Premature memoization complexity badhati hai.",
        code: `// Basic memo
const Item = React.memo(function Item({ name, onDelete }) {
  return (
    <li>
      {name}
      <button onClick={onDelete}>✕</button>
    </li>
  );
});

// Custom comparison
const Item = React.memo(
  function Item({ user }) { return <div>{user.name}</div>; },
  (prev, next) => prev.user.id === next.user.id
  // Return true to skip re-render
);

// memo needs stable function props
function List({ items }) {
  const handleDelete = useCallback((id) => {
    removeItem(id);
  }, []);
  
  return items.map(item => (
    <Item
      key={item.id}
      name={item.name}
      onDelete={() => handleDelete(item.id)} // ✗ new fn every time
    />
  ));
}

// ✓ Correct — stable per item
<Item
  key={item.id}
  name={item.name}
  id={item.id}
  onDelete={handleDelete} // stable
/>`
      },
      {
        q: "Code splitting strategies?",
        a_en: "Route-level (highest ROI): React.lazy + Suspense. Component-level for heavy widgets. Vendor chunks. Dynamic imports on interaction. Magic comments for named chunks. Preload on hover for critical next routes.",
        a_hi: "Route-level (highest ROI): React.lazy + Suspense. Heavy widgets ke liye component-level. Vendor chunks. Interaction pe dynamic imports. Magic comments named chunks ke liye. Critical next routes hover pe preload.",
        code: `// Route-level
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

// Component-level
const HeavyChart = lazy(() => 
  import(/* webpackChunkName: "chart" */ './Chart')
);

// Preload on hover
function NavLink({ to, children }) {
  const handleMouseEnter = () => {
    if (to === '/dashboard') {
      import('./pages/Dashboard'); // preload
    }
  };
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}

// Vendor splitting in Vite
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@mui/material']
        }
      }
    }
  }
};`
      },
      {
        q: "How do you virtualize long lists?",
        a_en: "Only render DOM nodes in viewport (windowing). Libraries: react-window (lightweight), react-virtual (headless). Concerns: dynamic row heights, scroll restoration, keyboard accessibility, screen reader compatibility.",
        a_hi: "Sirf viewport mein jo DOM nodes hon wo render karo (windowing). Libraries: react-window (lightweight), react-virtual (headless). Concerns: dynamic row heights, scroll restoration, keyboard accessibility, screen readers.",
        code: `// react-window basic
// load { FixedSizeList } @ 'react-window'
function Row({ index, style }) {
  return <div style={style}>Row {index}</div>;
}

function List() {
  return (
    <FixedSizeList
      height={600}
      itemCount={10000}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// Variable heights
// load { VariableSizeList } @ 'react-window'
function List() {
  const rowHeights = useRef(new Array(items.length).fill(80));
  
  return (
    <VariableSizeList
      itemCount={items.length}
      itemSize={index => rowHeights.current[index]}
      height={600}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].content}</div>
      )}
    </VariableSizeList>
  );
}

// Infinite scroll combo
// Use IntersectionObserver on last item to load more`
      },
      {
        q: "Context performance pitfalls?",
        a_en: "Every context value change re-renders ALL consumers. Mitigations: split by update frequency, memoize value, separate read/write contexts, or use atomic managers (Zustand, Jotai).",
        a_hi: "Har context value change SAARE consumers ko re-render karta hai. Mitigations: update frequency se split karo, value memoize karo, read/write contexts separate, ya atomic managers (Zustand, Jotai) use karo.",
        code: `// ✗ Problem — everything in one context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState();
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  
  return (
    <AppContext.Provider value={{ user, theme, cart, setUser, setTheme, setCart }}>
      {children}
    </AppContext.Provider>
  );
}
// Cart change → everyone re-renders!

// ✓ Split by frequency
const UserContext = createContext();
const ThemeContext = createContext();
const CartContext = createContext();

// ✓ Memoize value
function AppProvider({ children }) {
  const [user, setUser] = useState();
  
  const value = useMemo(() => ({ user, setUser }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ✓ Separate read/write
const StateContext = createContext();
const DispatchContext = createContext();
// Reader only rerenders on state change
// Writer (dispatch) never changes`
      },
      {
        q: "What are Web Vitals?",
        a_en: "Core Web Vitals: LCP (<2.5s), INP (<200ms), CLS (<0.1). SPAs struggle with LCP (needs JS) and INP (long tasks). Solutions: SSR/SSG, code splitting, useTransition, Next.js Image component.",
        a_hi: "Core Web Vitals: LCP (<2.5s), INP (<200ms), CLS (<0.1). SPAs ko LCP (JS chahiye) aur INP (long tasks) mein problem hoti hai. Solutions: SSR/SSG, code splitting, useTransition, Next.js Image component.",
        code: `// Measure with web-vitals library
// npm install web-vitals
// load { onCLS, onFID, onLCP, onINP } @ 'web-vitals'
onCLS(console.log);
onINP(console.log);
onLCP(console.log);

// Send to analytics
function sendToAnalytics({ name, value, id }) {
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({ metric: name, value, id })
  });
}

onLCP(sendToAnalytics);

// Performance Observer API
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Image optimization (Next.js)
// load Image @ 'next/image'
<Image src="/hero.jpg" alt="" width={1200} height={600} priority />
// Auto: modern formats, lazy loading, sizing`
      },
    ],
  },

  {
    id: "react-patterns", label: "Patterns", icon: "🏗", color: "#BB8FCE", section: "React",
    def_en: "React design patterns solve common architectural problems: sharing logic, composing components, managing complexity. Understanding when and why to use each pattern separates senior from junior engineers.",
    def_hi: "React design patterns common architectural problems solve karte hain: logic sharing, components composing, complexity managing. Kaunsa pattern kab aur kyun use kare — ye senior aur junior engineers ko alag karta hai.",
    questions: [
      {
        q: "Compound component pattern?",
        a_en: "Components share implicit state via context. Parent manages state, children consume via context. Users compose freely without prop threading. Trade-off: less obvious API, context coupling.",
        a_hi: "Components context se implicit state share karte hain. Parent state manage karta hai, children context se consume. Users freely compose karte hain bina prop threading ke. Trade-off: less obvious API, context coupling.",
        code: `const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={active === value}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

function Panel({ value, children }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

// Usage — super flexible
<Tabs defaultValue="home">
  <Tabs.List>
    <Tabs.Tab value="home">Home</Tabs.Tab>
    <Tabs.Tab value="about">About</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="home">Home content</Tabs.Panel>
  <Tabs.Panel value="about">About content</Tabs.Panel>
</Tabs>`
      },
      {
        q: "What are Higher-Order Components (HOC)?",
        a_en: "Function taking a component, returning enhanced one. Adds cross-cutting concerns (auth, analytics). Downsides: prop collision, wrapper hell, harder TypeScript. Custom hooks preferred for logic; HOCs for error boundaries.",
        a_hi: "Function jo component le aur enhanced return kare. Cross-cutting concerns (auth, analytics) add karta hai. Downsides: prop collision, wrapper hell, TypeScript tough. Logic ke liye custom hooks, error boundaries ke liye HOCs.",
        code: `// Auth HOC
function withAuth(Component) {
  return function AuthWrapper(props) {
    const { user, loading } = useAuth();
    
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);

// Analytics HOC
function withTracking(Component, eventName) {
  return function TrackedComponent(props) {
    useEffect(() => {
      analytics.track(eventName);
    }, []);
    return <Component {...props} />;
  };
}

// Composition
const EnhancedPage = withAuth(withTracking(Page, 'page_view'));

// Modern preference — custom hooks
function useAuthGuard() {
  const { user, loading } = useAuth();
  if (loading) return { loading: true };
  if (!user) return { redirect: '/login' };
  return { user };
}

function Dashboard() {
  const { loading, redirect, user } = useAuthGuard();
  if (loading) return <Spinner />;
  if (redirect) return <Navigate to={redirect} />;
  return <div>Welcome {user.name}</div>;
}`
      },
      {
        q: "Render props pattern?",
        a_en: "Function prop component calls with internal state. Mostly replaced by hooks, but still valid for: virtual list row renderers, library APIs where hooks can't be imposed, class component integration.",
        a_hi: "Function prop jo component internal state ke saath call karta hai. Mostly hooks ne replace kar diya, but abhi bhi valid: virtual list row renderers, library APIs jahan hooks impose nahi kar sakte, class components integration.",
        code: `// Mouse tracker with render prop
function Mouse({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  
  return render(pos);
}

// Usage
<Mouse render={({ x, y }) => (
  <div>Mouse at {x}, {y}</div>
)} />

// children-as-function variant
function Mouse({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // ...
  return children(pos);
}

<Mouse>
  {({ x, y }) => <div>{x}, {y}</div>}
</Mouse>

// Virtual list row renderer (real use case)
<VirtualList
  items={items}
  renderItem={({ item, style }) => (
    <div style={style}>{item.name}</div>
  )}
/>`
      },
      {
        q: "How to implement Error Boundary?",
        a_en: "Class component with getDerivedStateFromError (fallback state) and componentDidCatch (logging). Catches rendering errors in subtree. Place at route level and around third-party widgets.",
        a_hi: "Class component with getDerivedStateFromError (fallback state) aur componentDidCatch (logging). Subtree mein rendering errors catch karta hai. Route level aur third-party widgets ke around place karo.",
        code: `class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    logErrorToService(error, info);
  }
  
  reset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>

// Better — react-error-boundary library
// load { ErrorBoundary } @ 'react-error-boundary'
function Fallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={Fallback}
  onError={logError}
  onReset={() => window.location.reload()}
>
  <App />
</ErrorBoundary>`
      },
      {
        q: "What is optimistic UI?",
        a_en: "Update UI immediately before server confirmation. Pattern: save prevState, apply update, fire mutation. On error: rollback + show toast. React Query's onMutate/onError handles this cleanly.",
        a_hi: "Server confirmation se pehle UI update kar do. Pattern: prevState save, update apply, mutation fire. Error pe: rollback + toast. React Query ka onMutate/onError ye cleanly handle karta hai.",
        code: `// Manual optimistic update
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const addTodo = async (text) => {
    const tempId = Date.now();
    const newTodo = { id: tempId, text, done: false };
    
    // Optimistic update
    setTodos(prev => [...prev, newTodo]);
    
    try {
      const saved = await api.createTodo(text);
      // Replace temp with real
      setTodos(prev => prev.map(t => 
        t.id === tempId ? saved : t
      ));
    } catch (err) {
      // Rollback
      setTodos(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to add todo');
    }
  };
}

// React Query — cleaner
const mutation = useMutation({
  mutationFn: addTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries(['todos']);
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], old => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['todos']);
  }
});`
      },
      {
        q: "Container/presentational pattern?",
        a_en: "Containers handle data/state/logic. Presentationals receive props and render. Makes presentationals reusable and Storybook-testable without mocks. With hooks, a custom hook can be the container.",
        a_hi: "Containers data/state/logic handle karte hain. Presentationals props le ke render karte hain. Presentationals reusable aur Storybook-testable banate hain bina mocks. Hooks ke saath custom hook container ban sakta hai.",
        code: `// Presentational (dumb)
function UserCard({ name, email, avatar, onEdit }) {
  return (
    <div className="card">
      <img src={avatar} alt="" />
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// Container (smart) — class-based
class UserCardContainer extends React.Component {
  state = { user: null, loading: true };
  
  async componentDidMount() {
    const user = await fetchUser(this.props.id);
    this.setState({ user, loading: false });
  }
  
  handleEdit = () => navigate('/edit/' + this.state.user.id);
  
  render() {
    if (this.state.loading) return <Spinner />;
    return <UserCard {...this.state.user} onEdit={this.handleEdit} />;
  }
}

// Modern — custom hook is the container
function useUser(id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(id).then(u => {
      setUser(u); setLoading(false);
    });
  }, [id]);
  
  return { user, loading };
}

function UserCardWrapper({ id }) {
  const { user, loading } = useUser(id);
  if (loading) return <Spinner />;
  return <UserCard {...user} onEdit={() => navigate('/edit/' + id)} />;
}`
      },
      {
        q: "What is a headless component?",
        a_en: "Provides behavior and accessibility without visual styling. Consumers supply render output. Examples: Radix UI, react-table, downshift. Full styling control without fighting library CSS.",
        a_hi: "Behavior aur accessibility provide karta hai bina visual styling. Consumers render output dete hain. Examples: Radix UI, react-table, downshift. Full styling control bina library CSS se ladne ke.",
        code: `// Headless tabs (Radix UI style)
// load * as Tabs @ '@radix-ui/react-tabs'
<Tabs.Root defaultValue="tab1">
  <Tabs.List className="custom-tabs-list">
    <Tabs.Trigger value="tab1" className="my-trigger">
      Tab 1
    </Tabs.Trigger>
    <Tabs.Trigger value="tab2" className="my-trigger">
      Tab 2
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs.Root>
// Library handles: keyboard nav, ARIA, focus
// You handle: all styling

// Headless form with react-hook-form
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email', { required: true })} />
  {errors.email && <span>Required</span>}
</form>

// Custom headless tooltip
function useTooltip() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef();
  const tooltipRef = useRef();
  
  return {
    triggerProps: {
      ref: triggerRef,
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      'aria-describedby': open ? 'tooltip' : undefined
    },
    tooltipProps: {
      ref: tooltipRef,
      id: 'tooltip',
      role: 'tooltip',
      hidden: !open
    },
    open
  };
}`
      },
    ],
  },

  {
    id: "react-state", label: "State Mgmt", icon: "🗃", color: "#F0B27A", section: "React",
    def_en: "Client and server state are different problems. Client state (UI) lives in useState/Zustand. Server state (async, stale) belongs in React Query/SWR. Don't store API responses in Redux.",
    def_hi: "Client aur server state alag problems hain. Client state (UI) useState/Zustand mein. Server state (async, stale) React Query/SWR mein. API responses Redux mein store karna outdated hai.",
    questions: [
      {
        q: "Context vs external state manager?",
        a_en: "Context: low-frequency updates (theme, auth), tree-wide values, small-medium apps. External (Zustand, Redux): high-frequency, complex state machines, atomic subscriptions. Start simple, escalate as needed.",
        a_hi: "Context: low-frequency updates (theme, auth), tree-wide values, chhote-medium apps. External (Zustand, Redux): high-frequency, complex state machines, atomic subscriptions. Simple se shuru karo, zaroorat pe escalate.",
        code: `// Context — good for low-frequency
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Zustand — atomic subscriptions
// load create @ 'zustand'
const useStore = create((set) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 }))
}));

function Counter() {
  const count = useStore(s => s.count);
  const inc = useStore(s => s.increment);
  return <button onClick={inc}>{count}</button>;
}`
      },
      {
        q: "Zustand vs Redux?",
        a_en: "Zustand: minimal (~1KB), no boilerplate, slice subscriptions. Redux Toolkit: structured, DevTools time-travel, middleware ecosystem. Zustand for DX; Redux for large teams.",
        a_hi: "Zustand: minimal (~1KB), no boilerplate. Redux Toolkit: structured, DevTools time-travel, middleware ecosystem. DX ke liye Zustand; large teams ke liye Redux.",
        code: `// Zustand with persist
// load { persist } @ 'zustand/middleware'
const useAuth = create(persist(
  (set) => ({
    user: null,
    login: async (cred) => {
      const user = await api.login(cred);
      set({ user });
    },
    logout: () => set({ user: null })
  }),
  { name: 'auth-storage' }
));

// Redux Toolkit
// load { createSlice, configureStore } @ '@reduxjs/toolkit'
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    loginSuccess: (state, action) => { state.user = action.payload; },
    logout: (state) => { state.user = null; }
  }
});`
      },
      {
        q: "How does React Query change state thinking?",
        a_en: "Treats server state separately. Handles caching, background refetch, stale-while-revalidate, pagination, optimistic updates, deduplication. Stop storing API responses in Redux.",
        a_hi: "Server state alag treat karta hai. Caching, background refetch, stale-while-revalidate, pagination, optimistic updates, deduplication handle karta hai. API responses Redux mein band.",
        code: `// load { useQuery, useMutation, useQueryClient } @ '@tanstack/react-query'
function Profile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) return <Spinner />;
  return <Card user={data} />;
}

// Mutation with optimistic update
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['user', userId]);
    const prev = queryClient.getQueryData(['user', userId]);
    queryClient.setQueryData(['user', userId], newData);
    return { prev };
  },
  onError: (err, _, ctx) => {
    queryClient.setQueryData(['user', userId], ctx.prev);
  }
});`
      },
      {
        q: "Client state vs server state?",
        a_en: "Server state: on server, async, can be stale (users list, products). Client state: local UI (modal, selected tab, form draft). Keep separate — React Query for server, useState for client.",
        a_hi: "Server state: server pe, async, stale ho sakti hai (users, products). Client state: local UI (modal, selected tab, form draft). Alag rakho — server ke liye React Query, client ke liye useState.",
        code: `function Dashboard() {
  // Server state
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  
  // Client state
  const [selectedTab, setSelectedTab] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);
  
  return (
    <>
      <Tabs value={selectedTab} onChange={setSelectedTab} />
      <List users={users} />
      {isModalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </>
  );
}`
      },
      {
        q: "Async operations in Redux?",
        a_en: "createAsyncThunk for pending/fulfilled/rejected actions. RTK Query auto-generates everything. Redux-Saga uses generators for complex flows. Most apps: RTK Query > manual thunks.",
        a_hi: "createAsyncThunk pending/fulfilled/rejected ke liye. RTK Query sab auto-generate karta hai. Redux-Saga complex flows ke liye generators use karta hai. Most apps: RTK Query > manual thunks.",
        code: `// load { createAsyncThunk, createSlice } @ '@reduxjs/toolkit'
const fetchUser = createAsyncThunk(
  'user/fetch',
  async (id) => {
    const res = await api.getUser(id);
    return res.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (s) => { s.loading = true; })
      .addCase(fetchUser.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      });
  }
});

dispatch(fetchUser(123));`
      },
    ],
  },

  {
    id: "react-routing", label: "Routing", icon: "🧭", color: "#85C1E9", section: "React",
    def_en: "Client-side routing enables SPA navigation without full page reloads. React Router v6 is the standard. Next.js has built-in routing.",
    def_hi: "Client-side routing SPA navigation enable karti hai bina full page reloads. React Router v6 standard hai. Next.js mein built-in routing.",
    questions: [
      {
        q: "React Router v6 vs v5?",
        a_en: "v6: Routes replaces Switch, Outlet for nested routes, useNavigate replaces useHistory, relative paths intuitive. Data Router (v6.4+) adds loader/action APIs.",
        a_hi: "v6: Routes ne Switch replace kiya, nested routes ke liye Outlet, useNavigate ne useHistory replace kiya, relative paths intuitive. Data Router (v6.4+) loader/action APIs.",
        code: `// load { Routes, Route, Outlet, Link, useNavigate } @ 'react-router-dom'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UserList />} />
          <Route path=":id" element={<UserDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <Outlet />
    </>
  );
}

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <h1>User {id}</h1>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}`
      },
      {
        q: "Route-level code splitting?",
        a_en: "React.lazy + Suspense per route. Dramatically reduces initial bundle. Use magic comments for named chunks. Preload on hover for critical routes.",
        a_hi: "React.lazy + Suspense per route. Initial bundle dramatically kam. Named chunks ke liye magic comments. Critical routes hover pe preload karo.",
        code: `// load { Suspense, lazy } @ 'react'
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

// Preload on hover
function NavLink({ to, loader, children }) {
  const preload = () => loader?.();
  return (
    <Link to={to} onMouseEnter={preload}>
      {children}
    </Link>
  );
}

<NavLink to="/dashboard" loader={() => import('./pages/Dashboard')}>
  Dashboard
</NavLink>`
      },
      {
        q: "How to protect authenticated routes?",
        a_en: "PrivateRoute checks auth, renders Outlet if OK, else Navigate to login with current path in state. For SSR (Next.js), handle in middleware to avoid layout flash.",
        a_hi: "PrivateRoute auth check karta hai, OK ho toh Outlet render, warna login pe Navigate current path state mein. SSR (Next.js) ke liye middleware mein handle karo flash avoid ke liye.",
        code: `function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <Spinner />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<PrivateRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Routes>

// Login redirects back
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const handleLogin = async (cred) => {
    await login(cred);
    navigate(from, { replace: true });
  };
}`
      },
      {
        q: "Hash vs browser history routing?",
        a_en: "Browser history: clean URLs, needs server config for index.html fallback. Hash routing: #/path, works on static hosts without config. Use browser history in production.",
        a_hi: "Browser history: clean URLs, server config chahiye index.html fallback ke liye. Hash routing: #/path, static hosts pe bina config ke kaam karta hai. Production mein browser history.",
        code: `// Browser history
// load { BrowserRouter } @ 'react-router-dom'
<BrowserRouter>
  <App />
</BrowserRouter>
// URLs: /users/123

// Hash routing
// load { HashRouter } @ 'react-router-dom'
<HashRouter>
  <App />
</HashRouter>
// URLs: /#/users/123

// Server config (nginx) for browser history
// location / {
//   try_files $uri /index.html;
// }

// Netlify _redirects file
// /*  /index.html  200`
      },
    ],
  },

  {
    id: "react-forms", label: "Forms", icon: "📝", color: "#F1948A", section: "React",
    def_en: "React forms can be controlled (state-driven) or uncontrolled (ref-based). Libraries like react-hook-form and Formik handle complexity, validation, and performance.",
    def_hi: "React forms controlled (state-driven) ya uncontrolled (ref-based) ho sakte hain. react-hook-form aur Formik complexity, validation, performance handle karte hain.",
    questions: [
      {
        q: "react-hook-form vs Formik?",
        a_en: "RHF: uncontrolled refs, minimal re-renders, ~9KB, great perf for large forms. Formik: controlled, more re-renders but explicit flow. RHF is modern preference.",
        a_hi: "RHF: uncontrolled refs, minimal re-renders, ~9KB, large forms mein great perf. Formik: controlled, more re-renders but explicit flow. Modern projects mein RHF preferred.",
        code: `// react-hook-form
// load { useForm } @ 'react-hook-form'
function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true, pattern: /\\S+@\\S+/ })} />
      {errors.email && <span>Invalid email</span>}
      
      <input {...register('password', { minLength: 8 })} type="password" />
      {errors.password && <span>Min 8 chars</span>}
      
      <button type="submit">Sign up</button>
    </form>
  );
}`
      },
      {
        q: "Form validation strategies?",
        a_en: "HTML5 native, manual handlers, schema libs (Zod, Yup) with RHF/Formik, server-side. Best UX: onBlur first, onChange after first error (error-driven validation).",
        a_hi: "HTML5 native, manual handlers, schema libs (Zod, Yup) RHF/Formik ke saath, server-side. Best UX: first touch pe onBlur, error ke baad onChange (error-driven).",
        code: `// load { z } @ 'zod'
// load { zodResolver } @ '@hookform/resolvers/zod'
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
  age: z.number().int().min(18, 'Must be adult')
});

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}

// Async server validation
const asyncEmailCheck = async (email) => {
  const taken = await api.checkEmail(email);
  return !taken || 'Email taken';
};

<input {...register('email', { validate: asyncEmailCheck })} />`
      },
      {
        q: "How to build dynamic forms?",
        a_en: "useFieldArray from RHF handles add/remove/reorder. Use stable keys (field.id, not index if reorderable). For nested forms, use dot-notation paths.",
        a_hi: "useFieldArray RHF se add/remove/reorder handle karta hai. Stable keys use karo (field.id, index nahi agar reorderable). Nested forms ke liye dot-notation paths.",
        code: `// load { useForm, useFieldArray } @ 'react-hook-form'
function InvoiceForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: { items: [{ name: '', qty: 1 }] }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(\`items.\${index}.name\`)} />
          <input {...register(\`items.\${index}.qty\`, { valueAsNumber: true })} />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', qty: 1 })}>
        Add
      </button>
    </form>
  );
}`
      },
      {
        q: "onChange vs onBlur validation?",
        a_en: "onChange: every keystroke — immediate feedback but noisy. onBlur: on exit — less intrusive initially. Best UX: onBlur for first touch, onChange after error.",
        a_hi: "onChange: har keystroke — immediate but noisy. onBlur: exit pe — less intrusive initially. Best UX: first touch pe onBlur, error ke baad onChange.",
        code: `const { register } = useForm({
  mode: 'onBlur',
  reValidateMode: 'onChange'
});

// Manual control
function Input() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  
  const validate = (v) => {
    if (!v) return 'Required';
    if (v.length < 3) return 'Min 3 chars';
    return '';
  };
  
  return (
    <>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (touched) setError(validate(e.target.value));
        }}
        onBlur={() => {
          setTouched(true);
          setError(validate(value));
        }}
      />
      {touched && error && <span>{error}</span>}
    </>
  );
}`
      },
    ],
  },

  {
    id: "react-testing", label: "Testing", icon: "🧪", color: "#A9DFBF", section: "React",
    def_en: "Testing Library philosophy: test behavior, not implementation. Query by accessible roles, labels, visible text. Tests should resemble user interactions.",
    def_hi: "Testing Library philosophy: behavior test karo, implementation nahi. Accessible roles, labels, visible text se query. Tests user interactions resemble karein.",
    questions: [
      {
        q: "Testing Library philosophy?",
        a_en: "Test behavior, not implementation. Query by getByRole, getByLabelText, visible text. Makes tests resilient to refactors and surfaces accessibility issues.",
        a_hi: "Behavior test karo, implementation nahi. getByRole, getByLabelText, visible text se query. Refactors pe resilient, accessibility issues naturally surface hoti hain.",
        code: `// load { render, screen } @ '@testing-library/react'
// load userEvent @ '@testing-library/user-event'
test('submit button works', async () => {
  render(<Form />);
  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(button);
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

test('fills email field', async () => {
  render(<Form />);
  const input = screen.getByLabelText(/email/i);
  await userEvent.type(input, 'raj@example.com');
  expect(input).toHaveValue('raj@example.com');
});

// Priority order:
// 1. getByRole
// 2. getByLabelText
// 3. getByPlaceholderText
// 4. getByText
// 5. getByTestId (last resort)`
      },
      {
        q: "Testing custom hooks?",
        a_en: "renderHook from @testing-library/react. Wrap state updates in act(). Pass wrapper for context. Test return values and side effects.",
        a_hi: "renderHook @testing-library/react se. state updates act() mein wrap. Context ke liye wrapper pass. Return values aur side effects test.",
        code: `// load { renderHook, act, waitFor } @ '@testing-library/react'
test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

// With context
test('useAuth works', () => {
  const wrapper = ({ children }) => (
    <AuthProvider initialUser={{ name: 'Raj' }}>
      {children}
    </AuthProvider>
  );
  
  const { result } = renderHook(() => useAuth(), { wrapper });
  expect(result.current.user.name).toBe('Raj');
});

// Async
test('useFetch returns data', async () => {
  const { result } = renderHook(() => useFetch('/api'));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});`
      },
      {
        q: "Unit vs integration vs E2E?",
        a_en: "Unit: single component with mocks, fast. Integration: feature with real children, mocked API. E2E: full flows in real browser. Favor integration (Testing Trophy).",
        a_hi: "Unit: single component with mocks, fast. Integration: feature with real children, mocked API. E2E: full flows real browser. Integration prefer karo (Testing Trophy).",
        code: `// Unit
test('Button renders', () => {
  render(<Button label="Click" />);
  expect(screen.getByRole('button')).toHaveTextContent('Click');
});

// Integration with msw
// load { setupServer } @ 'msw/node'
// load { rest } @ 'msw'
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'Raj' }]));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

test('UserList fetches users', async () => {
  render(<UserList />);
  await screen.findByText('Raj');
});

// E2E — Playwright
// load { test, expect } @ '@playwright/test'
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'raj@example.com');
  await page.fill('[name=password]', 'secret');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});`
      },
      {
        q: "How to mock API calls?",
        a_en: "msw intercepts at network level. Works in tests and dev. jest.fn() for unit mocks. Realistic response shapes catch serialization bugs.",
        a_hi: "msw network level pe intercept karta hai. Tests aur dev dono mein. Unit mocks ke liye jest.fn(). Realistic response shapes serialization bugs catch karte hain.",
        code: `// load { setupServer } @ 'msw/node'
// load { rest } @ 'msw'
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: Number(req.params.id), name: 'Raj' }));
  }),
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json({ id: 999, ...body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Override per-test
test('handles 500 error', async () => {
  server.use(
    rest.get('/api/users/:id', (req, res, ctx) => res(ctx.status(500)))
  );
  
  render(<UserDetail id={1} />);
  await screen.findByText(/error/i);
});`
      },
      {
        q: "Testing context components?",
        a_en: "Wrap with real provider. Create renderWithProviders utility. Avoid mocking context directly — real providers test integration.",
        a_hi: "Real provider se wrap karo. renderWithProviders utility banao. Context directly mock na karo — real providers integration test karte hain.",
        code: `function renderWithProviders(ui, options = {}) {
  const { initialTheme = 'light', initialUser = null, ...rest } = options;
  
  function Wrapper({ children }) {
    return (
      <ThemeProvider initialValue={initialTheme}>
        <AuthProvider initialUser={initialUser}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...rest });
}

test('shows user name when logged in', () => {
  renderWithProviders(<Header />, {
    initialUser: { name: 'Raj' }
  });
  expect(screen.getByText('Raj')).toBeInTheDocument();
});`
      },
      {
        q: "When to avoid snapshot tests?",
        a_en: "Avoid for large/changing components. Good for stable presentational leaves. Use inline snapshots for reviewability. Don't substitute for behavioral tests.",
        a_hi: "Large/changing components ke liye avoid. Stable presentational leaves ke liye good. Inline snapshots reviewability ke liye. Behavioral tests ka substitute mat banao.",
        code: `// ✓ Good — stable component
test('Button renders correctly', () => {
  const { container } = render(<Button label="Click" />);
  expect(container.firstChild).toMatchInlineSnapshot(\`
    <button class="btn-primary">Click</button>
  \`);
});

// ✗ Bad — complex, changes frequently
test('Dashboard snapshot', () => {
  const { container } = render(<Dashboard />);
  expect(container).toMatchSnapshot();
  // Huge, breaks on every small change
});

// ✓ Better — behavioral
test('Dashboard shows stats', () => {
  render(<Dashboard stats={{ users: 100 }} />);
  expect(screen.getByText('100 users')).toBeInTheDocument();
});`
      },
    ],
  },

  {
    id: "react-ts", label: "TypeScript", icon: "🔷", color: "#3B82F6", section: "React",
    def_en: "TypeScript adds static types to JavaScript. In React: catches prop mismatches, correct event types, better refactoring, documents component APIs.",
    def_hi: "TypeScript JavaScript mein static types add karta hai. React mein: prop mismatches catch, correct event types, better refactoring, component APIs document.",
    questions: [
      {
        q: "How to type React component props?",
        a_en: "interface or type with required/optional fields. Prefer explicit return type. Avoid React.FC. For polymorphic, use 'as' prop with generics. Extend HTMLAttributes to inherit.",
        a_hi: "interface ya type with required/optional fields. Explicit return type prefer karo. React.FC avoid karo. Polymorphic ke liye 'as' prop with generics. HTMLAttributes extend karo inherit ke liye.",
        code: `interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  children?: React.ReactNode;
}

function Button({ 
  label, onClick, variant = 'primary', disabled = false, children
}: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}{children}
    </button>
  );
}

// Extend HTML attrs
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, ...rest }: InputProps) {
  return (
    <>
      <label>{label}</label>
      <input {...rest} />
      {error && <span>{error}</span>}
    </>
  );
}`
      },
      {
        q: "How to type useRef correctly?",
        a_en: "DOM: useRef<HTMLInputElement>(null) — .current is T|null. Mutable: useRef<number>(0) — .current is T. Initial value type determines nullability.",
        a_hi: "DOM: useRef<HTMLInputElement>(null) — .current is T|null. Mutable: useRef<number>(0) — .current is T. Initial value type nullability decide karti hai.",
        code: `// DOM ref — nullable
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />

// Mutable — non-null
const countRef = useRef<number>(0);
countRef.current++;

// forwardRef
interface InputProps { placeholder: string; }

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ placeholder }, ref) {
    return <input ref={ref} placeholder={placeholder} />;
  }
);

const ref = useRef<HTMLInputElement>(null);
<Input ref={ref} placeholder="..." />`
      },
      {
        q: "When to use generics in components?",
        a_en: "When component works with typed data without hardcoding shape. Consumer gets full type safety on T. Common in: data grids, selects, autocomplete.",
        a_hi: "Jab component typed data ke saath kaam kare bina shape hardcode. Consumer ko T pe full type safety. Common: data grids, selects, autocomplete.",
        code: `interface ListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSelect?: (item: T) => void;
}

function List<T extends { id: string }>({
  items, renderItem, onSelect
}: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect?.(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

const users = [{ id: '1', name: 'Raj', age: 30 }];
<List
  items={users}
  renderItem={u => <>{u.name} ({u.age})</>}
  onSelect={u => console.log(u.name)}
/>`
      },
      {
        q: "What are discriminated unions?",
        a_en: "Literal type field narrows union. TypeScript narrows based on kind. Great for variant-specific props — prevents invalid combinations at compile time.",
        a_hi: "Literal type field union narrow karta hai. TypeScript kind ke hisaab se narrow karta hai. Variant-specific props ke liye great — invalid combinations compile time pe roke.",
        code: `type Toast =
  | { kind: 'success'; message: string }
  | { kind: 'error'; code: number; message: string }
  | { kind: 'info'; message: string; action?: () => void };

function showToast(toast: Toast) {
  switch (toast.kind) {
    case 'success':
      console.log(toast.message);
      break;
    case 'error':
      console.log(toast.code, toast.message);
      break;
    case 'info':
      toast.action?.();
      break;
  }
}

// Component variants
type ButtonProps =
  | { variant: 'link'; href: string; label: string }
  | { variant: 'submit'; onClick: () => void; label: string }
  | { variant: 'icon'; icon: IconName; onClick: () => void };

function Button(props: ButtonProps) {
  switch (props.variant) {
    case 'link': return <a href={props.href}>{props.label}</a>;
    case 'submit': return <button onClick={props.onClick}>{props.label}</button>;
    case 'icon': return <IconButton icon={props.icon} onClick={props.onClick} />;
  }
}`
      },
      {
        q: "How to type event handlers?",
        a_en: "Use synthetic event types: React.ChangeEvent<HTMLInputElement>, React.MouseEvent<HTMLButtonElement>. TypeScript infers target values from generic.",
        a_hi: "Synthetic event types: React.ChangeEvent<HTMLInputElement>, React.MouseEvent<HTMLButtonElement>. Generic se target values infer hoti hain.",
        code: `function Form() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value); // typed as string
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.name);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}`
      },
    ],
  },

  {
    id: "react-ssr", label: "SSR", icon: "🖥", color: "#E8DAEF", section: "React",
    def_en: "Server-side rendering (SSR), static generation (SSG), and incremental static regeneration (ISR) are techniques for rendering React on the server. Next.js is the leading framework.",
    def_hi: "SSR, SSG, aur ISR React ko server pe render karne ki techniques hain. Next.js leading framework hai.",
    questions: [
      {
        q: "SSR vs SSG vs ISR?",
        a_en: "SSR: HTML per-request, always fresh. SSG: HTML at build time, fastest via CDN. ISR: SSG with revalidation, serve stale, regenerate in background. Next.js supports all.",
        a_hi: "SSR: HTML per-request, always fresh. SSG: HTML build time pe, CDN se fastest. ISR: SSG with revalidation, stale serve, background regenerate. Next.js sab support karta hai.",
        code: `// Next.js Pages Router

// SSR
export async function getServerSideProps(context) {
  const data = await fetchLive();
  return { props: { data } };
}

// SSG
export async function getStaticProps() {
  const posts = await fetchPosts();
  return { props: { posts } };
}

// ISR
export async function getStaticProps() {
  const posts = await fetchPosts();
  return {
    props: { posts },
    revalidate: 60  // regenerate every 60s max
  };
}

// App Router (Next.js 13+)
async function Page() {
  const data = await fetch('...', {
    next: { revalidate: 60 }
  });
  return <div>{data.title}</div>;
}`
      },
      {
        q: "App Router vs Pages Router?",
        a_en: "App Router: React Server Components by default, nested layouts, streaming. Pages Router: getServerSideProps/getStaticProps, client components. App Router is the direction.",
        a_hi: "App Router: React Server Components default, nested layouts, streaming. Pages Router: getServerSideProps/getStaticProps, client components. App Router framework ka future.",
        code: `// Pages Router — pages/users/[id].js
export async function getServerSideProps({ params }) {
  const user = await fetchUser(params.id);
  return { props: { user } };
}
export default function UserPage({ user }) {
  return <div>{user.name}</div>;
}

// App Router — app/users/[id]/page.js
async function UserPage({ params }) {
  const user = await fetchUser(params.id);
  return <div>{user.name}</div>;
}
export default UserPage;

// Nested layouts
// app/layout.js
export default function RootLayout({ children }) {
  return <html><body><Nav />{children}</body></html>;
}

// app/users/layout.js
export default function UsersLayout({ children }) {
  return <><UserSidebar /><main>{children}</main></>;
}

// Loading UI
// app/users/[id]/loading.js
export default function Loading() { return <Spinner />; }`
      },
      {
        q: "How does hydration work and cause mismatches?",
        a_en: "Hydration attaches listeners to server HTML. Expects exact match. Mismatches: Date.now(), Math.random(), browser APIs, different CSS-in-JS classes. Fix: useEffect, useId.",
        a_hi: "Hydration server HTML pe listeners attach karta hai. Exact match expect. Mismatches: Date.now(), Math.random(), browser APIs, alag CSS classes. Fix: useEffect, useId.",
        code: `// ✗ Mismatch
function Bad() {
  const id = Math.random().toString(36);  // different on server vs client!
  return <div id={id}>Content</div>;
}

// ✓ Stable
function Good() {
  const id = useId();
  return <div id={id}>Content</div>;
}

// ✗ Browser API in render
function Bad2() {
  const width = window.innerWidth;  // undefined on server!
  return <div>Width: {width}</div>;
}

// ✓ Defer to effect
function Good2() {
  const [width, setWidth] = useState(0);
  useEffect(() => { setWidth(window.innerWidth); }, []);
  return <div>Width: {width}</div>;
}

// Client-only
// load dynamic @ 'next/dynamic'
const ClientClock = dynamic(() => import('./Clock'), { ssr: false });`
      },
      {
        q: "Server Actions in Next.js?",
        a_en: "Async functions marked 'use server' run on server, callable from client. Direct DB mutations without API routes. Progressive enhancement. revalidatePath refreshes cached data.",
        a_hi: "Async functions 'use server' marked server pe run, client se callable. Direct DB mutations bina API routes. Progressive enhancement. revalidatePath cached data refresh.",
        code: `// app/actions.ts
'use server';
// load { revalidatePath } @ 'next/cache'
export async function createPost(formData) {
  const title = formData.get('title');
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}

// Use in Server Component
// load { createPost } @ './actions'
export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}

// With pending state
'use client';
// load { useFormStatus } @ 'react-dom'
function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Create'}</button>;
}`
      },
      {
        q: "Auth in Next.js?",
        a_en: "Auth.js (NextAuth) supports OAuth, credentials, magic links. middleware.ts intercepts before render. Server Components: getServerSession. Client: useSession. httpOnly cookies for tokens.",
        a_hi: "Auth.js (NextAuth): OAuth, credentials, magic links. middleware.ts render se pehle intercept. Server Components: getServerSession. Client: useSession. Tokens ke liye httpOnly cookies.",
        code: `// app/api/auth/[...nextauth]/route.ts
// load NextAuth @ 'next-auth'
// load Google @ 'next-auth/providers/google'
const handler = NextAuth({
  providers: [
    Google({ clientId: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET })
  ]
});

export { handler as GET, handler as POST };

// middleware.ts
// load { withAuth } @ 'next-auth/middleware'
export default withAuth({
  callbacks: { authorized: ({ token }) => !!token }
});

export const config = {
  matcher: ['/dashboard/:path*']
};

// Server Component
// load { getServerSession } @ 'next-auth'
async function Page() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return <div>Welcome {session.user.name}</div>;
}`
      },
    ],
  },

  {
    id: "react-a11y", label: "Accessibility", icon: "♿", color: "#FAD7A0", section: "React",
    def_en: "Accessibility ensures your app is usable by people with disabilities. Semantic HTML, ARIA attributes, keyboard navigation, and focus management are foundational.",
    def_hi: "Accessibility ensure karti hai app disabled logon ke liye usable ho. Semantic HTML, ARIA attributes, keyboard navigation, focus management foundational hain.",
    questions: [
      {
        q: "When to use ARIA attributes?",
        a_en: "When native HTML is insufficient. aria-label for icon buttons, aria-expanded for accordions, aria-live for updates, role for custom. Prefer native HTML first — <button> over <div role='button'>.",
        a_hi: "Jab native HTML insufficient ho. aria-label icon buttons ke liye, aria-expanded accordions, aria-live updates ke liye. Native HTML pehle prefer karo — <button> <div role='button'> se behtar.",
        code: `// Icon button needs label
<button aria-label="Delete item">
  <Icon name="delete" />
</button>

// Accordion
<button
  aria-expanded={isOpen}
  aria-controls={panelId}
  onClick={() => setOpen(!isOpen)}
>
  Toggle
</button>
<div id={panelId} role="region" hidden={!isOpen}>
  Content
</div>

// Live region
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>

// ✗ div as button
<div onClick={handleClick}>Click</div>

// ✓ Native button
<button onClick={handleClick}>Click</button>

// Only if really needed
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
>
  Click
</div>`
      },
      {
        q: "How to manage focus for accessibility?",
        a_en: "Modal open: focus first focusable inside. Close: return to trigger. Route change: focus heading. Use refs + .focus() in useEffect. focus-trap-react for complex cases.",
        a_hi: "Modal open: first focusable pe focus. Close: trigger pe wapas. Route change: heading pe focus. Refs + useEffect mein .focus(). Complex ke liye focus-trap-react.",
        code: `function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  const triggerRef = useRef(document.activeElement);
  
  useEffect(() => {
    if (isOpen) {
      const focusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      
      return () => triggerRef.current?.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {children}
    </div>,
    document.body
  );
}

// Focus trap library
// load FocusTrap @ 'focus-trap-react'
<FocusTrap><Modal /></FocusTrap>`
      },
      {
        q: "How to integrate a11y testing?",
        a_en: "@axe-core/react logs violations in dev. jest-axe: expect(await axe(container)).toHaveNoViolations(). Catches ~30-40% of WCAG issues. Complement with keyboard and screen reader testing.",
        a_hi: "@axe-core/react dev mein violations log karta hai. jest-axe: expect(await axe(container)).toHaveNoViolations(). ~30-40% WCAG issues catch. Keyboard aur screen reader testing se complement.",
        code: `// Dev-time
if (process.env.NODE_ENV !== 'production') {
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

// Jest
// load { axe, toHaveNoViolations } @ 'jest-axe'
expect.extend(toHaveNoViolations);

test('no a11y violations', async () => {
  const { container } = render(<Button label="Click" />);
  expect(await axe(container)).toHaveNoViolations();
});

// Playwright
// load AxeBuilder @ '@axe-core/playwright'
test('homepage a11y', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});`
      },
      {
        q: "How to make accessible combobox?",
        a_en: "Needs: role=combobox, aria-expanded, aria-controls, aria-activedescendant, role=listbox/option, keyboard handling. Use Radix UI/Headless UI to avoid reinventing.",
        a_hi: "Chahiye: role=combobox, aria-expanded, aria-controls, aria-activedescendant, role=listbox/option, keyboard handling. Radix UI/Headless UI use karo re-invent se bachne ke liye.",
        code: `function Combobox({ options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const listId = useId();
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIdx(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        select(options[activeIdx]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div>
      <input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? \`opt-\${activeIdx}\` : undefined}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul id={listId} role="listbox">
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={\`opt-\${i}\`}
              role="option"
              aria-selected={i === activeIdx}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Better — use Radix
// import * as Select @ '@radix-ui/react-select';`
      },
    ],
  },

  {
    id: "react-advanced", label: "Advanced", icon: "🧠", color: "#EC407A", section: "React",
    def_en: "Advanced React: micro-frontends, design systems, real-time data, security, custom renderers, and architectural patterns that senior engineers must understand.",
    def_hi: "Advanced React: micro-frontends, design systems, real-time data, security, custom renderers, aur architectural patterns jo senior engineers ko samajhne zaroori hain.",
    questions: [
      {
        q: "Micro-frontends with React?",
        a_en: "Module Federation (Webpack 5) shares components across separately deployed apps. Challenges: singleton React, routing ownership, CSS isolation, cross-MFE communication.",
        a_hi: "Module Federation (Webpack 5) separately deployed apps mein components share karta hai. Challenges: singleton React, routing ownership, CSS isolation, cross-MFE communication.",
        code: `// Remote webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'productsApp',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/ProductList'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// Host
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        productsApp: 'productsApp@https://products.example.com/remoteEntry.js'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};

// Cross-MFE communication
// 1. Custom events
window.dispatchEvent(new CustomEvent('cart:add', { detail: product }));

// 2. Shared Zustand store across MFEs`
      },
      {
        q: "How to build a design system?",
        a_en: "Design tokens (CSS vars), primitives (Button, Input), composites (Card, Modal). Tooling: Storybook, Chromatic, Turborepo. Requirements: TS, a11y built-in, theming, semver.",
        a_hi: "Design tokens (CSS vars), primitives (Button, Input), composites (Card, Modal). Tooling: Storybook, Chromatic, Turborepo. TS, a11y built-in, theming, semver zaroori hain.",
        code: `// tokens.css
:root {
  --color-primary: #0066ff;
  --space-md: 16px;
  --radius-md: 8px;
}

// Button primitive
// load { forwardRef } @ 'react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', loading, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={'btn btn--' + variant}
        disabled={loading || rest.disabled}
        {...rest}
      >
        {loading ? <Spinner /> : children}
      </button>
    );
  }
);

// Storybook story
export default { component: Button };
export const Primary = { args: { children: 'Click' } };
export const Loading = { args: { children: 'Submit', loading: true } };

// package.json
{
  "name": "@acme/ui",
  "version": "1.2.0",
  "types": "./dist/index.d.ts"
}`
      },
      {
        q: "Real-time data in React?",
        a_en: "WebSocket: useEffect opens/closes. SSE (EventSource) for one-way. React Query polling + optimistic. For high-frequency, buffer in ref + rAF to batch DOM writes.",
        a_hi: "WebSocket: useEffect khole/band kare. SSE (EventSource) one-way ke liye. React Query polling + optimistic. High-frequency ke liye ref mein buffer + rAF se DOM writes batch.",
        code: `function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef();
  
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };
    
    return () => ws.close();
  }, [url]);
  
  const send = useCallback((data) => {
    wsRef.current?.send(JSON.stringify(data));
  }, []);
  
  return { messages, send };
}

// SSE
function useEventSource(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = (e) => setData(JSON.parse(e.data));
    return () => es.close();
  }, [url]);
  
  return data;
}

// Buffer with rAF
function useBufferedUpdates() {
  const [items, setItems] = useState([]);
  const buffer = useRef([]);
  const rafId = useRef();
  
  const add = (item) => {
    buffer.current.push(item);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        setItems(prev => [...prev, ...buffer.current]);
        buffer.current = [];
        rafId.current = null;
      });
    }
  };
  
  return { items, add };
}`
      },
      {
        q: "Security considerations?",
        a_en: "XSS: dangerouslySetInnerHTML is main risk — sanitize with DOMPurify. JSX auto-escaped. CSRF: SameSite cookies + tokens. Secrets never in client. Validate server-side.",
        a_hi: "XSS: dangerouslySetInnerHTML main risk — DOMPurify se sanitize. JSX auto-escaped. CSRF: SameSite cookies + tokens. Secrets client code mein kabhi nahi. Server-side validation.",
        code: `// XSS risk
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Safe with DOMPurify
// load DOMPurify @ 'dompurify'
function Safe({ userComment }) {
  const clean = DOMPurify.sanitize(userComment, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// CSRF
fetch('/api/transfer', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': getCsrfToken() },
  body: JSON.stringify({ amount: 100 })
});

// ✗ Never
const API_KEY = 'secret';  // visible in bundle!

// ✓ Backend proxy
// Client → Your Backend → Third-party API

// URL validation
function SafeLink({ href, children }) {
  const safe = href.startsWith('http://') || href.startsWith('https://');
  if (!safe) return <span>{children}</span>;
  return <a href={href} rel="noopener noreferrer">{children}</a>;
}`
      },
      {
        q: "Explain React's event delegation model.",
        a_en: "React attaches ONE listener at root container. Events bubble to root; React dispatches to fiber. React 17+ attaches to root, older to document. e.stopPropagation() in React handler won't stop native listeners outside React.",
        a_hi: "React root container pe EK listener attach karta hai. Events root tak bubble hote hain; React fiber ko dispatch karta hai. React 17+ root pe attach, older document pe. React handler mein e.stopPropagation() React ke bahar ke native listeners nahi rokta.",
        code: `// Single real listener at root
function App() {
  return (
    <div>
      {/* All these share ONE native listener */}
      <button onClick={() => console.log('1')}>A</button>
      <button onClick={() => console.log('2')}>B</button>
      <button onClick={() => console.log('3')}>C</button>
    </div>
  );
}

// Capture and bubble phases
<div onClickCapture={handleCapture}>
  <button onClick={handleBubble}>Click</button>
</div>

// Mixing with native listeners — gotcha!
function MyComp() {
  useEffect(() => {
    const nativeHandler = (e) => console.log('native');
    document.addEventListener('click', nativeHandler);
    return () => document.removeEventListener('click', nativeHandler);
  }, []);
  
  const handleClick = (e) => {
    e.stopPropagation();
    // Won't stop nativeHandler — different delegation tree!
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// Use nativeEvent.stopImmediatePropagation() if needed
const handleClick = (e) => {
  e.nativeEvent.stopImmediatePropagation();
};`
      },
      {
        q: "How to implement feature flags?",
        a_en: "Provider reads flags from service (LaunchDarkly, Statsig) or env. Exposes useFlag(). Components gate: if(!flag) return null. SSR middleware prevents shipping flagged code to client.",
        a_hi: "Provider flags service (LaunchDarkly, Statsig) ya env se read karta hai. useFlag() expose karta hai. Components gate: if(!flag) return null. SSR middleware client pe flagged code nahi bhejta.",
        code: `// Flag context
const FlagContext = createContext({});

function FlagProvider({ children }) {
  const [flags, setFlags] = useState({});
  
  useEffect(() => {
    fetchFlags(user).then(setFlags);
  }, [user]);
  
  return (
    <FlagContext.Provider value={flags}>
      {children}
    </FlagContext.Provider>
  );
}

function useFlag(name) {
  const flags = useContext(FlagContext);
  return flags[name] ?? false;
}

// Usage
function Checkout() {
  const newFlow = useFlag('checkout_v2');
  return newFlow ? <CheckoutV2 /> : <CheckoutV1 />;
}

// Type-safe flags
type FlagName = 'checkout_v2' | 'dark_mode' | 'beta_features';

function useFlag(name: FlagName): boolean {
  // ...
}

// Next.js middleware for server-side gating
export function middleware(request) {
  const user = getUser(request);
  const flags = getFlagsFor(user);
  
  if (request.nextUrl.pathname.startsWith('/beta') && !flags.beta_features) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}`
      },
      {
        q: "What is React's reconciler?",
        a_en: "react-reconciler is React's diffing engine decoupled from host environment. Custom renderers implement host config callbacks to target non-DOM: React Native, react-three-fiber, react-pdf.",
        a_hi: "react-reconciler React ka diffing engine hai host environment se decoupled. Custom renderers host config callbacks implement karte hain non-DOM target karne ke liye: React Native, react-three-fiber, react-pdf.",
        code: `// Simplified custom renderer concept
// load Reconciler @ 'react-reconciler'
const hostConfig = {
  createInstance(type, props) {
    // Create your platform's element
    return { type, props, children: [] };
  },
  createTextInstance(text) {
    return { type: 'TEXT', text };
  },
  appendChild(parent, child) {
    parent.children.push(child);
  },
  removeChild(parent, child) {
    parent.children = parent.children.filter(c => c !== child);
  },
  commitUpdate(instance, updatePayload) {
    // Apply prop changes
  },
  // ...many more callbacks
};

const reconciler = Reconciler(hostConfig);

// Use your renderer
const MyRenderer = {
  render(element, container) {
    const root = reconciler.createContainer(container);
    reconciler.updateContainer(element, root);
  }
};

// Examples of custom renderers:
// - React Native (native mobile views)
// - react-three-fiber (Three.js scenes)
// - react-pdf (PDF documents)
// - Ink (CLI apps)
// - react-figma (Figma plugins)`
      },
    ],
  },
];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.questions.length, 0);
const JS_CATS = CATEGORIES.filter(c => c.section === "JavaScript");
const REACT_CATS = CATEGORIES.filter(c => c.section === "React");

const TabRow = ({ cats, label, labelColor, activeCat, reviewed, switchCat }) => (
  <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #111120" }}>
    <div style={{
      writingMode: "vertical-rl", textOrientation: "mixed",
      fontFamily: "monospace", fontSize: 8, letterSpacing: 3,
      color: labelColor, textTransform: "uppercase",
      padding: "6px 6px 6px 8px",
      borderRight: `1px solid ${labelColor}22`,
      background: `${labelColor}08`,
      display: "flex", alignItems: "center",
    }}>{label}</div>
    <div style={{ display: "flex", overflowX: "auto", flex: 1 }}>
      {cats.map(c => {
        const isActive = activeCat === c.id;
        const done = c.questions.filter((_, i) => reviewed[`${c.id}-${i}`]).length;
        return (
          <button key={c.id} onClick={() => switchCat(c.id)} style={{
            background: "none", border: "none",
            borderBottom: isActive ? `2px solid ${c.color}` : "2px solid transparent",
            padding: "8px 10px 6px",
            cursor: "pointer", color: isActive ? c.color : "#3a3a5a",
            fontFamily: "monospace", fontSize: 9, letterSpacing: 1,
            textTransform: "uppercase", whiteSpace: "nowrap",
            transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            marginBottom: -1,
          }}>
            <span style={{ fontSize: 13 }}>{c.icon}</span>
            <span>{c.label}</span>
            <span style={{
              fontSize: 8,
              color: done === c.questions.length && done > 0 ? c.color : "#222240",
            }}>{done}/{c.questions.length}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default function App() {
  const [activeCat, setActiveCat] = useState("js-core");
  const [openIdx, setOpenIdx] = useState(null);
  const [search, setSearch] = useState("");
  const [reviewed, setReviewed] = useState({});
  const [lang, setLang] = useState("both");

  const cat = CATEGORIES.find(c => c.id === activeCat);
  const accent = cat.color;
  const reviewedCount = Object.keys(reviewed).length;

  const filtered = useMemo(() => {
    if (!search.trim()) return cat.questions;
    const q = search.toLowerCase();
    return cat.questions.filter(item =>
      item.q.toLowerCase().includes(q) ||
      (item.a_en && item.a_en.toLowerCase().includes(q)) ||
      (item.a_hi && item.a_hi.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q))
    );
  }, [search, cat]);

  const switchCat = (id) => { setActiveCat(id); setOpenIdx(null); setSearch(""); };
  const toggleReviewed = (key, e) => {
    e.stopPropagation();
    setReviewed(p => { const n = { ...p }; n[key] ? delete n[key] : (n[key] = true); return n; });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070f",
      color: "#d8d4cc",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <div style={{
        background: "linear-gradient(180deg, #0c0c1e 0%, #07070f 100%)",
        padding: "28px 24px 22px",
        borderBottom: "1px solid #111120",
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 4, color: accent, textTransform: "uppercase", marginBottom: 8, transition: "color 0.3s" }}>
                Interview Prep · Bilingual
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 34px)", fontWeight: 400, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                JavaScript + React<br />
                <span style={{ color: accent, transition: "color 0.3s" }}>EN + Hinglish</span>
              </h1>
              <p style={{ margin: "8px 0 0", color: "#444", fontSize: 12, lineHeight: 1.6 }}>
                {TOTAL} questions · {CATEGORIES.length} topics · Code examples
              </p>
            </div>
            <div style={{
              background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12,
              padding: "12px 16px", textAlign: "center", minWidth: 100,
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1, transition: "color 0.3s" }}>
                {reviewedCount}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "#333", marginTop: 4, letterSpacing: 1 }}>/ {TOTAL} DONE</div>
              <div style={{ marginTop: 6, height: 3, background: "#1a1a30", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(reviewedCount / TOTAL) * 100}%`, background: accent, borderRadius: 99, transition: "width 0.4s, background 0.3s" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 4, background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 8, padding: 3, width: "fit-content" }}>
            {[
              { id: "en", label: "🇬🇧 EN" },
              { id: "hi", label: "🇮🇳 HI" },
              { id: "both", label: "BOTH" },
            ].map(opt => (
              <button key={opt.id} onClick={() => setLang(opt.id)} style={{
                background: lang === opt.id ? accent + "22" : "transparent",
                border: "none", borderRadius: 6, padding: "6px 14px",
                color: lang === opt.id ? accent : "#555",
                fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, position: "relative", maxWidth: 480 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: 13 }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setOpenIdx(null); }}
              placeholder={`Search "${cat.label}"...`}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#0c0c1a", border: "1px solid #1a1a2e",
                borderRadius: 8, padding: "9px 12px 9px 34px",
                color: "#ccc", fontFamily: "monospace", fontSize: 12, outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: "#07070f", position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid #111120", padding: "0 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <TabRow cats={JS_CATS} label="JS" labelColor="#F7DF1E" activeCat={activeCat} reviewed={reviewed} switchCat={switchCat} />
          <TabRow cats={REACT_CATS} label="REACT" labelColor="#61DAFB" activeCat={activeCat} reviewed={reviewed} switchCat={switchCat} />
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{
            fontFamily: "monospace", fontSize: 8, letterSpacing: 3,
            padding: "3px 10px", borderRadius: 99, textTransform: "uppercase",
            background: cat.section === "JavaScript" ? "#F7DF1E12" : "#61DAFB12",
            color: cat.section === "JavaScript" ? "#F7DF1E" : "#61DAFB",
            border: `1px solid ${cat.section === "JavaScript" ? "#F7DF1E22" : "#61DAFB22"}`,
          }}>{cat.section}</span>
          <span style={{ color: "#222240", fontFamily: "monospace", fontSize: 10 }}>›</span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: accent, letterSpacing: 2, textTransform: "uppercase", transition: "color 0.3s" }}>
            {cat.icon} {cat.label}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 8, color: "#222240", marginLeft: "auto" }}>
            {cat.questions.length} Q
          </span>
        </div>

        {!search && (
          <div style={{ marginBottom: 18 }}>
            {(lang === "en" || lang === "both") && cat.def_en && (
              <div style={{
                padding: "14px 18px", borderRadius: 10,
                background: `${accent}08`, border: `1px solid ${accent}22`,
                position: "relative", marginBottom: lang === "both" ? 8 : 0,
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent, borderRadius: "10px 0 0 10px", transition: "background 0.3s" }} />
                <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: 3, color: accent, textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s" }}>
                  🇬🇧 Definition · English
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#9e9a92" }}>
                  {cat.def_en}
                </p>
              </div>
            )}
            {(lang === "hi" || lang === "both") && cat.def_hi && (
              <div style={{
                padding: "14px 18px", borderRadius: 10,
                background: `${accent}08`, border: `1px solid ${accent}22`,
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent, borderRadius: "10px 0 0 10px", transition: "background 0.3s" }} />
                <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: 3, color: accent, textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s" }}>
                  🇮🇳 Definition · Hinglish
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#9e9a92" }}>
                  {cat.def_hi}
                </p>
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#333", padding: "60px 0", fontFamily: "monospace", fontSize: 13 }}>
            No questions match "{search}"
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {filtered.map((item, i) => {
            const realIdx = cat.questions.indexOf(item);
            const key = `${activeCat}-${realIdx}`;
            const isOpen = openIdx === i;
            const isDone = !!reviewed[key];

            return (
              <div key={key} style={{
                border: `1px solid ${isOpen ? accent + "55" : isDone ? "#1a2e1a" : "#111120"}`,
                borderRadius: 10, overflow: "hidden",
                background: isOpen ? `${accent}07` : isDone ? "#090f09" : "transparent",
                transition: "all 0.2s",
              }}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "14px 16px", cursor: "pointer",
                    textAlign: "left", display: "flex", alignItems: "center",
                    gap: 12, color: "#d8d4cc", fontFamily: "inherit",
                  }}
                >
                  <span style={{
                    fontFamily: "monospace", fontSize: 9, fontWeight: 700,
                    color: isDone ? "#4CAF50" : isOpen ? accent : "#222240",
                    minWidth: 26, transition: "color 0.2s",
                  }}>
                    {isDone ? "✓" : `Q${String(realIdx + 1).padStart(2, "0")}`}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 13.5, lineHeight: 1.5,
                    color: isDone ? "#5a8a5a" : isOpen ? "#eee" : "#aaa8a2",
                    transition: "color 0.2s",
                  }}>{item.q}</span>
                  <span style={{
                    fontSize: 16, color: isOpen ? accent : "#222240",
                    transform: isOpen ? "rotate(45deg)" : "none",
                    transition: "all 0.2s", flexShrink: 0,
                  }}>+</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 16px 16px 54px", borderTop: `1px solid ${accent}18` }}>
                    {(lang === "en" || lang === "both") && item.a_en && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          🇬🇧 English
                        </div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#8e8a82" }}>
                          {item.a_en}
                        </p>
                      </div>
                    )}
                    {(lang === "hi" || lang === "both") && item.a_hi && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          🇮🇳 Hinglish
                        </div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#8e8a82" }}>
                          {item.a_hi}
                        </p>
                      </div>
                    )}
                    {item.code && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          💻 Example
                        </div>
                        <pre style={{
                          background: "#050510",
                          border: "1px solid #1a1a2e",
                          borderRadius: 8,
                          padding: "14px 16px",
                          margin: 0,
                          fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace",
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: "#c9d1d9",
                          overflowX: "auto",
                          whiteSpace: "pre",
                        }}>
                          <code>{item.code}</code>
                        </pre>
                      </div>
                    )}
                    <button
                      onClick={e => toggleReviewed(key, e)}
                      style={{
                        marginTop: 14,
                        background: isDone ? "#162016" : "#0e160e",
                        border: `1px solid ${isDone ? "#4CAF5055" : "#1a2a1a"}`,
                        borderRadius: 6, padding: "5px 14px",
                        cursor: "pointer", color: isDone ? "#4CAF50" : "#3a5a3a",
                        fontSize: 10, fontFamily: "monospace", letterSpacing: 1.5,
                        transition: "all 0.2s",
                      }}
                    >
                      {isDone ? "✓ REVIEWED" : "MARK REVIEWED"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 36, padding: "14px 18px",
          border: "1px dashed #111120", borderRadius: 10,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ margin: 0, color: "#444", fontSize: 12, lineHeight: 1.7 }}>
            <strong style={{ color: "#666" }}>Tip:</strong>{" "}
            Language toggle top pe — EN, HI, ya BOTH. Code examples browser console mein try karo.
            Note: code mein "from" ki jagah "@" use hua hai parser issues avoid karne ke liye.
          </p>
        </div>
      </div>
    </div>
  );
}