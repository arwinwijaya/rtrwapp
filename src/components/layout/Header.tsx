"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Home, 
  CalendarDays, 
  Users, 
  Wallet, 
  Megaphone, 
  FileWarning, 
  Phone,
  Settings,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Gotong Royong", href: "/gotong-royong", icon: Users },
  { name: "Iuran Warga", href: "/iuran", icon: Wallet },
  { name: "Pengumuman", href: "/pengumuman", icon: Megaphone },
  { name: "Laporan", href: "/laporan", icon: FileWarning },
  { name: "Kontak", href: "/kontak", icon: Phone },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndProfile = async (session: any) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserAndProfile(session);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await fetchUserAndProfile(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  const isAdmin = profile?.role === "RT Admin" || profile?.role === "RW Admin";
  const isWarga = profile?.role === "Warga";
  const displayName = profile?.name || user?.email?.split('@')[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">RT RW App</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!loading && (
              <div className="hidden sm:flex items-center gap-3">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin">
                        <Button variant="ghost" size="sm" className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100">
                          <Settings className="w-4 h-4 mr-2" /> Admin
                        </Button>
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                      <div className="flex flex-col items-end leading-tight max-w-[120px] md:max-w-[200px]">
                        <span className="text-sm font-bold text-slate-800 truncate w-full text-right">{displayName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isAdmin ? 'Admin' : 'Warga'}</span>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {displayName.charAt(0)}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Keluar"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <Link href="/login">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 px-6">
                      <LogIn className="w-4 h-4 mr-2" /> Masuk
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-slate-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 text-base font-medium rounded-md",
                  isActive
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
          {!loading && (
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              {!user ? (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-600">Masuk Warga</Button>
                </Link>
              ) : (
                <>
                  <Link href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-slate-600">
                    <User className="w-5 h-5 text-slate-400" /> Profil Saya
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-medium text-slate-600">
                      <Settings className="w-5 h-5 text-slate-400" /> Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 text-base font-medium text-red-600"
                  >
                    <LogOut className="w-5 h-5" /> Keluar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
