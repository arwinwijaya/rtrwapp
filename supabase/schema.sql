-- 1. DROP existing tables and types for a clean setup
DROP TRIGGER IF EXISTS update_housing_profiles_updated_at ON housing_profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_residents_updated_at ON residents;
DROP TRIGGER IF EXISTS update_agendas_updated_at ON agendas;
DROP TRIGGER IF EXISTS update_gotong_royong_updated_at ON gotong_royong;
DROP TRIGGER IF EXISTS update_gotong_royong_attendance_updated_at ON gotong_royong_attendance;
DROP TRIGGER IF EXISTS update_iuran_types_updated_at ON iuran_types;
DROP TRIGGER IF EXISTS update_iuran_periods_updated_at ON iuran_periods;
DROP TRIGGER IF EXISTS update_iuran_payments_updated_at ON iuran_payments;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;

DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS iuran_payments CASCADE;
DROP TABLE IF EXISTS iuran_periods CASCADE;
DROP TABLE IF EXISTS iuran_types CASCADE;
DROP TABLE IF EXISTS gotong_royong_attendance CASCADE;
DROP TABLE IF EXISTS gotong_royong CASCADE;
DROP TABLE IF EXISTS agendas CASCADE;
DROP TABLE IF EXISTS residents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS housing_profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS resident_status CASCADE;
DROP TYPE IF EXISTS agenda_category CASCADE;
DROP TYPE IF EXISTS iuran_status CASCADE;
DROP TYPE IF EXISTS report_category CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS announcement_priority CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS visibility_type CASCADE;
DROP TYPE IF EXISTS gotong_royong_status CASCADE;

-- 2. Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create Enums
CREATE TYPE user_role AS ENUM ('Warga', 'RT Admin', 'RW Admin');
CREATE TYPE resident_status AS ENUM ('Aktif', 'Pindah', 'Nonaktif');
CREATE TYPE agenda_category AS ENUM ('Rapat', 'Gotong Royong', 'Sosial', 'Kesehatan', 'Keagamaan', 'Lainnya');
CREATE TYPE iuran_status AS ENUM ('Belum Bayar', 'Menunggu Verifikasi', 'Lunas', 'Ditolak');
CREATE TYPE report_category AS ENUM ('Keamanan', 'Sampah', 'Lampu Jalan', 'Jalan Rusak', 'Fasilitas Umum', 'Lainnya');
CREATE TYPE report_status AS ENUM ('Open', 'Diproses', 'Selesai', 'Ditolak');
CREATE TYPE announcement_priority AS ENUM ('Normal', 'Penting', 'Mendesak');
CREATE TYPE attendance_status AS ENUM ('Hadir', 'Izin', 'Alpa', 'Akan Hadir', 'Tidak Hadir', 'Belum Konfirmasi');
CREATE TYPE visibility_type AS ENUM ('Public', 'Warga Only');
CREATE TYPE gotong_royong_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');

-- 4. Utility function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create Tables
CREATE TABLE housing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role user_role DEFAULT 'Warga',
    status resident_status DEFAULT 'Aktif',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    house_number TEXT,
    block TEXT,
    phone TEXT,
    email TEXT,
    family_members_count INTEGER DEFAULT 1,
    role user_role DEFAULT 'Warga',
    status resident_status DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category agenda_category DEFAULT 'Lainnya',
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    description TEXT,
    visibility visibility_type DEFAULT 'Public',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gotong_royong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    description TEXT,
    required_participants INTEGER,
    status gotong_royong_status DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gotong_royong_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gotong_royong_id UUID REFERENCES gotong_royong(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'Belum Konfirmasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gotong_royong_id, resident_id)
);

