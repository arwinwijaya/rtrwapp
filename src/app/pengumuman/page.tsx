import React from "react";
import PengumumanClient from "./PengumumanClient";
import { getPengumuman } from "@/lib/data/announcements";

export default async function PengumumanPage() {
  const data = await getPengumuman();
  return <PengumumanClient pengumuman={data} />;
}
