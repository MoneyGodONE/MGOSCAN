import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import axios from 'axios';

const MINT = process.env.MINT || '4bvgPRkTMnqRuHxFpCJQ4YpQj6i7cJkYehMjM2qNpump';
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

const connection = new Connection(RPC_URL, 'confirmed');
const metaplex = Metaplex.make(connection);

export async function getTokenData() {
  const mint = new PublicKey(MINT);

  // Метаданные
  const nft = await metaplex.nfts().findByMint({ mintAddress: mint }).run();
  const name = nft.name || 'Money God One';
  const symbol = nft.symbol || 'MGO';

  // Supply
  const supplyInfo = await connection.getTokenSupply(mint);
  const totalSupply = Number(supplyInfo.value.amount);
  const decimals = supplyInfo.value.decimals;

  // Top 20 holders
  const largest = await connection.getTokenLargestAccounts(mint);
  const holders = largest.value.map((acc: any) => ({
    address: acc.address.toBase58(),
    amount: Number(acc.uiAmount),
    percent: Number((acc.uiAmount || 0) / (totalSupply / 10 ** decimals) * 100).toFixed(4),
  })).slice(0, 20);

  // Цена через Jupiter
  let price_usd = 0;
  try {
    const jup = await axios.get(`https://price.jup.ag/v6/price?ids=${MINT}`, { timeout: 5000 });
    price_usd = jup.data.data[MINT]?.price || 0;
  } catch {
    try {
      const bird = await axios.get(`https://public-api.birdeye.so/defi/price?address=${MINT}`, {
        headers: { 'X-API-KEY': '' },
        timeout: 5000,
      });
      price_usd = bird.data.data?.value || 0;
    } catch {}
  }

  return {
    mint: MINT,
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toLocaleString('vi-VN'),
    holders,
    price_usd: Number(price_usd.toFixed(6)),
    updated: new Date().toISOString(),
  };
}
