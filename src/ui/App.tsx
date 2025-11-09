import React, { useEffect, useState } from 'react'
import TokenInfoCard from './components/TokenInfoCard'
import HoldersTable from './components/HoldersTable'


type Holder = { tokenAccount: string; owner: string | null; amount: string; rawAmount: string }
type TokenData = any


export default function App(){
const [data, setData] = useState<TokenData | null>(null)
const [loading, setLoading] = useState(true)


async function load(){
setLoading(true)
try{
const res = await fetch('/data/mgo.json')
const j = await res.json()
setData(j)
}catch(e){
console.error(e)
setData(null)
}finally{ setLoading(false) }
}


useEffect(()=>{ load() }, [])


return (
<div className="min-h-screen p-6">
<div className="max-w-5xl mx-auto">
<div className="card p-6 mb-6 bg-gradient-to-b from-[#071127] to-[#021022]">
<h1 className="text-2xl font-extrabold">MGOSCAN — Money God One (MGO)</h1>
<p className="text-sm text-[#9fb7d1] mt-2">Auto-updated token data from repo (data/mgo.json)</p>
</div>


<div className="gridreturn (
  <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3d] text-gray-200">
    <header className="text-center py-8">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
        MGO Token Scanner
      </h1>
      <p className="text-sm text-gray-400 mt-2">Live blockchain and market data</p>
    </header>

    <main className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2">
      <TokenInfoCard token={token} />
      <HoldersTable holders={token.holders} />
    </main>

    <Footer />
  </div>
);

  export default App;
