export default {
  async fetch(req) {
    const body = await req.text();
    const res = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    const data = await res.text();
    return new Response(data, {
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
    });
  }
};
