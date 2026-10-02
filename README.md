# Pet Hotel & Grooming

Aplikasi pet hotel dan grooming: booking kandang dengan validasi kapasitas
harian per ukuran, check-in dengan validasi vaksin wajib, pengingat vaksin
otomatis, laporan harian untuk pemilik (catatan makan + foto), dan paket
grooming sebagai add-on.

Stack: Next.js 14 + TypeScript + Prisma 5.22 + SQLite + Tailwind CSS.

## Cara Menjalankan

```bash
npm install --ignore-scripts
# salin engine prisma (workaround download gagal di VM ini)
cp ~/workspace/ts-convert/prisma-engines/* node_modules/@prisma/engines/
npx prisma generate
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000

## Halaman
- `/` — Dashboard (ringkasan + booking aktif)
- `/kandang` — Daftar kandang + cek ketersediaan per tanggal
- `/hewan` — Daftar hewan + kelola catatan vaksin
- `/booking` — Daftar & buat booking
- `/booking/[id]` — Detail, check-in/check-out/selesai/batal, laporan harian + upload foto
- `/pengingat` — Pengingat vaksin (scan otomatis + tandai terkirim)
- `/grooming` — Paket grooming

## Aturan penting
- Kapasitas dijaga **per ukuran per tanggal**: booking ditolak (409) jika ada
  tanggal dalam rentang yang sudah penuh.
- Check-in wajib punya vaksin yang masih berlaku, kalau tidak ditolak (422).
- Foto laporan: JPG/PNG/WebP maks 5 MB, tersimpan di `uploads/` (tidak ikut repo).
