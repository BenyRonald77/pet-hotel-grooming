// Seed: data contoh. Hanya jalan jika tabel Kandang masih kosong.
import { PrismaClient } from "@prisma/client";
import { kodeBooking, selisihMalam } from "../lib/bisnis";

const prisma = new PrismaClient();

function tgl(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const nowIso = () => new Date().toISOString();

async function main() {
  const n = await prisma.kandang.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  // --- Kandang: 6 unit (2 per ukuran) ---
  const kandangData = [
    { kode: "KD-S1", ukuran: "S", kapasitas: 3, tarifPerMalam: 75000 },
    { kode: "KD-S2", ukuran: "S", kapasitas: 3, tarifPerMalam: 75000 },
    { kode: "KD-M1", ukuran: "M", kapasitas: 3, tarifPerMalam: 120000 },
    { kode: "KD-M2", ukuran: "M", kapasitas: 3, tarifPerMalam: 120000 },
    { kode: "KD-L1", ukuran: "L", kapasitas: 2, tarifPerMalam: 180000 },
    { kode: "KD-L2", ukuran: "L", kapasitas: 2, tarifPerMalam: 180000 },
  ];
  const kandang: Record<string, { id: number; tarifPerMalam: number }> = {};
  for (const k of kandangData) {
    const row = await prisma.kandang.create({ data: k });
    kandang[k.kode] = row;
  }

  // --- Hewan: 4 ekor ---
  const hewanData = [
    { nama: "Milo", jenis: "Kucing", ukuran: "S", namaPemilik: "Budi Santoso", kontakPemilik: "0812-3456-7890" },
    { nama: "Bono", jenis: "Anjing", ukuran: "M", namaPemilik: "Sari Wulandari", kontakPemilik: "0813-9876-5432" },
    { nama: "Kimi", jenis: "Kucing", ukuran: "S", namaPemilik: "Dewi Anggraini", kontakPemilik: "0821-1111-2222" },
    { nama: "Goliath", jenis: "Anjing", ukuran: "L", namaPemilik: "Agus Pratama", kontakPemilik: "0856-3333-4444" },
  ];
  const hewan: Record<string, { id: number }> = {};
  for (const h of hewanData) {
    const row = await prisma.hewan.create({ data: h });
    hewan[h.nama] = row;
  }

  // --- Vaksin ---
  // Milo: berlaku (+60 hari). Bono: berlaku tapi kedaluwarsa dalam 10 hari (untuk uji pengingat).
  // Kimi: berlaku (+160). Goliath: SUDAH kedaluwarsa (-30 hari, untuk uji tolak check-in).
  const vaksinData = [
    { hewan: "Milo", jenisVaksin: "Rabies", tanggalVaksin: tgl(-300), tanggalKedaluwarsa: tgl(60) },
    { hewan: "Bono", jenisVaksin: "DHPPi", tanggalVaksin: tgl(-350), tanggalKedaluwarsa: tgl(10) },
    { hewan: "Kimi", jenisVaksin: "F3", tanggalVaksin: tgl(-200), tanggalKedaluwarsa: tgl(160) },
    { hewan: "Goliath", jenisVaksin: "Rabies", tanggalVaksin: tgl(-400), tanggalKedaluwarsa: tgl(-30) },
  ];
  const vaksin: Record<string, { id: number }> = {};
  for (const v of vaksinData) {
    const row = await prisma.vaksin.create({
      data: {
        hewanId: hewan[v.hewan].id,
        jenisVaksin: v.jenisVaksin,
        tanggalVaksin: v.tanggalVaksin,
        tanggalKedaluwarsa: v.tanggalKedaluwarsa,
      },
    });
    vaksin[v.hewan] = row;
  }

  // --- Paket grooming ---
  const paketData = [
    { nama: "Grooming Basic", deskripsi: "Mandi + blow + potong kuku", harga: 80000 },
    { nama: "Grooming Full", deskripsi: "Mandi + blow + cukur + potong kuku + parfum", harga: 150000 },
    { nama: "Grooming Premium", deskripsi: "Full + spa + pijat + styling", harga: 250000 },
  ];
  const paket: Record<string, { id: number; harga: number }> = {};
  for (const p of paketData) {
    const row = await prisma.paketGrooming.create({ data: p });
    paket[p.nama] = row;
  }

  // --- Booking contoh ---
  const b1 = {
    kode: kodeBooking(tgl(0), 1),
    hewanId: hewan["Milo"].id,
    kandangId: kandang["KD-S1"].id,
    tanggalCheckin: tgl(1),
    tanggalCheckout: tgl(4),
    grooming: false,
    paketGroomingId: null,
    status: "dipesan",
    total: selisihMalam(tgl(1), tgl(4)) * kandang["KD-S1"].tarifPerMalam,
    catatan: "Milo takut suara keras",
    dibuatPada: nowIso(),
  };
  const b2Checkin = tgl(2);
  const b2Checkout = tgl(5);
  const b2 = {
    kode: kodeBooking(tgl(0), 2),
    hewanId: hewan["Bono"].id,
    kandangId: kandang["KD-M1"].id,
    tanggalCheckin: b2Checkin,
    tanggalCheckout: b2Checkout,
    grooming: true,
    paketGroomingId: paket["Grooming Basic"].id,
    status: "dipesan",
    total:
      selisihMalam(b2Checkin, b2Checkout) * kandang["KD-M1"].tarifPerMalam +
      paket["Grooming Basic"].harga,
    catatan: "",
    dibuatPada: nowIso(),
  };
  await prisma.booking.create({ data: b1 });
  await prisma.booking.create({ data: b2 });

  // --- Pengingat contoh: vaksin Goliath sudah kedaluwarsa, pengingat sudah terkirim ---
  await prisma.pengingatVaksin.create({
    data: {
      hewanId: hewan["Goliath"].id,
      vaksinId: vaksin["Goliath"].id,
      tanggalKirim: tgl(-1),
      terkirim: true,
      dibuatPada: nowIso(),
    },
  });

  console.log(`seed selesai: ${kandangData.length} kandang, ${hewanData.length} hewan, vaksin, paket, 2 booking, 1 pengingat`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
