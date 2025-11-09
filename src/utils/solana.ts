import { Connection, PublicKey } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';


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
const list = (res?.value || []).slice(0, limit).map(x => ({ address: x.address.toBase58(), amount: x.amount }));
return list; // array of {address, amount}
}


export async function resolveOwners(connection: Connection, accounts: {address: string; amount: string}[], decimals: number | null) {
const out = [] as any[];
for (const acc of accounts) {
try {
const parsed = await connection.getParsedAccountInfo(new PublicKey(acc.address));
const owner = parsed?.value?.data?.parsed?.info?.owner ?? parsed?.value?.owner?.toBase58() ?? null;
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
const [pda] = await PublicKey.findProgramAddress([
Buffer.from('metadata'),
PROGRAM_ID.toBuffer(),
mintPub.toBuffer()
], PROGRAM_ID);


const acct = await connection.getAccountInfo(pda);
if (!acct) return { name: null, symbol: null };


const md = Metadata.deserialize(acct.data);
const data = (md && (md[0] as any).data) || null;
if (!data) return { name: null, symbol: null };
return { name: data.name?.trim() || null, symbol: data.symbol?.trim() || null };
} catch (e) {
return { name: null, symbol: null };
}
}
