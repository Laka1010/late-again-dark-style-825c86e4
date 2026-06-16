import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK_URL = "https://hook.eu1.make.com/m346m81alhsufx0n15y1o1qdfcudkmhx";

const payloadSchema = z.object({
  email: z.string().email().max(255),
  nombre: z.string().max(60).optional().default(""),
  telefono: z.string().max(30).optional().default(""),
});

export const notifyLoginWebhook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, at: startedAt }),
      });
      const body = await res.text();
      const logLine = {
        at: startedAt,
        event: "login_webhook",
        email: data.email,
        status: res.status,
        ok: res.ok,
        body: body.slice(0, 2000),
      };
      if (res.ok) console.log("[login-webhook]", JSON.stringify(logLine));
      else console.error("[login-webhook] non-2xx response", JSON.stringify(logLine));
      return { status: res.status, ok: res.ok, body: body.slice(0, 2000) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[login-webhook] fetch error",
        JSON.stringify({ at: startedAt, event: "login_webhook_error", email: data.email, error: message }),
      );
      return { status: 0, ok: false, body: `error: ${message}` };
    }
  });