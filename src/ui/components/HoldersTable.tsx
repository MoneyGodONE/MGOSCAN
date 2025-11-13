import React from "react";
import type { Holder } from "../types";

interface Props {
  holders: Holder[];
  decimals: number;
  totalSupplyRaw: string;
}

const HoldersTable: React.FC<Props> = ({ holders, decimals, totalSupplyRaw }) => {
  const formatPercent = (raw: string) =>
    totalSupplyRaw ? ((Number(raw) / Number(totalSupplyRaw)) * 100).toFixed(2) + "%" : "0%";

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th>Account</th>
          <th>Owner</th>
          <th>Amount</th>
          <th>Percent</th>
        </tr>
      </thead>
      <tbody>
        {holders.map((h, idx) => (
          <tr key={idx}>
            <td>{h.tokenAccount}</td>
            <td>{h.owner ?? "N/A"}</td>
            <td>{h.amount}</td>
            <td>{formatPercent(h.rawAmount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HoldersTable;
