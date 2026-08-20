import { useState, useEffect, useRef, useContext, createContext } from "react";

const QUESTIONS = [
  {
    id: 1,
    category: "String",
    title: "Sort a string in alphabetical order",
    description: "Given an input string, return a new string with all its characters arranged in alphabetical order.",
    example: `Input:  "javascript"\nOutput: "aacijprstv"`,
    type: "dual",
    code1: `function sortString(str) {\n  // Uses split, sort, join\n  return str.split('').sort().join('');\n}\n\n// Test\nconst input = "javascript";\nconsole.log("Input :", input);\nconsole.log("Output:", sortString(input));`,
    code2: `function sortString(str) {\n  let arr = [];\n  for (let i = 0; i < str.length; i++) arr[i] = str[i];\n\n  // Bubble sort\n  for (let i = 0; i < arr.length - 1; i++) {\n    for (let j = 0; j < arr.length - 1 - i; j++) {\n      if (arr[j] > arr[j + 1]) {\n        let temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n\n  let result = "";\n  for (let i = 0; i < arr.length; i++) result += arr[i];\n  return result;\n}\n\nconst input = "javascript";\nconsole.log("Input :", input);\nconsole.log("Output:", sortString(input));`,
  },
  {
    id: 2,
    category: "Number",
    title: "Reverse a given number",
    description: "Given a number, return its digits in reversed order as a number.",
    example: `Input:  12345   =>  Output: 54321\nInput:  -9870   =>  Output: -789`,
    type: "dual",
    code1: `function reverseNumber(n) {\n  const sign = n < 0 ? -1 : 1;\n  const reversed = Math.abs(n).toString().split('').reverse().join('');\n  return sign * parseInt(reversed, 10);\n}\n\nconsole.log("12345  =>", reverseNumber(12345));\nconsole.log("-9870  =>", reverseNumber(-9870));\nconsole.log("1000   =>", reverseNumber(1000));`,
    code2: `function reverseNumber(n) {\n  const sign = n < 0 ? -1 : 1;\n  let num = n < 0 ? -n : n;\n  let reversed = 0;\n\n  while (num > 0) {\n    let lastDigit = num % 10;\n    reversed = reversed * 10 + lastDigit;\n    num = (num - lastDigit) / 10;\n  }\n  return sign * reversed;\n}\n\nconsole.log("12345  =>", reverseNumber(12345));\nconsole.log("-9870  =>", reverseNumber(-9870));\nconsole.log("1000   =>", reverseNumber(1000));`,
  },
  {
    id: 3,
    category: "Array",
    title: "Second largest in a given array",
    description: "Given an array of numbers, find the second largest element.",
    example: `Input:  [12, 35, 1, 10, 34, 1]\nOutput: 34`,
    type: "dual",
    code1: `function secondLargest(arr) {\n  const unique = [...new Set(arr)];\n  unique.sort((a, b) => b - a);\n  return unique[1];\n}\n\nconsole.log([12,35,1,10,34,1], "=>", secondLargest([12,35,1,10,34,1]));\nconsole.log([5,5,5],           "=>", secondLargest([5,5,5]));\nconsole.log([10,20],           "=>", secondLargest([10,20]));`,
    code2: `function secondLargest(arr) {\n  let first = -Infinity, second = -Infinity;\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] > first) { second = first; first = arr[i]; }\n    else if (arr[i] > second && arr[i] !== first) second = arr[i];\n  }\n  return second === -Infinity ? undefined : second;\n}\n\nconsole.log([12,35,1,10,34,1], "=>", secondLargest([12,35,1,10,34,1]));\nconsole.log([5,5,5],           "=>", secondLargest([5,5,5]));\nconsole.log([10,20],           "=>", secondLargest([10,20]));`,
  },
  {
    id: 4,
    category: "String",
    title: "Remove duplicate characters from a string",
    description: "Given a string, return a new string with all duplicate characters removed, keeping only the first occurrence.",
    example: `Input:  "programming"\nOutput: "progamin"`,
    type: "dual",
    code1: `function removeDuplicates(str) {\n  return [...new Set(str)].join('');\n}\n\nconsole.log("programming  =>", removeDuplicates("programming"));\nconsole.log("aabbccdd     =>", removeDuplicates("aabbccdd"));\nconsole.log("hello world  =>", removeDuplicates("hello world"));`,
    code2: `function removeDuplicates(str) {\n  let result = "", seen = {};\n  for (let i = 0; i < str.length; i++) {\n    if (!seen[str[i]]) { seen[str[i]] = true; result += str[i]; }\n  }\n  return result;\n}\n\nconsole.log("programming  =>", removeDuplicates("programming"));\nconsole.log("aabbccdd     =>", removeDuplicates("aabbccdd"));\nconsole.log("hello world  =>", removeDuplicates("hello world"));`,
  },
  {
    id: 5,
    category: "String",
    title: "Count every character in a given string",
    description: "Given a string, return the frequency count of each character.",
    example: `Input:  "hello"\nOutput: { h:1, e:1, l:2, o:1 }`,
    type: "dual",
    code1: `function charCount(str) {\n  return str.split('').reduce((acc, char) => {\n    acc[char] = (acc[char] || 0) + 1;\n    return acc;\n  }, {});\n}\n\nconst result = charCount("hello world");\nconsole.log("Input: 'hello world'");\nObject.entries(result).forEach(([char, count]) => {\n  const display = char === ' ' ? 'space' : \`'\${char}'\`;\n  console.log(display + " : " + count);\n});`,
    code2: `function charCount(str) {\n  let count = {};\n  for (let i = 0; i < str.length; i++) {\n    let ch = str[i];\n    count[ch] = count[ch] ? count[ch] + 1 : 1;\n  }\n  return count;\n}\n\nconst result = charCount("hello world");\nconsole.log("Input: 'hello world'");\nfor (let char in result) {\n  const display = char === ' ' ? 'space' : "'" + char + "'";\n  console.log(display + " : " + result[char]);\n}`,
  },
  {
    id: 6,
    category: "Array",
    title: "Reverse of an array",
    description: "Given an array, return a new array with elements in reversed order.",
    example: `Input:  [1, 2, 3, 4, 5]\nOutput: [5, 4, 3, 2, 1]`,
    type: "dual",
    code1: `function reverseArray(arr) {\n  return [...arr].reverse();\n}\n\nconsole.log([1,2,3,4,5],       "=>", reverseArray([1,2,3,4,5]));\nconsole.log(["a","b","c","d"], "=>", reverseArray(["a","b","c","d"]));`,
    code2: `function reverseArray(arr) {\n  let left = 0, right = arr.length - 1;\n  let copy = [];\n  for (let i = 0; i < arr.length; i++) copy[i] = arr[i];\n  while (left < right) {\n    let temp = copy[left]; copy[left] = copy[right]; copy[right] = temp;\n    left++; right--;\n  }\n  return copy;\n}\n\nconsole.log([1,2,3,4,5],       "=>", reverseArray([1,2,3,4,5]));\nconsole.log(["a","b","c","d"], "=>", reverseArray(["a","b","c","d"]));`,
  },
  {
    id: 7,
    category: "Array",
    title: "Rotate an array by given positions",
    description: "Given an array and a number k, rotate the array to the right by k positions.",
    example: `Input:  [1,2,3,4,5], k=2\nOutput: [4,5,1,2,3]`,
    type: "dual",
    code1: `function rotateArray(arr, k) {\n  const n = arr.length;\n  const steps = k % n;\n  return [...arr.slice(n - steps), ...arr.slice(0, n - steps)];\n}\n\nconsole.log([1,2,3,4,5], "k=2 =>", rotateArray([1,2,3,4,5], 2));\nconsole.log([1,2,3,4,5], "k=7 =>", rotateArray([1,2,3,4,5], 7));`,
    code2: `function reverse(arr, start, end) {\n  while (start < end) {\n    let temp = arr[start]; arr[start] = arr[end]; arr[end] = temp;\n    start++; end--;\n  }\n}\nfunction rotateArray(arr, k) {\n  const n = arr.length; k = k % n;\n  let copy = [];\n  for (let i = 0; i < n; i++) copy[i] = arr[i];\n  reverse(copy, 0, n-1);\n  reverse(copy, 0, k-1);\n  reverse(copy, k, n-1);\n  return copy;\n}\n\nconsole.log([1,2,3,4,5], "k=2 =>", rotateArray([1,2,3,4,5], 2));\nconsole.log([1,2,3,4,5], "k=7 =>", rotateArray([1,2,3,4,5], 7));`,
  },
  {
    id: 8,
    category: "String",
    title: "Check if a string is a palindrome",
    description: "Given a string, return true if it reads the same forwards and backwards (ignore case & spaces).",
    example: `Input: "racecar"  =>  true\nInput: "hello"    =>  false`,
    type: "dual",
    code1: `function isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/\\s/g, '');\n  return clean === clean.split('').reverse().join('');\n}\n\nconsole.log("racecar    =>", isPalindrome("racecar"));\nconsole.log("hello      =>", isPalindrome("hello"));\nconsole.log("A man a plan a canal Panama =>", isPalindrome("A man a plan a canal Panama"));`,
    code2: `function isPalindrome(str) {\n  let clean = "";\n  for (let i = 0; i < str.length; i++) {\n    let c = str[i];\n    if (c === ' ') continue;\n    let code = str.charCodeAt(i);\n    if (code >= 65 && code <= 90) c = String.fromCharCode(code + 32);\n    clean += c;\n  }\n  let left = 0, right = clean.length - 1;\n  while (left < right) {\n    if (clean[left] !== clean[right]) return false;\n    left++; right--;\n  }\n  return true;\n}\n\nconsole.log("racecar    =>", isPalindrome("racecar"));\nconsole.log("hello      =>", isPalindrome("hello"));\nconsole.log("A man a plan a canal Panama =>", isPalindrome("A man a plan a canal Panama"));`,
  },
  {
    id: 9,
    category: "Type Check",
    title: "Check if a value is an array or an object",
    description: "Given any value, determine whether it is an Array, a plain Object, or neither.",
    example: `Input: [1,2,3]   =>  "Array"\nInput: {a:1}     =>  "Object"\nInput: "hello"   =>  "Neither"`,
    type: "dual",
    code1: `function checkType(val) {\n  if (Array.isArray(val)) return "Array";\n  if (val !== null && typeof val === 'object') return "Object";\n  return "Neither";\n}\n\nconsole.log([1,2,3], "=>", checkType([1,2,3]));\nconsole.log({a:1},   "=>", checkType({a:1}));\nconsole.log("hello", "=>", checkType("hello"));\nconsole.log(null,    "=>", checkType(null));`,
    code2: `function checkType(val) {\n  const tag = Object.prototype.toString.call(val);\n  if (tag === '[object Array]')  return "Array";\n  if (tag === '[object Object]') return "Object";\n  return "Neither";\n}\n\nconsole.log([1,2,3], "=>", checkType([1,2,3]));\nconsole.log({a:1},   "=>", checkType({a:1}));\nconsole.log("hello", "=>", checkType("hello"));\nconsole.log(null,    "=>", checkType(null));`,
  },
  {
    id: 10,
    category: "Array",
    title: "Empty a given array",
    description: "Given an array, demonstrate different ways to completely empty it.",
    example: `Input:  [1, 2, 3, 4, 5]\nOutput: []`,
    type: "dual",
    code1: `let arr1 = [1,2,3,4,5];\nconsole.log("Before:", arr1);\narr1.splice(0, arr1.length);\nconsole.log("After splice():", arr1);\n\nlet arr2 = [1,2,3,4,5];\narr2.length = 0;\nconsole.log("After length=0:", arr2);\n\nlet arr3 = [1,2,3,4,5];\narr3 = [];\nconsole.log("After arr=[]:", arr3);`,
    code2: `let arr = [1,2,3,4,5];\nconsole.log("Before:", arr);\nwhile (arr.length > 0) {\n  arr[arr.length - 1] = undefined;\n  arr.length--;\n}\nconsole.log("After manual empty:", arr);\nconsole.log("Length:", arr.length);`,
  },
  {
    id: 11,
    category: "String",
    title: "Reverse string without reversing word positions",
    description: "Given a string, reverse each individual word's characters but keep the words in their original order.",
    example: `Input:  "Hello World"\nOutput: "olleH dlroW"`,
    type: "dual",
    code1: `function reverseWords(str) {\n  return str.split(' ').map(word => word.split('').reverse().join('')).join(' ');\n}\n\nconsole.log("Hello World      =>", reverseWords("Hello World"));\nconsole.log("JavaScript Rocks =>", reverseWords("JavaScript Rocks"));`,
    code2: `function reverseWords(str) {\n  let result = "", word = "";\n  for (let i = 0; i <= str.length; i++) {\n    if (str[i] === ' ' || i === str.length) {\n      let rev = "";\n      for (let j = word.length - 1; j >= 0; j--) rev += word[j];\n      result += rev;\n      if (i < str.length) result += ' ';\n      word = "";\n    } else { word += str[i]; }\n  }\n  return result;\n}\n\nconsole.log("Hello World      =>", reverseWords("Hello World"));\nconsole.log("JavaScript Rocks =>", reverseWords("JavaScript Rocks"));`,
  },
  {
    id: 12,
    category: "String",
    title: "Find vowels in a given string",
    description: "Given a string, find and return all vowels along with their count.",
    example: `Input:  "javascript"\nOutput: vowels = ['a','a','i'], count = 3`,
    type: "dual",
    code1: `function findVowels(str) {\n  const vowels = str.split('').filter(c => 'aeiouAEIOU'.includes(c));\n  return { vowels, count: vowels.length };\n}\n\nlet r1 = findVowels("javascript");\nconsole.log("javascript  => vowels:", r1.vowels, "count:", r1.count);\nlet r2 = findVowels("Hello World");\nconsole.log("Hello World => vowels:", r2.vowels, "count:", r2.count);`,
    code2: `function findVowels(str) {\n  const v = {a:1,e:1,i:1,o:1,u:1,A:1,E:1,I:1,O:1,U:1};\n  let vowels = [], count = 0;\n  for (let i = 0; i < str.length; i++) {\n    if (v[str[i]]) { vowels[count] = str[i]; count++; }\n  }\n  return { vowels, count };\n}\n\nlet r1 = findVowels("javascript");\nconsole.log("javascript  => vowels:", r1.vowels, "count:", r1.count);\nlet r2 = findVowels("Hello World");\nconsole.log("Hello World => vowels:", r2.vowels, "count:", r2.count);`,
  },
  {
    id: 13,
    category: "String",
    title: "Capitalize the first letter of every word",
    description: "Given a string, return a new string where the first letter of each word is capitalized.",
    example: `Input:  "hello world from javascript"\nOutput: "Hello World From Javascript"`,
    type: "dual",
    code1: `function capitalizeWords(str) {\n  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');\n}\n\nconsole.log(capitalizeWords("hello world from javascript"));\nconsole.log(capitalizeWords("the quick brown fox"));\nconsole.log(capitalizeWords("javaScript iS FUN"));`,
    code2: `function capitalizeWords(str) {\n  let result = "", newWord = true;\n  for (let i = 0; i < str.length; i++) {\n    let c = str[i];\n    if (c === ' ') { result += ' '; newWord = true; }\n    else if (newWord) {\n      let code = c.charCodeAt(0);\n      if (code >= 97 && code <= 122) c = String.fromCharCode(code - 32);\n      result += c; newWord = false;\n    } else {\n      let code = c.charCodeAt(0);\n      if (code >= 65 && code <= 90) c = String.fromCharCode(code + 32);\n      result += c;\n    }\n  }\n  return result;\n}\n\nconsole.log(capitalizeWords("hello world from javascript"));\nconsole.log(capitalizeWords("the quick brown fox"));\nconsole.log(capitalizeWords("javaScript iS FUN"));`,
  },
  {
    id: 14,
    category: "Logic",
    title: "Sum & product of array using a single reducer",
    description: "Find both the sum and product of all elements in an array using only one .reduce() call — no loops, no separate passes.",
    example: `Input:  [1, 2, 3, 4, 5]\nOutput: Sum = 15, Product = 120`,
    type: "logic",
    code1: `function sumAndProduct(arr) {\n  return arr.reduce(\n    (acc, num) => {\n      acc.sum     += num;\n      acc.product *= num;\n      return acc;\n    },\n    { sum: 0, product: 1 }\n  );\n}\n\nconst r1 = sumAndProduct([1,2,3,4,5]);\nconsole.log("Input: [1,2,3,4,5]");\nconsole.log("Sum    =", r1.sum);\nconsole.log("Product=", r1.product);\n\nconst r2 = sumAndProduct([2,4,6]);\nconsole.log("---");\nconsole.log("Input: [2,4,6]");\nconsole.log("Sum    =", r2.sum);\nconsole.log("Product=", r2.product);`,
  },
  {
    id: 15,
    category: "Logic",
    title: "Add population of similar cities",
    description: "Given an array of { city, population } objects, merge duplicate cities by summing their populations.",
    example: `Input:  [{city:"Delhi",population:5000},{city:"Delhi",population:2000}]\nOutput: [{city:"Delhi",population:7000}]`,
    type: "logic",
    code1: `const cities = [\n  { city: "Delhi",   population: 5000 },\n  { city: "Mumbai",  population: 3000 },\n  { city: "Delhi",   population: 2000 },\n  { city: "Chennai", population: 1500 },\n  { city: "Mumbai",  population: 4000 },\n  { city: "Chennai", population: 500  },\n];\n\nfunction mergeCities(data) {\n  const map = data.reduce((acc, item) => {\n    acc[item.city] = (acc[item.city] || 0) + item.population;\n    return acc;\n  }, {});\n  return Object.keys(map).map(city => ({ city, population: map[city] }));\n}\n\nconst result = mergeCities(cities);\nconsole.log("Merged city populations:");\nresult.forEach(r => console.log(" ", r.city, "=>", r.population));`,
  },
  {
    id: 16,
    category: "Logic",
    title: "Find all pairs that sum to a target value",
    description: "Given an array and a target sum, return all unique pairs whose elements add up to that target. Works for unsorted arrays too.",
    example: `Input:  [1,2,3,4,5,6,7,8,9], sum=10\nOutput: [[1,9],[2,8],[3,7],[4,6]]`,
    type: "logic",
    code1: `function findPairs(arr, target) {\n  const seen = new Set();\n  const used = new Set();\n  const pairs = [];\n\n  for (const num of arr) {\n    const complement = target - num;\n\n    if (seen.has(complement) && !used.has(complement)) {\n      const pair = num < complement ? [num, complement] : [complement, num];\n      pairs.push(pair);\n      used.add(complement);\n      used.add(num);\n    }\n    seen.add(num);\n  }\n  return pairs;\n}\n\nconsole.log("Sorted [1-9], target=10:");\nconsole.log(findPairs([1,2,3,4,5,6,7,8,9], 10));\nconsole.log("Unsorted [9,1,5,3,7,4,2,8,6], target=10:");\nconsole.log(findPairs([9,1,5,3,7,4,2,8,6], 10));\nconsole.log("target=8:");\nconsole.log(findPairs([4,3,8,7,2,1,5,6,0,10], 8));`,
  },
  {
    id: 17,
    category: "React",
    title: "Form validation with name and email",
    description: "Implement a controlled form with name and email fields. Validate both on submit — show inline errors for empty/invalid fields and log the data to console on success.",
    example: `Name:  required, min 2 characters\nEmail: required, must contain @ and .`,
    type: "react",
    component: "FormValidation",
    code: `import { useState } from "react";

function FormValidation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\\S+@\\S+\\.\\S+/.test(email))
      newErrors.email = "Enter a valid email";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted:", { name, email });
      setSubmitted(true);
    }
  };

  if (submitted) return <p>Submitted! Check console.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input type="text" placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} />
        {errors.name && <p>{errors.name}</p>}
      </div>
      <div>
        <input type="text" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} />
        {errors.email && <p>{errors.email}</p>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}`,
  },
  {
    id: 18,
    category: "React",
    title: "API integration with Axios and pagination",
    description: "Fetch data from a dummy API using the native fetch API, display it in a table, and add pagination controls.",
    example: "API: https://jsonplaceholder.typicode.com/posts\nDisplay: id, title, body in a table with Next/Prev pagination",
    type: "react",
    component: "ApiPagination",
    code: `import { useState, useEffect } from "react";

function ApiPagination() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  useEffect(() => {
    setLoading(true);
    fetch(\`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=\${limit}\`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="8">
          <thead><tr><th>ID</th><th>Title</th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}><td>{p.id}</td><td>{p.title}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>
        <span> Page {page} </span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}`,
  },
  {
    id: 19,
    category: "React",
    title: "Counter app — increase, decrease, reset",
    description: "Build a counter with three buttons: Increase (+1), Decrease (-1), and Reset (back to 0).",
    example: "Initial: 0\n+ button => 1, 2, 3...\n- button => -1, -2...\nReset   => 0",
    type: "react",
    component: "CounterApp",
    code: `import { useState } from "react";

function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>Increase</button>
      <button onClick={() => setCount(count - 1)}>Decrease</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
  },
  {
    id: 20,
    category: "React",
    title: "Child to parent data transfer",
    description: "Pass a callback function from parent to child. Child calls it with data, parent displays it.",
    example: "Child has an input + button\nOn click => sends value up to Parent\nParent displays the received value",
    type: "react",
    component: "ChildToParent",
    code: `import { useState } from "react";

function Child({ onSend }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type something" />
      <button onClick={() => onSend(input)}>Send to Parent</button>
    </div>
  );
}

function Parent() {
  const [received, setReceived] = useState("");
  return (
    <div>
      <Child onSend={(val) => setReceived(val)} />
      <p>Parent received: <b>{received}</b></p>
    </div>
  );
}`,
  },
  {
    id: 21,
    category: "React",
    title: "Theme toggle — dark and light mode with Context",
    description: "Use React Context to manage a global theme. A toggle button switches between dark and light mode across the app.",
    example: "ThemeContext provides: theme, toggleTheme\nConsumer reads theme and applies styles\nButton toggles Dark <=> Light",
    type: "react",
    component: "ThemeToggle",
    code: `import { useState, useContext, createContext } from "react";

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedBox() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  return (
    <div style={{
      background: isDark ? "#1a1a1a" : "#fff",
      color: isDark ? "#fff" : "#1a1a1a",
      padding: 24, borderRadius: 10,
    }}>
      <p>Current theme: <b>{theme}</b></p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? "Light" : "Dark"}
      </button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedBox />
    </ThemeProvider>
  );
}`,
  },
  {
    id: 22,
    category: "React",
    title: "Timer — auto countdown by 1 every second",
    description: "A timer that starts from a given number and decreases by 1 every second using setInterval. Stops at 0.",
    example: "Start: 10\nAfter 1s: 9, after 2s: 8 ... stops at 0",
    type: "react",
    component: "CountdownTimer",
    code: `import { useState, useEffect } from "react";

