import React from "react";
import WargaClient from "./WargaClient";
import { createClient } from "@/lib/supabase/server";

export default async function WargaPage() {
  const supabase = await createClient();
  // RLS will automatically restrict Warga to see only their own data
  const { data: warga } = await supabase.from("residents").select("*").order("name", { ascending: true });

  return <WargaClient warga={warga || []} />;
}
