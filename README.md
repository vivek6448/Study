# Frontend Interview Prep

A browser-based interview preparation app with English and Hinglish theory, interactive coding exercises, and separate progress trackers for theory and coding practice. Built with React, Vite, and Motion.

## Features

- Theory covering JavaScript, React, Next.js, HTML/CSS, TypeScript, Node.js, browser concepts, performance, tools, and system design.
- English, Hinglish, and bilingual answer views, with search and topic navigation.
- Coding practice organized as JavaScript, React, and routing, with consecutive question numbers.
- Editable JavaScript solutions with Run, Clear, and an output panel.
- Distinct solution-box shades, automatic code-box height, and only one question expanded at a time.
- Interactive React demos for forms, counters, timers, context, API requests, and more.
- Independent coding completion tracking, category counts, and completed/remaining filters.
- Progress saved locally in the browser across page reloads.
- An animated introduction that respects reduced-motion preferences.

## Run locally

Install Node.js 24+ and npm, then clone the repository:

```bash
git clone https://github.com/vivek6448/Study.git
cd Study
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the address printed by Vite, normally **http://127.0.0.1:5173/**. If port 5173 is occupied, Vite may choose another port. Stop the server with `Ctrl+C` in its terminal.

The main app does not require a backend, account, or environment variables. Internet access is needed to install dependencies, load Google Fonts, and use demos that request data from external APIs.

## Using the app

### Theory

1. Select **Theory**.
2. Choose **EN**, **Hinglish**, or **BOTH**.
3. Browse topics or search for a question.
4. Expand a question to read its answer and example.
5. Select **Mark reviewed** to update theory progress.

### Coding practice

1. Select **Coding**.
2. Browse JavaScript, React, and routing questions, or use category and search filters.
3. Open a question to view its solutions. Opening another question closes the previous one.
4. For executable JavaScript examples, edit the code and select **Run** to see the output. **Clear** removes the output.
5. Select **Mark complete** after practicing. Select **Completed** again to undo completion.
6. Use **All questions**, **Remaining**, or **Completed** to filter by progress.

React examples include built-in live demos and reference source code. Routing examples are reference material rather than standalone programs for the Run panel.

Code edits, outputs, and live demo state are temporary. Completed-question progress is saved separately.

## How progress is stored

Both trackers use browser `localStorage` and do not upload progress to a server.

| Storage key | Saved information |
| --- | --- |
| `studyProgress` | Reviewed theory questions, current topic, and last visit |
| `codingProgress` | Completed coding question IDs |

Coding and theory progress are independent. Opening or running a coding solution does not mark it complete automatically.

Use the same browser profile and exact address to keep using the same progress. `localhost` and `127.0.0.1`, different ports, and different deployed domains have separate storage. Clearing site data removes saved progress; progress does not sync between devices. If storage is unavailable, tracking continues for the current session.

Coding questions retain stable internal IDs so reordering the visible question numbers does not change which questions are marked complete. Completion from removed duplicate questions is transferred to the remaining equivalent question.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production app into `dist/` |
| `npm run preview` | Serve the production build locally after building |
| `npm run lint` | Run ESLint on project source |

## Project structure

```text
src/
  main.jsx            React entry point and introductory screen setup
  App.jsx             Theory content, navigation, and theory progress
  nodeTheory.js       Node.js and backend theory content
  CodingSection.jsx   Coding questions, solutions, demos, and coding progress
  CodingSection.css   Solution shades, coding tracker, and topic styles
  Preloader.jsx       Animated introduction
  Preloader.css       Introduction styles
  index.css           Global styles
public/               Static icons and favicon
index.html            HTML entry point and font loading
vite.config.js        Vite and React configuration
eslint.config.js      Lint configuration
```

## Updating study content

- Edit theory categories and answers in `src/App.jsx`, and backend theory in `src/nodeTheory.js`.
- Edit coding questions in the `QUESTIONS` array in `src/CodingSection.jsx`. Solution strings use `code1`, `code2`, or `code`, depending on the question type.
- Keep existing question IDs stable and give new questions unique IDs. Display numbering is generated from topic order.
- Update `CATEGORY_ORDER` and `CODING_SECTIONS` when introducing new coding topics.
- Keep question descriptions, inputs, expected outputs, and solution code consistent.

`node_modules/` and `dist/` are generated files and are excluded from Git. Commit source changes and `package-lock.json` when dependencies change.
