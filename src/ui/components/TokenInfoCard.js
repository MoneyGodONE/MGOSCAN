import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const TokenInfoCard = ({ data }) => (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: data.name || "MGO" }), _jsxs("p", { children: ["Symbol: ", data.symbol] }), _jsxs("p", { children: ["Total Supply: ", data.totalSupply] }), _jsxs("p", { children: ["Price USD: ", data.price_usd ?? "N/A"] }), _jsxs("p", { children: ["Market Cap: ", data.market_cap_usd ?? "N/A"] })] }));
export default TokenInfoCard;
