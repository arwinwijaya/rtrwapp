import { 
  Agenda, 
  GotongRoyong, 
  Iuran, 
  Pengumuman, 
  Warga, 
  Laporan, 
  HousingProfile, 
  EmergencyContact,
  IuranPeriod,
  IuranType
} from "@/types";

export const mockHousingProfile: HousingProfile = {
  id: "hp1",
  name: "Perumahan Harmoni",
  description: "Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05. Tetap terhubung, aman, dan nyaman bersama.",
  address: "Jalan Melati No. 123, Jakarta Selatan",
  phone: "021-1234567",
  email: "rt01rw05.harmoni@example.com",
};

export const mockAgendas: Agenda[] = [
  {
    id: "a1",
    title: "Rapat Warga Bulanan",
    category: "Rapat",
    date: "2023-11-20",
    time: "19:30",
    location: "Balai Warga RT 01",
    description: "Rapat rutin membahas laporan keuangan dan keamanan lingkungan.",
    visibility: "Warga Only",
  },
  {
    id: "a2",
    title: "Posyandu Balita",
    category: "Kesehatan",
    date: "2023-11-25",
    time: "08:00",
    location: "Posyandu Melati",
    description: "Penimbangan balita dan pemberian vitamin.",
    visibility: "Public",
  }
];

export const mockGotongRoyong: GotongRoyong[] = [
  {
    id: "gr1",
    title: "Pembersihan Selokan Blok A & B",
    activity_type: "Gotong Royong",
    date: "2023-11-26",
    time: "07:00",
    location: "Sepanjang Jalan Utama Blok A & B",
    description: "Membersihkan saluran air mengantisipasi musim hujan.",
    required_participants: 20,
    status: "Scheduled",
  },
  {
    id: "gr2",
    title: "Kerja Bakti Saluran Air",
    activity_type: "Kerja Bakti",
    date: "2024-01-10",
    time: "08:00",
    location: "Blok C dan D",
    description: "Memperbaiki saluran air yang tersumbat.",
    required_participants: 10,
    status: "Scheduled",
  },
  {
    id: "gr3",
    title: "Ronda Malam Blok A",
    activity_type: "Ronda",
    date: "2024-01-05",
    time: "22:00",
    location: "Pos Security Blok A",
    description: "Jadwal ronda rutin untuk keamanan lingkungan.",
    required_participants: 4,
    status: "Scheduled",
  }
];

export const mockIuranTypes: IuranType[] = [
  { id: "t1", name: "Iuran Keamanan", default_amount: 100000 },
  { id: "t2", name: "Iuran Kebersihan", default_amount: 50000 },
  { id: "t3", name: "Iuran Air", default_amount: 150000 },
];

export const mockIuranPeriods: IuranPeriod[] = [
  { id: "p1", iuran_type_id: "t1", month: "November", year: 2023, amount: 100000, iuran_type: mockIuranTypes[0] },
  { id: "p2", iuran_type_id: "t2", month: "November", year: 2023, amount: 50000, iuran_type: mockIuranTypes[1] },
];

export const mockIuran: Iuran[] = [
  {
    id: "i1",
    period_id: "p1",
    resident_id: "w1",
    resident_name: "Budi Santoso",
    amount: 100000,
    status: "Lunas",
    payment_method: "Transfer",
    paid_at: "2023-11-05T09:00:00Z",
    verified_at: "2023-11-05T10:00:00Z",
    iuran_period: mockIuranPeriods[0],
  },
  {
    id: "i2",
    period_id: "p1",
    resident_id: "w2",
    resident_name: "Siti Aminah",
    amount: 100000,
    status: "Menunggu Verifikasi",
    payment_method: "Transfer",
    payment_proof_url: "https://example.com/proof.jpg",
    paid_at: "2023-11-10T14:00:00Z",
    iuran_period: mockIuranPeriods[0],
  },
  {
    id: "i3",
    period_id: "p1",
    resident_id: "w3",
    resident_name: "Agus Pratama",
    amount: 100000,
    status: "Belum Bayar",
    iuran_period: mockIuranPeriods[0],
  },
  {
    id: "i4",
    period_id: "p2",
    resident_id: "w1",
    resident_name: "Budi Santoso",
    amount: 50000,
    status: "Lunas",
    payment_method: "Tunai",
    paid_at: "2023-11-05T09:05:00Z",
    verified_at: "2023-11-05T10:00:00Z",
    iuran_period: mockIuranPeriods[1],
  }
];

export const mockPengumuman: Pengumuman[] = [
  {
    id: "p1",
    title: "Pemadaman Listrik Sementara",
    content: "Diberitahukan bahwa akan ada pemadaman listrik pada hari Minggu, 26 Nov dari jam 09.00 - 12.00 karena perbaikan gardu.",
    category: "Informasi",
    priority: "Penting",
    visibility: "Public",
    publish_date: "2023-11-18",
  },
  {
    id: "p2",
    title: "Himbauan Keamanan Malam Hari",
    content: "Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22:00 WIB.",
    category: "Keamanan",
    priority: "Normal",
    visibility: "Public",
    publish_date: "2023-11-15",
  },
  {
    id: "p3",
    title: "Laporan Keuangan RT Oktober",
    content: "Laporan keuangan RT untuk bulan Oktober sudah tersedia untuk dilihat di Balai Warga.",
    category: "Keuangan",
    priority: "Normal",
    visibility: "Warga Only",
    publish_date: "2023-11-01",
  }
];

export const mockWarga: Warga[] = [
  {
    id: "w1",
    name: "Budi Santoso",
    house_number: "12",
    block: "A1",
    phone: "081234567890",
    email: "budi@example.com",
    family_members_count: 4,
    role: "Warga",
    status: "Aktif",
  },
  {
    id: "w2",
    name: "Siti Aminah",
    house_number: "15",
    block: "B2",
    phone: "081987654321",
    email: "siti@example.com",
    family_members_count: 3,
    role: "Warga",
    status: "Aktif",
  },
  {
    id: "admin1",
    name: "Hendra Wijaya",
    house_number: "01",
    block: "A1",
    phone: "08111222333",
    email: "hendra.rt@example.com",
    family_members_count: 5,
    role: "RT Admin",
    status: "Aktif",
  }
];

export const mockLaporan: Laporan[] = [
  {
    id: "l1",
    title: "Lampu Jalan Padam",
    category: "Lampu Jalan",
    description: "Lampu penerangan di pertigaan blok B mati sejak dua hari yang lalu.",
    status: "Open",
    created_by: "Budi Santoso",
    created_at: "2023-11-19T08:30:00Z",
  },
  {
    id: "l2",
    title: "Tumpukan Sampah Belum Diambil",
    category: "Sampah",
    description: "Sampah di depan rumah blok C1 nomor 10 belum diangkut petugas.",
    status: "Diproses",
    created_by: "Agus Pratama",
    created_at: "2023-11-18T14:15:00Z",
  }
];

export const mockKontakDarurat: EmergencyContact[] = [
  {
    id: "c1",
    name: "Ambulans",
    role: "Emergency Medis",
    phone: "118",
    category: "Medis",
    is_active: true,
    display_order: 1,
  },
  {
    id: "c2",
    name: "Polisi",
    role: "Polda/Polres",
    phone: "110",
    category: "Keamanan",
    is_active: true,
    display_order: 2,
  },
  {
    id: "c3",
    name: "Pemadam Kebakaran",
    role: "Damkar",
    phone: "113",
    category: "Keamanan",
    is_active: true,
    display_order: 3,
  }
];
