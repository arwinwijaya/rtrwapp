-- 1. Create Private Schema for internal functions
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create Enums (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('Warga', 'RT Admin', 'RW Admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resident_status') THEN
        CREATE TYPE public.resident_status AS ENUM ('Aktif', 'Pindah', 'Nonaktif');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agenda_category') THEN
        CREATE TYPE public.agenda_category AS ENUM ('Rapat', 'Gotong Royong', 'Sosial', 'Kesehatan', 'Keagamaan', 'Lainnya');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iuran_status') THEN
        CREATE TYPE public.iuran_status AS ENUM ('Belum Bayar', 'Menunggu Verifikasi', 'Lunas', 'Ditolak');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_category') THEN
        CREATE TYPE public.report_category AS ENUM ('Keamanan', 'Sampah', 'Lampu Jalan', 'Jalan Rusak', 'Fasilitas Umum', 'Lainnya');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE public.report_status AS ENUM ('Open', 'Diproses', 'Selesai', 'Ditolak');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_priority') THEN
        CREATE TYPE public.announcement_priority AS ENUM ('Normal', 'Penting', 'Mendesak');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM ('Hadir', 'Izin', 'Alpa', 'Akan Hadir', 'Tidak Hadir', 'Belum Konfirmasi');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_type') THEN
        CREATE TYPE public.visibility_type AS ENUM ('Public', 'Warga Only');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gotong_royong_status') THEN
        CREATE TYPE public.gotong_royong_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
    END IF;
END $$;

-- 4. Utility function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 5. Create tables
CREATE TABLE IF NOT EXISTS public.housing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    rt_number TEXT DEFAULT '01',
    rw_number TEXT DEFAULT '05',
    facilities JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    role public.user_role DEFAULT 'Warga',
    status public.resident_status DEFAULT 'Aktif',
    avatar_url TEXT,
    resident_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    house_number TEXT,
    block TEXT,
    phone TEXT,
    email TEXT,
    family_members_count INTEGER DEFAULT 1,
    role public.user_role DEFAULT 'Warga',
    status public.resident_status DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category public.agenda_category DEFAULT 'Lainnya',
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    description TEXT,
    visibility public.visibility_type DEFAULT 'Public',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gotong_royong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    description TEXT,
    required_participants INTEGER,
    status public.gotong_royong_status DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gotong_royong_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gotong_royong_id UUID REFERENCES public.gotong_royong(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
    status public.attendance_status DEFAULT 'Belum Konfirmasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (gotong_royong_id, resident_id)
);

CREATE TABLE IF NOT EXISTS public.iuran_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_amount NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iuran_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    iuran_type_id UUID REFERENCES public.iuran_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE,
    description TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iuran_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES public.iuran_periods(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
    resident_name TEXT,
    house_number TEXT,
    block TEXT,
    amount NUMERIC NOT NULL,
    status public.iuran_status DEFAULT 'Belum Bayar',
    payment_method TEXT,
    payment_proof_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (period_id, resident_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    priority public.announcement_priority DEFAULT 'Normal',
    visibility public.visibility_type DEFAULT 'Public',
    publish_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES public.residents(id) ON DELETE SET NULL,
    resident_name TEXT,
    title TEXT NOT NULL,
    category public.report_category DEFAULT 'Lainnya',
    description TEXT,
    photo_url TEXT,
    status public.report_status DEFAULT 'Open',
    admin_notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
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

-- 6. Create updated_at triggers explicitly
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
            EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column()', t, t);
        END IF;
    END LOOP;
END;
$$;

-- 7. Enable RLS
ALTER TABLE public.housing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gotong_royong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gotong_royong_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 8. Admin check function (Private Schema)
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('RT Admin', 'RW Admin')
  );
END;
$$;

-- 9. RLS Policies
-- Housing profile
CREATE POLICY "Public can read housing profile" ON public.housing_profiles FOR SELECT USING (true);
CREATE POLICY "Admin manage housing profile" ON public.housing_profiles FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Profiles
CREATE POLICY "User read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin manage all profiles" ON public.profiles FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Residents
CREATE POLICY "User read own resident data" ON public.residents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admin manage all residents" ON public.residents FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Agendas
CREATE POLICY "Everyone can read public agendas" ON public.agendas FOR SELECT USING (visibility = 'Public' OR auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage agendas" ON public.agendas FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Gotong royong
CREATE POLICY "Public read gotong_royong" ON public.gotong_royong FOR SELECT USING (true);
CREATE POLICY "Admin manage gotong_royong" ON public.gotong_royong FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Gotong royong attendance
CREATE POLICY "Logged in read attendance" ON public.gotong_royong_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "User insert own attendance" ON public.gotong_royong_attendance FOR INSERT WITH CHECK (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
);
CREATE POLICY "User update own attendance" ON public.gotong_royong_attendance FOR UPDATE USING (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
) WITH CHECK (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admin manage attendance" ON public.gotong_royong_attendance FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Iuran types
CREATE POLICY "Public read iuran_types" ON public.iuran_types FOR SELECT USING (true);
CREATE POLICY "Admin manage iuran_types" ON public.iuran_types FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Iuran periods
CREATE POLICY "Public read iuran_periods" ON public.iuran_periods FOR SELECT USING (true);
CREATE POLICY "Admin manage iuran_periods" ON public.iuran_periods FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Iuran payments
CREATE POLICY "User read own iuran payments" ON public.iuran_payments FOR SELECT USING (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
);
CREATE POLICY "User update own iuran payment proof" ON public.iuran_payments FOR UPDATE USING (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
) WITH CHECK (
  resident_id IN (SELECT id FROM public.residents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admin manage iuran payments" ON public.iuran_payments FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Announcements
CREATE POLICY "Everyone can read public announcements" ON public.announcements FOR SELECT USING (visibility = 'Public' OR auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Reports
CREATE POLICY "User read own reports" ON public.reports FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "User insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage all reports" ON public.reports FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Emergency contacts
CREATE POLICY "Public can read emergency contacts" ON public.emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Admin manage emergency contacts" ON public.emergency_contacts FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());


-- 10. Seed Data
-- 10.1 Housing Profile
INSERT INTO public.housing_profiles (id, name, description, address, phone, email)
VALUES ('a1111111-1111-4111-8111-111111111111', 'Perumahan Harmoni', 'Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05.', 'Jalan Melati No. 123, Jakarta Selatan', '021-1234567', 'rt01rw05.harmoni@example.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 10.2 Default Admin Account (Development/Demo Only)
-- Email: muhamad.arwinwijaya@gmail.com
-- Password: admin123
DO $$
DECLARE
  admin_user_id UUID := '11111111-1111-4111-8111-111111111111';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, recovery_sent_at, last_sign_in_at, 
    raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', admin_user_id, 'authenticated', 'authenticated', 'muhamad.arwinwijaya@gmail.com', crypt('admin123', gen_salt('bf')), 
    now(), NULL, now(), 
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Muhamad Arwin Wijaya"}', 
    now(), now(), '', '', '', ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    admin_user_id, admin_user_id, format('{"sub":"%s","email":"%s"}', admin_user_id, 'muhamad.arwinwijaya@gmail.com')::jsonb, 'email', now(), now(), now()
  )
  ON CONFLICT (id, provider) DO NOTHING;

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, housing_id, name, email, role, status)
  VALUES (admin_user_id, 'a1111111-1111-4111-8111-111111111111', 'Muhamad Arwin Wijaya', 'muhamad.arwinwijaya@gmail.com', 'RT Admin', 'Aktif')
  ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    email = EXCLUDED.email;
END $$;

-- 10.3 Iuran Types
INSERT INTO public.iuran_types (id, housing_id, name, description, default_amount, is_active, display_order)
VALUES 
('b1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Iuran Keamanan', 'Biaya satpam dan penjagaan lingkungan', 100000, true, 1),
('b1111111-1111-4111-8111-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Iuran Kebersihan', 'Biaya angkut sampah dan kebersihan jalan', 50000, true, 2),
('b1111111-1111-4111-8111-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Iuran Air', 'Biaya distribusi air bersih mandiri', 150000, true, 3),
('b1111111-1111-4111-8111-444444444444', 'a1111111-1111-4111-8111-111111111111', 'Iuran Kas RT', 'Kas operasional kegiatan RT', 25000, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 10.4 Residents
INSERT INTO public.residents (id, housing_id, name, house_number, block, phone, email, family_members_count, role, status)
VALUES
('d7b4e3e0-1234-4a5b-8c9d-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Budi Santoso', '12', 'A1', '081234567890', 'budi@example.com', 4, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Siti Aminah', '15', 'B2', '081987654321', 'siti@example.com', 3, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Agus Pratama', '08', 'C1', '081222333444', 'agus@example.com', 2, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-444444444444', 'a1111111-1111-4111-8111-111111111111', 'Rina Kurnia', '21', 'D1', '081555666777', 'rina@example.com', 5, 'Warga', 'Aktif')
ON CONFLICT (id) DO NOTHING;

-- 10.5 Agendas
INSERT INTO public.agendas (housing_id, title, category, date, time, location, description, visibility)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Rapat Warga Bulanan', 'Rapat', CURRENT_DATE + INTERVAL '7 days', '19:30:00', 'Balai Warga RT 01', 'Rapat rutin membahas laporan keuangan dan keamanan lingkungan.', 'Warga Only'),
('a1111111-1111-4111-8111-111111111111', 'Posyandu Balita', 'Kesehatan', CURRENT_DATE + INTERVAL '12 days', '08:00:00', 'Posyandu Melati', 'Penimbangan balita dan pemberian vitamin.', 'Public'),
('a1111111-1111-4111-8111-111111111111', 'Sosialisasi Keamanan Lingkungan', 'Sosial', CURRENT_DATE + INTERVAL '18 days', '20:00:00', 'Pos Keamanan', 'Sosialisasi sistem keamanan dan ronda malam.', 'Public')
ON CONFLICT DO NOTHING;

-- 10.6 Gotong Royong
INSERT INTO public.gotong_royong (housing_id, title, date, time, location, description, required_participants, status)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Pembersihan Selokan Blok A & B', CURRENT_DATE + INTERVAL '14 days', '07:00:00', 'Sepanjang Jalan Utama Blok A & B', 'Membersihkan saluran air mengantisipasi musim hujan.', 20, 'Scheduled'),
('a1111111-1111-4111-8111-111111111111', 'Perapihan Taman Warga', CURRENT_DATE + INTERVAL '21 days', '07:30:00', 'Taman Tengah Perumahan', 'Potong rumput, bersihkan taman, dan cat ulang bangku taman.', 15, 'Scheduled')
ON CONFLICT DO NOTHING;

-- 10.7 Iuran Periods
INSERT INTO public.iuran_periods (id, housing_id, iuran_type_id, title, month, year, amount, due_date, description, status)
VALUES
('c1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', 'Iuran Keamanan Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 100000, CURRENT_DATE + INTERVAL '10 days', 'Iuran satpam dan keamanan lingkungan.', 'open'),
('c1111111-1111-4111-8111-222222222222', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-222222222222', 'Iuran Kebersihan Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 50000, CURRENT_DATE + INTERVAL '10 days', 'Iuran kebersihan dan pengangkutan sampah.', 'open'),
('c1111111-1111-4111-8111-333333333333', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-333333333333', 'Iuran Air Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 150000, CURRENT_DATE + INTERVAL '10 days', 'Iuran air bersih mandiri.', 'open')
ON CONFLICT (id) DO NOTHING;

-- 10.8 Iuran Payments
INSERT INTO public.iuran_payments (period_id, resident_id, resident_name, house_number, block, amount, status, payment_method, notes, paid_at, verified_at)
VALUES
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', 100000, 'Lunas', 'Transfer Bank Mandiri', 'Pembayaran via transfer', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', '15', 'B2', 100000, 'Menunggu Verifikasi', 'ShopeePay', 'Sudah bayar via e-wallet', NOW() - INTERVAL '2 days', NULL),
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', 100000, 'Belum Bayar', NULL, NULL, NULL, NULL),
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-444444444444', 'Rina Kurnia', '21', 'D1', 100000, 'Lunas', 'Tunai', 'Bayar langsung ke bendahara', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('c1111111-1111-4111-8111-222222222222', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', 50000, 'Lunas', 'GoPay', 'Pembayaran kebersihan', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('c1111111-1111-4111-8111-222222222222', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', '15', 'B2', 50000, 'Belum Bayar', NULL, NULL, NULL, NULL),
('c1111111-1111-4111-8111-333333333333', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', 150000, 'Ditolak', 'Transfer', 'Bukti bayar tidak terbaca', NOW() - INTERVAL '1 day', NULL)
ON CONFLICT (period_id, resident_id) DO NOTHING;

-- 10.9 Announcements
INSERT INTO public.announcements (housing_id, title, content, category, priority, visibility, publish_date)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Pemadaman Listrik Sementara', 'Diberitahukan bahwa akan ada pemadaman listrik sementara pada hari Minggu pukul 09.00 - 12.00 karena perbaikan jaringan.', 'Informasi', 'Penting', 'Public', CURRENT_DATE),
('a1111111-1111-4111-8111-111111111111', 'Himbauan Keamanan Malam Hari', 'Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22.00 WIB.', 'Keamanan', 'Normal', 'Public', CURRENT_DATE - INTERVAL '2 days'),
('a1111111-1111-4111-8111-111111111111', 'Laporan Keuangan RT Bulan Ini', 'Laporan keuangan RT bulan ini sudah tersedia untuk warga dan dapat dilihat di Balai Warga.', 'Keuangan', 'Normal', 'Warga Only', CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- 10.10 Reports
INSERT INTO public.reports (housing_id, resident_id, resident_name, title, category, description, status)
VALUES
('a1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', 'Lampu Jalan Padam', 'Lampu Jalan', 'Lampu penerangan di pertigaan Blok B mati sejak dua hari yang lalu.', 'Open'),
('a1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', 'Sampah Belum Diangkut', 'Sampah', 'Sampah rumah tangga Blok B belum diangkut sejak kemarin.', 'Diproses')
ON CONFLICT DO NOTHING;

-- 10.11 Emergency Contacts
INSERT INTO public.emergency_contacts (housing_id, name, role, phone, category, description, is_active, display_order)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Ambulans', 'Layanan Medis Darurat', '118', 'Medis', 'Kontak ambulans untuk kondisi darurat medis.', true, 1),
('a1111111-1111-4111-8111-111111111111', 'Polisi', 'Polda/Polres', '110', 'Keamanan', 'Kontak polisi untuk keadaan darurat keamanan.', true, 2),
('a1111111-1111-4111-8111-111111111111', 'Pemadam Kebakaran', 'Damkar', '113', 'Darurat', 'Kontak pemadam kebakaran.', true, 3),
('a1111111-1111-4111-8111-111111111111', 'Ketua RT 01', 'Pengurus RT', '081111111111', 'Pengurus', 'Kontak Ketua RT untuk kebutuhan administrasi warga.', true, 4),
('a1111111-1111-4111-8111-111111111111', 'Pos Security', 'Keamanan Lingkungan', '082222222222', 'Keamanan', 'Kontak keamanan perumahan 24 jam.', true, 5)
ON CONFLICT DO NOTHING;
