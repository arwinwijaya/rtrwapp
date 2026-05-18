-- =====================================================
-- RT RW App - Activity & Ronda Migration (FIXED)
-- Purpose: Safe migration for existing live database.
-- This migration updates an existing database to support Agenda submenu,
-- Yasinan, and Ronda scheduling WITHOUT resetting existing data.
-- =====================================================

-- 0. Ensure required extension / private helper schema exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

-- 1. Ensure activity_type enum exists and has required values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE public.activity_type AS ENUM ('Gotong Royong', 'Kerja Bakti', 'Yasinan', 'Ronda');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'activity_type' AND e.enumlabel = 'Gotong Royong'
  ) THEN
    ALTER TYPE public.activity_type ADD VALUE 'Gotong Royong';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'activity_type' AND e.enumlabel = 'Kerja Bakti'
  ) THEN
    ALTER TYPE public.activity_type ADD VALUE 'Kerja Bakti';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'activity_type' AND e.enumlabel = 'Yasinan'
  ) THEN
    ALTER TYPE public.activity_type ADD VALUE 'Yasinan';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'activity_type' AND e.enumlabel = 'Ronda'
  ) THEN
    ALTER TYPE public.activity_type ADD VALUE 'Ronda';
  END IF;
END $$;

-- 2. Ensure secure helper functions exist / are safe
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

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE((
    SELECT p.role IN ('RT Admin', 'RW Admin')
    FROM public.profiles p
    WHERE p.id = auth.uid()
    LIMIT 1
  ), FALSE);
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO anon, authenticated;

-- 3. Update gotong_royong table columns
ALTER TABLE public.gotong_royong
ADD COLUMN IF NOT EXISTS activity_type public.activity_type DEFAULT 'Gotong Royong';

ALTER TABLE public.gotong_royong
ADD COLUMN IF NOT EXISTS host_name TEXT;

ALTER TABLE public.gotong_royong
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- 4. Backfill existing gotong_royong rows
UPDATE public.gotong_royong
SET activity_type = 'Gotong Royong'
WHERE activity_type IS NULL;

UPDATE public.gotong_royong
SET visibility = 'public'
WHERE visibility IS NULL;

-- 5. Create Ronda Schedules table
CREATE TABLE IF NOT EXISTS public.ronda_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  housing_id UUID REFERENCES public.housing_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME DEFAULT '22:00:00',
  area TEXT,
  status TEXT DEFAULT 'Upcoming',
  visibility TEXT DEFAULT 'public',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (housing_id, date, area)
);

-- 6. Create Ronda Assignments table
CREATE TABLE IF NOT EXISTS public.ronda_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ronda_schedule_id UUID REFERENCES public.ronda_schedules(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'Belum Konfirmasi',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (ronda_schedule_id, resident_id)
);

-- 7. Add updated_at triggers for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ronda_schedules_updated_at') THEN
    CREATE TRIGGER update_ronda_schedules_updated_at
    BEFORE UPDATE ON public.ronda_schedules
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ronda_assignments_updated_at') THEN
    CREATE TRIGGER update_ronda_assignments_updated_at
    BEFORE UPDATE ON public.ronda_assignments
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END $$;

-- 8. Enable RLS
ALTER TABLE public.ronda_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ronda_assignments ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for ronda_schedules
DROP POLICY IF EXISTS "Public read ronda schedules" ON public.ronda_schedules;
CREATE POLICY "Public read ronda schedules"
ON public.ronda_schedules
FOR SELECT
USING (visibility = 'public' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin manage ronda schedules" ON public.ronda_schedules;
CREATE POLICY "Admin manage ronda schedules"
ON public.ronda_schedules
FOR ALL
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- 10. RLS policies for ronda_assignments
DROP POLICY IF EXISTS "Public read ronda assignments" ON public.ronda_assignments;
CREATE POLICY "Public read ronda assignments"
ON public.ronda_assignments
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "User read own ronda assignments" ON public.ronda_assignments;
CREATE POLICY "User read own ronda assignments"
ON public.ronda_assignments
FOR SELECT
USING (
  resident_id IN (
    SELECT r.id
    FROM public.residents r
    WHERE r.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin manage ronda assignments" ON public.ronda_assignments;
CREATE POLICY "Admin manage ronda assignments"
ON public.ronda_assignments
FOR ALL
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- 11. Indexes
CREATE INDEX IF NOT EXISTS idx_ronda_schedules_date
ON public.ronda_schedules(date);

CREATE INDEX IF NOT EXISTS idx_ronda_schedules_housing_date
ON public.ronda_schedules(housing_id, date);

CREATE INDEX IF NOT EXISTS idx_ronda_assignments_res
ON public.ronda_assignments(resident_id);

CREATE INDEX IF NOT EXISTS idx_ronda_assignments_sch
ON public.ronda_assignments(ronda_schedule_id);

CREATE INDEX IF NOT EXISTS idx_gotong_royong_type_date
ON public.gotong_royong(activity_type, date);

-- 12. Migration-only seed: Yasinan sample
-- FIXED: housing_profiles primary key is id, not housing_id.
INSERT INTO public.gotong_royong (
  housing_id,
  title,
  activity_type,
  date,
  time,
  location,
  description,
  host_name,
  visibility
)
SELECT
  hp.id,
  'Yasinan Malam Jumat',
  'Yasinan',
  CURRENT_DATE + INTERVAL '3 days',
  '19:30:00',
  'Rumah Bpk. Budi Santoso (Blok A/12)',
  'Kegiatan yasinan rutin malam jumat.',
  'Bpk. Budi Santoso',
  'public'
FROM public.housing_profiles hp
WHERE NOT EXISTS (
  SELECT 1
  FROM public.gotong_royong gr
  WHERE gr.title = 'Yasinan Malam Jumat'
    AND gr.activity_type = 'Yasinan'
)
LIMIT 1;

-- 13. Migration-only seed: Ronda schedule sample
INSERT INTO public.ronda_schedules (
  housing_id,
  date,
  time,
  area,
  status,
  visibility,
  notes
)
SELECT
  hp.id,
  CURRENT_DATE,
  '22:00:00',
  'Pos Security Blok A',
  'Upcoming',
  'public',
  'Jadwal ronda contoh hasil migration.'
FROM public.housing_profiles hp
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ronda_schedules rs
  WHERE rs.date = CURRENT_DATE
    AND rs.area = 'Pos Security Blok A'
)
LIMIT 1;

-- 14. Optional sample ronda assignments for up to 2 active residents
INSERT INTO public.ronda_assignments (
  ronda_schedule_id,
  resident_id,
  attendance_status
)
SELECT
  rs.id,
  r.id,
  'Belum Konfirmasi'
FROM public.ronda_schedules rs
JOIN public.residents r ON r.housing_id = rs.housing_id
WHERE rs.date = CURRENT_DATE
  AND rs.area = 'Pos Security Blok A'
  AND COALESCE(r.status::text, 'Aktif') = 'Aktif'
  AND NOT EXISTS (
    SELECT 1
    FROM public.ronda_assignments ra
    WHERE ra.ronda_schedule_id = rs.id
      AND ra.resident_id = r.id
  )
ORDER BY r.created_at ASC
LIMIT 2;
