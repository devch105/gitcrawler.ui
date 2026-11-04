
"use client";

import {
  Clock3,
  LoaderCircle,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatSession } from "@/types/chat";
import { TiArrowLeftOutline } from "react-icons/ti";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState } from "react";
interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
  onRedirect: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  isLoading,
  isCreating,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRedirect,
}: ChatSidebarProps) {



  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-muted/20 p-3">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between px-1">
        <span className="text-lg font-semibold tracking-tight">
          GitCrawler
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRedirect}
          aria-label="Go back to dashboard"
        >
          <TiArrowLeftOutline />
        </Button>
      </div>

      {/* New Chat */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onNewChat}
        disabled={isCreating}
      >
        {isCreating ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        New chat
      </Button>

      {/* Recent Chats */}
      <div className="mb-2 mt-7 flex items-center gap-2 px-2">
        <Clock3 className="size-3.5 text-muted-foreground" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent chats
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading conversations...
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-4 text-sm leading-5 text-muted-foreground">
            No conversations yet. Start a new chat to explore your codebase.
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={`group flex items-center gap-1 rounded-lg transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {/* Select Chat */}
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                    isActive ? "font-medium" : ""
                  }`}
                >
                  <MessageSquare className="size-4 shrink-0" />

                  <span className="truncate">
                    {session.title}
                  </span>
                </button>

                {/* Delete Chat */}
               <button
  type="button"
  onClick={() => setDeleteSessionId(session.id)}
  aria-label={`Delete ${session.title}`}
  title="Delete chat"
  className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
>
  <Trash2 className="size-4" />
</button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t px-2 pt-3 text-xs text-muted-foreground">
        Repository-aware AI assistant
      </div>



<AlertDialog.Root
  open={!!deleteSessionId}
  onOpenChange={(open) => {
    if (!open && !isDeleting) {
      setDeleteSessionId(null);
    }
  }}
>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
    <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 text-foreground shadow-lg">
    <div className="space-y-2">
      <AlertDialog.Title className="text-lg font-semibold">
        Delete this conversation?
      </AlertDialog.Title>

      <AlertDialog.Description className="text-sm text-muted-foreground">
        This action cannot be undone. This conversation and all
        its messages will be permanently deleted.
      </AlertDialog.Description>
    </div>

    <div className="mt-6 flex justify-end gap-2">
      <Button
        variant="outline"
        disabled={isDeleting}
        onClick={() => setDeleteSessionId(null)}
      >
        Cancel
      </Button>

      <Button
        disabled={isDeleting}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={async () => {
          if (!deleteSessionId) return;

          setIsDeleting(true);

          try {
            await onDeleteSession(deleteSessionId);
            setDeleteSessionId(null);
          } finally {
            setIsDeleting(false);
          }
        }}
      >
        {isDeleting ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete conversation"
        )}
      </Button>
    </div>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>

    </aside>
  );
}
