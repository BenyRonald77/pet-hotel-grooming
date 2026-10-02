import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const row = await prisma.pengingatVaksin.findUnique({ where: { id } });
  if (!row)
    return NextResponse.json({ error: "pengingat tidak ditemukan" }, { status: 404 });
  const updated = await prisma.pengingatVaksin.update({
    where: { id },
    data: { terkirim: true },
    include: { hewan: true, vaksin: true },
  });
  return NextResponse.json(updated);
}
