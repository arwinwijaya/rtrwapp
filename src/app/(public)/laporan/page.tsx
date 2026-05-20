import React from "react";
import LaporanClient from "./LaporanClient";
import { getLaporan } from "@/lib/data/laporan";

export default async function LaporanPage() {
  const data = await getLaporan();
  return <LaporanClient laporan={data} />;
}
