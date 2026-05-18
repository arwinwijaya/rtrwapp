export interface Agenda {
  id: string;
  title: string;
  category: "Rapat" | "Gotong Royong" | "Sosial" | "Kesehatan" | "Keagamaan" | "Lainnya";
  date: string;
  time: string;
  location: string;
  description: string;
  created_by: string;
}

export interface GotongRoyong {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  required_participants: number;
}

export interface Iuran {
  id: string;
  resident_id: string;
  resident_name: string;
  house_number: string;
  block: string;
  month: string;
  year: number;
  amount: number;
  status: "Belum Bayar" | "Menunggu Verifikasi" | "Lunas" | "Ditolak";
  payment_proof_url?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
}

export interface Pengumuman {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: "Normal" | "Penting" | "Mendesak";
  publish_date: string;
}

export interface Warga {
  id: string;
  name: string;
  house_number: string;
  block: string;
  phone: string;
  email: string;
  family_members_count: number;
  role: "Warga" | "RT Admin" | "RW Admin";
  status: "Aktif" | "Pindah" | "Nonaktif";
}

export interface Laporan {
  id: string;
  title: string;
  category: "Keamanan" | "Sampah" | "Lampu Jalan" | "Jalan Rusak" | "Fasilitas Umum" | "Lainnya";
  description: string;
  photo_url?: string;
  status: "Open" | "Diproses" | "Selesai" | "Ditolak";
  created_by: string;
  created_at: string;
}

export interface HousingProfile {
  id: string;
  name: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  display_order?: number;
}
