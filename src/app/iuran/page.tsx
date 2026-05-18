import React from "react";
import IuranClient from "./IuranClient";
import { getIuran } from "@/lib/data/iuran";
import { getIuranTypes } from "@/lib/data/admin";

export default async function IuranPage() {
  const data = await getIuran();
  const iuranTypes = await getIuranTypes();
  return <IuranClient iuran={data} iuranTypes={iuranTypes} />;
}
