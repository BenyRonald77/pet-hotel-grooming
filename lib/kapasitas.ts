import type { PrismaClient } from "@prisma/client";
import { STATUS_AKTIF, rentangTanggal, isUkuran, validTanggal } from "@/lib/bisnis";

type Db = Pick<PrismaClient, "kandang" | "booking">;

// Sisa kapasitas per hari untuk satu ukuran kandang dalam rentang [checkin, checkout).
export async function ketersediaanPerHari(
  db: Db,
  ukuran: string,
  checkin: string,
  checkout: string
) {
  const kandang = await db.kandang.findMany({
    where: { ukuran, aktif: true },
    select: { kapasitas: true },
  });
  const total = kandang.reduce((s, k) => s + k.kapasitas, 0);
  const bookings = await db.booking.findMany({
    where: {
      status: { in: STATUS_AKTIF },
      tanggalCheckin: { lt: checkout },
      tanggalCheckout: { gt: checkin },
      kandang: { ukuran },
    },
    select: { tanggalCheckin: true, tanggalCheckout: true },
  });
  return rentangTanggal(checkin, checkout).map((t) => {
    const terisi = bookings.filter(
      (b) => b.tanggalCheckin <= t && b.tanggalCheckout > t
    ).length;
    return { tanggal: t, kapasitas: total, terisi, sisa: total - terisi };
  });
}

export function validasiRentang(ukuran: unknown, checkin: unknown, checkout: unknown) {
  if (!isUkuran(ukuran))
    return { error: "ukuran harus salah satu dari S, M, L", status: 400 };
  if (!validTanggal(checkin) || !validTanggal(checkout))
    return { error: "checkin/checkout harus format YYYY-MM-DD", status: 400 };
  if (checkout <= checkin)
    return { error: "tanggal checkout harus setelah checkin", status: 400 };
  return null;
}
