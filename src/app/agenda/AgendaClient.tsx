"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Calendar, Clock, MapPin } from "lucide-react";
import { AgendaCategory } from "@/types";

export default function AgendaClient({ agendas }: { agendas: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AgendaCategory | "Semua">("Semua");

  const categories: (AgendaCategory | "Semua")[] = [
    "Semua", "Rapat", "Sosial", "Kesehatan", "Keagamaan", "Lainnya"
  ];

  const filteredAgendas = agendas.filter(agenda => {
    const matchesSearch = agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         agenda.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || agenda.category === selectedCategory;
    // For general agenda page, we might want to exclude things that have their own submenus if they are also in agendas table
    // But currently Gotong Royong is in its own table.
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda & Kegiatan</h1>
          <p className="text-sm text-slate-500 mt-1">Jadwal kegiatan rutin dan acara khusus di lingkungan RT 01.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari agenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? "bg-emerald-600 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-6">
        {filteredAgendas.length > 0 ? filteredAgendas.map((agenda) => (
          <Card key={agenda.id} className="h-full overflow-hidden border-none shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-2 bg-emerald-500" />
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] tracking-wider">
                  {agenda.category}
                </Badge>
                {agenda.visibility === "Warga Only" && (
                  <Badge className="bg-slate-100 text-slate-600 border-none text-[10px]">Warga Only</Badge>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-3">{agenda.title}</h3>
              <p className="text-sm text-slate-600 mb-6 line-clamp-3 flex-1">{agenda.description}</p>
              
              <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-50">
                <div className="flex items-center text-sm text-slate-700 gap-2">
                  <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                    <Calendar size={14} />
                  </div>
                  <span className="font-medium">{agenda.date}</span>
                </div>
                <div className="flex items-center text-sm text-slate-700 gap-2">
                  <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                    <Clock size={14} />
                  </div>
                  <span>{agenda.time} WIB</span>
                </div>
                <div className="flex items-center text-sm text-slate-700 gap-2">
                  <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                    <MapPin size={14} />
                  </div>
                  <span className="line-clamp-1">{agenda.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Agenda tidak ditemukan</h3>
            <p className="text-slate-500">Coba ubah kata kunci atau filter kategori Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
