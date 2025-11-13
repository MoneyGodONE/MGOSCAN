import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TokenData } from '../src/types';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const data: TokenData = {
    mint: "TEST",
    name: "Money God One",
    symbol: "MGO",
    decimals: 9,
    totalSupplyRaw: "1000000000000",
    totalSupply: "1000000",
    holders: [
      { tokenAccount: "ABC123", owner: "Owner1", rawAmount: "500000000000", amount: "500000" },
      { tokenAccount: "DEF456", owner: "Owner2", rawAmount: "300000000000", amount: "300000" },
    ],
    price_usd: 0.12,
    market_cap_usd: 120000,
    price_updated: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  res.status(200).json(data);
}
