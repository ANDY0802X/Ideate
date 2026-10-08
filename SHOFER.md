# 🏎️ SHOFER INTEGRATION GUIDE — IDEATE

[Shofer](https://shofer.dev) is configured as the primary declarative workflow and autonomous coding engine for the **IDEATE** platform.

---

## 📁 Workspace Configuration Structure

```text
.shofer/
├── config.json                     # Project schema, conventions & allowed toolchains
└── workflows/
    ├── implement-feature.slang     # Declarative pipeline for new feature development
    └── code-audit.slang            # Pre-flight QA & memory leak audit workflow
```

---

## 🤖 Active AI Provider Engine Matrix

| Workflow Role | Assigned AI Provider | Engine Details | Status |
| :--- | :--- | :--- | :--- |
| **Primary Feature Driver** | **Antigravity Native Engine** | Gemini 3.7 / Claude 3.7 Hybrid (Zero API keys required) | 🟢 **ACTIVE** |
| **QA & Code Auditor** | **GitHub Copilot** | Copilot Language Models (Deep syntax & anomaly audit) | 🟢 **BOUND** |

---

## ⚡ Workflows Overview

### 1. `implement-feature.slang`
- **Plan**: Parses requirements against [`instruction.md`](instruction.md).
- **Design Tokens**: Verifies obsidian dark minimalism & water glass tokens in [`css/theme.css`](css/theme.css).
- **Execute**: Applies precise modifications across HTML, CSS, and JS.
- **Verify & Log**: Performs pre-flight verification and records numbered logs in [`history.md`](history.md).

### 2. `code-audit.slang`
- Scans for DOM null reference guards in `js/`.
- Audits `overflow-x: hidden` and responsive layouts in `css/`.
- Verifies Three.js geometry and event listener memory disposal routines.

---

## 🎯 Guidelines for Shofer Execution
1. **Preserve User Customizations**: Never break or revert established customizations (such as the star rating system, Saved Collections engine, or logo aspect ratio).
2. **Obsidian Water Glass Theme**: Adhere strictly to the obsidian dark theme (`#030108`), transparent liquid glass panels (`rgba(255, 255, 255, 0.03)` to `0.06`), and hairline borders (`rgba(255, 255, 255, 0.08)` to `0.18`).
3. **Changelog Integrity**: Log every significant change in [`history.md`](history.md).
