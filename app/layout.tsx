import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Hotel & Grooming",
  description: "Aplikasi pet hotel dan grooming: booking kandang, validasi vaksin, pengingat vaksin, laporan harian.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">{children}</body>
    </html>
  );
}
