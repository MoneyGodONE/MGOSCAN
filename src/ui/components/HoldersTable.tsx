import React from "react";
import { Holder } from "../App";

type Props = { holders: Holder[] };

const HoldersTable: React.FC<Props> = ({ holders }) => (
  <table className="w-full text-left border-collapse">
    <thead>
      <tr>
        <th>Account</th>
        <th>Owner</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {holders.map((h, idx) => (
        <tr key={idx}>
          <td>{h.tokenAccount}</td>
          <td>{h.owner || "N/A"}</td>
          <td>{h.amount}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default HoldersTable;
