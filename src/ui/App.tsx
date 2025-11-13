import React, { useEffect, useState } from "react";
import TokenInfoCard from "./components/TokenInfoCard";
import HoldersTable from "./components/HoldersTable";
import Footer from "./components/Footer";
import type { TokenData } from "../types"; // <- correct import

const AppUI: React.FC = () => {
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
          <HoldersTable
            holders={token.holders}
            decimals={token.decimals ?? 0}
            totalSupplyRaw={token.totalSupplyRaw ?? "0"}
          />
          <Footer updated={token.updated} />
        </>
      ) : (
        <p>Loading token data...</p>
      )}
    </div>
  );
};

export default AppUI;
