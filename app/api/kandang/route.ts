import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUkuran } from "@/lib/bisnis";

export async function GET() {
  const rows = await prisma.kandang.findMany({ orderBy: { kode: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { kode, ukuran, kapasitas, tarifPerMalam } = body;
  if (!kode || typeof kode !== "string")
    return NextResponse.json({ error: "kode wajib diisi" }, { status: 400 });
  if (!isUkuran(ukuran))
    return NextResponse.json({ error: "ukuran harus salah satu dari S, M, L" }, { status: 400 });
  const kap = Number(kapasitas);
  const tarif = Number(tarifPerMalam);
  if (!Number.isInteger(kap) || kap <= 0)
    return NextResponse.json({ error: "kapasitas harus bilangan bulat > 0" }, { status: 400 });
  if (!Number.isInteger(tarif) || tarif < 0)
    return NextResponse.json({ error: "tarifPerMalam harus bilangan bulat >= 0" }, { status: 400 });
  const ada = await prisma.kandang.findUnique({ where: { kode } });
  if (ada)
    return NextResponse.json({ error: `kode kandang ${kode} sudah dipakai` }, { status: 409 });
  const created = await prisma.kandang.create({
    data: { kode, ukuran, kapasitas: kap, tarifPerMalam: tarif },
  });
  return NextResponse.json(created, { status: 201 });
}
