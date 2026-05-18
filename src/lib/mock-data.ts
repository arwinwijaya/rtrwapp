import { Agenda, GotongRoyong, Iuran, Pengumuman, Warga, Laporan, HousingProfile, EmergencyContact } from "@/types";

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
    created_by: "Admin RT",
  },
  {
    id: "a2",
    title: "Posyandu Balita",
    category: "Kesehatan",
    date: "2023-11-25",
    time: "08:00",
    location: "Posyandu Melati",
    description: "Penimbangan balita dan pemberian vitamin.",
    created_by: "Kader Posyandu",
  }
];

export const mockGotongRoyong: GotongRoyong[] = [
  {
    id: "gr1",
    title: "Pembersihan Selokan Blok A & B",
    date: "2023-11-26",
    time: "07:00",
    location: "Sepanjang Jalan Utama Blok A & B",
    description: "Membersihkan saluran air mengantisipasi musim hujan.",
    required_participants: 20,
  }
];

export const mockIuran: Iuran[] = [
  {
    id: "i1",
    resident_id: "w1",
    resident_name: "Budi Santoso",
    house_number: "12",
    block: "A1",
    month: "November",
    year: 2023,
    amount: 150000,
    status: "Lunas",
    verified_by: "Admin Keuangan",
    verified_at: "2023-11-05T10:00:00Z",
  },
  {
    id: "i2",
    resident_id: "w2",
    resident_name: "Siti Aminah",
    house_number: "15",
    block: "B2",
    month: "November",
    year: 2023,
    amount: 150000,
    status: "Menunggu Verifikasi",
    payment_proof_url: "https://example.com/proof.jpg",
  },
  {
    id: "i3",
    resident_id: "w3",
    resident_name: "Agus Pratama",
    house_number: "08",
    block: "C1",
    month: "November",
    year: 2023,
    amount: 150000,
    status: "Belum Bayar",
  }
];

export const mockPengumuman: Pengumuman[] = [
  {
    id: "p1",
    title: "Pemadaman Listrik Sementara",
    content: "Diberitahukan bahwa akan ada pemadaman listrik pada hari Minggu, 26 Nov dari jam 09.00 - 12.00 karena perbaikan gardu.",
    category: "Informasi",
    priority: "Penting",
    publish_date: "2023-11-18",
  },
  {
    id: "p2",
    title: "Himbauan Keamanan Malam Hari",
    content: "Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22:00 WIB.",
    category: "Keamanan",
    priority: "Normal",
    publish_date: "2023-11-15",
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
    phone: "118",
    category: "Medis",
    display_order: 1,
  },
  {
    id: "c2",
    name: "Polisi",
    phone: "110",
    category: "Keamanan",
    display_order: 2,
  },
  {
    id: "c3",
    name: "Pemadam Kebakaran",
    phone: "113",
    category: "Keamanan",
    display_order: 3,
  }
];
