import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { getAccount } from '@solana/spl-token';
import axios from 'axios';

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC_URL, 'confirmed');

const metaplex = Metaplex.make(connection);

interface Metadata {
  name: string;
  symbol: string;
}

interface TokenSummary {
  totalSupply: number;
  decimals: number;
  price_usd: number;
}

interface HolderAccount {
  address: PublicKey;
  amount: string;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

interface Holder {
  address: string;
  amount: number;
  percent: string;
}

export async function fetchMetadata(mint: PublicKey): Promise<Metadata> {
  const nft = await metaplex.nfts().findByMint({ mintAddress: mint }).run();
  return {
    name: nft.name || 'Money God One',
    symbol: nft.symbol || 'MGO',
  };
}

export async function fetchTokenSummary(mint: PublicKey, mintAddressStr: string): Promise<TokenSummary> {
  const supplyInfo = await connection.getTokenSupply(mint);
  const totalSupply = Number(supplyInfo.value.amount);
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
    decimals,
    price_usd: Number(price_usd.toFixed(6)),
  };
}

export async function fetchLargestAccounts(mint: PublicKey): Promise<readonly HolderAccount[]> {
  const largest = await connection.getTokenLargestAccounts(mint);
  return largest.value;
}

export async function resolveOwners(accounts: readonly HolderAccount[], uiTotalSupply: number): Promise<Holder[]> {
  const holders = await Promise.all(
    accounts.map(async (acc) => {
      const tokenAccount = await getAccount(connection, acc.address);
      const owner = tokenAccount.owner.toBase58();
      const amount = Number(acc.uiAmount || 0);
      const percent = Number((amount / uiTotalSupply) * 100).toFixed(4);
      return { address: owner, amount, percent };
    })
  );
  return holders;
}

// Optional: Your original combined function, refactored to use the above (export if needed)
export async function getTokenData() {
  const MINT_STR = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';
  const mint = new PublicKey(MINT_STR);

  const metadata = await fetchMetadata(mint);
  const summary = await fetchTokenSummary(mint, MINT_STR);
  const accounts = await fetchLargestAccounts(mint);
  const uiTotalSupply = summary.totalSupply / 10 ** summary.decimals;
  const resolvedHolders = await resolveOwners(accounts, uiTotalSupply);
  const holders = resolvedHolders.slice(0, 20);

  return {
    mint: MINT_STR,
    ...metadata,
    decimals: summary.decimals,
    totalSupply: summary.totalSupply.toLocaleString('vi-VN'),
    holders,
    price_usd: summary.price_usd,
    updated: new Date().toISOString(),
  };
}
