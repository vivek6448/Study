import { useState, useMemo, useEffect, useRef } from "react";
import CodingSection from "./CodingSection";
import { NODE_THEORY_CATEGORIES } from "./nodeTheory";

const STUDY_PROGRESS_KEY = "studyProgress";

// Reads + validates the saved progress blob; falls back to defaults on missing/corrupt data.
function loadStudyProgress() {
  try {
    const stored = localStorage.getItem(STUDY_PROGRESS_KEY);
    if (!stored) return { completedTasks: [], lastVisited: null, currentTopic: null };
    const parsed = JSON.parse(stored);
    return {
      completedTasks: Array.isArray(parsed?.completedTasks) ? parsed.completedTasks : [],
      lastVisited: parsed?.lastVisited ?? null,
      currentTopic: typeof parsed?.currentTopic === "string" ? parsed.currentTopic : null,
    };
  } catch {
    return { completedTasks: [], lastVisited: null, currentTopic: null };
  }
}

function loadReviewed() {
  const { completedTasks } = loadStudyProgress();
  const reviewed = {};
  completedTasks.forEach(id => { reviewed[id] = true; });
  return reviewed;
}

function loadLastCategory(fallback) {
  const { currentTopic } = loadStudyProgress();
  return currentTopic && CATEGORIES.some(c => c.id === currentTopic) ? currentTopic : fallback;
}



