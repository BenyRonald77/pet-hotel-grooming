"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/kandang", label: "Kandang" },
  { href: "/hewan", label: "Hewan & Vaksin" },
  { href: "/booking", label: "Booking" },
  { href: "/pengingat", label: "Pengingat Vaksin" },
  { href: "/grooming", label: "Paket Grooming" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-1">
        <span className="font-bold text-lg mr-4">🐾 Pet Hotel &amp; Grooming</span>
        {ITEMS.map((it) => {
          const active =
            it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-1.5 rounded text-sm ${
                active ? "bg-slate-700" : "hover:bg-slate-800"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
