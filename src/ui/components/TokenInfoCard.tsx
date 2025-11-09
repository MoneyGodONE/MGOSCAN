import React from "react";
import { TokenData } from "../App";

type Props = {
  data: TokenData;
};

const TokenInfoCard: React.FC<Props> = ({ data }) => (
  <div>
    <h2 className="text-xl font-bold">{data.name || "MGO"}</h2>
    <p>Symbol: {data.symbol}</p>
    <p>Total Supply: {data.totalSupply}</p>
    <p>Price USD: {data.price_usd}</p>
  </div>
);

export default TokenInfoCard;
