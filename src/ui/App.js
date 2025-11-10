import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import TokenInfoCard from "./components/TokenInfoCard";
import HoldersTable from "./components/HoldersTable";
import Footer from "./components/Footer";
const App = () => {
    const [token, setToken] = useState({
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
                const data = await res.json();
                setToken(data);
            }
            catch (err) {
                console.error("Failed to fetch data:", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3d] text-gray-200", children: [_jsxs("header", { className: "text-center py-8", children: [_jsx("h1", { className: "text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600", children: "MGO Token Scanner" }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Live blockchain and market data" })] }), _jsxs("main", { className: "max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2", children: [_jsx("div", { className: "card p-6 bg-gradient-to-b from-[#071127] to-[#021022] shadow-lg rounded-lg", children: loading ? _jsx("div", { children: "Loading token info..." }) : _jsx(TokenInfoCard, { data: token }) }), _jsx("div", { className: "card p-6 bg-gradient-to-b from-[#071127] to-[#021022] shadow-lg rounded-lg overflow-auto max-h-[600px]", children: loading ? _jsx("div", { children: "Loading holders..." }) : _jsx(HoldersTable, { holders: token.holders }) })] }), _jsx("footer", { className: "mt-8 text-center text-gray-500", children: _jsx(Footer, { updated: token.updated }) })] }));
};
export default App;