function CountdownTimer() {
  const [time, setTime] = useState(10);

  useEffect(() => {
    if (time === 0) return;
    const interval = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return (
    <div>
      <h2>{time === 0 ? "Time's up!" : time}</h2>
      <button onClick={() => setTime(10)}>Restart</button>
    </div>
  );
}`,
  },
  {
    id: 23,
    category: "React",
    title: "Stopwatch — start, stop, reset and reverse",
    description: "A stopwatch that counts up (or down in reverse mode) with Start, Stop, Reset, and Reverse controls.",
    example: "Start => counts up 0, 1, 2...\nStop  => pauses\nReset => back to 0\nReverse => counts down from current value",
    type: "react",
    component: "Stopwatch",
    code: `import { useState, useEffect, useRef } from "react";

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [reverse, setReverse] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(t => reverse ? Math.max(0, t - 1) : t + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, reverse]);

  const reset = () => { setTime(0); setRunning(false); };

  return (
    <div>
      <h2>{time}s</h2>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Stop</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => setReverse(r => !r)}>
        {reverse ? "Forward" : "Reverse"}
      </button>
    </div>
  );
}`,
  },
  {
    id: 24,
    category: "React",
    title: "Progress bar with Tailwind CSS",
    description: "Build a progress bar component in React using Tailwind CSS. A slider controls the progress value.",
    example: "Slider: 0–100\nBar fills from left to right\nShows percentage label",
    type: "react",
    component: "ProgressBar",
    code: `function ProgressBar() {
  const [progress, setProgress] = useState(40);

  return (
    <div className="p-6">
      <p className="mb-2 font-medium">Progress: {progress}%</p>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-300"
          style={{ width: progress + "%" }}
        />
      </div>
      <input type="range" min="0" max="100" value={progress}
        onChange={e => setProgress(Number(e.target.value))}
        className="w-full" />
    </div>
  );
}`,
  },
  {
    id: 25,
    category: "Routing",
    title: "Route Parameters (Dynamic Segments)",
    description: "समझें कि कैसे URL में डायनामिक values pass करते हैं।",
    example: `Route: /user/:id\nURL: /user/123\nParam: id = 123`,
    type: "theory",
    code1: `// English: Route Parameters
