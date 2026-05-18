"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";
import { 
  Users, 
  Calendar, 
  Wallet, 
  Megaphone, 
  FileWarning, 
  Phone, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  XCircle, 
  Sparkles,
  LayoutDashboard,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  Check,
  X,
  Hammer,
  ShieldAlert
} from "lucide-react";
import { 
  createResident, 
  deleteData, 
  createIuranPeriod, 
  createAgenda, 
  createAnnouncement, 
  createEmergencyContact,
  createActivity,
  updateReportStatus,
  updateHousingProfile,
  verifyPayment,
  rejectPayment,
  updatePaymentStatus
} from "./actions";

type AdminTab = "overview" | "warga" | "iuran" | "agenda" | "gotong-royong" | "pengumuman" | "laporan" | "kontak" | "profil";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const normalizeMonth = (m: string | number | undefined | null): string => {
  if (!m) return "";
  if (typeof m === 'number') return MONTHS[m - 1] || "";
  
  const monthMap: { [key: string]: string } = {
    'january': 'Januari', 'januari': 'Januari', 'jan': 'Januari', '1': 'Januari', '01': 'Januari',
    'february': 'Februari', 'februari': 'Februari', 'feb': 'Februari', '2': 'Februari', '02': 'Februari',
    'march': 'Maret', 'maret': 'Maret', 'mar': 'Maret', '3': 'Maret', '03': 'Maret',
    'april': 'April', 'apr': 'April', '4': 'April', '04': 'April',
    'may': 'Mei', 'mei': 'Mei', '5': 'Mei', '05': 'Mei',
    'june': 'Juni', 'juni': 'Juni', 'jun': 'Juni', '6': 'Juni', '06': 'Juni',
    'july': 'Juli', 'juli': 'Juli', 'jul': 'Juli', '7': 'Juli', '07': 'Juli',
    'august': 'Agustus', 'agustus': 'Agustus', 'aug': 'Agustus', '8': 'Agustus', '08': 'Agustus',
    'september': 'September', 'sep': 'September', '9': 'September', '09': 'September',
    'october': 'Oktober', 'oktober': 'Oktober', 'oct': 'Oktober', '10': 'Oktober',
    'november': 'November', 'nov': 'November', '11': 'November',
    'december': 'Desember', 'desember': 'Desember', 'dec': 'Desember', '12': 'Desember'
  };
  
  const normalized = monthMap[m.toLowerCase().trim()];
  return normalized || m.toString();
};

interface AdminClientProps {
  initialTab?: string;
  warga: any[];
  iuranTypes: any[];
  iuranPeriods: any[];
  iuranPayments: any[];
  agendas: any[];
  gotongRoyong: any[];
  pengumuman: any[];
  laporan: any[];
  kontak: any[];
  profil: any;
}

