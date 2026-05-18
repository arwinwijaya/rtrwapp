import React from "react";
import AgendaClient from "./AgendaClient";
import { getAgendas } from "@/lib/data/agenda";

export default async function AgendaPage() {
  const data = await getAgendas();
  return <AgendaClient agendas={data} />;
}
