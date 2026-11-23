# LLM Playground

> A responsive AI engineering workbench featuring a real-time **Prompt Analyzer** and browser-native **Text to Speech** synthesis with an audio frequency waveform visualizer.

![Design Aesthetic](https://img.shields.io/badge/Style-Dark%20Glow%20UI-4f7cff?style=flat-square)
![Stack](https://img.shields.io/badge/Tech-Vanilla%20JS%20%7C%20CSS3%20%7C%20Web%20Speech%20API-9b5cff?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00d4ff?style=flat-square)

---

## Overview

**LLM Playground** is designed for prompt engineers, developers, and AI enthusiasts. It provides an offline, client-side suite of tools designed with a dark interface featuring electric blue and purple gradients, ambient glow effects, glassmorphic cards, and responsive layouts.

---

## Features

### 1. 🔍 Prompt Analyzer
- **Real-Time Heuristic Scoring**: Calculates a dynamic **Clarity Score (0–100%)** rendered on an animated circular SVG gauge.
- **Four Core Architectural Pillars**:
  - **Clear Goal & Objective**: Detects strong action verbs (e.g. *Build, Refactor, Evaluate, Extract*) and target subjects.
  - **Useful Context & Persona**: Checks for domain background, audience context, and role framing.
  - **Constraints & Guardrails**: Analyzes negative constraints, boundary definitions, style rules, and word count limits.
  - **Desired Output Format**: Identifies schema demands such as Markdown tables, JSON, code blocks, or structured steps.
- **Actionable Recommendations**: Generates tailored suggestions to improve prompt performance and reduce LLM hallucinations.
- **“Improve Prompt” Engine**: Restructures raw prompts into a production-grade framework with *Role & Persona*, *Objective & Task*, *Context & Inputs*, *Constraints & Guidelines*, and *Desired Output Format*.
- **Quick Actions**: One-click **Copy to Clipboard** and **Insert in Editor** with toast feedback.
- **Presets**: Includes pre-built templates (*Vague Prompt*, *Code Review*, *Support Reply*, *Data Analysis*).

### 2. 🎙️ Text to Speech Studio
- **100% Client-Side**: Powered by the browser-native `window.speechSynthesis` API — no external API keys or network requests required.
- **Voice & Language Selection**: Dynamically enumerates all system and browser voices with localized language tags.
- **Controls**:
  - **Speed / Rate**: Adjustable from `0.5x` to `2.0x` with quick-select pills (`0.8x`, `1.0x`, `1.25x`, `1.5x`).
  - **Pitch**: Adjustable from `0.5` to `1.5`.
- **Playback Controls**: Full state machine with **Play**, **Pause**, **Resume**, and **Stop** buttons and active state pill indicators.
- **Audio Waveform Visualizer**: Real-time `<canvas>` rendering animated electric blue & purple frequency wave bars while speaking.
- **Word Karaoke Tracker**: Automatically tracks word boundaries (`onboundary`) to highlight words in real time as they are spoken.
- **Metrics**: Real-time word count, character count, and estimated duration calculation.

---

## Getting Started

No build step, node modules, or bundler required. Simply clone the repository and open `index.html` in any modern web browser:

```bash
git clone https://github.com/kushal037101/LLM-Playground.git
cd LLM-Playground
open index.html
```

---

## File Structure

```
LLM-Playground/
├── index.html            # Main workbench layout with inline SVGs and accessible controls
├── README.md             # Project documentation
├── css/
│   └── style.css         # Dark theme, glow shadows, gradients, and responsive breakpoints
└── js/
    ├── analyzer.js       # Heuristic prompt analysis engine and structure generator
    ├── tts.js            # Web Speech API controller with canvas visualizer & karaoke tracker
    └── app.js            # Workspace controller, view transitions, presets, and clipboard toasts
```

---

## Visual Design System

- **Background**: Deep black/navy `#050508` with subtle ambient radial glow mesh
- **Card Surface**: Glassmorphic `#0e0e1a` with 1px border `#1a1a30` and hover glow
- **Gradients**:
  - Primary: `linear-gradient(135deg, #4f7cff 0%, #9b5cff 100%)`
  - Secondary: `linear-gradient(135deg, #00d4ff 0%, #4f7cff 100%)`
- **Typography**: `Plus Jakarta Sans` & `JetBrains Mono`

---

## License

MIT License &copy; Kushal Pandya
