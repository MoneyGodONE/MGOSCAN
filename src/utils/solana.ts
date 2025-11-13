import axios from "axios";
import type { Holder, TokenSummary, Metadata } from "../types";

const SOLSCAN_API = process.env.SOLSCAN_API;

export async function fetchTokenSummary(mint: string): Promise<TokenSummary> {
  try {
    const res = await axios.get(`https://api.solscan.io/token/meta?token=${mint}&apikey=${SOLSCAN_API}`);
    const data = res.data.data;
    return {
      totalSupply: Number(data.totalSupply),
      amountRaw: data.totalSupply.toString(),
      decimals: data.decimals,
      price_usd: data.price || 0,
    };
  } catch (err) {
    console.error("fetchTokenSummary via Solscan failed", err);
    throw err;
  }
}

export async function fetchLargestAccounts(mint: string): Promise<Holder[]> {
  try {
    const res = await axios.get(`https://api.solscan.io/token/holder?token=${mint}&limit=20&apikey=${SOLSCAN_API}`);
    const holders = res.data.data.map((h: any) => ({
      tokenAccount: h.tokenAddress,
      owner: h.owner,
      rawAmount: h.amount,
      amount: (Number(h.amount) / 10 ** h.decimals).toString(),
      percent: ((Number(h.amount) / Number(h.totalSupply)) * 100).toFixed(4),
    }));
    return holders;
  } catch (err) {
    console.error("fetchLargestAccounts via Solscan failed", err);
    throw err;
  }
}
