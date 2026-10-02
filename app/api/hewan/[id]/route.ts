import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const row = await prisma.hewan.findUnique({
    where: { id },
    include: {
      vaksinasi: { orderBy: { tanggalKedaluwarsa: "desc" } },
      bookings: { orderBy: { id: "desc" }, take: 10, include: { kandang: true } },
    },
  });
  if (!row) return NextResponse.json({ error: "hewan tidak ditemukan" }, { status: 404 });
  const vaksinBerlaku = row.vaksinasi.some((v) => v.tanggalKedaluwarsa >= today());
  return NextResponse.json({ ...row, vaksinBerlaku });
}
