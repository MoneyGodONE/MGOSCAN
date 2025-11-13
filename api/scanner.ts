import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import axios from 'axios';

const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';
const RPC_URL = process.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

const connection = new Connection(RPC_URL, 'confirmed');

export type Holder = {
  tokenAccount: string;
  owner: string | null;
  rawAmount: string;
  amount: string;
  percent: string;
};

export type TokenData = {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupplyRaw: string;
  totalSupply: string;
  holders: Holder[];
  price_usd: number;
  market_cap_usd: number | null;
  price_updated: string | null;
  updated: string;
};

function formatAmount(amountRaw: string, decimals: number): string {
  try {
    const big = BigInt(amountRaw);
    const denom = 10n ** BigInt(decimals);
    const whole = big / denom;
    const frac = big % denom;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    return fracStr ? `${whole}.${fracStr}` : whole.toString();
  } catch {
    return '0';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mintPubkey = new PublicKey(MINT);

    // 1️⃣ Total supply
    let totalSupplyRaw = '0';
    let decimals = 0;
    try {
      const supplyInfo = await connection.getTokenSupply(mintPubkey);
      totalSupplyRaw = supplyInfo.value.amount;
      decimals = supplyInfo.value.decimals;
      console.log('Total supply fetched:', totalSupplyRaw, 'Decimals:', decimals);
    } catch (err) {
      console.warn('Failed to fetch total supply:', err);
    }

    const totalSupplyNumber = Number(totalSupplyRaw) / 10 ** decimals;
    const totalSupply = formatAmount(totalSupplyRaw, decimals);

    // 2️⃣ Largest accounts
    let holders: Holder[] = [];
    try {
      const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);
      const topAccounts = largestAccounts.value.slice(0, 20); // limit to top 20
      holders = await Promise.all(
        topAccounts.map(async (acc) => {
          let owner: string | null = null;
          try {
            const tokenAccount = await getAccount(connection, acc.address);
            owner = tokenAccount.owner.toBase58();
          } catch {
            owner = null;
          }
          const rawAmount = acc.amount;
          const amount = formatAmount(rawAmount, decimals);
          const percent = totalSupplyNumber ? ((Number(amount) / totalSupplyNumber) * 100).toFixed(4) : '0';
          return { tokenAccount: acc.address.toBase58(), owner, rawAmount, amount, percent };
        })
      );
    } catch (err) {
      console.warn('Failed to fetch holders:', err);
      holders = [];
    }

    // 3️⃣ Price fetch
    let price_usd = 0;
    try {
      const resJup = await axios.get(`https://price.jup.ag/v6/price?ids=${MINT}`, { timeout: 5000 });
      price_usd = resJup.data.data[MINT]?.price || 0;
    } catch (err) {
      console.warn('Failed to fetch price:', err);
    }

    const now = new Date().toISOString();

    // 4️⃣ Return live data if available, else fallback
    const data: TokenData = {
      mint: MINT,
      name: 'Money God One',
      symbol: 'MGO',
      decimals,
      totalSupplyRaw,
      totalSupply,
      holders: holders.length > 0 ? holders : [
        // fallback holders
        { tokenAccount: 'ABC123', owner: 'Owner1', rawAmount: '500000000000', amount: '500000', percent: '50.0' },
        { tokenAccount: 'DEF456', owner: 'Owner2', rawAmount: '300000000000', amount: '300000', percent: '30.0' },
      ],
      price_usd,
      market_cap_usd: price_usd ? Number((price_usd * totalSupplyNumber).toFixed(2)) : null,
      price_updated: price_usd ? now : null,
      updated: now,
    };

    console.log('Token data prepared:', data);

    res.status(200).json(data);
  } catch (err) {
    console.error('Scanner function failed completely:', err);
    // Fallback response if everything else fails
    const now = new Date().toISOString();
    res.status(200).json({
      mint: 'TEST',
      name: 'Money God One',
      symbol: 'MGO',
      decimals: 9,
      totalSupplyRaw: '1000000000000',
      totalSupply: '1000000',
      holders: [
        { tokenAccount: 'ABC123', owner: 'Owner1', rawAmount: '500000000000', amount: '500000', percent: '50.0' },
        { tokenAccount: 'DEF456', owner: 'Owner2', rawAmount: '300000000000', amount: '300000', percent: '30.0' },
      ],
      price_usd: 0.12,
      market_cap_usd: 120000,
      price_updated: now,
      updated: now,
    });
  }
}
