
"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

interface CodeBlockProps {
  language?: string;
  code: string;
  children: ReactNode;
}

export default function CodeBlock({
  language,
  code,
  children,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }

  return (
    <div className="my-5 min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-[#f6f8fa]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#eef1f4] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-yellow-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
          </div>

          <span className="text-xs font-semibold text-gray-600">
            {language || "Code"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-4">
        <pre className="!m-0 !bg-transparent !p-0 text-[13px] leading-6">
          <code className="!bg-transparent !p-0">
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}
