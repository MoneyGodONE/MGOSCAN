import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { getAccount } from '@solana/spl-token';
import axios from 'axios';

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC_URL, 'confirmed');

const metaplex = Metaplex.make(connection);

export interface Metadata {
  name: string;
  symbol: string;
}

export interface TokenSummary {
  totalSupply: number;
  amountRaw: string;
  decimals: number;
  price_usd: number;
}

export interface HolderAccount {
  address: PublicKey;
  amount: string;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

export interface Holder {
  tokenAccount: string;
  owner: string | null;
  amount: string;
  rawAmount?: string;
  percent: string;
}

export async function fetchMetadata(mint: PublicKey): Promise<Metadata> {
  const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
  return {
    name: nft.name || 'Money God One',
    symbol: nft.symbol || 'MGO',
  };
}

export async function fetchTokenSummary(mint: PublicKey, mintAddressStr: string): Promise<TokenSummary> {
  const supplyInfo = await connection.getTokenSupply(mint);
  const totalSupply = Number(supplyInfo.value.amount);
  const amountRaw = supplyInfo.value.amount;
  const decimals = supplyInfo.value.decimals;

  let price_usd = 0;
  try {
    const jup = await axios.get(`https://price.jup.ag/v6/price?ids=${mintAddressStr}`, { timeout: 5000 });
    price_usd = jup.data.data[mintAddressStr]?.price || 0;
  } catch {
    try {
      const bird = await axios.get(`https://public-api.birdeye.so/defi/price?address=${mintAddressStr}`, {
        headers: { 'X-API-KEY': '' },
        timeout: 5000,
      });
      price_usd = bird.data.data?.value || 0;
    } catch {}
  }

  return {
    totalSupply,
    amountRaw,
    decimals,
    price_usd: Number(price_usd.toFixed(6)),
  };
}

export async function fetchLargestAccounts(mint: PublicKey): Promise<HolderAccount[]> {
  const largest = await connection.getTokenLargestAccounts(mint);
  return largest.value as HolderAccount[];
}

export async function resolveOwners(accounts: HolderAccount[], uiTotalSupply: number): Promise<Holder[]> {
  const holders = await Promise.all(
    accounts.map(async (acc) => {
      let owner: string | null = null;
      try {
        const tokenAccount = await getAccount(connection, acc.address);
        owner = tokenAccount.owner.toBase58();
      } catch {
        owner = null; // If resolution fails
      }
      const amount = acc.uiAmountString;
      const rawAmount = acc.amount;
      const percent = Number(( (acc.uiAmount || 0) / uiTotalSupply ) * 100).toFixed(4);
      return { tokenAccount: acc.address.toBase58(), owner, amount, rawAmount, percent };
    })
  );
  return holders;
}

// Combined function
export async function get
