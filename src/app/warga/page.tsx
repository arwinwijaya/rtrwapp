"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Users, Phone, Mail, Home } from "lucide-react";
import { mockWarga } from "@/lib/mock-data";

export default function WargaPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWarga = mockWarga.filter(warga => 
    warga.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.house_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Warga RT 01</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar lengkap warga yang terdaftar di lingkungan RT 01.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, blok, atau nomor rumah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 transition-all"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Warga</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Alamat</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Kontak</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-center">Anggota Keluarga</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredWarga.map((warga) => (
                <tr key={warga.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {warga.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{warga.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{warga.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Home size={14} className="text-slate-300" />
                      <span>Blok {warga.block} / No {warga.house_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={12} className="text-slate-300" />
                        <span>{warga.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={12} className="text-slate-300" />
                        <span className="text-xs">{warga.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-slate-900 font-bold border border-slate-100">
                      {warga.family_members_count}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={warga.status === "Aktif" ? "success" : "default"}>
                      {warga.status}
                    </Badge>
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
