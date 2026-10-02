"use client";
import { useEffect, useState } from "react";
import Nav from "../Nav";
import { rupiah } from "@/lib/format";

type Kandang = { id: number; kode: string; ukuran: string; kapasitas: number; tarifPerMalam: number; aktif: boolean };
type Hari = { tanggal: string; kapasitas: number; terisi: number; sisa: number };

export default function KandangPage() {
  const [rows, setRows] = useState<Kandang[]>([]);
  const [form, setForm] = useState({ kode: "", ukuran: "S", kapasitas: "3", tarifPerMalam: "75000" });
  const [cek, setCek] = useState({ ukuran: "S", checkin: "", checkout: "" });
  const [hasil, setHasil] = useState<Hari[] | null>(null);
  const [err, setErr] = useState("");

  const muat = () => fetch("/api/kandang").then((r) => r.json()).then(setRows);
  useEffect(() => { muat(); }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/kandang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kode: form.kode,
        ukuran: form.ukuran,
        kapasitas: Number(form.kapasitas),
        tarifPerMalam: Number(form.tarifPerMalam),
      }),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setForm({ kode: "", ukuran: "S", kapasitas: "3", tarifPerMalam: "75000" });
    muat();
  };

  const cekKetersediaan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const q = new URLSearchParams(cek);
    const r = await fetch(`/api/kandang/ketersediaan?${q}`);
    const j = await r.json();
    if (!r.ok) { setErr(j.error); setHasil(null); return; }
    setHasil(j);
  };

  const input = "border rounded px-2 py-1.5 text-sm w-full";
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Kandang</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">Daftar Kandang</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b bg-slate-50">
                  <th className="p-2">Kode</th><th className="p-2">Ukuran</th>
                  <th className="p-2">Kapasitas</th><th className="p-2">Tarif/malam</th>
                </tr></thead>
                <tbody>
                  {rows.map((k) => (
                    <tr key={k.id} className="border-b last:border-0">
                      <td className="p-2 font-medium">{k.kode}</td>
                      <td className="p-2">{k.ukuran}</td>
                      <td className="p-2">{k.kapasitas} ekor</td>
                      <td className="p-2">{rupiah(k.tarifPerMalam)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="font-semibold mt-6 mb-3">Tambah Kandang</h2>
            <form onSubmit={simpan} className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3">
              <input className={input} placeholder="Kode (mis. KD-S3)" value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })} />
              <select className={input} value={form.ukuran}
                onChange={(e) => setForm({ ...form, ukuran: e.target.value })}>
                {["S", "M", "L"].map((u) => <option key={u}>{u}</option>)}
              </select>
              <input className={input} type="number" min={1} placeholder="Kapasitas" value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: e.target.value })} />
              <input className={input} type="number" min={0} placeholder="Tarif per malam" value={form.tarifPerMalam}
                onChange={(e) => setForm({ ...form, tarifPerMalam: e.target.value })} />
              <button className="col-span-2 bg-slate-900 text-white rounded px-3 py-2 text-sm">Simpan</button>
            </form>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Cek Ketersediaan per Tanggal</h2>
            <form onSubmit={cekKetersediaan} className="bg-white rounded-lg shadow p-4 grid grid-cols-3 gap-3 mb-4">
              <select className={input} value={cek.ukuran}
                onChange={(e) => setCek({ ...cek, ukuran: e.target.value })}>
                {["S", "M", "L"].map((u) => <option key={u}>{u}</option>)}
              </select>
              <input className={input} type="date" value={cek.checkin}
                onChange={(e) => setCek({ ...cek, checkin: e.target.value })} />
              <input className={input} type="date" value={cek.checkout}
                onChange={(e) => setCek({ ...cek, checkout: e.target.value })} />
              <button className="col-span-3 bg-blue-600 text-white rounded px-3 py-2 text-sm">Cek</button>
            </form>
            {hasil && (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left border-b bg-slate-50">
                    <th className="p-2">Tanggal</th><th className="p-2">Kapasitas</th>
                    <th className="p-2">Terisi</th><th className="p-2">Sisa</th>
                  </tr></thead>
                  <tbody>
                    {hasil.map((h) => (
                      <tr key={h.tanggal} className={`border-b last:border-0 ${h.sisa <= 0 ? "bg-red-50" : ""}`}>
                        <td className="p-2">{h.tanggal}</td>
                        <td className="p-2">{h.kapasitas}</td>
                        <td className="p-2">{h.terisi}</td>
                        <td className={`p-2 font-bold ${h.sisa <= 0 ? "text-red-600" : "text-green-600"}`}>{h.sisa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
