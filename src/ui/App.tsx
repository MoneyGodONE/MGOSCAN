import React, { useEffect, useState } from "react";
import TokenInfoCard from "./components/TokenInfoCard";
import HoldersTable from "./components/HoldersTable";
import Footer from "./components/Footer";

export type Holder = {
  tokenAccount: string;
  owner: string | null;
  amount: string;
  rawAmount: string;
};

export type TokenData = {
  mint: string;
  name?: string | null;
  symbol?: string | null;
  decimals?: number | null;
  totalSupply?: string | null;
  holders: Holder[];
  price_usd?: number | null;
  market_cap_usd?: number | null;
  price_updated?: string | null;
  updated: string;
};

const App: React.FC = () => {
  const [token, setToken] = useState<TokenData>({
    mint: "",
    holders: [],
    updated: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/data/mgo.json");
        const data: TokenData = await res.json();
        setToken(data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3d] text-gray-200">
      <header className="text-center py-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
          MGO Token Scanner
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Live blockchain and market data
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2">
        <div className="card p-6 bg-gradient-to-b from-[#071127] to-[#021022] shadow-lg rounded-lg">
          {loading ? <div>Loading token info...</div> : <TokenInfoCard data={token} />}
        </div>

        <div className="card p-6 bg-gradient-to-b from-[#071127] to-[#021022] shadow-lg rounded-lg overflow-auto max-h-[600px]">
          {loading ? <div>Loading holders...</div> : <HoldersTable holders={token.holders} />}
        </div>
      </main>

      <footer className="mt-8 text-center text-gray-500">
        <Footer updated={token.updated} />
      </footer>
    </div>
  );
};

export default App;
