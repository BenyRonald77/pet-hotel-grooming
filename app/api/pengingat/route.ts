import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validTanggal } from "@/lib/bisnis";
import { nowIso } from "@/lib/format";

export async function GET(req: NextRequest) {
  const terkirim = req.nextUrl.searchParams.get("terkirim");
  const rows = await prisma.pengingatVaksin.findMany({
    where: terkirim === "true" ? { terkirim: true } : terkirim === "false" ? { terkirim: false } : undefined,
    include: { hewan: true, vaksin: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { hewanId, vaksinId, tanggalKirim } = body;
  const hid = Number(hewanId);
  const vid = Number(vaksinId);
  if (!Number.isInteger(hid) || !Number.isInteger(vid))
    return NextResponse.json({ error: "hewanId/vaksinId tidak valid" }, { status: 400 });
  if (!validTanggal(tanggalKirim))
    return NextResponse.json({ error: "tanggalKirim harus format YYYY-MM-DD" }, { status: 400 });
  const vaksin = await prisma.vaksin.findUnique({ where: { id: vid } });
  if (!vaksin) return NextResponse.json({ error: "vaksin tidak ditemukan" }, { status: 404 });
  if (vaksin.hewanId !== hid)
    return NextResponse.json({ error: "vaksin bukan milik hewan tersebut" }, { status: 400 });
  try {
    const created = await prisma.pengingatVaksin.create({
      data: { hewanId: hid, vaksinId: vid, tanggalKirim, terkirim: false, dibuatPada: nowIso() },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint"))
      return NextResponse.json(
        { error: "pengingat untuk vaksin & tanggal kirim ini sudah ada" },
        { status: 409 }
      );
    throw e;
  }
}
