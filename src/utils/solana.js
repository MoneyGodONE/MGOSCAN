import { PublicKey } from '@solana/web3.js';
export async function fetchTokenSummary(connection, mint) {
    const mpk = new PublicKey(mint);
    const supply = await connection.getTokenSupply(mpk);
    const decimals = supply.value?.decimals ?? null;
    const amountRaw = supply.value?.amount ?? null;
    return { decimals, amountRaw };
}
export async function fetchLargestAccounts(connection, mint, limit = 20) {
    const m = new PublicKey(mint);
    const res = await connection.getTokenLargestAccounts(m);
    const list = (res?.value || []).slice(0, limit).map((x) => ({ address: x.address.toBase58(), amount: x.amount }));
    return list;
}
export async function resolveOwners(connection, accounts, decimals) {
    const out = [];
    for (const acc of accounts) {
        try {
            const parsed = await connection.getParsedAccountInfo(new PublicKey(acc.address));
            const parsedValue = parsed?.value ?? null;
            const dataField = parsedValue?.data;
            // безопасно получить owner из parsed-структуры или из поля owner (AccountInfo.owner)
            let owner = null;
            if (dataField && typeof dataField === 'object' && 'parsed' in dataField) {
                owner = dataField.parsed?.info?.owner ?? null;
            }
            if (!owner) {
                owner = parsedValue?.owner ? parsedValue.owner.toBase58?.() ?? null : null;
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
        }
        catch (e) {
            out.push({ tokenAccount: acc.address, owner: null, rawAmount: acc.amount, amount: acc.amount });
        }
    }
    return out;
}
export async function fetchMetadata(connection, mint) {
    try {
        const mintPub = new PublicKey(mint);
        const PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
        const [pda] = await PublicKey.findProgramAddress([Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintPub.toBuffer()], PROGRAM_ID);
        const acct = await connection.getAccountInfo(pda);
        if (!acct)
            return { name: null, symbol: null };
        // динамический импорт, чтобы не использовать type-only экспорт как значение
        const mpl = await import('@metaplex-foundation/mpl-token-metadata');
        const MetadataClass = mpl.Metadata;
        const md = MetadataClass && typeof MetadataClass.deserialize === 'function'
            ? MetadataClass.deserialize(acct.data)
            : null;
        const data = (md && md[0]?.data) || null;
        if (!data)
            return { name: null, symbol: null };
        return { name: data.name?.trim() || null, symbol: data.symbol?.trim() || null };
    }
    catch (e) {
        return { name: null, symbol: null };
    }
}
