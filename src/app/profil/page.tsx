"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2, MapPin, Phone, Mail, Globe, Users } from "lucide-react";
import { mockHousingProfile } from "@/lib/mock-data";

export default function ProfilPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mockHousingProfile.name}</h1>
        <p className="text-slate-500">Profil resmi dan informasi kontak lingkungan RT 01 / RW 05.</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-32 bg-emerald-600 flex items-center justify-center">
          <Building2 className="text-white/20 w-24 h-24" />
        </div>
        <CardContent className="p-8 -mt-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">Tentang Kami</h2>
            <p className="text-slate-600 leading-relaxed text-center">
              {mockHousingProfile.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Alamat</p>
                    <p className="text-sm text-slate-700">{mockHousingProfile.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Telepon</p>
                    <p className="text-sm text-slate-700">{mockHousingProfile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-sm text-slate-700">{mockHousingProfile.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Statistik Lingkungan</h3>
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <div className="p-4 bg-slate-50 rounded-xl text-center flex flex-col justify-center h-full">
                  <p className="text-2xl font-bold text-slate-900">45</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rumah</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center flex flex-col justify-center h-full">
                  <p className="text-2xl font-bold text-slate-900">168</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Warga</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center flex flex-col justify-center h-full">
                  <p className="text-2xl font-bold text-slate-900">12</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Anak Balita</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center flex flex-col justify-center h-full">
                  <p className="text-2xl font-bold text-slate-900">8</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lansia</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
