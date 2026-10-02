// Logika bisnis inti: tanggal, kapasitas kandang per ukuran per hari, status booking.

export const UKURAN = ["S", "M", "L"] as const;
export type Ukuran = (typeof UKURAN)[number];

// Status booking yang masih menempati kapasitas kandang.
export const STATUS_AKTIF = ["dipesan", "check-in"];

export function isUkuran(v: unknown): v is Ukuran {
  return typeof v === "string" && (UKURAN as readonly string[]).includes(v);
}

function parseUTC(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function validTanggal(s: unknown): s is string {
  if (typeof s !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseUTC(s);
  return !isNaN(d.getTime());
}

export function tambahHari(tanggal: string, n: number): string {
  const d = parseUTC(tanggal);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Jumlah malam menginap = selisih hari check-in → check-out.
export function selisihMalam(checkin: string, checkout: string): number {
  return Math.round(
    (parseUTC(checkout).getTime() - parseUTC(checkin).getTime()) / 86400000
  );
}

// Daftar tanggal yang ditempati: [checkin, checkout) — check-out di hari
// terakhir TIDAK menempati malam itu lagi.
export function rentangTanggal(checkin: string, checkout: string): string[] {
  const out: string[] = [];
  let cur = checkin;
  while (cur < checkout) {
    out.push(cur);
    cur = tambahHari(cur, 1);
  }
  return out;
}

export function kodeBooking(tanggal: string, n: number): string {
  return `PH-${tanggal.replace(/-/g, "")}-${String(n).padStart(3, "0")}`;
}
