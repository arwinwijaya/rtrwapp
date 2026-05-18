import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Bell, Users, ShieldAlert, ArrowRight } from "lucide-react";
import { getHousingProfile } from "@/lib/data/profil";
import { getAgendas } from "@/lib/data/agenda";
import { getPengumuman } from "@/lib/data/announcements";

export default async function HomePage() {
  const profile = await getHousingProfile();
  const agendas = await getAgendas();
  const pengumuman = await getPengumuman();

  // Get only public data
  const publicAgendas = agendas.filter((a: any) => a.visibility === 'public' || !a.visibility).slice(0, 3);
  const publicPengumuman = pengumuman.filter((p: any) => p.visibility === 'public' || !p.visibility).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Users className="w-6 h-6" />
            {profile.name || "RT RW App"}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>Masuk Warga / Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

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
            <Link href="/profil">
              <Button variant="secondary" size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                Profil Perumahan
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-emerald-700">
                Layanan Warga
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-6 max-w-6xl mx-auto -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/agenda">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-100 bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800">Agenda Kegiatan</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/pengumuman">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-100 bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800">Pengumuman</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/gotong-royong">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-100 bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800">Gotong Royong</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/kontak">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-100 bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800">Kontak Darurat</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Latest Info */}
      <section className="py-12 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Pengumuman Terbaru</h2>
            <Link href="/pengumuman" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {publicPengumuman.length > 0 ? publicPengumuman.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    {item.priority === "Penting" && <Badge variant="danger">Penting</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-slate-400 mt-2">{item.publish_date}</p>
                </CardContent>
              </Card>
            )) : (
              <p className="text-slate-500 text-sm">Belum ada pengumuman.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Agenda Terdekat</h2>
            <Link href="/agenda" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {publicAgendas.length > 0 ? publicAgendas.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="bg-emerald-50 text-emerald-700 rounded-lg p-3 text-center min-w-[70px] flex flex-col justify-center">
                    <span className="text-2xl font-bold block">{item.date?.split('-')[2] || '01'}</span>
                    <span className="text-xs font-medium uppercase">{item.date?.split('-')[1] ? new Date(item.date).toLocaleString('id-ID', { month: 'short' }) : 'Jan'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-600 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" /> {item.time} - {item.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-slate-500 text-sm">Belum ada agenda.</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} {profile.name || "Perumahan Harmoni"}. All rights reserved.</p>
      </footer>
    </div>
  );
}
