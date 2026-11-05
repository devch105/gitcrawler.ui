
"use client";

import ChatMessageView from "@/components/chat/chat-message";
import MarkdownRenderer from "@/components/chat/markdown-renderer";
import type { ChatMessage } from "@/types/chat";
import { useEffect, useRef } from "react";

import {
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string | null;
  streamedText?: string;
  isStreaming?: boolean;
}

export default function MessageList({
  messages,
  isLoading,
  error,
  streamedText = "",
  isStreaming = false,
}: MessageListProps) {

const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: isStreaming ? "auto" : "smooth",
    block: "end",
  });
}, [messages, streamedText, isStreaming]);


  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading conversation...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-1 items-center justify-center px-4 text-center text-sm text-destructive"
      >
        {error}
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
          <MessageSquareText className="size-6 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-semibold">
          What would you like to know?
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Ask GitCrawler about your repository's architecture,
          functions, dependencies, or implementation details.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8">
      {/* Previously completed messages */}
      {messages.map((message) => (
        <ChatMessageView
          key={message.id}
          message={message}
        />
      ))}

      {/* Live streaming response */}
      {isStreaming && (
        <article className="flex w-full justify-start">
          <div className="min-w-0 max-w-[90%] flex-1">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              GitCrawler
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border bg-card px-4 py-3">
              {streamedText ? (
                <MarkdownRenderer content={streamedText} />
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Auto-scroll target */}
<div ref={bottomRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
