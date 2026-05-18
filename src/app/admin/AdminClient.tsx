"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  ArrowRight
} from "lucide-react";
import { 
  createResident, 
  deleteData, 
  createIuranPeriod, 
  createAgenda, 
  createAnnouncement, 
  createEmergencyContact,
  createGotongRoyong,
  updateReportStatus,
  updateHousingProfile,
  verifyPayment,
  rejectPayment
} from "./actions";

type AdminTab = "overview" | "warga" | "iuran" | "agenda" | "gotong-royong" | "pengumuman" | "laporan" | "kontak" | "profil";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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
  const [adminNote, setAdminNote] = useState("");

  const getPayment = (residentId: string, month: string, year: number) => {
    return iuranPayments.find(p => 
      p.resident_id === residentId && 
      p.iuran_periods?.month === month && 
      p.iuran_periods?.year === year &&
      p.iuran_periods?.iuran_type_id === activeIuranType
    );
  };
  
  // Tabs navigation
  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "warga", label: "Data Warga", icon: Users },
    { id: "iuran", label: "Iuran", icon: Wallet },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "gotong-royong", label: "Gotong Royong", icon: Users },
    { id: "pengumuman", label: "Pengumuman", icon: Megaphone },
    { id: "laporan", label: "Laporan", icon: FileWarning },
    { id: "kontak", label: "Kontak Darurat", icon: Phone },
    { id: "profil", label: "Profil RT/RW", icon: Building2 },
  ];

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Warga</p>
                  <p className="text-xl font-bold text-slate-900">{warga.length}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Belum Bayar</p>
                  <p className="text-xl font-bold text-amber-600">{warga.length - iuranPayments.filter(p => p.iuran_periods?.iuran_type_id === activeIuranType && p.status === 'Lunas').length}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Perlu Verifikasi</p>
                  <p className="text-xl font-bold text-blue-600">{iuranPayments.filter(p => p.iuran_periods?.iuran_type_id === activeIuranType && p.status === 'Menunggu Verifikasi').length}</p>
               </CardContent></Card>
               <Card className="border-none shadow-sm bg-white"><CardContent className="p-4">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Sudah Lunas</p>
                  <p className="text-xl font-bold text-emerald-600">{iuranPayments.filter(p => p.iuran_periods?.iuran_type_id === activeIuranType && p.status === 'Lunas').length}</p>
               </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
               <div className="lg:col-span-3 space-y-6">
                  <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
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
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200" /> Belum</div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Verif</div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Lunas</div>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="sticky left-0 z-10 bg-slate-50 px-6 py-4 font-bold uppercase text-[10px] border-r border-slate-100 min-w-[180px]">Nama Warga</th>
                            {MONTHS.map(m => (
                              <th key={m} className="px-3 py-4 font-bold uppercase text-[10px] text-center min-w-[100px] border-r border-slate-100 last:border-0">{m.slice(0, 3)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {warga.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(resident => (
                            <tr key={resident.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-6 py-4 border-r border-slate-100">
                                <p className="font-bold text-slate-900 leading-none">{resident.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase">Blok {resident.block} / {resident.house_number}</p>
                              </td>
                              {MONTHS.map(month => {
                                const payment = getPayment(resident.id, month, selectedYear);
                                return (
                                  <td key={month} className="p-1 border-r border-slate-100 last:border-0">
                                    {payment ? (
                                      <button
                                        onClick={() => {
                                          setSelectedPayment(payment);
                                          setAdminNote(payment.notes || "");
                                        }}
                                        className={`w-full h-10 rounded-lg flex items-center justify-center transition-all ${
                                          payment.status === 'Lunas' ? 'bg-emerald-500 text-white shadow-sm' :
                                          payment.status === 'Menunggu Verifikasi' ? 'bg-blue-500 text-white animate-pulse shadow-md' :
                                          payment.status === 'Ditolak' ? 'bg-red-500 text-white' :
                                          'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                      >
                                        <span className="text-[10px] font-bold">
                                          {payment.status === 'Lunas' ? 'LUNAS' : 
                                           payment.status === 'Menunggu Verifikasi' ? 'VERIF' : 
                                           payment.status === 'Ditolak' ? 'TOLAK' : 'BELUM'}
                                        </span>
                                      </button>
                                    ) : (
                                      <div className="w-full h-10 bg-slate-50/50 rounded-lg border border-dashed border-slate-100" />
                                    )}
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
                          <select name="iuran_type_id" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500">
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
                  {selectedPayment && (
                    <Card className="border-none shadow-xl border-t-4 border-t-emerald-500 animate-in slide-in-from-right duration-300">
                      <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
                         <CardTitle className="text-sm font-bold uppercase">Detail Pembayaran</CardTitle>
                         <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Warga</p>
                           <p className="font-bold text-slate-900">{selectedPayment.resident_name}</p>
                           <p className="text-xs text-slate-500">{selectedPayment.iuran_periods?.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Nominal</p>
                              <p className="font-bold text-emerald-600">Rp {selectedPayment.amount.toLocaleString()}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                              <Badge variant={selectedPayment.status === 'Lunas' ? 'success' : selectedPayment.status === 'Ditolak' ? 'danger' : 'warning'}>
                                {selectedPayment.status}
                              </Badge>
                           </div>
                        </div>

                        {selectedPayment.payment_method && (
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</p>
                              <p className="text-xs font-bold text-slate-700">{selectedPayment.payment_method}</p>
                           </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Catatan Admin</label>
                          <textarea 
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Tambahkan catatan jika perlu..."
                            rows={2}
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-50 space-y-2">
                           {selectedPayment.status !== 'Lunas' && (
                             <Button 
                               className="w-full bg-emerald-600 shadow-md" 
                               isLoading={isSubmitting}
                               onClick={async () => {
                                 setIsSubmitting(true);
                                 const res = await verifyPayment(selectedPayment.id, adminNote);
                                 if (res.error) alert(res.error);
                                 else {
                                   setSelectedPayment(null);
                                   window.location.reload();
                                 }
                                 setIsSubmitting(false);
                               }}
                             >
                               Verifikasi Lunas
                             </Button>
                           )}
                           {selectedPayment.status === 'Menunggu Verifikasi' && (
                             <Button 
                               variant="ghost"
                               className="w-full text-red-600 hover:bg-red-50" 
                               isLoading={isSubmitting}
                               onClick={async () => {
                                 if (!adminNote) return alert("Berikan alasan penolakan di catatan admin.");
                                 setIsSubmitting(true);
                                 const res = await rejectPayment(selectedPayment.id, adminNote);
                                 if (res.error) alert(res.error);
                                 else {
                                   setSelectedPayment(null);
                                   window.location.reload();
                                 }
                                 setIsSubmitting(false);
                               }}
                             >
                               Tolak Pembayaran
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

        {/* 5. GOTONG ROYONG TAB */}
        {activeTab === "gotong-royong" && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Gotong Royong</h1>
                <p className="text-sm text-slate-500">Jadwal kerja bakti warga.</p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-2 space-y-4">
                  {gotongRoyong.map(item => (
                    <Card key={item.id} className="border-none shadow-sm">
                      <CardContent className="p-6 flex items-center justify-between gap-6">
                        <div className="space-y-1">
                           <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date} | {item.time}</p>
                        </div>
                        <button onClick={() => handleDelete('gotong_royong', item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-none shadow-sm border-2 border-emerald-50 h-fit">
                  <CardHeader><CardTitle className="text-lg">Tambah Jadwal</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => handleAction(createGotongRoyong, e)} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Judul</label>
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
                          <label className="text-xs font-bold text-slate-500 uppercase">Target Peserta</label>
                          <input name="required_participants" type="number" defaultValue="20" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       </div>
                       <Button type="submit" className="w-full bg-emerald-600" isLoading={isSubmitting}>Simpan Jadwal</Button>
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
