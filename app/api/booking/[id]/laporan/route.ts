import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validTanggal, NAFSU_MAKAN } from "@/lib/bisnis";
import { nowIso } from "@/lib/format";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const rows = await prisma.laporanHarian.findMany({
    where: { bookingId: id },
    orderBy: { tanggal: "asc" },
  });
  return NextResponse.json(rows);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bookingId = Number(params.id);
  if (!Number.isInteger(bookingId))
    return NextResponse.json({ error: "id tidak valid" }, { status: 400 });
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking)
    return NextResponse.json({ error: "booking tidak ditemukan" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "body harus multipart/form-data" }, { status: 400 });
  }

  const tanggal = String(form.get("tanggal") ?? "");
  const porsiMakan = String(form.get("porsiMakan") ?? "");
  const nafsuMakan = String(form.get("nafsuMakan") ?? "");
  const catatanUmum = String(form.get("catatanUmum") ?? "");

  if (!validTanggal(tanggal))
    return NextResponse.json({ error: "tanggal harus format YYYY-MM-DD" }, { status: 400 });
  if (!porsiMakan.trim())
    return NextResponse.json({ error: "porsiMakan wajib diisi" }, { status: 400 });
  if (!(NAFSU_MAKAN as readonly string[]).includes(nafsuMakan))
    return NextResponse.json(
      { error: "nafsuMakan harus salah satu dari: lahap, sedang, kurang" },
      { status: 400 }
    );

  // Foto opsional: validasi tipe & ukuran.
  let fotoNamaAsli: string | null = null;
  let fotoNamaSimpan: string | null = null;
  const file = form.get("foto");
  if (file && typeof file !== "string" && file.size > 0) {
    const f = file as File;
    const ext = ALLOWED[f.type];
    if (!ext)
      return NextResponse.json(
        { error: "tipe foto tidak didukung (hanya JPG, PNG, WebP)" },
        { status: 400 }
      );
    if (f.size > MAX_BYTES)
      return NextResponse.json(
        { error: `ukuran foto melebihi 5 MB (${(f.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 413 }
      );
    const dir = join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    fotoNamaSimpan = randomUUID() + "." + ext;
    await writeFile(join(dir, fotoNamaSimpan), Buffer.from(await f.arrayBuffer()));
    fotoNamaAsli = f.name || "foto";
  }

  try {
    const created = await prisma.laporanHarian.create({
      data: {
        bookingId,
        tanggal,
        porsiMakan: porsiMakan.trim(),
        nafsuMakan,
        catatanUmum,
        fotoNamaAsli,
        fotoNamaSimpan,
        dibuatPada: nowIso(),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint"))
      return NextResponse.json(
        { error: `laporan tanggal ${tanggal} untuk booking ini sudah ada` },
        { status: 409 }
      );
    throw e;
  }
}
