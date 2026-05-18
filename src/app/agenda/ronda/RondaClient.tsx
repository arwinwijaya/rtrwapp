"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, Calendar, Clock, MapPin, User } from "lucide-react";

export default function RondaClient({ schedules }: { schedules: any[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jadwal Ronda Harian</h1>
        <p className="text-sm text-slate-500 mt-1">Sistem keamanan lingkungan warga terpadu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.length > 0 ? schedules.map((schedule) => (
          <Card key={schedule.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="h-2 bg-emerald-600" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={schedule.status === 'Completed' ? 'success' : 'warning'}>{schedule.status}</Badge>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> {schedule.date}
                </div>
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="text-emerald-600" size={18} /> {schedule.area}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock size={14} className="text-slate-400" /> {schedule.time} WIB
              </div>
              
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Petugas Ronda</p>
                <div className="space-y-2">
                  {schedule.assignments?.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        <User size={14} className="text-slate-300" /> {a.resident?.name}
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase">{a.attendance_status}</Badge>
                    </div>
                  ))}
                  {(!schedule.assignments || schedule.assignments.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-2">Belum ada petugas.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-medium">Belum ada jadwal ronda tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
