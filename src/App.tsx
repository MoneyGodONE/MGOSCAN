import React, { useEffect, useState } from 'react';
import TokenInfoCard from './components/TokenInfoCard'; // Adjust path if needed
import HoldersTable from './components/HoldersTable'; // Adjust path if needed
import Footer from './components/Footer'; // Adjust path if needed

// Define TokenData based on your API response (from solana.ts)
interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holders: Array<{
    address: string;
    amount: number;
    percent: string;
  }>;
  price_usd: number;
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
          <TokenInfoCard data={token} /> {/* Pass token data as prop */}
          <HoldersTable holders={token.holders} /> {/* Pass holders as prop */}
          <Footer updated={token.updated} /> {/* Pass updated as prop */}
        </>
      ) : (
        <p>Loading token data...</p>
      )}
    </div>
  );
};

export default App;
