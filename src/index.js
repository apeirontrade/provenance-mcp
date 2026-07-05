#!/usr/bin/env node
/**
 * Provenance MCP server (public thin client).
 *
 * Checks the wash-traffic / organic-revenue risk of an Algorand x402 endpoint
 * BEFORE your agent trusts or pays it — via the hosted Provenance API. The
 * quick check is free (rate-limited); deep 8-signal reports are x402-paid.
 *
 * Config: PROVENANCE_API_URL (defaults to the hosted service).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = (process.env.PROVENANCE_API_URL ?? "https://provenance.q3epzs69b902a.us-west-2.cs.amazonlightsail.com").replace(/\/$/, "");
const ADDR_RE = /^[A-Z2-7]{58}$/;

const server = new McpServer({ name: "provenance", version: "0.1.0" });

server.tool(
  "check_endpoint_risk",
  "Check the wash-traffic / organic-revenue risk of an Algorand x402 endpoint before trusting or paying it. Returns a risk level (low/medium/high/critical), a 0-100 score, and the specific on-chain red flags (few distinct payers, self-dealing payout loops, freshly-created wallets, metronomic timing). Free quick check via the hosted Provenance API.",
  { address: z.string().describe("The Algorand endpoint payTo address (58 characters, A-Z and 2-7)") },
  async ({ address }) => {
    if (!ADDR_RE.test(address)) {
      return { content: [{ type: "text", text: "Invalid Algorand address (expected 58 chars, A-Z2-7)." }], isError: true };
    }
    try {
      const res = await fetch(`${API}/check/${address}`, { signal: AbortSignal.timeout(120_000) });
      const body = await res.text();
      if (!res.ok) {
        return { content: [{ type: "text", text: `Provenance API ${res.status}: ${body.slice(0, 300)}` }], isError: true };
      }
      return { content: [{ type: "text", text: body }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Could not reach the Provenance API: ${e.message}` }], isError: true };
    }
  },
);

server.tool(
  "provenance_service_info",
  "Get Provenance service info: what it rates, the free tier, and the paid x402 tiers (score $0.05, full report $0.50, deep diligence $5.00) for deeper endpoint forensics.",
  {},
  async () => {
    try {
      const res = await fetch(`${API}/`, { signal: AbortSignal.timeout(30_000) });
      return { content: [{ type: "text", text: await res.text() }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Could not reach the Provenance API: ${e.message}` }], isError: true };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("provenance-mcp ready (stdio) →", API);