// Route parameters are variable parts of a URL path that allow you to pass dynamic values
// They are defined with a colon (:) and captured from the URL

// Example 1: React Router Usage
import { useParams } from "react-router-dom";

function UserProfile() {
  const { id } = useParams(); // Extract 'id' from URL
  console.log("User ID from URL:", id);
  return <h2>Viewing User: {id}</h2>;
}

// Route definition: <Route path="/user/:id" element={<UserProfile />} />
// URL: http://localhost:3000/user/123
// Output: User ID from URL: 123

// ──────────────────────────────────────────────────────

// Hinglish: Route Parameters
// Route parameters URL ke andar dynamic values pass karte hain
// Inhe colon (:) ke saath define karte hain aur URL se extract karte hain

// Example 2: Express Server
const express = require('express');
const app = express();

app.get('/product/:id', (req, res) => {
  const productId = req.params.id; // ':id' se value milti hai
  console.log("Product ID:", productId);
  res.send(\`Showing product \${productId}\`);
});

// Request: GET /product/456
// Output: Showing product 456

// ──────────────────────────────────────────────────────

// Example 3: Multiple Route Parameters
// URL: /user/:userId/posts/:postId

app.get('/user/:userId/posts/:postId', (req, res) => {
  console.log("User:", req.params.userId, "Post:", req.params.postId);
  res.send(\`User \${req.params.userId}'s Post \${req.params.postId}\`);
});

// Request: GET /user/42/posts/789
// Output: User 42's Post 789`,
  },
  {
    id: 26,
    category: "Routing",
    title: "Query Parameters (URL Search String)",
    description: "सीखें कि कैसे ? के बाद query string से data लेते हैं।",
    example: `URL: /search?q=javascript&sort=date\nParams: {q: 'javascript', sort: 'date'}`,
    type: "theory",
    code1: `// English: Query Parameters
// Query parameters are optional values that come after '?' in the URL
// They are used to filter, sort, or search data
// Format: ?key1=value1&key2=value2

// Example 1: React - Using URLSearchParams
function SearchPage() {
  const [results, setResults] = React.useState([]);
  
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q'); // Get 'q' parameter
    const sort = searchParams.get('sort'); // Get 'sort' parameter
    
    console.log("Search query:", query);
    console.log("Sort by:", sort);
    
    // Fetch results based on query and sort
    setResults([...]);
  }, []);
  
  return <div>Results for: {new URLSearchParams(window.location.search).get('q')}</div>;
}

// URL: http://localhost:3000/search?q=javascript&sort=date
// Output: Search query: javascript, Sort by: date

// ──────────────────────────────────────────────────────

// Hinglish: Query Parameters
// Query parameters '?' ke baad aate hain
// Inka use filter, search, ya sorting ke liye hota hai
// Format: ?key1=value1&key2=value2&key3=value3

// Example 2: Express Server
app.get('/api/search', (req, res) => {
  const query = req.query.q; // ?q=value
  const page = req.query.page; // ?page=value
  const limit = req.query.limit; // ?limit=value
  
  console.log("Search term:", query);
  console.log("Page:", page, "Limit:", limit);
  
  res.json({ query, page, limit });
});

// Request: GET /api/search?q=react&page=1&limit=10
// Output: {"query":"react","page":"1","limit":"10"}

// ──────────────────────────────────────────────────────

// Example 3: React Router with useSearchParams
import { useSearchParams } from "react-router-dom";

function FilteredProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  return (
    <div>
      <p>Category: {category}</p>
      <p>Price Range: {minPrice} - {maxPrice}</p>
    </div>
  );
}

// URL: /products?category=electronics&minPrice=100&maxPrice=500
// Output: Category: electronics, Price Range: 100 - 500`,
  },
  {
    id: 27,
    category: "Routing",
    title: "Route vs Query vs Path Parameters - Complete Comparison",
    description: "तीनों के बीच अंतर समझें - कौन कब use करते हैं।",
    example: `Route: /user/:id (Dynamic)\nQuery: /user?id=123 (Optional filters)\nPath: /user/profile/settings (Fixed segments)`,
    type: "theory",
    code1: `// English: Comparison of Route, Query, and Path Parameters
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. ROUTE PARAMETERS (Dynamic Path Segments)
// Purpose: Identify specific resources
// When to use: Single unique resource (user/123, product/456)
// Format: /resource/:id
// Example:

const routeExample = \`
  URL: /user/42
  Route: /user/:id
  Extract: const { id } = useParams(); // id = "42"
  Best for: Identifying specific, required resources
\`;

app.get('/user/:id', (req, res) => {
  console.log("Route param - User ID:", req.params.id);
});

// ──────────────────────────────────────────────────────

// 2. QUERY PARAMETERS (URL Search String)
// Purpose: Filter, search, or sort data
// When to use: Optional filters, pagination, sorting
// Format: /resource?key=value&key2=value2
// Example:

const queryExample = \`
  URL: /users?role=admin&active=true&page=2
  Format: /users?key1=val1&key2=val2
  Extract: const { role, active, page } = req.query;
  Best for: Optional filters, searching, pagination
\`;

app.get('/users', (req, res) => {
  const { role, active, page } = req.query;
  console.log("Query params:", { role, active, page });
  // Query: role="admin", active="true", page="2"
});

// ──────────────────────────────────────────────────────

// 3. PATH PARAMETERS (Fixed URL Structure)
// Purpose: Navigate nested resources
// When to use: Hierarchical resources (/user/posts/comments)
// Format: /segment/subsegment/resource/:id
// Example:

const pathExample = \`
  URL: /user/42/posts/789/comments/101
  Path segments: /user/42/posts/789/comments/101
  Extract: const { userId, postId, commentId } = useParams();
  Best for: Hierarchical or nested resources
\`;

app.get('/user/:userId/posts/:postId/comments/:commentId', (req, res) => {
  const { userId, postId, commentId } = req.params;
  console.log("Path - User:", userId, "Post:", postId, "Comment:", commentId);
});

// ──────────────────────────────────────────────────────

// HINGLISH: Comparison Table
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ROUTE PARAMETER (Dynamic Path):
// Format: /user/:id
// Example: /user/42
// Use case: Specific resource dikhane ke liye
// Extract: params.id

// QUERY PARAMETER (Search String):
// Format: /users?sort=name&page=1
// Example: /search?q=javascript&filter=recent
// Use case: Filter, search, sort, pagination ke liye
// Extract: query.sort, query.page

// PATH PARAMETER (Nested Structure):
// Format: /user/:id/posts/:postId
// Example: /user/42/posts/789
// Use case: Hierarchical data structure ke liye
// Extract: params.id, params.postId

// ──────────────────────────────────────────────────────

// Real-World Example:

const realWorldUrl = \`
  GET /api/shop/users/42/orders?status=shipped&limit=10

  Breakdown:
  - Fixed path: /api/shop/users
  - Route param: 42 (user ID)
  - Query params: status=shipped&limit=10
  
  Extracted:
  - req.params.id = "42"
  - req.query.status = "shipped"
  - req.query.limit = "10"
\`;

app.get('/api/shop/users/:id/orders', (req, res) => {
  const userId = req.params.id; // 42
  const { status, limit } = req.query; // shipped, 10
  
  console.log(\`User \${userId} - Status: \${status}, Limit: \${limit}\`);
  // Output: User 42 - Status: shipped, Limit: 10
});`,
  },
  {
    id: 28,
    category: "Logic",
    title: "Implement debounce() from scratch",
    description: "Given a function and a delay, return a debounced version that only runs once the calls have stopped coming in for that long.",
    example: `log(); log(); log(); // only ONE call actually fires, after the delay`,
    type: "dual",
    code1: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

let calls = 0;
const log = debounce(() => { calls++; console.log("Debounced call #" + calls); }, 50);
log(); log(); log(); // rapid calls — only the last one survives
setTimeout(() => console.log("Total calls after 100ms:", calls), 100);`,
    code2: `function debounce(fn, delay) {
  var timer = null;
  return function () {
    var args = arguments;
    var context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

var calls = 0;
var log = debounce(function () { calls++; console.log("Debounced call #" + calls); }, 50);
log(); log(); log();
setTimeout(function () { console.log("Total calls after 100ms:", calls); }, 100);`,
  },
  {
    id: 29,
    category: "Logic",
    title: "Implement throttle() from scratch",
    description: "Given a function and a limit, return a throttled version that runs at most once per limit window, firing immediately on the first call.",
    example: `log(); log(); log(); // only the FIRST call fires immediately`,
    type: "dual",
    code1: `function throttle(fn, limit) {
  let waiting = false;
  return function (...args) {
    if (waiting) return;
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => { waiting = false; }, limit);
  };
}

let count = 0;
const log = throttle(() => { count++; console.log("Throttled call #" + count); }, 50);
log(); log(); log();
console.log("Immediate count:", count);`,
    code2: `function throttle(fn, limit) {
  var lastRun = 0;
  return function () {
    var now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      fn.apply(this, arguments);
    }
  };
}

var count = 0;
var log = throttle(function () { count++; console.log("Throttled call #" + count); }, 50);
log(); log(); log();
console.log("Immediate count:", count);`,
  },
  {
    id: 30,
    category: "Array",
    title: "Flatten a deeply nested array",
    description: "Given an array nested to an arbitrary depth, return a single flat array of all its values.",
    example: `Input:  [1, [2, [3, [4, 5]], 6]]
Output: [1, 2, 3, 4, 5, 6]`,
    type: "dual",
    code1: `function flattenArray(arr) {
  return arr.flat(Infinity);
}

console.log(JSON.stringify(flattenArray([1, [2, [3, [4, 5]], 6]])));
console.log(JSON.stringify(flattenArray([1, [2, 3], 4])));`,
    code2: `function flattenArray(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      var nested = flattenArray(arr[i]);
      for (var j = 0; j < nested.length; j++) result.push(nested[j]);
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

console.log(JSON.stringify(flattenArray([1, [2, [3, [4, 5]], 6]])));
console.log(JSON.stringify(flattenArray([1, [2, 3], 4])));`,
  },
  {
    id: 31,
    category: "Logic",
    title: "Write a polyfill for Array.prototype.map",
    description: "Implement your own version of .map() without using the built-in, and verify it behaves the same way.",
    example: `[1,2,3].myMap(n => n * 2)  =>  [2, 4, 6]`,
    type: "dual",
    code1: `Array.prototype.myMap = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

console.log(JSON.stringify([1, 2, 3].myMap(n => n * 2)));
console.log(JSON.stringify(["a", "b"].myMap((c, i) => i + ":" + c)));`,
    code2: `Array.prototype.myMap2 = function (callback, thisArg) {
  var result = [];
  var i = 0;
  while (i < this.length) {
    if (Object.prototype.hasOwnProperty.call(this, i)) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
    i++;
  }
  return result;
};

console.log(JSON.stringify([1, 2, 3].myMap2(function (n) { return n * 2; })));`,
  },
  {
    id: 32,
    category: "Logic",
    title: "Deep clone an object",
    description: "Given a nested object, produce an independent copy where mutating the clone never affects the original.",
    example: `original.nested.city = "Mumbai"
clone.nested.city changed to "Delhi" — original stays "Mumbai"`,
    type: "dual",
    code1: `const original = { name: "Raj", nested: { city: "Mumbai" }, list: [1, 2, 3] };
const clone = structuredClone(original);
clone.nested.city = "Delhi";

console.log("Original:", JSON.stringify(original));
console.log("Clone:   ", JSON.stringify(clone));`,
    code2: `function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    var arr = [];
    for (var i = 0; i < obj.length; i++) arr[i] = deepClone(obj[i]);
    return arr;
  }
  var copy = {};
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) copy[key] = deepClone(obj[key]);
  }
  return copy;
}

var original = { name: "Raj", nested: { city: "Mumbai" } };
var clone = deepClone(original);
clone.nested.city = "Delhi";
console.log("Original:", JSON.stringify(original));
console.log("Clone:   ", JSON.stringify(clone));`,
  },
  {
    id: 33,
    category: "Logic",
    title: "Deep-compare two objects for equality",
    description: "Given two objects, return true only if every nested key and value matches, regardless of reference identity.",
    example: `deepEqual({a:1,b:{c:2}}, {a:1,b:{c:2}})  =>  true
deepEqual({a:1}, {a:2})  =>  false`,
    type: "dual",
    code1: `function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => deepEqual(a[key], b[key]));
}

console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })); // true
console.log(deepEqual({ a: 1 }, { a: 2 })); // false`,
    code2: `function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  var keysA = [], keysB = [];
  for (var k1 in a) keysA.push(k1);
  for (var k2 in b) keysB.push(k2);
  if (keysA.length !== keysB.length) return false;
  for (var i = 0; i < keysA.length; i++) {
    var key = keysA[i];
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }));
console.log(deepEqual({ a: 1 }, { a: 2 }));`,
  },
  {
    id: 34,
    category: "String",
    title: "Find the first non-repeating character in a string",
    description: "Given a string, return the first character that appears exactly once, or null if none exists.",
    example: `Input:  "swiss"
Output: "w"`,
    type: "dual",
    code1: `function firstNonRepeating(str) {
  const counts = {};
  for (const ch of str) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of str) if (counts[ch] === 1) return ch;
  return null;
}

console.log("swiss  =>", firstNonRepeating("swiss"));
console.log("aabbcc =>", firstNonRepeating("aabbcc"));`,
    code2: `function firstNonRepeating(str) {
  for (var i = 0; i < str.length; i++) {
    var found = false;
    for (var j = 0; j < str.length; j++) {
      if (i !== j && str[i] === str[j]) { found = true; break; }
    }
    if (!found) return str[i];
  }
  return null;
}

console.log("swiss  =>", firstNonRepeating("swiss"));
console.log("aabbcc =>", firstNonRepeating("aabbcc"));`,
  },
  {
    id: 35,
    category: "Logic",
    title: "Implement memoization",
    description: "Given an expensive pure function, return a memoized version that caches results per unique argument list.",
    example: `fastSquare(5)  // computed
fastSquare(5)  // "cache hit" — returned instantly`,
    type: "dual",
    code1: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) { console.log("cache hit for", key); return cache.get(key); }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowSquare(n) { for (let i = 0; i < 1e6; i++); return n * n; }
const fastSquare = memoize(slowSquare);
console.log(fastSquare(5));
console.log(fastSquare(5)); // cache hit`,
    code2: `function memoize(fn) {
  var cache = {};
  return function (n) {
    if (Object.prototype.hasOwnProperty.call(cache, n)) {
      console.log("cache hit for", n);
      return cache[n];
    }
    var result = fn(n);
    cache[n] = result;
    return result;
  };
}

function slowSquare(n) { for (var i = 0; i < 1e6; i++); return n * n; }
var fastSquare = memoize(slowSquare);
console.log(fastSquare(5));
console.log(fastSquare(5));`,
  },
  {
    id: 36,
    category: "Logic",
    title: "Implement currying",
    description: "Given a function of arity N, transform it so it can be called one argument at a time, or several at once, returning the result once enough args are collected.",
    example: `const c = curry(add3);
c(1)(2)(3) === c(1,2)(3) === c(1,2,3) === 6`,
    type: "dual",
    code1: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}

function add3(a, b, c) { return a + b + c; }
const curried = curry(add3);
console.log(curried(1)(2)(3));
console.log(curried(1, 2)(3));
console.log(curried(1, 2, 3));`,
    code2: `function curryAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log(curryAdd(1)(2)(3));
console.log(curryAdd(10)(20)(30));`,
  },
  {
    id: 37,
    category: "Logic",
    title: "Write a custom bind() polyfill",
    description: "Implement your own version of Function.prototype.bind that permanently locks in 'this' and optionally some leading arguments.",
    example: `const sayHi = greet.myBind(null, "Hi");
sayHi("Raj")  =>  "Hi, Raj!"`,
    type: "dual",
    code1: `Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  return function (...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

function greet(greeting, name) { return greeting + ", " + name + "!"; }
const sayHi = greet.myBind(null, "Hi");
console.log(sayHi("Raj"));`,
    code2: `Function.prototype.myBind2 = function (context) {
  var fn = this;
  var boundArgs = Array.prototype.slice.call(arguments, 1);
  return function () {
    var callArgs = Array.prototype.slice.call(arguments);
    return fn.apply(context, boundArgs.concat(callArgs));
  };
};

function greet(greeting, name) { return greeting + ", " + name + "!"; }
var sayHi = greet.myBind2(null, "Hi");
console.log(sayHi("Raj"));`,
  },
  {
    id: 38,
    category: "Logic",
    title: "Implement Promise.all() from scratch",
    description: "Given an array of promises (or plain values), return a single promise that resolves with all results in order, or rejects on the first failure.",
    example: `myPromiseAll([p1, p2, 3])  =>  resolves with [v1, v2, 3]`,
    type: "dual",
    code1: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    if (promises.length === 0) return resolve([]);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(value => {
        results[i] = value;
        completed++;
        if (completed === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}

myPromiseAll([Promise.resolve(1), Promise.resolve(2), 3])
  .then(r => console.log("Resolved:", JSON.stringify(r)));`,
    code2: `function myPromiseAll(promises) {
  return new Promise(function (resolve, reject) {
    var results = [];
    var completed = 0;
    if (promises.length === 0) { resolve([]); return; }
    for (var i = 0; i < promises.length; i++) {
      (function (index) {
        Promise.resolve(promises[index]).then(function (value) {
          results[index] = value;
          completed++;
          if (completed === promises.length) resolve(results);
        }, reject);
      })(i);
    }
  });
}

myPromiseAll([Promise.resolve(1), Promise.resolve(2), 3])
  .then(function (r) { console.log("Resolved:", JSON.stringify(r)); });`,
  },
  {
    id: 39,
    category: "Logic",
    title: "Build a simple event emitter (pub/sub)",
    description: "Implement on/off/emit so multiple listeners can subscribe to a named event and be notified with arguments when it fires.",
    example: `emitter.on("greet", name => console.log("Hello, " + name));
emitter.emit("greet", "Raj");  // "Hello, Raj"`,
    type: "dual",
    code1: `class EventEmitter {
  #events = {};
  on(event, listener) {
    (this.#events[event] ||= []).push(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.#events[event] = (this.#events[event] || []).filter(l => l !== listener);
  }
  emit(event, ...args) {
    (this.#events[event] || []).forEach(l => l(...args));
  }
}

const emitter = new EventEmitter();
const unsubscribe = emitter.on("greet", name => console.log("Hello, " + name));
emitter.emit("greet", "Raj");
unsubscribe();
emitter.emit("greet", "Aman"); // no output — unsubscribed`,
    code2: `function EventEmitter() {
  this.events = {};
}
EventEmitter.prototype.on = function (event, listener) {
  if (!this.events[event]) this.events[event] = [];
  this.events[event].push(listener);
};
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event] || [];
  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(null, args);
  }
};

var emitter = new EventEmitter();
emitter.on("greet", function (name) { console.log("Hello, " + name); });
emitter.emit("greet", "Raj");`,
  },
  {
    id: 40,
    category: "String",
    title: "Length of the longest substring without repeating characters",
    description: "Given a string, return the length of its longest contiguous substring where every character is unique.",
    example: `Input:  "abcabcbb"
Output: 3  ("abc")`,
    type: "dual",
    code1: `function longestUniqueSubstring(str) {
  let start = 0, maxLen = 0;
  const seen = new Set();
  for (let end = 0; end < str.length; end++) {
    while (seen.has(str[end])) {
      seen.delete(str[start]);
      start++;
    }
    seen.add(str[end]);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}

console.log("abcabcbb =>", longestUniqueSubstring("abcabcbb"));
console.log("bbbbb    =>", longestUniqueSubstring("bbbbb"));
console.log("pwwkew   =>", longestUniqueSubstring("pwwkew"));`,
    code2: `function hasUnique(str) {
  var seen = {};
  for (var i = 0; i < str.length; i++) {
    if (seen[str[i]]) return false;
    seen[str[i]] = true;
  }
  return true;
}
function longestUniqueSubstring(str) {
  var maxLen = 0;
  for (var i = 0; i < str.length; i++) {
    for (var j = i; j <= str.length; j++) {
      var sub = str.slice(i, j);
      if (hasUnique(sub)) maxLen = Math.max(maxLen, sub.length);
    }
  }
  return maxLen;
}

console.log("abcabcbb =>", longestUniqueSubstring("abcabcbb"));
console.log("pwwkew   =>", longestUniqueSubstring("pwwkew"));`,
  },
  {
    id: 41,
    category: "String",
    title: "Check whether two strings are anagrams",
    description: "Given two strings, return true if one is a rearrangement of the other's letters (case/spacing/punctuation-insensitive).",
    example: `isAnagram("listen", "silent")  =>  true
isAnagram("hello", "world")    =>  false`,
    type: "dual",
    code1: `function isAnagram(a, b) {
  const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, "").split("").sort().join("");
  return normalize(a) === normalize(b);
}

console.log("listen/silent =>", isAnagram("listen", "silent"));
console.log("hello/world   =>", isAnagram("hello", "world"));`,
    code2: `function isAnagram(a, b) {
  a = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  b = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (a.length !== b.length) return false;
  var counts = {};
  for (var i = 0; i < a.length; i++) counts[a[i]] = (counts[a[i]] || 0) + 1;
  for (var j = 0; j < b.length; j++) {
    if (!counts[b[j]]) return false;
    counts[b[j]]--;
  }
  return true;
}

console.log("listen/silent =>", isAnagram("listen", "silent"));
console.log("hello/world   =>", isAnagram("hello", "world"));`,
  },
  {
    id: 42,
    category: "Array",
    title: "Reverse a deeply nested array, preserving its structure",
    description: "Given an array nested to an arbitrary depth, reverse the element order at every level WITHOUT flattening it.",
    example: `Input:  [1, [2, 3], [4, [5, 6]]]
Output: [[[6, 5], 4], [3, 2], 1]`,
    type: "dual",
    code1: `function reverseNested(arr) {
  return arr.slice().reverse().map(item => Array.isArray(item) ? reverseNested(item) : item);
}

console.log(JSON.stringify(reverseNested([1, [2, 3], [4, [5, 6]]])));`,
    code2: `function reverseNested(arr) {
  var result = [];
  for (var i = arr.length - 1; i >= 0; i--) {
    if (Array.isArray(arr[i])) {
      result.push(reverseNested(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

console.log(JSON.stringify(reverseNested([1, [2, 3], [4, [5, 6]]])));`,
  },
];

const CATEGORY_COLORS = {
  String:       { bg: "rgba(94,234,212,0.12)",  color: "#5eead4" },
  Array:        { bg: "rgba(125,211,252,0.12)", color: "#7dd3fc" },
  Number:       { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Type Check": { bg: "rgba(196,181,253,0.12)", color: "#c4b5fd" },
  Logic:        { bg: "rgba(249,168,212,0.12)", color: "#f9a8d4" },
  React:        { bg: "rgba(97,218,251,0.12)",  color: "#61dafb" },
  Routing:      { bg: "rgba(251,146,60,0.12)",  color: "#fb923c" },
};

function runCode(code) {
  const logs = [];
  const customConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
    error: (...args) => logs.push("ERROR: " + args.join(" ")),
    warn: (...args) => logs.push("WARN: " + args.join(" ")),
  };
  try {
    const fn = new Function("console", code);
    fn(customConsole);
    return { output: logs.join("\n") || "(no output)", error: false };
  } catch (e) {
    return { output: e.message, error: true };
  }
}

function CodePanel({ label, tag, tagStyle, code, onCodeChange }) {
  const [output, setOutput] = useState(null);
  const [isError, setIsError] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const result = runCode(code);
      setOutput(result.output);
      setIsError(result.error);
      setRunning(false);
    }, 80);
  };

  return (
    <div style={{
      background: "#0c0c1a", border: "1px solid #1a1a2e",
      borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #1a1a2e",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0e0e1a",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#d8d4cc" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: 4, ...tagStyle }}>{tag}</span>
      </div>
      <textarea
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%", minHeight: 220, border: "none",
          padding: "14px 16px", boxSizing: "border-box",
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13.5, lineHeight: 1.65, resize: "vertical", textAlign: "left",
          background: "#0a0a14", color: "#c9d1d9", outline: "none",
        }}
      />
      <div style={{ padding: "10px 16px", borderTop: "1px solid #1a1a2e", display: "flex", gap: 8, background: "#0c0c1a" }}>
        <button onClick={handleRun} disabled={running} style={{
          background: "#4ade80", color: "#07070f", border: "none",
          padding: "7px 14px", borderRadius: 6, fontSize: 13.5,
          fontWeight: 600, cursor: "pointer", opacity: running ? 0.6 : 1,
        }}>
          {running ? "Running…" : "▶ Run"}
        </button>
        <button onClick={() => { setOutput(null); setIsError(false); }} style={{
          background: "transparent", color: "#d8d4cc", border: "1px solid #1a1a2e",
          padding: "7px 14px", borderRadius: 6, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
        }}>
          Clear
        </button>
      </div>
      {output !== null && (
        <div style={{
          background: "#050510", color: isError ? "#f87171" : "#c0dd97",
          padding: "12px 16px", fontFamily: "'Manrope', sans-serif",
          fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", textAlign: "left",
          wordBreak: "break-all", borderTop: "1px solid #1a1a2e",
        }}>
          <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            {isError ? "Error" : "Output"}
          </div>
          {output}
        </div>
      )}
    </div>
  );
}

