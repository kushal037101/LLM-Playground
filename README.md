# LLM Playground

> A responsive AI engineering workbench featuring a real-time **Prompt Analyzer** and browser-native **Text to Speech** synthesis with an audio frequency waveform visualizer and optional client-side **LLM API integration**.

![Design Aesthetic](https://img.shields.io/badge/Style-Dark%20Glow%20UI-4f7cff?style=flat-square)
![Stack](https://img.shields.io/badge/Tech-Vanilla%20JS%20%7C%20CSS3%20%7C%20Web%20Speech%20API-9b5cff?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-Zero%20Hardcoded%20Keys-00e699?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00d4ff?style=flat-square)

---

## 🔒 Security & API Key Policy

**Zero hardcoded API keys.**
- The source code contains **no API keys**.
- The app operates **100% locally and offline by default** using fast heuristic evaluation and Web Speech synthesis.
- To use Live AI generation (Google Gemini, OpenAI, Groq, or OpenRouter), **users manually enter their own API key** via the UI (**API Key** button in the header).
- **Client-Side Storage Only**: Keys are stored exclusively in the user's browser `localStorage` and are used only for direct HTTPS requests from the browser to the selected provider's official API. No intermediate backend, proxy, or logging server is involved.
- Keys can be verified with the **Test Connection** button or deleted at any time with **Clear Key**.

---

## Features

### 1. 🔍 Prompt Analyzer
- **Dual Engine Architecture**:
  - **⚡ Instant Local Engine**: Evaluates prompts offline with zero API key requirement using heuristic rule sets.
  - **🤖 Live AI Model Engine**: When an API key is entered manually, uses actual LLMs (Gemini 1.5 Flash/Pro, GPT-4o-mini, Llama 3.3, etc.) to perform deep prompt engineering and restructuring.
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

## Supported AI Providers (Manual Entry)

| Provider | Supported Models | Key Destination |
|---|---|---|
| **Google Gemini** (Recommended) | `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo` | [OpenAI Platform](https://platform.openai.com/api-keys) |
| **Groq** | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` | [Groq Console](https://console.groq.com/keys) |
| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct`, `anthropic/claude-3.5-sonnet` | [OpenRouter Keys](https://openrouter.ai/keys) |

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
├── index.html            # Main workbench layout with inline SVGs and API Key Modal
├── README.md             # Project documentation & security policy
├── css/
│   └── style.css         # Dark theme, glow shadows, gradients, and modal dialog styles
└── js/
    ├── api.js            # Client-side API key manager & direct provider fetch handler
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
