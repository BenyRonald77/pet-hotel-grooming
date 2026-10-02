import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: { nama: string } }
) {
  // Cegah path traversal: hanya nama file aman.
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/.test(params.nama))
    return NextResponse.json({ error: "nama file tidak valid" }, { status: 400 });
  try {
    const buf = await readFile(join(process.cwd(), "uploads", params.nama));
    const ext = params.nama.split(".").pop() as string;
    return new NextResponse(buf, {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    return NextResponse.json({ error: "file tidak ditemukan" }, { status: 404 });
  }
}
