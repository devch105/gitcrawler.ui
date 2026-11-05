
"use client";

import { CitationCard } from "@/components/chat/citation-card";
import MarkdownRenderer from "@/components/chat/markdown-renderer";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessageView({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "USER";

  return (
    <article
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`min-w-0 max-w-[90%] ${
          isUser ? "order-1" : "order-2"
        }`}
      >
        {/* Message author */}
        <div
          className={`mb-2 text-xs font-medium text-muted-foreground ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {isUser ? "You" : "GitCrawler"}
        </div>

        {/* Message content */}
        <div
          className={`min-w-0 overflow-hidden rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "border bg-card"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-7">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations?.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Sources
            </p>

            {message.citations.map((citation, index) => (
              <CitationCard
                key={`${citation.filePath ?? "source"}-${citation.startLine ?? "unknown"}-${index}`}
                citation={citation}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
