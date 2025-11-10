import { Connection, PublicKey } from '@solana/web3.js';
<<<<<<< HEAD
import { deserializeMetadata } from '@metaplex-foundation/mpl-token-metadata';

// ✅ Use environment variable safely (Vite or Node)
const RPC_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_SOLANA_RPC) ||
  process.env.VITE_SOLANA_RPC ||
  'https://api.mainnet-beta.solana.com';

// ✅ Connection (no commitment param in v2)
export const connection = new Connection(RPC_URL);

export async function fetchTokenSummary(mint: string) {
=======

export async function fetchTokenSummary(connection: Connection, mint: string) {
>>>>>>> 99203d2 (Add missing deps/types for Solana/Node and fix TS errors)
  const mpk = new PublicKey(mint);
  const supply = await connection.getTokenSupply(mpk);
  const decimals = supply.value?.decimals ?? null;
  const amountRaw = supply.value?.amount ?? null;
  return { decimals, amountRaw };
}

<<<<<<< HEAD
export async function fetchLargestAccounts(mint: string, limit = 20) {
  const m = new PublicKey(mint);
  const res = await connection.getTokenLargestAccounts(m);
  const list = (res?.value || [])
    .slice(0, limit)
    .map((x) => ({ address: x.address.toBase58(), amount: x.amount }));
  return list;
}

export async function resolveOwners(
  accounts: { address: string; amount: string }[],
  decimals: number | null
) {
=======
export async function fetchLargestAccounts(connection: Connection, mint: string, limit = 20) {
  const m = new PublicKey(mint);
  const res = await connection.getTokenLargestAccounts(m);
  const list = (res?.value || []).slice(0, limit).map((x: any) => ({ address: x.address.toBase58(), amount: x.amount }));
  return list;
}

export async function resolveOwners(connection: Connection, accounts: { address: string; amount: string }[], decimals: number | null) {
>>>>>>> 99203d2 (Add missing deps/types for Solana/Node and fix TS errors)
  const out: any[] = [];
  for (const acc of accounts) {
    try {
      const parsed = await connection.getParsedAccountInfo(new PublicKey(acc.address));
<<<<<<< HEAD
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

export async function fetchMetadata(mint: string) {
  try {
    const mintPub = new PublicKey(mint);
    const PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintPub.toBuffer()],
      PROGRAM_ID
    );

    const acct = await connection.getAccountInfo(pda);
    if (!acct) return { name: null, symbol: null };

    // ✅ RpcAccount-like structure for deserializeMetadata
    const rpcAccount: any = {
      executable: acct.executable,
      owner: acct.owner,
      lamports: BigInt(acct.lamports),
      data: acct.data,
      rentEpoch: BigInt(acct.rentEpoch ?? 0),
      space: BigInt(acct.data?.length ?? 0),
    };

    const md = deserializeMetadata(rpcAccount);
    if (!md) return { name: null, symbol: null };
    return { name: md.name?.trim() || null, symbol: md.symbol?.trim() || null };
  } catch {
=======
      const parsedValue = parsed?.value ?? null;
      const dataField = parsedValue?.data as any;

      // безопасно получить owner из parsed-структуры или из поля owner (AccountInfo.owner)
      let owner: string | null = null;
      if (dataField && typeof dataField === 'object' && 'parsed' in dataField) {
        owner = dataField.parsed?.info?.owner ?? null;
      }
      if (!owner) {
        owner = parsedValue?.owner ? (parsedValue.owner as any).toBase58?.() ?? null : null;
      }

      let formatted = acc.amount;
      if (decimals !== null) {
        const big = BigInt(acc.amount);
        const denom = BigInt(10) ** BigInt(decimals);
        const whole = big / denom;
        const frac = big % denom;
        const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/,'');
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

    // динамический импорт, чтобы не использовать type-only экспорт как значение
    const mpl = await import('@metaplex-foundation/mpl-token-metadata');
    const MetadataClass = (mpl as any).Metadata;
    const md = MetadataClass && typeof MetadataClass.deserialize === 'function'
      ? MetadataClass.deserialize(acct.data)
      : null;

    const data = (md && (md[0] as any)?.data) || null;
    if (!data) return { name: null, symbol: null };
    return { name: data.name?.trim() || null, symbol: data.symbol?.trim() || null };
  } catch (e) {
>>>>>>> 99203d2 (Add missing deps/types for Solana/Node and fix TS errors)
    return { name: null, symbol: null };
  }
}
