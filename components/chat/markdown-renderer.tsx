"use client";

import React, {
    Children,
    isValidElement,
    type ReactNode,
} from "react";

import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import CodeBlock from "@/components/chat/code-block";

import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function getLanguage(className?: string) {
  return className?.match(/language-([\w-]+)/)?.[1];
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-7 text-2xl font-bold tracking-tight">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold">
      {children}
    </h3>
  ),

  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-base font-semibold">
      {children}
    </h4>
  ),

  p: ({ children }) => (
    <p className="my-3 text-sm leading-7 text-foreground/90">
      {children}
    </p>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  ),

  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),

  del: ({ children }) => (
    <del className="text-muted-foreground">{children}</del>
  ),

  ul: ({ children, className }) => {
    // remark-gfm adds "contains-task-list" for checkbox lists
    const isTaskList = className?.includes("contains-task-list");

    return (
      <ul
        className={
          isTaskList
            ? "my-3 space-y-2 text-sm leading-7"
            : "my-3 ml-6 list-disc space-y-2 text-sm leading-7 marker:text-muted-foreground"
        }
      >
        {children}
      </ul>
    );
  },

  ol: ({ children }) => (
    <ol className="my-3 ml-6 list-decimal space-y-2 text-sm leading-7 marker:text-muted-foreground">
      {children}
    </ol>
  ),

  li: ({ children, className }) => {
    const isTaskItem = className?.includes("task-list-item");

    return (
      <li className={isTaskItem ? "flex list-none items-start gap-2" : "pl-1"}>
        {children}
      </li>
    );
  },

  input: ({ type, checked }) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={checked}
          disabled
          readOnly
          className="mt-2 h-4 w-4 shrink-0 accent-primary"
        />
      );
    }

    return null;
  },

  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/50 pl-4 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  hr: () => (
    <hr className="my-6 border-border" />
  ),

  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      {children}
    </a>
  ),

  code: ({ children, className }) => {
    const isHighlightedBlock = Boolean(
      className?.includes("language-") ||
      className?.includes("hljs")
    );

    if (isHighlightedBlock) {
      return (
        <code className={className}>
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
        {children}
      </code>
    );
  },

  pre: ({ children }) => {
    const child = Children.toArray(children).find(isValidElement);

    if (!child) {
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-[#0d1117] p-4 text-sm text-white">
          {children}
        </pre>
      );
    }

    const codeElement = child as React.ReactElement<{
      className?: string;
      children?: ReactNode;
    }>;

    const className = codeElement.props.className ?? "";
    const language = getLanguage(className);

    const code = extractText(codeElement.props.children);

    return (
      <CodeBlock language={language} code={code}>
        {codeElement.props.children}
      </CodeBlock>
    );
  },

  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-muted/60">{children}</thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),

  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-muted/30">{children}</tr>
  ),

  th: ({ children, style }) => (
    <th
      style={style}
      className="border-b px-4 py-2 text-left font-semibold text-foreground"
    >
      {children}
    </th>
  ),

  td: ({ children, style }) => (
    <td style={style} className="px-4 py-2 align-top text-foreground/90">
      {children}
    </td>
  ),

  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      loading="lazy"
      className="my-4 h-auto max-w-full rounded-lg border"
    />
  ),
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}