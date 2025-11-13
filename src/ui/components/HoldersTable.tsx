import React from "react";
import { Holder } from "../App";

interface Props {
  holders: Holder[];
  decimals: number;
  totalSupplyRaw: string;
}

const HoldersTable: React.FC<Props> = ({ holders, decimals, totalSupplyRaw }) => {
  const formatAmount = (raw: string) => (Number(raw) / 10 ** decimals).toLocaleString();

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
            <td>{h.owner}</td>
            <td>{formatAmount(h.rawAmount)}</td>
            <td>{formatPercent(h.rawAmount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HoldersTable;
