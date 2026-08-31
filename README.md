<div align="center">

# 🚀 Markdown Studio

**A Modern, Bidirectional Markdown Editor, Interactive Live Preview & Context Sharing Studio**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Base_UI-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_TTL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  Format plain text Markdown on the left, or <strong>click directly inside the rich visual preview to edit</strong> in real time with bidirectional synchronization, synchronized scrolling, and <strong>time-limited context sharing</strong>!
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

### 🔗 3. Time-Limited Context Sharing (Configurable TTL)

- **Configurable Expiration**: Choose from presets (**5m, 10m, 30m, 1h, 5h, 24h**) or define a **Custom Duration** (minutes, hours, or days).
- **Cryptographic Security**: Generates unguessable 192-bit base64url tokens (`crypto.randomBytes(24)`).
- **Immutable Snapshots**: Sharing creates an immutable snapshot of your document that protects your original session from modifications.
- **Copy-on-Edit Forking**: Recipients opening `/s/[token]` can view the full workspace and edit locally. Edits never overwrite the shared original.
- **Lineage Re-Sharing**: Re-sharing an edited copy generates a new share URL while preserving ancestor lineage (`parentToken`).
- **Self-Cleaning**: MongoDB's native TTL index (`{ expiresAt: 1 }, { expireAfterSeconds: 0 }`) automatically cleans up expired shares in the background.

### 📎 4. File Attachments & Drag-and-Drop

- **Header Attachment Trigger**: Easily upload local `.md`, `.markdown`, or `.txt` files.
- **Global Drag & Drop**: Drop files anywhere across the browser window to open.
- **Preset Template Gallery**: Includes _Interactive Studio Showcase_, _Project README_, and _Engineering RFC_ templates.
- **Inline Renamer**: Rename active files directly in the top bar.

### 🛠️ 5. Markdown Formatting Toolbar

