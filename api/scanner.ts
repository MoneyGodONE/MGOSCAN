import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'cross-fetch';
import {
  fetchTokenSummary,
  fetchLargestAccounts,
  resolveOwners,
  fetchMetadata,
  connection, // Import connection if needed, but not passing it
} from '../src/utils/solana';
import { PublicKey } from '@solana/web3.js';
import type { TokenData } from '../src/types'; // Assume this is where TokenData is defined; adjust if in App.tsx

const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';

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
    const mintPubkey = new PublicKey(MINT);

    const summary = await fetchTokenSummary(mintPubkey, MINT);
    const accounts = await fetchLargestAccounts(mintPubkey);
    const uiTotalSupply = summary.totalSupply / 10 ** summary.decimals;
    const holders = await resolveOwners(accounts, uiTotalSupply);
    const meta = await fetchMetadata(mintPubkey);
    const cg = await fetchCoinGeckoPrice();

    const now = new Date().toISOString();

    const data: TokenData = {
      mint: MINT,
      name: meta.name ?? null,
      symbol: meta.symbol ?? null,
      decimals: summary.decimals ?? null,
      totalSupplyRaw: summary.amountRaw ?? null,
      totalSupply:
        summary.amountRaw && summary.decimals !== null
          ? formatAmount(summary.amountRaw, summary.decimals)
          : null,
      holders: holders.slice(0, 20), // Limit to top 20 here
      price_usd: cg?.price_usd ?? null,
      market_cap_usd: cg?.market_cap_usd ?? null,
      price_updated: cg ? now : null,
      updated: now,
    };

    res.status(200).json(data);
  } catch (err: any) {
    console.error('Lỗi API:', err);
    res.status(500).json({ error: err.message || 'Lỡ có gì đó sai rồi' });
  }
}
