# IDEATE — Project Blueprint & AI System Instructions

> **MANDATORY FIRST STEP FOR ALL AI ASSISTANTS**:
> Every AI assistant working on this codebase **MUST read this entire document** before proposing or executing any code changes, creating UI components, or modifying architecture. Never skip this document.

---

## 1. Architectural & Technology Stack Principles

| Layer | Standard | Details & Guidelines |
| :--- | :--- | :--- |
| **Markup** | HTML5 Semantic | Clean, accessible semantics (`<header>`, `<main>`, `<section>`, `<aside>`, `<article>`) with unique descriptive IDs. |
| **Styling** | Vanilla CSS3 | Modular CSS tokens using custom CSS variables (`--bg-deep`, `--border-subtle`, etc.). **Do not use Tailwind CSS** unless explicitly instructed. |
| **Logic** | Vanilla ES6+ JS | Zero heavy client frameworks (No React/Vue unless explicitly requested). Modular DOM controllers with smooth event listeners. |
| **Performance** | Zero-bloat | Native CSS hardware-accelerated animations (`transform`, `opacity`), lightweight assets, sub-second initial load. |

---

## 2. Aesthetic Philosophy: Minimalist, Formal & Modern

### 🚫 Anti-Slop Principles: No Glowing Borders or Clumsy Outlines
- **No Glowing Borders or Neon Shadows**: Never apply glowing colored box-shadows (`box-shadow: 0 0 ... rgba(...)`) or glowing neon borders to cards, inputs, buttons, or containers. This looks cheap and "AI-generated".
- **Clean Divisions Only**: Use simple divisions with subtle hairline borders (`1px solid rgba(168, 85, 247, 0.2)` or `rgba(255, 255, 255, 0.1)`) and pure dark neutral elevation shadows (`box-shadow: 0 14px 32px rgba(0, 0, 0, 0.5)`).
- **Structural Cleanliness**: Rely on subtle background contrast, generous negative space, and refined padding to structure content.
- **Minimalist & Formal**: Maintain a professional, distraction-free aesthetic comparable to high-end engineering software (Linear, GitHub, Raycast).

### 🚫 No Unnecessary Buttons or Redundant UI Clutter
- **Strict Necessity Rule**: AI assistants must **never** invent extra buttons, helper chips, decorative tags, or redundant UI hints.
- **Benchmark Against World-Class Apps**: Always reference standard industry apps (Instagram, Linear, GitHub, Threads, X) — ask *is this button functionally necessary or redundant?*
- **Intuitive Interactions**: If an action occurs naturally (e.g. clicking a card opens its project modal; pulling down triggers stream refresh), **do not place obvious helper text or buttons** (e.g. NO "View blueprint →" buttons, NO static "Pull to refresh" buttons).

### 🎨 Color Palette (Cosmic Obsidian & Deep Violet)
- **Background Deep Void**: `#04020a` (Never use flat 100% black `#000000` or plain grey `#222222`).
- **Obsidian Glass Panels**: `rgba(14, 8, 30, 0.72)` with `backdrop-filter: blur(20px)`.
- **Card Hover Surface**: `rgba(22, 13, 44, 0.82)`.
- **Primary Violet Accent**: `#a855f7` (Tailored, refined intensity — never oversaturated neon).
- **Secondary Violet Light**: `#d8b4fe` (Used for headers, subtle highlights, glowing text gradients).
- **Deep Glow Purple**: `#9333ea` / `#7e22ce`.
- **Star & Gold Accent**: `#fbbf24` (Used for starred projects and spotlight tags).
- **Text Contrast**: `#ffffff` (Headings/Titles) and `#e2e8f0` (Body descriptions with high readability).
- **Muted / Metadata Text**: `#94a3b8` / `#cbd5e1`.

### 🌌 Background Layers
Every main platform view utilizes the layered cosmic atmosphere:
1. `app-nebula-plane`: Deep space nebula image overlay with `mix-blend-mode: screen; opacity: 0.48;`.
2. `app-cyber-grid`: Subtle geometric grid (`rgba(168, 85, 247, 0.05)`).
3. `app-radial-shadow`: Radial vignette darkening the outer perimeter.
4. `app-core-glow`: Soft centered ambient violet blur.

### 🔤 Typography Hierarchy
- **Dot-Matrix / Tech Display**: `'Doto', sans-serif` (Nothing OS brand titles, numeric metrics, special state labels).
- **Headings & Key Cards (App Feed & Profile)**: `'Space Grotesk', sans-serif` (`font-weight: 700; letter-spacing: -0.02em;`).
- **Body & Long Descriptions (App Feed & Profile)**: `'Inter', sans-serif` (`font-weight: 300; line-height: 1.7; letter-spacing: -0.01em;`).
- **Landing Hero Display**: `'Syne', sans-serif` (`font-weight: 800;`) & `'Outfit', sans-serif`.
- **Code, Metadata, Timestamps & Role Badges**: `'JetBrains Mono', monospace`.

### 📐 UI Structure & Details
- **Logo Integrity**: The brand logo (`assets/img/logo.png`) must **never stretch**. Always style with `width: auto; height: 32px; max-width: 36px; object-fit: contain; aspect-ratio: auto;`.
- **Minimalist Badges**: Do not clutter posts with boxy category tags or node IDs. Keep headers clean with creator avatar, handle, and relative time (`12m ago`).
- **Professional Seeking Roles**: Display team requirements as clean, discrete pills:
  ```html
  <div class="seeking-roles">
    <span class="seeking-label">Seeking:</span>
    <span class="role-pill">Embedded Rust</span>
    <span class="role-pill">Signal Processing</span>
  </div>
  ```