const CATEGORIES_BASE = [
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
        a_en: "tag`text ${expr}` calls tag(strings, ...values). Tag function processes or sanitizes. Used by styled-components, gql, sql (injection prevention), i18n.",
        a_hi: "tag`text ${expr}` tag(strings, ...values) ko call karta hai. Tag function output process karta hai. styled-components, gql, sql injection prevention, i18n mein use hota hai.",
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
      {
        q: "What is WeakMap, and why use it over a regular Map for a cache?",
        a_en: "A regular Map holds a strong reference to its keys — even if nothing else references an object, the Map keeps it alive forever, a memory leak if used as a cache keyed by objects that come and go. WeakMap keys must be objects and are held weakly — once nothing else references that object, the GC can collect it, and its cache entry silently disappears too. Tradeoff: not iterable, no .size.",
        a_hi: "Regular Map apni keys ko strong reference se hold karta hai — object kahin aur use na ho tab bhi Map use zinda rakhta hai, cache ke liye memory leak. WeakMap keys object honi chahiye aur weakly hold hoti hain — object discard hote hi GC collect kar leta hai, cache entry bhi gayab. Tradeoff: iterable nahi, .size nahi.",
        code: `const cache = new WeakMap();
function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = expensiveOp(obj);
  cache.set(obj, result);
  return result;
}
// If obj is discarded everywhere else, its cache entry is GC'd automatically`
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
      {
        q: "requestIdleCallback vs requestAnimationFrame — different tools for what?",
        a_en: "rAF runs right before the next repaint, at a predictable moment tied to refresh rate — correct for anything visual that must stay in sync with the screen (animations, layout reads). requestIdleCallback runs only when the browser genuinely has spare time left in a frame after higher-priority work — correct for non-urgent background work (analytics batching, cache pre-warming) that should never compete with anything the user can feel.",
        a_hi: "rAF next repaint se theek pehle chalta hai, refresh rate se sync predictable moment pe — visual cheezon (animations) ke liye sahi. requestIdleCallback tabhi chalta hai jab browser ke paas genuinely spare time bache — non-urgent background kaam (analytics, cache warm) ke liye sahi, jo user ko feel na ho.",
        code: `requestAnimationFrame(() => {
  el.style.transform = \`translateX(\${pos}px)\`; // synced with repaint
});

requestIdleCallback(() => {
  sendAnalyticsBatch(); // only runs when the browser is genuinely idle
}, { timeout: 2000 });`
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

  // ═════════════════════ REACT ═════════════════════
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
      {
        q: "What is forwardRef, and when do you actually need it?",
        a_en: "By default, the ref prop isn't passed through to a function component like a normal prop — React reserves it internally. forwardRef explicitly opts a component into receiving a ref and forwarding it to a specific inner element, which matters whenever you build a reusable wrapper (a custom Input/Button) and consumers need to call .focus() on it directly, the same way they could on a plain <input>.",
        a_hi: "Default mein, ref prop function component ko normal prop ki tarah nahi milta — React use internally reserve karta hai. forwardRef component ko explicitly ref receive karne aur forward karne deta hai — jab reusable wrapper (custom Input) banao aur consumers ko .focus() directly call karna ho.",
        code: `const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
// now <Input ref={myRef} /> actually reaches the real DOM node
myRef.current.focus();`
      },
      {
        q: "What are Portals, and what problem do they solve?",
        a_en: "createPortal(children, domNode) renders a component's output into a DOM node outside its parent's actual DOM hierarchy — while staying inside the normal React tree for context, event bubbling, and state. This solves the modal/tooltip clipping problem: an ancestor's overflow:hidden or z-index can't clip a modal rendered at document.body, even though its state and handlers behave exactly as if rendered in place.",
        a_hi: "createPortal(children, domNode) component ka output ek DOM node mein render karta hai jo parent ki actual DOM hierarchy se bahar hai — par React tree (context, event bubbling, state) ke andar hi rehta hai. Isse modal/tooltip clipping problem solve hoti hai — ancestor ka overflow:hidden document.body pe render hue modal ko clip nahi kar sakta.",
        code: `function Modal({ children }) {
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.body
  );
}
// Modal escapes any ancestor's overflow:hidden/z-index stacking issues`
      },
      {
        q: "What is useSyncExternalStore for?",
        a_en: "The correct, low-level way to subscribe a component to state living outside React (a browser API, or a third-party store like Zustand/Redux under the hood) without tearing — every component reading that store during the same render sees a consistent snapshot, even under React 18's interruptible concurrent rendering. Most app code never calls it directly since state libraries already use it internally.",
        a_hi: "Ye ek component ko React ke bahar ke state (browser API, ya Zustand/Redux jaisa store) se subscribe karne ka correct tareeka hai bina tearing ke — same render mein har component consistent snapshot dekhta hai, concurrent rendering mein bhi. Zyaadatar app code isse directly call nahi karta, state libraries internally use karti hain.",
        code: `function useWindowWidth() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth
  );
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
      {
        q: "React 19: what do useActionState and useOptimistic do?",
        a_en: "useActionState(action, initialState) wires a form directly to an async action and gives back the latest returned state, a wrapped action for <form action={...}>, and an isPending flag — collapsing manual loading/error juggling. useOptimistic(state, updateFn) shows a provisional value immediately while the real async action is in flight, then reconciles back automatically once it resolves — no manual snapshot/rollback needed.",
        a_hi: "useActionState(action, initialState) form ko directly async action se jodta hai aur latest state, wrapped action, aur isPending flag deta hai — manual loading/error juggling khatam. useOptimistic(state, updateFn) turant provisional value dikhata hai jab tak real async action chal raha ho, resolve hone pe khud reconcile ho jaata hai.",
        code: `function AddComment({ addCommentAction }) {
  const [state, formAction, isPending] = useActionState(addCommentAction, null);
  return <form action={formAction}>
    <input name="text" />
    <button disabled={isPending}>{isPending ? "Posting..." : "Post"}</button>
  </form>;
}

function CommentList({ comments, addComment }) {
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments, (state, newComment) => [...state, newComment]
  );
}`
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

  {
    id: "css-core", label: "Box, Flex & Grid", icon: "📦", color: "#2965F1", section: "CSS",
    def_en: "CSS controls layout, color, and typography, kept deliberately separate from HTML's structure. The box model, Flexbox, and Grid are the three layout engines every modern UI is built on.",
    def_hi: "CSS layout, color, aur typography control karta hai — HTML ki structure se alag rakha jaata hai. Box model, Flexbox, aur Grid teen layout engines hain jin pe har modern UI banti hai.",
    questions: [
      {
        q: "Explain the CSS Box Model.",
        a_en: "Every element is a box: content → padding → border → margin, from inside out. Default box-sizing: content-box means width only sets the content area, so padding/border add on top. Most resets switch to border-box so width includes padding+border.",
        a_hi: "Har element ek box hai: content → padding → border → margin, andar se baahar. Default box-sizing: content-box mein width sirf content set karta hai, padding/border upar add hote hain. Resets border-box use karte hain taaki width mein sab shaamil ho.",
        code: `.card {
  box-sizing: border-box; /* width includes padding+border */
  width: 300px;
  padding: 20px;
  border: 2px solid #333;
  margin: 16px;
}
/* content-box (default): actual rendered width = 300+40+4 = 344px
   border-box: actual rendered width = exactly 300px */`
      },
      {
        q: "Flexbox vs Grid — when do you use each?",
        a_en: "Flexbox is one-dimensional — items flow and wrap along a single axis (row or column), ideal for navbars, button groups, cards that wrap naturally. Grid is two-dimensional — rows and columns defined together, items placed precisely, ideal for page-level layout. Most real UIs combine both: Grid for structure, Flexbox inside cells.",
        a_hi: "Flexbox one-dimensional hai — items ek axis (row/column) pe flow karte hain, navbars/button groups/wrapping cards ke liye ideal. Grid two-dimensional hai — rows aur columns saath define hote hain, page-level layout ke liye best. Real UIs dono combine karte hain.",
        code: `.navbar { display: flex; justify-content: space-between; align-items: center; }

.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}`
      },
      {
        q: "justify-content vs align-items — which axis is which?",
        a_en: "justify-content aligns along the main axis (flex-direction's own direction — horizontal by default). align-items aligns along the cross axis (perpendicular). Switching flex-direction to column swaps which one controls 'horizontal' vs 'vertical' — that's the #1 source of confusion.",
        a_hi: "justify-content main axis pe align karta hai (flex-direction ki direction — default horizontal). align-items cross axis pe (perpendicular). flex-direction: column karne se dono ka matlab swap ho jaata hai — sabse common confusion yahi hai.",
        code: `.row {
  display: flex;
  flex-direction: row;         /* main axis = horizontal */
  justify-content: center;     /* horizontal centering */
  align-items: center;         /* vertical centering */
}
.col {
  display: flex;
  flex-direction: column;      /* main axis = vertical now */
  justify-content: center;     /* VERTICAL centering now */
  align-items: center;         /* horizontal centering now */
}`
      },
      {
        q: "Explain position: static, relative, absolute, fixed, and sticky.",
        a_en: "static: default flow. relative: offsets from its own spot, still reserves that space. absolute: removed from flow, positioned against nearest non-static ancestor. fixed: removed from flow, pinned to the viewport, ignores scroll. sticky: relative until a scroll threshold, then behaves fixed within its parent's bounds.",
        a_hi: "static: default flow. relative: apni jagah se offset, space reserved rehta hai. absolute: flow se hata, nearest positioned ancestor ke relative. fixed: viewport ke relative, scroll ignore karta hai. sticky: threshold tak relative, phir fixed jaisa within parent.",
        code: `.tooltip-parent { position: relative; }
.tooltip { position: absolute; top: 0; right: 0; }

.navbar { position: fixed; top: 0; width: 100%; }

.table-header {
  position: sticky;
  top: 0; /* sticks once it hits the top of its scroll container */
}`
      },
      {
        q: "What is CSS specificity and how is it calculated?",
        a_en: "Specificity decides which conflicting rule wins: inline styles > IDs > classes/attributes/pseudo-classes > element/pseudo-element selectors. Equal specificity is broken by source order — the later rule wins. !important overrides all of this and should be used sparingly.",
        a_hi: "Specificity decide karta hai conflicting rules mein kaun jeetega: inline > ID > class/attribute/pseudo-class > element selector. Equal specificity mein baad wala rule jeet ta hai. !important sab override karta hai — sparingly use karo.",
        code: `/* specificity: 0-0-1 (element) */
p { color: blue; }

/* specificity: 0-1-0 (class) — wins */
.text { color: green; }

/* specificity: 1-0-0 (id) — wins over both */
#main { color: red; }

/* wins over everything except another !important */
p { color: orange !important; }`
      },
      {
        q: "How does CSS specificity interact with the cascade?",
        a_en: "The cascade resolves conflicts in order: origin/importance first (browser < user < author, but !important flips this), then specificity, then source order as the final tiebreaker. Understanding all three — not specificity alone — is what lets you predict which rule actually wins.",
        a_hi: "Cascade order mein conflicts resolve karta hai: origin/importance pehle (browser < user < author, !important flip karta hai), phir specificity, phir source order tiebreaker. Teeno samajhna zaroori hai, sirf specificity nahi.",
        code: `/* Same specificity — later wins */
.btn { background: blue; }
.btn { background: green; } /* wins — comes later */

/* Different origin — !important from author beats normal user-agent style */
button { all: revert; } /* reset to browser default */`
      },
      {
        q: "rem vs em vs % vs vw/vh — how do these units differ?",
        a_en: "px is fixed and doesn't scale. em is relative to the current element's own font-size and compounds when nested. rem is relative to the root <html> font-size only — no compounding, which is why it's the modern default. % is relative to the parent's corresponding property. vw/vh are relative to 1% of viewport width/height.",
        a_hi: "px fixed hai, scale nahi hota. em current element ke font-size ke relative hai aur nested hone pe compound hota hai. rem sirf root <html> font-size ke relative — koi compounding nahi, isliye modern default. % parent ki property ke relative. vw/vh viewport ke 1% ke relative.",
        code: `html { font-size: 16px; }
.box {
  font-size: 1.5rem;   /* always 24px, regardless of nesting */
  padding: 1em;        /* relative to THIS element's own font-size */
  width: 80%;           /* relative to parent's width */
  height: 50vh;          /* 50% of viewport height */
}`
      },
      {
        q: "What are CSS custom properties (variables), and how do they differ from Sass variables?",
        a_en: "var(--name) values are live, runtime, and cascade-aware — readable/writable via JS and can be overridden at any scope, which is exactly how CSS-based dark mode toggles work. Sass variables are resolved entirely at compile time and simply don't exist in the final CSS.",
        a_hi: "var(--name) values live, runtime, aur cascade-aware hain — JS se read/write ho sakte hain aur kisi bhi scope pe override ho sakte hain — isi se CSS dark mode toggle kaam karta hai. Sass variables compile time pe resolve ho jaate hain, final CSS mein exist hi nahi karte.",
        code: `:root { --accent: #4f46e5; --gap: 16px; }
[data-theme="dark"] { --accent: #a78bfa; }

.btn { background: var(--accent); padding: var(--gap); }

/* JS can read/write live */
document.documentElement.style.setProperty('--accent', 'crimson');`
      },
      {
        q: "What are pseudo-classes vs pseudo-elements?",
        a_en: "Pseudo-classes (single colon — :hover, :nth-child, :focus) select an element based on state or position. Pseudo-elements (double colon — ::before, ::after, ::first-letter) select a sub-part of an element's content, including content generated purely via CSS.",
        a_hi: "Pseudo-classes (single colon — :hover, :nth-child, :focus) element ki state/position ke basis pe select karte hain. Pseudo-elements (double colon — ::before, ::after) content ka sub-part select karte hain, generated content sahit.",
        code: `a:hover { color: crimson; }
li:nth-child(odd) { background: #f5f5f5; }

.required::after { content: " *"; color: red; }
p::first-letter { font-size: 2em; font-weight: bold; }`
      },
      {
        q: "How do container queries differ from media queries?",
        a_en: "A media query only knows the viewport size, so the same component can't adapt to the space it's actually given in different layouts. A container query responds to the size of a specific ancestor marked container-type — the same card can genuinely be reusable across a wide column and a narrow sidebar.",
        a_hi: "Media query sirf viewport size jaanta hai, isliye same component alag layouts mein apni actual space ke hisaab se adapt nahi kar sakta. Container query ek specific ancestor (container-type) ke size ke response mein hota hai — same card wide column aur narrow sidebar dono mein genuinely reusable.",
        code: `.card-slot { container-type: inline-size; }

@container (min-width: 400px) {
  .card { grid-template-columns: 120px 1fr; }
}
/* reacts to the CONTAINER's width, not the viewport's */`
      },
      {
        q: "What does the :has() selector unlock?",
        a_en: ":has() lets a selector match based on what's inside it — the 'parent selector' CSS lacked for years. form:has(:invalid) styles a form only while it contains an invalid field, closing a real gap that previously required JavaScript-driven conditional classes.",
        a_hi: ":has() ek selector ko uske andar ke content ke basis pe match karne deta hai — CSS ka missing 'parent selector'. form:has(:invalid) form ko tabhi style karta hai jab uske andar invalid field ho — pehle isko JS-driven classes se karna padta tha.",
        code: `label:has(input:checked) { background: #eef2ff; font-weight: 600; }
.card:has(img) { grid-template-rows: auto 1fr; }
form:has(:invalid) { border-color: crimson; }`
      },
      {
        q: "What are CSS logical properties, and why prefer them over left/top?",
        a_en: "margin-left/top are tied to a fixed physical direction and silently break under RTL languages, since 'left' doesn't mean 'start of line' once text direction flips. Logical properties (margin-inline-start, padding-block) describe position relative to the current writing mode, so the layout adapts automatically for dir=\"rtl\" with zero extra CSS.",
        a_hi: "margin-left/top ek fixed physical direction se bandhe hain aur RTL languages mein silently break hote hain. Logical properties (margin-inline-start, padding-block) current writing mode ke relative position describe karte hain, isliye dir=\"rtl\" mein automatically adapt ho jaate hain.",
        code: `.card {
  margin-inline-start: 16px; /* left in LTR, right in RTL — automatic */
  padding-block: 12px;       /* top+bottom, direction-agnostic */
}`
      },
      {
        q: "How do you center a div — and why did this used to be hard?",
        a_en: "margin: 0 auto centers horizontally only, and needs an explicit width. Flexbox (display: flex; justify-content: center; align-items: center) centers on both axes regardless of the child's size, which is why it replaced older tricks like absolute positioning with negative margins for vertical centering.",
        a_hi: "margin: 0 auto sirf horizontal center karta hai, explicit width chahiye. Flexbox (justify-content + align-items: center) dono axes pe center karta hai, kisi bhi child size ke saath — isliye purani tricks (negative margin absolute positioning) replace ho gayi.",
        code: `.center-h { width: 300px; margin: 0 auto; }

.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`
      },
      {
        q: "What is BEM, and why does it help avoid specificity fights?",
        a_en: "BEM (Block__Element--Modifier) is a naming convention, not a tool — card, card__title, card--featured. Every class stays equally specific (a single class selector), so styles compose predictably instead of fighting each other, and the structure is readable straight from the class names.",
        a_hi: "BEM (Block__Element--Modifier) ek naming convention hai — card, card__title, card--featured. Har class equally specific rehti hai (single class selector), isliye styles predictably compose hote hain, aur class names se hi structure samajh aata hai.",
        code: `<div class="card card--featured">
  <h2 class="card__title card__title--active">Title</h2>
</div>

.card { }
.card__title { }
.card--featured { }
.card__title--active { }`
      },
      {
        q: "How does the CSS cascade layers feature (@layer) help with third-party CSS?",
        a_en: "@layer lets you name cascade layers and fix their priority order independent of specificity — a rule in an earlier-declared layer always loses to a later one, no matter which selector inside is more specific. This safely layers a reset → a component library → your own overrides, without needing ever-more-specific selectors or !important to beat a third-party library.",
        a_hi: "@layer cascade layers ko naam de kar unki priority order fix karta hai, specificity se independent — earlier layer ka rule hamesha baad wale se haarta hai, selector kitna bhi specific ho. Isse reset → library → apne overrides safely layer ho sakte hain, !important ki zaroorat nahi.",
        code: `@layer reset, components, utilities;

@layer utilities {
  .text-center { text-align: center; } /* always wins over components layer */
}`
      },
      {
        q: "What's the difference between visibility: hidden and display: none?",
        a_en: "display: none removes the element from the render tree entirely — zero space, invisible to screen readers, siblings reflow to fill the gap. visibility: hidden keeps its layout space reserved (an invisible hole) but a descendant can re-show itself via visibility: visible, which display: none never allows.",
        a_hi: "display: none element ko render tree se poori tarah hata deta hai — zero space, screen reader se bhi gayab, siblings reflow ho jaate hain. visibility: hidden layout space reserve rakhta hai (invisible hole), aur ek descendant visibility: visible se dobara dikh sakta hai jo display: none mein possible nahi.",
        code: `.gone   { display: none; }      /* no space, layout reflows */
.hidden { visibility: hidden; }  /* space reserved, invisible hole */

.hidden .child { visibility: visible; } /* child CAN reappear — impossible with display:none */`
      },
    ],
  },

  {
    id: "html-a11y", label: "Semantic HTML", icon: "🏷", color: "#5B8DEF", section: "CSS",
    def_en: "Semantic HTML tags describe what content actually means, not just how it looks — this is what search engines, screen readers, and browser accessibility trees rely on to understand a page's real structure.",
    def_hi: "Semantic HTML tags batate hain content ka actual matlab kya hai, sirf dikhna nahi — isi pe search engines, screen readers, aur browser accessibility trees depend karte hain page ki real structure samajhne ke liye.",
    questions: [
      {
        q: "Why do semantic tags matter over a div-only markup?",
        a_en: "<div>/<span> carry zero meaning — only CSS classes convey structure, invisible to any automated system. <article>, <nav>, <header> tell a crawler or screen reader exactly what a region is, which is a genuine SEO ranking signal and lets assistive tech announce meaningful landmarks instead of undifferentiated div soup.",
        a_hi: "<div>/<span> ka koi meaning nahi — sirf CSS classes structure batate hain jo automated systems ko nahi dikhta. <article>, <nav>, <header> crawler/screen reader ko exact batate hain region kya hai — genuine SEO signal, aur assistive tech meaningful landmarks announce kar sakta hai.",
        code: `<!-- Semantic -->
<article>
  <header><h2>Post title</h2></header>
  <p>...</p>
</article>

<!-- Non-semantic — visually identical, zero structural meaning -->
<div><div><div>Post title</div></div><div>...</div></div>`
      },
      {
        q: "section vs article vs aside — how do you choose?",
        a_en: "<article> is self-contained and independently distributable — it should still make sense if syndicated elsewhere (a blog post). <section> groups related content thematically within a page without needing to stand alone. <aside> marks content tangential to the main flow — a reader could skip it without losing the core meaning.",
        a_hi: "<article> self-contained hai — kahin aur syndicate ho toh bhi sense banata hai (blog post). <section> related content ko thematically group karta hai, standalone hone ki zaroorat nahi. <aside> main flow se tangential content — skip karne pe core meaning nahi khota.",
        code: `<article>
  <h1>Blog Post</h1>
  <section>Introduction...</section>
  <aside>Related links</aside>
</article>`
      },
      {
        q: "What's the difference between <b> and <strong>, or <i> and <em>?",
        a_en: "They render visually identical by default, but the difference is semantic. <strong>/<em> signal genuine importance/emphasis — screen readers announce them differently. <b>/<i> are purely stylistic with zero implied meaning. If you'd emphasize it out loud, use strong/em; if it's purely visual, use b/i or CSS font-weight.",
        a_hi: "Dono visually identical dikhte hain, par difference semantic hai. <strong>/<em> genuine importance/emphasis signal karte hain — screen readers alag announce karte hain. <b>/<i> purely stylistic hain, koi meaning nahi. Zor se bolte waqt emphasize karoge toh strong/em, warna sirf visual.",
        code: `<b>bold, purely stylistic</b>
<strong>genuinely important — screen readers add emphasis</strong>`
      },
      {
        q: "How do you make a custom widget accessible with ARIA — and when should you not need to?",
        a_en: "Use semantic HTML first; a real <button> is already fully keyboard/screen-reader accessible with zero ARIA. Reach for ARIA (role, aria-expanded, aria-live) only when no native element covers the case — a custom dropdown or live-updating toast — since slapping role=\"button\" on a <div> means you must then hand-reimplement keyboard support yourself.",
        a_hi: "Pehle semantic HTML use karo; asli <button> already fully accessible hai bina ARIA ke. ARIA (role, aria-expanded, aria-live) tabhi use karo jab koi native element cover na kare — custom dropdown ya live toast. <div> pe role=\"button\" lagane se keyboard support khud implement karna padega.",
        code: `<!-- Prefer -->
<button aria-expanded={open}>Menu</button>

<!-- Only when no native element fits -->
<div role="alert" aria-live="polite">Item added to cart</div>`
      },
      {
        q: "What is a focus trap, and why does a modal need one?",
        a_en: "Without one, Tab eventually moves focus past the open modal onto page content behind it — invisible to a mouse user but disorienting for keyboard/screen-reader users. A focus trap constrains Tab/Shift+Tab to the modal's own elements, moves focus in on open, and restores it to the trigger on close.",
        a_hi: "Iske bina, Tab modal se aage page content pe chala jaata hai — mouse user ko nahi dikhta par keyboard/screen-reader user ke liye disorienting. Focus trap Tab ko modal ke andar hi rakhta hai, open pe focus andar le jaata hai, close pe wapas trigger pe.",
        code: `function useFocusTrap(ref, isOpen) {
  useEffect(() => {
    if (!isOpen) return;
    const el = ref.current;
    const focusables = el.querySelectorAll('button, a, input, [tabindex]');
    focusables[0]?.focus();
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [isOpen]);
}`
      },
      {
        q: "What are skip links, and why do they matter?",
        a_en: "A skip link is a normally hidden link, the first focusable element on the page, reading 'Skip to main content' — visible only on keyboard focus. Without one, a keyboard/screen-reader user must Tab through the entire repeated header/nav on every page load before reaching unique content, a cost a mouse user's eyes never pay.",
        a_hi: "Skip link normally hidden hota hai, page ka pehla focusable element, 'Skip to main content' — sirf keyboard focus pe dikhta hai. Iske bina, keyboard/screen-reader user har page pe pura repeated header/nav Tab karke jaana padta hai unique content tak.",
        code: `<a href="#main" class="skip-link">Skip to main content</a>
<style>
  .skip-link { position: absolute; left: -9999px; }
  .skip-link:focus { left: 8px; top: 8px; }
</style>`
      },
      {
        q: "What are WCAG conformance levels A, AA, and AAA?",
        a_en: "WCAG organizes accessibility around four principles (POUR: Perceivable, Operable, Understandable, Robust) and three progressive levels — A (bare baseline), AA (what most legal requirements like ADA/Section 508 actually target), and AAA (often impractical for every piece of content). AA is the realistic target for most real projects.",
        a_hi: "WCAG char principles pe organized hai (POUR) aur teen levels — A (bare minimum), AA (jo zyaadatar legal requirements jaise ADA target karte hain), AAA (har content ke liye often impractical). Real projects mein AA realistic target hai.",
      },
    ],
  },

  {
    id: "ts-fundamentals", label: "Type System", icon: "🔷", color: "#3178C6", section: "TypeScript",
    def_en: "TypeScript is a superset of JavaScript that adds static type checking, caught at compile time in the editor rather than as a runtime crash. All types are stripped away at compile time — the browser only ever runs plain JS.",
    def_hi: "TypeScript JavaScript ka superset hai jo static type checking add karta hai — editor mein hi compile-time pe pakda jaata hai, runtime crash nahi banta. Compile time pe saare types strip ho jaate hain — browser sirf plain JS run karta hai.",
    questions: [
      {
        q: "What problem do generics solve?",
        a_en: "Generics let a function/type stay type-safe across whatever specific type it's actually used with, instead of duplicating the function per type or giving up with any (losing all safety). A generic <T> captures 'whatever comes in, that same type comes out,' checked consistently at every call site.",
        a_hi: "Generics ek function/type ko type-safe rakhte hain chahe wo kisi bhi type ke saath use ho, bina function duplicate kiye ya any use karke safety khoye. <T> capture karta hai 'jo andar aaya, wahi bahar jaayega', har call site pe checked.",
        code: `function first<T>(arr: T[]): T | undefined { return arr[0]; }
first([1, 2, 3]);      // inferred: number | undefined
first(['a', 'b']);     // inferred: string | undefined — same function`
      },
      {
        q: "What do Partial, Pick, Omit, and Record do?",
        a_en: "Built-in utility types that derive a new type from an existing one, staying in sync automatically. Partial<T> makes every property optional. Pick<T,K> keeps only named keys. Omit<T,K> keeps everything except named keys. Record<K,V> builds an object type mapping every key in K to type V.",
        a_hi: "Built-in utility types jo existing type se naya type derive karte hain, automatically sync rehte hain. Partial<T> sab optional. Pick<T,K> sirf named keys. Omit<T,K> named keys chhod kar baaki sab. Record<K,V> K ki har key ko V se map karta object.",
        code: `interface User { id: string; name: string; email: string; }
type UserUpdate = Partial<Omit<User, 'id'>>; // { name?: string; email?: string }
type Roles = Record<'admin' | 'editor' | 'viewer', string[]>;`
      },
      {
        q: "What are discriminated unions?",
        a_en: "A union of object types sharing one common literal-typed field (the discriminant, often 'type' or 'status'). Narrowing on that field with if/switch automatically narrows the whole object's type in that branch — the standard type-safe way to model loading/success/error API states without one variant's fields leaking into another.",
        a_hi: "Object types ka union jo ek common literal field share karte hain (discriminant, 'type'/'status'). Us field pe if/switch se narrow karne se poora object us branch mein narrow ho jaata hai — loading/success/error states model karne ka safe tareeka.",
        code: `type Result =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handle(r: Result) {
  if (r.status === 'success') console.log(r.data); // r.data exists ONLY here
}`
      },
      {
        q: "unknown vs any — what's the real difference?",
        a_en: "any disables type checking entirely — call anything, access anything, zero compiler complaints, silently reintroducing runtime errors TypeScript exists to prevent. unknown accepts any value too, but forces you to narrow it (typeof, instanceof, a type guard) before doing anything with it — the correct default for a catch block's error or raw JSON.",
        a_hi: "any type checking poori tarah disable kar deta hai — kuch bhi call/access karo, koi complaint nahi, runtime errors wapas aa jaate hain. unknown bhi koi value accept karta hai, par kuch karne se pehle narrow karna padta hai — catch error ya raw JSON ke liye sahi default.",
        code: `function handle(err: unknown) {
  if (err instanceof Error) console.log(err.message); // safe, narrowed
  // err.message; // Error — must narrow first
}`
      },
      {
        q: "What does the satisfies operator do?",
        a_en: "satisfies checks a value matches a type without widening the value's own inferred type. Annotating const x: Config = {...} widens literals to their general type; x = {...} satisfies Config keeps the narrow, precise inferred type while still validating the shape — best of both compile-time safety and precise autocomplete.",
        a_hi: "satisfies value ko type ke against check karta hai bina value ka apna inferred type widen kiye. const x: Config annotation literals ko general type mein widen kar deta hai; satisfies narrow type rakhta hai aur shape bhi validate karta hai.",
        code: `const theme = { mode: 'dark', accent: '#4f46e5' } satisfies Record<string, string>;
theme.mode; // type is the literal 'dark', not widened to string`
      },
      {
        q: "What is the never type used for?",
        a_en: "never represents a value that can genuinely never occur — a function that always throws has return type never, not void. Its most useful role: exhaustiveness checking — in a switch over a discriminated union, assigning the unhandled value to a never-typed parameter in default makes the compiler error if a new variant is ever added without a matching case.",
        a_hi: "never ek aisi value hai jo kabhi occur nahi hoti — hamesha throw karne wale function ka return type never hota hai, void nahi. Sabse useful role: exhaustiveness check — switch ke default case mein never assign karne se compiler naya variant miss hone pe error dega.",
        code: `function assertNever(x: never): never { throw new Error('Unhandled: ' + x); }
switch (shape.kind) {
  case 'circle': return Math.PI * shape.r ** 2;
  case 'square': return shape.side ** 2;
  default: return assertNever(shape.kind); // compile error if a variant is missed
}`
      },
      {
        q: "interface vs type — what actually differs?",
        a_en: "Both describe object shapes and are largely interchangeable for that case, but interface supports declaration merging — the same name declared twice merges automatically, useful for extending third-party types. type is strictly more flexible: unions, intersections, mapped/conditional types, and primitive/tuple aliases, none of which interface can express.",
        a_hi: "Dono object shapes describe karte hain aur largely interchangeable hain, par interface declaration merging support karta hai — same name do baar declare karne se merge ho jaata hai. type zyaada flexible hai: unions, intersections, mapped/conditional types.",
        code: `interface User { name: string }
interface User { age: number } // merges automatically

type Status = 'active' | 'inactive'; // union — interface can't express this`
      },
      {
        q: "How does type inference work, and when do you still need explicit annotations?",
        a_en: "TypeScript infers types from initial values, return statements, and context (contextual typing for callback parameters) without you writing them out. Explicit annotations are still needed for function parameters (no call-site context to infer from), empty array/object literals that would otherwise infer as any[], and public API boundaries where the intended type should be locked in, not guessed.",
        a_hi: "TypeScript initial values, return statements, aur context se types infer kar leta hai bina explicitly likhe. Explicit annotations zaroori hain: function parameters (koi context nahi), empty array/object jo any[] infer honge, aur public API boundaries jahan intended type lock karna hai.",
        code: `let count = 5; // inferred: number
function add(a: number, b: number) { return a + b; } // params need annotation
const items: string[] = []; // without annotation, infers as any[]`
      },
    ],
  },

  {
    id: "browser-storage", label: "Storage & Auth", icon: "🔐", color: "#FB7185", section: "Browser",
    def_en: "The browser gives frontend code several storage and networking primitives — each with different lifetimes, sizes, and security implications — plus the auth/security model that governs how a page can safely talk to a server.",
    def_hi: "Browser frontend code ko kayi storage aur networking primitives deta hai — alag lifetimes, sizes, aur security implications ke saath — plus wo auth/security model jo control karta hai page server se safely kaise baat kare.",
    questions: [
      {
        q: "localStorage vs sessionStorage vs cookies vs IndexedDB — how do you pick?",
        a_en: "Cookies are tiny (~4KB) but sent automatically with every matching request — the right place for a session token the server must see every time. localStorage (5-10MB) persists indefinitely, client-only, good for simple preferences. sessionStorage is the same API but cleared when the tab closes. IndexedDB (100s of MB) is a real structured, transactional database for large or queryable data.",
        a_hi: "Cookies chhote hain (~4KB) par har matching request ke saath automatically bhejte hain — session token ke liye sahi jo server ko har baar dikhna chahiye. localStorage (5-10MB) hamesha persist karta hai, client-only. sessionStorage same API par tab close pe clear. IndexedDB (100s MB) real structured database hai.",
        code: `localStorage.setItem('theme', 'dark');       // persists, all tabs
sessionStorage.setItem('draft', 'text');       // this tab only, cleared on close
document.cookie = "session=abc; Secure; SameSite=Strict"; // auto-sent to server`
      },
      {
        q: "Where should you store a JWT, and why?",
        a_en: "localStorage is simple but any XSS on the page can read it and exfiltrate the token trivially. The more secure option is an HttpOnly cookie set by the server — invisible to JavaScript entirely, so even a successful XSS can't steal it directly. This shifts the concern to CSRF, mitigated with SameSite=Strict/Lax plus a CSRF token.",
        a_hi: "localStorage simple hai par koi bhi XSS token ko read/exfiltrate kar sakta hai. Zyada secure option: server-set HttpOnly cookie — JavaScript ko bilkul nahi dikhta, XSS bhi steal nahi kar sakta. Isse CSRF concern aata hai, SameSite + CSRF token se mitigate karo.",
        code: `// Less secure — readable by any injected script
localStorage.setItem('token', jwt);

// More secure — server sets this, JS can never read it
// Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict`
      },
      {
        q: "What's the difference between Authentication and Authorization?",
        a_en: "Authentication answers 'who are you?' — verifying identity via credentials, always the first step. Authorization answers 'what are you allowed to do?' — given you know who they are, checking permission for a specific action. A logged-in regular user hitting an admin-only route is a perfect 'authenticated but not authorized' example.",
        a_hi: "Authentication puchta hai 'tum kaun ho?' — credentials se identity verify, pehla step hamesha. Authorization puchta hai 'tumhe kya karne ki permission hai?' — identity pata hone ke baad specific action check. Logged-in regular user admin route try kare — 'authenticated but not authorized' ka perfect example.",
        code: `if (!user) return redirect('/login');           // Authentication
if (user.role !== 'admin') return forbid();      // Authorization`
      },
      {
        q: "REST HTTP methods — what's idempotent and what isn't?",
        a_en: "GET reads, safe and idempotent. POST creates — not idempotent, calling twice creates two resources. PUT replaces entirely — idempotent, same body repeated gives the same end state. PATCH partially updates. DELETE removes — idempotent, deleting an already-deleted resource just returns 'already gone.'",
        a_hi: "GET read karta hai, safe aur idempotent. POST create karta hai — idempotent nahi, do baar call se do resources ban jaate hain. PUT poora replace karta hai — idempotent. PATCH partial update. DELETE remove karta hai — idempotent, already-deleted pe bhi ok response.",
        code: `GET    /users/1  → read (idempotent)
POST   /users    → create (NOT idempotent — repeats duplicate)
PUT    /users/1  → replace entirely (idempotent)
PATCH  /users/1  → partial update
DELETE /users/1  → remove (idempotent)`
      },
      {
        q: "What is CORS, and who actually enforces it?",
        a_en: "By default, the browser's Same-Origin Policy blocks JS on one origin from reading a response from a different origin. CORS is the server opting out of that for specific origins via response headers (Access-Control-Allow-Origin). Critically, CORS is enforced entirely by the browser — a CORS error can only be fixed on the server, never worked around client-side.",
        a_hi: "Default mein, browser ki Same-Origin Policy alag origin ke response ko read karne se rokti hai. CORS server ka specific origins ke liye opt-out hai (Access-Control-Allow-Origin header). CORS enforcement poori tarah browser karta hai — fix sirf server pe hota hai, client se kabhi nahi.",
        code: `// Server response header — grants permission
// Access-Control-Allow-Origin: https://myapp.com

// A CORS error in the console means the SERVER needs this header,
// not something the requesting frontend code can bypass at all.`
      },
      {
        q: "What is XSS, and what's the primary defense?",
        a_en: "XSS is malicious JS executing inside your page in another user's browser, with the same trust as your own code — able to read cookies and make authenticated requests silently. The usual vector is rendering unsanitized user input as real HTML. React's default JSX rendering auto-escapes text, which is why apps stay resistant until dangerouslySetInnerHTML opts out of it.",
        a_hi: "XSS matlab malicious JS kisi aur user ke browser mein tumhare page ke andar chal raha hai, tumhare code jitna trust ke saath — cookies read kar sakta hai, authenticated requests bhej sakta hai. Usual vector: unsanitized user input ko real HTML ki tarah render karna. React ka JSX default text escape karta hai, dangerouslySetInnerHTML se hi ye protection hatti hai.",
        code: `// Safe by default — React escapes text automatically
<div>{userComment}</div>

// Dangerous — opts OUT of escaping
<div dangerouslySetInnerHTML={{ __html: userComment }} />`
      },
      {
        q: "What is CSRF, and how does SameSite defend against it?",
        a_en: "CSRF exploits cookies being auto-attached to any request to that domain, regardless of which site triggered it — a hidden form on a malicious page can silently fire an authenticated request using the victim's real session cookie. SameSite=Strict/Lax tells the browser to withhold that cookie for cross-site requests, closing the exact mechanism CSRF depends on.",
        a_hi: "CSRF is baat ka fayda uthata hai ki cookies har request ke saath auto-attach hoti hain, chahe request kahin se bhi trigger hui ho — malicious page pe hidden form victim ki real session cookie use kar leta hai. SameSite=Strict/Lax cross-site requests ke liye cookie rok deta hai — CSRF ka rasta band.",
        code: `// Set-Cookie: session=abc; SameSite=Strict
// Browser now withholds this cookie on any cross-site request`
      },
      {
        q: "How do you handle a 401 response globally, without repeating logic at every call site?",
        a_en: "A response interceptor (Axios or a fetch wrapper) is the standard pattern — one centralized place catches every 401, clears the now-invalid stored credentials, and redirects to login, rather than duplicating that check across dozens of API call sites and inevitably missing some.",
        a_hi: "Response interceptor (Axios ya fetch wrapper) standard pattern hai — ek centralized jagah har 401 catch karti hai, invalid credentials clear karti hai, login pe redirect karti hai — har API call site pe alag se check karne ki zaroorat nahi.",
        code: `axios.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});`
      },
      {
        q: "What is Subresource Integrity (SRI), and what does it protect against?",
        a_en: "SRI pins a cryptographic hash of an externally-hosted script/stylesheet in the tag that loads it — the browser hashes whatever it actually downloads and refuses to execute it on a mismatch. This protects against a compromised CDN silently serving altered, malicious code in place of the library you intended.",
        a_hi: "SRI ek externally-hosted script/stylesheet ka cryptographic hash tag mein pin karta hai — browser jo bhi download karta hai uska hash check karta hai, mismatch pe execute nahi karta. Ye compromised CDN se altered malicious code serve hone se bachata hai.",
        code: `<script src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAf..." crossorigin="anonymous"></script>`
      },
      {
        q: "What is clickjacking, and how does frame-ancestors defend against it?",
        a_en: "Clickjacking embeds your site in an invisible iframe layered under an attacker's decoy UI, so a click that looks like it hits their button actually hits yours underneath. Content-Security-Policy: frame-ancestors 'none' tells the browser to refuse rendering your page inside anyone's iframe, closing the attack entirely.",
        a_hi: "Clickjacking tumhare site ko invisible iframe mein embed karta hai attacker ki fake UI ke neeche — click dikhta unke button pe hai par actually tumhare button pe lagta hai. CSP: frame-ancestors 'none' browser ko batata hai ki page kisi ke bhi iframe mein render mat karo.",
        code: `// Response header — blocks any framing at all
// Content-Security-Policy: frame-ancestors 'none'`
      },
      {
        q: "postMessage — what's it for, and what's the security footgun?",
        a_en: "window.postMessage() lets two different-origin windows/iframes communicate, which the Same-Origin Policy would otherwise block. The footgun is the target-origin argument — postMessage(data, '*') sends to whatever origin currently occupies that window. Always pass the exact expected origin, and verify event.origin on receipt before trusting event.data.",
        a_hi: "window.postMessage() do alag-origin windows/iframes ko communicate karne deta hai. Footgun target-origin argument hai — postMessage(data, '*') jo bhi origin currently hai usko bhej deta hai. Hamesha exact origin pass karo, aur receive pe event.origin verify karo.",
        code: `// Sending — always specify the exact target origin
otherWindow.postMessage(data, 'https://trusted-app.com');

// Receiving — always verify the sender
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted-app.com') return;
  console.log(event.data);
});`
      },
    ],
  },

  {
    id: "perf-vitals", label: "Web Vitals & Rendering", icon: "🚀", color: "#34D399", section: "Performance",
    def_en: "Performance work splits into loading speed (Core Web Vitals), the browser's rendering pipeline (reflow/repaint), and network-layer wins (caching, compression, CDNs) — each measured and optimized differently.",
    def_hi: "Performance ka kaam teen hisson mein baant sakte hain: loading speed (Core Web Vitals), browser ki rendering pipeline (reflow/repaint), aur network-layer wins (caching, compression, CDNs) — har ek alag tareeke se measure aur optimize hota hai.",
    questions: [
      {
        q: "What are the Core Web Vitals (LCP, INP, CLS)?",
        a_en: "LCP (Largest Contentful Paint) measures loading — render time of the biggest visible element. INP (Interaction to Next Paint) measures responsiveness — delay between an interaction and the visual update. CLS (Cumulative Layout Shift) measures visual stability — how much content unexpectedly shifts. All three are also direct Google ranking signals.",
        a_hi: "LCP (Largest Contentful Paint) loading measure karta hai — sabse bade visible element ka render time. INP (Interaction to Next Paint) responsiveness — interaction aur visual update ke beech delay. CLS (Cumulative Layout Shift) visual stability — content kitna unexpectedly shift hota hai. Teeno Google ranking signals bhi hain.",
      },
      {
        q: "What's the difference between reflow (layout) and repaint?",
        a_en: "Reflow triggers whenever a change could affect element geometry (width, height, adding/removing a node) — expensive because it can cascade to every element after it. Repaint triggers on visual-only changes (color, visibility) — cheaper, no geometry recalculation. Prefer animating transform/opacity, which can skip both and run on the GPU compositor.",
        a_hi: "Reflow tab trigger hota hai jab geometry change ho (width, height, node add/remove) — expensive kyunki cascade ho sakta hai. Repaint sirf visual change pe (color, visibility) — cheaper, geometry recalculate nahi hoti. transform/opacity animate karo, GPU compositor pe chal sakte hain, dono skip ho sakte hain.",
        code: `// Triggers reflow — expensive, animates layout every frame
el.style.left = pos + 'px';

// GPU-composited — skips reflow AND repaint
el.style.transform = \`translateX(\${pos}px)\`;`
      },
      {
        q: "Walk through the Critical Rendering Path.",
        a_en: "HTML parsing builds the DOM. CSS parsing builds the CSSOM — render-blocking by default to avoid a flash of unstyled content. DOM+CSSOM combine into the Render Tree (excluding display:none nodes). Layout calculates every element's size/position. Paint draws pixels. Optimizing means minimizing what blocks the first three steps.",
        a_hi: "HTML parsing DOM banata hai. CSS parsing CSSOM banata hai — default render-blocking, unstyled content ka flash na dikhe isliye. DOM+CSSOM milkar Render Tree banate hain. Layout har element ka size/position calculate karta hai. Paint pixels draw karta hai. Optimize karna matlab pehle 3 steps ko block hone se rokna.",
      },
      {
        q: "preload vs prefetch vs preconnect vs dns-prefetch — different tools for what?",
        a_en: "preload fetches something THIS page definitely needs, at high priority, right now (a critical font). prefetch fetches something the NEXT page will probably need, at low priority during idle time. preconnect does the DNS+TCP+TLS handshake for a third-party origin ahead of the real request. dns-prefetch is the lightest — just the DNS lookup alone.",
        a_hi: "preload us cheez ko fetch karta hai jo IS page ko abhi chahiye, high priority. prefetch NEXT page ke liye, low priority, idle time mein. preconnect kisi third-party origin ke liye DNS+TCP+TLS pehle se kar deta hai. dns-prefetch sabse halka — sirf DNS lookup.",
        code: `<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="prefetch" href="/next-page-chunk.js">
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://analytics.example.com">`
      },
      {
        q: "What is the back/forward cache (bfcache), and what breaks it?",
        a_en: "The bfcache freezes an entire page — JS state, DOM, scroll position — in memory on navigation-away, so back/forward restores it instantly with zero re-fetch. An unload event listener, a dangling WebSocket/IndexedDB transaction, or certain Cache-Control: no-store headers all disable it — Chrome DevTools' bfcache panel flags the culprit.",
        a_hi: "bfcache poore page ko freeze karta hai memory mein — JS state, DOM, scroll — navigate away pe, isliye back/forward instant restore hota hai. unload listener, dangling WebSocket, ya certain no-store headers ise disable kar dete hain — DevTools bfcache panel batata hai culprit.",
      },
      {
        q: "How do HTTP caching and a CDN each improve performance, and how do they differ?",
        a_en: "HTTP caching (Cache-Control, ETag) lets the browser reuse a previously-downloaded resource without a new request at all. A CDN distributes copies of static assets across many geographic edge locations, so the request is served from somewhere physically close — cutting network latency, which matters even before caching/compression enter the picture.",
        a_hi: "HTTP caching (Cache-Control, ETag) browser ko pehle se download resource dobara use karne deta hai, naya request bina. CDN static assets ko kayi geographic locations pe distribute karta hai, isliye request physically nazdeek se serve hota hai — latency kam, caching/compression se pehle hi matter karta hai.",
        code: `// Cache-Control: max-age=31536000, immutable  → never re-fetch a versioned asset
// Cache-Control: no-cache                       → always revalidate via ETag first`
      },
      {
        q: "What is code splitting, and how does React.lazy + Suspense implement it?",
        a_en: "By default a bundler ships one large JS file, so every user downloads code for routes they'll never visit. Code splitting breaks it into chunks loaded on demand — React.lazy(() => import('./Page')) wraps a dynamic import, and Suspense shows a fallback while that chunk downloads, only swapping in the real component once it's ready.",
        a_hi: "Default mein bundler ek bada JS file bhejta hai, har user un routes ka code bhi download karta hai jo wo kabhi visit nahi karega. Code splitting on-demand chunks mein todta hai — React.lazy dynamic import wrap karta hai, Suspense fallback dikhata hai jab tak chunk download nahi hota.",
        code: `const Settings = React.lazy(() => import('./Settings'));

<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>`
      },
      {
        q: "What does a Service Worker enable for performance beyond offline support?",
        a_en: "A Service Worker runs on a separate thread and can intercept every network request, deciding whether to serve from cache, network, or a combination. Beyond offline capability, it enables prefetching resources ahead of when they're requested and serving previously-cached responses instantly on repeat visits — 'instant, from cache' beats waiting on the network every time it applies.",
        a_hi: "Service Worker separate thread pe chalta hai aur har network request intercept kar sakta hai — cache se serve kare ya network se. Offline ke alawa, resources prefetch kar sakta hai aur repeat visits pe instantly cache se serve kar sakta hai — network se hamesha fast.",
      },
      {
        q: "How do you optimize image loading for LCP?",
        a_en: "Lazy-load offscreen images (loading=\"lazy\") so they don't compete with the visible ones on initial load. Use srcset to serve appropriately-sized images per device instead of one oversized image scaled down via CSS. Use modern formats (WebP/AVIF), and reserve explicit dimensions or aspect-ratio so layout doesn't shift once the image loads.",
        a_hi: "Offscreen images lazy-load karo (loading=\"lazy\") taaki visible images se bandwidth compete na ho. srcset se device ke hisaab se sahi size ki image do. Modern formats (WebP/AVIF) use karo, aur explicit dimensions/aspect-ratio reserve karo taaki layout shift na ho.",
        code: `<img src="photo.webp" loading="lazy"
     srcset="photo-480.webp 480w, photo-800.webp 800w"
     style="aspect-ratio: 16/9" />`
      },
    ],
  },

  {
    id: "git-workflow", label: "Git Internals", icon: "🌿", color: "#F05033", section: "Tools",
    def_en: "Git is a distributed version control system — every clone holds the full project history. The commands that matter for day-to-day work are the ones that shape shared history safely: merge vs rebase, reset vs revert, and how to recover from a mistake.",
    def_hi: "Git ek distributed version control system hai — har clone ki poori project history hoti hai. Din-pratidin ke liye important commands wo hain jo shared history safely shape karte hain: merge vs rebase, reset vs revert, aur mistake se kaise recover karein.",
    questions: [
      {
        q: "git merge vs git rebase — what's the actual tradeoff?",
        a_en: "merge creates a new commit with two parents, preserving the honest record of how branches diverged and reunited — always safe, even on shared branches, since it never rewrites existing commits. rebase replays your commits on top of the target branch, producing clean linear history but rewriting commit hashes — safe only on your own local, not-yet-shared branches.",
        a_hi: "merge ek naya commit banata hai do parents ke saath, honest record rakhta hai — shared branches pe bhi safe, kyunki existing commits rewrite nahi hote. rebase tumhare commits ko target branch ke upar replay karta hai — clean history par hashes rewrite hote hain, sirf apni local unshared branch pe safe.",
        code: `git checkout feature
git rebase main        # clean history, but rewrites hashes — local branch only

git checkout main
git merge feature       # safe on shared branches, adds a merge commit`
      },
      {
        q: "git reset vs git revert — when is each safe?",
        a_en: "reset moves the branch pointer and rewrites history (--soft keeps changes staged, --hard discards them entirely) — dangerous on any branch others have already pulled. revert creates a brand-new commit that undoes a previous one, leaving history fully intact and honest — the only one of the two considered safe on shared/public branches.",
        a_hi: "reset branch pointer move karta hai aur history rewrite karti hai (--soft changes staged rakhta, --hard discard) — shared branch pe dangerous. revert ek naya commit banata hai jo purana undo karta hai, history intact rehti hai — shared branches pe safe hai.",
        code: `git reset --hard HEAD~1   // discards the last commit entirely — local only
git revert HEAD           // new commit that undoes the last one — safe to share`
      },
      {
        q: "What is git bisect, and when would you use it?",
        a_en: "git bisect automates finding the exact commit that introduced a bug via binary search — mark a known-good and known-bad commit, and Git checks out the midpoint repeatedly, narrowing an even huge commit range to the culprit in roughly log2(n) steps instead of manually checking each one.",
        a_hi: "git bisect binary search se exact commit dhoondta hai jisne bug introduce kiya — ek good aur ek bad commit mark karo, Git midpoint check karta jaata hai, log2(n) steps mein hi culprit mil jaata hai.",
        code: `git bisect start
git bisect bad                # current commit is broken
git bisect good v1.2.0        # this old tag was fine
# Git checks out the midpoint — mark each as good/bad until found
git bisect run npm test       # or fully automate it`
      },
      {
        q: "What does interactive rebase (git rebase -i) let you do?",
        a_en: "It opens an editable list of recent commits, letting you squash several small commits into one clean commit, reword a message, reorder commits, or drop one entirely — a tool for cleaning up your own local, not-yet-pushed history before opening a PR, never for commits others have already pulled.",
        a_hi: "Recent commits ki editable list khulti hai — chhote commits ko squash karo ek clean commit mein, message reword karo, reorder ya drop karo — apni local unshared history clean karne ke liye, others ke pulled commits ke liye kabhi nahi.",
        code: `git rebase -i HEAD~4
# pick, squash, reword, drop — edit the list, save, done`
      },
      {
        q: "What is git stash, and when is it useful?",
        a_en: "git stash temporarily shelves uncommitted changes (staged and unstaged), restoring a clean working directory — useful when you need to switch branches mid-task without a half-finished throwaway commit. git stash pop restores exactly where you left off.",
        a_hi: "git stash uncommitted changes ko temporarily shelve karta hai, clean working directory restore karta hai — jab beech mein branch switch karna ho bina half-finished commit ke. git stash pop wahin wapas le aata hai.",
        code: `git stash          // shelve current changes
git checkout hotfix
# ... fix urgent bug ...
git checkout feature
git stash pop       // restore exactly where you left off`
      },
      {
        q: "What is the reflog, and when does it save you?",
        a_en: "The reflog is Git's local log of every place HEAD has pointed — every commit, checkout, reset, rebase. After a git reset --hard that discarded commits, git reflog still shows the hash they were at, so git reset --hard <hash> brings them right back — commits are essentially never truly gone until garbage collection eventually runs.",
        a_hi: "Reflog Git ka local log hai — HEAD kahan-kahan point kar chuka hai. git reset --hard ke baad bhi reflog purani commits ka hash dikhata hai, git reset --hard <hash> se wapas mil jaate hain — commits genuinely kabhi lost nahi hote turant.",
        code: `git reflog                    // shows every past HEAD position
git reset --hard HEAD@{2}      // recover from an "accidental" reset`
      },
      {
        q: "What is a Pull Request, and why does it matter more than the merge itself?",
        a_en: "A PR is a formal request to merge one branch into another, but its real value is the structured code-review checkpoint — teammates view the exact diff, comment line-by-line, request changes, and automated CI checks (lint, tests, build) must pass before merging, gatekeeping both human and automated quality.",
        a_hi: "PR ek formal request hai branch merge karne ki, par asli value structured code review hai — teammates diff dekhte hain, line-by-line comment karte hain, changes request karte hain, CI checks pass hona zaroori hai merge se pehle.",
      },
      {
        q: "What is .gitignore for, and why is it your first line of defense against leaked secrets?",
        a_en: ".gitignore lists patterns Git should never track, even if the files exist locally — keeping regenerable files (node_modules) out of version control, and critically keeping secrets (.env) out entirely. Anything ever committed is hard to fully remove from history afterward, which is why prevention via .gitignore matters more than cleanup.",
        a_hi: ".gitignore un patterns ko list karta hai jo Git kabhi track na kare — regenerable files (node_modules) aur critically secrets (.env) bahar rakhta hai. Ek baar commit hone ke baad history se hatana mushkil hai, isliye prevention zaroori hai.",
        code: `node_modules/
.env
.env.local
dist/
*.log`
      },
      {
        q: "What is a Git hook, and what's a practical use for a pre-commit hook?",
        a_en: "A Git hook is a script Git runs automatically at a specific point (living in .git/hooks/, though Husky makes team-wide sharing practical). A pre-commit hook running a linter/formatter rejects a commit that fails checks — enforcing code quality locally, before code even reaches a PR/CI pipeline.",
        a_hi: "Git hook ek script hai jo Git automatically ek specific point pe run karta hai (.git/hooks/ mein, Husky se team-wide share hota hai). pre-commit hook linter/formatter chala kar failing commit reject kar deta hai — code quality PR se pehle hi enforce.",
      },
    ],
  },

  {
    id: "dev-tools", label: "DevTools & Testing", icon: "🛠", color: "#F97316", section: "Tools",
    def_en: "Knowing which tool answers which question — a re-render problem vs a load-time problem vs a bundle-size problem — is what separates guessing from actually diagnosing a real performance or quality issue.",
    def_hi: "Kaunsa tool kaunsa sawaal answer karta hai — re-render problem vs load-time problem vs bundle-size problem — yehi guessing aur real diagnosis ke beech farq karta hai.",
    questions: [
      {
        q: "When do you reach for the React DevTools Profiler vs Lighthouse?",
        a_en: "The Profiler records which components re-rendered, how often, and why — the right tool when you suspect a re-render problem (a page feels sluggish while interacting, but Lighthouse reports fine load scores). Lighthouse audits broad, pre-launch page-load health (Performance, Accessibility, SEO) with standardized, stakeholder-friendly scores.",
        a_hi: "Profiler batata hai kaunsa component kitni baar re-render hua aur kyun — jab interaction ke waqt sluggish lage par Lighthouse load score theek de. Lighthouse broad, pre-launch page-load health audit karta hai (Performance, A11y, SEO) standardized scores ke saath.",
      },
      {
        q: "When do you use the Chrome DevTools Performance tab vs the Network tab?",
        a_en: "The Performance tab records a low-level flame-chart timeline of everything the main thread did — the right tool for finding what's blocking the thread at a precise moment (janky scrolling). The Network tab shows a waterfall of every request — the natural first stop when load time itself, not runtime interaction, is the suspected problem.",
        a_hi: "Performance tab flame-chart timeline record karta hai main thread ki activity ki — janky scrolling jaise problems ke liye. Network tab har request ka waterfall dikhata hai — load time problem ho (runtime interaction nahi) toh yahi first stop.",
      },
      {
        q: "What does a bundle analyzer show you, and when is it the right tool?",
        a_en: "webpack-bundle-analyzer visualizes the production bundle as a size-proportional treemap, showing exactly which dependencies contribute how many bytes — the right tool specifically for bundle-size problems (slow download/parse), distinct from runtime performance which the Profiler covers instead.",
        a_hi: "webpack-bundle-analyzer production bundle ko size-proportional treemap dikhata hai — kaunsi dependency kitne bytes contribute kar rahi hai. Bundle-size problems ke liye sahi tool, runtime performance ke liye nahi (wo Profiler ka kaam hai).",
      },
      {
        q: "How do you use Chrome DevTools' Memory panel to confirm a leak?",
        a_en: "Take a heap snapshot, perform the suspected-leaking action several times (mount/unmount a component), force garbage collection, and take another snapshot — compare what grew. Filtering for 'Detached' DOM nodes (removed from the page but still referenced in JS memory) usually points directly at the retaining reference, often an un-cleaned-up useEffect subscription.",
        a_hi: "Ek heap snapshot lo, suspected action kayi baar karo (mount/unmount), force GC karo, dobara snapshot lo — compare karo kya grow hua. 'Detached' DOM nodes filter karne se retaining reference milta hai, aksar un-cleaned useEffect subscription.",
      },
      {
        q: "Cypress vs Playwright — how do you decide?",
        a_en: "Both offer good auto-waiting ergonomics for E2E tests. Cypress runs inside the browser itself, historically Chromium-focused. Playwright runs via the browser's automation protocol from outside, giving first-class Chromium/Firefox/WebKit support plus native multi-tab and cross-origin support in the same test — generally the stronger default for flows spanning multiple origins (OAuth redirects, payment popups).",
        a_hi: "Dono E2E tests ke liye achhi auto-waiting dete hain. Cypress browser ke andar chalta hai, historically Chromium-focused. Playwright browser ke bahar se automation protocol use karta hai, Chromium/Firefox/WebKit teeno support, multi-tab/cross-origin flows ke liye better default.",
      },
      {
        q: "What is MSW (Mock Service Worker), and why prefer it over jest.mock for API calls?",
        a_en: "MSW intercepts requests at the network layer — component code calls fetch/Axios normally with zero awareness of mocking. This is more realistic than jest.mock('axios'), which replaces the module and can drift out of sync with the real client's behavior. The same handlers work in the browser during dev and in tests — one shared source of truth.",
        a_hi: "MSW network layer pe requests intercept karta hai — component code normally fetch/Axios call karta hai, mocking ka pata bhi nahi chalta. jest.mock se zyaada realistic, jo real client se drift ho sakta hai. Same handlers dev aur tests dono mein chalte hain.",
      },
      {
        q: "When would you reach for Storybook?",
        a_en: "Storybook renders individual components in complete isolation — no routing, no global providers — letting you develop and visually test every prop-driven state (loading, error, empty) independently. It's the right call for a shared component library multiple teams consume, since it doubles as living documentation.",
        a_hi: "Storybook components ko complete isolation mein render karta hai — koi routing/providers nahi — har prop-driven state (loading, error, empty) independently test ho sakti hai. Shared component library ke liye sahi, kyunki ye living documentation bhi ban jaata hai.",
      },
    ],
  },

  {
    id: "sys-design", label: "Frontend System Design", icon: "🏛", color: "#EC4899", section: "Design",
    def_en: "Frontend system design questions test whether you can decompose an ambiguous, large-scale product requirement into concrete architectural decisions — data flow, rendering strategy, and the real tradeoffs each choice makes.",
    def_hi: "Frontend system design questions test karte hain ki tum ek ambiguous, large-scale product requirement ko concrete architectural decisions mein todh sakte ho ya nahi — data flow, rendering strategy, aur har choice ka real tradeoff.",
    questions: [
      {
        q: "Design a real-time collaborative text editor (like Google Docs). What's the hardest part?",
        a_en: "The hardest part isn't the UI — it's merging concurrent edits without corruption. Operational Transforms mathematically transform incoming operations against concurrent ones so they apply correctly regardless of order (what Google Docs uses); CRDTs are a newer alternative where the data structure itself always converges. Add WebSockets for sync, optimistic local updates for instant typing feel, and lightweight presence broadcasts for live cursors.",
        a_hi: "Sabse mushkil hissa UI nahi — concurrent edits ko bina corrupt kiye merge karna hai. Operational Transforms incoming operations ko concurrent operations ke against transform karte hain (Google Docs isi pe hai); CRDTs newer alternative hain jahan data structure khud converge ho jaati hai. WebSockets sync ke liye, optimistic updates instant feel ke liye, presence broadcasts live cursors ke liye.",
      },
      {
        q: "Design a client-side rate limiter for API calls in a SPA.",
        a_en: "Layer it: debounce/throttle at the trigger level for frequent UI events (search-as-you-type). A token-bucket counter for requests that do fire — tokens refill at a steady rate, requests queue once exhausted. Cap concurrent in-flight requests separately. Finally, handle a server's 429 response with exponential backoff rather than immediately retrying.",
        a_hi: "Layer karo: trigger level pe debounce/throttle frequent events ke liye. Token-bucket counter jo fire hone waale requests ko control kare — tokens steady rate se refill hote hain. Concurrent in-flight requests alag se cap karo. Server ka 429 aaye toh exponential backoff karo, turant retry nahi.",
      },
      {
        q: "Design infinite scrolling with cursor-based pagination — why not offset-based?",
        a_en: "Offset pagination (?offset=60) breaks if items are inserted/deleted between requests — offsets shift, causing duplicates or skipped items. Cursor-based pagination uses a stable reference (last item's ID/timestamp) that stays correct regardless of changes elsewhere. Combine with an IntersectionObserver on a bottom sentinel and list virtualization so DOM size stays bounded.",
        a_hi: "Offset pagination (?offset=60) tab tootta hai jab requests ke beech items insert/delete hon — offsets shift ho jaate hain. Cursor-based pagination stable reference use karta hai (last item ka ID) jo hamesha correct rehta hai. IntersectionObserver + list virtualization se DOM size bounded rehta hai.",
      },
      {
        q: "Design a client-side state management system like Redux Toolkit, from first principles.",
        a_en: "A central store holding the single source of truth; pure reducer functions computing new state with no side effects; dispatch as the only sanctioned way to trigger change; a subscription system so components re-render only for the slice they read; and middleware hooks intercepting dispatch for cross-cutting async/logging behavior reducers themselves can't have.",
        a_hi: "Central store jo single source of truth ho; pure reducer functions jo no-side-effect naya state compute karein; dispatch hi state change ka sole tareeka; subscription system jisse components sirf apni slice ke liye re-render hon; middleware hooks jo async/logging cross-cutting behavior handle karein.",
      },
      {
        q: "Design an authentication flow with social login (OAuth) and JWT.",
        a_en: "User clicks 'Sign in with Google' → redirected to Google's own consent screen (frontend never touches the password). Google redirects back with a temporary auth code → your backend (never frontend, needs a secret key) exchanges it for identity tokens. Your backend issues its own JWT, ideally as an HttpOnly cookie, with a refresh-token mechanism for silent re-authentication.",
        a_hi: "User 'Sign in with Google' click karta hai → Google ke consent screen pe redirect (frontend password nahi chhuta). Google temporary auth code ke saath wapas redirect karta hai → backend (frontend nahi, secret key chahiye) usse tokens exchange karta hai. Backend apna JWT issue karta hai, HttpOnly cookie mein.",
      },
      {
        q: "How would you design a UI to handle 1,000+ items in a list efficiently?",
        a_en: "Rendering 1,000+ real DOM nodes is expensive regardless of how optimized each row's render is — the fix is reducing how many nodes exist at once. List virtualization (react-window) renders only visible items plus a small buffer, recycling DOM nodes on scroll. Combine with pagination/infinite scroll at the data layer and React.memo on row components.",
        a_hi: "1,000+ real DOM nodes render karna expensive hai chahe har row kitna bhi optimized ho — fix hai ek time pe kitne nodes exist karte hain wo kam karna. List virtualization (react-window) sirf visible items render karta hai. Pagination + React.memo bhi combine karo.",
      },
      {
        q: "Design a notification system (in-app + push) for a web app.",
        a_en: "Three layers: delivery (a WebSocket/SSE for in-app real-time while the tab is open, a Service Worker + Push API for when it's closed), state (a small store tracking read/unread, synced against the server as source of truth with an optimistic mark-as-read), and UI (a badge, a virtualized dropdown, and critically user-configurable per-category preferences persisted server-side).",
        a_hi: "Teen layers: delivery (WebSocket/SSE tab khula hone pe, Service Worker + Push API tab band hone pe), state (read/unread track karta chhota store, server se sync, optimistic mark-as-read), UI (badge, virtualized dropdown, aur user-configurable preferences server-side saved).",
      },
    ],
  },

  {
    id: "nextjs-core", label: "Next.js Core & Rendering", icon: "▲", color: "#FFFFFF", section: "Next.js",
    def_en: "The mental model behind Next.js: what it adds over plain React, the four rendering strategies (SSR/SSG/ISR/CSR), the Server/Client Component split, hydration, and what the build pipeline actually produces.",
    def_hi: "Next.js ka mental model: plain React ke upar ye kya add karta hai, chaar rendering strategies (SSR/SSG/ISR/CSR), Server/Client Component split, hydration, aur build pipeline actually kya produce karta hai.",
    questions: [
      {
        q: "What is Next.js, and what does it actually give you over plain React (CRA/Vite)?",
        a_en: "React is just a UI library — it renders components, nothing more. Next.js is a framework built on top of React that adds everything a production app needs: file-based routing, multiple rendering strategies (SSR/SSG/ISR/CSR) chosen per route, a built-in bundler (Webpack or Turbopack) with automatic code-splitting, image/font optimization, API/Route Handlers so you don't always need a separate backend, and a production server or static export out of the box. CRA/Vite give you a client-only SPA — everything renders in the browser, hurting SEO and first paint. Next.js lets you choose, per page, how much rendering happens on the server vs the client.",
        a_hi: "React sirf ek UI library hai — components render karta hai, bas. Next.js React ke upar bana framework hai jo production app ki har cheez deta hai: file-based routing, multiple rendering strategies (SSR/SSG/ISR/CSR) jo per-route choose kar sakte ho, built-in bundler (Webpack/Turbopack) automatic code-splitting ke saath, image/font optimization, API/Route Handlers (alag backend ki zaroorat nahi), aur production server ya static export directly. CRA/Vite sirf client-side SPA dete hain — sab kuch browser mein render hota hai, jisse SEO aur first paint dono kharab hote hain. Next.js mein per-page decide kar sakte ho ki kitna rendering server pe ho aur kitna client pe.",
      },
      {
        q: "Explain the rendering strategies: SSR, SSG, ISR, and CSR — differences and when to use each.",
        a_en: "SSG (Static Site Generation): HTML generated once at build time — fastest response since it's served straight from CDN with zero per-request server work. Use for content that doesn't change per request, like marketing pages or docs. SSR (Server-Side Rendering): HTML generated on every request on the server — use when content is personalized or must be fresh on every hit, like a logged-in dashboard. ISR (Incremental Static Regeneration): static like SSG but regenerated in the background after a revalidate window, without a full rebuild — gives static-speed reads with periodic freshness, good for product pages. CSR (Client-Side Rendering): browser fetches data and renders after JS loads — use for highly interactive, non-SEO-critical sections. The trade-off: SSG/ISR optimize for speed and cacheability at the cost of freshness; SSR optimizes for freshness at the cost of server load and slower TTFB; CSR shifts work to the client at the cost of SEO and initial paint.",
        a_hi: "SSG (Static Site Generation): HTML build time pe ek baar generate hota hai — sabse fast response kyunki CDN se seedha serve hota hai, per-request server work zero. Use karo content ke liye jo request-to-request change nahi hota, jaise marketing pages ya docs. SSR (Server-Side Rendering): HTML har request pe server pe generate hota hai — jab content personalized ho ya har hit pe fresh chahiye, jaise logged-in dashboard. ISR (Incremental Static Regeneration): SSG jaisa static, but ek revalidate window ke baad background mein regenerate hota hai, full rebuild ke bina — static-speed reads milte hain periodic freshness ke saath. CSR (Client-Side Rendering): browser JS load hone ke baad data fetch karke render karta hai — highly interactive, non-SEO-critical sections ke liye. Trade-off: SSG/ISR speed/cacheability optimize karte hain freshness ki cost pe; SSR freshness optimize karta hai server load/slow TTFB ki cost pe; CSR kaam client pe shift karta hai SEO/initial paint ki cost pe.",
      },
      {
        q: "What's the difference between the Pages Router and the App Router?",
        a_en: "Pages Router (pages/) is the original model: one file equals one route, data fetching via getStaticProps/getServerSideProps/getStaticPaths exported from the page, and everything renders as a Client Component by default (fully hydrated). App Router (app/, stable since Next 13) is built around React Server Components: components are server-rendered by default with zero client JS unless you opt in with 'use client', routing is folder-based with special files (page.js, layout.js, loading.js, error.js), and data fetching happens directly in async Server Components via fetch/await instead of framework-specific exports. App Router also adds nested layouts, streaming, parallel/intercepting routes, and Server Actions — none of which exist in Pages Router.",
        a_hi: "Pages Router (pages/) original model hai: ek file = ek route, data fetching getStaticProps/getServerSideProps/getStaticPaths se, aur har cheez default mein Client Component ban ke fully hydrate hoti hai. App Router (app/, Next 13 se stable) React Server Components pe based hai: components default server-rendered hote hain, zero client JS jab tak 'use client' na likho, routing folder-based hai special files ke saath (page.js, layout.js, loading.js, error.js), aur data fetching directly async Server Components mein fetch/await se hoti hai. App Router mein nested layouts, streaming, parallel/intercepting routes, aur Server Actions bhi hain — jo Pages Router mein nahi the.",
      },
      {
        q: "What are Server Components vs Client Components — explain the mechanism, not just the syntax.",
        a_en: "In App Router, every component is a Server Component by default: it runs only on the server, is never shipped to the browser as JS, and can directly do server-only things (read a DB, use secrets, await fetch without an API layer). Its output is serialized into a streamable RSC payload sent to the client, which React reconciles into the DOM. Adding 'use client' marks a file (and everything it imports) as a Client Component: it ships as JS, hydrates in the browser, and can use useState/useEffect/browser APIs/event handlers. Server Components reduce client bundle size and let data fetching happen close to the source without an API waterfall; Client Components are for interactivity. Trap: you can't import a Server Component into a Client Component file and expect it to stay server-only — once you cross into 'use client', everything downstream needs to run in the browser unless passed in as children/props from a server parent.",
        a_hi: "App Router mein har component default Server Component hota hai: sirf server pe run hota hai, browser ko JS ke roop mein kabhi nahi bheja jaata, aur direct server-only kaam kar sakta hai (DB read, secrets, API layer ke bina fetch). Iska output ek streamable RSC payload mein serialize hoke client ko jaata hai, jise React DOM mein reconcile karta hai. File ke top pe 'use client' likhne se wo (aur uske saare imports) Client Component ban jaate hain: JS ban ke ship hote hain, browser mein hydrate hote hain, aur useState/useEffect/browser APIs/event handlers use kar sakte hain. Server Components client bundle size kam karte hain aur data source ke paas hi fetch kar lete hain bina API waterfall ke; Client Components interactivity ke liye hain. Trap: ek Server Component ko Client Component file mein import karke server-only rehne ki ummeed mat karo — 'use client' cross karte hi neeche ka poora subtree browser mein hi run hoga, jab tak use server parent se children/props ke through pass na karo.",
      },
      {
        q: "How does hydration work in Next.js, and what causes a hydration mismatch?",
        a_en: "The server renders the initial HTML (from Client Components' server-rendered pass) and sends it already painted. React then hydrates on the client: it walks the same component tree, attaches event listeners, and reconciles it against the existing DOM instead of re-creating it — this is what makes the page interactive without a visible re-render. A hydration mismatch happens when the HTML React generates on the client doesn't match what the server sent — common causes: Date.now()/Math.random()/window/localStorage reads during render, locale-dependent formatting that differs by timezone, or invalid HTML nesting the browser silently fixes before React sees it. Fix: move non-deterministic or browser-only reads into useEffect, or guard with a mounted-state check.",
        a_hi: "Server initial HTML render karta hai (Client Components ke server-rendered pass se) aur already-painted state mein bhejta hai. Phir React client pe hydrate karta hai: same component tree walk karta hai, event listeners attach karta hai, aur existing DOM ko re-create karne ke bajaye reconcile karta hai — isi se page bina visible re-render ke interactive ban jaata hai. Hydration mismatch tab hota hai jab client pe React ka generate kiya HTML server ke bheje HTML se match nahi karta — common causes: render ke dauraan Date.now()/Math.random()/window/localStorage read karna, timezone ke hisaab se alag locale formatting, ya invalid HTML nesting jise browser React se pehle hi silently fix kar deta hai. Fix: non-deterministic ya browser-only reads ko useEffect mein daalo, ya mounted-state check se guard karo.",
      },
      {
        q: "What does the Next.js build actually produce (what's in .next/)?",
        a_en: "next build runs the compiler (Webpack/Turbopack) and produces: pre-rendered HTML for every static/ISR route, a manifest mapping routes to their JS chunks for code-splitting, serialized RSC payloads for Server Components, optimized/minified client bundles split per route plus shared framework chunks, and a BUILD_ID used for cache-busting and detecting stale deployments. For SSR/dynamic routes it produces the server-side render function instead of static HTML. This is why a production server (next start) is meaningfully different from just serving static files — some routes need the Node process alive to render on demand, which is also why output: 'export' (fully static) can't support SSR or Route Handlers.",
        a_hi: "next build compiler (Webpack/Turbopack) chalata hai aur produce karta hai: har static/ISR route ka pre-rendered HTML, routes ko unke JS chunks se map karta manifest (code-splitting ke liye), Server Components ke serialized RSC payloads, per-route optimized/minified client bundles plus shared framework chunks, aur ek BUILD_ID jo cache-busting aur stale deployments detect karne ke liye use hota hai. SSR/dynamic routes ke liye static HTML ke bajaye server-side render function banta hai. Isi wajah se production server (next start) sirf static files serve karne se alag hai — kuch routes ko on-demand render karne ke liye Node process zinda chahiye hota hai, isi liye output: 'export' (fully static) SSR ya Route Handlers support nahi karta.",
      },
      {
        q: "Explain getStaticProps, getServerSideProps, and getStaticPaths (Pages Router) — when does each run?",
        a_en: "getStaticProps runs at build time (and again in the background for ISR revalidation) — output is baked into static HTML, never runs in the browser. getServerSideProps runs on every request, server-side, before the page is sent — good for per-request personalization, but means no CDN caching of the HTML by default. getStaticPaths is required alongside getStaticProps on dynamic routes ([id].tsx) — it tells Next.js which param values to pre-render at build time, and via fallback: true/'blocking'/false controls what happens for paths not pre-rendered. This is legacy for new App Router work but still comes up on existing Pages Router codebases — worth knowing even while explaining you'd reach for generateStaticParams + async Server Components today.",
        a_hi: "getStaticProps build time pe run hota hai (aur ISR revalidation ke liye background mein phir se) — output static HTML mein bake ho jaata hai, browser mein kabhi nahi chalta. getServerSideProps har request pe, server-side, page bhejne se pehle run hota hai — per-request personalization ke liye acha, but iska matlab HTML ki default CDN caching nahi hoti. getStaticPaths dynamic routes ([id].tsx) pe getStaticProps ke saath zaroori hai — batata hai ki build time pe konse param values pre-render karne hain, aur fallback: true/'blocking'/false se decide hota hai ki non-pre-rendered paths ka kya ho. Naye App Router kaam ke liye ye legacy hai but existing Pages Router codebase mein aksar poocha jaata hai — fluent rehna zaroori hai, saath mein ye bhi bata do ki aaj generateStaticParams + async Server Components use karoge.",
      },
      {
        q: "What is ISR, and how does revalidate actually work under the hood?",
        a_en: "With export const revalidate = 60 (App Router) or { revalidate: 60 } (Pages Router), the page is served from the static cache immediately on every request — no one waits for regeneration. Once a request comes in after the 60-second window has elapsed, Next.js serves the now-stale cached page and triggers a regeneration in the background; once that finishes, the cache is swapped for subsequent requests. This is stale-while-revalidate behavior — no single user is ever blocked waiting for a rebuild. On Vercel it's implemented via on-demand functions invoked at the CDN edge rather than a long-running server. Interview trap: ISR doesn't mean the page updates instantly for everyone the moment data changes — there's always at least one stale serve within the window, unless you use on-demand revalidation (revalidatePath/revalidateTag) to invalidate immediately on a mutation.",
        a_hi: "export const revalidate = 60 (App Router) ya { revalidate: 60 } (Pages Router) se, page har request pe turant static cache se serve hota hai — koi bhi regeneration ka wait nahi karta. 60-second window khatam hone ke baad jab request aata hai, Next.js abhi-stale cached page serve karta hai aur background mein regeneration trigger karta hai; wo khatam hone ke baad, cache next requests ke liye swap ho jaata hai. Ye stale-while-revalidate behavior hai — koi bhi single user kabhi rebuild ka wait nahi karta. Vercel pe ye on-demand functions se implement hota hai jo CDN edge pe invoke hote hain, na ki long-running server se. Interview trap: ISR ka matlab ye nahi ki data change hote hi sabke liye page turant update ho jaaye — window ke andar hamesha kam se kam ek stale serve hota hai, jab tak on-demand revalidation (revalidatePath/revalidateTag) se mutation pe turant invalidate na karo.",
      },
      {
        q: "What is streaming SSR, and how does Suspense enable it in Next.js?",
        a_en: "Traditional SSR blocks the whole response until every component (including slow data fetches) finishes — the user sees a blank page until everything is ready. Streaming SSR (built on React 18's renderToReadableStream) sends HTML in chunks as it becomes ready: the shell (layout, nav, static content) is flushed immediately, and any component wrapped in <Suspense fallback={...}> streams in its content later, once its data resolves, without blocking the rest of the page. In App Router this is automatic — wrap a slow Server Component in <Suspense> and Next.js streams it in place, swapping the fallback for real content via a small inline script once the chunk arrives. This directly improves perceived performance (TTFB and FCP happen sooner) even though total data-loading time is unchanged.",
        a_hi: "Traditional SSR poore response ko tab tak block karta hai jab tak har component (slow data fetches sahit) complete nahi ho jaata — user ko sab kuch ready hone tak blank page dikhta hai. Streaming SSR (React 18 ke renderToReadableStream pe based) HTML ko chunks mein bhejta hai jaise-jaise ready hota hai: shell (layout, nav, static content) turant flush hota hai, aur <Suspense fallback={...}> mein wrapped koi bhi component baad mein, data resolve hone pe, apna content stream karta hai — bina baaki page ko block kiye. App Router mein ye automatic hai — slow Server Component ko <Suspense> mein wrap karo aur Next.js usse in-place stream kar deta hai, chunk aane pe ek chhoti inline script se fallback ko real content se swap kar deta hai. Isse perceived performance directly improve hoti hai (TTFB aur FCP jaldi hote hain) chahe total data-loading time same rahe.",
      },
      {
        q: "Edge Runtime vs Node.js runtime — what's the actual difference?",
        a_en: "The Node.js runtime is a full Node process — access to all Node APIs (fs, native modules, longer execution time, more memory), used for most Route Handlers, heavy Server Components, and anything needing a Node-only package. The Edge Runtime is a stripped-down, V8-isolate-based runtime (similar to Cloudflare Workers) that runs geographically close to the user, starts near-instantly, but only supports a subset of Web APIs — no fs, no native Node modules, and a smaller execution time budget. Middleware always runs on the Edge Runtime since it has to run before routing, on every request, so speed matters more than capability. You explicitly opt a Route Handler or page into Edge with export const runtime = 'edge' — worth doing for latency-sensitive, lightweight logic (auth checks, redirects, geolocation), not for anything needing a full Node dependency.",
        a_hi: "Node.js runtime ek full Node process hai — saare Node APIs access karta hai (fs, native modules, zyada execution time, zyada memory), zyaadatar Route Handlers, heavy Server Components, aur Node-only package chahiye wahan use hota hai. Edge Runtime ek stripped-down, V8-isolate-based runtime hai (Cloudflare Workers jaisa) jo user ke geographically close run hota hai, near-instantly start hota hai, but sirf Web APIs ka subset support karta hai — fs nahi, native Node modules nahi, aur execution time budget bhi kam. Middleware hamesha Edge Runtime pe hi chalta hai kyunki routing se pehle, har request pe run hona hai, isliye speed capability se zyada important hai. Route Handler ya page ko explicitly export const runtime = 'edge' se Edge mein daalte ho — latency-sensitive, lightweight logic (auth checks, redirects, geolocation) ke liye achha, Node-only dependency waale kaam ke liye nahi.",
      },
      {
        q: "SSR vs SSG vs CSR — compare TTFB, FCP, and SEO trade-offs directly.",
        a_en: "SSG: best TTFB (served from CDN edge, zero compute), best FCP, full SEO since crawlers get complete HTML immediately. SSR: TTFB is slower than SSG since the server has to render per request (DB calls etc. are in the critical path), but FCP is still reasonable since HTML arrives complete; SEO is fully supported. CSR: fastest TTFB for the shell (empty HTML ships instantly), but FCP/LCP are delayed until JS loads and fetches run, and SEO is weak unless the crawler executes JS (most do now, but it's slower/unreliable and hurts crawl budget at scale). Connect this to Core Web Vitals: SSG/ISR give the best LCP scores by default; CSR risks a poor LCP and layout shift unless carefully managed.",
        a_hi: "SSG: best TTFB (CDN edge se serve, zero compute), best FCP, full SEO kyunki crawlers ko complete HTML turant milta hai. SSR: TTFB SSG se slow hai kyunki server ko per-request render karna padta hai (DB calls critical path mein hote hain), but FCP fir bhi reasonable hai kyunki HTML complete aata hai; SEO fully supported hai. CSR: shell ke liye sabse fast TTFB (empty HTML turant ship), but FCP/LCP tab tak delay hote hain jab tak JS load na ho aur fetches na chalein, aur SEO weak hai jab tak crawler JS execute na kare (aaj-kal zyaadatar karte hain, but slow/unreliable hai aur scale pe crawl budget hurt karta hai). Core Web Vitals se connect karo: SSG/ISR default mein best LCP scores dete hain; CSR mein LCP aur layout shift kharab ho sakte hain agar carefully manage na karo.",
      },
      {
        q: "How does Next.js handle code-splitting automatically?",
        a_en: "Every route gets its own JS chunk by default — visiting /dashboard doesn't download the code for /settings. Shared dependencies (React itself, common UI components) are extracted into shared chunks so they're cached once and reused across routes. Beyond the automatic per-route split, you can manually split with next/dynamic (dynamic(() => import('./Heavy'), { ssr: false })) to lazy-load a component only when needed — common for large third-party widgets. next/link prefetches the JS for linked routes when they enter the viewport, so navigation feels instant despite the splitting — this prefetch-on-visibility behavior is what makes code-splitting invisible to the user in practice.",
        a_hi: "Har route ko default mein apna alag JS chunk milta hai — /dashboard pe jaane se /settings ka code download nahi hota. Shared dependencies (React khud, common UI components) shared chunks mein extract hoti hain taaki ek baar cache hoke saare routes pe reuse ho sakein. Automatic per-route split ke alawa, next/dynamic (dynamic(() => import('./Heavy'), { ssr: false })) se manually bhi split kar sakte ho taaki component sirf zaroorat pe lazy-load ho — bade third-party widgets (charting libraries, rich text editors) ke liye common hai. next/link linked routes ka JS automatically prefetch karta hai jab wo viewport mein aate hain, isliye splitting ke bawajood navigation instant feel hota hai — yahi prefetch-on-visibility behavior hai jo code-splitting ko user ke liye invisible bana deta hai.",
      },
    ],
  },

  {
    id: "nextjs-routing", label: "Next.js Routing & App Router", icon: "🧭", color: "#38BDF8", section: "Next.js",
    def_en: "App Router's file-based routing system — dynamic and catch-all segments, layouts vs templates, loading/error boundaries, parallel and intercepting routes, route groups, middleware, and the Metadata API.",
    def_hi: "App Router ka file-based routing system — dynamic aur catch-all segments, layouts vs templates, loading/error boundaries, parallel aur intercepting routes, route groups, middleware, aur Metadata API.",
    questions: [
      {
        q: "How does folder structure map to routes in the App Router?",
        a_en: "Every folder under app/ is a route segment; a route only becomes publicly accessible once that folder contains a page.js/page.tsx — folders without a page file are just structural (for layouts, colocated components, or grouping) and don't create a URL. So app/dashboard/settings/page.tsx maps to /dashboard/settings. This is a deliberate difference from Pages Router, where every file under pages/ was automatically a route — App Router lets you colocate non-route files (components, tests, styles) inside route folders without accidentally creating new pages.",
        a_hi: "app/ ke andar har folder ek route segment hai; koi route tabhi publicly accessible banta hai jab us folder mein page.js/page.tsx ho — page file ke bina folders sirf structural hote hain (layouts, colocated components, ya grouping ke liye) aur URL nahi banate. Toh app/dashboard/settings/page.tsx /dashboard/settings pe map hota hai. Ye Pages Router se deliberate difference hai, jahan pages/ ke andar har file automatically ek route ban jaati thi — App Router mein non-route files (components, tests, styles) route folders ke andar colocate kar sakte ho bina accidentally naye pages banaye.",
      },
      {
        q: "Dynamic routes ([id]) and catch-all routes ([...slug] vs [[...slug]]) — differences.",
        a_en: "[id] matches a single dynamic segment — app/posts/[id]/page.tsx matches /posts/42, with params.id === '42'. [...slug] is a catch-all — it matches one or more segments (/posts/a/b/c → params.slug === ['a','b','c']), but does not match the base route /posts itself. [[...slug]] (double brackets) is an optional catch-all — it matches everything [...slug] does, plus the base route with params.slug === undefined. Common real use: [[...slug]] for a CMS-driven site where / and /any/nested/path should both resolve through one page component.",
        a_hi: "[id] ek single dynamic segment match karta hai — app/posts/[id]/page.tsx /posts/42 match karta hai, params.id === '42' hoga. [...slug] catch-all hai — ek ya zyaada segments match karta hai (/posts/a/b/c → params.slug === ['a','b','c']), but base route /posts ko khud match nahi karta. [[...slug]] (double brackets) optional catch-all hai — [...slug] jo bhi karta hai wo sab plus base route ko bhi match karta hai jahan params.slug === undefined hoga. Real use: CMS-driven site mein [[...slug]] jahan / aur /any/nested/path dono ek hi page component se resolve hone chahiye.",
      },
      {
        q: "layout.js vs page.js vs template.js — what's the actual difference?",
        a_en: "page.js is the unique, route-terminal UI for a segment. layout.js wraps a segment and all its nested routes, and — critically — persists across navigations within it: it doesn't re-render or lose state when you navigate between child pages, which is why it's the right place for a sidebar or nav bar that shouldn't flicker/remount. template.js looks similar (also wraps children) but creates a new instance on every navigation — state resets, useEffects re-run. Use template.js only when you specifically need that per-navigation reset (e.g. a page-enter animation that must replay every time), which is rare — most nav-shell UI wants layout.js.",
        a_hi: "page.js ek segment ka unique, route-terminal UI hai. layout.js poore segment aur uske saare nested routes ko wrap karta hai, aur — sabse important — usme navigations ke beech persist karta hai: child pages ke beech navigate karne pe re-render ya state lose nahi hota, isliye ye sidebar ya nav bar jaise UI ke liye sahi jagah hai jo flicker/remount nahi hona chahiye. template.js dikhta similar hai (wo bhi children wrap karta hai) but har navigation pe naya instance banata hai — state reset hota hai, useEffects phir se chalte hain. template.js sirf tab use karo jab specifically per-navigation reset chahiye (jaise page-enter animation jo har baar replay ho), jo rare hai — zyaadatar nav-shell UI ko layout.js hi chahiye.",
      },
      {
        q: "loading.js and error.js — how do they integrate with Suspense and Error Boundaries?",
        a_en: "Both are Next.js conventions that compile down to standard React primitives. loading.js automatically wraps the segment's page.js in a <Suspense> boundary and renders as the fallback while the page (and any async Server Components in it) are loading — you don't write the <Suspense> yourself, Next.js does it for you at the routing layer. error.js automatically wraps the segment in an Error Boundary (it must be a Client Component, since Error Boundaries rely on component lifecycle, which doesn't exist for Server Components) and renders when a rendering or data-fetching error is thrown anywhere in that segment; it receives an error object and a reset() function to retry rendering. Together they give you route-level loading and error UI with no manual boilerplate, and because they're scoped per-segment, a slow/broken nested route doesn't necessarily take down the whole page.",
        a_hi: "Dono Next.js conventions hain jo standard React primitives mein compile ho jaate hain. loading.js automatically segment ke page.js ko <Suspense> boundary mein wrap karta hai aur page (aur uske andar ke async Server Components) load hone tak fallback render karta hai — <Suspense> khud nahi likhna padta, Next.js routing layer pe khud kar deta hai. error.js automatically segment ko Error Boundary mein wrap karta hai (ye Client Component hona zaroori hai kyunki Error Boundaries component lifecycle pe depend karte hain jo Server Components mein nahi hota) aur render hota hai jab us segment mein kahin bhi rendering ya data-fetching error throw ho; isse ek error object aur retry ke liye reset() function milta hai. Dono milke route-level loading aur error UI dete hain bina manual boilerplate ke, aur per-segment scoped hone ki wajah se, ek slow/broken nested route poore page ko down nahi karta.",
      },
      {
        q: "Parallel routes (@slot) — what problem do they solve?",
        a_en: "Parallel routes let you render two or more independent pages in the same layout simultaneously, each with its own loading/error state — e.g. a dashboard with @analytics and @team slots that load independently, so a slow analytics query doesn't block the team panel from appearing. Defined with a @folder naming convention (app/@analytics/page.tsx), and the parent layout.js receives them as named props ({ children, analytics, team }) to place wherever needed. Without parallel routes, you'd need one Server Component fetching everything sequentially or a client-side waterfall to fake this independence.",
        a_hi: "Parallel routes se ek hi layout mein do ya zyaada independent pages ek saath render kar sakte ho, har ek ka apna loading/error state — jaise ek dashboard jisme @analytics aur @team slots independently load hote hain, isliye slow analytics query team panel ko block nahi karti. @folder naming convention se define hota hai (app/@analytics/page.tsx), aur parent layout.js unhe named props ({ children, analytics, team }) ke through receive karta hai jahan chahe place kar sakte ho. Parallel routes ke bina, ek Server Component sequentially sab fetch karta ya client-side waterfall se ye independence fake karni padti.",
      },
      {
        q: "Intercepting routes — what are they for?",
        a_en: "Intercepting routes let a route render within the current layout (e.g. as a modal over a feed) when navigated to from within the app, while still rendering as a full standalone page if the URL is hit directly (a hard refresh or shared link). The classic example is Instagram/Twitter-style photo modals: clicking a photo from the feed opens it as an overlay without leaving the feed behind it, but pasting that photo's URL directly loads the full standalone page. Implemented with (.), (..), (..)(..), or (...) folder prefixes indicating how many segment levels up to intercept from, combined with a parallel route slot to render the modal alongside the underlying page.",
        a_hi: "Intercepting routes se ek route current layout ke andar hi render ho sakta hai (jaise feed ke upar modal) jab app ke andar se navigate kiya jaaye, lekin URL directly hit karne pe (hard refresh ya shared link) wo full standalone page ki tarah render hota hai. Classic example Instagram/Twitter-style photo modals hai: feed se photo click karne pe wo overlay ki tarah khulta hai piche feed rakhte hue, but us photo ka URL directly paste karne pe full standalone page load hota hai. Ye (.), (..), (..)(..), ya (...) folder prefixes se implement hota hai jo batate hain kitne segment levels upar se intercept karna hai, saath mein parallel route slot jo underlying page ke saath modal render karta hai.",
      },
      {
        q: "Route groups — (folderName) — what's their purpose?",
        a_en: "Wrapping a folder name in parentheses, e.g. app/(marketing)/about/page.tsx, organizes routes without adding a segment to the URL — /about, not /marketing/about. Common uses: applying a different root layout to a subset of routes (e.g. a (marketing) group with a public layout and an (app) group with an authenticated-shell layout, both under the same app/ root without one being nested inside the other's URL), or just organizing a large route tree without affecting URLs.",
        a_hi: "Folder name ko parentheses mein wrap karna, jaise app/(marketing)/about/page.tsx, routes ko organize karta hai bina URL mein segment add kiye — /about banega, /marketing/about nahi. Common uses: routes ke subset pe alag root layout apply karna (jaise (marketing) group public layout ke saath aur (app) group authenticated-shell layout ke saath, dono same app/ root ke neeche bina ek doosre ke URL mein nest hue), ya bas ek bada route tree organize karna bina URLs affect kiye.",
      },
      {
        q: "generateStaticParams — how does it replace getStaticPaths?",
        a_en: "It's the App Router equivalent for dynamic routes: an async function exported from page.js that returns an array of param objects ([{ id: '1' }, { id: '2' }]), telling Next.js which paths to pre-render at build time. Unlike getStaticPaths, it doesn't need a paired fallback config exported separately — dynamic behavior for params not returned is controlled by dynamicParams (defaults to true, meaning un-listed params are rendered on-demand and cached, similar to fallback: 'blocking'). It also composes naturally with nested dynamic segments — you can generate params for a child route based on the parent's already-generated params.",
        a_hi: "Ye dynamic routes ke liye App Router ka equivalent hai: page.js se export hone waala async function jo param objects ka array return karta hai ([{ id: '1' }, { id: '2' }]), Next.js ko batata hai konse paths build time pe pre-render karne hain. getStaticPaths se alag, isko alag se paired fallback config export karne ki zaroorat nahi — jo params return nahi hue unka dynamic behavior dynamicParams se control hota hai (default true hai, matlab un-listed params on-demand render + cache hote hain, fallback: 'blocking' jaisa). Ye nested dynamic segments ke saath naturally compose bhi hota hai — child route ke params parent ke already-generated params ke basis pe generate kar sakte ho.",
      },
      {
        q: "Middleware in Next.js — what is it, where does it run, and what's it good for?",
        a_en: "A single middleware.ts file at the project root exports a function that runs before a request is matched to a route — on the Edge Runtime, for every request matching its configured matcher. It can inspect/modify the request, rewrite or redirect, set headers/cookies, or short-circuit with a response entirely. Common uses: auth gating (redirect unauthenticated users before they ever reach a protected page), A/B testing (rewrite to a variant based on a cookie), geolocation-based redirects, and bot detection. Because it runs on Edge, it can't do things like direct DB queries with a Node-only driver — it's meant to be a fast, lightweight gate, not a place for business logic. This is the sharpest contrast with Express middleware, which runs in a full Node process mid-request-lifecycle with no such runtime restriction.",
        a_hi: "Project root mein ek single middleware.ts file ek function export karti hai jo request ko route se match hone se pehle run hota hai — Edge Runtime pe, har request pe jo uske configured matcher se match kare. Ye request ko inspect/modify kar sakta hai, rewrite ya redirect kar sakta hai, headers/cookies set kar sakta hai, ya poori tarah response se short-circuit kar sakta hai. Common uses: auth gating (unauthenticated users ko protected page tak pahunchne se pehle hi redirect), A/B testing (cookie ke basis pe variant pe rewrite), geolocation-based redirects, aur bot detection. Edge pe chalne ki wajah se ye Node-only driver se direct DB queries nahi kar sakta — ye ek fast, lightweight gate hone ke liye hai, business logic ki jagah nahi. Express middleware se sabse sharp contrast yahi hai, jo full Node process mein mid-request-lifecycle mein chalta hai bina aisi kisi runtime restriction ke.",
      },
      {
        q: "How does next/link implement client-side navigation and prefetching?",
        a_en: "<Link> intercepts the click, prevents a full page reload, and uses the History API (pushState) to update the URL while App Router's client-side transition logic fetches just the new segment's data/RSC payload and patches the DOM — this is the Router Cache doing its job. Prefetching happens automatically: when a <Link> enters the viewport (via IntersectionObserver), Next.js prefetches the linked route's JS and, for static routes, its rendered payload, in the background — so by the time the user actually clicks, the navigation feels instant because the work already happened. This is why nav bars with many links don't feel like they're spamming requests — prefetch is throttled and only fires for visible links.",
        a_hi: "<Link> click ko intercept karta hai, full page reload rokta hai, aur History API (pushState) se URL update karta hai jabki App Router ka client-side transition logic sirf naye segment ka data/RSC payload fetch karke DOM patch karta hai — ye Router Cache ka kaam hai. Prefetching automatically hoti hai: jab <Link> viewport mein aata hai (IntersectionObserver se), Next.js background mein linked route ka JS aur, static routes ke liye, uska rendered payload prefetch kar leta hai — isliye jab user actually click karta hai, navigation instant feel hota hai kyunki kaam pehle hi ho chuka hota hai. Isi wajah se bahut saare links waale nav bars requests spam nahi karte lagte — prefetch throttled hota hai aur sirf visible links ke liye fire hota hai.",
      },
      {
        q: "next/navigation vs next/router — why the split?",
        a_en: "next/router (useRouter, withRouter) is the Pages Router API. next/navigation (useRouter, usePathname, useSearchParams, redirect) is the App Router API, and the two are not interchangeable — importing from the wrong one in the wrong router throws at runtime. Key behavioral difference: App Router's useRouter().push() doesn't include query-string helpers the old API had, since URL/search-param state is meant to be read via useSearchParams (a Client Component hook) rather than baked into the router object. Also worth knowing: redirect() from next/navigation can be called directly inside a Server Component (it throws a special error Next.js catches to perform the redirect), which has no Pages Router equivalent.",
        a_hi: "next/router (useRouter, withRouter) Pages Router ka API hai. next/navigation (useRouter, usePathname, useSearchParams, redirect) App Router ka API hai, aur dono interchangeable nahi hain — galat router mein galat wale se import karne pe runtime pe error aata hai. Key behavioral difference: App Router ke useRouter().push() mein query-string helpers nahi hain jo old API mein the, kyunki URL/search-param state ab useSearchParams (ek Client Component hook) se read hota hai, router object mein baked nahi hota. Ye bhi jaanna zaroori: next/navigation ka redirect() Server Component ke andar directly call ho sakta hai (ye ek special error throw karta hai jise Next.js catch karke redirect perform karta hai), jiska Pages Router mein koi equivalent nahi hai.",
      },
      {
        q: "The Metadata API — how does SEO/<head> management work in the App Router?",
        a_en: "Instead of a <Head> component (Pages Router), you export a metadata object (static) or a generateMetadata async function (dynamic — e.g. needs to fetch a blog post's title) from page.js/layout.js. Next.js merges metadata from nested layouts and the page automatically — a shared layout can set a default title.template, and each page fills in title, which gets composed together, so you don't have to redeclare boilerplate meta tags on every page. generateMetadata runs on the server, can await the same data-fetching used by the page (and Next.js deduplicates that fetch via Request Memoization, so it's not fetched twice), and supports OpenGraph, Twitter cards, and dynamic OG image generation via the ImageResponse API.",
        a_hi: "<Head> component (Pages Router) ki jagah, ab page.js/layout.js se ek metadata object (static) ya generateMetadata async function (dynamic — jaise blog post ka title fetch karna ho) export karte ho. Next.js nested layouts aur page se metadata ko automatically merge karta hai — shared layout ek default title.template set kar sakta hai, aur har page apna title fill karta hai jo compose ho jaata hai, isliye har page pe boilerplate meta tags dobara likhne ki zaroorat nahi. generateMetadata server pe run hota hai, page waali hi data-fetching await kar sakta hai (aur Next.js Request Memoization se us fetch ko dedupe kar deta hai, dobara fetch nahi hota), aur OpenGraph, Twitter cards, aur ImageResponse API se dynamic OG image generation support karta hai.",
      },
    ],
  },

  {
    id: "nextjs-data", label: "Next.js Data Fetching & Caching", icon: "🗄", color: "#A78BFA", section: "Next.js",
    def_en: "How fetch caching, the four caching layers, on-demand revalidation, and Server vs Client data fetching actually work — including how to avoid request waterfalls.",
    def_hi: "fetch caching, chaar caching layers, on-demand revalidation, aur Server vs Client data fetching actually kaise kaam karte hain — request waterfalls avoid karna bhi included.",
    questions: [
      {
        q: "How does fetch caching work by default in the App Router?",
        a_en: "Next.js extends the native fetch API with caching semantics baked in. By default, fetch(url) inside a Server Component is cached indefinitely (force-cache) — equivalent to SSG behavior for that data. fetch(url, { cache: 'no-store' }) opts out entirely, fetching fresh on every request — equivalent to SSR. fetch(url, { next: { revalidate: 60 } }) gives you ISR-style time-based revalidation for that specific fetch, independent of the rest of the page. This is a deliberate design choice: caching is controlled per-fetch-call, not just per-route, so a single page can have some data that's static and some that's always fresh.",
        a_hi: "Next.js native fetch API ko caching semantics ke saath extend karta hai. Default mein, Server Component ke andar fetch(url) indefinitely cache hota hai (force-cache) — us data ke liye SSG jaisa behavior. fetch(url, { cache: 'no-store' }) poori tarah opt-out karta hai, har request pe fresh fetch karta hai — SSR jaisa. fetch(url, { next: { revalidate: 60 } }) us specific fetch ke liye ISR-style time-based revalidation deta hai, baaki page se independent. Ye deliberate design choice hai: caching per-fetch-call control hoti hai, sirf per-route nahi, isliye ek hi page mein kuch data static ho sakta hai aur kuch hamesha fresh.",
      },
      {
        q: "Explain the four Next.js caching layers.",
        a_en: "1. Request Memoization — within a single render pass, identical fetch calls (same URL + options) are automatically deduplicated: call the same fetch in three different components rendering the same request, and only one network call happens. Scoped to one request only, cleared after. 2. Data Cache — persists across requests and deployments (server-side), controlled by the fetch cache options above — this is what makes SSG/ISR possible. 3. Full Route Cache — Next.js caches the rendered output (HTML + RSC payload) of static routes at build time, separate from the Data Cache underneath it. 4. Router Cache (client-side) — an in-browser cache of visited/prefetched route segments, so back/forward navigation and revisits within a session don't re-fetch from the server at all. 'Next.js caching' isn't one thing — a bug where data seems stale often means the wrong layer was invalidated.",
        a_hi: "1. Request Memoization — ek single render pass ke andar, identical fetch calls (same URL + options) automatically dedupe ho jaate hain: teen alag components mein same fetch call karo, sirf ek network call hoga. Sirf ek request tak scoped, baad mein clear ho jaata hai. 2. Data Cache — requests aur deployments ke across persist karta hai (server-side), fetch cache options se control hota hai — isi se SSG/ISR possible hai. 3. Full Route Cache — Next.js static routes ka rendered output (HTML + RSC payload) build time pe cache karta hai, Data Cache se alag layer. 4. Router Cache (client-side) — visited/prefetched route segments ka in-browser cache, isliye back/forward navigation aur session ke andar revisits server se re-fetch nahi karte. 'Next.js caching' ek cheez nahi hai — data stale lage toh usually galat layer invalidate hui hoti hai.",
      },
      {
        q: "How do you opt a specific fetch out of caching?",
        a_en: "fetch(url, { cache: 'no-store' }) for a one-off dynamic fetch, or export const dynamic = 'force-dynamic' at the page/layout level to make the whole route opt out of static rendering entirely (equivalent to old-style SSR for that route). There's also export const fetchCache = 'force-no-store' to apply it to every fetch in a segment without touching each call individually.",
        a_hi: "Ek-off dynamic fetch ke liye fetch(url, { cache: 'no-store' }), ya poore route ko static rendering se opt-out karane ke liye page/layout level pe export const dynamic = 'force-dynamic' (us route ke liye old-style SSR jaisa). Ek export const fetchCache = 'force-no-store' bhi hai jo segment ke har fetch pe apply hota hai bina har call ko individually touch kiye.",
      },
      {
        q: "revalidatePath vs revalidateTag — differences and when to use each.",
        a_en: "Both are on-demand invalidation, typically called from a Server Action or Route Handler after a mutation (e.g. after creating a blog post, immediately invalidate the listing page instead of waiting for the ISR window). revalidatePath('/blog') invalidates the cache for that specific route (and, with the layout option, its full subtree). revalidateTag('posts') invalidates every cached fetch anywhere in the app tagged with { next: { tags: ['posts'] } } — more flexible when the same data is used across multiple, unrelated routes (a 'posts' tag might back both a listing page and a homepage widget), since you invalidate by data identity rather than having to know every URL that depends on it.",
        a_hi: "Dono on-demand invalidation hain, typically mutation ke baad Server Action ya Route Handler se call hote hain (jaise blog post create hone ke baad listing page ko turant invalidate karna, ISR window ka wait kiye bina). revalidatePath('/blog') us specific route ka cache invalidate karta hai (aur layout option ke saath, uska poora subtree). revalidateTag('posts') app mein kahin bhi { next: { tags: ['posts'] } } se tagged har cached fetch ko invalidate karta hai — jyaada flexible jab same data multiple, unrelated routes mein use ho (ek 'posts' tag listing page aur homepage widget dono ke peeche ho sakta hai), kyunki tum data identity se invalidate karte ho, har URL yaad rakhne ki zaroorat nahi.",
      },
      {
        q: "How do Server Components fetch data differently from Client Components?",
        a_en: "A Server Component can be async and await fetch(...) directly in the component body — no useEffect, no loading state management, because the component simply doesn't render until the promise resolves (with loading.js/Suspense handling the interim UI at the route level). A Client Component can't be async in this way (React doesn't support async client components for rendering) — it has to fetch via useEffect + useState, or a library like SWR/React Query, and manage loading/error state explicitly, exactly as in plain React. The practical implication: prefer fetching in Server Components whenever the data doesn't need to react to client-side interaction — it eliminates client-server waterfalls and loading spinners entirely for that data.",
        a_hi: "Server Component async ho sakta hai aur component body mein directly await fetch(...) kar sakta hai — useEffect nahi chahiye, loading state manage nahi karna, kyunki component tab tak render hi nahi hota jab tak promise resolve na ho (loading.js/Suspense route level pe interim UI handle karte hain). Client Component is tarah async nahi ho sakta (React async client components render support nahi karta) — usse useEffect + useState, ya SWR/React Query jaisi library se fetch karna padta hai, aur loading/error state explicitly manage karna padta hai, bilkul plain React jaisa. Practical implication: jahan bhi data ko client-side interaction pe react nahi karna, wahan Server Components mein fetch karna prefer karo — isse us data ke liye client-server waterfalls aur loading spinners poori tarah khatam ho jaate hain.",
      },
      {
        q: "What's a request waterfall, and how do you avoid it in Server Components?",
        a_en: "A waterfall happens when independent data fetches run sequentially because one await blocks the next, even though nothing actually depends on the earlier result — e.g. await getUser() then await getPosts() in sequence when they don't depend on each other, doubling the total wait. Fix: kick off both fetches without awaiting immediately, then await together — const [user, posts] = await Promise.all([getUser(), getPosts()]) — same principle as parallelizing independent async calls in any Node backend. In Server Components specifically, this also applies across the component tree: passing a fetch promise down to a child (rather than the awaited value) and letting the child await/use() it lets sibling fetches at different levels of the tree still run in parallel instead of blocking on parent-first resolution.",
        a_hi: "Waterfall tab hota hai jab independent data fetches sequentially chalte hain kyunki ek await agle ko block karta hai, jabki actually koi dependency hi nahi hoti — jaise await getUser() phir await getPosts() sequence mein jab dono ek doosre pe depend nahi karte, total wait double ho jaata hai. Fix: dono fetches ko turant await kiye bina start karo, phir saath mein await karo — const [user, posts] = await Promise.all([getUser(), getPosts()]) — same principle jo kisi bhi Node backend mein independent async calls parallelize karne ka hai. Server Components mein specifically ye component tree ke across bhi lagu hota hai: awaited value ki jagah fetch promise ko child ko pass karke aur child ko await/use() karne dekar, tree ke alag levels ke sibling fetches parent-first resolution pe block hue bina parallel chal sakte hain.",
      },
      {
        q: "How does Next.js handle environment variables, and what does NEXT_PUBLIC_ actually do?",
        a_en: "Env vars in .env.local/.env.production are available in server-side code (Server Components, Route Handlers, getServerSideProps) via process.env automatically. Anything prefixed NEXT_PUBLIC_ is additionally inlined into the client JS bundle at build time — the build process does a literal string replacement, so process.env.NEXT_PUBLIC_API_URL becomes the actual string value in the shipped bundle. This means a NEXT_PUBLIC_ variable is genuinely public — visible to anyone inspecting the bundle — so secrets must never use that prefix. It also means changing a NEXT_PUBLIC_ value requires a rebuild, not just a server restart, since it's baked in at compile time rather than read at runtime.",
        a_hi: ".env.local/.env.production ke env vars server-side code (Server Components, Route Handlers, getServerSideProps) mein process.env se automatically available hote hain. NEXT_PUBLIC_ prefix waale koi bhi build time pe client JS bundle mein bhi inline ho jaate hain — build process ek literal string replacement karta hai, toh process.env.NEXT_PUBLIC_API_URL shipped bundle mein actual string value ban jaata hai. Matlab NEXT_PUBLIC_ variable genuinely public hai — bundle inspect karne waale ko dikh jaayega — isliye secrets ko kabhi ye prefix nahi dena chahiye. Isse ye bhi matlab hai ki NEXT_PUBLIC_ value change karne pe rebuild chahiye, sirf server restart se kaam nahi chalega, kyunki ye compile time pe baked hota hai, runtime pe read nahi hota.",
      },
      {
        q: "SWR/React Query vs Server Component data fetching — when do you still need a client library?",
        a_en: "Server Component fetching covers the initial render well, but it can't handle data that needs to update without a full navigation — polling, refetch-on-window-focus, optimistic updates, or client-driven pagination/search where re-running a server round-trip on every keystroke would be too slow. SWR/React Query still earn their place for that: client-side cache with revalidation strategies, deduping, and mutation helpers that Server Components don't provide (Server Components run once per request; they have no client-side cache concept of their own beyond the Router Cache). Common pattern: use a Server Component for the initial/SEO-relevant data, then hydrate a client-side query library with that data as initialData for any further client-driven interaction.",
        a_hi: "Server Component fetching initial render ke liye achhi hai, but usse ye data handle nahi ho sakta jise bina full navigation ke update hona ho — polling, refetch-on-window-focus, optimistic updates, ya client-driven pagination/search jahan har keystroke pe server round-trip re-run karna bahut slow ho jaayega. Yahan SWR/React Query apni jagah banate hain: client-side cache with revalidation strategies, deduping, aur mutation helpers jo Server Components nahi dete (Server Components har request pe ek baar run hote hain; Router Cache ke alawa unka apna koi client-side cache concept nahi hota). Common pattern: initial/SEO-relevant data ke liye Server Component use karo, phir usi data ko initialData ke roop mein client-side query library ko hydrate kar do aage ke client-driven interaction ke liye.",
      },
      {
        q: "How do you handle pagination or infinite scroll with Server Components?",
        a_en: "Two common approaches: (1) URL-driven pagination — ?page=2 read via the searchParams prop on the page, with each page a normal server-rendered navigation (works well for SEO-relevant, discrete pagination); (2) a Server Component for the initial page plus a Client Component (using a Server Action or Route Handler) to fetch subsequent pages on scroll/click without a full navigation, appending to client state. For infinite scroll specifically, option 2 is standard, since option 1 would mean a full page reload per scroll trigger, which defeats the UX goal.",
        a_hi: "Do common approaches: (1) URL-driven pagination — page pe searchParams prop se ?page=2 read karna, har page ek normal server-rendered navigation (SEO-relevant, discrete pagination ke liye achha kaam karta hai); (2) initial page ke liye Server Component plus ek Client Component (Server Action ya Route Handler use karke) jo scroll/click pe agle pages fetch kare bina full navigation ke, aur client state mein append kare. Infinite scroll ke liye specifically option 2 hi standard hai, kyunki option 1 mein har scroll trigger pe full page reload hoga, jo UX goal ko hi khatam kar dega.",
      },
      {
        q: "Walk through exactly how Request Memoization deduplicates a fetch.",
        a_en: "Within one server render pass, Next.js patches fetch to keep an in-memory map keyed by the request's URL + options (headers, method, body). If a Server Component calls fetch('/api/user') and, deeper in the tree, another component calls the exact same fetch('/api/user') again, the second call returns the same in-flight/resolved promise instead of issuing a second network request — this only works for fetch itself (not arbitrary DB clients, unless you wrap them similarly with React.cache()). This matters practically because it means you don't have to manually thread fetched data down through props to avoid duplicate calls — you can call the same fetch independently in multiple components and trust the dedup, which keeps components decoupled.",
        a_hi: "Ek server render pass ke andar, Next.js fetch ko patch karke ek in-memory map rakhta hai jo request ke URL + options (headers, method, body) se key hoti hai. Agar ek Server Component fetch('/api/user') call kare aur tree mein neeche koi aur component wahi exact fetch('/api/user') dobara call kare, toh doosri call same in-flight/resolved promise return karti hai, doosri network request nahi hoti — ye sirf fetch ke liye kaam karta hai (arbitrary DB clients ke liye nahi, jab tak unhe similarly React.cache() se wrap na karo). Ye practically isliye matter karta hai kyunki fetched data ko duplicate calls avoid karne ke liye manually props se thread nahi karna padta — same fetch ko independently multiple components mein call kar sakte ho aur dedup pe trust kar sakte ho, jisse components decoupled rehte hain.",
      },
    ],
  },

  {
    id: "nextjs-actions", label: "Next.js Server Actions & Middleware", icon: "⚙", color: "#34D399", section: "Next.js",
    def_en: "Server Actions as RPC-over-HTTP, form handling and progressive enhancement, securing actions like any public endpoint, Route Handlers, and how Next.js middleware compares to Express.",
    def_hi: "Server Actions as RPC-over-HTTP, form handling aur progressive enhancement, actions ko kisi bhi public endpoint jaisa secure karna, Route Handlers, aur Next.js middleware Express se kaise alag hai.",
    questions: [
      {
        q: "What are Server Actions, and how do they work under the hood?",
        a_en: "A Server Action is an async function marked with 'use server' (either at the top of the function or the file) that can be called directly from a Client (or Server) Component — most commonly as a form's action prop. Under the hood, Next.js doesn't actually execute it in the browser: it generates a unique, opaque endpoint reference for it, and calling it from the client triggers a POST request to that endpoint, serializing the arguments across the wire — functionally an RPC call, even though it reads like a plain function call in your code. This is why Server Actions can safely touch a database or secrets directly (they run server-side) while being invoked with normal-looking JS syntax on the client.",
        a_hi: "Server Action ek async function hai jise 'use server' se mark kiya jaata hai (function ke top pe ya file ke top pe) jise Client (ya Server) Component se directly call kar sakte ho — sabse common form ke action prop ke roop mein. Under the hood, Next.js isse actually browser mein execute nahi karta: iske liye ek unique, opaque endpoint reference generate karta hai, aur client se call karne pe us endpoint pe ek POST request trigger hoti hai jo arguments ko wire ke across serialize karti hai — functionally ek RPC call, chahe code mein ye plain function call jaisa dikhe. Isi wajah se Server Actions safely DB ya secrets directly touch kar sakte hain (server-side run hote hain) jabki client pe normal-dikhne wale JS syntax se invoke hote hain.",
      },
      {
        q: "How do Server Actions change form handling compared to a traditional client onSubmit?",
        a_en: "<form action={myServerAction}> submits directly to the server action — no onSubmit, no manual fetch/axios call, no manually serializing FormData, since the action receives the native FormData object as its argument. Combined with revalidatePath/revalidateTag inside the action, a form submission can trigger a mutation and a cache invalidation in one round trip, with Next.js automatically re-rendering the affected Server Components. Compare to the Pages Router era: you'd write a POST handler in pages/api, an Axios call in the component, and manual state management for loading/error — Server Actions collapse most of that boilerplate.",
        a_hi: "<form action={myServerAction}> directly server action ko submit karta hai — na onSubmit chahiye, na manual fetch/axios call, na FormData manually serialize karna, kyunki action ko native FormData object argument ke roop mein milta hai. Action ke andar revalidatePath/revalidateTag ke saath combine karke, ek form submission ek hi round trip mein mutation aur cache invalidation dono trigger kar sakta hai, aur Next.js automatically affected Server Components ko re-render kar deta hai. Pages Router era se compare karo: pages/api mein POST handler likhna padta, component mein Axios call, aur loading/error ke liye manual state management — Server Actions ye zyaadatar boilerplate khatam kar dete hain.",
      },
      {
        q: "What does 'progressive enhancement' mean for Server Actions, and why does it matter?",
        a_en: "A form using a Server Action as its action works even before the client JS has hydrated, and even with JS disabled — because it's a real HTML form submission under the hood (the browser natively POSTs to the action's endpoint), not something that only works via an onClick handler wired up after hydration. This is genuinely different from a typical SPA form. Practically, it means a slow 3G connection or a JS error elsewhere on the page doesn't necessarily break form submission — it degrades to a full-page POST/reload instead of silently doing nothing.",
        a_hi: "Server Action ko action ke roop mein use karne waala form client JS hydrate hone se pehle bhi kaam karta hai, aur JS disabled hone pe bhi — kyunki under the hood ye ek real HTML form submission hai (browser natively action ke endpoint pe POST karta hai), sirf hydration ke baad wire hue onClick handler pe depend nahi karta. Ye typical SPA form se genuinely alag hai. Practically, matlab slow 3G connection ya page pe kahin aur JS error hone se form submission zaroori nahi break ho — ye silently kuch na karne ke bajaye full-page POST/reload mein degrade ho jaata hai.",
      },
      {
        q: "Server Actions are effectively public HTTP endpoints — how do you secure them?",
        a_en: "Exactly like any API endpoint: never assume the client that called it is the one you expect. Inside the action itself, re-check authentication (read the session/cookie server-side) and authorization (does this user own this resource / have this role) before performing the mutation — the same never-trust-the-frontend principle as any REST endpoint, because a Server Action's endpoint can be called directly (e.g. via fetch with crafted FormData) bypassing your UI entirely. Also validate/sanitize the incoming FormData with a schema library (Zod is the common pairing) rather than trusting field presence or types.",
        a_hi: "Bilkul kisi bhi API endpoint jaisa: kabhi ye assume mat karo ki jisne call kiya wahi client hai jo tum expect karte ho. Action ke andar hi, mutation perform karne se pehle authentication re-check karo (session/cookie server-side pe read karo) aur authorization bhi (kya ye user resource ka owner hai / iska role hai) — bilkul wahi never-trust-the-frontend principle jo kisi REST endpoint pe lagta hai, kyunki Server Action ka endpoint directly call ho sakta hai (jaise crafted FormData ke saath fetch se) UI ko poori tarah bypass karke. Incoming FormData ko bhi ek schema library (Zod common pairing hai) se validate/sanitize karo, field presence ya types pe trust karne ke bajaye.",
      },
      {
        q: "Route Handlers (app/api/.../route.js) vs the old Pages Router API routes — differences.",
        a_en: "Route Handlers export named functions per HTTP method (GET, POST, PUT, DELETE) instead of one default handler switching on req.method, and use the standard Web Request/Response objects instead of Node's req/res — meaning they can run on either the Node or Edge runtime, unlike old API routes which were Node-only. They also compose with the same caching model as Server Component fetch calls (a GET Route Handler is cached by default unless it reads dynamic data like cookies/headers, which auto-opts it into dynamic rendering). Functionally they fill the same role — build a REST-ish endpoint inside the Next.js app — but Server Actions have taken over most form-mutation use cases, leaving Route Handlers mainly for webhooks, third-party integrations, and endpoints genuinely meant to be called from outside the app.",
        a_hi: "Route Handlers ek default handler jo req.method pe switch karta hai uski jagah har HTTP method (GET, POST, PUT, DELETE) ke liye named functions export karte hain, aur Node ke req/res ki jagah standard Web Request/Response objects use karte hain — matlab ye Node ya Edge dono runtime pe chal sakte hain, jabki purane API routes sirf Node-only the. Ye Server Component fetch calls jaise hi caching model se bhi compose hote hain (GET Route Handler default mein cached hota hai jab tak dynamic data jaise cookies/headers na padhe, jo usse auto dynamic rendering mein daal deta hai). Functionally inka role same hai — Next.js app ke andar ek REST-ish endpoint banana — but Server Actions ne zyaadatar form-mutation use cases le liye hain, Route Handlers mainly webhooks, third-party integrations, aur genuinely app ke bahar se call hone waale endpoints ke liye reh gaye hain.",
      },
      {
        q: "How do you implement authentication in Next.js — outline a realistic flow.",
        a_en: "Typical setup: credentials checked server-side (Route Handler or Server Action), a session token (JWT or an opaque session ID) set as an httpOnly cookie so client JS can't read/steal it directly. middleware.ts checks for that cookie on protected route patterns and redirects to /login if absent/invalid — this gate runs before any protected page's code executes, so unauthenticated users never even trigger the page's data fetching. Inside Server Components/Server Actions, the session is read again from the cookie (via cookies() from next/headers) to know who's making the request — auth libraries like NextAuth/Auth.js or Clerk wrap most of this (session management, providers, refresh) so it's rarely built fully from scratch, but understanding the underlying cookie + middleware + server-side re-verification flow is what interviewers actually want to hear, not just a library name.",
        a_hi: "Typical setup: credentials server-side check hote hain (Route Handler ya Server Action), ek session token (JWT ya opaque session ID) httpOnly cookie ke roop mein set hota hai taaki client JS usse directly read/steal na kar sake. middleware.ts protected route patterns pe us cookie ko check karta hai aur absent/invalid hone pe /login pe redirect kar deta hai — ye gate kisi bhi protected page ka code chalne se pehle run hota hai, isliye unauthenticated users page ki data fetching kabhi trigger hi nahi karte. Server Components/Server Actions ke andar, session ko dobara cookie se read karte ho (next/headers ke cookies() se) ye jaanne ke liye ki request kaun kar raha hai — NextAuth/Auth.js ya Clerk jaisi auth libraries zyaadatar ye wrap kar deti hain (session management, providers, refresh), isliye scratch se poora banaya kam hi jaata hai, but underlying cookie + middleware + server-side re-verification flow samajhna hi wo hai jo interviewers actually sunna chahte hain, sirf library ka naam nahi.",
      },
      {
        q: "How is Next.js middleware fundamentally different from Express middleware?",
        a_en: "Express middleware runs inside a long-lived Node process, has access to the full Node runtime, and sits directly in the request-handling pipeline alongside your routes (app.use(authMiddleware)). Next.js middleware runs on the Edge Runtime, geographically distributed, executes before the request is even routed to a page/Route Handler (not interleaved with them), and is restricted to Web APIs only — no Node-specific packages, no direct DB drivers in most cases. It's also single-file and matcher-config-driven (one middleware.ts, scoped via a matcher array or config export) rather than Express's chain of many discrete app.use() calls. The practical consequence: Next.js middleware is meant for fast, stateless gating logic — not a place to reimplement a full Express-style middleware chain.",
        a_hi: "Express middleware ek long-lived Node process ke andar chalta hai, full Node runtime access karta hai, aur tumhare routes ke saath directly request-handling pipeline mein baitha hota hai (app.use(authMiddleware)). Next.js middleware Edge Runtime pe chalta hai, geographically distributed, request page/Route Handler pe route hone se pehle hi execute hota hai (unke saath interleaved nahi), aur sirf Web APIs tak restricted hai — zyaadatar mein Node-specific packages nahi, direct DB drivers nahi. Ye single-file aur matcher-config-driven bhi hai (ek middleware.ts, matcher array ya config export se scoped), Express ke bahut saare discrete app.use() calls ki chain jaisa nahi. Practical consequence: Next.js middleware fast, stateless gating logic ke liye hai — poori Express-style middleware chain reimplement karne ki jagah nahi.",
      },
    ],
  },

  {
    id: "nextjs-perf", label: "Next.js Performance & Production", icon: "🚀", color: "#FBBF24", section: "Next.js",
    def_en: "Production-facing optimizations — next/image and next/font, Core Web Vitals, bundle-size reduction, static export, deployment trade-offs (Vercel vs self-hosted), Turbopack, and i18n.",
    def_hi: "Production-facing optimizations — next/image aur next/font, Core Web Vitals, bundle-size reduction, static export, deployment trade-offs (Vercel vs self-hosted), Turbopack, aur i18n.",
    questions: [
      {
        q: "How does next/image automatic optimization actually work?",
        a_en: "<Image> doesn't just render an <img> tag — at request time (or build time for static images), Next.js resizes the source image to the exact dimensions needed for the current viewport/device (via srcset), converts it to a modern format (WebP/AVIF) when the browser supports it, lazy-loads by default (images off-screen don't load until they approach the viewport), and requires explicit width/height (or fill) specifically to prevent layout shift — the browser can reserve the correct space before the image loads, directly improving CLS. Optimized images are cached (on Vercel, at the CDN edge) so the resize cost is paid once per unique size/format combination, not per request.",
        a_hi: "<Image> sirf ek <img> tag render nahi karta — request time pe (ya static images ke liye build time pe), Next.js source image ko current viewport/device ke liye exact dimensions mein resize karta hai (srcset se), browser support karta ho toh modern format (WebP/AVIF) mein convert karta hai, default mein lazy-load karta hai (off-screen images tab tak load nahi hoti jab tak viewport ke paas na aayein), aur specifically layout shift rokne ke liye explicit width/height (ya fill) maangta hai — browser image load hone se pehle hi sahi space reserve kar leta hai, jisse CLS directly improve hoti hai. Optimized images cache hoti hain (Vercel pe CDN edge pe) taaki resize cost sirf ek baar per unique size/format combination pe lage, har request pe nahi.",
      },
      {
        q: "How does next/font eliminate layout shift from web fonts?",
        a_en: "Traditional web font loading (a <link> to Google Fonts) causes FOUT/FOIT (flash of unstyled/invisible text) and layout shift once the custom font swaps in and reflows text at a different size/width. next/font downloads the font files at build time and self-hosts them alongside your other static assets — no runtime request to an external font provider at all (a genuine privacy/performance win, since the browser never contacts Google's servers). It also auto-generates size-adjust CSS descriptors that make the fallback system font metrically match the custom font's dimensions, so even before the real font loads, the reserved space is already correct — meaningfully improving CLS scores.",
        a_hi: "Traditional web font loading (Google Fonts ka <link>) FOUT/FOIT (flash of unstyled/invisible text) aur layout shift cause karta hai jab custom font swap hoke text ko alag size/width mein reflow karta hai. next/font build time pe font files download karke unhe tumhare baaki static assets ke saath self-host kar deta hai — external font provider ko koi runtime request hi nahi jaati (genuine privacy/performance win, kyunki browser Google ke servers se kabhi contact hi nahi karta). Ye size-adjust CSS descriptors bhi auto-generate karta hai jo fallback system font ko custom font ke dimensions se metrically match kara dete hain, isliye real font load hone se pehle hi reserved space sahi hota hai — CLS scores meaningfully improve karta hai.",
      },
      {
        q: "What are Core Web Vitals, and how does Next.js help improve them?",
        a_en: "LCP (Largest Contentful Paint — how fast the main content appears): improved by SSG/ISR (HTML ready immediately), next/image priority loading for above-the-fold images, and streaming so the shell paints fast. CLS (Cumulative Layout Shift — visual stability): improved by next/image's enforced dimensions and next/font's fallback-matching. INP (Interaction to Next Paint, replaced FID — responsiveness to input): improved by smaller client bundles (Server Components ship less JS) and code-splitting so the main thread isn't blocked by unnecessary hydration work. These aren't automatic just because you used Next.js — they're enabled by using its features correctly (choosing the right rendering mode, actually using next/image/next/font), and a poorly built Next.js app can still score badly.",
        a_hi: "LCP (Largest Contentful Paint — main content kitni jaldi dikhta hai): SSG/ISR se improve hota hai (HTML turant ready), above-the-fold images ke liye next/image priority loading se, aur streaming se jisse shell jaldi paint ho. CLS (Cumulative Layout Shift — visual stability): next/image ki enforced dimensions aur next/font ki fallback-matching se improve hoti hai. INP (Interaction to Next Paint, FID ki jagah — input pe responsiveness): chhote client bundles (Server Components kam JS bhejte hain) aur code-splitting se improve hota hai taaki main thread unnecessary hydration work se block na ho. Ye sab sirf Next.js use karne se automatic nahi ho jaata — ye tabhi enable hota hai jab uske features sahi se use karo (sahi rendering mode choose karna, actually next/image/next/font use karna), aur ek badly-built Next.js app fir bhi kharab score kar sakta hai.",
      },
      {
        q: "How do you analyze and reduce bundle size in a Next.js app?",
        a_en: "@next/bundle-analyzer (wraps the build output in a visual treemap) is the standard first step — it shows exactly which dependencies are contributing the most bytes. From there: move non-essential heavy libraries behind next/dynamic with ssr: false so they don't block initial render or ship in the main bundle; audit for accidentally importing an entire library when only one function is needed (e.g. import _ from 'lodash' vs import debounce from 'lodash/debounce'); and push logic into Server Components wherever it doesn't need interactivity, since Server Component code never ships to the client at all — the single biggest bundle-size lever in App Router apps is simply not marking things 'use client' unless they need to be.",
        a_hi: "@next/bundle-analyzer (build output ko visual treemap mein wrap karta hai) standard first step hai — exactly dikhata hai konsi dependencies sabse zyaada bytes contribute kar rahi hain. Uske baad: non-essential heavy libraries ko next/dynamic ke andar ssr: false ke saath rakho taaki wo initial render block na karein ya main bundle mein na ship hon; check karo kahin poori library accidentally import toh nahi ho rahi jab sirf ek function chahiye (jaise import _ from 'lodash' vs import debounce from 'lodash/debounce'); aur jahan interactivity ki zaroorat nahi wahan logic ko Server Components mein push karo, kyunki Server Component code client ko kabhi ship hi nahi hota — App Router apps mein sabse bada bundle-size lever bas ye hai ki jab tak zaroorat na ho tab tak cheezon ko 'use client' mark hi mat karo.",
      },
      {
        q: "output: 'export' (static export) — what does it do, and what are its limitations?",
        a_en: "It produces a fully static site (plain HTML/CSS/JS files, no Node server needed at runtime) — deployable to any static host (S3, GitHub Pages, Netlify's static tier) rather than requiring a Next.js-aware server. The trade-off: everything must be statically determinable at build time — no SSR, no Route Handlers with dynamic logic, no Server Actions, no Image Optimization API (unless you configure an external loader), and middleware.ts doesn't run. It's the right choice for a genuinely static site (docs, marketing) where you specifically want to avoid running any server infrastructure — but it forfeits most of what makes App Router distinctive, so it's worth explaining why you'd choose it over ISR (answer: zero server cost/infrastructure, not performance — ISR is often just as fast while keeping dynamic capability available).",
        a_hi: "Ye ek fully static site produce karta hai (plain HTML/CSS/JS files, runtime pe Node server ki zaroorat nahi) — kisi bhi static host (S3, GitHub Pages, Netlify ka static tier) pe deploy ho sakta hai, Next.js-aware server ki zaroorat nahi. Trade-off: sab kuch build time pe statically determinable hona chahiye — SSR nahi, dynamic logic waale Route Handlers nahi, Server Actions nahi, Image Optimization API nahi (jab tak external loader configure na karo), aur middleware.ts run nahi hota. Ye genuinely static site (docs, marketing) ke liye sahi choice hai jahan specifically koi server infrastructure hi nahi chalana — but App Router ki khaasiyat ka zyaadatar hissa iske saath chhut jaata hai, isliye ISR ke upar ise choose karne ki wajah samjha sako (answer: zero server cost/infrastructure, performance nahi — ISR aksar utna hi fast hota hai dynamic capability ke saath).",
      },
      {
        q: "Vercel vs self-hosted (Node server) vs Docker deployment — trade-offs.",
        a_en: "Vercel (built by the Next.js team) gives you zero-config ISR, Edge Middleware, Image Optimization, and automatic per-route serverless/edge function splitting — the framework's more advanced caching/revalidation features are most seamless there since the platform and framework are co-designed. Self-hosting with next start on a plain Node server gives full control and no vendor lock-in, but you're responsible for implementing equivalent CDN caching, and some features (like on-demand ISR at true CDN-edge speed) need to be approximated manually (e.g. with a reverse proxy/CDN in front). Docker is common for self-hosting in a containerized/Kubernetes environment — next build supports a 'standalone' output mode specifically to produce a minimal, self-contained server bundle for exactly this. Next.js isn't Vercel-locked at a technical level, but some of its most-marketed caching behavior is easiest to get for free there — self-hosting means understanding and replicating that yourself.",
        a_hi: "Vercel (Next.js team ne khud banaya) zero-config ISR, Edge Middleware, Image Optimization, aur automatic per-route serverless/edge function splitting deta hai — framework ke advanced caching/revalidation features wahan sabse seamless hain kyunki platform aur framework saath design hue hain. Plain Node server pe next start se self-hosting full control aur no vendor lock-in deta hai, but equivalent CDN caching implement karne ki zimmedari tumhari hoti hai, aur kuch features (jaise true CDN-edge speed pe on-demand ISR) manually approximate karne padte hain (jaise ek reverse proxy/CDN aage laga ke). Containerized/Kubernetes environment mein self-hosting ke liye Docker common hai — next build ka 'standalone' output mode exactly isi ke liye ek minimal, self-contained server bundle banata hai. Next.js technically Vercel-locked nahi hai, but iska sabse marketed caching behavior wahan free mein sabse aasan milta hai — self-hosting ka matlab hai wo khud samajhna aur replicate karna.",
      },
      {
        q: "What is Turbopack, and how does it differ from Webpack in the Next.js build pipeline?",
        a_en: "Turbopack is a Rust-based bundler (built by the Next.js/Vercel team as Webpack's eventual successor) designed around incremental, function-level caching — rather than re-bundling affected modules broadly on a change, it caches computation at a much finer grain so subsequent builds/HMR updates are dramatically faster, especially on large codebases. It's used via next dev --turbo (and increasingly for production builds) as an opt-in/gradually-stabilizing replacement for Webpack, aiming for compatibility with the existing Webpack loader/plugin ecosystem rather than requiring a rewrite of build config. It's primarily a dev-experience/build-speed play, not a change to Next.js's runtime rendering behavior — SSR/SSG/ISR work identically regardless of which bundler produced the JS.",
        a_hi: "Turbopack ek Rust-based bundler hai (Next.js/Vercel team ne Webpack ke eventual successor ke roop mein banaya) jo incremental, function-level caching ke around design hua hai — change hone pe broadly affected modules re-bundle karne ke bajaye, ye computation ko bahut finer grain pe cache karta hai taaki subsequent builds/HMR updates dramatically faster hon, especially bade codebases pe. Ye next dev --turbo se use hota hai (aur increasingly production builds ke liye bhi) as an opt-in/gradually-stabilizing Webpack replacement, existing Webpack loader/plugin ecosystem ke saath compatibility ka target rakhte hue, build config rewrite karne ki zaroorat ke bina. Ye primarily ek dev-experience/build-speed play hai, Next.js ke runtime rendering behavior mein koi change nahi — SSR/SSG/ISR bilkul same kaam karte hain chahe JS konsa bhi bundler bana raha ho.",
      },
      {
        q: "How do you implement internationalization (i18n) in the App Router?",
        a_en: "App Router removed the built-in i18n config object that Pages Router had — i18n routing is now typically implemented manually: a [locale] dynamic segment at the root of app/ (app/[locale]/page.tsx), middleware that detects the user's preferred locale (via Accept-Language header or a cookie) and redirects/rewrites to the correct /en/... or /fr/... path, and a locale-aware layout.js that loads the right translation dictionary and sets lang on <html>. Libraries like next-intl wrap this pattern (locale-scoped routing, translation loading, formatting helpers) rather than reinventing it — worth naming one if asked, but understanding the underlying [locale] segment + middleware mechanism is the substance of the answer.",
        a_hi: "App Router ne wo built-in i18n config object hata diya jo Pages Router mein tha — ab i18n routing typically manually implement hoti hai: app/ ke root pe ek [locale] dynamic segment (app/[locale]/page.tsx), middleware jo user ki preferred locale detect kare (Accept-Language header ya cookie se) aur sahi /en/... ya /fr/... path pe redirect/rewrite kare, aur ek locale-aware layout.js jo sahi translation dictionary load kare aur <html> pe lang set kare. next-intl jaisi libraries is pattern ko wrap karti hain (locale-scoped routing, translation loading, formatting helpers) reinvent karne ke bajaye — poochhe jaane pe ek naam le sakte ho, but underlying [locale] segment + middleware mechanism samajhna hi jawab ka asli hissa hai.",
      },
      {
        q: "Interview scenario: how would you decide between SSR, SSG, ISR, or CSR for a given page? Give a decision framework.",
        a_en: "Walk it as a sequence of questions, not a memorized rule: (1) Does this page need to be indexed by search engines / shared with a rich preview? If yes, rule out pure CSR. (2) Is the content the same for every visitor, or does it vary per-user/per-request? Same-for-everyone → static (SSG/ISR). Per-user (a personalized dashboard, an authenticated account page) → SSR, or CSR behind auth if SEO doesn't matter for it at all. (3) If static, how often does the underlying data change? Rarely (docs, marketing) → SSG. Periodically (product listings, articles) → ISR with a revalidate tuned to how stale you can tolerate, or on-demand revalidation triggered by the actual mutation (e.g. a CMS webhook calling revalidateTag). (4) Is there a highly interactive sub-section that doesn't need to be part of the initial render? Keep the page's shell static/server-rendered, and carve out just that interactive piece as a Client Component rather than making the whole page CSR. Stating it as a framework like this — rather than jumping straight to an answer — is exactly what signals experience-level thinking in a live interview, since real pages are rarely 100% one strategy; most production pages in App Router mix a server-rendered shell with a few targeted Client Component islands.",
        a_hi: "Isko questions ki sequence ki tarah socho, memorized rule ki tarah nahi: (1) Kya ye page search engines mein index hona chahiye / rich preview ke saath share hona chahiye? Haan toh pure CSR rule out karo. (2) Kya content har visitor ke liye same hai, ya per-user/per-request vary karta hai? Sabke liye same → static (SSG/ISR). Per-user (personalized dashboard, authenticated account page) → SSR, ya agar SEO matter hi nahi karta toh auth ke piche CSR. (3) Agar static hai, toh underlying data kitni baar change hota hai? Rarely (docs, marketing) → SSG. Periodically (product listings, articles) → ISR jiska revalidate tune ho ke tum kitna stale tolerate kar sakte ho, ya actual mutation se trigger hone waali on-demand revalidation (jaise CMS webhook revalidateTag call kare). (4) Kya koi highly interactive sub-section hai jo initial render ka hissa hone ki zaroorat nahi? Page ke shell ko static/server-rendered rehne do, aur sirf us interactive piece ko Client Component ke roop mein carve out karo, poore page ko CSR banane ke bajaye. Isko ek framework ki tarah bolna — seedha jawab pe kudne ke bajaye — yehi hai jo live interview mein experience-level thinking signal karta hai, kyunki real pages kabhi 100% ek strategy nahi hote; App Router mein zyaadatar production pages ek server-rendered shell ko kuch targeted Client Component islands ke saath mix karte hain.",
      },
    ],
  },
];

const CATEGORIES = [...CATEGORIES_BASE, ...NODE_THEORY_CATEGORIES];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.questions.length, 0);

const ALL_QUESTIONS = CATEGORIES.flatMap(c =>
  c.questions.map((q, i) => ({
    ...q,
    catId: c.id,
    catLabel: c.label,
    catIcon: c.icon,
    catColor: c.color,
    catSection: c.section,
    qIndexInCat: i,
  }))
);

const PAGE_SIZE = 12;

function getPageNumbers(current, total) {
  if (total <= 1) return [1];
  const delta = 1;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i);
  const pages = [1];
  if (range[0] > 2) pages.push("…");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

const SECTION_META = {
  JavaScript: { label: "JS", color: "#F7DF1E" },
  React: { label: "REACT", color: "#61DAFB" },
  "Next.js": { label: "NEXT.JS", color: "#FFFFFF" },
  CSS: { label: "CSS", color: "#2965F1" },
  TypeScript: { label: "TS", color: "#8B5CF6" },
  "Node.js": { label: "NODE.JS", color: "#68A063" },
  Browser: { label: "WEB & SEC", color: "#FB7185" },
  Performance: { label: "PERF", color: "#34D399" },
  Tools: { label: "GIT & TOOLS", color: "#F97316" },
  Design: { label: "DESIGN", color: "#EC4899" },
};
const SECTION_ORDER = ["JavaScript", "React", "Next.js", "CSS", "TypeScript", "Node.js", "Browser", "Performance", "Tools", "Design"];
const SECTIONS = SECTION_ORDER
  .map(name => ({ name, ...SECTION_META[name], cats: CATEGORIES.filter(c => c.section === name) }))
  .filter(s => s.cats.length > 0);

const TabRow = ({ cats, label, labelColor, activeCat, reviewed, switchCat }) => {
  const scrollRef = useRef(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current.down = true;
    drag.current.startX = e.pageX;
    drag.current.startScroll = el.scrollLeft;
    drag.current.moved = 0;
    el.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    const el = scrollRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.pageX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    const el = scrollRef.current;
    if (el) el.style.cursor = "grab";
    drag.current.down = false;
  };

  const onCatClick = (id) => {
    if (drag.current.moved > 6) return;
    switchCat(id);
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #111120" }}>
      <div style={{
        writingMode: "vertical-rl", textOrientation: "mixed",
        fontFamily: "'Manrope', sans-serif", fontSize: 9, letterSpacing: 3,
        color: labelColor, textTransform: "uppercase",
        padding: "6px 6px 6px 8px",
        borderRight: `1px solid ${labelColor}22`,
        background: `${labelColor}08`,
        display: "flex", alignItems: "center",
      }}>{label}</div>
      <div
        ref={scrollRef}
        className="no-scrollbar"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{ display: "flex", overflowX: "auto", flex: 1, cursor: "grab", userSelect: "none" }}
      >
        {cats.map(c => {
          const isActive = activeCat === c.id;
          const done = c.questions.filter((_, i) => reviewed[`${c.id}-${i}`]).length;
          return (
            <button key={c.id} onClick={() => onCatClick(c.id)} style={{
              position: "relative",
              background: isActive ? `${c.color}16` : "none",
              border: isActive ? `1px solid ${c.color}55` : "1px solid transparent",
              borderBottom: isActive ? `1px solid ${c.color}16` : "1px solid transparent",
              borderRadius: "10px 10px 0 0",
              padding: "8px 12px 7px",
              cursor: "pointer", color: isActive ? c.color : "#3a3a5a",
              fontFamily: "'Manrope', sans-serif", fontSize: 10, letterSpacing: 1,
              textTransform: "uppercase", whiteSpace: "nowrap",
              transition: "all 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              marginBottom: -1,
              flexShrink: 0,
              zIndex: isActive ? 2 : 1,
            }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              <span>{c.label}</span>
              <span style={{
                fontSize: 9,
                color: done === c.questions.length && done > 0 ? c.color : "#222240",
              }}>{done}/{c.questions.length}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [activeCat, setActiveCat] = useState(() => loadLastCategory("js-core"));
  const [openIdx, setOpenIdx] = useState(null);
  const [search, setSearch] = useState("");
  const [reviewed, setReviewed] = useState(loadReviewed);
  const [lang, setLang] = useState("both");
  const [mode, setMode] = useState("theory");
  const [showAll, setShowAll] = useState(true);
  const [sectionFilter, setSectionFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [openSection, setOpenSection] = useState(null);

  const cat = CATEGORIES.find(c => c.id === activeCat);
  const accent = cat.color;
  const reviewedCount = Object.keys(reviewed).length;
  const progressPct = TOTAL ? Math.round((reviewedCount / TOTAL) * 100) : 0;
  const isFlatView = showAll || !!sectionFilter;

  const filtered = useMemo(() => {
    const source = showAll
      ? ALL_QUESTIONS
      : sectionFilter
      ? ALL_QUESTIONS.filter(q => q.catSection === sectionFilter)
      : cat.questions;
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(item =>
      item.q.toLowerCase().includes(q) ||
      (item.a_en && item.a_en.toLowerCase().includes(q)) ||
      (item.a_hi && item.a_hi.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      ((showAll || sectionFilter) && item.catLabel.toLowerCase().includes(q))
    );
  }, [search, cat, showAll, sectionFilter]);

  const totalPages = isFlatView ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const safePage = Math.min(page, totalPages);
  const pageItems = isFlatView ? filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) : filtered;

  const goToPage = (p) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
    setOpenIdx(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify({
        completedTasks: Object.keys(reviewed),
        lastVisited: Date.now(),
        currentTopic: activeCat,
      }));
    } catch { /* storage unavailable/full — progress just won't persist */ }
  }, [reviewed, activeCat]);

  const switchCat = (id) => { setActiveCat(id); setShowAll(false); setSectionFilter(null); setOpenIdx(null); setSearch(""); setPage(1); };
  const toggleReviewed = (key, e) => {
    e.stopPropagation();
    setReviewed(p => { const n = { ...p }; n[key] ? delete n[key] : (n[key] = true); return n; });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070f",
      color: "#d8d4cc",
      fontFamily: "'Manrope', sans-serif",
    }}>
      <div style={{
        background: "linear-gradient(180deg, #0c0c1e 0%, #07070f 100%)",
        padding: "28px 24px 22px",
        borderBottom: "1px solid #111120",
      }}>
        <div style={{ maxWidth: "min(1400px, 96vw)", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, letterSpacing: 4, color: accent, textTransform: "uppercase", marginBottom: 8, transition: "color 0.3s" }}>
                Interview Prep · Bilingual
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 4.5vw, 40px)", fontWeight: 400, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Frontend Interview Prep<br />
                <span style={{ color: accent, transition: "color 0.3s" }}>EN + Hinglish</span>
              </h1>
              <p style={{ margin: "8px 0 0", color: "#444", fontSize: 13, lineHeight: 1.6 }}>
                {TOTAL} questions · {CATEGORIES.length} topics · Code examples
              </p>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{
              background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12,
              padding: "12px 16px", textAlign: "center", minWidth: 100,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5, whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1, transition: "color 0.3s" }}>
                  {reviewedCount}
                </span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: "#555", letterSpacing: 0.5 }}>
                  /{TOTAL} done
                </span>
              </div>
              <div style={{ marginTop: 6, height: 3, background: "#1a1a30", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: accent, borderRadius: 99, transition: "width 0.4s, background 0.3s" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 4, background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 8, padding: 3, width: "fit-content" }}>
                {[
                  { id: "en", label: "🇬🇧 EN" },
                  { id: "hi", label: "🇮🇳 HI" },
                  { id: "both", label: "BOTH" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setLang(opt.id)} style={{
                    background: lang === opt.id ? accent + "22" : "transparent",
                    border: "none", borderRadius: 6, padding: "6px 14px",
                    color: lang === opt.id ? accent : "#555",
                    fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1.5,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 4, background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 8, padding: 3, width: "fit-content" }}>
                {[
                  { id: "theory", label: "📚 Theory" },
                  { id: "coding", label: "💻 Coding" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setMode(opt.id)} style={{
                    background: mode === opt.id ? accent + "22" : "transparent",
                    border: "none", borderRadius: 6, padding: "6px 14px",
                    color: mode === opt.id ? accent : "#555",
                    fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1.5,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12,
              padding: "12px 16px", textAlign: "center", minWidth: 100,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5, whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1, transition: "color 0.3s" }}>
                  {progressPct}%
                </span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, color: "#555", letterSpacing: 0.5 }}>
                  complete
                </span>
              </div>
              <div style={{ marginTop: 6, height: 3, background: "#1a1a30", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: accent, borderRadius: 99, transition: "width 0.4s, background 0.3s" }} />
              </div>
            </div>
          </div>

          {mode === "theory" && (
            <div style={{ marginTop: 12, position: "relative", maxWidth: 480 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setOpenIdx(null); setPage(1); }}
                placeholder={showAll ? "Search all questions..." : sectionFilter ? `Search "${sectionFilter}"...` : `Search "${cat.label}"...`}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#0c0c1a", border: "1px solid #1a1a2e",
                  borderRadius: 8, padding: "9px 12px 9px 34px",
                  color: "#ccc", fontFamily: "'Manrope', sans-serif", fontSize: 13, outline: "none",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {mode === "theory" ? <>
      <div style={{ background: "#07070f", position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid #111120", padding: "0 24px" }}>
        <div style={{ maxWidth: "min(1400px, 96vw)", margin: "0 auto" }}>
          <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 0" }}>
            <button
              onClick={() => { setShowAll(true); setSectionFilter(null); setOpenSection(null); setOpenIdx(null); setSearch(""); setPage(1); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                background: showAll ? `${accent}22` : "#0c0c1a",
                border: `1px solid ${showAll ? accent + "55" : "#1a1a2e"}`,
                borderRadius: 20, padding: "6px 12px",
                color: showAll ? accent : "#666",
                fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              📋 ALL
            </button>
            {SECTIONS.map(s => {
              const isOpenSection = openSection === s.name;
              const isActiveSection = !showAll && (sectionFilter === s.name || (!sectionFilter && cat.section === s.name));
              return (
                <button
                  key={s.name}
                  onClick={() => {
                    const changingSection = showAll || sectionFilter !== s.name;
                    setShowAll(false);
                    setSectionFilter(s.name);
                    if (changingSection) {
                      setOpenIdx(null);
                      setSearch("");
                      setPage(1);
                    }
                    setOpenSection(o => (o === s.name ? null : s.name));
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                    background: isOpenSection ? `${s.color}22` : isActiveSection ? `${s.color}12` : "#0c0c1a",
                    border: `1px solid ${isOpenSection || isActiveSection ? s.color + "55" : "#1a1a2e"}`,
                    borderRadius: 20, padding: "6px 12px",
                    color: isOpenSection || isActiveSection ? s.color : "#666",
                    fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1,
                    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                  }}
                >
                  {s.label}
                  <span style={{ display: "inline-block", fontSize: 9, transform: isOpenSection ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
              );
            })}
          </div>
          {openSection && (() => {
            const section = SECTIONS.find(s => s.name === openSection);
            return (
              <div style={{ paddingBottom: 4 }}>
                <TabRow cats={section.cats} label={section.label} labelColor={section.color} activeCat={activeCat} reviewed={reviewed} switchCat={switchCat} />
              </div>
            );
          })()}
        </div>
      </div>

      <div style={{ maxWidth: "min(1400px, 96vw)", margin: "0 auto", padding: "22px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {showAll ? (
            <>
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 9, letterSpacing: 3,
                padding: "3px 10px", borderRadius: 99, textTransform: "uppercase",
                background: `${accent}12`, color: accent, border: `1px solid ${accent}22`,
              }}>All Topics</span>
              <span style={{ color: "#222240", fontFamily: "'Manrope', sans-serif", fontSize: 11 }}>›</span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: accent, letterSpacing: 2, textTransform: "uppercase", transition: "color 0.3s" }}>
                📋 All Questions
              </span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: "#222240", marginLeft: "auto" }}>
                {filtered.length} Q · Page {safePage}/{totalPages}
              </span>
            </>
          ) : sectionFilter ? (
            <>
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 9, letterSpacing: 3,
                padding: "3px 10px", borderRadius: 99, textTransform: "uppercase",
                background: `${(SECTION_META[sectionFilter] || {}).color || accent}12`,
                color: (SECTION_META[sectionFilter] || {}).color || accent,
                border: `1px solid ${(SECTION_META[sectionFilter] || {}).color || accent}22`,
              }}>{sectionFilter}</span>
              <span style={{ color: "#222240", fontFamily: "'Manrope', sans-serif", fontSize: 11 }}>›</span>
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", transition: "color 0.3s",
                color: (SECTION_META[sectionFilter] || {}).color || accent,
              }}>
                📋 All {sectionFilter} Questions
              </span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: "#222240", marginLeft: "auto" }}>
                {filtered.length} Q · Page {safePage}/{totalPages}
              </span>
            </>
          ) : (
            <>
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 9, letterSpacing: 3,
                padding: "3px 10px", borderRadius: 99, textTransform: "uppercase",
                background: `${(SECTION_META[cat.section] || {}).color || accent}12`,
                color: (SECTION_META[cat.section] || {}).color || accent,
                border: `1px solid ${(SECTION_META[cat.section] || {}).color || accent}22`,
              }}>{cat.section}</span>
              <span style={{ color: "#222240", fontFamily: "'Manrope', sans-serif", fontSize: 11 }}>›</span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: accent, letterSpacing: 2, textTransform: "uppercase", transition: "color 0.3s" }}>
                {cat.icon} {cat.label}
              </span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 9, color: "#222240", marginLeft: "auto" }}>
                {cat.questions.length} Q
              </span>
            </>
          )}
        </div>

        {!isFlatView && !search && (
          <div style={{ marginBottom: 18 }}>
            {(lang === "en" || lang === "both") && cat.def_en && (
              <div style={{
                padding: "14px 18px", borderRadius: 10,
                background: `${accent}08`, border: `1px solid ${accent}22`,
                position: "relative", marginBottom: lang === "both" ? 8 : 0,
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent, borderRadius: "10px 0 0 10px", transition: "background 0.3s" }} />
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 8, letterSpacing: 3, color: accent, textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s" }}>
                  🇬🇧 Definition · English
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "#9e9a92" }}>
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
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 8, letterSpacing: 3, color: accent, textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s" }}>
                  🇮🇳 Definition · Hinglish
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "#9e9a92" }}>
                  {cat.def_hi}
                </p>
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#333", padding: "60px 0", fontFamily: "'Manrope', sans-serif", fontSize: 14 }}>
            No questions match "{search}"
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {pageItems.map((item, i) => {
            const realIdx = isFlatView ? item.qIndexInCat : cat.questions.indexOf(item);
            const key = isFlatView ? `${item.catId}-${item.qIndexInCat}` : `${activeCat}-${realIdx}`;
            const itemAccent = isFlatView ? item.catColor : accent;
            const isOpen = openIdx === i;
            const isDone = !!reviewed[key];

            return (
              <div key={key} style={{
                border: `1px solid ${isOpen ? itemAccent + "55" : isDone ? "#1a2e1a" : "#111120"}`,
                borderRadius: 10, overflow: "hidden",
                background: isOpen ? `${itemAccent}07` : isDone ? "#090f09" : "transparent",
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
                    fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 700,
                    color: isDone ? "#4CAF50" : isOpen ? itemAccent : "#222240",
                    minWidth: 26, transition: "color 0.2s",
                  }}>
                    {isDone ? "✓" : `Q${String(realIdx + 1).padStart(2, "0")}`}
                  </span>
                  {isFlatView && (
                    <span style={{
                      fontFamily: "'Manrope', sans-serif", fontSize: 9, letterSpacing: 1,
                      padding: "2px 6px", borderRadius: 4, textTransform: "uppercase",
                      background: `${item.catColor}18`, color: item.catColor,
                      flexShrink: 0, whiteSpace: "nowrap",
                    }}>{item.catIcon} {item.catLabel}</span>
                  )}
                  <span style={{
                    flex: 1, fontSize: 15, lineHeight: 1.5, textAlign: "left",
                    color: isDone ? "#5a8a5a" : isOpen ? "#eee" : "#aaa8a2",
                    transition: "color 0.2s",
                  }}>{item.q}</span>
                  <span style={{
                    fontSize: 18, color: isOpen ? itemAccent : "#222240",
                    transform: isOpen ? "rotate(45deg)" : "none",
                    transition: "all 0.2s", flexShrink: 0,
                  }}>+</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 16px 16px 54px", borderTop: `1px solid ${itemAccent}18` }}>
                    {(lang === "en" || lang === "both") && item.a_en && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 8, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          🇬🇧 English
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#8e8a82", textAlign: "left" }}>
                          {item.a_en}
                        </p>
                      </div>
                    )}
                    {(lang === "hi" || lang === "both") && item.a_hi && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 8, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          🇮🇳 Hinglish
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#8e8a82", textAlign: "left" }}>
                          {item.a_hi}
                        </p>
                      </div>
                    )}
                    {item.code && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 8, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          💻 Example
                        </div>
                        <pre style={{
                          display: "inline-block",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          background: "#050510",
                          border: "1px solid #1a1a2e",
                          borderRadius: 8,
                          padding: "14px 16px",
                          margin: "0 auto",
                          fontFamily: "'Manrope', sans-serif",
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "#c9d1d9",
                          overflowX: "auto",
                          whiteSpace: "pre",
                          textAlign: "left",
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
                        fontSize: 11, fontFamily: "'Manrope', sans-serif", letterSpacing: 1.5,
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

        {isFlatView && filtered.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              style={{
                background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 6,
                padding: "6px 12px", cursor: safePage === 1 ? "not-allowed" : "pointer",
                color: safePage === 1 ? "#333" : "#999",
                fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1,
              }}
            >
              ← Prev
            </button>
            {getPageNumbers(safePage, totalPages).map((p, idx) =>
              p === "…" ? (
                <span key={`e-${idx}`} style={{ color: "#333", fontFamily: "'Manrope', sans-serif", fontSize: 12, padding: "0 4px" }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={{
                    background: p === safePage ? accent + "22" : "#0c0c1a",
                    border: `1px solid ${p === safePage ? accent + "55" : "#1a1a2e"}`,
                    borderRadius: 6, minWidth: 30, padding: "6px 8px",
                    cursor: "pointer", color: p === safePage ? accent : "#999",
                    fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: p === safePage ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              style={{
                background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 6,
                padding: "6px 12px", cursor: safePage === totalPages ? "not-allowed" : "pointer",
                color: safePage === totalPages ? "#333" : "#999",
                fontFamily: "'Manrope', sans-serif", fontSize: 11, letterSpacing: 1,
              }}
            >
              Next →
            </button>
          </div>
        )}

        <div style={{
          marginTop: 36, padding: "14px 18px",
          border: "1px dashed #111120", borderRadius: 10,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <p style={{ margin: 0, color: "#444", fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: "#666" }}>Tip:</strong>{" "}
            Language toggle top pe — EN, HI, ya BOTH. Code examples browser console mein try karo.
            Note: code mein "from" ki jagah "@" use hua hai parser issues avoid karne ke liye.
          </p>
        </div>
      </div>
      </> : <CodingSection />}
    </div>
  );
}