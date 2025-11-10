import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const HoldersTable = ({ holders }) => (_jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Account" }), _jsx("th", { children: "Owner" }), _jsx("th", { children: "Amount" })] }) }), _jsx("tbody", { children: holders.map((h, idx) => (_jsxs("tr", { children: [_jsx("td", { children: h.tokenAccount }), _jsx("td", { children: h.owner || "N/A" }), _jsx("td", { children: h.amount })] }, idx))) })] }));
export default HoldersTable;
