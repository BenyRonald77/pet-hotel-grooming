import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validTanggal } from "@/lib/bisnis";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const hewan = await prisma.hewan.findUnique({ where: { id } });
  if (!hewan)
    return NextResponse.json({ error: "hewan tidak ditemukan" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { jenisVaksin, tanggalVaksin, tanggalKedaluwarsa } = body;
  if (!jenisVaksin || typeof jenisVaksin !== "string" || !jenisVaksin.trim())
    return NextResponse.json({ error: "jenisVaksin wajib diisi" }, { status: 400 });
  if (!validTanggal(tanggalVaksin) || !validTanggal(tanggalKedaluwarsa))
    return NextResponse.json(
      { error: "tanggalVaksin/tanggalKedaluwarsa harus format YYYY-MM-DD" },
      { status: 400 }
    );
  if (tanggalKedaluwarsa < tanggalVaksin)
    return NextResponse.json(
      { error: "tanggal kedaluwarsa tidak boleh sebelum tanggal vaksin" },
      { status: 400 }
    );
  const created = await prisma.vaksin.create({
    data: {
      hewanId: id,
      jenisVaksin: jenisVaksin.trim(),
      tanggalVaksin,
      tanggalKedaluwarsa,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
