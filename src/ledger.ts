/** The ledger — a tiny domain the deliveries work on. Entries are append-only
 *  records with an amount in cents and a memo; balances are derived. */

export type Entry = { id: string; amountCents: number; memo: string; createdAt: string };

export class LedgerError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export class Ledger {
  private entries: Entry[] = [];
  private seq = 0;

  list(): Entry[] {
    return [...this.entries];
  }

  get(id: string): Entry {
    const e = this.entries.find((x) => x.id === id);
    if (!e) throw new LedgerError(`entry ${id} not found`, 404);
    return e;
  }

  add(input: { amountCents: unknown; memo: unknown }): Entry {
    const amountCents = input.amountCents;
    const memo = input.memo;
    if (typeof amountCents !== "number" || !Number.isInteger(amountCents) || amountCents === 0) {
      throw new LedgerError("amountCents must be a non-zero integer", 400);
    }
    if (typeof memo !== "string" || memo.trim().length === 0 || memo.length > 140) {
      throw new LedgerError("memo must be 1–140 characters", 400);
    }
    this.seq += 1;
    const entry: Entry = {
      id: `e_${this.seq.toString(36).padStart(4, "0")}`,
      amountCents,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  balanceCents(): number {
    return this.entries.reduce((sum, e) => sum + e.amountCents, 0);
  }
}
