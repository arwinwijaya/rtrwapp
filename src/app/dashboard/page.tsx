import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  Users, 
  Wallet, 
  Megaphone, 
  FileWarning,
  ArrowRight,
  Clock,
  MapPin,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role === "RT Admin" || profile?.role === "RW Admin";
  const residentId = profile?.resident_id;

  // Warga Data
  let resident: any = null;
  let ownIuran: any[] = [];
  let ownReports: any[] = [];
  
  if (residentId) {
    const { data: res } = await supabase.from("residents").select("*").eq("id", residentId).single();
    resident = res;
    
    const { data: iuran } = await supabase.from("iuran_payments").select("*, iuran_periods(title, amount)").eq("resident_id", residentId).order("created_at", { ascending: false }).limit(5);
    ownIuran = iuran || [];
    
    const { data: reports } = await supabase.from("reports").select("*").eq("resident_id", residentId).order("created_at", { ascending: false }).limit(5);
    ownReports = reports || [];
  }

  // Admin Data
  let wargaCount = 0;
  let verificationCount = 0;
  let openReportsCount = 0;
  let activeAgendasCount = 0;
  let gotongRoyongCount = 0;
  let kerjaBaktiCount = 0;
  let rondaCount = 0;
  
  if (isAdmin) {
    const today = new Date().toISOString().split("T")[0];
    const { count: wCount } = await supabase.from("residents").select("*", { count: "exact", head: true });
    wargaCount = wCount || 0;
    const { count: vCount } = await supabase.from("iuran_payments").select("*", { count: "exact", head: true }).eq("status", "Menunggu Verifikasi");
    verificationCount = vCount || 0;
    const { count: rCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "Open");
    openReportsCount = rCount || 0;
    const { count: aCount } = await supabase.from("agendas").select("*", { count: "exact", head: true }).gte("date", today);
    activeAgendasCount = aCount || 0;

    const { count: grCount } = await supabase.from("gotong_royong").select("*", { count: "exact", head: true }).eq("activity_type", "Gotong Royong").gte("date", today);
    gotongRoyongCount = grCount || 0;
    const { count: kbCount } = await supabase.from("gotong_royong").select("*", { count: "exact", head: true }).eq("activity_type", "Kerja Bakti").gte("date", today);
    kerjaBaktiCount = kbCount || 0;
    const { count: rdCount } = await supabase.from("gotong_royong").select("*", { count: "exact", head: true }).eq("activity_type", "Ronda").gte("date", today);
    rondaCount = rdCount || 0;
  }

  // Shared Data
  const { data: agendas } = await supabase.from("agendas").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).limit(3);
  const { data: activities } = await supabase.from("gotong_royong").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).limit(3);
  const { data: pengumuman } = await supabase.from("announcements").select("*").order("publish_date", { ascending: false }).limit(4);
  const { data: kontak } = await supabase.from("emergency_contacts").select("*").eq("is_active", true).order("display_order", { ascending: true }).limit(3);

  const displayName = profile?.name || user.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard {isAdmin ? "Admin" : "Warga"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Selamat datang kembali, {displayName}! Berikut ringkasan informasi {isAdmin ? "sistem" : "lingkungan Anda"}.
        </p>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex items-center h-full gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shrink-0"><Users size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Total Warga</p><p className="text-2xl font-bold text-slate-900">{wargaCount}</p></div>
            </CardContent>
          </Card>
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex items-center h-full gap-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0"><Wallet size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Verifikasi Iuran</p><p className="text-2xl font-bold text-slate-900">{verificationCount}</p></div>
            </CardContent>
          </Card>
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex items-center h-full gap-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600 shrink-0"><FileWarning size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Laporan Open</p><p className="text-2xl font-bold text-slate-900">{openReportsCount}</p></div>
            </CardContent>
          </Card>
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex items-center h-full gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 shrink-0"><Calendar size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Agenda Aktif</p><p className="text-2xl font-bold text-slate-900">{activeAgendasCount}</p></div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-sm font-medium text-slate-500 mb-1">Status Anda</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                  {resident?.status || "Aktif"}
                </Badge>
                <span className="text-sm font-bold text-slate-800">{resident?.block} / {resident?.house_number}</span>
              </div>
            </CardContent>
          </Card>
          <Link href="/iuran">
            <Card className="h-full border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center h-full gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 shrink-0"><Wallet size={24} /></div>
                <div><p className="text-sm font-medium text-slate-500">Status Iuran</p><p className="text-sm font-bold text-slate-900">Cek Tagihan</p></div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/laporan">
            <Card className="h-full border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center h-full gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0"><FileWarning size={24} /></div>
                <div><p className="text-sm font-medium text-slate-500">Laporan Anda</p><p className="text-sm font-bold text-slate-900">{ownReports.length} Laporan</p></div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/kontak">
            <Card className="h-full border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center h-full gap-4">
                <div className="p-3 rounded-xl bg-red-100 text-red-600 shrink-0"><ShieldAlert size={24} /></div>
                <div><p className="text-sm font-medium text-slate-500">Darurat</p><p className="text-sm font-bold text-slate-900">Kontak Penting</p></div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions for Warga */}
          {!isAdmin && (
             <section className="flex gap-4 overflow-x-auto pb-2">
                <Link href="/laporan" className="flex-1 min-w-[150px]">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 h-12">
                    <Plus className="w-4 h-4 mr-2" /> Buat Laporan
                  </Button>
                </Link>
                <Link href="/iuran" className="flex-1 min-w-[150px]">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                    <Wallet className="w-4 h-4 mr-2" /> Bayar Iuran
                  </Button>
                </Link>
             </section>
          )}

          {/* Latest Agenda */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Agenda Terdekat
              </h2>
              <Link href="/agenda" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {agendas && agendas.length > 0 ? agendas.map((agenda: any) => (
                <Card key={agenda.id} className="h-full hover:shadow-md transition-all flex flex-col border-none shadow-sm">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        {agenda.category}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{new Date(agenda.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{agenda.title}</h3>
                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <Clock size={14} className="text-slate-400" /> {agenda.time} WIB
                      </div>
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {agenda.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-100">Belum ada agenda terdekat.</div>
              )}
            </div>
          </section>

          {/* Activities (Gotong Royong / Kerja Bakti / Ronda) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Kegiatan Warga Terdekat
              </h2>
              <Link href="/agenda/gotong-royong" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {activities && activities.length > 0 ? activities.map((act: any) => (
                <Card key={act.id} className="h-full hover:shadow-md transition-all flex flex-col border-none shadow-sm">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                        {act.activity_type || 'Gotong Royong'}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{new Date(act.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{act.title}</h3>
                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <Clock size={14} className="text-slate-400" /> {act.time} WIB
                      </div>
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {act.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-100">Belum ada jadwal kegiatan terdekat.</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar area (1/3) */}
        <div className="space-y-8">
          
          {/* Admin Quick Links */}
          {isAdmin && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Manajemen
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/admin"><Button variant="outline" className="w-full justify-start text-sm">Overview Admin</Button></Link>
                <Link href="/admin?tab=warga"><Button variant="outline" className="w-full justify-start text-sm">Data Warga</Button></Link>
                <Link href="/admin?tab=iuran"><Button variant="outline" className="w-full justify-start text-sm">Iuran Warga</Button></Link>
                <Link href="/admin?tab=agenda"><Button variant="outline" className="w-full justify-start text-sm">Agenda & Rapat</Button></Link>
                <Link href="/admin?tab=gotong-royong"><Button variant="outline" className="w-full justify-start text-sm">Kegiatan Warga</Button></Link>
                <Link href="/admin?tab=pengumuman"><Button variant="outline" className="w-full justify-start text-sm">Pengumuman</Button></Link>
              </div>
            </section>
          )}

          {/* Announcements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" /> Pengumuman
              </h2>
            </div>
            <div className="space-y-3">
              {pengumuman && pengumuman.map((item: any) => (
                <div key={item.id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</h4>
                    {item.priority === "Penting" && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-1 shrink-0"></div>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.content}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">{item.publish_date ? new Date(item.publish_date).toLocaleDateString('id-ID') : ''}</span>
                </div>
              ))}
              <Link href="/pengumuman" className="block text-center p-2 text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider">
                Lihat Semua Pengumuman
              </Link>
            </div>
          </section>

          {/* Quick Emergency */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Kontak Darurat
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {kontak && kontak.map((contact: any) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-red-900">{contact.name}</p>
                    <p className="text-xs text-red-700">{contact.role}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200">{contact.phone}</span>
                </a>
              ))}
              <Link href="/kontak" className="block text-center p-2 text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider">
                Semua Kontak Penting
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
