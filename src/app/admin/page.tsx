"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, Send, Users, Settings } from "lucide-react";
import { generateAnnouncementDraft } from "@/services/ai";

export default function AdminPanelPage() {
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDraft = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateAnnouncementDraft(topic);
      setDraft(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Pengaturan sistem dan RT RW Copilot (AI Assistant).</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              RT RW Copilot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Gunakan AI untuk membantu menulis pengumuman warga, pesan WhatsApp tagihan iuran, atau undangan gotong royong dengan bahasa yang sopan.
            </p>
            
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topik Pengumuman</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Kerja bakti hari minggu besok"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button 
                onClick={handleGenerateDraft} 
                isLoading={isGenerating}
                disabled={!topic || isGenerating}
                className="w-full"
              >
                Buat Draf Pesan
              </Button>
            </div>

            {draft && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{draft}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="primary" size="sm" className="flex items-center gap-1">
                    <Send className="w-4 h-4" /> Kirim ke Pengumuman
                  </Button>
                  <Button variant="outline" size="sm">
                    Salin
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Manajemen Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Verifikasi Akun Warga Baru (2)</Button>
                <Button variant="outline" className="w-full justify-start">Atur Hak Akses Pengurus</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                Pengaturan Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Ubah Profil Perumahan</Button>
                <Button variant="outline" className="w-full justify-start">Konfigurasi Rekening Pembayaran</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
