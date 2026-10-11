import { describe, expect, it } from "vitest";
import { Ledger, LedgerError } from "../src/ledger.js";

describe("Ledger", () => {
  it("adds entries and derives the balance", () => {
    const l = new Ledger();
    l.add({ amountCents: 1200, memo: "invoice #1" });
    l.add({ amountCents: -300, memo: "refund" });
    expect(l.list()).toHaveLength(2);
    expect(l.balanceCents()).toBe(900);
  });

  it("rejects a zero or fractional amount", () => {
    const l = new Ledger();
    expect(() => l.add({ amountCents: 0, memo: "x" })).toThrow(LedgerError);
    expect(() => l.add({ amountCents: 1.5, memo: "x" })).toThrow(/integer/);
  });

  it("rejects an empty or oversized memo", () => {
    const l = new Ledger();
    expect(() => l.add({ amountCents: 1, memo: "   " })).toThrow(/memo/);
    expect(() => l.add({ amountCents: 1, memo: "m".repeat(141) })).toThrow(/memo/);
  });

  it("404s on an unknown id", () => {
    const l = new Ledger();
    expect(() => l.get("e_zzzz")).toThrow(LedgerError);
  });
});
