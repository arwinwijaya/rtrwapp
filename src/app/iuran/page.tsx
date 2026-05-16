"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockIuran } from "@/lib/mock-data";
import { Search, Filter, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function IuranPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge variant="success" className="flex gap-1 items-center"><CheckCircle2 className="w-3 h-3" /> Lunas</Badge>;
      case "Menunggu Verifikasi":
        return <Badge variant="warning" className="flex gap-1 items-center"><Clock className="w-3 h-3" /> Verifikasi</Badge>;
      case "Belum Bayar":
        return <Badge variant="danger" className="flex gap-1 items-center"><AlertCircle className="w-3 h-3" /> Belum Bayar</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Iuran Warga</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pembayaran iuran bulanan warga RT 01.</p>
        </div>
        <Button variant="primary">Catat Pembayaran Manual</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama warga atau blok..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Bulan
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Warga</th>
                <th className="px-6 py-3 font-medium">Blok/No</th>
                <th className="px-6 py-3 font-medium">Periode</th>
                <th className="px-6 py-3 font-medium">Jumlah</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockIuran.map((iuran) => (
                <tr key={iuran.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{iuran.resident_name}</td>
                  <td className="px-6 py-4 text-slate-600">Blok {iuran.block} No {iuran.house_number}</td>
                  <td className="px-6 py-4 text-slate-600">{iuran.month} {iuran.year}</td>
                  <td className="px-6 py-4 text-slate-600">Rp {iuran.amount.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">{getStatusBadge(iuran.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {iuran.status === "Menunggu Verifikasi" ? (
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                        Verifikasi
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">Detail</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
