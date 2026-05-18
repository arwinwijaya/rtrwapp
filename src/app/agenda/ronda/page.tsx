import React from "react";
import GotongRoyongClient from "../../gotong-royong/GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function RondaPage() {
  const data = await getGotongRoyong("Ronda");
  return (
    <GotongRoyongClient 
      gotongRoyong={data} 
      title="Jadwal Ronda" 
      subtitle="Jadwal keamanan lingkungan warga." 
    />
  );
}
