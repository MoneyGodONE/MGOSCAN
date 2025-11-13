import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchTokenSummary, fetchLargestAccounts } from "../src/utils/solana";
import type { TokenData } from "../src/types";

const MINT = process.env.MINT || "4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const summary = await fetchTokenSummary(MINT);
    const holders = await fetchLargestAccounts(MINT);

    const data: TokenData = {
      mint: MINT,
      name: "Money God One",
      symbol: "MGO",
      decimals: summary.decimals,
      totalSupplyRaw: summary.amountRaw,
      totalSupply: (Number(summary.amountRaw) / 10 ** summary.decimals).toString(),
      holders,
      price_usd: summary.price_usd,
      market_cap_usd: null,
      price_updated: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    res.status(200).json(data);
  } catch (err: any) {
    console.error("scanner.ts failed:", err);
    res.status(200).json({ error: "Failed to fetch token data" });
  }
}
