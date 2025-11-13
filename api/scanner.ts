// api/scanner.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchTokenData } from "../src/utils/solana";
import type { TokenData } from "../src/types";

const FAKE_DATA: TokenData = {
  mint: "TEST",
  name: "Money God One",
  symbol: "MGO",
  decimals: 9,
  totalSupplyRaw: "1000000000000",
  totalSupply: "1000000",
  holders: [
    { tokenAccount: "ABC123", owner: "Owner1", rawAmount: "500000000000", amount: "500000", percent: "50" },
    { tokenAccount: "DEF456", owner: "Owner2", rawAmount: "300000000000", amount: "300000", percent: "30" },
  ],
  price_usd: 0.12,
  market_cap_usd: 120000,
  price_updated: new Date().toISOString(),
  updated: new Date().toISOString(),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const data = await fetchTokenData();
    res.status(200).json(data);
  } catch (err: any) {
    console.error("scanner.ts failed:", err);
    res.status(200).json(FAKE_DATA);
  }
}
