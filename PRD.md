# PRD — Pet Hotel & Grooming

## Ringkasan
Aplikasi web untuk mengelola pet hotel dan grooming: master kandang & hewan,
booking kandang dengan validasi kapasitas harian per ukuran, check-in dengan
validasi vaksin wajib, pengingat vaksin otomatis, laporan harian untuk pemilik
(hewan + foto), dan paket grooming sebagai add-on booking.

## Stack
Next.js 14 (App Router) + TypeScript + Prisma 5.22 + SQLite + Tailwind CSS.
Tanggal disimpan sebagai TEXT `YYYY-MM-DD`, timestamp sebagai TEXT ISO.

## Model Data
- **Kandang**: kode (unik), ukuran (S/M/L), kapasitas (jumlah hewan), tarif per
  malam, aktif. Kapasitas dijaga **per ukuran per tanggal**: total kapasitas
  seluruh kandang berukuran X vs jumlah booking aktif ukuran X pada tiap tanggal.
- **Hewan**: nama, jenis, ukuran (S/M/L), nama pemilik, kontak pemilik.
- **Vaksin**: hewan, jenis vaksin, tanggal vaksin, tanggal kedaluwarsa.
- **PaketGrooming**: nama, deskripsi, harga, aktif.
- **Booking**: kode unik (`PH-YYYYMMDD-###`), hewan, kandang, tanggal check-in
  (inklusif) s/d check-out (eksklusif), grooming ya/tidak + paket, status
  (`dipesan → check-in → check-out → selesai`, bisa `dibatalkan`), total.
- **PengingatVaksin**: hewan, vaksin, tanggal kirim, terkirim (boolean).
- **LaporanHarian**: booking, tanggal, porsi makan, nafsu makan
  (lahap/sedang/kurang), catatan umum, foto (upload file).

## Aturan Bisnis
1. **Kapasitas per hari**: booking baru ditolak `409` jika pada salah satu
   tanggal dalam rentang check-in → check-out jumlah booking aktif (status
   `dipesan`/`check-in`) untuk ukuran itu sudah mencapai total kapasitas.
   Pengecekan overlap dilakukan per hari.
2. **Ukuran cocok**: ukuran hewan harus sama dengan ukuran kandang (`400`).
3. **Vaksin wajib saat check-in**: hewan harus punya minimal satu vaksin dengan
   `tanggalKedaluwarsa >= hari ini`; jika tidak → `422` tolak check-in.
4. **Total harga**: malam menginap × tarif kandang + harga paket grooming
   (jika add-on grooming dipilih).
5. **Alur status**: `dipesan → check-in → check-out → selesai`;
   `dibatalkan` hanya dari `dipesan`/`check-in`. Transisi ilegal → `422`.
6. **Pengingat vaksin**: endpoint scan (`POST /api/pengingat/scan?days=X`)
   mencari vaksin dengan tanggal kedaluwarsa dalam rentang
   [hari ini, hari ini+X] dan membuat entri pengingat (sekali per vaksin per
   tanggal kirim, unik). Entri bisa ditandai terkirim.
7. **Laporan harian**: satu laporan per booking per tanggal (unik); foto opsional
   (JPG/PNG/WebP, maks 5 MB, validasi tipe & ukuran).
8. **Konkurensi**: operasi bersaing (booking vs kapasitas) dijalankan dalam
   transaksi; overlap dihitung ulang di dalam transaksi sebelum insert.

## API
| Method & Path | Deskripsi |
|---|---|
| GET/POST `/api/kandang` | List & tambah kandang |
| GET `/api/kandang/ketersediaan?ukuran=&checkin=&checkout=` | Sisa kapasitas per hari |
| GET/POST `/api/hewan` | List & tambah hewan |
| GET `/api/hewan/[id]` | Detail hewan + vaksin |
| POST `/api/hewan/[id]/vaksin` | Tambah catatan vaksin |
| GET/POST `/api/paket` | List & tambah paket grooming |
| GET/POST `/api/booking` | List (filter status) & buat booking (409 kapasitas) |
| GET `/api/booking/[id]` | Detail booking + laporan harian |
| POST `/api/booking/[id]/check-in` | Check-in, validasi vaksin (422) |
| POST `/api/booking/[id]/check-out` | Check-out |
| POST `/api/booking/[id]/selesai` | Tandai selesai |
| POST `/api/booking/[id]/batal` | Batalkan booking |
| GET/POST `/api/pengingat` | List & tambah manual |
| POST `/api/pengingat/scan?days=` | Generate pengingat vaksin |
| POST `/api/pengingat/[id]/terkirim` | Tandai terkirim |
| GET/POST `/api/booking/[id]/laporan` | List & tambah laporan (multipart + foto) |
| GET `/api/foto/[nama]` | Sajikan file foto |

## Halaman UI (Bahasa Indonesia)
- `/` Dashboard: ringkasan + booking aktif.
- `/kandang` Daftar kandang, form tambah, cek ketersediaan per tanggal.
- `/hewan` Daftar hewan, form tambah, kelola vaksin per hewan.
- `/booking` Daftar booking, form booking baru (dengan validasi kapasitas).
- `/booking/[id]` Detail, tombol alur status, laporan harian + upload foto.
- `/pengingat` Daftar pengingat, tombol scan, tandai terkirim.
- `/grooming` Daftar & tambah paket grooming.

## Seed
6 kandang (S/M/L), 4 hewan (satu — Goliath — dengan vaksin kedaluwarsa untuk
uji tolak check-in), vaksin (satu akan kedaluwarsa dalam 10 hari untuk uji
pengingat), 3 paket grooming, 2 booking contoh, 1 pengingat contoh.
