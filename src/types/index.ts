export type UserRole = "Warga" | "RT Admin" | "RW Admin";
export type ResidentStatus = "Aktif" | "Pindah" | "Nonaktif";
export type AgendaCategory = "Rapat" | "Gotong Royong" | "Sosial" | "Kesehatan" | "Keagamaan" | "Lainnya";
export type IuranStatus = "Belum Bayar" | "Menunggu Verifikasi" | "Lunas" | "Ditolak";
export type ReportCategory = "Keamanan" | "Sampah" | "Lampu Jalan" | "Jalan Rusak" | "Fasilitas Umum" | "Lainnya";
export type ReportStatus = "Open" | "Diproses" | "Selesai" | "Ditolak";
export type AnnouncementPriority = "Normal" | "Penting" | "Mendesak";
export type VisibilityType = "Public" | "Warga Only";
export type GotongRoyongStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
export type AttendanceStatus = "Hadir" | "Izin" | "Alpa" | "Akan Hadir" | "Tidak Hadir" | "Belum Konfirmasi";
export type ActivityType = "Gotong Royong" | "Kerja Bakti" | "Ronda";

export interface Agenda {
  id: string;
  title: string;
  category: AgendaCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  visibility: VisibilityType;
  created_by?: string;
}

export interface GotongRoyong {
  id: string;
  title: string;
  activity_type: ActivityType;
  date: string;
  time: string;
  location: string;
  description: string;
  required_participants: number;
  status: GotongRoyongStatus;
}

export interface GotongRoyongAttendance {
  id: string;
  gotong_royong_id: string;
  resident_id: string;
  status: AttendanceStatus;
}

export interface IuranType {
  id: string;
  name: string;
  description?: string;
  default_amount?: number;
}

export interface IuranPeriod {
  id: string;
  iuran_type_id: string;
  month: string;
  year: number;
  amount: number;
  iuran_type?: IuranType;
}

export interface Iuran {
  id: string;
  period_id: string;
  resident_id: string;
  resident_name: string;
  amount: number;
  status: IuranStatus;
  payment_method?: string;
  payment_proof_url?: string;
  paid_at?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  iuran_period?: IuranPeriod;
}

export interface Pengumuman {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: AnnouncementPriority;
  visibility: VisibilityType;
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
  role: UserRole;
  status: ResidentStatus;
  profile_id?: string;
}

export interface Laporan {
  id: string;
  title: string;
  category: ReportCategory;
  description: string;
  photo_url?: string;
  status: ReportStatus;
  admin_notes?: string;
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
  role?: string;
  phone: string;
  category: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}
