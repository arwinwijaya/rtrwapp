-- =====================================================
-- RT RW App - Seed Data
-- This file inserts development/demo seed data. 
-- Run after schema.sql for fresh setup. 
-- Default admin password must be changed before production.
-- =====================================================

-- 1. Default housing profile
INSERT INTO public.housing_profiles (
  id, name, description, address, phone, email, rt_number, rw_number, facilities, rules
)
VALUES (
  'a1111111-1111-4111-8111-111111111111',
  'Perumahan Harmoni',
  'Platform informasi dan layanan terpadu untuk warga RT 01 / RW 05. Tetap terhubung, aman, dan nyaman bersama.',
  'Jalan Melati No. 123, Jakarta Selatan',
  '021-1234567',
  'rt01rw05.harmoni@example.com',
  '01',
  '05',
  '["Balai Warga", "Taman Bermain", "Pos Keamanan", "Lapangan Serbaguna"]'::jsonb,
  '["Menjaga kebersihan lingkungan", "Tamu wajib lapor keamanan", "Iuran dibayarkan setiap bulan", "Gotong royong mengikuti jadwal RT"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Default Admin Account - DEV/DEMO ONLY
-- Email: muhamad.arwinwijaya@gmail.com
-- Password: admin123
-- Default admin account for development/demo only. Change this password before production.
DO $$
DECLARE
  v_admin_email TEXT := 'muhamad.arwinwijaya@gmail.com';
  v_admin_password TEXT := 'admin123';
  v_admin_id UUID := '11111111-1111-4111-8111-111111111111';
BEGIN
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt(v_admin_password, gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Muhamad Arwin Wijaya"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert identity
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id'
    ) THEN
      INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (v_admin_id, v_admin_id, v_admin_email, jsonb_build_object('sub', v_admin_id::text, 'email', v_admin_email, 'email_verified', true), 'email', now(), now(), now());
    ELSE
      INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (v_admin_id, v_admin_id, jsonb_build_object('sub', v_admin_id::text, 'email', v_admin_email, 'email_verified', true), 'email', now(), now(), now());
    END IF;
  END IF;

  -- Ensure profile exists and is admin
  INSERT INTO public.profiles (id, housing_id, name, email, role, status)
  VALUES (v_admin_id, 'a1111111-1111-4111-8111-111111111111', 'Muhamad Arwin Wijaya', v_admin_email, 'RT Admin', 'Aktif')
  ON CONFLICT (id) DO UPDATE SET
    role = 'RT Admin',
    status = 'Aktif',
    housing_id = 'a1111111-1111-4111-8111-111111111111';
END $$;

-- 3. Sample Residents
INSERT INTO public.residents (id, housing_id, name, house_number, block, phone, email, family_members_count, role, status)
VALUES
('d7b4e3e0-1234-4a5b-8c9d-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Budi Santoso', '12', 'A1', '081234567890', 'budi@example.com', 4, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Siti Aminah', '15', 'B2', '081987654321', 'siti@example.com', 3, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Agus Pratama', '08', 'C1', '081222333444', 'agus@example.com', 2, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-444444444444', 'a1111111-1111-4111-8111-111111111111', 'Rina Kurnia', '21', 'D1', '081555666777', 'rina@example.com', 5, 'Warga', 'Aktif'),
('d7b4e3e0-1234-4a5b-8c9d-555555555555', 'a1111111-1111-4111-8111-111111111111', 'Eko Prasetyo', '05', 'E3', '081333444555', 'eko@example.com', 3, 'Warga', 'Aktif')
ON CONFLICT (id) DO NOTHING;

-- 4. Iuran Types
INSERT INTO public.iuran_types (id, housing_id, name, description, default_amount, is_active, display_order)
VALUES
('b1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Iuran Keamanan', 'Biaya satpam dan penjagaan lingkungan', 100000, true, 1),
('b1111111-1111-4111-8111-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Iuran Kebersihan', 'Biaya angkut sampah dan kebersihan jalan', 50000, true, 2),
('b1111111-1111-4111-8111-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Iuran Air', 'Biaya distribusi air bersih mandiri', 150000, true, 3),
('b1111111-1111-4111-8111-444444444444', 'a1111111-1111-4111-8111-111111111111', 'Iuran Kas RT', 'Kas operasional kegiatan RT', 25000, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Iuran Periods
INSERT INTO public.iuran_periods (id, housing_id, iuran_type_id, title, month, year, amount, due_date, status)
VALUES
('c1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', 'Iuran Keamanan Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 100000, CURRENT_DATE + INTERVAL '10 days', 'open'),
('c1111111-1111-4111-8111-222222222222', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-222222222222', 'Iuran Kebersihan Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 50000, CURRENT_DATE + INTERVAL '10 days', 'open'),
('c1111111-1111-4111-8111-333333333333', 'a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-333333333333', 'Iuran Air Bulanan', TO_CHAR(CURRENT_DATE, 'FMMonth'), EXTRACT(YEAR FROM CURRENT_DATE)::integer, 150000, CURRENT_DATE + INTERVAL '10 days', 'open')
ON CONFLICT (id) DO NOTHING;

-- 6. Iuran Payments
INSERT INTO public.iuran_payments (period_id, resident_id, resident_name, house_number, block, amount, status, payment_method, notes, paid_at, verified_at)
VALUES
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', 100000, 'Lunas', 'Transfer Bank Mandiri', 'Pembayaran via transfer', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Siti Aminah', '15', 'B2', 100000, 'Menunggu Verifikasi', 'ShopeePay', 'Sudah bayar via e-wallet', NOW() - INTERVAL '2 days', NULL),
('c1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', 100000, 'Belum Bayar', NULL, NULL, NULL, NULL),
('c1111111-1111-4111-8111-222222222222', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', '12', 'A1', 50000, 'Lunas', 'GoPay', 'Pembayaran kebersihan', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('c1111111-1111-4111-8111-333333333333', 'd7b4e3e0-1234-4a5b-8c9d-333333333333', 'Agus Pratama', '08', 'C1', 150000, 'Ditolak', 'Transfer', 'Bukti bayar tidak terbaca', NOW() - INTERVAL '1 day', NULL)
ON CONFLICT (period_id, resident_id) DO NOTHING;

-- 7. Agendas
INSERT INTO public.agendas (housing_id, title, category, date, time, location, description, visibility)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Rapat Warga Bulanan', 'Rapat', CURRENT_DATE + INTERVAL '7 days', '19:30:00', 'Balai Warga RT 01', 'Rapat rutin membahas laporan keuangan dan keamanan lingkungan.', 'Warga Only'),
('a1111111-1111-4111-8111-111111111111', 'Posyandu Balita', 'Kesehatan', CURRENT_DATE + INTERVAL '12 days', '08:00:00', 'Posyandu Melati', 'Penimbangan balita dan pemberian vitamin.', 'Public'),
('a1111111-1111-4111-8111-111111111111', 'Sosialisasi Keamanan Lingkungan', 'Sosial', CURRENT_DATE + INTERVAL '18 days', '20:00:00', 'Pos Keamanan', 'Sosialisasi sistem keamanan dan ronda malam.', 'Public');

-- 8. Activities (Gotong Royong / Yasinan)
INSERT INTO public.gotong_royong (housing_id, title, activity_type, date, time, location, description, required_participants, status, host_name)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Pembersihan Selokan Blok A & B', 'Gotong Royong', CURRENT_DATE + INTERVAL '14 days', '07:00:00', 'Sepanjang Jalan Utama Blok A & B', 'Membersihkan saluran air mengantisipasi musim hujan.', 20, 'Scheduled', NULL),
('a1111111-1111-4111-8111-111111111111', 'Yasinan Malam Jumat', 'Yasinan', CURRENT_DATE + INTERVAL '3 days', '19:30:00', 'Rumah Bpk. Budi Santoso (Blok A/12)', 'Kegiatan yasinan rutin malam jumat.', 0, 'Scheduled', 'Bpk. Budi Santoso'),
('a1111111-1111-4111-8111-111111111111', 'Kerja Bakti Saluran Air', 'Kerja Bakti', CURRENT_DATE + INTERVAL '5 days', '08:00:00', 'Blok C dan D', 'Memperbaiki saluran air yang tersumbat.', 10, 'Scheduled', NULL),
('a1111111-1111-4111-8111-111111111111', 'Yasinan Blok A', 'Yasinan', CURRENT_DATE + INTERVAL '10 days', '19:30:00', 'Rumah Bpk. Agus (Blok C/08)', 'Yasinan rutin warga Blok A dan C.', 0, 'Scheduled', 'Bpk. Agus');

-- 9. Ronda
INSERT INTO public.ronda_schedules (id, housing_id, date, time, area)
VALUES
('e1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', CURRENT_DATE, '22:00:00', 'Pos Security Blok A'),
('e1111111-1111-4111-8111-222222222222', 'a1111111-1111-4111-8111-111111111111', CURRENT_DATE + INTERVAL '1 day', '22:00:00', 'Pos Security Blok A')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ronda_assignments (ronda_schedule_id, resident_id, attendance_status)
VALUES
('e1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Belum Konfirmasi'),
('e1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-222222222222', 'Belum Konfirmasi')
ON CONFLICT DO NOTHING;

-- 10. Announcements
INSERT INTO public.announcements (housing_id, title, content, category, priority, visibility, publish_date)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Pemadaman Listrik Sementara', 'Diberitahukan bahwa akan ada pemadaman listrik sementara pada hari Minggu pukul 09.00 - 12.00 karena perbaikan jaringan.', 'Informasi', 'Penting', 'Public', CURRENT_DATE),
('a1111111-1111-4111-8111-111111111111', 'Himbauan Keamanan Malam Hari', 'Dimohon warga untuk selalu mengunci pagar rumah setelah jam 22.00 WIB.', 'Keamanan', 'Normal', 'Public', CURRENT_DATE - INTERVAL '2 days');

-- 11. Reports
INSERT INTO public.reports (housing_id, resident_id, resident_name, title, category, description, status)
VALUES
('a1111111-1111-4111-8111-111111111111', 'd7b4e3e0-1234-4a5b-8c9d-111111111111', 'Budi Santoso', 'Lampu Jalan Padam', 'Lampu Jalan', 'Lampu penerangan di pertigaan Blok B mati sejak dua hari yang lalu.', 'Open');

-- 12. Emergency Contacts
INSERT INTO public.emergency_contacts (housing_id, name, role, phone, category, description, is_active, display_order)
VALUES
('a1111111-1111-4111-8111-111111111111', 'Ambulans', 'Layanan Medis Darurat', '118', 'Medis', 'Kontak ambulans untuk kondisi darurat medis.', true, 1),
('a1111111-1111-4111-8111-111111111111', 'Polisi', 'Polda/Polres', '110', 'Keamanan', 'Kontak polisi untuk keadaan darurat keamanan.', true, 2),
('a1111111-1111-4111-8111-111111111111', 'Pemadam Kebakaran', 'Damkar', '113', 'Darurat', 'Kontak pemadam kebakaran.', true, 3),
('a1111111-1111-4111-8111-111111111111', 'Ketua RT 01', 'Pengurus RT', '081111111111', 'Pengurus', 'Kontak Ketua RT untuk kebutuhan administrasi warga.', true, 4),
('a1111111-1111-4111-8111-111111111111', 'Pos Security', 'Keamanan Lingkungan', '082222222222', 'Keamanan', 'Kontak keamanan perumahan 24 jam.', true, 5);
