import React from "react";
import RondaClient from "./RondaClient";
import { getRondaSchedules } from "@/lib/data/ronda";

export default async function RondaPage() {
  const data = await getRondaSchedules();
  return <RondaClient schedules={data} />;
}
