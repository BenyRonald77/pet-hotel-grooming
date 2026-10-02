import Nav from "./Nav";
import { prisma } from "@/lib/prisma";
import { STATUS_AKTIF } from "@/lib/bisnis";
import { today } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [jmlKandang, jmlHewan, jmlBookingAktif, jmlPengingat, bookingAktif] =
    await Promise.all([
      prisma.kandang.count({ where: { aktif: true } }),
      prisma.hewan.count(),
      prisma.booking.count({ where: { status: { in: STATUS_AKTIF } } }),
      prisma.pengingatVaksin.count({ where: { terkirim: false } }),
      prisma.booking.findMany({
        where: { status: { in: STATUS_AKTIF } },
        include: { hewan: true, kandang: true },
        orderBy: { tanggalCheckin: "asc" },
        take: 10,
      }),
    ]);

  const cards = [
    { label: "Kandang aktif", value: jmlKandang, href: "/kandang" },
    { label: "Hewan terdaftar", value: jmlHewan, href: "/hewan" },
    { label: "Booking aktif", value: jmlBookingAktif, href: "/booking" },
    { label: "Pengingat belum terkirim", value: jmlPengingat, href: "/pengingat" },
  ];

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm mb-6">Hari ini: {today()}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md"
            >
              <div className="text-3xl font-bold">{c.value}</div>
              <div className="text-sm text-slate-500">{c.label}</div>
            </a>
          ))}
        </div>
        <h2 className="text-lg font-semibold mb-3">Booking aktif</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-slate-50">
                <th className="p-3">Kode</th>
                <th className="p-3">Hewan</th>
                <th className="p-3">Kandang</th>
                <th className="p-3">Check-in</th>
                <th className="p-3">Check-out</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingAktif.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-3">
                    <a href={`/booking/${b.id}`} className="text-blue-600 underline">
                      {b.kode}
                    </a>
                  </td>
                  <td className="p-3">
                    {b.hewan.nama} ({b.hewan.jenis})
                  </td>
                  <td className="p-3">{b.kandang.kode}</td>
                  <td className="p-3">{b.tanggalCheckin}</td>
                  <td className="p-3">{b.tanggalCheckout}</td>
                  <td className="p-3">{b.status}</td>
                </tr>
              ))}
              {bookingAktif.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    Tidak ada booking aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
