export type Holder = {
tokenAccount: string;
owner: string | null;
rawAmount: string;
amount: string; // formatted with decimals
};


export type TokenData = {
mint: string;
name?: string | null;
symbol?: string | null;
decimals?: number | null;
totalSupplyRaw?: string | null;
totalSupply?: string | null;
holders: Holder[];
price_usd?: number | null;
market_cap_usd?: number | null;
price_updated?: string | null;
updated: string; // ISO
};
