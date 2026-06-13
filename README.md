# Cybernetic Neural Chat

A high-performance, dark-themed chat interface with a futuristic cybernetic aesthetic. Built with React, Vite, and styled with precision-mapped Tailwind CSS utility classes.

---

## Aesthetics and Design Concept

This application abandons typical boring chat designs for a custom, dark space environment:
- **Futuristic Glowing Details:** Low-contrast grid patterns and subtle holographic scanning overlays.
- **Atmospheric Backgrounds:** Deep primary backgrounds coupled with dim purple and teal blur layers.
- **Utmost Typographic Contrast:** Balanced weight structures in font scaling paired with code-oriented system monospace details.

---

## Core Mechanics

- **Zero-Bloat Chat Flow:** A streamlined chat viewport designed for distraction-free interactions.
- **Transient Caching:** Synchronized browser state hooks that save your active conversation history inside local storage.
- **Interactive Suggestions:** Quick benchmark buttons to test connectivity with the model immediately.
- **Secure Endpoint Handshakes:** Independent backend routing to shield parameters from browser access.
- **Floating Copier Utility:** Hover metrics with clipboard integration for instant reply transfers.

---

## Stack Architecture

- **UI Environment:** React 19 and Vite.
- **Core Orchestrator:** Express.js rendering and proxy routing.
- **Engine Motion:** Framer Motion (for smooth component transitions and feedback scales).
- **Styling Architecture:** Tailwind CSS v4.
- **UI Icons:** Lucide React icons.

---

## Installation and Local Development

Run the chat container environment locally:

### 1. Variables Configuration
Clone the environment template into an active local file:
```bash
cp .env.example .env
```
Provide your API key inside `.env`:
```env
GEMINI_API_KEY=your-api-key-here
```

### 2. Package Hydration
Install all standard workspace dependencies:
```bash
npm install
```

### 3. Ignition
Launch the client development server and the backend proxy simultaneously:
```bash
npm run dev
```
Navigate to http://localhost:3000 inside your preferred browser.
