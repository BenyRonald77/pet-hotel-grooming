"use client";
import { useEffect, useState } from "react";
import Nav from "../../Nav";
import { rupiah } from "@/lib/format";

type Booking = {
  id: number; kode: string; tanggalCheckin: string; tanggalCheckout: string;
  grooming: boolean; status: string; total: number; catatan: string;
  hewan: { id: number; nama: string; jenis: string; ukuran: string; namaPemilik: string; kontakPemilik: string };
  kandang: { kode: string; ukuran: string; tarifPerMalam: number };
  paketGrooming: { nama: string; harga: number } | null;
};

type Laporan = {
  id: number; tanggal: string; porsiMakan: string; nafsuMakan: string;
  catatanUmum: string; fotoNamaAsli: string | null; fotoNamaSimpan: string | null;
};

const AKSI: Record<string, { label: string; path: string; warna: string }[]> = {
  "dipesan": [
    { label: "Check-in", path: "check-in", warna: "bg-green-600" },
    { label: "Batalkan", path: "batal", warna: "bg-red-600" },
  ],
  "check-in": [
    { label: "Check-out", path: "check-out", warna: "bg-blue-600" },
    { label: "Batalkan", path: "batal", warna: "bg-red-600" },
  ],
  "check-out": [
    { label: "Tandai Selesai", path: "selesai", warna: "bg-slate-900" },
  ],
};

export default function BookingDetail({ params }: { params: { id: string } }) {
  const [b, setB] = useState<Booking | null>(null);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [f, setF] = useState({ tanggal: "", porsiMakan: "", nafsuMakan: "lahap", catatanUmum: "", foto: null as File | null });

  const muat = () => {
    fetch(`/api/booking/${params.id}`).then((r) => r.json()).then(setB);
    fetch(`/api/booking/${params.id}/laporan`).then((r) => r.json()).then(setLaporan);
  };
  useEffect(() => { muat(); }, [params.id]);

  const aksi = async (path: string) => {
    setErr(""); setOk("");
    const r = await fetch(`/api/booking/${params.id}/${path}`, { method: "POST" });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setOk(`Berhasil: status sekarang "${j.status}".`);
    muat();
  };

  const simpanLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setOk("");
    const fd = new FormData();
    fd.append("tanggal", f.tanggal);
    fd.append("porsiMakan", f.porsiMakan);
    fd.append("nafsuMakan", f.nafsuMakan);
    fd.append("catatanUmum", f.catatanUmum);
    if (f.foto) fd.append("foto", f.foto);
    const r = await fetch(`/api/booking/${params.id}/laporan`, { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return; }
    setOk(`Laporan tanggal ${j.tanggal} tersimpan.`);
    setF({ tanggal: "", porsiMakan: "", nafsuMakan: "lahap", catatanUmum: "", foto: null });
    muat();
  };

  if (!b) return <div><Nav /><main className="mx-auto max-w-4xl px-4 py-6">Memuat...</main></div>;

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <a href="/booking" className="text-blue-600 text-sm underline">← Kembali ke Booking</a>
        <h1 className="text-2xl font-bold mt-2 mb-4">Booking {b.kode}</h1>
        {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{err}</div>}
        {ok && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{ok}</div>}

        <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-slate-500">Hewan:</span> <a className="text-blue-600 underline" href={`/hewan/${b.hewan.id}`}>{b.hewan.nama}</a> ({b.hewan.jenis}, {b.hewan.ukuran})</div>
          <div><span className="text-slate-500">Pemilik:</span> {b.hewan.namaPemilik} — {b.hewan.kontakPemilik}</div>
          <div><span className="text-slate-500">Kandang:</span> {b.kandang.kode} ({rupiah(b.kandang.tarifPerMalam)}/malam)</div>
          <div><span className="text-slate-500">Tanggal:</span> {b.tanggalCheckin} s/d {b.tanggalCheckout}</div>
          <div><span className="text-slate-500">Grooming:</span> {b.grooming ? `Ya${b.paketGrooming ? ` — ${b.paketGrooming.nama} (${rupiah(b.paketGrooming.harga)})` : ""}` : "Tidak"}</div>
          <div><span className="text-slate-500">Total:</span> <b>{rupiah(b.total)}</b></div>
          <div><span className="text-slate-500">Status:</span> <b>{b.status}</b></div>
          {b.catatan && <div className="col-span-2"><span className="text-slate-500">Catatan:</span> {b.catatan}</div>}
        </div>

        {(AKSI[b.status] ?? []).length > 0 && (
          <div className="flex gap-2 mb-6">
            {(AKSI[b.status] ?? []).map((a) => (
              <button key={a.path} onClick={() => aksi(a.path)}
                className={`${a.warna} text-white rounded px-4 py-2 text-sm`}>
                {a.label}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">Laporan Harian</h2>
        <div className="space-y-3 mb-6">
          {laporan.map((l) => (
            <div key={l.id} className="bg-white rounded-lg shadow p-4 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2">
                <b>{l.tanggal}</b>
                <span>Porsi: {l.porsiMakan}</span>
                <span>Nafsu makan: {l.nafsuMakan}</span>
              </div>
              {l.catatanUmum && <p className="text-slate-600 mb-2">{l.catatanUmum}</p>}
              {l.fotoNamaSimpan && (
                <a href={`/api/foto/${l.fotoNamaSimpan}`} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/foto/${l.fotoNamaSimpan}`} alt={l.fotoNamaAsli ?? "foto"}
                    className="max-w-xs rounded border" />
                </a>
              )}
            </div>
          ))}
          {laporan.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada laporan harian.</p>
          )}
        </div>

        <h2 className="font-semibold mb-3">Tambah Laporan Harian</h2>
        <form onSubmit={simpanLaporan} className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-3 max-w-2xl">
          <input type="date" className="border rounded px-2 py-1.5 text-sm w-full" value={f.tanggal}
            onChange={(e) => setF({ ...f, tanggal: e.target.value })} />
          <input className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Porsi makan (mis. 2x sehari, 100g)"
            value={f.porsiMakan} onChange={(e) => setF({ ...f, porsiMakan: e.target.value })} />
          <select className="border rounded px-2 py-1.5 text-sm w-full" value={f.nafsuMakan}
            onChange={(e) => setF({ ...f, nafsuMakan: e.target.value })}>
            {["lahap", "sedang", "kurang"].map((n) => <option key={n}>{n}</option>)}
          </select>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            className="border rounded px-2 py-1.5 text-sm w-full"
            onChange={(e) => setF({ ...f, foto: e.target.files?.[0] ?? null })} />
          <input className="border rounded px-2 py-1.5 text-sm w-full col-span-2" placeholder="Catatan umum (opsional)"
            value={f.catatanUmum} onChange={(e) => setF({ ...f, catatanUmum: e.target.value })} />
          <button className="col-span-2 bg-slate-900 text-white rounded px-3 py-2 text-sm">Simpan Laporan</button>
        </form>
      </main>
    </div>
  );
}