- **Headings**: H1, H2, H3, H4 quick dropdown selector.
- **Styling**: Bold (`**`), Italic (`*`), Strikethrough (`~~`), Inline Code (`` ` ``).
- **Structure**: Bullet lists, Numbered lists, Checklists, Blockquotes, Horizontal Dividers.
- **Inserts**: Code Blocks (fenced), GFM Tables, Links, and Images.
- **History**: Full Undo (<kbd>Ctrl+Z</kbd>) and Redo (<kbd>Ctrl+Y</kbd> / <kbd>Ctrl+Shift+Z</kbd>) stack.
- **Format / Prettify**: Automatic cleanup of list markers, indentation, and spacing.

### 📤 6. Export & Clipboard

- Download as `.md` file.
- Export as standalone, formatted `.html` document with styled typography.
- One-click Copy Markdown or Copy HTML to clipboard.

### 📊 7. Document Statistics & Theming

- Live bottom status bar tracking **Words**, **Characters**, **Lines**, **Estimated Reading Time**, **Cursor Position (Ln X, Col Y)**, and **Sync Status**.
- Three view modes: **Split View** (resizable panels), **Source Editor Only**, and **Live Preview Only**.
- Built-in Dark / Light theme toggle with `.theme-cps` color scheme and local storage persistence.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Markdown Studio App                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [ Header: File Attachment | Rename | Templates | Share (TTL) | Export | Theme ]│
│  [ Toolbar: Headings | Bold | Italic | Lists | Tables | Code | Undo | Redo ]    │
├───────────────────────────────────┬─────────────────────────────────────────────┤
│       Raw Markdown Editor         │            Editable Live Preview            │
│                                   │                                             │
│  - Monospace Editor               │  - Rendered GFM HTML (Marked)               │
│  - Line Numbers Gutter            │  - contentEditable (Turndown sync)          │
│  - Keyboard Shortcuts             │  - Interactive Checklists                   │
│  - Synchronized Scroll (1) ─────► │  - Synchronized Scroll (2) ──────────────►  │
├───────────────────────────────────┴─────────────────────────────────────────────┤
│  [ Status Bar: Words | Chars | Lines | Read Time | Ln/Col | Sync State ]        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐     ┌────────────────────────────────────┐
│      Share API (/api/share)          │     │    Shared Document View (/s/[id])  │
│  - Cryptographic 192-bit Token       │     │  - Server-Side Expiration Check    │
│  - TTL Validation (5m - 30d)         │     │  - Immutable Snapshot Loaded       │
│  - MongoDB TTL Index Auto-Purge      │     │  - Copy-on-Edit Forking Enabled    │
└──────────────────────────────────────┘     └────────────────────────────────────┘
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
│   ├── layout.tsx                     # Root layout with OpenGraph, SEO, Schema.org & Theme
│   ├── page.tsx                       # Main Studio route
│   ├── s/
│   │   └── [token]/
│   │       └── page.tsx               # Dynamic Server Component for shared contexts
│   ├── api/
│   │   └── share/
│   │       ├── route.ts               # POST: Create shared context with TTL
│   │       └── [token]/route.ts       # GET: Query shared document or check expiry
│   ├── opengraph-image.tsx            # WhatsApp-optimized lightweight OpenGraph banner
│   ├── twitter-image.tsx              # Twitter card preview
│   ├── icon.tsx                       # 32x32 Favicon generator
│   ├── apple-icon.tsx                 # 180x180 Apple Touch icon
│   ├── manifest.ts                    # Progressive Web App manifest
│   ├── robots.ts                      # Search crawler indexation
│   ├── sitemap.ts                     # XML Sitemap generator
│   └── globals.css                    # TailwindCSS v4 tokens & .theme-cps palette
├── context/
│   └── EditorContext.tsx              # Module context state & handlers (useEditorContext)
├── lib/
│   ├── db/
│   │   ├── mongodb.ts                 # MongoDB connection pooling & fallback
│   │   └── redis.ts                   # Redis client & in-memory cache fallback
│   ├── models/
│   │   └── SharedContext.ts           # Mongoose schema with native TTL index
│   ├── services/
│   │   └── share-service.ts           # Share creation, retrieval, and rate limiting
│   ├── markdown-utils.ts              # Marked parser, Turndown GFM converter & templates
│   └── utils.ts                       # Class name merging utility (cn)
├── components/
│   ├── pages/
│   │   ├── editor/
│   │   │   ├── MainPage.tsx           # Orchestrator with resizable split layout
│   │   │   ├── Header.tsx             # Top bar (Attach, Share, Rename, Export, Modes)
│   │   │   ├── EditorToolbar.tsx      # Markdown formatting toolbar
│   │   │   ├── RawMarkdownEditor.tsx  # Plaintext editor with line numbers & shortcuts
│   │   │   ├── EditablePreview.tsx    # Live editable preview with bidirectional sync
│   │   │   ├── FileAttachmentModal.tsx# Attachment dropzone modal & preset templates
│   │   │   └── StatusBar.tsx          # Metrics bar (words, lines, characters, read time)
│   │   └── share/
│   │       ├── ShareModal.tsx         # Configurable TTL selector & link generator
│   │       ├── SharedEditorWrapper.tsx# Shared workspace shell with countdown badge
│   │       └── ExpiredLinkView.tsx    # Dedicated expired link error state
│   └── ui/                            # shadcn/ui component primitives
├── setup.md                           # Database setup instructions (MongoDB & Redis)
└── public/                            # Static assets (og-image.png, favicon.svg)
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **UI Primitives**: [shadcn/ui (Base UI)](https://ui.shadcn.com/)
- **Database**: [MongoDB / Mongoose](https://mongoosejs.com/) (TTL auto-indexing)
- **Optional Cache**: [Redis / ioredis](https://github.com/redis/ioredis)
- **Markdown Parsing**: [Marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify)
- **HTML to Markdown**: [Turndown](https://github.com/mixmark-io/turndown) + `turndown-plugin-gfm`
- **Split Pane Resizing**: `react-resizable-panels`
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- `npm`, `pnpm`, or `yarn`
- (Optional) MongoDB connection string for persistent sharing

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/gauravdubey19/md-editor.git
   cd md-editor
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/markdown_studio?retryWrites=true&w=majority
   ```

   _(For full setup details, see [setup.md](setup.md).)_

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server at `http://localhost:3000`.
- `npm run build`: Compiles and builds the application for production with strict TypeScript validation.
- `npm run start`: Runs the production server.
- `npm run lint`: Runs ESLint across the codebase.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
