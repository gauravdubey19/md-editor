import { marked } from "marked";
import TurndownService from "turndown";
// @ts-expect-error turndown-plugin-gfm does not have official typescript definitions
import { gfm } from "turndown-plugin-gfm";
import DOMPurify from "dompurify";

export type ViewMode = "split" | "editor-only" | "preview-only";
export type PreviewEditMode = "visual-edit" | "read-only";

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  readingTimeMinutes: number;
}

export interface MarkdownSample {
  id: string;
  title: string;
  description: string;
  iconName: string;
  content: string;
}

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Configure Turndown for HTML -> Markdown conversion
const createTurndownService = (): TurndownService => {
  const service = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  // Apply GFM (GitHub Flavored Markdown: tables, strikethrough, task lists)
  service.use(gfm);

  // Custom rule for task list checkboxes
  service.addRule("taskListCheckbox", {
    filter: (node: HTMLElement) => {
      return node.nodeName === "INPUT" && node.getAttribute("type") === "checkbox";
    },
    replacement: (_content: string, node: Node) => {
      const el = node as HTMLInputElement;
      return el.checked ? "[x] " : "[ ] ";
    },
  });

  // Custom rule for pre / code with copy buttons or badges
  service.addRule("codeBlockCleanup", {
    filter: ["pre"],
    replacement: (_content: string, node: Node) => {
      const el = node as HTMLElement;
      const codeEl = el.querySelector("code");
      const codeText = codeEl ? codeEl.textContent || "" : el.textContent || "";
      const langClass = codeEl ? codeEl.className : el.className;
      const match = /language-(\w+)/.exec(langClass || "");
      const lang = match ? match[1] : "";
      return `\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
    },
  });

  return service;
};

let turndownInstance: TurndownService | null = null;

function getTurndownService(): TurndownService {
  if (!turndownInstance) {
    turndownInstance = createTurndownService();
  }
  return turndownInstance;
}

/**
 * Convert Markdown string to sanitized HTML string
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  try {
    const rawHtml = marked.parse(markdown, { async: false }) as string;
    if (typeof window !== "undefined") {
      return DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ["input"],
        ADD_ATTR: ["type", "checked", "disabled", "data-line", "data-task-index"],
      });
    }
    return rawHtml;
  } catch (err: unknown) {
    console.error("Failed to parse markdown to html:", err);
    return `<p class="text-destructive">Failed to parse markdown.</p>`;
  }
}

/**
 * Convert HTML DOM or HTML string back to clean Markdown
 */
export function htmlToMarkdown(htmlOrElement: string | HTMLElement): string {
  try {
    const turndown = getTurndownService();
    if (typeof htmlOrElement === "string") {
      return turndown.turndown(htmlOrElement);
    }
    return turndown.turndown(htmlOrElement);
  } catch (err: unknown) {
    console.error("Failed to convert html to markdown:", err);
    return typeof htmlOrElement === "string" ? htmlOrElement : htmlOrElement.innerText;
  }
}

/**
 * Calculate document statistics
 */
export function calculateStats(content: string): DocumentStats {
  if (!content || content.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 1,
      readingTimeMinutes: 0,
    };
  }

  const lines = content.split(/\r\n|\r|\n/).length;
  const characters = content.length;
  const charactersNoSpaces = content.replace(/\s/g, "").length;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    readingTimeMinutes,
  };
}

/**
 * Prettify / Format markdown indentation & spacing
 */
export function formatMarkdownContent(markdown: string): string {
  const lines = markdown.split(/\r\n|\r|\n/);
  const formatted: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      formatted.push(line);
      continue;
    }

    if (inCodeBlock) {
      formatted.push(line);
      continue;
    }

    // Clean trailing whitespace on normal lines
    let trimmed = line.trimEnd();

    // Standardize list indentation
    if (/^\s*[-*+]\s+\[([ xX])\]\s+/.test(trimmed)) {
      // Task list item
      trimmed = trimmed.replace(/^(\s*)[-*+]\s+\[([ xX])\]\s+/, "$1- [$2] ");
    } else if (/^\s*[*+]\s+/.test(trimmed)) {
      // Convert * or + bullets to standard -
      trimmed = trimmed.replace(/^(\s*)[*+]\s+/, "$1- ");
    }

    formatted.push(trimmed);
  }

  // Remove excessive consecutive blank lines (> 2)
  return (
    formatted
      .join("\n")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim() + "\n"
  );
}

/**
 * Sample Markdown documents for instant testing & demonstration
 */
export const SAMPLE_DOCUMENTS: MarkdownSample[] = [
  {
    id: "full-showcase",
    title: "Interactive Studio Showcase",
    description: "Complete showcase featuring live editable context, GFM tables, checklists, and code.",
    iconName: "Sparkles",
    content: `# 🚀 Welcome to Markdown Studio

Markdown Studio is a modern, bidirectional Markdown editor. You can format plain text on the left, **or directly click and edit within this rich preview**!

---

## ⚡ Key Highlights

- **Two-Way Realtime Sync**: Edit in plain text markdown or directly in the visual preview.
- **Interactive Checklists**: Click on the checkboxes directly in preview mode!
- **GFM Tables**: Clean, responsive tabular data formatted with shadcn design tokens.
- **File Attachment & Drag-and-Drop**: Easily import and export your \`.md\` files.

---

## 📋 Interactive Task Checklist

Try clicking the checkboxes right here in the preview pane:

- [x] Create project with Next.js App Router and TailwindCSS
- [x] Install shadcn/ui components and Luma theme
- [x] Implement bidirectional visual live preview editing
- [ ] Connect custom cloud storage syncing
- [ ] Share interactive document link with team members

---

## 📊 Sample Data Table

| Feature | Plain Text Editor | Visual Live Preview | Status |
| :--- | :--- | :--- | :--- |
| **Direct Editing** | ✅ Supported | ✅ Supported | Active |
| **Syntax Highlighting** | ✅ Monospace & Line Count | ✅ Styled Typography | Ready |
| **Interactive Checkboxes** | Edit \`[x]\` or \`[ ]\` | Direct Click Toggle | Synced |
| **Table Formatting** | Pipe Syntax \`|...\` | Rich HTML Table | Formatted |

---

## 💡 Code Snippet Example

Here is how simple and type-safe the module context is:

\`\`\`typescript
import React, { createContext, useContext, useState } from "react";

interface EditorState {
  markdown: string;
  fileName: string;
  isDirty: boolean;
}

export const EditorContext = createContext<EditorState | undefined>(undefined);

export function useEditorContext(): EditorState {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within EditorProvider");
  }
  return context;
}
\`\`\`

> *"Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML)."*
> — **John Gruber**

---

### 🎨 Try Editing This Section!
Feel free to click into any heading or paragraph in the preview on the right and start typing. Watch the markdown on the left update automatically!
`,
  },
  {
    id: "project-readme",
    title: "Project README Template",
    description: "Standard GitHub repository README with badges, installation, and roadmap.",
    iconName: "FileText",
    content: `# 📦 Project Name

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()

A modern, fast, and delightful tool designed to streamline your daily engineering workflows.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/example/project-name.git

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4
- **Components**: shadcn/ui (Base UI)
- **Language**: TypeScript (Strict Mode)

## 🗺️ Roadmap

- [x] Phase 1: Core architecture & component library
- [x] Phase 2: Markdown parser & live renderer
- [ ] Phase 3: Export to PDF & Word documents
- [ ] Phase 4: Collaborative real-time editing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
`,
  },
  {
    id: "technical-spec",
    title: "Engineering RFC & Technical Spec",
    description: "Architecture decision record (ADR) and technical specification format.",
    iconName: "Code2",
    content: `# RFC-104: Bidirectional Markdown Synchronization Engine

**Author**: Senior Systems Architect  
**Status**: Accepted  
**Date**: 2026-08-14  

---

## 1. Problem Statement

Developers frequently need to edit Markdown documentation in both raw plaintext format (for precise formatting control) and WYSIWYG visual mode (for reading and quick context changes). Existing tools often suffer from cursor jumping, markup corruption, or inconsistent synchronization.

## 2. Proposed Architecture

The system utilizes an event-driven synchronization bridge between two viewports:

\`\`\`
┌────────────────────────┐         ┌────────────────────────┐
│  Plaintext Code View   │ ──(1)─► │   Marked AST Parser    │
│  (Controlled Textarea) │         │   + DOMPurify Filter   │
└────────────────────────┘         └───────────┬────────────┘
            ▲                                  │ (2)
            │ (4)                              ▼
┌───────────┴────────────┐         ┌────────────────────────┐
│ Turndown HTML Serializer│ ◄──(3)─ │  Editable Visual DOM   │
│ + GFM Extension Plugin │         │   (contentEditable)    │
└────────────────────────┘         └────────────────────────┘
\`\`\`

### 2.1 State Transitions

1. **User types in plain text editor**: Triggers \`setMarkdown(text, 'raw')\`. Preview updates via sanitized HTML renderer.
2. **User edits visual DOM**: Triggers \`input\` on \`contentEditable\` element. Turndown converts updated DOM node to clean Markdown and dispatches \`setMarkdown(md, 'preview')\`.
3. **Lock mechanism**: Active input lock flag prevents loopback re-rendering while user is actively focused on one viewport.

## 3. Security Considerations

- All HTML rendered in the preview must pass through **DOMPurify** to eliminate potential XSS vectors.
- Raw script tags and \`javascript:\` pseudo-protocols are stripped during serialization.
`,
  },
];
