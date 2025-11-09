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


<div className="grid
