// api/scanner.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';
import { getTokenMetadata } from '../src/utils/solana';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Missing token address' });
    }

    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
    const pubkey = new PublicKey(address);
    const metadata = await getTokenMetadata(connection, pubkey);

    res.status(200).json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
