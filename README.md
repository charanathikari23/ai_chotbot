# Simple Chatbot

A clean, minimalist chat interface built with React and Vite, styled with Tailwind CSS.

---

## Design and Typography

This application provides a dark-themed, uncluttered environment for conversations:
- **Clean Layout:** Designed to keep your focus entirely on the chat stream, removing sidebars and unnecessary menus.
- **Accented Theme:** Subtle dark indigo backgrounds and layouts.
- **Readable Typography:** Standard sans-serif fonts for clear reading, paired with subtle monospace metrics for status details.

---

## Core Features

- **Streamlined Workflow:** A fast-loading, single-screen conversation loop.
- **Local Storage Persian:** Keeps your communication history saved locally in the browser.
- **Quick Prompts:** Actionable preloaded suggestions to test connectivity instantly.
- **Secure Integration:** Server-side proxy calls that securely protect key values from client-side exposure.
- **Copy Utility:** Quick-action buttons to copy messages to the clipboard with one click.

---

## Technology Stack

- **UI Environment:** React 19 and Vite.
- **Server:** Express.js proxying requests.
- **Animations:** Framer Motion for UI state transitions.
- **CSS:** Tailwind CSS.
- **Icons:** Lucide React.

---

## Installation and Setup

Run the application locally:

### 1. Variables Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
Add your API key inside `.env`:
```env
GEMINI_API_KEY=your-api-key-here
```

### 2. Dependency Setup
Install the project packages:
```bash
npm install
```

### 3. Startup
Launch the client development server and the backend proxy simultaneously:
```bash
npm run dev
```
Open http://localhost:3000 inside your web browser.
