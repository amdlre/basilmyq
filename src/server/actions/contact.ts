"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { contactSchema } from "@/lib/validations/contact";
import { db } from "@/server/db";

export type ContactResult = {
  ok: boolean;
  error?: "invalid" | "rate-limited" | "failed";
  retryAfterMinutes?: number;
};

const MAX_PER_WINDOW = 3;
const WINDOW_MS = 60 * 60 * 1000;

/** In-memory throttle, same trade-off as the login limiter in Phase 2. */
const submissions = new Map<string, { count: number; resetAt: number }>();

function throttle(ip: string): { allowed: boolean; retryAfterMinutes: number } {
  const now = Date.now();

  for (const [key, bucket] of submissions) {
    if (now > bucket.resetAt) submissions.delete(key);
  }

  const bucket = submissions.get(ip);
  if (!bucket || now > bucket.resetAt) {
    submissions.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMinutes: 0 };
  }

  if (bucket.count >= MAX_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterMinutes: Math.ceil((bucket.resetAt - now) / 60000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMinutes: 0 };
}

/**
 * Stores the message, then tries to email a notification.
 *
 * The database write is what matters: the message must reach the dashboard
 * inbox whether or not Resend is configured or reachable, so a mail failure
 * never turns into an error for the sender.
 */
async function notify(
  subject: string,
  name: string,
  email: string,
  message: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return;

  try {
    const { Resend } = await import("resend");
    await new Resend(apiKey).emails.send({
      from: "basilmyq <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `[basilmyq] ${subject}`,
      text: `${name} <${email}>\n\n${message}`,
    });
  } catch {
    // The message is already saved; notification is best-effort.
  }
}

export async function submitContact(values: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "invalid" };

  // A filled honeypot is a bot: accept silently so it learns nothing.
  if (parsed.data.website) return { ok: true };

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  const limit = throttle(ip);
  if (!limit.allowed) {
    return {
      ok: false,
      error: "rate-limited",
      retryAfterMinutes: limit.retryAfterMinutes,
    };
  }

  try {
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        ip,
        userAgent: headerList.get("user-agent"),
      },
    });
  } catch {
    return { ok: false, error: "failed" };
  }

  await notify(
    parsed.data.subject,
    parsed.data.name,
    parsed.data.email,
    parsed.data.message,
  );

  // Refresh the dashboard so the unread badge picks the message up.
  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}
