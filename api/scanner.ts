import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'cross-fetch';
import {
  fetchTokenSummary,
  fetchLargestAccounts,
  resolveOwners,
  fetchMetadata,
  connection,
} from '../src/utils/solana'; // relative to api folder
import { PublicKey } from '@solana/web3.js';
import type { TokenData } from '../src/types';

const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';

async function fetchCoinGeckoPrice() {
  try {
    const id = 'money-god-one';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
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

    // Map holders for frontend
    const holdersMapped = holders
      .slice(0, 20)
      .map(holder => ({
        address: holder.address,
        amount: holder.rawAmount ? Number(holder.rawAmount) / 10 ** summary.decimals : 0,
        percent:
          holder.rawAmount && summary.amountRaw
            ? ((Number(holder.rawAmount) / Number(summary.amountRaw)) * 100).toFixed(2) + '%'
            : '0%',
      }));

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
      holders: holdersMapped,
      price_usd: cg?.price_usd ?? null,
      market_cap_usd: cg?.market_cap_usd ?? null,
      price_updated: cg ? now : null,
      updated: now,
    };

    res.status(200).json(data);
  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
