"use client";
import { useEffect, useState } from "react";
import Nav from "../Nav";
import { rupiah } from "@/lib/format";

type Row = {
  id: number; kode: string; tanggalCheckin: string; tanggalCheckout: string;
  grooming: boolean; status: string; total: number;
  hewan: { nama: string }; kandang: { kode: string };
  paketGrooming: { nama: string } | null;
};

export default function BookingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [hewan, setHewan] = useState<{ id: number; nama: string; ukuran: string }[]>([]);
  const [kandang, setKandang] = useState<{ id: number; kode: string; ukuran: string }[]>([]);
  const [paket, setPaket] = useState<{ id: number; nama: string; harga: number }[]>([]);
  const [form, setForm] = useState({
    hewanId: "", kandangId: "", tanggalCheckin: "", tanggalCheckout: "",
    grooming: false, paketGroomingId: "", catatan: "",
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const muat = () => {
    fetch("/api/booking").then((r) => r.json()).then(setRows);
    fetch("/api/hewan").then((r) => r.json()).then(setHewan);
    fetch("/api/kandang").then((r) => r.json()).then(setKandang);
    fetch("/api/paket").then((r) => r.json()).then(setPaket);
  };
  useEffect(() => { muat(); }, []);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setOk("");
    const r = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hewanId: Number(form.hewanId),
        kandangId: Number(form.kandangId),
        tanggalCheckin: form.tanggalCheckin,
        tanggalCheckout: form.tanggalCheckout,
        grooming: form.grooming,
        paketGroomingId: form.paketGroomingId ? Number(form.paketGroomingId) : null,
        catatan: form.catatan,
      }),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setOk(`Booking ${j.kode} tersimpan — total ${rupiah(j.total)}.`);
    setForm({ hewanId: "", kandangId: "", tanggalCheckin: "", tanggalCheckout: "", grooming: false, paketGroomingId: "", catatan: "" });
    muat();
  };

  const input = "border rounded px-2 py-1.5 text-sm w-full";
  const statusWarna = (s: string) =>
    s === "dibatalkan" ? "text-red-600" : s === "selesai" ? "text-slate-400" : "text-green-700";
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Booking</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}
        {ok && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{ok}</div>}

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <h2 className="font-semibold mb-3">Daftar Booking</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b bg-slate-50">
                  <th className="p-2">Kode</th><th className="p-2">Hewan</th><th className="p-2">Kandang</th>
                  <th className="p-2">Check-in</th><th className="p-2">Check-out</th>
                  <th className="p-2">Grooming</th><th className="p-2">Total</th><th className="p-2">Status</th>
                </tr></thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="p-2"><a href={`/booking/${b.id}`} className="text-blue-600 underline font-medium">{b.kode}</a></td>
                      <td className="p-2">{b.hewan.nama}</td>
                      <td className="p-2">{b.kandang.kode}</td>
                      <td className="p-2">{b.tanggalCheckin}</td>
                      <td className="p-2">{b.tanggalCheckout}</td>
                      <td className="p-2">{b.grooming ? `Ya${b.paketGrooming ? ` (${b.paketGrooming.nama})` : ""}` : "Tidak"}</td>
                      <td className="p-2">{rupiah(b.total)}</td>
                      <td className={`p-2 font-medium ${statusWarna(b.status)}`}>{b.status}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={8} className="p-4 text-center text-slate-400">Belum ada booking.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="font-semibold mb-3">Buat Booking</h2>
            <form onSubmit={simpan} className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3">
              <select className={input} value={form.hewanId}
                onChange={(e) => setForm({ ...form, hewanId: e.target.value })}>
                <option value="">— Pilih hewan —</option>
                {hewan.map((h) => <option key={h.id} value={h.id}>{h.nama} ({h.ukuran})</option>)}
              </select>
              <select className={input} value={form.kandangId}
                onChange={(e) => setForm({ ...form, kandangId: e.target.value })}>
                <option value="">— Pilih kandang —</option>
                {kandang.filter((k) => k.aktif !== false).map((k) => <option key={k.id} value={k.id}>{k.kode} ({k.ukuran})</option>)}
              </select>
              <input className={input} type="date" value={form.tanggalCheckin}
                onChange={(e) => setForm({ ...form, tanggalCheckin: e.target.value })} />
              <input className={input} type="date" value={form.tanggalCheckout}
                onChange={(e) => setForm({ ...form, tanggalCheckout: e.target.value })} />
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input type="checkbox" checked={form.grooming}
                  onChange={(e) => setForm({ ...form, grooming: e.target.checked })} />
                Tambah layanan grooming
              </label>
              {form.grooming && (
                <select className={`${input} col-span-2`} value={form.paketGroomingId}
                  onChange={(e) => setForm({ ...form, paketGroomingId: e.target.value })}>
                  <option value="">— Pilih paket (opsional) —</option>
                  {paket.map((p) => <option key={p.id} value={p.id}>{p.nama} — {rupiah(p.harga)}</option>)}
                </select>
              )}
              <input className={`${input} col-span-2`} placeholder="Catatan (opsional)" value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
              <button className="col-span-2 bg-slate-900 text-white rounded px-3 py-2 text-sm">Buat Booking</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
