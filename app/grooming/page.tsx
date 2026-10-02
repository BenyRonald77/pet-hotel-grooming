"use client";
import { useEffect, useState } from "react";
import Nav from "../Nav";
import { rupiah } from "@/lib/format";

type Paket = { id: number; nama: string; deskripsi: string; harga: number; aktif: boolean };

export default function GroomingPage() {
  const [rows, setRows] = useState<Paket[]>([]);
  const [form, setForm] = useState({ nama: "", deskripsi: "", harga: "" });
  const [err, setErr] = useState("");

  const muat = () => fetch("/api/paket").then((r) => r.json()).then(setRows);
  useEffect(() => { muat(); }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/paket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, harga: Number(form.harga) }),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setForm({ nama: "", deskripsi: "", harga: "" });
    muat();
  };

  const input = "border rounded px-2 py-1.5 text-sm w-full";
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Paket Grooming</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}

        <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b bg-slate-50">
              <th className="p-2">Nama</th><th className="p-2">Deskripsi</th><th className="p-2">Harga</th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{p.nama}</td>
                  <td className="p-2">{p.deskripsi}</td>
                  <td className="p-2">{rupiah(p.harga)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-semibold mb-3">Tambah Paket</h2>
        <form onSubmit={simpan} className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className={input} placeholder="Nama paket" value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <input className={input} placeholder="Deskripsi" value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          <input className={input} type="number" min={0} placeholder="Harga" value={form.harga}
            onChange={(e) => setForm({ ...form, harga: e.target.value })} />
          <button className="bg-slate-900 text-white rounded px-3 py-2 text-sm">Simpan</button>
        </form>
      </main>
    </div>
  );
}
