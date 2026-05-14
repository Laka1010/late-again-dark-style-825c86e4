import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK_URL = "https://hook.eu1.make.com/1pv92v0h153ev8pe2wkz1e6mfpllfbxf";

const payloadSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
  display_name: z.string().min(1).max(60),
  phone: z.string().max(30).optional().default(""),
  created_at: z.string().datetime(),
});

export const notifySignupWebhook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.text();
      const logLine = {
        at: startedAt,
        event: "signup_webhook",
        email: data.email,
        status: res.status,
        ok: res.ok,
        body: body.slice(0, 2000),
      };
      // Server-side log: visible in worker logs (stack_modern--server-function-logs)
      if (res.ok) {
        console.log("[signup-webhook]", JSON.stringify(logLine));
      } else {
        console.error("[signup-webhook] non-2xx response", JSON.stringify(logLine));
      }
      return { status: res.status, ok: res.ok, body: body.slice(0, 2000) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[signup-webhook] fetch error",
        JSON.stringify({ at: startedAt, event: "signup_webhook_error", email: data.email, error: message }),
      );
      return { status: 0, ok: false, body: `error: ${message}` };
    }
  });