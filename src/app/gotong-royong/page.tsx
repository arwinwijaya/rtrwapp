import React from "react";
import GotongRoyongClient from "./GotongRoyongClient";
import { getGotongRoyong } from "@/lib/data/gotongRoyong";

export default async function GotongRoyongPage() {
  const data = await getGotongRoyong();
  return <GotongRoyongClient gotongRoyong={data} />;
}
