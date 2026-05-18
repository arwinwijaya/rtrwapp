import React from "react";
import GotongRoyongClient from "../../gotong-royong/GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function KerjaBaktiPage() {
  const data = await getGotongRoyong("Kerja Bakti");
  return (
    <GotongRoyongClient 
      gotongRoyong={data} 
      title="Kerja Bakti" 
      subtitle="Jadwal kerja bakti lingkungan terjadwal." 
    />
  );
}
