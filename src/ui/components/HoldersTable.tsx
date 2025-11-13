import React from "react";
import type { Holder } from "../../types";

type Props = { holders: Holder[]; decimals: number; totalSupplyRaw: string };

const HoldersTable: React.FC<Props> = ({ holders }) => (
  <table className="w-full border-collapse text-left">
    <thead>
      <tr>
        <th>Token Account</th>
        <th>Owner</th>
        <th>Amount</th>
        <th>% of Total</th>
      </tr>
    </thead>
    <tbody>
      {holders.map((h, idx) => (
        <tr key={idx}>
          <td>{h.tokenAccount}</td>
          <td>{h.owner || "N/A"}</td>
          <td>{h.amount}</td>
          <td>{h.percent}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default HoldersTable;
