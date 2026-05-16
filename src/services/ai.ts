// This is an isolated service for the RT RW Copilot.
// Currently it uses mock generated text. It can be easily replaced by Google Gemini API.

export async function generateAnnouncementDraft(topic: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Placeholder AI response
  return `Yth. Bapak/Ibu Warga RT 01,

Sehubungan dengan rencana kegiatan "${topic}", kami mengundang kehadiran Bapak/Ibu sekalian pada waktu yang akan ditentukan kemudian.

Kami mohon partisipasi aktif dari seluruh warga demi kelancaran kegiatan tersebut. Informasi lebih detail akan kami sampaikan pada pengumuman selanjutnya.

Demikian pengumuman ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.

Hormat kami,
Pengurus RT 01`;
}

export async function summarizeReports(reports: any[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Ringkasan Laporan: Terdapat ${reports.length} laporan aktif. Mayoritas keluhan terkait infrastruktur jalan dan lampu penerangan.`;
}
