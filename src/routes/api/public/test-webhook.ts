import { createFileRoute } from "@tanstack/react-router";

const WEBHOOK_URL = "https://hook.eu1.make.com/c8e6u0aiiy9phq7195axvnapu6yr6nnd";

function samplePayload() {
  return {
    nombre: "Test User",
    telefono: "+34600000000",
    email: "test@lateagain.dev",
  };
}

async function callWebhook() {
  const startedAt = new Date().toISOString();
  const payload = samplePayload();
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    const result = {
      at: startedAt,
      sent: payload,
      status: res.status,
      ok: res.ok,
      body: body.slice(0, 2000),
    };
    console.log("[test-webhook]", JSON.stringify(result));
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const result = { at: startedAt, sent: payload, status: 0, ok: false, error: message };
    console.error("[test-webhook] fetch error", JSON.stringify(result));
    return result;
  }
}

export const Route = createFileRoute("/api/public/test-webhook")({
  server: {
    handlers: {
      GET: async () => Response.json(await callWebhook()),
      POST: async () => Response.json(await callWebhook()),
    },
  },
});