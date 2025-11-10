// api/scanner.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection } from '@solana/web3.js';
import fetch from 'cross-fetch';
import {
  fetchTokenSummary,
  fetchLargestAccounts,
  resolveOwners,
  fetchMetadata,
} from '../src/utils/solana';
import type { TokenData } from '../src/types';

// Use env vars safely
const RPC = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';

const conn = new Connection(RPC);

async function fetchCoinGeckoPrice() {
  try {
    const id = 'money-god-one';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j[id]) return null;
    return {
      price_usd: j[id].usd ?? null,
      market_cap_usd: j[id].usd_market_cap ?? null,
    };
  } catch {
    return null;
  }
}

function formatAmount(amountRaw: string, decimals: number): string {
  const big = BigInt(amountRaw);
  const denom = BigInt(10) ** BigInt(decimals);
  const whole = big / denom;
  const frac = big % denom;
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const summary = await fetchTokenSummary(conn, MINT);
    const largest = await fetchLargestAccounts(conn, MINT, 20);
    const holders = await resolveOwners(conn, largest, summary.decimals);
    const meta = await fetchMetadata(conn, MINT);
    const cg = await fetchCoinGeckoPrice();

    const now = new Date().toISOString();

    const data: TokenData = {
      mint: MINT,
      name: meta.name,
      symbol: meta.symbol,
      decimals: summary.decimals,
      totalSupplyRaw: summary.amountRaw ?? null,
      totalSupply:
        summary.amountRaw && summary.decimals !== null
          ? formatAmount(summary.amountRaw, summary.decimals)
          : null,
      holders,
      price_usd: cg?.price_usd ?? null,
      market_cap_usd: cg?.market_cap_usd ?? null,
      price_updated: cg ? now : null,
      updated: now,
    };

    res.status(200).json(data);
  } catch (err: any) {
    console.error('Error in /api/scanner:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
