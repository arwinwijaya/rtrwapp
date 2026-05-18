"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Hammer,
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GotongRoyongClientProps {
  gotongRoyong: any[];
  title: string;
  subtitle: string;
}

export default function GotongRoyongClient({ gotongRoyong, title, subtitle }: GotongRoyongClientProps) {
  const [attendance, setAttendance] = useState<string>("Belum Konfirmasi");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, [supabase]);

  const handleConfirm = (status: string) => {
    setAttendance(status);
    // In a real app, update Supabase here
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-700 border-none uppercase text-[10px]">Terjadwal</Badge>;
      case "In Progress":
        return <Badge className="bg-amber-100 text-amber-700 border-none uppercase text-[10px]">Berlangsung</Badge>;
      case "Completed":
        return <Badge className="bg-emerald-100 text-emerald-700 border-none uppercase text-[10px]">Selesai</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Kerja Bakti": return <Hammer size={20} />;
      case "Ronda": return <ShieldAlert size={20} />;
      default: return <Users size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      {gotongRoyong.length > 0 ? gotongRoyong.map((item) => (
        <div key={item.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-2 bg-emerald-500" />
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  {getStatusBadge(item.status)}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  {item.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">TANGGAL</p>
                      <p className="text-sm font-bold text-slate-800">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">WAKTU</p>
                      <p className="text-sm font-bold text-slate-800">{item.time} WIB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">LOKASI</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Catatan Tambahan</h3>
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm text-slate-600">
                      <ChevronRight size={18} className="text-emerald-500 shrink-0" />
                      Diharapkan datang tepat waktu sesuai jadwal yang ditentukan.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                      <ChevronRight size={18} className="text-emerald-500 shrink-0" />
                      Membawa perlengkapan jika diperlukan untuk kegiatan ini.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                      <ChevronRight size={18} className="text-emerald-500 shrink-0" />
                      Titik kumpul akan diinformasikan kembali jika ada perubahan.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Side Info & Action */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-emerald-600 text-white">
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-4xl font-bold">{item.required_participants}</span>
                  <span className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Target Peserta</span>
                </div>
                
                <div className="pt-6 border-t border-emerald-500/30">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    {getActivityIcon(item.activity_type)} Kehadiran Anda
                  </h4>
                  
                  {user ? (
                    <div className="space-y-3">
                      <p className="text-xs text-emerald-50 mb-4 leading-relaxed">
                        Konfirmasi kehadiran membantu kami menyiapkan segala kebutuhan kegiatan.
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          onClick={() => handleConfirm("Akan Hadir")}
                          className={`w-full justify-start ${attendance === "Akan Hadir" ? "bg-white text-emerald-700" : "bg-emerald-700 text-white border border-emerald-500"}`}
                          variant={attendance === "Akan Hadir" ? "secondary" : "outline"}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Akan Hadir
                        </Button>
                        <Button 
                          onClick={() => handleConfirm("Tidak Hadir")}
                          className={`w-full justify-start ${attendance === "Tidak Hadir" ? "bg-white text-emerald-700" : "bg-emerald-700 text-white border border-emerald-500"}`}
                          variant={attendance === "Tidak Hadir" ? "secondary" : "outline"}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Tidak Hadir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-700/50 rounded-lg border border-emerald-500/30">
                      <p className="text-xs text-emerald-50 mb-4 leading-relaxed flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Silakan masuk untuk memberikan konfirmasi kehadiran Anda.
                      </p>
                      <Button variant="secondary" size="sm" className="w-full bg-white text-emerald-700">Masuk Sekarang</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Daftar Warga (Akan Hadir)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex -space-x-2 overflow-hidden mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      W{i}
                    </div>
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-500">
                    +12
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800">17 warga</span> sudah memberikan konfirmasi akan hadir dalam kegiatan ini.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )) : (
        <Card><CardContent className="p-20 text-center text-slate-500">Belum ada jadwal {title.toLowerCase()}.</CardContent></Card>
      )}
    </div>
  );
}
