import {
  Bold,
  Code,
  FileCode,
  Heading2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
} from 'lucide-react';
import type { MarkdownExample, ToolbarActionDefinition } from '~root/types';

export const TOOLBAR_ACTIONS: ToolbarActionDefinition[] = [
  { action: 'heading', icon: Heading2, labelKey: 'toolbar.heading' },
  { action: 'bold', icon: Bold, labelKey: 'toolbar.bold', shortcut: 'Ctrl+B' },
  { action: 'italic', icon: Italic, labelKey: 'toolbar.italic', shortcut: 'Ctrl+I' },
  { action: 'strikethrough', icon: Strikethrough, labelKey: 'toolbar.strikethrough' },
  { action: 'link', icon: Link, labelKey: 'toolbar.link' },
  { action: 'image', icon: Image, labelKey: 'toolbar.image' },
  { action: 'unorderedList', icon: List, labelKey: 'toolbar.unorderedList' },
  { action: 'orderedList', icon: ListOrdered, labelKey: 'toolbar.orderedList' },
  { action: 'quote', icon: Quote, labelKey: 'toolbar.quote' },
  { action: 'inlineCode', icon: Code, labelKey: 'toolbar.inlineCode' },
  { action: 'codeBlock', icon: FileCode, labelKey: 'toolbar.codeBlock' },
  { action: 'horizontalRule', icon: Minus, labelKey: 'toolbar.horizontalRule' },
];

export const MARKDOWN_EXAMPLES: MarkdownExample[] = [
  {
    id: 'gettingStarted',
    labelKey: 'examples.gettingStarted',
    content: `# Getting Started

This is a paragraph with **bold**, _italic_ and ~~strikethrough~~ text, plus \`inline code\`.

## Lists

- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Second item

> A blockquote with a helpful tip.

[SR-WIKI](https://example.com) is a link, and here's an image:

![Placeholder](https://via.placeholder.com/120)

---

\`\`\`typescript
const greet = (name: string) => \`Hello, \${name}!\`;
console.log(greet('world'));
\`\`\`
`,
  },
  {
    id: 'taskList',
    labelKey: 'examples.taskList',
    content: `# Sprint Checklist

- [x] Write the design spec
- [x] Get it approved
- [ ] Implement the feature
- [ ] Write tests
- [ ] Ship it
`,
  },
  {
    id: 'table',
    labelKey: 'examples.table',
    content: `# Release Notes

| Version | Date       | Highlights          |
| ------- | ---------- | -------------------- |
| 1.2.0   | 2026-08-01 | Regex Tester tool     |
| 1.3.0   | 2026-08-20 | Markdown Preview tool |
`,
  },
];
