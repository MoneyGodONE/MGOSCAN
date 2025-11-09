import fs from 'fs';
import path from 'path';
import fetch from 'cross-fetch';
import { Connection } from '@solana/web3.js';
import { fetchTokenSummary, fetchLargestAccounts, resolveOwners, fetchMetadata } from './utils/solana';
import type { TokenData } from './types';


const RPC = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';
const OUT_FILE = path.join(process.cwd(), 'data', 'mgo.json');


async function fetchCoinGeckoPrice() {
try {
// Use CoinGecko simple price endpoint. Replace 'money-god-one' with the actual CoinGecko id if different.
const id = 'money-god-one';
const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_market_cap=true`;
const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
if (!res.ok) return null;
const j = await res.json();
if (!j[id]) return null;
return {
price_usd: j[id].usd ?? null,
market_cap_usd: j[id].usd_market_cap ?? null
};
} catch (e) {
return null;
}
}


function formatAmount(amountRaw: string, decimals: number) {
const big = BigInt(amountRaw);
const denom = BigInt(10) ** BigInt(decimals);
const whole = big / denom;
const frac = big % denom;
const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/,'');
return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
}


async function main(){
const conn = new Connection(RPC, {commitment: 'confirmed'});
console.log('Using RPC:', RPC);


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
totalSupply: (summary.amountRaw && summary.decimals !== null) ? formatAmount(summary.amountRaw, summary.decimals) : null,
holders,
price_usd: cg?.price_usd ?? null,
market_cap_usd: cg?.market_cap_usd ?? null,
price_updated: cg ? now : null,
updated: now
};


if (!fs.existsSync(path.dirname(OUT_FILE))) fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
console.log('Wrote', OUT_FILE);
}


main().catch(err => { console.error(err); process.exit(1); });
