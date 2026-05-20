"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Calendar, 
  Megaphone, 
  FileWarning, 
  Phone, 
  Building2,
  LogOut,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "warga", label: "Data Warga", icon: Users },
  { id: "iuran", label: "Iuran", icon: Wallet },
  { id: "agenda", label: "Agenda & Kegiatan", icon: Calendar },
  { id: "pengumuman", label: "Pengumuman", icon: Megaphone },
  { id: "laporan", label: "Laporan", icon: FileWarning },
  { id: "kontak", label: "Kontak Darurat", icon: Phone },
  { id: "profil", label: "Profil RT/RW", icon: Building2 },
];

export default function AdminSidebar({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string;
  onSectionChange: (id: any) => void;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-none">RT RW App</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Console</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-4">
        {navigation.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsMobileOpen(false);
              }}
              className={clsx(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={clsx("transition-colors", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </div>
              {isActive && <ChevronRight size={14} className="text-emerald-400" />}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 shrink-0">
            {profile?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800 truncate">{profile?.name || "Admin"}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{profile?.role || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 active:scale-95 transition-transform"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[50]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={clsx(
        "lg:hidden fixed inset-y-0 left-0 w-72 z-[55] transition-transform duration-300 transform",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
