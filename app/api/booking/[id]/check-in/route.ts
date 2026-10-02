import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/format";

// Check-in: status dipesan -> check-in. WAJIB punya vaksin yang masih berlaku.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { hewan: { include: { vaksinasi: true } } },
  });
  if (!booking)
    return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  if (booking.status !== "dipesan")
    return NextResponse.json(
      { error: `check-in hanya dari status dipesan (sekarang: ${booking.status})` },
      { status: 422 }
    );
  const berlaku = booking.hewan.vaksinasi.some(
    (v) => v.tanggalKedaluwarsa >= today()
  );
  if (!berlaku)
    return NextResponse.json(
      {
        error: `check-in ditolak: ${booking.hewan.nama} tidak punya vaksin yang masih berlaku`,
      },
      { status: 422 }
    );
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "check-in" },
  });
  return NextResponse.json(updated);
}
