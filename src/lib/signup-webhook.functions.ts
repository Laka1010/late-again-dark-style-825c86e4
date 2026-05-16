import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK_URL = "https://hook.eu1.make.com/c8e6u0aiiy9phq7195axvnapu6yr6nnd";

const payloadSchema = z.object({
  nombre: z.string().min(1).max(60),
  telefono: z.string().max(30).optional().default(""),
  email: z.string().email().max(255),
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