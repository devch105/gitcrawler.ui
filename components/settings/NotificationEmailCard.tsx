
"use client";

import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
    getNotificationEmailSettings,
    updateNotificationEmail,
} from "@/lib/api/settings";
import {toast} from "sonner";

export default function NotificationEmailCard() {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const data = await getNotificationEmailSettings();

        setEmail(data.notificationEmail ?? "");
        setVerified(data.notificationEmailVerified);
      } catch {
        setError("Unable to load notification email settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, []);

  const handleSave = async () => {
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateNotificationEmail(email.trim());

      setVerified(true);
      setMessage(
        "Notification email updated successfully."
      );
      toast.success("Notification email updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update email address."
      );
      toast.error("Failed to update notification email.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
          <Mail className="h-5 w-5 text-[#52525B]" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#18181B]">
            Notification email
          </h3>

          <p className="mt-1 text-sm leading-5 text-[#71717A]">
            Manage the email address where GitCrawler sends
            repository indexing updates.
          </p>
        </div>
      </div>

      {/* Email input */}
      <div className="mt-6 space-y-2">
        <label
          htmlFor="notification-email"
          className="text-sm font-medium text-[#18181B]"
        >
          Email address
        </label>

        <input
          id="notification-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="developer@example.com"
          disabled={loading || saving}
          className="h-11 w-full rounded-lg border border-[#E4E4E7] bg-white px-3 text-sm outline-none transition placeholder:text-[#A1A1AA] focus:border-[#818CF8] focus:ring-2 focus:ring-[#818CF8]/20 disabled:bg-[#FAFAFA]"
        />
      </div>

      {/* Verification status */}
      {!loading && email && (
        <div className="mt-3 flex items-center gap-2">
          {verified ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Email verified
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Verification pending
              </span>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      {/* Save button */}
      <div className="mt-5 flex justify-end border-t border-[#E4E4E7] pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving || !email.trim()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#18181B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#27272A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52525B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {saving ? "Saving..." : "Save email"}
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-[#71717A]">
          Loading email settings...
        </p>
      )}

    </section>
  );
}