CREATE TABLE iuran_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Iuran Air, Iuran Keamanan, etc.
    description TEXT,
    default_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE iuran_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iuran_type_id UUID REFERENCES iuran_types(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE iuran_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES iuran_periods(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    resident_name TEXT,
    amount NUMERIC NOT NULL,
    status iuran_status DEFAULT 'Belum Bayar',
    payment_method TEXT, -- Transfer, Tunai
    payment_proof_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    priority announcement_priority DEFAULT 'Normal',
    visibility visibility_type DEFAULT 'Public',
    publish_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category report_category,
    description TEXT,
    photo_url TEXT,
    status report_status DEFAULT 'Open',
    admin_notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    phone TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Explicitly create triggers
CREATE TRIGGER update_housing_profiles_updated_at BEFORE UPDATE ON housing_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agendas_updated_at BEFORE UPDATE ON agendas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gotong_royong_updated_at BEFORE UPDATE ON gotong_royong FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gotong_royong_attendance_updated_at BEFORE UPDATE ON gotong_royong_attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_iuran_types_updated_at BEFORE UPDATE ON iuran_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_iuran_periods_updated_at BEFORE UPDATE ON iuran_periods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_iuran_payments_updated_at BEFORE UPDATE ON iuran_payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Enable RLS
ALTER TABLE housing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gotong_royong ENABLE ROW LEVEL SECURITY;
ALTER TABLE gotong_royong_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 8. RLS helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role IN ('RT Admin', 'RW Admin'))
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS Policies
CREATE POLICY "Public can read housing profile" ON housing_profiles FOR SELECT USING (true);
CREATE POLICY "Admin manage housing profile" ON housing_profiles FOR ALL USING (is_admin());

CREATE POLICY "User read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin manage all profiles" ON profiles FOR ALL USING (is_admin());

CREATE POLICY "User read own resident data" ON residents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admin manage all residents" ON residents FOR ALL USING (is_admin());

CREATE POLICY "Everyone can read public agendas" ON agendas FOR SELECT USING (visibility = 'Public' OR auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage agendas" ON agendas FOR ALL USING (is_admin());

CREATE POLICY "Public read gotong_royong" ON gotong_royong FOR SELECT USING (true);
CREATE POLICY "Admin manage gotong_royong" ON gotong_royong FOR ALL USING (is_admin());

CREATE POLICY "Logged in read attendance" ON gotong_royong_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "User update own attendance" ON gotong_royong_attendance FOR ALL USING (
    resident_id IN (SELECT id FROM residents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admin manage attendance" ON gotong_royong_attendance FOR ALL USING (is_admin());

CREATE POLICY "Public read iuran_types" ON iuran_types FOR SELECT USING (true);
CREATE POLICY "Admin manage iuran_types" ON iuran_types FOR ALL USING (is_admin());

CREATE POLICY "Public read iuran_periods" ON iuran_periods FOR SELECT USING (true);
CREATE POLICY "Admin manage iuran_periods" ON iuran_periods FOR ALL USING (is_admin());

CREATE POLICY "User read own iuran payments" ON iuran_payments FOR SELECT USING (
    resident_id IN (SELECT id FROM residents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admin manage iuran payments" ON iuran_payments FOR ALL USING (is_admin());

CREATE POLICY "Everyone can read public announcements" ON announcements FOR SELECT USING (visibility = 'Public' OR auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage announcements" ON announcements FOR ALL USING (is_admin());

CREATE POLICY "User manage own reports" ON reports FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Admin manage reports" ON reports FOR ALL USING (is_admin());

CREATE POLICY "Public read emergency contacts" ON emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Admin manage emergency contacts" ON emergency_contacts FOR ALL USING (is_admin());

-- 10. Seed Data
INSERT INTO housing_profiles (name, description, address, phone, email)
VALUES ('Perumahan Harmoni', 'Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05.', 'Jalan Melati No. 123, Jakarta Selatan', '021-1234567', 'rt01rw05.harmoni@example.com');

-- Iuran Types
INSERT INTO iuran_types (id, name, description, default_amount)
VALUES 
('t1111111-1111-1111-1111-111111111111', 'Iuran Keamanan', 'Biaya satpam dan penjagaan lingkungan', 100000),
('t1111111-1111-1111-1111-222222222222', 'Iuran Kebersihan', 'Biaya angkut sampah dan kebersihan jalan', 50000),
('t1111111-1111-1111-1111-333333333333', 'Iuran Air', 'Biaya distribusi air bersih mandiri', 150000);

-- Residents
INSERT INTO residents (id, name, house_number, block, phone, email, family_members_count, role)
VALUES 
('d7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', '081234567890', 'budi@example.com', 4, 'Warga'),
('d7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', '15', 'B2', '081987654321', 'siti@example.com', 3, 'Warga'),
('d7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', '081222333444', 'agus@example.com', 2, 'Warga');

-- Agendas
INSERT INTO agendas (title, category, date, time, location, description, visibility)
VALUES 
('Rapat Warga Bulanan', 'Rapat', '2023-11-20', '19:30:00', 'Balai Warga RT 01', 'Rapat rutin membahas laporan keuangan dan keamanan lingkungan.', 'Warga Only'),
('Posyandu Balita', 'Kesehatan', '2023-11-25', '08:00:00', 'Posyandu Melati', 'Penimbangan balita dan pemberian vitamin.', 'Public');

-- Gotong Royong
INSERT INTO gotong_royong (title, date, time, location, description, required_participants)
VALUES ('Pembersihan Selokan Blok A & B', '2023-11-26', '07:00:00', 'Sepanjang Jalan Utama Blok A & B', 'Membersihkan saluran air mengantisipasi musim hujan.', 20);

-- Iuran Periods
INSERT INTO iuran_periods (id, iuran_type_id, month, year, amount)
VALUES 
('p1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 'November', 2023, 100000),
('p1111111-1111-1111-1111-222222222222', 't1111111-1111-1111-1111-222222222222', 'November', 2023, 50000);

-- Iuran Payments
INSERT INTO iuran_payments (period_id, resident_id, resident_name, amount, status, notes, paid_at, verified_at)
VALUES 
('p1111111-1111-1111-1111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', 100000, 'Lunas', 'Transfer Bank Mandiri', '2023-11-05 09:00:00', '2023-11-05 10:00:00'),
('p1111111-1111-1111-1111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', 100000, 'Menunggu Verifikasi', 'Sudah bayar via ShopeePay', '2023-11-10 14:00:00', NULL),
('p1111111-1111-1111-1111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', 100000, 'Belum Bayar', NULL, NULL, NULL),
('p1111111-1111-1111-1111-222222222222', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', 50000, 'Lunas', 'Gopay', '2023-11-05 09:05:00', '2023-11-05 10:00:00');

-- Announcements
INSERT INTO announcements (title, content, category, priority, visibility, publish_date)
VALUES 
('Pemadaman Listrik Sementara', 'Diberitahukan bahwa akan ada pemadaman listrik pada hari Minggu, 26 Nov dari jam 09.00 - 12.00 karena perbaikan gardu.', 'Informasi', 'Penting', 'Public', '2023-11-18'),
('Himbauan Keamanan Malam Hari', 'Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22:00 WIB.', 'Keamanan', 'Normal', 'Public', '2023-11-15'),
('Laporan Keuangan RT Oktober', 'Laporan keuangan RT untuk bulan Oktober sudah tersedia untuk dilihat di Balai Warga.', 'Keuangan', 'Normal', 'Warga Only', '2023-11-01');

-- Reports
INSERT INTO reports (title, category, description, status)
VALUES ('Lampu Jalan Padam', 'Lampu Jalan', 'Lampu penerangan di pertigaan blok B mati sejak dua hari yang lalu.', 'Open');

-- Emergency Contacts
INSERT INTO emergency_contacts (name, role, phone, category, display_order)
VALUES 
('Ambulans', 'Emergency Medis', '118', 'Medis', 1),
('Polisi', 'Polda/Polres', '110', 'Keamanan', 2),
('Pemadam Kebakaran', 'Damkar', '113', 'Keamanan', 3);
