import React from "react";
import GotongRoyongClient from "./GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function GotongRoyongPage() {
  const data = await getGotongRoyong("Gotong Royong");
  return (
    <GotongRoyongClient 
      gotongRoyong={data} 
      title="Gotong Royong" 
      subtitle="Jadwal kerja bakti dan gotong royong warga lingkungan." 
    />
  );
}