// ── React live demo components ────────────────────────────────────

function FormValidation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      console.log("Form submitted:", { name, email });
    }
  };

  const inp = (extra) => ({
    border: "1px solid #1a1a2e", borderRadius: 8, padding: "9px 12px",
    fontSize: 15, width: "100%", outline: "none", fontFamily: "inherit",
    background: "#0a0a14", color: "#d8d4cc", boxSizing: "border-box", ...extra,
  });

  if (submitted) return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>✓</div>
      <p style={{ fontWeight: 600, color: "#4ade80", marginBottom: 4 }}>Submitted!</p>
      <p style={{ color: "#aaa8a2", fontSize: 15 }}>Name: <b>{name}</b> · Email: <b>{email}</b></p>
      <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Check browser console for logged data</p>
      <button onClick={() => { setSubmitted(false); setName(""); setEmail(""); }}
        style={{ marginTop: 14, padding: "7px 16px", borderRadius: 7, border: "1px solid #1a1a2e", background: "transparent", color: "#d8d4cc", cursor: "pointer", fontSize: 14 }}>
        Reset
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 360 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6, color: "#d8d4cc" }}>Name</label>
        <input type="text" value={name} placeholder="Enter your name"
          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
          style={inp(errors.name ? { borderColor: "#f87171" } : {})} />
        {errors.name && <p style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{errors.name}</p>}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6, color: "#d8d4cc" }}>Email</label>
        <input type="text" value={email} placeholder="Enter your email"
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
          style={inp(errors.email ? { borderColor: "#f87171" } : {})} />
        {errors.email && <p style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{errors.email}</p>}
      </div>
      <button type="submit" style={{
        background: "#4ade80", color: "#07070f", border: "none", padding: "9px 22px",
        borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%",
      }}>Submit</button>
    </form>
  );
}

