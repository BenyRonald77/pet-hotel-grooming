"use client";
import { useEffect, useState } from "react";
import Nav from "../../Nav";

type Vaksin = { id: number; jenisVaksin: string; tanggalVaksin: string; tanggalKedaluwarsa: string };
type Detail = {
  id: number; nama: string; jenis: string; ukuran: string;
  namaPemilik: string; kontakPemilik: string;
  vaksinasi: Vaksin[]; vaksinBerlaku: boolean;
};

export default function HewanDetail({ params }: { params: { id: string } }) {
  const [d, setD] = useState<Detail | null>(null);
  const [form, setForm] = useState({ jenisVaksin: "", tanggalVaksin: "", tanggalKedaluwarsa: "" });
  const [err, setErr] = useState("");

  const muat = () => fetch(`/api/hewan/${params.id}`).then((r) => r.json()).then(setD);
  useEffect(() => { muat(); }, [params.id]);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch(`/api/hewan/${params.id}/vaksin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setForm({ jenisVaksin: "", tanggalVaksin: "", tanggalKedaluwarsa: "" });
    muat();
  };

  const input = "border rounded px-2 py-1.5 text-sm w-full";
  if (!d) return <div><Nav /><main className="mx-auto max-w-4xl px-4 py-6">Memuat...</main></div>;

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <a href="/hewan" className="text-blue-600 text-sm underline">← Kembali</a>
        <h1 className="text-2xl font-bold mt-2 mb-1">{d.nama} <span className="text-slate-400 text-lg">({d.jenis}, ukuran {d.ukuran})</span></h1>
        <p className="text-sm text-slate-500 mb-4">Pemilik: {d.namaPemilik} — {d.kontakPemilik}</p>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}
        <div className={`p-3 rounded mb-6 text-sm ${d.vaksinBerlaku ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
          {d.vaksinBerlaku ? "✓ Punya vaksin yang masih berlaku — boleh check-in." : "✕ Tidak ada vaksin yang masih berlaku — check-in akan ditolak."}
        </div>

        <h2 className="font-semibold mb-3">Catatan Vaksin</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b bg-slate-50">
              <th className="p-2">Jenis</th><th className="p-2">Tgl Vaksin</th><th className="p-2">Kedaluwarsa</th><th className="p-2">Status</th>
            </tr></thead>
            <tbody>
              {d.vaksinasi.map((v) => {
                const berlaku = v.tanggalKedaluwarsa >= new Date().toISOString().slice(0, 10);
                return (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="p-2">{v.jenisVaksin}</td>
                    <td className="p-2">{v.tanggalVaksin}</td>
                    <td className="p-2">{v.tanggalKedaluwarsa}</td>
                    <td className="p-2">{berlaku ? <span className="text-green-600">berlaku</span> : <span className="text-red-600">kedaluwarsa</span>}</td>
                  </tr>
                );
              })}
              {d.vaksinasi.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">Belum ada catatan vaksin.</td></tr>}
            </tbody>
          </table>
        </div>

        <h2 className="font-semibold mb-3">Tambah Catatan Vaksin</h2>
        <form onSubmit={simpan} className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className={input} placeholder="Jenis vaksin" value={form.jenisVaksin}
            onChange={(e) => setForm({ ...form, jenisVaksin: e.target.value })} />
          <input className={input} type="date" value={form.tanggalVaksin}
            onChange={(e) => setForm({ ...form, tanggalVaksin: e.target.value })} />
          <input className={input} type="date" value={form.tanggalKedaluwarsa}
            onChange={(e) => setForm({ ...form, tanggalKedaluwarsa: e.target.value })} />
          <button className="bg-slate-900 text-white rounded px-3 py-2 text-sm">Simpan</button>
        </form>
      </main>
    </div>
  );
}
