import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.paketGrooming.findMany({ orderBy: { harga: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { nama, deskripsi, harga } = body;
  if (!nama || typeof nama !== "string" || !nama.trim())
    return NextResponse.json({ error: "nama wajib diisi" }, { status: 400 });
  const h = Number(harga);
  if (!Number.isInteger(h) || h < 0)
    return NextResponse.json({ error: "harga harus bilangan bulat >= 0" }, { status: 400 });
  const ada = await prisma.paketGrooming.findUnique({ where: { nama: nama.trim() } });
  if (ada)
    return NextResponse.json({ error: `paket ${nama} sudah ada` }, { status: 409 });
  const created = await prisma.paketGrooming.create({
    data: { nama: nama.trim(), deskripsi: String(deskripsi ?? ""), harga: h },
  });
  return NextResponse.json(created, { status: 201 });
}
