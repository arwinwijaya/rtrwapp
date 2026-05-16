"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockAgendas, mockIuran, mockPengumuman, mockLaporan } from "@/lib/mock-data";
import { CalendarDays, Wallet, Megaphone, FileWarning, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const nextAgenda = mockAgendas[0];
  const pendingIuran = mockIuran.filter((i) => i.status !== "Lunas").length;
  const recentPengumuman = mockPengumuman[0];
  const openLaporan = mockLaporan.filter((l) => l.status === "Open" || l.status === "Diproses").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Selamat datang kembali, Hendra Wijaya. Berikut ringkasan lingkungan RT 01 hari ini.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Agenda Terdekat</p>
                <p className="text-lg font-bold text-slate-900">{mockAgendas.length} Kegiatan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Iuran Tertunggak</p>
                <p className="text-lg font-bold text-slate-900">{pendingIuran} Warga</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pengumuman Aktif</p>
                <p className="text-lg font-bold text-slate-900">{mockPengumuman.length} Pesan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FileWarning className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Laporan Aktif</p>
                <p className="text-lg font-bold text-slate-900">{openLaporan} Laporan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Agenda Highlight */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agenda Terdekat</CardTitle>
            <Link href="/agenda" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center">
              Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {nextAgenda ? (
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3 min-w-[70px]">
                  <span className="text-xs font-medium text-slate-500 uppercase">{new Date(nextAgenda.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-emerald-600">{new Date(nextAgenda.date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{nextAgenda.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{nextAgenda.time} WIB • {nextAgenda.location}</p>
                  <div className="mt-3">
                    <Badge variant="info">{nextAgenda.category}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Tidak ada agenda dalam waktu dekat.</p>
            )}
          </CardContent>
        </Card>

        {/* Pengumuman Highlight */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pengumuman Terbaru</CardTitle>
            <Link href="/pengumuman" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center">
              Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {recentPengumuman ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={recentPengumuman.priority === "Penting" || recentPengumuman.priority === "Mendesak" ? "danger" : "default"}>
                    {recentPengumuman.priority}
                  </Badge>
                  <span className="text-xs text-slate-500">{new Date(recentPengumuman.publish_date).toLocaleDateString('id-ID')}</span>
                </div>
                <h4 className="font-semibold text-slate-900">{recentPengumuman.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-2">{recentPengumuman.content}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada pengumuman.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Buat Pengumuman</Button>
          <Button variant="outline">Cetak Tagihan Iuran</Button>
          <Button variant="secondary">Tambah Data Warga</Button>
        </div>
      </div>
    </div>
  );
}
