import React from "react";
import GotongRoyongClient from "../../gotong-royong/GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function YasinanPage() {
  const data = await getGotongRoyong("Yasinan");
  return (
    <GotongRoyongClient 
      gotongRoyong={data} 
      title="Jadwal Yasinan" 
      subtitle="Kegiatan yasinan dan tahlilan rutin warga." 
    />
  );
}
