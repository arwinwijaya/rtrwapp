import React from "react";
import GotongRoyongClient from "../../gotong-royong/GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function GotongRoyongPage() {
  const data = await getGotongRoyong("Gotong Royong");
  return (
    <GotongRoyongClient 
      gotongRoyong={data} 
      title="Gotong Royong" 
      subtitle="Jadwal gotong royong warga lingkungan." 
    />
  );
}
