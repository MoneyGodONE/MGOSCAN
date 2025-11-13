import React, { useEffect, useState } from "react";
import TokenInfoCard from "./ui/components/TokenInfoCard";
import HoldersTable from "./ui/components/HoldersTable";
import Footer from "./ui/components/Footer";

// Minimal backend Holder type
export interface Holder {
  tokenAccount: string;
  owner: string;
  rawAmount: string;
}

// TokenData type
export interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupplyRaw: string;
  totalSupply: string;
  holders: Holder[];
  price_usd: number;
  market_cap_usd: number;
  price_updated: string;
  updated: string;
}

const App: React.FC = () => {
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    fetch("/api/scanner")
      .then((r) => r.json())
      .then((data) => setToken(data));
  }, []);

  return (
    <div className="app-container">
      <h1>MGO Scan</h1>
      {token ? (
        <>
          <TokenInfoCard data={token} />
          <HoldersTable holders={token.holders} decimals={token.decimals} totalSupplyRaw={token.totalSupplyRaw} />
          <Footer updated={token.updated} />
        </>
      ) : (
        <p>Loading token data...</p>
      )}
    </div>
  );
};

export default App;
