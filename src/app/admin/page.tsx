import React from "react";
import AdminClient from "./AdminClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Validate admin role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role === "RT Admin" || profile?.role === "RW Admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Await searchParams properly
  const params = await searchParams;
  const initialTab = (params?.tab as string) || "overview";

  // Fetch all necessary admin data
  // We fetch them concurrently for performance
  const [
    { data: warga },
    { data: iuranTypes },
    { data: iuranPeriods },
    { data: iuranPayments },
    { data: agendas },
    { data: gotongRoyong },
    { data: pengumuman },
    { data: laporan },
    { data: kontak },
    { data: housingProfil },
    { data: rondaSchedules },
    { data: rondaAssignments }
  ] = await Promise.all([
    supabase.from("residents").select("*").order("name", { ascending: true }),
    supabase.from("iuran_types").select("*").order("display_order", { ascending: true }),
    supabase.from("iuran_periods").select("*, iuran_types(*)").order("year", { ascending: false }).order("month", { ascending: false }),
    supabase.from("iuran_payments").select("*, iuran_periods(title, month, year, iuran_type_id)").order("created_at", { ascending: false }),
    supabase.from("agendas").select("*").order("date", { ascending: false }),
    supabase.from("gotong_royong").select("*").order("date", { ascending: false }),
    supabase.from("announcements").select("*").order("publish_date", { ascending: false }),
    supabase.from("reports").select("*").order("created_at", { ascending: false }),
    supabase.from("emergency_contacts").select("*").order("display_order", { ascending: true }),
    supabase.from("housing_profiles").select("*").single(),
    supabase.from("ronda_schedules").select("*").order("date", { ascending: false }),
    supabase.from("ronda_assignments").select("*, residents(*)"),
  ]);

  return (
    <AdminClient 
      initialTab={initialTab}
      warga={warga || []}
      iuranTypes={iuranTypes || []}
      iuranPeriods={iuranPeriods || []}
      iuranPayments={iuranPayments || []}
      agendas={agendas || []}
      gotongRoyong={gotongRoyong || []}
      pengumuman={pengumuman || []}
      laporan={laporan || []}
      kontak={kontak || []}
      profil={housingProfil || {}}
      rondaSchedules={rondaSchedules || []}
      rondaAssignments={rondaAssignments || []}
    />
  );
}
