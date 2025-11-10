import { Connection, PublicKey } from '@solana/web3.js';
import { deserializeMetadata } from '@metaplex-foundation/mpl-token-metadata';

export async function fetchTokenSummary(connection: Connection, mint: string) {
  const mpk = new PublicKey(mint);
  const supply = await connection.getTokenSupply(mpk);
  const decimals = supply.value?.decimals ?? null;
  const amountRaw = supply.value?.amount ?? null;
  return { decimals, amountRaw };
}

export async function fetchLargestAccounts(connection: Connection, mint: string, limit = 20) {
  const m = new PublicKey(mint);
  const res = await connection.getTokenLargestAccounts(m);
  const list = (res?.value || [])
    .slice(0, limit)
    .map(x => ({ address: x.address.toBase58(), amount: x.amount }));
  return list;
}

export async function resolveOwners(
  connection: Connection,
  accounts: { address: string; amount: string }[],
  decimals: number | null
) {
  const out: any[] = [];
  for (const acc of accounts) {
    try {
      const parsed = await connection.getParsedAccountInfo(new PublicKey(acc.address));
      let owner: string | null = null;
      const data = parsed?.value?.data;
      if (data && 'parsed' in data) {
        owner = data.parsed.info.owner ?? null;
      } else if (parsed?.value?.owner) {
        owner = parsed.value.owner.toBase58();
      }

      let formatted = acc.amount;
      if (decimals !== null) {
        const big = BigInt(acc.amount);
        const denom = BigInt(10) ** BigInt(decimals);
        const whole = big / denom;
        const frac = big % denom;
        const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
        formatted = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
      }

      out.push({ tokenAccount: acc.address, owner, rawAmount: acc.amount, amount: formatted });
    } catch (e) {
      out.push({ tokenAccount: acc.address, owner: null, rawAmount: acc.amount, amount: acc.amount });
    }
  }
  return out;
}

export async function fetchMetadata(connection: Connection, mint: string) {
  try {
    const mintPub = new PublicKey(mint);
    const PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintPub.toBuffer()],
      PROGRAM_ID
    );

    const acct = await connection.getAccountInfo(pda);
    if (!acct) return { name: null, symbol: null };

    // ✅ FIX: new RpcAccount-compatible structure
    const rpcAccount: any = {
      executable: acct.executable,
      owner: acct.owner,
      lamports: BigInt(acct.lamports),
      data: acct.data,
      rentEpoch: BigInt(acct.rentEpoch ?? 0),
      space: BigInt(acct.data?.length ?? 0), // <-- required in newer @solana/web3.js
    };

    // Deserialize metadata
    const md = deserializeMetadata(rpcAccount);
    if (!md) return { name: null, symbol: null };
    return { name: md.name?.trim() || null, symbol: md.symbol?.trim() || null };
  } catch (e) {
    return { name: null, symbol: null };
  }
}