---

## 3. Platform Architecture & Layout Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP NAVBAR: Logo (Unstretched) | Clean Search ("Search") | User Pill   │
├───────────────────┬────────────────────────────┬───────────────────────┤
│ LEFT SIDEBAR      │ CENTER FEED COLUMN         │ RIGHT SIDEBAR         │
│ (Fixed / Sticky)  │ (Scrollable / No Scrollbar)│ (Fixed / Sticky)      │
│                   │                            │                       │
│ • THEMES:         │ • Gesture Pull-to-Refresh  │ • Fast Ideation       │
│   - System Design │   (Invisible until pulled) │   Spawner             │
│   - Web & Cloud   │ • Minimalist Idea Cards    │   [TODO: SPAWN_NODE]  │
│   - Mobile Apps   │   - Creator Info           │                       │
│   - Cybersecurity │   - Title & High-Res Body  │ • Most Liked of Day   │
│   - AI & ML       │   - Seeking Roles          │   Spotlight Card      │
│   - Hardware      │   - Star Counter Action    │                       │
│   - Quantum & Bio │   - Whole Card Click Modal │                       │
│ • POPULAR CLUSTERS│                            │                       │
│   [TO EDIT]       │                            │                       │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

### 📱 Center Column Instagram-Style Behavior
- **Locked Sidebars**: Side columns (`.app-sidebar`, `.app-telemetry-column`) stay stationary.
- **Center Scroll**: Only `.app-feed-column` scrolls vertically (`overflow-y: auto; scrollbar-width: none;`).
- **Native Touch Gesture Pull-to-Refresh (Tablets & Mobile Only)**: Zero permanent visual buttons. On touch devices (tablets and phones), pulling down at `scrollTop <= 0` past the threshold (`70px`) reveals the floating spinner and smoothly reloads the stream. Mouse wheel / desktop scrolling on laptops and computers will never trigger accidental reloads.
- **Project Inspection Modal**: Clicking anywhere on an idea card smoothly launches the full project sheet with architecture blueprint, role details, and star action.

---

## 4. Current Workspaces & File Map

```
Ideate/
├── SHOFER.md             # Shofer integration & declarative workflow guide
├── .shofer/              # Shofer configuration & .slang workflows
│   ├── config.json       # Project conventions & tool permissions
│   └── workflows/        # Declarative feature & audit pipelines (.slang)
├── index.html            # Landing hero & 3D neural brain visualization
├── instruction.md        # AI System Instructions & Project Architecture
├── history.md            # Detailed chronological change log & prompt history
├── html/
│   ├── home.html         # Main App Home Stream (3-column layout & project modal)
│   ├── login.html        # Authentication terminal (Google / GitHub / custom handle)
│   └── profile.html      # Creator profile & portfolio dashboard
├── css/
│   ├── theme.css         # Master design tokens, resets, atmospheric layers, glass utils
│   ├── style.css         # Global layout wrappers and theme loader
│   ├── home.css          # Landing hero & brain canvas styles
│   ├── app_home.css      # Platform home feed, themes, cards, star system, modal
│   ├── auth.css          # Auth terminal glass styling & tab transitions
│   └── profile.css       # Creator profile layout, stats, and project showcase
├── js/
│   ├── home.js           # Three.js / Canvas neural brain particle engine
│   ├── app_home.js       # Feed controller (Themes filter, search, stars, modal, pull-refresh)
│   ├── auth.js           # Auth terminal tabs, password confirmation, validation
│   └── profile.js        # Profile interactions & metric animations
└── assets/
    └── img/              # Logos, cosmic textures, and icons
```

---

## 5. Upcoming Roadmap & Strategic Tasks

1. **[TODO: SPAWN_NEW_THOUGHT] Logic**:
   - Build a full-screen or slide-out terminal modal for spawning new impossible ideas.
   - Implement dynamic tagging (`#AI`, `#Rust`, `#Quantum`), missing talent role picker, and markdown blueprint editor.
2. **[COMPLETED] Saved Collections & Bookmarking Engine**:
   - Pinned primary "Joined Projects" collection with live crew telemetry.
   - Dynamic user-named custom collections with icon pickers and `localStorage` persistence.
   - Multimodal bookmarking: bottom-left card save/join actions and modal top-bar save controls.
3. **Authentication & Identity Integration**:
   - OAuth providers: Google, GitHub, and custom username authentication.
   - Session state synchronization between Auth, Home, and Profile.
4. **War Room & Real-Time Collaboration**:
   - Live peer-to-peer discussion threads, contribution proposals, and project blueprint branching (Forking).
5. **Database & Persistence Backend**:
   - Integration with Firebase Firestore / SQLite backend for persistence of starred nodes, ideas, and profile data.

---

## 6. Strict Guidelines for AI Coding Assistants

1. **Mandatory Rule**: Read this `instruction.md` thoroughly before any task.
2. **Aesthetic Excellence & Minimalism**: Every component must look premium, modern, and formal. Avoid clumsy solid borders, neon glowing outlines, or raw black backgrounds.
3. **No Unnecessary UI Elements**: Do not add extra buttons, text hints, or helper cards when an interaction is already handled naturally. Reference real-world benchmark apps first.
4. **Preserve Previous Iterations**: Never revert or break established user customizations (such as the star system, theme filtering, logo aspect ratio, or mobile responsive rules).
5. **Keep Code Lean & Clean**: Write idiomatic Vanilla JS and CSS. Document logic clearly and maintain clean indentation.
6. **Update Logs Proactively**: Whenever substantial changes, refactorings, or new features are added, update `history.md` with the date, time, user prompt, and summary of edits.
