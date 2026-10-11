import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Ledger, LedgerError } from "./ledger.js";

export type App = ReturnType<typeof createApp>;

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new LedgerError("body must be JSON", 400);
  }
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(json) });
  res.end(json);
}

/** Build the HTTP app around one ledger. Routes:
 *  GET  /health            → { ok: true }
 *  GET  /entries           → Entry[]
 *  POST /entries           → Entry (201)
 *  GET  /entries/:id       → Entry
 *  GET  /balance           → { balanceCents } */
export function createApp(ledger = new Ledger()) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname;
    try {
      if (req.method === "GET" && path === "/health") return send(res, 200, { ok: true });
      if (req.method === "GET" && path === "/entries") return send(res, 200, ledger.list());
      if (req.method === "POST" && path === "/entries") {
        const body = (await readJson(req)) as { amountCents?: unknown; memo?: unknown };
        return send(res, 201, ledger.add({ amountCents: body.amountCents, memo: body.memo }));
      }
      const m = /^\/entries\/([A-Za-z0-9_]+)$/.exec(path);
      if (req.method === "GET" && m) return send(res, 200, ledger.get(m[1]!));
      if (req.method === "GET" && path === "/balance") return send(res, 200, { balanceCents: ledger.balanceCents() });
      return send(res, 404, { error: "not found" });
    } catch (err) {
      if (err instanceof LedgerError) return send(res, err.status, { error: err.message });
      return send(res, 500, { error: "internal error" });
    }
  });
  return { server, ledger };
}
