import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ketersediaanPerHari, validasiRentang } from "@/lib/kapasitas";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const err = validasiRentang(q.get("ukuran"), q.get("checkin"), q.get("checkout"));
  if (err) return NextResponse.json({ error: err.error }, { status: err.status });
  const rows = await ketersediaanPerHari(
    prisma,
    q.get("ukuran") as string,
    q.get("checkin") as string,
    q.get("checkout") as string
  );
  return NextResponse.json(rows);
}
