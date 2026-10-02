"use client";
import { useEffect, useState } from "react";
import Nav from "../Nav";

type Row = {
  id: number; tanggalKirim: string; terkirim: boolean;
  hewan: { nama: string; namaPemilik: string; kontakPemilik: string };
  vaksin: { jenisVaksin: string; tanggalKedaluwarsa: string };
};

export default function PengingatPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [days, setDays] = useState("14");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const muat = () => fetch("/api/pengingat").then((r) => r.json()).then(setRows);
  useEffect(() => { muat(); }, []);

  const scan = async () => {
    setErr(""); setOk("");
    const r = await fetch(`/api/pengingat/scan?days=${encodeURIComponent(days)}`, { method: "POST" });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setOk(`Scan selesai: ${j.vaksinDipindai} vaksin dipindai, ${j.pengingatDibuat} pengingat dibuat, ${j.dilewati} dilewati.`);
    muat();
  };

  const tandai = async (id: number) => {
    setErr(""); setOk("");
    const r = await fetch(`/api/pengingat/${id}/terkirim`, { method: "POST" });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setOk(`Pengingat untuk ${j.hewan.nama} ditandai terkirim.`);
    muat();
  };

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Pengingat Vaksin</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}
        {ok && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{ok}</div>}

        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-slate-500 block mb-1">Pindai vaksin kedaluwarsa dalam X hari ke depan</label>
            <input type="number" min={0} max={365} value={days}
              onChange={(e) => setDays(e.target.value)}
              className="border rounded px-2 py-1.5 text-sm w-32" />
          </div>
          <button onClick={scan} className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
            Jalankan Scan
          </button>
          <p className="text-xs text-slate-400 w-full">Scan membuat satu entri pengingat per vaksin per hari (idempoten).</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b bg-slate-50">
              <th className="p-2">Hewan</th><th className="p-2">Pemilik</th>
              <th className="p-2">Vaksin</th><th className="p-2">Kedaluwarsa</th>
              <th className="p-2">Tgl Kirim</th><th className="p-2">Status</th><th className="p-2"></th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{p.hewan.nama}</td>
                  <td className="p-2">{p.hewan.namaPemilik}</td>
                  <td className="p-2">{p.vaksin.jenisVaksin}</td>
                  <td className="p-2">{p.vaksin.tanggalKedaluwarsa}</td>
                  <td className="p-2">{p.tanggalKirim}</td>
                  <td className="p-2">{p.terkirim ? <span className="text-green-600">terkirim</span> : <span className="text-orange-600">belum</span>}</td>
                  <td className="p-2">
                    {!p.terkirim && (
                      <button onClick={() => tandai(p.id)} className="text-blue-600 underline text-sm">
                        tandai terkirim
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-slate-400">Belum ada pengingat.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
