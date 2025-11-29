# Karaoke Timing Editor

A lightweight, browser-native tool for creating precise lyrics timing files.

This project is a minimal, fast, and open-source karaoke timing editor designed for creators who want a clean workflow for synchronizing lyrics with audio. It runs entirely in the browser and stores nothing on a server. The editor lets you load an audio file, paste raw lyrics, and produce a structured JSON timing file that can be used in karaoke applications, rhythm games, or lyric-display systems.

The tool intentionally avoids heavy frameworks and stays close to the platform. It uses:

- W3.CSS for a minimal, accessible UI
- Vanilla TypeScript compiled with esbuild
- Pure DOM APIs (no jQuery or external UI libraries)
- A simple event-driven architecture
- Zero external network access except when loading W3.CSS

The goal is clarity, small bundle size, and an editing experience that prioritizes flow and precision—especially when working at low playback speeds.

# Features

- Keyboard-driven timing workflow: Press a single key to mark start/end times; the editor auto-advances to the next word.
- Waveform rendering: Minimal, efficient visualization of the audio file using OfflineAudioContext.
- Precise seeking: ← / → for ±500ms jumps, ↑ / ↓ for previous/next lyric line, space for play/pause.
- Visual word states: Words indicate whether they have a start, end, both, or no timestamps.
- Import/export JSON: Full preservation of the timing matrix. Import existing files to refine them.
- Lightweight build pipeline: esbuild + TypeScript with instant rebuilds.

# Project Structure

Typical layout:

```
/src
  main.ts
  application.ts
  audio_player.ts
  dom_registry.ts
  ...
/public
  index.html
  style.css
/scripts
  generate-dom-registry.ts   # (optional) auto-generates DOM bindings
```


The UI lives in index.html as one cohesive screen. All interactive logic is written in TypeScript modules and bundled with esbuild.

# Installation & Development

Please use devcontainer while hacking to simplify your workflow.

1. Clone the repository
```
git clone https://github.com/<yourname>/karaoke-timing-editor.git
cd karaoke-timing-editor
```

2. Install dependencies
```
pnpm install
```

This installs esbuild and any developer-side tools (e.g., DOM registry generator).

3. Development server

A minimal script serves the dist/ directory and rebuilds on file changes:

```
pnpm dev
```

Then open the following URL: http://localhost:3000

4. Build for production
```
npm run build
```


This runs esbuild, emits the bundled JS, and copies static files to dist/.

# Running the DOM Registry Generator

Whenever index.html is updated, one should re-run the generate-dom script:

```
pnpm generate-dom
```

This scans index.html and updates the generated dom.ts file.
It keeps your aggregates clean and reduces null-checks.

# JSON Format

The editor outputs a simple, normalized structure:

```json
{
  "duration": 192000,
  "words": [
    { "line": 0, "index": 0, "text": "Hello", "start": 1234, "end": 2345 },
    { "line": 0, "index": 1, "text": "world", "start": 2400, "end": 3100 }
  ]
}
```

Each word stores its original position and timestamps in milliseconds.

# Contributions

Issues and pull requests are welcome! The goal is to keep the project small, respectful of the browser, and easy to fork. Contributions that simplify code, improve timing accuracy, or enhance keyboard ergonomics are especially appreciated.

# Acknowledgements

Portions of this project’s architecture and refinements were developed with the assistance of ChatGPT (OpenAI). The AI served as a design partner while preserving a lightweight, human-friendly codebase.

# License

MIT — free to use, modify, and share.
