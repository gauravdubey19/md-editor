"use client";

import React from "react";
import { useEditorContext } from "@/context/EditorContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  HeadingIcon,
  ListIcon,
  ListOrderedIcon,
  CheckSquareIcon,
  QuoteIcon,
  TableIcon,
  LinkIcon,
  ImageIcon,
  MinusIcon,
  Undo2Icon,
  Redo2Icon,
  TerminalSquareIcon,
} from "lucide-react";

export const EditorToolbar: React.FC = () => {
  const { insertSnippet, undo, redo, canUndo, canRedo } = useEditorContext();

  const handleHeading = (level: number) => {
    insertSnippet((selected) => {
      const hashes = "#".repeat(level);
      const text = selected || `Heading ${level}`;
      return {
        text: `\n${hashes} ${text}\n`,
        cursorOffset: hashes.length + 2,
        selectionLength: text.length,
      };
    });
  };

  const handleBold = () => {
    insertSnippet((selected) => {
      const text = selected || "bold text";
      return {
        text: `**${text}**`,
        cursorOffset: 2,
        selectionLength: text.length,
      };
    });
  };

  const handleItalic = () => {
    insertSnippet((selected) => {
      const text = selected || "italic text";
      return {
        text: `*${text}*`,
        cursorOffset: 1,
        selectionLength: text.length,
      };
    });
  };

  const handleStrikethrough = () => {
    insertSnippet((selected) => {
      const text = selected || "strikethrough text";
      return {
        text: `~~${text}~~`,
        cursorOffset: 2,
        selectionLength: text.length,
      };
    });
  };

  const handleInlineCode = () => {
    insertSnippet((selected) => {
      const text = selected || "code";
      return {
        text: `\`${text}\``,
        cursorOffset: 1,
        selectionLength: text.length,
      };
    });
  };

  const handleCodeBlock = () => {
    insertSnippet((selected) => {
      const text = selected || "// Write code here";
      return {
        text: `\n\`\`\`typescript\n${text}\n\`\`\`\n`,
        cursorOffset: 15,
        selectionLength: text.length,
      };
    });
  };

  const handleQuote = () => {
    insertSnippet((selected) => {
      const text = selected || "Quote text here";
      const quoted = text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return {
        text: `\n${quoted}\n`,
        cursorOffset: 3,
        selectionLength: text.length,
      };
    });
  };

  const handleBulletList = () => {
    insertSnippet((selected) => {
      if (selected) {
        const list = selected
          .split("\n")
          .map((l) => `- ${l.replace(/^[-*+]\s+/, "")}`)
          .join("\n");
        return { text: `\n${list}\n`, cursorOffset: 3, selectionLength: selected.length };
      }
      return { text: "\n- List item 1\n- List item 2\n- List item 3\n", cursorOffset: 3 };
    });
  };

  const handleOrderedList = () => {
    insertSnippet((selected) => {
      if (selected) {
        const list = selected
          .split("\n")
          .map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s+/, "")}`)
          .join("\n");
        return { text: `\n${list}\n`, cursorOffset: 4, selectionLength: selected.length };
      }
      return { text: "\n1. First item\n2. Second item\n3. Third item\n", cursorOffset: 4 };
    });
  };

  const handleTaskList = () => {
    insertSnippet((selected) => {
      if (selected) {
        const list = selected
          .split("\n")
          .map((l) => `- [ ] ${l.replace(/^[-*+]\s+(\[[ xX]\]\s+)?/, "")}`)
          .join("\n");
        return { text: `\n${list}\n`, cursorOffset: 7, selectionLength: selected.length };
      }
      return {
        text: "\n- [ ] Task to do\n- [x] Completed task\n",
        cursorOffset: 7,
      };
    });
  };

  const handleTable = () => {
    insertSnippet(() => {
      const table = `\n| Column 1 | Column 2 | Column 3 |
| :--- | :---: | ---: |
| Left aligned | Centered | Right aligned |
| Row 2 cell | Row 2 cell | Row 2 cell |\n`;
      return { text: table, cursorOffset: 3 };
    });
  };

  const handleLink = () => {
    insertSnippet((selected) => {
      const label = selected || "link title";
      return {
        text: `[${label}](https://example.com)`,
        cursorOffset: label.length + 3,
        selectionLength: "https://example.com".length,
      };
    });
  };

  const handleImage = () => {
    insertSnippet((selected) => {
      const alt = selected || "Alt text description";
      return {
        text: `![${alt}](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800)`,
        cursorOffset: 2,
        selectionLength: alt.length,
      };
    });
  };

  const handleHorizontalRule = () => {
    insertSnippet(() => ({
      text: "\n\n---\n\n",
      cursorOffset: 5,
    }));
  };

  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-card/60 px-3 py-1.5 overflow-x-auto scrollbar-none gap-1 shrink-0 text-xs">
      <div className="flex items-center gap-0.5 flex-wrap">
        {/* Undo / Redo */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={undo}
                disabled={!canUndo}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              />
            }
          >
            <Undo2Icon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={redo}
                disabled={!canRedo}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
              />
            }
          >
            <Redo2Icon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y / Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>

        <div className="h-3.5 w-px bg-border mx-1" />

        {/* Headings Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs rounded-lg text-muted-foreground hover:text-foreground" />}
          >
            <HeadingIcon className="size-3.5 text-primary" />
            <span className="font-medium">Headings</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => handleHeading(1)}>
              <span className="text-base font-bold">H1</span>
              <span className="ml-2 text-xs text-muted-foreground">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleHeading(2)}>
              <span className="text-sm font-bold">H2</span>
              <span className="ml-2 text-xs text-muted-foreground">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleHeading(3)}>
              <span className="text-xs font-semibold">H3</span>
              <span className="ml-2 text-xs text-muted-foreground">Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleHeading(4)}>
              <span className="text-xs font-medium">H4</span>
              <span className="ml-2 text-xs text-muted-foreground">Heading 4</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-3.5 w-px bg-border mx-1" />

        {/* Text Formats */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" onClick={handleBold} className="size-7 rounded-lg text-muted-foreground hover:text-foreground" />
            }
          >
            <BoldIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Bold (**text**) - Ctrl+B</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleItalic}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <ItalicIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Italic (*text*) - Ctrl+I</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleStrikethrough}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <StrikethroughIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Strikethrough (~~text~~)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleInlineCode}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <CodeIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Inline Code (`code`)</TooltipContent>
        </Tooltip>

        <div className="h-3.5 w-px bg-border mx-1" />

        {/* Structure / Lists */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleBulletList}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <ListIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Bullet List (- item)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleOrderedList}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <ListOrderedIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Numbered List (1. item)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleTaskList}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <CheckSquareIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Task Checklist (- [ ] task)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleQuote}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <QuoteIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Blockquote (&gt; text)</TooltipContent>
        </Tooltip>

        <div className="h-3.5 w-px bg-border mx-1" />

        {/* Insert Elements */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCodeBlock}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <TerminalSquareIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Code Block (```lang)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleTable}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <TableIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>GFM Table</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" onClick={handleLink} className="size-7 rounded-lg text-muted-foreground hover:text-foreground" />
            }
          >
            <LinkIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Link ([title](url)) - Ctrl+K</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleImage}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <ImageIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Image (![alt](url))</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleHorizontalRule}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            <MinusIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Horizontal Divider (---)</TooltipContent>
        </Tooltip>
      </div>

      <div className="text-[11px] text-muted-foreground font-mono hidden xl:block pr-2">GFM Markdown</div>
    </div>
  );
};
