"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Phone, ShieldAlert, Heart, Building2, UserCircle, ExternalLink } from "lucide-react";
import { mockKontakDarurat } from "@/lib/mock-data";

export default function KontakPage() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Medis":
        return <Heart className="w-6 h-6 text-red-500" />;
      case "Keamanan":
        return <ShieldAlert className="w-6 h-6 text-blue-500" />;
      case "Layanan":
        return <Building2 className="w-6 h-6 text-amber-500" />;
      default:
        return <UserCircle className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontak Darurat & Penting</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar nomor telepon penting yang dapat dihubungi kapan saja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-6">
        {mockKontakDarurat.map((contact) => (
          <Card key={contact.id} className="h-full flex flex-col border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors`}>
                    {getCategoryIcon(contact.category)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                    {contact.category}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{contact.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{contact.role}</p>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hubungi nomor ini untuk bantuan {contact.category.toLowerCase()} segera.
                </p>
              </div>
              
              <a 
                href={`tel:${contact.phone}`}
                className="mt-auto flex items-center justify-between p-4 bg-slate-900 text-white hover:bg-emerald-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-lg font-bold tracking-wider">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-70">
                  Panggil <ExternalLink size={12} />
                </div>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="pt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Kontak Pengurus RT 01</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  HW
                </div>
                <div>
                  <p className="font-bold text-slate-900">Hendra Wijaya</p>
                  <p className="text-xs text-slate-500 font-medium">Ketua RT 01</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-slate-200">
                Hubungi WhatsApp
              </Button>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  AS
                </div>
                <div>
                  <p className="font-bold text-slate-900">Agus Salim</p>
                  <p className="text-xs text-slate-500 font-medium">Sekretaris RT 01</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-slate-200">
                Hubungi WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mt-8">
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 mb-1 text-sm">Pesan Keamanan</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Pastikan Anda menyimpan nomor-nomor di atas pada ponsel Anda. Untuk keadaan darurat kriminalitas, Anda juga dapat menekan tombol panic button jika tersedia di area pos jaga perumahan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
