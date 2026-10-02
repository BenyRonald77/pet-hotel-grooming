import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  kodeBooking,
  selisihMalam,
  validTanggal,
} from "@/lib/bisnis";
import { ketersediaanPerHari } from "@/lib/kapasitas";
import { nowIso } from "@/lib/format";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const rows = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    include: { hewan: true, kandang: true, paketGrooming: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const {
    hewanId,
    kandangId,
    tanggalCheckin,
    tanggalCheckout,
    grooming,
    paketGroomingId,
    catatan,
  } = body;

  const hid = Number(hewanId);
  const kid = Number(kandangId);
  if (!Number.isInteger(hid) || !Number.isInteger(kid))
    return NextResponse.json({ error: "hewanId/kandangId tidak valid" }, { status: 400 });
  if (!validTanggal(tanggalCheckin) || !validTanggal(tanggalCheckout))
    return NextResponse.json(
      { error: "tanggalCheckin/tanggalCheckout harus format YYYY-MM-DD" },
      { status: 400 }
    );
  if (tanggalCheckout <= tanggalCheckin)
    return NextResponse.json(
      { error: "tanggal checkout harus setelah checkin" },
      { status: 400 }
    );

  try {
    const created = await prisma.$transaction(async (tx) => {
      const hewan = await tx.hewan.findUnique({ where: { id: hid } });
      if (!hewan) throw { status: 404, error: "hewan tidak ditemukan" };
      const kandang = await tx.kandang.findUnique({ where: { id: kid } });
      if (!kandang) throw { status: 404, error: "kandang tidak ditemukan" };
      if (!kandang.aktif) throw { status: 400, error: "kandang tidak aktif" };
      if (hewan.ukuran !== kandang.ukuran)
        throw {
          status: 400,
          error: `ukuran tidak cocok: hewan ${hewan.ukuran}, kandang ${kandang.ukuran}`,
        };

      let paket: { id: number; harga: number } | null = null;
      const mauGrooming = grooming === true;
      if (mauGrooming && paketGroomingId != null) {
        paket = await tx.paketGrooming.findUnique({
          where: { id: Number(paketGroomingId) },
        });
        if (!paket) throw { status: 404, error: "paket grooming tidak ditemukan" };
      }

      // Validasi kapasitas PER HARI untuk ukuran kandang ini.
      const perHari = await ketersediaanPerHari(
        tx,
        kandang.ukuran,
        tanggalCheckin,
        tanggalCheckout
      );
      const penuh = perHari.find((h) => h.sisa <= 0);
      if (penuh)
        throw {
          status: 409,
          error: `kandang ukuran ${kandang.ukuran} penuh pada ${penuh.tanggal} (kapasitas ${penuh.kapasitas}, terisi ${penuh.terisi})`,
          tanggal: penuh.tanggal,
        };

      const malam = selisihMalam(tanggalCheckin, tanggalCheckout);
      const total = malam * kandang.tarifPerMalam + (paket ? paket.harga : 0);

      // Kode unik: hitung ulang dengan retry bila tabrakan.
      for (let i = 0; i < 5; i++) {
        const n = await tx.booking.count();
        const kode = kodeBooking(tanggalCheckin, n + 1 + i);
        try {
          return await tx.booking.create({
            data: {
              kode,
              hewanId: hid,
              kandangId: kid,
              tanggalCheckin,
              tanggalCheckout,
              grooming: mauGrooming,
              paketGroomingId: paket ? paket.id : null,
              status: "dipesan",
              total,
              catatan: String(catatan ?? ""),
              dibuatPada: nowIso(),
            },
          });
        } catch (e: unknown) {
          if (e instanceof Error && e.message.includes("Unique constraint")) continue;
          throw e;
        }
      }
      throw { status: 500, error: "gagal membuat kode booking unik" };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "status" in e) {
      const t = e as { status: number; error: string; tanggal?: string };
      return NextResponse.json(
        { error: t.error, ...(t.tanggal ? { tanggal: t.tanggal } : {}) },
        { status: t.status }
      );
    }
    throw e;
  }
}
