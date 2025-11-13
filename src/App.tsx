import React, { useEffect, useState } from 'react';
import TokenInfoCard from './ui/components/TokenInfoCard';
import HoldersTable from './ui/components/HoldersTable';
import Footer from './ui/components/Footer';

interface Holder {
  address: string;
  amount: number;
  percent: string;
}

interface TokenData {
  mint: string;
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  totalSupply: string | null;
  holders: Holder[];
  price_usd: number | null;
  market_cap_usd?: number | null;
  price_updated?: string | null;
  updated: string;
}

const App: React.FC = () => {
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    fetch('/api/scanner')
      .then(r => r.json())
      .then(data => setToken(data));
  }, []);

  return (
    <div className="app-container">
      <h1>MGO Scan</h1>
      {token ? (
        <>
          <TokenInfoCard data={token} />
          <HoldersTable holders={token.holders} />
          <Footer updated={token.updated} />
        </>
      ) : (
        <p>Loading token data...</p>
      )}
    </div>
  );
};

export default App;