export default function AdminClient({
  initialTab = "overview",
  warga,
  iuranTypes,
  iuranPeriods,
  iuranPayments,
  agendas,
  gotongRoyong,
  pengumuman,
  laporan,
  kontak,
  profil
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab as AdminTab);  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  // Iuran Matrix States
  const [activeIuranType, setActiveIuranType] = useState<string>(iuranTypes[0]?.id || "");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedCell, setSelectedCell] = useState<{residentId: string, month: string, year: number} | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const getPayment = (residentId: string, month: string, year: number) => {
    return iuranPayments.find(p => 
      p.resident_id === residentId && 
      normalizeMonth(p.iuran_periods?.month) === normalizeMonth(month) && 
      p.iuran_periods?.year === year &&
      p.iuran_periods?.iuran_type_id === activeIuranType
    );
  };

  const getPeriod = (month: string, year: number) => {
    return iuranPeriods.find(p => 
      p.iuran_type_id === activeIuranType && 
      normalizeMonth(p.month) === normalizeMonth(month) && 
      p.year === year
    );
  };

  const iuranForActiveType = iuranPayments.filter(p => 
    p.iuran_periods?.iuran_type_id === activeIuranType && 
    p.iuran_periods?.year === selectedYear
  );
  
  const activePeriods = iuranPeriods.filter(p => 
    p.iuran_type_id === activeIuranType && 
    p.year === selectedYear
  );
  
  const lunasCount = iuranForActiveType.filter(p => p.status === 'Lunas').length;
  const verifCount = iuranForActiveType.filter(p => p.status === 'Menunggu Verifikasi').length;
  const ditolakCount = iuranForActiveType.filter(p => p.status === 'Ditolak').length;
  const totalPossiblePayments = warga.length * activePeriods.length;
  const belumBayarCount = totalPossiblePayments - lunasCount - verifCount - ditolakCount;
  
  // Tabs navigation
  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "warga", label: "Data Warga", icon: Users },
    { id: "iuran", label: "Iuran", icon: Wallet },
    { id: "agenda", label: "Agenda & Kegiatan", icon: Calendar },
    { id: "gotong-royong", label: "Kegiatan Warga", icon: Users },
    { id: "pengumuman", label: "Pengumuman", icon: Megaphone },

    { id: "laporan", label: "Laporan", icon: FileWarning },
    { id: "kontak", label: "Kontak Darurat", icon: Phone },
    { id: "profil", label: "Profil RT/RW", icon: Building2 },
  ];

  // Kegiatan Sub-tabs
  const [activeKegiatanSubTab, setActiveKegiatanSubTab] = useState<string>("Gotong Royong");

  const filteredGotongRoyong = gotongRoyong.filter(item => item.activity_type === activeKegiatanSubTab || (!item.activity_type && activeKegiatanSubTab === "Gotong Royong"));

  const handleAction = async (action: (fd: FormData) => Promise<any>, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const result = await action(new FormData(e.currentTarget));
    if (result.error) setMessage({ type: 'error', text: result.error });
    else if (result.warning) {
      setMessage({ type: 'warning', text: result.warning });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'success', text: "Data berhasil disimpan." });
      (e.target as HTMLFormElement).reset();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    const result = await deleteData(table, id);
    if (result.error) alert("Gagal menghapus: " + result.error);
    else window.location.reload();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="sticky top-24 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                : "text-slate-600 hover:bg-white hover:text-emerald-600"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8 min-w-0">
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
            message.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
            'bg-red-50 border-red-100 text-red-700'
          } flex justify-between items-center`}>
            <p className="text-sm font-medium">{message.text}</p>
            <button onClick={() => setMessage(null)}><XCircle size={18} /></button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
              <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas dan status lingkungan hari ini.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm"><CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Users size={24} /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Warga</p><p className="text-2xl font-bold text-slate-900">{warga.length}</p></div>
                </div>
              </CardContent></Card>
              <Card className="border-none shadow-sm"><CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Calendar size={24} /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agenda Aktif</p><p className="text-2xl font-bold text-slate-900">{agendas.length}</p></div>
                </div>
              </CardContent></Card>
              <Card className="border-none shadow-sm"><CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Wallet size={24} /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Iuran Menunggu</p><p className="text-2xl font-bold text-slate-900">{iuranPayments.filter(i => i.status === 'Menunggu Verifikasi').length}</p></div>
                </div>
              </CardContent></Card>
              <Card className="border-none shadow-sm"><CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl"><FileWarning size={24} /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laporan Baru</p><p className="text-2xl font-bold text-slate-900">{laporan.filter(l => l.status === 'Open').length}</p></div>
                </div>
              </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Laporan Warga Terbaru</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {laporan.slice(0, 3).map(l => (
                      <div key={l.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{l.title}</p>
                          <p className="text-xs text-slate-400">Oleh: {l.created_by}</p>
                        </div>
                        <Badge variant={l.status === 'Open' ? 'danger' : 'warning'}>{l.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-50">
                    <Button variant="ghost" size="sm" className="w-full text-emerald-600 font-bold" onClick={() => setActiveTab("laporan")}>Lihat Semua Laporan <ArrowRight size={14} className="ml-2" /></Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Agenda Mendatang</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {agendas.slice(0, 3).map(a => (
                      <div key={a.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{a.title}</p>
                          <p className="text-xs text-slate-400">{a.date} | {a.time} WIB</p>
                        </div>
                        <Badge variant="info">{a.category}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-50">
                    <Button variant="ghost" size="sm" className="w-full text-emerald-600 font-bold" onClick={() => setActiveTab("agenda")}>Kelola Agenda <ArrowRight size={14} className="ml-2" /></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 2. WARGA TAB */}
        {activeTab === "warga" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Data Warga</h1>
              <p className="text-sm text-slate-500">Kelola informasi penduduk dan akun login warga.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="pb-4 border-b border-slate-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari warga..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 text-slate-400">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase text-[10px]">Warga</th>
                          <th className="px-6 py-4 font-bold uppercase text-[10px]">Alamat</th>
                          <th className="px-6 py-4 font-bold uppercase text-[10px] text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {warga.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(warga => (
                          <tr key={warga.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{warga.name}</p>
                              <p className="text-[10px] text-emerald-600 font-bold">{warga.status}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">Blok {warga.block} / No {warga.house_number}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => handleDelete('residents', warga.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                <CardHeader><CardTitle className="text-lg">Tambah Warga Baru</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleAction(createResident, e)} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                      <input name="name" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Blok</label>
                        <input name="block" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">No Rumah</label>
                        <input name="house_number" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nomor HP</label>
                      <input name="phone" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input name="email" type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                      <select name="status" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none">
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" name="create_account" id="create_account" className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                        <label htmlFor="create_account" className="text-xs font-bold text-slate-700">Buat akun login untuk warga ini</label>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Password Sementara</label>
                        <input name="password" type="password" placeholder="Min 6 karakter" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600" isLoading={isSubmitting}>Simpan Data Warga</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 3. IURAN TAB */}
        {activeTab === "iuran" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengelolaan Iuran</h1>
                <p className="text-sm text-slate-500">Monitor status pembayaran warga dalam bentuk matriks.</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Iuran Type Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {iuranTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveIuranType(type.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeIuranType === type.id 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Warga</p>
                  <p className="text-xl font-bold text-slate-900">{warga.length}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-orange-500"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">❌ Belum Bayar</p>
                  <p className="text-xl font-bold text-orange-600">{belumBayarCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-blue-500"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">⏳ Verifikasi</p>
                  <p className="text-xl font-bold text-blue-600">{verifCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">✅ Lunas</p>
                  <p className="text-xl font-bold text-emerald-600">{lunasCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-500"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">⛔ Ditolak</p>
                  <p className="text-xl font-bold text-red-600">{ditolakCount}</p>
               </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
               <div className="lg:col-span-3 space-y-6">
                  <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
                      <div className="relative max-w-xs w-full">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Cari nama warga..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                      
                      {/* Status Legend */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-tighter">
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <X className="w-3 h-3 text-orange-500" strokeWidth={3} />
                            <span className="text-slate-600">Belum</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Clock className="w-3 h-3 text-blue-500" strokeWidth={3} />
                            <span className="text-slate-600">Verif</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                            <span className="text-slate-600">Lunas</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Ban className="w-3 h-3 text-red-500" strokeWidth={3} />
                            <span className="text-slate-600">Tolak</span>
                         </div>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="sticky left-0 z-10 bg-slate-50 px-6 py-4 font-bold uppercase text-[10px] border-r border-slate-100 min-w-[180px]">Nama Warga</th>
                            {MONTHS.map(m => (
                              <th key={m} className="px-3 py-4 font-bold uppercase text-[10px] text-center min-w-[80px] border-r border-slate-100 last:border-0">{m.slice(0, 3)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {warga.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(resident => (
                            <tr key={resident.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-6 py-4 border-r border-slate-100 transition-colors">
                                <p className="font-bold text-slate-900 leading-none">{resident.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase">Blok {resident.block} / {resident.house_number}</p>
                              </td>
                              {MONTHS.map(month => {
                                const payment = getPayment(resident.id, month, selectedYear);
                                const period = getPeriod(month, selectedYear);
                                
                                if (!period) {
                                  return (
                                    <td key={month} className="p-1 border-r border-slate-100 last:border-0 bg-slate-50/30">
                                      <div className="w-full h-12 flex items-center justify-center text-[8px] text-slate-300 font-bold uppercase">No Period</div>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={month} className="p-1 border-r border-slate-100 last:border-0">
                                    <button
                                      onClick={() => {
                                        setSelectedPayment(payment || null);
                                        setSelectedCell({ residentId: resident.id, month, year: selectedYear });
                                        setAdminNote(payment?.notes || "");
                                      }}
                                      className={`w-full h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm border ${
                                        payment?.status === 'Lunas' ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' :
                                        payment?.status === 'Menunggu Verifikasi' ? 'bg-blue-500 border-blue-600 text-white animate-pulse shadow-blue-100 hover:bg-blue-600' :
                                        payment?.status === 'Ditolak' ? 'bg-red-500 border-red-600 text-white hover:bg-red-600' :
                                        'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'
                                      }`}
                                    >
                                      {payment?.status === 'Lunas' ? <Check size={16} strokeWidth={3} /> :
                                       payment?.status === 'Menunggu Verifikasi' ? <Clock size={16} strokeWidth={3} /> :
                                       payment?.status === 'Ditolak' ? <Ban size={16} strokeWidth={3} /> :
                                       <X size={16} strokeWidth={3} />}
                                      <span className="text-[8px] font-black uppercase tracking-tighter">
                                        {payment?.status === 'Lunas' ? 'LUNAS' : 
                                         payment?.status === 'Menunggu Verifikasi' ? 'VERIF' : 
                                         payment?.status === 'Ditolak' ? 'TOLAK' : 'BELUM'}
                                      </span>
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
               </div>

               <div className="space-y-6">
                  <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">Buat Tagihan Baru</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => handleAction(createIuranPeriod, e)} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Jenis Iuran</label>
                          <select 
                            name="iuran_type_id" 
                            required 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                            value={activeIuranType}
                            onChange={(e) => setActiveIuranType(e.target.value)}
                          >
                            {iuranTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Judul Tagihan</label>
                          <input name="title" placeholder="Contoh: Iuran November" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Bulan</label>
                              <select name="month" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500">
                                {MONTHS.map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Tahun</label>
                              <input name="year" type="number" defaultValue={new Date().getFullYear()} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                           </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Nominal (Rp)</label>
                          <input name="amount" type="number" placeholder="100000" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2 py-1">
                           <input type="checkbox" name="generate_payments" id="generate_payments_new" defaultChecked className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                           <label htmlFor="generate_payments_new" className="text-[11px] font-bold text-slate-600">Buat tagihan untuk semua warga aktif</label>
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100" isLoading={isSubmitting}>Terbitkan Tagihan</Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Payment Detail Section */}
                  {(selectedPayment || selectedCell) && (
                    <Card className="border-none shadow-2xl border-t-4 border-t-slate-900 animate-in slide-in-from-right duration-300">
                      <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
                         <CardTitle className="text-sm font-bold uppercase">Aksi Pembayaran</CardTitle>
                         <button onClick={() => { setSelectedPayment(null); setSelectedCell(null); }} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warga</p>
                           <p className="font-bold text-slate-900">
                             {selectedPayment?.resident_name || warga.find(w => w.id === selectedCell?.residentId)?.name}
                           </p>
                           <p className="text-xs text-slate-500 font-bold">
                             {selectedCell?.month} {selectedCell?.year}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Nominal</p>
                              <p className="font-bold text-emerald-600">
                                Rp {(selectedPayment?.amount || getPeriod(selectedCell?.month!, selectedCell?.year!)?.amount || 0).toLocaleString()}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                              <Badge className="font-bold" variant={selectedPayment?.status === 'Lunas' ? 'success' : selectedPayment?.status === 'Ditolak' ? 'danger' : selectedPayment?.status === 'Menunggu Verifikasi' ? 'warning' : 'default'}>
                                {selectedPayment?.status || 'Belum Bayar'}
                              </Badge>
                           </div>
                        </div>

                        {selectedPayment?.payment_method && (
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</p>
                              <p className="text-xs font-bold text-slate-700">{selectedPayment.payment_method}</p>
                           </div>
                        )}

                        {selectedPayment?.payment_proof_url && (
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Bukti Bayar</p>
                              <a href={selectedPayment.payment_proof_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                Lihat Bukti <ArrowRight size={12} />
                              </a>
                           </div>
                        )}

                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Catatan Admin</label>
                          <textarea 
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                            placeholder="Alasan penolakan atau catatan tambahan..."
                            rows={2}
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2">
                           {selectedPayment?.status !== 'Lunas' && (
                             <Button 
                               className="w-full bg-emerald-600 shadow-lg shadow-emerald-100 font-bold" 
                               isLoading={isSubmitting}
                               onClick={async () => {
                                 setIsSubmitting(true);
                                 const periodId = selectedPayment?.period_id || getPeriod(selectedCell?.month!, selectedCell?.year!)?.id;
                                 const res = await updatePaymentStatus('Lunas', selectedCell?.residentId!, periodId, selectedPayment?.id, adminNote);
                                 if (res.error) alert(res.error);
                                 else { setSelectedPayment(null); setSelectedCell(null); window.location.reload(); }
                                 setIsSubmitting(false);
                               }}
                             >
                               Tandai Lunas ✅
                             </Button>
                           )}
                           
                           {(selectedPayment?.status === 'Menunggu Verifikasi' || selectedPayment?.status === 'Belum Bayar' || !selectedPayment) && (
                             <Button 
                               variant="ghost"
                               className="w-full text-red-600 hover:bg-red-50 font-bold border border-transparent hover:border-red-100" 
                               isLoading={isSubmitting}
                               onClick={async () => {
                                 if (!adminNote && (selectedPayment?.status === 'Menunggu Verifikasi')) return alert("Berikan alasan penolakan di catatan admin.");
                                 setIsSubmitting(true);
                                 const periodId = selectedPayment?.period_id || getPeriod(selectedCell?.month!, selectedCell?.year!)?.id;
                                 const res = await updatePaymentStatus('Ditolak', selectedCell?.residentId!, periodId, selectedPayment?.id, adminNote);
                                 if (res.error) alert(res.error);
                                 else { setSelectedPayment(null); setSelectedCell(null); window.location.reload(); }
                                 setIsSubmitting(false);
                               }}
                             >
                               Tolak Pembayaran ⛔
                             </Button>
                           )}

                           {selectedPayment && selectedPayment.status !== 'Belum Bayar' && (
                             <Button 
                               variant="ghost"
                               className="w-full text-slate-500 hover:bg-slate-100 font-bold" 
                               isLoading={isSubmitting}
                               onClick={async () => {
                                 if (!confirm("Tandai warga ini belum membayar? Data pembayaran sebelumnya akan dibersihkan.")) return;
                                 setIsSubmitting(true);
                                 const periodId = selectedPayment.period_id;
                                 const res = await updatePaymentStatus('Belum Bayar', selectedCell?.residentId!, periodId, selectedPayment.id, adminNote);
                                 if (res.error) alert(res.error);
                                 else { setSelectedPayment(null); setSelectedCell(null); window.location.reload(); }
                                 setIsSubmitting(false);
                               }}
                             >
                               Tandai Belum Bayar ❌
                             </Button>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* 4. AGENDA TAB */}
        {activeTab === "agenda" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Kelola Agenda</h1>
                <p className="text-sm text-slate-500">Jadwal kegiatan rutin dan acara khusus warga.</p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-2 space-y-4">
                  {agendas.map(agenda => (
                    <Card key={agenda.id} className="border-none shadow-sm">
                      <CardContent className="p-6 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Calendar size={20} /></div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{agenda.title}</h3>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{agenda.date} | {agenda.time}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete('agendas', agenda.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                  <CardHeader><CardTitle className="text-lg">Tambah Agenda</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleAction(createAgenda, e)} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Judul Kegiatan</label>
                          <input name="title" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                             <input name="date" type="date" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Waktu</label>
                             <input name="time" type="time" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                          <input name="location" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600" isLoading={isSubmitting}>Simpan Agenda</Button>
                    </form>
                  </CardContent>
               </Card>
            </div>
           </div>
        )}

        {/* 5. KEGIATAN TAB (Gotong Royong, Kerja Bakti, Ronda) */}
        {activeTab === "gotong-royong" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Kegiatan Warga</h1>
                  <p className="text-sm text-slate-500">Kelola jadwal gotong royong, kerja bakti, dan ronda.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                   {["Gotong Royong", "Kerja Bakti", "Ronda"].map(sub => (
                     <button
                       key={sub}
                       onClick={() => setActiveKegiatanSubTab(sub)}
                       className={clsx(
                         "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                         activeKegiatanSubTab === sub ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                       )}
                     >
                       {sub}
                     </button>
                   ))}
                </div>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-2 space-y-4">
                  {filteredGotongRoyong.length > 0 ? filteredGotongRoyong.map(item => (
                    <Card key={item.id} className="border-none shadow-sm">
                      <CardContent className="p-6 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                              {item.activity_type === "Kerja Bakti" ? <Hammer size={20} /> : item.activity_type === "Ronda" ? <ShieldAlert size={20} /> : <Users size={20} />}
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date} | {item.time}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Cancelled' ? 'danger' : 'warning'}>{item.status}</Badge>
                           <button onClick={() => handleDelete('gotong_royong', item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                       <p className="text-slate-400 font-medium text-sm">Belum ada jadwal {activeKegiatanSubTab}.</p>
                    </div>
                  )}
               </div>

               <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                  <CardHeader><CardTitle className="text-lg">Tambah {activeKegiatanSubTab}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleAction(createActivity, e)} className="space-y-4">
                       <input type="hidden" name="activity_type" value={activeKegiatanSubTab} />
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Judul Kegiatan</label>
                          <input name="title" placeholder={`Contoh: ${activeKegiatanSubTab === 'Ronda' ? 'Ronda Malam Blok A' : activeKegiatanSubTab === 'Kerja Bakti' ? 'Kerja Bakti Saluran Air' : 'Pembersihan Selokan'}`} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                             <input name="date" type="date" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Waktu</label>
                             <input name="time" type="time" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                          <input name="location" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Target Peserta</label>
                          <input name="required_participants" type="number" defaultValue="20" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Keterangan</label>
                          <textarea name="description" rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600 shadow-md" isLoading={isSubmitting}>Simpan Jadwal</Button>
                    </form>
                  </CardContent>
               </Card>
            </div>
           </div>
        )}

        {/* 6. PENGUMUMAN TAB */}
        {activeTab === "pengumuman" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengumuman</h1>
                <p className="text-sm text-slate-500">Kirim informasi penting kepada warga.</p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-2 space-y-4">
                  {pengumuman.map(item => (
                    <Card key={item.id} className="border-none shadow-sm overflow-hidden flex">
                      <div className={`w-2 shrink-0 ${item.priority === 'Penting' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <CardContent className="p-6 flex-1 flex items-center justify-between gap-6">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.content}</p>
                        </div>
                        <button onClick={() => handleDelete('announcements', item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                  <CardHeader><CardTitle className="text-lg">Buat Pengumuman</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleAction(createAnnouncement, e)} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Judul</label>
                          <input name="title" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Isi</label>
                          <textarea name="content" rows={4} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Prioritas</label>
                          <select name="priority" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none">
                             <option value="Normal">Normal</option><option value="Penting">Penting</option>
                          </select>
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600" isLoading={isSubmitting}>Kirim</Button>
                    </form>
                  </CardContent>
               </Card>
            </div>
           </div>
        )}

        {/* 7. LAPORAN TAB */}
        {activeTab === "laporan" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Laporan Warga</h1>
                <p className="text-sm text-slate-500">Pantau dan tindak lanjuti laporan warga.</p>
              </div>

            <div className="grid grid-cols-1 gap-4">
              {laporan.map(item => (
                <Card key={item.id} className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.status === 'Open' ? 'danger' : 'warning'}>{item.status}</Badge>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                       <select 
                         className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                         defaultValue={item.status}
                         onChange={async (e) => {
                           await updateReportStatus(item.id, e.target.value);
                           window.location.reload();
                         }}
                       >
                         <option value="Open">Open</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option>
                       </select>
                       <button onClick={() => handleDelete('reports', item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
           </div>
        )}

        {/* 8. KONTAK TAB */}
        {activeTab === "kontak" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Kontak Darurat</h1>
                <p className="text-sm text-slate-500">Kelola nomor telepon penting.</p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kontak.map(contact => (
                    <Card key={contact.id} className="border-none shadow-sm">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-sm">{contact.name}</h3>
                          <Badge variant={contact.is_active ? 'success' : 'default'}>{contact.is_active ? 'A' : 'N'}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{contact.phone}</p>
                        <div className="mt-auto flex justify-end"><button onClick={() => handleDelete('emergency_contacts', contact.id)} className="p-1 text-slate-300 hover:text-red-600"><Trash2 size={14} /></button></div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                  <CardHeader><CardTitle className="text-lg">Tambah Kontak</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleAction(createEmergencyContact, e)} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Nama</label>
                          <input name="name" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Telepon</label>
                          <input name="phone" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600" isLoading={isSubmitting}>Simpan</Button>
                    </form>
                  </CardContent>
               </Card>
            </div>
           </div>
        )}

        {/* 9. PROFIL TAB */}
        {activeTab === "profil" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Profil RT/RW</h1>
                <p className="text-sm text-slate-500 mt-1">Ubah informasi publik tentang lingkungan.</p>
              </div>

              <Card className="border-none shadow-sm overflow-hidden">
                <div className="h-24 bg-emerald-600" />
                <CardContent className="p-8 -mt-8">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-50">
                    <form action={async (fd) => {
                       setIsSubmitting(true);
                       const res = await updateHousingProfile(profil.id, Object.fromEntries(fd.entries()));
                       if (res.error) setMessage({ type: 'error', text: res.error });
                       else setMessage({ type: 'success', text: 'Profil diperbarui.' });
                       setIsSubmitting(false);
                    }} className="space-y-6">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Nama Perumahan</label>
                          <input name="name" defaultValue={profil.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Alamat</label>
                          <input name="address" defaultValue={profil.address} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600 font-bold" isLoading={isSubmitting}>Simpan Perubahan</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
           </div>
        )}
      </main>
    </div>
  );
}
