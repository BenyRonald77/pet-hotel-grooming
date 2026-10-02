"use client";
import { useEffect, useState } from "react";
import Nav from "../Nav";

type Hewan = {
  id: number; nama: string; jenis: string; ukuran: string;
  namaPemilik: string; kontakPemilik: string; _count: { vaksinasi: number };
};

export default function HewanPage() {
  const [rows, setRows] = useState<Hewan[]>([]);
  const [form, setForm] = useState({ nama: "", jenis: "", ukuran: "S", namaPemilik: "", kontakPemilik: "" });
  const [err, setErr] = useState("");

  const muat = () => fetch("/api/hewan").then((r) => r.json()).then(setRows);
  useEffect(() => { muat(); }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/hewan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setForm({ nama: "", jenis: "", ukuran: "S", namaPemilik: "", kontakPemilik: "" });
    muat();
  };

  const input = "border rounded px-2 py-1.5 text-sm w-full";
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Hewan &amp; Vaksin</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}

        <h2 className="font-semibold mb-3">Daftar Hewan</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b bg-slate-50">
              <th className="p-2">Nama</th><th className="p-2">Jenis</th><th className="p-2">Ukuran</th>
              <th className="p-2">Pemilik</th><th className="p-2">Kontak</th><th className="p-2">Vaksin</th>
            </tr></thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="p-2"><a href={`/hewan/${h.id}`} className="text-blue-600 underline font-medium">{h.nama}</a></td>
                  <td className="p-2">{h.jenis}</td>
                  <td className="p-2">{h.ukuran}</td>
                  <td className="p-2">{h.namaPemilik}</td>
                  <td className="p-2">{h.kontakPemilik}</td>
                  <td className="p-2">{h._count.vaksinasi} catatan</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-semibold mb-3">Tambah Hewan</h2>
        <form onSubmit={simpan} className="bg-white rounded-lg shadow p-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl">
          <input className={input} placeholder="Nama hewan" value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <input className={input} placeholder="Jenis (Kucing/Anjing)" value={form.jenis}
            onChange={(e) => setForm({ ...form, jenis: e.target.value })} />
          <select className={input} value={form.ukuran}
            onChange={(e) => setForm({ ...form, ukuran: e.target.value })}>
            {["S", "M", "L"].map((u) => <option key={u}>{u}</option>)}
          </select>
          <input className={input} placeholder="Nama pemilik" value={form.namaPemilik}
            onChange={(e) => setForm({ ...form, namaPemilik: e.target.value })} />
          <input className={input} placeholder="Kontak pemilik" value={form.kontakPemilik}
            onChange={(e) => setForm({ ...form, kontakPemilik: e.target.value })} />
          <button className="bg-slate-900 text-white rounded px-3 py-2 text-sm">Simpan</button>
        </form>
      </main>
    </div>
  );
}
