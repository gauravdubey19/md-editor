<div align="center">

# 🚀 Markdown Studio

**A Modern, Bidirectional Markdown Editor & Live Interactive Preview Studio**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Base_UI-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  Format plain text Markdown on the left, or <strong>click directly inside the rich visual preview to edit</strong> in real time with bidirectional synchronization and synchronized scrolling!
</p>

</div>

---

## 🌟 Key Features

### 🔄 1. Bidirectional Live Synchronization

- **Plaintext Source Editor**: Monospace code editor with line numbers gutter and auto-indenting.
- **WYSIWYG Live Context Editing**: Directly click into headings, paragraphs, lists, or tables in the preview pane to edit text. Changes are converted to Markdown in real time via `turndown` without losing caret position.
- **Interactive Checklists**: Click on `- [ ]` checkboxes directly in the visual preview to toggle `- [x]` in the markdown source.
- **Code Copy Overlay**: Every code block features a copy button with feedback.

### ↕️ 2. Synchronized Scrolling

- Scrolling either pane proportionally scrolls the other pane simultaneously.
- Intelligent debounce lock prevents infinite feedback loops or scroll jumping.
- Toggle button in the header to turn scroll synchronization on or off on demand.

### 📎 3. File Attachments & Drag-and-Drop

- **Header Attachment Trigger**: Easily upload local `.md`, `.markdown`, or `.txt` files.
- **Global Drag & Drop**: Drop files anywhere across the browser window to open.
- **Preset Template Gallery**: Includes _Interactive Studio Showcase_, _Project README_, and _Engineering RFC_ templates.
- **Inline Renamer**: Rename active files directly in the top bar.

### 🛠️ 4. Markdown Formatting Toolbar

- **Headings**: H1, H2, H3, H4 quick dropdown selector.
- **Styling**: Bold (`**`), Italic (`*`), Strikethrough (`~~`), Inline Code (`` ` ``).
- **Structure**: Bullet lists, Numbered lists, Checklists, Blockquotes, Horizontal Dividers.
- **Inserts**: Code Blocks (fenced), GFM Tables, Links, and Images.
- **History**: Full Undo (<kbd>Ctrl+Z</kbd>) and Redo (<kbd>Ctrl+Y</kbd> / <kbd>Ctrl+Shift+Z</kbd>) stack.
- **Format / Prettify**: Automatic cleanup of list markers, indentation, and spacing.

### 📤 5. Export & Sharing Options

- Download as `.md` file.
- Export as standalone, formatted `.html` document with styled typography.
- One-click Copy Markdown or Copy HTML to clipboard.

### 📊 6. Document Statistics & Theming

- Live bottom status bar tracking **Words**, **Characters**, **Lines**, **Estimated Reading Time**, **Cursor Position (Ln X, Col Y)**, and **Sync Status**.
- Three view modes: **Split View** (resizable panels), **Source Editor Only**, and **Live Preview Only**.
- Built-in Dark / Light theme toggle with local storage persistence.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Markdown Studio App                           │
├────────────────────────────────────────────────────────────────────────┤
│  [ Header: File Attachment | Rename | Templates | Export | Theme ]    │
│  [ Toolbar: Headings | Bold | Italic | Lists | Tables | Code | Undo ]   │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Raw Markdown Editor         │        Editable Live Preview        │
│                                  │                                     │
│  - Monospace Editor              │  - Rendered GFM HTML (Marked)       │
│  - Line Numbers Gutter           │  - contentEditable (Turndown sync)  │
│  - Keyboard Shortcuts            │  - Interactive Checklists           │
│  - Synchronized Scroll (1) ────► │  - Synchronized Scroll (2) ──────►  │
└──────────────────────────────────┴─────────────────────────────────────┘
│  [ Status Bar: Words | Chars | Lines | Read Time | Ln/Col | Sync State]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut (Mac / Win)                                                 | Action                               | Scope            |
| :------------------------------------------------------------------- | :----------------------------------- | :--------------- |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>B</kbd>                      | Toggle Bold text (`**text**`)        | Editor / Preview |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>I</kbd>                      | Toggle Italic text (`*text*`)        | Editor / Preview |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd>                      | Insert Link template (`[text](url)`) | Editor           |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>S</kbd>                      | Save & Download `.md` file           | Global           |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>Z</kbd>                      | Undo last change                     | Global           |
| <kbd>Cmd</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Shift+Z</kbd> | Redo change                          | Global           |
| <kbd>Tab</kbd>                                                       | Indent 2 spaces                      | Editor           |
| <kbd>Shift</kbd> + <kbd>Tab</kbd>                                    | Dedent 2 spaces                      | Editor           |

---

## 📂 Project Structure

```
md-file-editor/
├── app/
│   ├── layout.tsx                     # Root layout with OpenGraph, SEO & TooltipProvider
│   ├── page.tsx                       # Thin-shell page route rendering EditorProvider
│   ├── opengraph-image.tsx            # Dynamic 1200x630 OpenGraph social preview image
│   ├── twitter-image.tsx              # Twitter card social preview image
│   ├── manifest.ts                    # Progressive Web App (PWA) manifest
│   ├── robots.ts                      # Search engine robots configuration
│   ├── sitemap.ts                     # Dynamic sitemap generator
│   └── globals.css                    # TailwindCSS v4 tokens & .markdown-preview typography
├── context/
│   └── EditorContext.tsx              # Module context state & handlers (useEditorContext)
├── lib/
│   ├── markdown-utils.ts              # Marked parser, Turndown GFM converter & templates
│   └── utils.ts                       # Class name merging utility (cn)
├── components/
│   ├── pages/
│   │   └── editor/
│   │       ├── MainPage.tsx           # Orchestrator with resizable split layout
│   │       ├── Header.tsx             # Top bar (Attach file, renamer, export, view modes)
│   │       ├── EditorToolbar.tsx      # Markdown formatting toolbar
│   │       ├── RawMarkdownEditor.tsx  # Plaintext editor with line numbers & shortcuts
│   │       ├── EditablePreview.tsx    # Live editable preview with bidirectional sync
│   │       ├── FileAttachmentModal.tsx# Attachment dropzone modal & preset templates
│   │       └── StatusBar.tsx          # Metrics bar (words, lines, characters, read time)
│   └── ui/                            # shadcn/ui component primitives
└── public/                            # Static assets
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **UI Primitives**: [shadcn/ui (Base UI)](https://ui.shadcn.com/)
- **Markdown Parsing**: [Marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify)
- **HTML to Markdown Converter**: [Turndown](https://github.com/mixmark-io/turndown) + `turndown-plugin-gfm`
- **Split Pane Resizing**: `react-resizable-panels`
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/example/md-file-editor.git
   cd md-file-editor
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

- `npm run dev`: Starts the Turbopack Next.js development server at `http://localhost:3000`.
- `npm run build`: Compiles and builds the application for production with strict TypeScript validation.
- `npm run start`: Runs the built production application.
- `npm run lint`: Runs ESLint across the codebase.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# md-editor
