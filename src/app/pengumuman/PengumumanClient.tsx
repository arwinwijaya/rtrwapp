"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Megaphone, Search, Calendar, Tag, AlertTriangle } from "lucide-react";

export default function PengumumanClient({ pengumuman }: { pengumuman: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = ["Semua", "Informasi", "Keamanan", "Kegiatan", "Keuangan", "Lainnya"];

  const filteredPengumuman = pengumuman.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Mendesak":
        return <Badge className="bg-red-600 text-white border-none flex gap-1 items-center px-2 py-0.5 animate-pulse"><AlertTriangle className="w-3 h-3" /> Mendesak</Badge>;
      case "Penting":
        return <Badge className="bg-amber-500 text-white border-none flex gap-1 items-center px-2 py-0.5"><AlertTriangle className="w-3 h-3" /> Penting</Badge>;
      case "Normal":
        return <Badge className="bg-slate-100 text-slate-600 border-none px-2 py-0.5">Normal</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengumuman Warga</h1>
          <p className="text-sm text-slate-500 mt-1">Informasi terbaru dan berita penting di lingkungan perumahan.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                  : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-6 items-stretch">
        {filteredPengumuman.length > 0 ? filteredPengumuman.map((item) => (
          <Card key={item.id} className="h-full border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <CardContent className="p-0 flex flex-col md:flex-row h-full">
              <div className={`w-full md:w-2 shrink-0 ${
                item.priority === "Mendesak" ? "bg-red-500" : 
                item.priority === "Penting" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-400 border-slate-200">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 font-medium gap-1.5">
                    <Calendar size={14} /> {item.publish_date}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base flex-1">
                  {item.content}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      AD
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Pengurus RT 01</span>
                  </div>
                  {item.visibility === "Warga Only" && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={10} /> Warga Only
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center">
            <div className="inline-flex p-6 rounded-3xl bg-slate-50 text-slate-300 mb-4">
              <Megaphone size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Belum ada pengumuman</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Kami akan memberitahu Anda jika ada informasi terbaru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
