import { ENDPOINTS } from "@/utilities/endpoints";

export interface NotificationEmailSettings {
  notificationEmail: string | null;
  notificationEmailVerified: boolean;
}

export async function getNotificationEmailSettings(): Promise<NotificationEmailSettings> {
  const response = await fetch(ENDPOINTS.NOTIFICATION_EMAIL, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notification email settings");
  }

  return response.json();
}

export async function updateNotificationEmail(email: string) {
  const response = await fetch(ENDPOINTS.NOTIFICATION_EMAIL, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || "Failed to update notification email"
    );
  }

  return response.json();
}