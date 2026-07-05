# provenance-mcp

**Check the wash-traffic risk of Algorand x402 endpoints before your agent pays them.**

Roughly half of x402 "agentic payment" activity is artificial — self-dealing loops,
fresh-wallet farms, metronomic bots. Provenance reads the chain and tells your agent
whether an endpoint's revenue is **organic or fabricated**, so it can decide *before*
sending USDC.

## Tools

- **`check_endpoint_risk(address)`** — free quick verdict for any Algorand endpoint
  payTo address: risk level (`low/medium/high/critical`), 0–100 score, and the
  on-chain red flags (distinct-payer count, self-dealing payout loops, wallet ages,
  timing regularity, funding concentration).
- **`provenance_service_info()`** — service + paid-tier info.

Deep forensics are x402-paid on the same API: `/score` $0.05 · `/report` $0.50
(full 8-signal grade + facilitator drift) · `/diligence` $5.00.

## Install

**Claude Code**
```bash
claude mcp add provenance -- npx -y provenance-mcp
```

**Claude Desktop / any MCP client** (`mcpServers` config):
```json
{
  "mcpServers": {
    "provenance": {
      "command": "npx",
      "args": ["-y", "provenance-mcp"]
    }
  }
}
```

Then ask your agent: *“check the wash risk of Algorand endpoint \<ADDRESS\>”*.

## How it works

The hosted Provenance engine indexes USDC (ASA 31566704) payments on Algorand
mainnet, enriches payer wallets (age, first funder, asset diversity, rekey
auth-addr), clusters them (union-find over funding + shared-key links), and runs
8 wash-detection signals. Scores are point-in-time snapshots, anchored on-chain
for tamper-evidence. Methodology: signals, not accusations — a high score means
the revenue pattern is consistent with self-dealing, not that the operator is
guilty of anything.

- Env: `PROVENANCE_API_URL` to point at a different Provenance deployment.
- Free tier: 30 checks/hour/IP.

MIT · Provenance — the trust layer for machine-payable endpoints.
