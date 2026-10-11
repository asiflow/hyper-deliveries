import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/app.js";

const { server } = createApp();
let base = "";

beforeAll(async () => {
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

describe("HTTP app", () => {
  it("answers /health", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("creates, reads and totals entries", async () => {
    const created = await fetch(`${base}/entries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amountCents: 2500, memo: "deposit" }),
    });
    expect(created.status).toBe(201);
    const entry = (await created.json()) as { id: string };
    const one = await fetch(`${base}/entries/${entry.id}`);
    expect(one.status).toBe(200);
    const bal = (await (await fetch(`${base}/balance`)).json()) as { balanceCents: number };
    expect(bal.balanceCents).toBe(2500);
  });

  it("returns 400 on invalid input and 404 on unknown routes", async () => {
    const bad = await fetch(`${base}/entries`, { method: "POST", body: "not json" });
    expect(bad.status).toBe(400);
    const missing = await fetch(`${base}/nope`);
    expect(missing.status).toBe(404);
  });
});
