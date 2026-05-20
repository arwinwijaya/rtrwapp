import React from "react";
import KontakClient from "./KontakClient";
import { getKontakDarurat } from "@/lib/data/kontak";

export default async function KontakPage() {
  const data = await getKontakDarurat();
  return <KontakClient kontak={data} />;
}
