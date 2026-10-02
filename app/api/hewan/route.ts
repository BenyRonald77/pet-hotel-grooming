import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUkuran } from "@/lib/bisnis";

export async function GET() {
  const rows = await prisma.hewan.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { vaksinasi: true } } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { nama, jenis, ukuran, namaPemilik, kontakPemilik } = body;
  for (const [k, v] of Object.entries({ nama, jenis, namaPemilik, kontakPemilik })) {
    if (!v || typeof v !== "string" || !v.trim())
      return NextResponse.json({ error: `${k} wajib diisi` }, { status: 400 });
  }
  if (!isUkuran(ukuran))
    return NextResponse.json({ error: "ukuran harus salah satu dari S, M, L" }, { status: 400 });
  const created = await prisma.hewan.create({
    data: {
      nama: nama.trim(),
      jenis: jenis.trim(),
      ukuran,
      namaPemilik: namaPemilik.trim(),
      kontakPemilik: kontakPemilik.trim(),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
