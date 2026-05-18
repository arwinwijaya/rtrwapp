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
  Receipt
} from "lucide-react";

export default function IuranClient({ iuran, iuranTypes }: { iuran: any[], iuranTypes: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Semua");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge className="bg-emerald-100 text-emerald-700 border-none flex gap-1 items-center px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> Lunas</Badge>;
      case "Menunggu Verifikasi":
        return <Badge className="bg-amber-100 text-amber-700 border-none flex gap-1 items-center px-2 py-0.5"><Clock className="w-3 h-3" /> Verifikasi</Badge>;
      case "Belum Bayar":
        return <Badge className="bg-red-100 text-red-700 border-none flex gap-1 items-center px-2 py-0.5"><AlertCircle className="w-3 h-3" /> Belum Bayar</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredIuran = iuran.filter(item => {
    const matchesSearch = item.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "Semua" || item.iuran_period?.iuran_type?.name === selectedType;
    return matchesSearch && matchesType;
  });

  // Summary stats
  const totalBill = filteredIuran.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = filteredIuran.filter(i => i.status === "Lunas").reduce((acc, curr) => acc + curr.amount, 0);
  const pendingVerif = filteredIuran.filter(i => i.status === "Menunggu Verifikasi").length;
  const unpaidCount = filteredIuran.filter(i => i.status === "Belum Bayar").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Iuran Warga</h1>
          <p className="text-sm text-slate-500 mt-1">Lacak status pembayaran iuran keamanan, kebersihan, dan lainnya.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Receipt className="w-4 h-4 mr-2" /> Bayar Iuran
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        <Card className="h-full border-none shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tagihan</p>
            <p className="text-xl font-bold text-slate-900">Rp {totalBill.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card className="h-full border-none shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Telah Terkumpul</p>
            <p className="text-xl font-bold text-emerald-600">Rp {totalPaid.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card className="h-full border-none shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Menunggu Verifikasi</p>
            <p className="text-xl font-bold text-amber-600">{pendingVerif} Transaksi</p>
          </CardContent>
        </Card>
        <Card className="h-full border-none shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Belum Bayar</p>
            <p className="text-xl font-bold text-red-600">{unpaidCount} Warga</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedType("Semua")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === "Semua" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua Iuran
            </button>
            {iuranTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.name ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-y border-slate-100 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Warga / Blok</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Jenis Iuran</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Periode</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Nominal</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredIuran.length > 0 ? filteredIuran.map((iuran) => (
                <tr key={iuran.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900">{iuran.resident_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">Blok A1 / No 12</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 font-medium">{iuran.iuran_period?.iuran_type?.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600">{iuran.iuran_period?.month} {iuran.iuran_period?.year}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-900">Rp {iuran.amount.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="px-6 py-5">{getStatusBadge(iuran.status)}</td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-emerald-600">
                      Detail <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    Data iuran tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
