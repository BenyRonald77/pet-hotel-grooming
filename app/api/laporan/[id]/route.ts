import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NAFSU_MAKAN } from "@/lib/bisnis";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const row = await prisma.laporanHarian.findUnique({ where: { id } });
  if (!row)
    return NextResponse.json({ error: "laporan tidak ditemukan" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body JSON tidak valid" }, { status: 400 });
  const { porsiMakan, nafsuMakan, catatanUmum } = body;
  const data: { porsiMakan?: string; nafsuMakan?: string; catatanUmum?: string } = {};
  if (porsiMakan !== undefined) {
    if (!String(porsiMakan).trim())
      return NextResponse.json({ error: "porsiMakan tidak boleh kosong" }, { status: 400 });
    data.porsiMakan = String(porsiMakan).trim();
  }
  if (nafsuMakan !== undefined) {
    if (!(NAFSU_MAKAN as readonly string[]).includes(nafsuMakan))
      return NextResponse.json({ error: "nafsuMakan harus: lahap, sedang, kurang" }, { status: 400 });
    data.nafsuMakan = nafsuMakan;
  }
  if (catatanUmum !== undefined) data.catatanUmum = String(catatanUmum);
  const updated = await prisma.laporanHarian.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const row = await prisma.laporanHarian.findUnique({ where: { id } });
  if (!row)
    return NextResponse.json({ error: "laporan tidak ditemukan" }, { status: 404 });
  await prisma.laporanHarian.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