function ApiPagination() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState(0);
  const limit = 5;
  const loading = loadedPage !== page;

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoadedPage(page); })
      .catch(() => setLoadedPage(page));
  }, [page]);

  const td = { padding: "8px 12px", borderBottom: "1px solid #1a1a2e", fontSize: 14, verticalAlign: "top", color: "#d8d4cc" };
  const th = { ...td, fontWeight: 600, background: "#0e0e1a", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: "#aaa8a2" };

  return (
    <div style={{ padding: 20 }}>
      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#666" }}>Loading...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
          <thead>
            <tr><th style={{ ...th, width: 40 }}>ID</th><th style={th}>Title</th></tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} style={{ background: p.id % 2 === 0 ? "#0e0e1a" : "transparent" }}>
                <td style={td}>{p.id}</td>
                <td style={td}>{p.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1a1a2e", background: page === 1 ? "#0a0a12" : "transparent", color: page === 1 ? "#444" : "#d8d4cc", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 14 }}>
          ← Prev
        </button>
        <span style={{ fontSize: 14, color: "#aaa8a2" }}>Page <b>{page}</b></span>
        <button onClick={() => setPage(p => p + 1)}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1a1a2e", background: "transparent", color: "#d8d4cc", cursor: "pointer", fontSize: 14 }}>
          Next →
        </button>
      </div>
    </div>
  );
}

