import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const row = await prisma.booking.findUnique({
    where: { id },
    include: {
      hewan: true,
      kandang: true,
      paketGrooming: true,
      laporan: { orderBy: { tanggal: "asc" } },
    },
  });
  if (!row)
    return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  return NextResponse.json(row);
}
