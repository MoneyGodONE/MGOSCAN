// src/utils/solana.ts
import axios from "axios";
import type { TokenData, Holder } from "../types";

const SOLSCAN_API = process.env.SOLSCAN_API;
const MINT = process.env.MINT || "4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump";

// Fetch token metadata
export async function fetchMetadata(): Promise<{ name: string; symbol: string }> {
  try {
    const res = await axios.get(`https://api.solscan.io/token/meta?token=${MINT}&apikey=${SOLSCAN_API}`);
    const data = res.data.data;
    return {
      name: data.name || "Money God One",
      symbol: data.symbol || "MGO",
    };
  } catch (err) {
    console.error("fetchMetadata failed", err);
    return { name: "Money God One", symbol: "MGO" };
  }
}

// Fetch token supply & price
export async function fetchTokenSummary(): Promise<{ decimals: number; amountRaw: string; totalSupply: string; price_usd: number }> {
  try {
    const res = await axios.get(`https://api.solscan.io/token/meta?token=${MINT}&apikey=${SOLSCAN_API}`);
    const data = res.data.data;
    const amountRaw = data.totalSupply.toString();
    const decimals = data.decimals;
    const totalSupply = (Number(data.totalSupply) / 10 ** decimals).toString();
    const price_usd = data.price || 0;
    return { decimals, amountRaw, totalSupply, price_usd };
  } catch (err) {
    console.error("fetchTokenSummary failed", err);
    return { decimals: 9, amountRaw: "1000000000000", totalSupply: "1000000", price_usd: 0 };
  }
}

// Fetch top holders
export async function fetchLargestAccounts(): Promise<Holder[]> {
  try {
    const res = await axios.get(`https://api.solscan.io/token/holder?token=${MINT}&limit=20&apikey=${SOLSCAN_API}`);
    return res.data.data.map((h: any) => ({
      tokenAccount: h.tokenAddress,
      owner: h.owner,
      rawAmount: h.amount,
      amount: (Number(h.amount) / 10 ** h.decimals).toString(),
      percent: ((Number(h.amount) / Number(h.totalSupply)) * 100).toFixed(4),
    }));
  } catch (err) {
    console.error("fetchLargestAccounts failed", err);
    return [
      { tokenAccount: "ABC123", owner: "Owner1", rawAmount: "500000000000", amount: "500000", percent: "50" },
      { tokenAccount: "DEF456", owner: "Owner2", rawAmount: "300000000000", amount: "300000", percent: "30" },
    ];
  }
}

// Combined function
export async function fetchTokenData(): Promise<TokenData> {
  const metadata = await fetchMetadata();
  const summary = await fetchTokenSummary();
  const holders = await fetchLargestAccounts();

  return {
    mint: MINT,
    name: metadata.name,
    symbol: metadata.symbol,
    decimals: summary.decimals,
    totalSupplyRaw: summary.amountRaw,
    totalSupply: summary.totalSupply,
    holders,
    price_usd: summary.price_usd,
    market_cap_usd: null,
    price_updated: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}
