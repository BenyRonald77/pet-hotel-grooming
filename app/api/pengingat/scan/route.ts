import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tambahHari } from "@/lib/bisnis";
import { today, nowIso } from "@/lib/format";

// Scan vaksin yang kedaluwarsa dalam X hari ke depan, buat entri pengingat.
// Idempoten per hari: unik (vaksinId, tanggalKirim).
export async function POST(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "14");
  if (!Number.isInteger(days) || days < 0 || days > 365)
    return NextResponse.json({ error: "parameter days harus 0-365" }, { status: 400 });

  const dari = today();
  const sampai = tambahHari(dari, days);

  const vaksin = await prisma.vaksin.findMany({
    where: { tanggalKedaluwarsa: { gte: dari, lte: sampai } },
    include: { hewan: true },
  });

  const dibuat: unknown[] = [];
  const dilewati: unknown[] = [];
  for (const v of vaksin) {
    try {
      const row = await prisma.pengingatVaksin.create({
        data: {
          hewanId: v.hewanId,
          vaksinId: v.id,
          tanggalKirim: dari,
          terkirim: false,
          dibuatPada: nowIso(),
        },
      });
      dibuat.push(row);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Unique constraint")) {
        dilewati.push({ vaksinId: v.id, alasan: "pengingat hari ini sudah ada" });
        continue;
      }
      throw e;
    }
  }

  return NextResponse.json({
    rentang: { dari, sampai },
    vaksinDipindai: vaksin.length,
    pengingatDibuat: dibuat.length,
    dilewati: dilewati.length,
    dibuat,
  });
}
