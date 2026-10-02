import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pindah status booking dengan validasi alur. Mengembalikan NextResponse.
export async function transisiBooking(
  id: number,
  dari: string[],
  ke: string,
  aksi: string
) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking)
    return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });
  if (!dari.includes(booking.status))
    return NextResponse.json(
      {
        error: `${aksi} hanya dari status ${dari.join("/")} (sekarang: ${booking.status})`,
      },
      { status: 422 }
    );
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: ke },
  });
  return NextResponse.json(updated);
}

export function idTidakValid() {
  return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
}