function CounterApp() {
  const [count, setCount] = useState(0);
  const color = count > 0 ? "#4ade80" : count < 0 ? "#f87171" : "#d8d4cc";
  const btn = (bg, clr, border) => ({
    padding: "9px 22px", borderRadius: 8, border: `1px solid ${border}`,
    background: bg, color: clr, fontSize: 16, fontWeight: 600, cursor: "pointer", minWidth: 80,
  });
  return (
    <div style={{ padding: 28, textAlign: "center" }}>
      <div style={{ fontSize: 68, fontWeight: 700, color, marginBottom: 24, fontVariantNumeric: "tabular-nums" }}>
        {count}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => setCount(c => c + 1)} style={btn("rgba(74,222,128,0.12)", "#4ade80", "rgba(74,222,128,0.35)")}>+ Increase</button>
        <button onClick={() => setCount(c => c - 1)} style={btn("rgba(248,113,113,0.12)", "#f87171", "rgba(248,113,113,0.35)")}>− Decrease</button>
        <button onClick={() => setCount(0)} style={btn("transparent", "#aaa8a2", "#1a1a2e")}>Reset</button>
      </div>
    </div>
  );
}

function ChildInput({ onSend }) {
  const [input, setInput] = useState("");
  return (
    <div style={{ padding: "14px 20px", background: "rgba(125,211,252,0.1)", borderRadius: 10, marginBottom: 14 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#7dd3fc", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Child Component</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "1px solid rgba(125,211,252,0.3)", fontSize: 14, outline: "none", background: "#0a0a14", color: "#d8d4cc" }} />
        <button onClick={() => { onSend(input); setInput(""); }}
          style={{ padding: "8px 14px", borderRadius: 7, background: "#7dd3fc", color: "#07070f", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Send ↑
        </button>
      </div>
    </div>
  );
}

function ChildToParent() {
  const [received, setReceived] = useState("");

  return (
    <div style={{ padding: 20 }}>
      <ChildInput onSend={val => setReceived(val)} />
      <div style={{ padding: "14px 20px", background: "#0e0e1a", borderRadius: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#aaa8a2", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Parent Component received:</p>
        <p style={{ fontSize: 17, fontWeight: 600, color: received ? "#d8d4cc" : "#555" }}>{received || "Nothing yet..."}</p>
      </div>
    </div>
  );
}

const ThemeCtx = createContext();

function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light") }}>
      <ThemeConsumer />
    </ThemeCtx.Provider>
  );
}

function ThemeConsumer() {
  const { theme, toggleTheme } = useContext(ThemeCtx);
  const isDark = theme === "dark";
  return (
    <div style={{ padding: 24, background: isDark ? "#1a1a1a" : "#fff", borderRadius: 12, transition: "all 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#c0dd97" : "#444" }}>
          {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </span>
        <button onClick={toggleTheme} style={{
          padding: "7px 16px", borderRadius: 20, border: "1px solid",
          borderColor: isDark ? "#444" : "#d3d1c7",
          background: isDark ? "#333" : "#f1efe8",
          color: isDark ? "#fff" : "#1a1a1a",
          fontSize: 14, cursor: "pointer", transition: "all 0.2s",
        }}>
          Switch to {isDark ? "Light" : "Dark"}
        </button>
      </div>
      <div style={{ padding: 14, borderRadius: 8, background: isDark ? "#2c2c2a" : "#f6f5f1" }}>
        <p style={{ color: isDark ? "#d3d1c7" : "#555", fontSize: 15, margin: 0 }}>
          This box reads theme from <code style={{ color: isDark ? "#c0dd97" : "#3c3489" }}>ThemeContext</code>. Current: <b style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{theme}</b>
        </p>
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState(10);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || time === 0) return;
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [started, time]);

  const radius = 54, circ = 2 * Math.PI * radius;
  const progress = time / 10;

  return (
    <div style={{ padding: 28, textAlign: "center" }}>
      <svg width="140" height="140" style={{ marginBottom: 16 }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none"
          stroke={time === 0 ? "#f87171" : "#4ade80"} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="70" y="76" textAnchor="middle" fontSize="28" fontWeight="700"
          fill={time === 0 ? "#f87171" : "#d8d4cc"}>
          {time === 0 ? "✓" : time}
        </text>
      </svg>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 14 }}>
        {time === 0 ? "Time's up!" : started ? "Counting down..." : "Press Start"}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setStarted(true)} disabled={time === 0 || started}
          style={{ padding: "7px 16px", borderRadius: 7, background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)", cursor: "pointer", fontSize: 14 }}>
          Start
        </button>
        <button onClick={() => { setTime(10); setStarted(false); }}
          style={{ padding: "7px 16px", borderRadius: 7, background: "transparent", color: "#aaa8a2", border: "1px solid #1a1a2e", cursor: "pointer", fontSize: 14 }}>
          Restart
        </button>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [reverse, setReverse] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(t => reverse ? Math.max(0, t - 1) : t + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, reverse]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const btn = (bg, border, clr) => ({
    padding: "8px 16px", borderRadius: 7, border: `1px solid ${border}`,
    background: bg, color: clr, fontSize: 14, fontWeight: 500, cursor: "pointer",
  });

  return (
    <div style={{ padding: 28, textAlign: "center" }}>
      <div style={{ fontSize: 60, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: reverse ? "#f87171" : "#d8d4cc", marginBottom: 8 }}>
        {fmt(time)}
      </div>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        {reverse ? "▼ Reverse mode" : "▲ Forward mode"} · {running ? "Running" : "Paused"}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => setRunning(true)}  style={btn("rgba(74,222,128,0.12)", "rgba(74,222,128,0.35)", "#4ade80")}>Start</button>
        <button onClick={() => setRunning(false)} style={btn("rgba(251,191,36,0.12)", "rgba(251,191,36,0.35)", "#fbbf24")}>Stop</button>
        <button onClick={() => { setTime(0); setRunning(false); setReverse(false); }} style={btn("transparent", "#1a1a2e", "#aaa8a2")}>Reset</button>
        <button onClick={() => setReverse(r => !r)} style={btn(reverse ? "rgba(248,113,113,0.12)" : "rgba(196,181,253,0.12)", reverse ? "rgba(248,113,113,0.35)" : "rgba(196,181,253,0.35)", reverse ? "#f87171" : "#c4b5fd")}>
          {reverse ? "▲ Forward" : "▼ Reverse"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar() {
  const [progress, setProgress] = useState(40);
  const color = progress < 30 ? "#f87171" : progress < 70 ? "#fbbf24" : "#4ade80";
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#aaa8a2" }}>Progress</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{progress}%</span>
      </div>
      <div style={{ width: "100%", height: 14, background: "#1a1a2e", borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 20, transition: "width 0.3s ease, background 0.3s ease" }} />
      </div>
      <input type="range" min="0" max="100" value={progress}
        onChange={e => setProgress(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 12, color: "#555" }}>0%</span>
        <span style={{ fontSize: 12, color: "#555" }}>100%</span>
      </div>
      <p style={{ fontSize: 13, color: "#666", marginTop: 12, textAlign: "center" }}>
        {progress < 30 ? "Just started" : progress < 70 ? "In progress" : progress < 100 ? "Almost there!" : "Complete!"}
      </p>
    </div>
  );
}

const REACT_COMPONENTS = {
  FormValidation, ApiPagination, CounterApp, ChildToParent,
  ThemeToggle, CountdownTimer, Stopwatch, ProgressBar,
};

// ── Question Card ─────────────────────────────────────────────────

function QuestionHeader({ q }) {
  const catStyle = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Logic;
  const isLogic = q.type === "logic";
  const isReact = q.type === "react";
  return (
    <div style={{ background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 9px", borderRadius: 5, background: "rgba(196,181,253,0.12)", color: "#c4b5fd" }}>Q{q.id}</span>
        <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 9px", borderRadius: 5, background: catStyle.bg, color: catStyle.color }}>{q.category}</span>
        {isLogic && <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 9px", borderRadius: 5, background: "rgba(249,168,212,0.12)", color: "#f9a8d4" }}>Logic</span>}
        {isReact && <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 9px", borderRadius: 5, background: "rgba(125,211,252,0.12)", color: "#7dd3fc" }}>Live Demo</span>}
      </div>
      <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eee", margin: "0 0 6px" }}>{q.title}</h2>
      <p style={{ color: "#aaa8a2", fontSize: 15.5, lineHeight: 1.6, margin: 0 }}>{q.description}</p>
      <pre style={{
        background: "#0a0a14", borderRadius: 8, padding: "10px 14px", marginTop: 10,
        fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: "#c9d1d9",
        lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "left",
      }}>{q.example}</pre>
    </div>
  );
}

function QuestionCard({ q }) {
  const [codes, setCodes] = useState({ code1: q.code1 || "", code2: q.code2 || "" });
  const isLogic = q.type === "logic";
  const isReact = q.type === "react";
  const isTheory = q.type === "theory";

  if (isTheory) {
    return (
      <div style={{ marginBottom: 28 }}>
        <QuestionHeader q={q} />
        <div style={{ background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e", background: "#0e0e1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#d8d4cc" }}>Theory & Explanation</span>
            <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: "rgba(251,146,60,0.12)", color: "#fb923c", fontWeight: 500 }}>Concept</span>
          </div>
          <pre style={{
            margin: 0, padding: "16px", overflowX: "auto",
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13.5, lineHeight: 1.65, color: "#c9d1d9", textAlign: "left",
            background: "#0a0a14", whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>{q.code1}</pre>
        </div>
      </div>
    );
  }

  if (isReact) {
    const LiveComp = REACT_COMPONENTS[q.component];
    return (
      <div style={{ marginBottom: 28 }}>
        <QuestionHeader q={q} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <div style={{ background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e", background: "#0e0e1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#d8d4cc" }}>Live Demo</span>
              <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: "rgba(125,211,252,0.12)", color: "#7dd3fc", fontWeight: 500 }}>Interactive</span>
            </div>
            <LiveComp />
          </div>
          <div style={{ background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e", background: "#0e0e1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#d8d4cc" }}>Solution Code</span>
              <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: "rgba(94,234,212,0.12)", color: "#5eead4", fontWeight: 500 }}>React</span>
            </div>
            <pre style={{
              margin: 0, padding: "16px", overflowX: "auto",
              fontFamily: "'Manrope', sans-serif",
              fontSize: 13.5, lineHeight: 1.65, color: "#c9d1d9", textAlign: "left",
              background: "#0a0a14", whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>{q.code}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <QuestionHeader q={q} />
      {isLogic ? (
        <CodePanel
          label="Solution"
          tag="Logic"
          tagStyle={{ background: "rgba(249,168,212,0.12)", color: "#f9a8d4" }}
          code={codes.code1}
          onCodeChange={v => setCodes(p => ({ ...p, code1: v }))}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <CodePanel
            label="Solution 1"
            tag="With predefined functions"
            tagStyle={{ background: "rgba(94,234,212,0.12)", color: "#5eead4" }}
            code={codes.code1}
            onCodeChange={v => setCodes(p => ({ ...p, code1: v }))}
          />
          <CodePanel
            label="Solution 2"
            tag="Without predefined functions"
            tagStyle={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
            code={codes.code2}
            onCodeChange={v => setCodes(p => ({ ...p, code2: v }))}
          />
        </div>
      )}
    </div>
  );
}

// ── Coding Section (main export) ──────────────────────────────────

const ALL_CATS = ["All", "String", "Array", "Number", "Type Check", "Logic", "React", "Routing"];

export default function CodingSection() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = QUESTIONS.filter(q => {
    const matchCat = filter === "All" || q.category === filter;
    const matchSearch = !search.trim() ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      {/* Sticky filter bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0c0c1e", borderBottom: "1px solid #111120", padding: "12px 24px" }}>
        <div style={{ maxWidth: "min(1400px, 96vw)", margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {ALL_CATS.map(cat => {
            const isActive = filter === cat;
            const catAccent = CATEGORY_COLORS[cat]?.color || "#eeeeee";
            return (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: "5px 14px", borderRadius: 20, border: "1px solid",
                borderColor: isActive ? `${catAccent}55` : "#1a1a2e",
                background: isActive ? `${catAccent}22` : "transparent",
                color: isActive ? catAccent : "#aaa8a2",
                fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              }}>
                {cat}
                <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.6 }}>
                  {cat === "All" ? QUESTIONS.length : QUESTIONS.filter(q => q.category === cat).length}
                </span>
              </button>
            );
          })}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: 13 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                width: 180, background: "#0c0c1a", border: "1px solid #1a1a2e",
                borderRadius: 8, padding: "6px 10px 6px 28px",
                fontSize: 13, outline: "none", color: "#d8d4cc",
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: "min(1400px, 96vw)", margin: "0 auto", padding: "24px 24px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#666", fontSize: 15 }}>
            No questions found
          </div>
        ) : (
          filtered.map(q => <QuestionCard key={q.id} q={q} />)
        )}
      </div>
    </div>
  );
}
