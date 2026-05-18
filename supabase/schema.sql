-- 1. DROP existing tables and types for a clean setup
DROP TRIGGER IF EXISTS update_housing_profiles_updated_at ON housing_profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_residents_updated_at ON residents;
DROP TRIGGER IF EXISTS update_agendas_updated_at ON agendas;
DROP TRIGGER IF EXISTS update_gotong_royong_updated_at ON gotong_royong;
DROP TRIGGER IF EXISTS update_gotong_royong_attendance_updated_at ON gotong_royong_attendance;
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
CREATE TYPE attendance_status AS ENUM ('Hadir', 'Izin', 'Alpa');

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gotong_royong_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gotong_royong_id UUID REFERENCES gotong_royong(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'Hadir',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE iuran_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    resident_name TEXT, -- Added to match app query expectations in src/lib/data/iuran.ts
    amount NUMERIC NOT NULL,
    status iuran_status DEFAULT 'Belum Bayar',
    payment_proof_url TEXT,
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
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Explicitly create triggers for each table
CREATE TRIGGER update_housing_profiles_updated_at BEFORE UPDATE ON housing_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agendas_updated_at BEFORE UPDATE ON agendas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gotong_royong_updated_at BEFORE UPDATE ON gotong_royong FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gotong_royong_attendance_updated_at BEFORE UPDATE ON gotong_royong_attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
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

CREATE POLICY "Public read agendas" ON agendas FOR SELECT USING (true);
CREATE POLICY "Admin manage agendas" ON agendas FOR ALL USING (is_admin());

CREATE POLICY "Public read gotong_royong" ON gotong_royong FOR SELECT USING (true);
CREATE POLICY "Admin manage gotong_royong" ON gotong_royong FOR ALL USING (is_admin());

CREATE POLICY "Logged in read attendance" ON gotong_royong_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage attendance" ON gotong_royong_attendance FOR ALL USING (is_admin());

CREATE POLICY "Public read iuran_periods" ON iuran_periods FOR SELECT USING (true);
CREATE POLICY "Admin manage iuran_periods" ON iuran_periods FOR ALL USING (is_admin());

CREATE POLICY "User read own iuran payments" ON iuran_payments FOR SELECT USING (
    resident_id IN (SELECT id FROM residents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admin manage iuran payments" ON iuran_payments FOR ALL USING (is_admin());

CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin manage announcements" ON announcements FOR ALL USING (is_admin());

CREATE POLICY "User read own reports" ON reports FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Admin manage reports" ON reports FOR ALL USING (is_admin());

CREATE POLICY "Public read emergency contacts" ON emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Admin manage emergency contacts" ON emergency_contacts FOR ALL USING (is_admin());

-- 10. Seed Data
INSERT INTO housing_profiles (name, description, address, phone, email)
VALUES ('Perumahan Harmoni', 'Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05.', 'Jalan Melati No. 123, Jakarta Selatan', '021-1234567', 'rt01rw05.harmoni@example.com');

-- Using valid UUIDs for residents
INSERT INTO residents (id, name, house_number, block, phone, email, family_members_count, role)
VALUES 
('d7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', '081234567890', 'budi@example.com', 4, 'Warga'),
('d7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', '15', 'B2', '081987654321', 'siti@example.com', 3, 'Warga'),
('d7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', '081222333444', 'agus@example.com', 2, 'Warga');

INSERT INTO agendas (title, category, date, time, location, description)
VALUES 
('Rapat Warga Bulanan', 'Rapat', '2023-11-20', '19:30:00', 'Balai Warga RT 01', 'Rapat rutin membahas laporan keuangan dan keamanan lingkungan.'),
('Posyandu Balita', 'Kesehatan', '2023-11-25', '08:00:00', 'Posyandu Melati', 'Penimbangan balita dan pemberian vitamin.');

INSERT INTO gotong_royong (title, date, time, location, description, required_participants)
VALUES ('Pembersihan Selokan Blok A & B', '2023-11-26', '07:00:00', 'Sepanjang Jalan Utama Blok A & B', 'Membersihkan saluran air mengantisipasi musim hujan.', 20);

INSERT INTO iuran_periods (id, month, year, amount)
VALUES ('e8c5f4f1-5678-4b6c-9d0e-111111111111', 'November', 2023, 150000);

INSERT INTO iuran_payments (period_id, resident_id, resident_name, amount, status, notes, verified_at)
VALUES 
('e8c5f4f1-5678-4b6c-9d0e-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', 150000, 'Lunas', 'Pembayaran via transfer', '2023-11-05 10:00:00'),
('e8c5f4f1-5678-4b6c-9d0e-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', 150000, 'Menunggu Verifikasi', 'Menunggu pengecekan admin', NULL),
('e8c5f4f1-5678-4b6c-9d0e-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', 150000, 'Belum Bayar', NULL, NULL);

INSERT INTO announcements (title, content, category, priority, publish_date)
VALUES 
('Pemadaman Listrik Sementara', 'Diberitahukan bahwa akan ada pemadaman listrik pada hari Minggu, 26 Nov dari jam 09.00 - 12.00 karena perbaikan gardu.', 'Informasi', 'Penting', '2023-11-18'),
('Himbauan Keamanan Malam Hari', 'Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22:00 WIB.', 'Keamanan', 'Normal', '2023-11-15');

INSERT INTO reports (title, category, description, status)
VALUES ('Lampu Jalan Padam', 'Lampu Jalan', 'Lampu penerangan di pertigaan blok B mati sejak dua hari yang lalu.', 'Open');

INSERT INTO emergency_contacts (name, phone, category, display_order)
VALUES 
('Ambulans', '118', 'Medis', 1),
('Polisi', '110', 'Keamanan', 2),
('Pemadam Kebakaran', '113', 'Keamanan', 3);
