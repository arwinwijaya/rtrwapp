"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wallet, 
  ArrowUpRight,
  Receipt,
  XCircle,
  Ban,
  Check
} from "lucide-react";
import { confirmPayment } from "@/app/admin/actions";

export default function IuranClient({ iuran, iuranTypes }: { iuran: any[], iuranTypes: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Semua");
  const [selectedForPayment, setSelectedForPayment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge className="bg-emerald-100 text-emerald-700 border-none flex gap-1 items-center px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> Lunas</Badge>;
      case "Menunggu Verifikasi":
        return <Badge className="bg-amber-100 text-amber-700 border-none flex gap-1 items-center px-2 py-0.5"><Clock className="w-3 h-3" /> Verifikasi</Badge>;
      case "Belum Bayar":
        return <Badge className="bg-red-100 text-red-700 border-none flex gap-1 items-center px-2 py-0.5"><AlertCircle className="w-3 h-3" /> Belum Bayar</Badge>;
      case "Ditolak":
        return <Badge className="bg-slate-100 text-slate-700 border-none flex gap-1 items-center px-2 py-0.5"><Ban className="w-3 h-3" /> Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredIuran = iuran.filter(item => {
    const matchesSearch = item.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "Semua" || item.iuran_period?.iuran_type?.name === selectedType;
    return matchesSearch && matchesType;
  });

  const handleConfirmPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await confirmPayment(fd);
    if (res.error) alert(res.error);
    else {
      alert("Konfirmasi pembayaran berhasil dikirim. Menunggu verifikasi admin.");
      setSelectedForPayment(null);
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Iuran Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Lacak status pembayaran dan lakukan konfirmasi pembayaran iuran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
              <div className="flex flex-1 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari periode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-y border-slate-100 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-[10px]">Jenis Iuran</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px]">Periode</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px]">Nominal</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px]">Status</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredIuran.length > 0 ? filteredIuran.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-slate-900 font-bold">{item.iuran_period?.iuran_type?.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-600 font-medium">{item.iuran_period?.month} {item.iuran_period?.year}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-900">Rp {item.amount.toLocaleString("id-ID")}</span>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-5 text-right">
                        {item.status === 'Belum Bayar' || item.status === 'Ditolak' ? (
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 shadow-md shadow-emerald-100"
                            onClick={() => setSelectedForPayment(item)}
                          >
                            Konfirmasi Bayar
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            Detail
                          </Button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                        Tidak ada data tagihan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
           {selectedForPayment ? (
             <Card className="border-none shadow-xl border-t-4 border-t-emerald-600 animate-in slide-in-from-right duration-300 sticky top-24">
                <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Konfirmasi Pembayaran</CardTitle>
                  <button onClick={() => setSelectedForPayment(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleConfirmPayment} className="space-y-4">
                    <input type="hidden" name="id" value={selectedForPayment.id} />
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tagihan</p>
                       <p className="font-bold text-slate-900 text-sm">{selectedForPayment.iuran_period?.iuran_type?.name}</p>
                       <p className="text-xs text-slate-500 font-bold">{selectedForPayment.iuran_period?.month} {selectedForPayment.iuran_period?.year}</p>
                       <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-xs text-slate-500">Total Bayar:</span>
                          <span className="font-bold text-emerald-600">Rp {selectedForPayment.amount.toLocaleString("id-ID")}</span>
                       </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metode Pembayaran</label>
                      <select name="payment_method" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm">
                         <option value="Transfer Bank">Transfer Bank</option>
                         <option value="E-Wallet">E-Wallet (OVO/Gopay/Dana)</option>
                         <option value="Tunai ke Bendahara">Tunai ke Bendahara</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL Bukti Bayar / Referensi</label>
                      <input 
                        name="payment_proof_url" 
                        required 
                        placeholder="Link Google Drive / Imgur / ID Transaksi"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      />
                      <p className="text-[9px] text-slate-400 italic">Untuk sementara, masukkan link bukti transfer Anda.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catatan Warga</label>
                      <textarea 
                        name="notes" 
                        rows={2}
                        placeholder="Tambahkan pesan jika ada..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 shadow-lg shadow-emerald-100 font-bold py-6 rounded-xl" isLoading={isSubmitting}>
                      Kirim Konfirmasi ✅
                    </Button>
                  </form>
                </CardContent>
             </Card>
           ) : (
             <Card className="border-none shadow-sm bg-emerald-50 border-2 border-emerald-100 overflow-hidden sticky top-24">
                <CardContent className="p-8 text-center space-y-4">
                   <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-emerald-600">
                      <Wallet size={32} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">Pembayaran Iuran</h3>
                      <p className="text-xs text-slate-500 mt-2">Pilih tagihan yang belum lunas di tabel untuk melakukan konfirmasi pembayaran.</p>
                   </div>
                   <div className="pt-4 grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                         <p className="text-[9px] font-bold text-slate-400 uppercase">Lunas</p>
                         <p className="font-bold text-emerald-600">{iuran.filter(i => i.status === 'Lunas').length}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl text-center shadow-sm">
                         <p className="text-[9px] font-bold text-slate-400 uppercase">Belum</p>
                         <p className="font-bold text-red-600">{iuran.filter(i => i.status === 'Belum Bayar' || i.status === 'Ditolak').length}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
