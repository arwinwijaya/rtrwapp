"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarDays, 
  Users, 
  Wallet, 
  Megaphone, 
  FileWarning, 
  Building,
  Phone,
  Settings,
  X,
  ShieldCheck
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Agenda & Kegiatan", href: "/agenda", icon: CalendarDays },
  { name: "Gotong Royong", href: "/gotong-royong", icon: Users },
  { name: "Iuran Warga", href: "/iuran", icon: Wallet },
  { name: "Pengumuman", href: "/pengumuman", icon: Megaphone },
  { name: "Data Warga", href: "/warga", icon: Users },
  { name: "Laporan Warga", href: "/laporan", icon: FileWarning },
  { name: "Profil Perumahan", href: "/profil", icon: Building },
  { name: "Kontak Darurat", href: "/kontak", icon: Phone },
  { name: "Admin Panel", href: "/admin", icon: Settings },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="text-lg font-bold text-slate-800">RT RW App</span>
        </Link>
        <button
          type="button"
          className="md:hidden text-slate-500 hover:text-slate-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={clsx(
                isActive
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                "group flex items-center rounded-md px-3 py-2 text-sm transition-colors"
              )}
            >
              <item.icon
                className={clsx(
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500",
                  "mr-3 h-5 w-5 shrink-0"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer / User Profile area */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Admin RT 01</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
