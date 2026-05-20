"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  FileWarning, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  MessageSquare,
  Image as ImageIcon,
  LogIn
} from "lucide-react";

export default function LaporanClient({ laporan }: { laporan: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const isLoggedIn = false; // Mock

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-blue-100 text-blue-700 border-none flex gap-1 items-center px-2 py-0.5 font-bold text-[10px]"><Clock className="w-3 h-3" /> OPEN</Badge>;
      case "Diproses":
        return <Badge className="bg-amber-100 text-amber-700 border-none flex gap-1 items-center px-2 py-0.5 font-bold text-[10px]"><AlertCircle className="w-3 h-3" /> DIPROSES</Badge>;
      case "Selesai":
        return <Badge className="bg-emerald-100 text-emerald-700 border-none flex gap-1 items-center px-2 py-0.5 font-bold text-[10px]"><CheckCircle2 className="w-3 h-3" /> SELESAI</Badge>;
      case "Ditolak":
        return <Badge className="bg-red-100 text-red-700 border-none flex gap-1 items-center px-2 py-0.5 font-bold text-[10px]"><XCircle className="w-3 h-3" /> DITOLAK</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Warga</h1>
          <p className="text-sm text-slate-500 mt-1">Sampaikan keluhan, saran, atau laporan kejadian di lingkungan Anda.</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? "Batal" : <><Plus className="w-4 h-4 mr-2" /> Buat Laporan</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-emerald-100 shadow-xl shadow-emerald-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 px-6 py-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" /> Form Laporan Baru
            </h3>
          </div>
          <CardContent className="p-8">
            {isLoggedIn ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Judul Laporan</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Lampu Jalan Padam"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Kategori</label>
                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 appearance-none">
                      <option>Keamanan</option>
                      <option>Sampah</option>
                      <option>Lampu Jalan</option>
                      <option>Jalan Rusak</option>
                      <option>Fasilitas Umum</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Deskripsi Kejadian / Keluhan</label>
                  <textarea 
                    rows={4}
                    placeholder="Jelaskan detail laporan Anda secara lengkap..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Foto Pendukung (Opsional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer group">
                    <div className="inline-flex p-3 rounded-full bg-slate-50 text-slate-400 mb-3 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Klik atau seret foto ke sini untuk mengunggah</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Format JPG, PNG max 5MB</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Batal</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">Kirim Laporan</Button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-amber-50 text-amber-500">
                  <LogIn size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Login Diperlukan</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
                  Anda harus masuk sebagai warga terlebih dahulu untuk dapat menyampaikan laporan atau keluhan.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Masuk Sekarang</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-400" /> Daftar Laporan Terbaru
        </h3>
        
        <div className="grid grid-cols-1 gap-4 items-stretch">
          {laporan.length > 0 ? laporan.map((laporan) => (
            <Card key={laporan.id} className="h-full border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 h-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(laporan.status)}
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400 border-slate-100">
                      {laporan.category}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{laporan.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {laporan.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={14} /> {laporan.created_at}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">W</div>
                      Oleh: {laporan.created_by}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 mt-auto md:mt-0">
                  <Button variant="outline" size="sm" className="w-full md:w-auto text-xs font-bold border-slate-200 text-slate-600">
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card><CardContent className="p-20 text-center text-slate-500">Belum ada laporan warga.</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
