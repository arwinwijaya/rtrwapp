"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Calendar, 
  Users, 
  Wallet, 
  Megaphone, 
  FileWarning, 
  ArrowRight,
  Clock,
  MapPin,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { 
  mockAgendas, 
  mockPengumuman, 
  mockIuran, 
  mockGotongRoyong, 
  mockLaporan,
  mockKontakDarurat
} from "@/lib/mock-data";

export default function DashboardPage() {
  // Summary counts (in a real app, these would be calculated from real data)
  const stats = [
    { name: "Agenda Terdekat", value: "2", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Gotong Royong", value: "1", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Iuran Belum Bayar", value: "1", icon: Wallet, color: "text-amber-600", bg: "bg-amber-100" },
    { name: "Laporan Aktif", value: "2", icon: FileWarning, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Warga</h1>
        <p className="text-sm text-slate-500 mt-1">Selamat datang kembali! Berikut ringkasan informasi lingkungan Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {stats.map((stat) => (
          <Card key={stat.name} className="h-full border-none shadow-sm">
            <CardContent className="p-6 flex items-center h-full">
              <div className="flex items-center gap-4 w-full">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Agenda */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Agenda Terdekat
              </h2>
              <Link href="/agenda" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {mockAgendas.slice(0, 2).map((agenda) => (
                <Card key={agenda.id} className="h-full hover:shadow-md transition-all flex flex-col border-none shadow-sm">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        {agenda.category}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{agenda.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{agenda.title}</h3>
                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <Clock size={14} className="text-slate-400" /> {agenda.time} WIB
                      </div>
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {agenda.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Gotong Royong */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Gotong Royong Berikutnya
              </h2>
              <Link href="/gotong-royong" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                Detail Kegiatan <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {mockGotongRoyong.length > 0 ? (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">{mockGotongRoyong[0].title}</h3>
                      <p className="text-sm text-slate-600 max-w-lg">{mockGotongRoyong[0].description}</p>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center text-sm text-slate-600 gap-1.5">
                          <Calendar size={16} className="text-slate-400" /> {mockGotongRoyong[0].date}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 gap-1.5">
                          <Clock size={16} className="text-slate-400" /> {mockGotongRoyong[0].time} WIB
                        </div>
                        <div className="flex items-center text-sm text-slate-600 gap-1.5">
                          <MapPin size={16} className="text-slate-400" /> {mockGotongRoyong[0].location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl min-w-[140px]">
                      <span className="text-2xl font-bold text-slate-900">{mockGotongRoyong[0].required_participants}</span>
                      <span className="text-xs text-slate-500 text-center font-medium">Target Peserta</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="p-8 text-center text-slate-500">Belum ada jadwal gotong royong.</CardContent></Card>
            )}
          </section>
        </div>

        {/* Sidebar area (1/3) */}
        <div className="space-y-8">
          {/* Announcements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" /> Pengumuman
              </h2>
            </div>
            <div className="space-y-3">
              {mockPengumuman.slice(0, 3).map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</h4>
                    {item.priority === "Penting" && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.content}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">{item.publish_date}</span>
                </div>
              ))}
              <Link href="/pengumuman" className="block text-center p-2 text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider">
                Lihat Semua Pengumuman
              </Link>
            </div>
          </section>

          {/* Quick Emergency */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Kontak Darurat
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {mockKontakDarurat.slice(0, 2).map((contact) => (
                <a 
                  key={contact.id} 
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-red-900">{contact.name}</p>
                    <p className="text-xs text-red-700">{contact.role}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200">{contact.phone}</span>
                </a>
              ))}
              <Link href="/kontak" className="block text-center p-2 text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider">
                Semua Kontak Penting
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
