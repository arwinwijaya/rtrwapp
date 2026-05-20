"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ShieldAlert,
  BookOpen,
  Settings
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
  updatePaymentStatus,
  generateRondaSchedule,
  createRondaSchedule,
  updateAgenda,
  updateActivity,
  updateRondaSchedule,
  updateResident,
  createIuranType,
  updateIuranType,
  updateIuranPeriod,
  updateAnnouncement,
  updateEmergencyContact
} from "./actions";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

type AdminTab = "overview" | "warga" | "iuran" | "agenda" | "pengumuman" | "laporan" | "kontak" | "profil";

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
    'december': 'Desember', 'dec': 'Desember', '12': 'Desember'
  };
  
  const normalized = monthMap[m.toLowerCase().trim()];
  return normalized || m.toString();
};

interface AdminClientProps {
  initialSection?: string;
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
  rondaSchedules: any[];
  rondaAssignments: any[];
}

export default function AdminClient({
  initialSection = "overview",
  initialTab = "Umum",
  warga,
  iuranTypes,
  iuranPeriods,
  iuranPayments,
  agendas,
  gotongRoyong,
  pengumuman,
  laporan,
  kontak,
  profil,
  rondaSchedules,
  rondaAssignments
}: AdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialSection as AdminTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  // Modal CRUD States
  const [modal, setModal] = useState<{ 
    mode: "create" | "edit" | "delete" | "generate" | null, 
    module: string, 
    item: any | null 
  }>({ mode: null, module: '', item: null });

  const closeModal = () => setModal({ mode: null, module: '', item: null });
  const openCreate = (module: string) => setModal({ mode: "create", module, item: null });
  const openEdit = (module: string, item: any) => setModal({ mode: "edit", module, item });
  const openDelete = (module: string, item: any) => setModal({ mode: "delete", module, item });
  const openGenerate = (module: string) => setModal({ mode: "generate", module, item: null });

  // Ronda States
  const [isGeneratingRonda, setIsGeneratingRonda] = useState(false);

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
  
  // Unified Agenda Sub-tabs
  const [activeAgendaSubTab, setActiveAgendaSubTab] = useState<string>(initialTab);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", activeTab);
    if (activeTab === "agenda") {
      params.set("tab", activeAgendaSubTab);
    } else {
      params.delete("tab");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab, activeAgendaSubTab, searchParams]);

  const filteredGotongRoyong = gotongRoyong.filter(item => item.activity_type === activeAgendaSubTab);

  const handleAction = async (action: (fd: FormData) => Promise<any>, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const result = await action(new FormData(e.currentTarget));
    if (result.error) setMessage({ type: 'error', text: result.error });
    else {
      setMessage({ type: 'success', text: "Operasi berhasil." });
      closeModal();
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!modal.item) return;
    setIsSubmitting(true);
    const tableMap: { [key: string]: string } = {
      'warga': 'residents',
      'agenda-umum': 'agendas',
      'gotong-royong': 'gotong_royong',
      'yasinan': 'gotong_royong',
      'ronda': 'ronda_schedules',
      'pengumuman': 'announcements',
      'laporan': 'reports',
      'kontak': 'emergency_contacts',
      'jenis-iuran': 'iuran_types'
    };
    const result = await deleteData(tableMap[modal.module] || modal.module, modal.item.id);
    if (result.error) alert("Gagal menghapus: " + result.error);
    else {
      closeModal();
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full">
      {/* Sidebar Navigation */}
      <AdminSidebar activeSection={activeTab} onSectionChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 overflow-y-auto">
        {message && (
          <div className={`p-4 rounded-2xl border animate-in slide-in-from-top duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
            message.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
            'bg-red-50 border-red-100 text-red-700'
          } flex justify-between items-center shadow-sm`}>
            <p className="text-sm font-bold flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </p>
            <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors"><XCircle size={18} /></button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <AdminPageHeader 
              title="Dashboard Admin" 
              subtitle="Selamat datang kembali! Berikut ringkasan status lingkungan hari ini."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("warga")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shadow-emerald-100/50"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Warga</p><p className="text-2xl font-bold text-slate-900 leading-none">{warga.length}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("agenda")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner shadow-blue-100/50"><Calendar size={24} /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Agenda</p><p className="text-2xl font-bold text-slate-900 leading-none">{agendas.length}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("iuran")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner shadow-amber-100/50"><Wallet size={24} /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Verif Iuran</p><p className="text-2xl font-bold text-slate-900 leading-none">{iuranPayments.filter(i => i.status === 'Menunggu Verifikasi').length}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("laporan")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-inner shadow-red-100/50"><FileWarning size={24} /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Laporan</p><p className="text-2xl font-bold text-slate-900 leading-none">{laporan.filter(l => l.status === 'Open').length}</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50/50 border-b-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Laporan Warga Terbaru</CardTitle>
                    <ArrowRight size={16} className="text-slate-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="divide-y divide-slate-50">
                    {laporan.length > 0 ? laporan.slice(0, 4).map(l => (
                      <div key={l.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{l.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Oleh: {l.resident_name || 'Warga'}</p>
                        </div>
                        <Badge className="font-bold" variant={l.status === 'Open' ? 'danger' : 'warning'}>{l.status}</Badge>
                      </div>
                    )) : (
                      <div className="p-10 text-center text-slate-400 text-sm italic">Tidak ada laporan.</div>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                  <Button variant="ghost" size="sm" className="w-full text-emerald-600 font-bold hover:bg-emerald-50" onClick={() => setActiveTab("laporan")}>Kelola Semua Laporan</Button>
                </div>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50/50 border-b-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Agenda Mendatang</CardTitle>
                    <ArrowRight size={16} className="text-slate-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="divide-y divide-slate-50">
                    {agendas.length > 0 ? agendas.slice(0, 4).map(a => (
                      <div key={a.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex gap-4 items-center">
                           <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">{a.date.split('-')[2]}</div>
                           <div>
                             <p className="font-bold text-slate-900 text-sm">{a.title}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{a.time} WIB | {a.location}</p>
                           </div>
                        </div>
                        <Badge variant="info" className="font-bold">{a.category}</Badge>
                      </div>
                    )) : (
                      <div className="p-10 text-center text-slate-400 text-sm italic">Tidak ada agenda.</div>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                  <Button variant="ghost" size="sm" className="w-full text-emerald-600 font-bold hover:bg-emerald-50" onClick={() => setActiveTab("agenda")}>Kelola Semua Agenda</Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. WARGA TAB */}
        {activeTab === "warga" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <AdminPageHeader 
              title="Data Warga" 
              subtitle="Kelola informasi kependudukan dan akses login warga."
              actionLabel="Tambah Warga"
              onAction={() => openCreate('warga')}
            />

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari warga..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400">
                      <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Warga</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Alamat</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Anggota</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Status</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {warga.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.block.toLowerCase().includes(searchTerm.toLowerCase())).map(resident => (
                      <tr key={resident.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{resident.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{resident.phone || 'No Phone'}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">Blok {resident.block} / No {resident.house_number}</td>
                        <td className="px-6 py-4 text-slate-600">{resident.family_members_count} Orang</td>
                        <td className="px-6 py-4"><Badge variant={resident.status === 'Aktif' ? 'success' : 'default'} className="font-bold">{resident.status}</Badge></td>
                        <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit('warga', resident)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => openDelete('warga', resident)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 3. IURAN TAB */}
        {activeTab === "iuran" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengelolaan Iuran</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor dan verifikasi status pembayaran iuran warga.</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <Button 
                  onClick={() => openCreate('iuran-period')}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100"
                >
                  <Plus className="w-4 h-4 mr-2" /> Terbitkan Tagihan
                </Button>
              </div>
            </div>

            {/* Iuran Type Tabs with Edit/Add */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
                {iuranTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveIuranType(type.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeIuranType === type.id 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                      : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <Button variant="ghost" size="sm" className="text-slate-500 font-bold" onClick={() => openEdit('jenis-iuran', iuranTypes.find(t => t.id === activeIuranType))}>
                    <Settings className="w-4 h-4 mr-1.5" /> Atur Jenis
                 </Button>
                 <Button variant="ghost" size="sm" className="text-emerald-600 font-bold" onClick={() => openCreate('jenis-iuran')}>
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Jenis
                 </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Warga</p>
                  <p className="text-xl font-bold text-slate-900 leading-none">{warga.length}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-orange-400"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1 leading-none">❌ Belum</p>
                  <p className="text-xl font-bold text-orange-600 leading-none">{belumBayarCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-blue-400"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1 leading-none">⏳ Verif</p>
                  <p className="text-xl font-bold text-blue-600 leading-none">{verifCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-400"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 leading-none">✅ Lunas</p>
                  <p className="text-xl font-bold text-emerald-600 leading-none">{lunasCount}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white border-l-4 border-l-red-400"><CardContent className="p-4 text-center">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 leading-none">⛔ Tolak</p>
                  <p className="text-xl font-bold text-red-600 leading-none">{ditolakCount}</p>
               </CardContent></Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari nama warga..." 
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" 
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
                      <th className="sticky left-0 z-10 bg-slate-50 px-6 py-4 font-bold uppercase text-[10px] border-r border-slate-100 min-w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Nama Warga</th>
                      {MONTHS.map(m => (
                        <th key={m} className="px-3 py-4 font-bold uppercase text-[10px] text-center min-w-[85px] border-r border-slate-100 last:border-0">{m.slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {warga.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(resident => (
                      <tr key={resident.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-6 py-4 border-r border-slate-100 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          <p className="font-bold text-slate-900 leading-tight">{resident.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight leading-none">Blok {resident.block} / {resident.house_number}</p>
                        </td>
                        {MONTHS.map(month => {
                          const payment = getPayment(resident.id, month, selectedYear);
                          const period = getPeriod(month, selectedYear);
                          
                          if (!period) {
                            return (
                              <td key={month} className="p-1 border-r border-slate-100 last:border-0 bg-slate-50/30">
                                <div className="w-full h-11 flex items-center justify-center text-[7px] text-slate-300 font-black uppercase tracking-tighter">No Period</div>
                              </td>
                            );
                          }

                          return (
                            <td key={month} className="p-1 border-r border-slate-100 last:border-0">
                              <button
                                onClick={() => {
                                  if (payment) {
                                    openEdit('payment-detail', payment);
                                  } else {
                                    alert("Belum ada tagihan/pembayaran untuk periode ini.");
                                  }
                                }}
                                className={`w-full h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm border ${
                                  payment?.status === 'Lunas' ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' :
                                  payment?.status === 'Menunggu Verifikasi' ? 'bg-blue-500 border-blue-600 text-white animate-pulse shadow-blue-100 hover:bg-blue-600' :
                                  payment?.status === 'Ditolak' ? 'bg-red-500 border-red-600 text-white hover:bg-red-600' :
                                  'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'
                                }`}
                              >
                                {payment?.status === 'Lunas' ? <Check size={14} strokeWidth={4} /> :
                                 payment?.status === 'Menunggu Verifikasi' ? <Clock size={14} strokeWidth={4} /> :
                                 payment?.status === 'Ditolak' ? <Ban size={14} strokeWidth={4} /> :
                                 <X size={14} strokeWidth={4} />}
                                <span className="text-[7px] font-black uppercase tracking-tighter">
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
        )}

        {/* 4. UNIFIED AGENDA & KEGIATAN TAB */}
        {activeTab === "agenda" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <AdminPageHeader 
                title="Agenda & Kegiatan" 
                subtitle="Kelola semua jadwal pertemuan, gotong royong, yasinan, dan ronda."
                actionLabel={`Tambah ${activeAgendaSubTab}`}
                onAction={() => activeAgendaSubTab === 'Ronda' ? openCreate('ronda') : activeAgendaSubTab === 'Umum' ? openCreate('agenda-umum') : activeAgendaSubTab === 'Yasinan' ? openCreate('yasinan') : openCreate('gotong-royong')}
             />

             <div className="flex bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto scrollbar-hide mb-8 shadow-inner">
                {["Umum", "Gotong Royong", "Yasinan", "Ronda"].map(sub => (
                  <button
                    key={sub}
                    onClick={() => { setActiveAgendaSubTab(sub); setEditingItem(null); }}
                    className={clsx(
                      "px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                      activeAgendaSubTab === sub ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {sub}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-1 gap-6">
                {activeAgendaSubTab === "Ronda" ? (
                  <Card className="border-none shadow-sm overflow-hidden">
                      <CardHeader className="pb-4 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Jadwal Ronda Harian</CardTitle>
                        <Button size="sm" variant="outline" className="text-xs font-bold bg-white shadow-sm rounded-xl" onClick={() => openGenerate('ronda')}>
                            <Sparkles className="w-4 h-4 mr-2 text-emerald-500" /> Auto-Generate Ronda
                        </Button>
                      </CardHeader>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400">
                                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Tanggal & Area</th>
                                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Petugas Ronda</th>
                                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Status</th>
                                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rondaSchedules.length > 0 ? rondaSchedules.map(schedule => {
                                  const assignments = rondaAssignments.filter(a => a.ronda_schedule_id === schedule.id);
                                  return (
                                      <tr key={schedule.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{schedule.date}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{schedule.time} WIB | {schedule.area}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                              {assignments.map(a => (
                                                  <Badge key={a.id} variant="outline" className="text-[9px] bg-slate-50 border-slate-200 text-slate-600 font-bold">
                                                    {a.residents?.name || 'Warga'}
                                                  </Badge>
                                              ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><Badge variant={schedule.status === 'Completed' ? 'success' : 'warning'} className="font-bold">{schedule.status}</Badge></td>
                                        <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit('ronda', schedule)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => openDelete('ronda', schedule)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                        </td>
                                      </tr>
                                  );
                                }) : (
                                  <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic bg-slate-50/50">Belum ada jadwal ronda.</td></tr>
                                )}
                            </tbody>
                          </table>
                      </div>
                  </Card>
                ) : activeAgendaSubTab === "Umum" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {agendas.length > 0 ? agendas.map(agenda => (
                        <Card key={agenda.id} className="border-none shadow-sm group hover:shadow-md transition-all">
                          <CardContent className="p-6 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner shadow-blue-100/50"><Calendar size={24} /></div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{agenda.title}</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{agenda.date} | {agenda.time} WIB</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">{agenda.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit('agenda-umum', agenda)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => openDelete('agenda-umum', agenda)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>
                          </CardContent>
                        </Card>
                      )) : (
                        <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                           <Calendar size={40} className="mb-4 opacity-20" />
                           <p className="font-bold text-sm">Belum ada agenda umum.</p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGotongRoyong.length > 0 ? filteredGotongRoyong.map(item => (
                      <Card key={item.id} className="border-none shadow-sm group hover:shadow-md transition-all">
                        <CardContent className="p-6 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner shadow-slate-100 ${
                                item.activity_type === "Yasinan" ? "bg-amber-50 text-amber-600 shadow-amber-100/50" : "bg-emerald-50 text-emerald-600 shadow-emerald-100/50"
                              }`}>
                                {item.activity_type === "Yasinan" ? <BookOpen size={24} /> : <Hammer size={24} />}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{item.title}</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{item.date} | {item.time}</p>
                                {item.host_name && <p className="text-[10px] text-slate-600 font-bold mt-1 tracking-tight italic">Host: {item.host_name}</p>}
                              </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                              <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Cancelled' ? 'danger' : 'warning'} className="font-bold text-[9px] uppercase tracking-tighter">{item.status}</Badge>
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(activeAgendaSubTab.toLowerCase() === 'yasinan' ? 'yasinan' : 'gotong-royong', item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => openDelete(activeAgendaSubTab.toLowerCase() === 'yasinan' ? 'yasinan' : 'gotong-royong', item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                          {activeAgendaSubTab === 'Yasinan' ? <BookOpen size={40} className="mb-4 opacity-20" /> : <Hammer size={40} className="mb-4 opacity-20" />}
                          <p className="font-bold text-sm">Belum ada jadwal {activeAgendaSubTab}.</p>
                      </div>
                    )}
                  </div>
                )}
             </div>
           </div>
        )}

        {/* 6. PENGUMUMAN TAB */}
        {activeTab === "pengumuman" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <AdminPageHeader 
                title="Pengumuman" 
                subtitle="Kirim informasi terbaru dan peringatan penting kepada seluruh warga."
                actionLabel="Buat Pengumuman"
                onAction={() => openCreate('pengumuman')}
             />

             <div className="grid grid-cols-1 gap-4">
                {pengumuman.length > 0 ? pengumuman.map(item => (
                  <Card key={item.id} className="border-none shadow-sm overflow-hidden flex hover:shadow-md transition-all group">
                    <div className={`w-2 shrink-0 ${item.priority === 'Penting' ? 'bg-amber-400' : item.priority === 'Mendesak' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <CardContent className="p-6 flex-1 flex items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <Badge variant={item.priority === 'Penting' ? 'warning' : item.priority === 'Mendesak' ? 'danger' : 'success'} className="font-bold text-[9px] uppercase tracking-widest">{item.priority}</Badge>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.publish_date).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{item.content}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit('pengumuman', item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => openDelete('pengumuman', item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <Megaphone size={40} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm">Belum ada pengumuman.</p>
                  </div>
                )}
             </div>
           </div>
        )}

        {/* 7. LAPORAN TAB */}
        {activeTab === "laporan" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <AdminPageHeader 
                title="Laporan Warga" 
                subtitle="Pantau keluhan dan laporan fasilitas umum dari warga."
             />

             <div className="grid grid-cols-1 gap-4">
              {laporan.length > 0 ? laporan.map(item => (
                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-6 flex items-center justify-between gap-6">
                    <div className="flex-1 flex gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 h-fit ${item.status === 'Open' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                         <FileWarning size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={item.status === 'Open' ? 'danger' : 'warning'} className="font-bold text-[9px] uppercase tracking-widest">{item.status}</Badge>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl mb-1">{item.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dari: {item.resident_name || 'Warga'} | {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                       <Button size="sm" variant="outline" className="text-[10px] font-black uppercase rounded-xl bg-white shadow-sm" onClick={() => openEdit('laporan', item)}>
                          Update Status
                       </Button>
                       <button onClick={() => openDelete('laporan', item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                    <FileWarning size={40} className="mb-4 opacity-20" />
                    <p className="font-bold text-sm">Tidak ada laporan warga.</p>
                </div>
              )}
            </div>
           </div>
        )}

        {/* 8. KONTAK TAB */}
        {activeTab === "kontak" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <AdminPageHeader 
                title="Kontak Darurat" 
                subtitle="Daftar nomor telepon penting yang dapat dihubungi warga."
                actionLabel="Tambah Kontak"
                onAction={() => openCreate('kontak')}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kontak.length > 0 ? kontak.map(contact => (
                  <Card key={contact.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner shadow-emerald-100/50"><Phone size={20} /></div>
                        <Badge variant={contact.is_active ? 'success' : 'default'} className="font-bold text-[8px] uppercase tracking-widest">{contact.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                      </div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight mb-1">{contact.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 leading-none">{contact.category || 'Umum'}</p>
                      <p className="text-xl font-bold text-emerald-600 mb-6 font-mono tracking-tighter">{contact.phone}</p>
                      <div className="mt-auto flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEdit('kontak', contact)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                         <button onClick={() => openDelete('kontak', contact)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <Phone size={40} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm">Belum ada kontak darurat.</p>
                  </div>
                )}
             </div>
           </div>
        )}

        {/* 9. PROFIL TAB */}
        {activeTab === "profil" && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <AdminPageHeader 
                title="Profil RT/RW" 
                subtitle="Ubah informasi publik tentang lingkungan dan aturan perumahan."
                actionLabel="Edit Profil"
                onAction={() => openEdit('profil', profil)}
                icon={Edit2}
              />

              <div className="max-w-4xl">
                <Card className="border-none shadow-sm overflow-hidden group">
                  <div className="h-40 bg-emerald-600 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 pattern-grid-slate-100/50" />
                      <div className="absolute bottom-6 left-8 flex items-end gap-6">
                         <div className="h-24 w-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 border border-emerald-50 shrink-0">
                            <Building2 size={48} className="text-emerald-600" />
                         </div>
                         <div className="mb-2">
                            <h2 className="text-3xl font-black text-white tracking-tight">{profil.name}</h2>
                            <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">Lingkungan Terdaftar RT {profil.rt_number} / RW {profil.rw_number}</p>
                         </div>
                      </div>
                  </div>
                  <CardContent className="p-10 pt-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                           <section>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tentang Kami</p>
                              <p className="text-slate-600 leading-relaxed font-medium">{profil.description || 'Belum ada deskripsi profil.'}</p>
                           </section>
                           <section>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alamat Lengkap</p>
                              <p className="text-slate-600 font-bold leading-relaxed">{profil.address || 'Alamat belum diatur.'}</p>
                           </section>
                        </div>
                        <div className="space-y-8">
                           <section className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informasi Kontak</p>
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><Phone size={14} /></div>
                                    <span className="text-xs font-black text-slate-700">{profil.phone || '-'}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><Megaphone size={14} /></div>
                                    <span className="text-xs font-black text-slate-700 truncate">{profil.email || '-'}</span>
                                 </div>
                              </div>
                           </section>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
           </div>
        )}
      </main>

      {/* CRUD MODALS */}
      {modal.mode && (
        <>
          {/* Modal Create/Edit */}
          {(modal.mode === 'create' || modal.mode === 'edit') && (
            <Modal 
              isOpen={true} 
              onClose={closeModal} 
              title={`${modal.mode === 'create' ? 'Tambah' : 'Edit'} ${modal.module.replace('-', ' ').toUpperCase()}`}
              size={modal.module === 'profil' ? 'lg' : 'md'}
            >
              {/* Dynamic Form Renderers */}
              <form onSubmit={(e) => {
                const actionMap: { [key: string]: any } = {
                  'warga': modal.mode === 'create' ? createResident : (fd: FormData) => updateResident(modal.item.id, fd),
                  'agenda-umum': modal.mode === 'create' ? createAgenda : (fd: FormData) => updateAgenda(modal.item.id, fd),
                  'gotong-royong': modal.mode === 'create' ? createActivity : (fd: FormData) => updateActivity(modal.item.id, fd),
                  'yasinan': modal.mode === 'create' ? createActivity : (fd: FormData) => updateActivity(modal.item.id, fd),
                  'ronda': modal.mode === 'create' ? createRondaSchedule : (fd: FormData) => updateRondaSchedule(modal.item.id, fd),
                  'pengumuman': modal.mode === 'create' ? createAnnouncement : (fd: FormData) => updateAnnouncement(modal.item.id, fd),
                  'laporan': (fd: FormData) => updateReportStatus(modal.item.id, fd.get('status') as string, fd.get('admin_notes') as string),
                  'kontak': modal.mode === 'create' ? createEmergencyContact : (fd: FormData) => updateEmergencyContact(modal.item.id, fd),
                  'profil': (fd: FormData) => updateHousingProfile(profil.id, Object.fromEntries(fd.entries())),
                  'jenis-iuran': modal.mode === 'create' ? createIuranType : (fd: FormData) => updateIuranType(modal.item.id, fd),
                  'iuran-period': createIuranPeriod,
                  'payment-detail': (fd: FormData) => updatePaymentStatus(modal.item.id, fd.get('status') as any, fd.get('admin_notes') as string)
                };
                handleAction(actionMap[modal.module], e);
              }} className="space-y-5">
                
                {/* Payment Detail Modal */}
                {modal.module === 'payment-detail' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Warga</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{modal.item?.residents?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Periode</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{modal.item?.iuran_periods?.month} {modal.item?.iuran_periods?.year}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nominal</p>
                        <p className="text-sm font-bold text-emerald-600 leading-tight">Rp {modal.item?.amount?.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Saat Ini</p>
                        <Badge variant={modal.item?.status === 'Lunas' ? 'success' : modal.item?.status === 'Ditolak' ? 'danger' : 'warning'} className="font-bold">
                          {modal.item?.status}
                        </Badge>
                      </div>
                    </div>

                    {modal.item?.evidence_url && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bukti Transfer</p>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                          <img src={modal.item.evidence_url} alt="Bukti Pembayaran" className="max-h-full object-contain" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Update Status</label>
                        <select name="status" defaultValue={modal.item?.status} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                          <option value="Lunas">Verifikasi (Lunas)</option>
                          <option value="Ditolak">Tolak Pembayaran</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catatan Admin</label>
                        <textarea name="admin_notes" defaultValue={modal.item?.admin_notes} rows={3} placeholder="Contoh: Bukti transfer tidak terbaca / Pembayaran dikonfirmasi..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Warga Form */}
                {modal.module === 'warga' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                      <input name="name" defaultValue={modal.item?.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blok</label>
                        <input name="block" defaultValue={modal.item?.block} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Rumah</label>
                        <input name="house_number" defaultValue={modal.item?.house_number} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nomor HP</label>
                        <input name="phone" defaultValue={modal.item?.phone} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                       <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anggota Keluarga</label>
                        <input name="family_members_count" type="number" defaultValue={modal.item?.family_members_count || 1} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                       </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                      <input name="email" type="email" defaultValue={modal.item?.email} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                      <select name="status" defaultValue={modal.item?.status || "Aktif"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-bold">
                        <option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option><option value="Pindah">Pindah</option>
                      </select>
                    </div>
                    {modal.mode === 'create' && (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <input type="checkbox" name="create_account" id="create_account_m" className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                          <label htmlFor="create_account_m" className="text-xs font-black text-slate-600 uppercase tracking-tighter">Buat akun login otomatis</label>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password Sementara</label>
                          <input name="password" type="password" placeholder="Min 6 karakter" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Agenda Umum Form */}
                {modal.module === 'agenda-umum' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judul Kegiatan</label>
                        <input name="title" defaultValue={modal.item?.title} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal</label>
                           <input name="date" type="date" defaultValue={modal.item?.date} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</label>
                           <input name="time" type="time" defaultValue={modal.item?.time} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lokasi</label>
                        <input name="location" defaultValue={modal.item?.location} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</label>
                          <select name="category" defaultValue={modal.item?.category || "Rapat"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-bold">
                             <option value="Rapat">Rapat</option><option value="Sosial">Sosial</option><option value="Kesehatan">Kesehatan</option><option value="Keagamaan">Keagamaan</option><option value="Lainnya">Lainnya</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibilitas</label>
                          <select name="visibility" defaultValue={modal.item?.visibility || "Public"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-bold">
                             <option value="Public">Publik</option><option value="Warga Only">Khusus Warga</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keterangan</label>
                        <textarea name="description" defaultValue={modal.item?.description} rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                   </>
                )}

                {/* Activities Form (GR / Yasinan) */}
                {(modal.module === 'gotong-royong' || modal.module === 'yasinan') && (
                   <>
                    <input type="hidden" name="activity_type" value={modal.module === 'yasinan' ? 'Yasinan' : 'Gotong Royong'} />
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judul Kegiatan</label>
                        <input name="title" defaultValue={modal.item?.title} required placeholder={`Contoh: ${modal.module === 'yasinan' ? 'Yasinan Malam Jumat' : 'Gotong Royong Lingkungan'}`} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    {modal.module === 'yasinan' && (
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tuan Rumah (Host)</label>
                           <input name="host_name" defaultValue={modal.item?.host_name} placeholder="Bpk. X (Blok A/12)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal</label>
                           <input name="date" type="date" defaultValue={modal.item?.date} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</label>
                           <input name="time" type="time" defaultValue={modal.item?.time} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lokasi</label>
                        <input name="location" defaultValue={modal.item?.location} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                          <select name="status" defaultValue={modal.item?.status || "Scheduled"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-bold">
                             <option value="Scheduled">Terjadwal</option><option value="In Progress">Berlangsung</option><option value="Completed">Selesai</option><option value="Cancelled">Batal</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Peserta</label>
                          <input name="required_participants" type="number" defaultValue={modal.item?.required_participants || 0} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keterangan</label>
                        <textarea name="description" defaultValue={modal.item?.description} rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                   </>
                )}

                {/* Ronda Schedule Form */}
                {modal.module === 'ronda' && (
                   <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal</label>
                           <input name="date" type="date" defaultValue={modal.item?.date} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</label>
                           <input name="time" type="time" defaultValue={modal.item?.time || "22:00"} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Area / Pos Ronda</label>
                        <input name="area" defaultValue={modal.item?.area} required placeholder="Contoh: Pos Security Blok A" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                       <select name="status" defaultValue={modal.item?.status || "Scheduled"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                          <option value="Scheduled">Terjadwal</option><option value="Completed">Selesai</option><option value="Cancelled">Batal</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catatan Tambahan</label>
                        <textarea name="notes" defaultValue={modal.item?.notes} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                   </>
                )}

                {/* Pengumuman Form */}
                {modal.module === 'pengumuman' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judul Pengumuman</label>
                        <input name="title" defaultValue={modal.item?.title} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Isi Pengumuman</label>
                        <textarea name="content" defaultValue={modal.item?.content} rows={5} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioritas</label>
                          <select name="priority" defaultValue={modal.item?.priority || "Normal"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-bold">
                             <option value="Normal">Normal</option><option value="Penting">Penting</option><option value="Mendesak">Mendesak</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibilitas</label>
                          <select name="visibility" defaultValue={modal.item?.visibility || "Public"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-bold">
                             <option value="Public">Publik</option><option value="Warga Only">Warga Saja</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal Publish</label>
                        <input name="publish_date" type="date" defaultValue={modal.item?.publish_date || new Date().toISOString().split('T')[0]} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                   </>
                )}

                {/* Kontak Form */}
                {modal.module === 'kontak' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Kontak / Instansi</label>
                        <input name="name" defaultValue={modal.item?.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Peran / Jabatan</label>
                        <input name="role" defaultValue={modal.item?.role} placeholder="Contoh: Ketua RT, Pos Security" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nomor Telepon / Darurat</label>
                        <input name="phone" defaultValue={modal.item?.phone} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</label>
                          <select name="category" defaultValue={modal.item?.category || "Lainnya"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                             <option value="Pengurus">Pengurus</option><option value="Keamanan">Keamanan</option><option value="Medis">Medis</option><option value="Darurat">Darurat</option><option value="Lainnya">Lainnya</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Urutan Tampilan</label>
                          <input name="display_order" type="number" defaultValue={modal.item?.display_order || 0} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <input type="checkbox" name="is_active" id="is_active_m" defaultChecked={modal.item ? modal.item.is_active : true} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                       <label htmlFor="is_active_m" className="text-xs font-black text-slate-600 uppercase tracking-tighter">Aktifkan Kontak</label>
                    </div>
                   </>
                )}

                {/* Profil Form */}
                {modal.module === 'profil' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Perumahan / Lingkungan</label>
                            <input name="name" defaultValue={profil.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deskripsi Singkat</label>
                            <textarea name="description" defaultValue={profil.description} rows={4} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alamat Lengkap</label>
                            <textarea name="address" defaultValue={profil.address} rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                         </div>
                      </div>
                      <div className="space-y-5">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RT</label>
                               <input name="rt_number" defaultValue={profil.rt_number} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RW</label>
                               <input name="rw_number" defaultValue={profil.rw_number} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No. Telepon / Kantor</label>
                            <input name="phone" defaultValue={profil.phone} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Administrasi</label>
                            <input name="email" defaultValue={profil.email} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                         </div>
                      </div>
                   </div>
                )}

                {/* Jenis Iuran Form */}
                {modal.module === 'jenis-iuran' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Jenis Iuran</label>
                        <input name="name" defaultValue={modal.item?.name} required placeholder="Contoh: Iuran Keamanan" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deskripsi</label>
                        <textarea name="description" defaultValue={modal.item?.description} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nominal Default (Rp)</label>
                          <input name="default_amount" type="number" defaultValue={modal.item?.default_amount || 0} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Urutan</label>
                          <input name="display_order" type="number" defaultValue={modal.item?.display_order || 0} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <input type="checkbox" name="is_active" id="is_active_i" defaultChecked={modal.item ? modal.item.is_active : true} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                       <label htmlFor="is_active_i" className="text-xs font-black text-slate-600 uppercase tracking-tighter">Iuran Aktif</label>
                    </div>
                   </>
                )}

                {/* Iuran Period / Terbitkan Tagihan Form */}
                {modal.module === 'iuran-period' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pilih Jenis Iuran</label>
                        <select name="iuran_type_id" defaultValue={activeIuranType} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                           {iuranTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judul Tagihan</label>
                        <input name="title" required placeholder="Contoh: Iuran Keamanan Januari 2025" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bulan</label>
                           <select name="month" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tahun</label>
                           <input name="year" type="number" defaultValue={new Date().getFullYear()} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nominal (Rp)</label>
                          <input name="amount" type="number" defaultValue={iuranTypes.find(t => t.id === activeIuranType)?.default_amount || 0} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Batas Waktu</label>
                          <input name="due_date" type="date" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                       </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" name="generate_payments" id="gen_p_m" defaultChecked className="h-5 w-5 text-emerald-600 rounded-lg border-emerald-300 focus:ring-emerald-500" />
                          <label htmlFor="gen_p_m" className="text-xs font-black text-emerald-800 uppercase tracking-tighter leading-tight">Buat tagihan otomatis untuk semua warga berstatus 'Aktif'</label>
                        </div>
                    </div>
                   </>
                )}

                {/* Laporan Status Update Form */}
                {modal.module === 'laporan' && (
                   <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Laporan</label>
                        <select name="status" defaultValue={modal.item?.status} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                           <option value="Open">Open</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option><option value="Ditolak">Ditolak</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catatan Admin / Tindak Lanjut</label>
                        <textarea name="admin_notes" defaultValue={modal.item?.admin_notes} rows={4} placeholder="Tuliskan perkembangan penanganan laporan..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                   </>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <Button variant="ghost" type="button" onClick={closeModal} className="flex-1 rounded-xl font-bold text-slate-500">Batal</Button>
                  <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-emerald-600 shadow-lg shadow-emerald-100 rounded-xl font-bold">
                    {modal.mode === 'create' ? 'Simpan Data' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* Modal Delete Confirmation */}
          {modal.mode === 'delete' && (
            <ConfirmDialog 
              isOpen={true} 
              onClose={closeModal} 
              onConfirm={confirmDelete}
              isLoading={isSubmitting}
              title={`Hapus ${modal.module.replace('-', ' ').toUpperCase()}`}
              message={`Apakah Anda yakin ingin menghapus data "${modal.item.name || modal.item.title || modal.item.date}"? Tindakan ini tidak dapat dibatalkan.`}
            />
          )}

          {/* Modal Generate Ronda (Special) */}
          {modal.mode === 'generate' && modal.module === 'ronda' && (
            <Modal isOpen={true} onClose={closeModal} title="Auto-Generate Jadwal Ronda" description="Sistem akan merotasi warga aktif secara otomatis untuk mengisi jadwal keamanan harian.">
               <form onSubmit={(e) => handleAction(generateRondaSchedule, e)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal Mulai</label>
                        <input name="start_date" type="date" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal Selesai</label>
                        <input name="end_date" type="date" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu Ronda</label>
                        <input name="time" type="time" defaultValue="22:00" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Petugas per Hari</label>
                        <input name="residents_per_day" type="number" defaultValue="4" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Area / Blok Patroli</label>
                     <input name="area" defaultValue="Lingkungan RT" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                     <p className="text-xs text-amber-700 leading-relaxed flex gap-3">
                        <AlertCircle size={18} className="shrink-0" />
                        Pilih rentang tanggal yang belum ada jadwal rondanya untuk menghindari duplikasi data.
                     </p>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <Button variant="ghost" type="button" onClick={closeModal} className="flex-1 rounded-xl font-bold">Batal</Button>
                    <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-slate-900 text-white rounded-xl shadow-lg font-bold">Generate Sekarang</Button>
                  </div>
               </form>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
