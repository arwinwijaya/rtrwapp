import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Bell, Users, ShieldAlert, ArrowRight, Clock, MapPin } from "lucide-react";
import { getHousingProfile } from "@/lib/data/profil";
import { getAgendas } from "@/lib/data/agenda";
import { getPengumuman } from "@/lib/data/announcements";

export default async function HomePage() {
  const profile = await getHousingProfile();
  const agendas = await getAgendas();
  const pengumuman = await getPengumuman();

  // Get only public data
  const publicAgendas = agendas.filter((a: any) => a.visibility === 'Public' || !a.visibility).slice(0, 3);
  const publicPengumuman = pengumuman.filter((p: any) => p.visibility === 'Public' || !p.visibility).slice(0, 3);

  return (
    <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero Section */}
      <section className="bg-emerald-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Selamat Datang di Portal {profile.name || "Perumahan Harmoni"}
          </h1>
          <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto">
            {profile.description || "Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05. Tetap terhubung, aman, dan nyaman bersama."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold">
                Dashboard Warga
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-emerald-700 font-bold">
                Masuk / Layanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-6 max-w-7xl mx-auto -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/agenda">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm bg-white group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">Agenda Warga</h3>
                <p className="text-xs text-slate-500 line-clamp-2">Rapat, sosial, dan kegiatan rutin warga.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/pengumuman">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm bg-white group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">Pengumuman</h3>
                <p className="text-xs text-slate-500 line-clamp-2">Informasi terbaru dari pengurus RT/RW.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/agenda/gotong-royong">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm bg-white group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">Kerja Bakti</h3>
                <p className="text-xs text-slate-500 line-clamp-2">Gotong royong dan kebersihan lingkungan.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/agenda/ronda">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm bg-white group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">Keamanan</h3>
                <p className="text-xs text-slate-500 line-clamp-2">Jadwal ronda dan kontak darurat.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Latest Info */}
      <section className="py-12 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" /> Pengumuman Terbaru
            </h2>
            <Link href="/pengumuman" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center uppercase tracking-wider">
              Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {publicPengumuman.length > 0 ? publicPengumuman.map((item: any) => (
              <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    {item.priority === "Penting" && <Badge className="bg-amber-100 text-amber-700 border-none text-[10px]">PENTING</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{item.content}</p>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
                    <Calendar size={12} /> {item.publish_date}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-slate-400 text-sm py-8 text-center bg-white rounded-xl">Belum ada pengumuman baru.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-500" /> Agenda Terdekat
            </h2>
            <Link href="/agenda" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center uppercase tracking-wider">
              Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {publicAgendas.length > 0 ? publicAgendas.map((item: any) => (
              <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-6">
                  <div className="bg-emerald-50 text-emerald-700 rounded-2xl p-4 text-center min-w-[80px] flex flex-col justify-center border border-emerald-100">
                    <span className="text-3xl font-bold block leading-none">{item.date?.split('-')[2] || '01'}</span>
                    <span className="text-[10px] font-bold uppercase mt-1">{item.date?.split('-')[1] ? new Date(item.date).toLocaleString('id-ID', { month: 'short' }) : 'Jan'}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <p className="text-xs text-slate-500 flex items-center font-medium">
                        <Clock className="w-3 h-3 mr-1.5 text-slate-400" /> {item.time} WIB
                      </p>
                      <p className="text-xs text-slate-500 flex items-center font-medium">
                        <MapPin className="w-3 h-3 mr-1.5 text-slate-400" /> {item.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-slate-400 text-sm py-8 text-center bg-white rounded-xl">Belum ada agenda terdekat.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
