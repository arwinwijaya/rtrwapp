// This is a placeholder for Firebase integration.
// Currently it imports mock data, but it is structured using async functions
// so it can be swapped with real Firebase SDK calls easily later.

import { mockAgendas, mockIuran, mockPengumuman, mockWarga, mockLaporan, mockGotongRoyong } from "@/lib/mock-data";
import { Agenda, Iuran, Pengumuman, Warga, Laporan, GotongRoyong } from "@/types";

// Firebase App Config Placeholder
export const initFirebase = () => {
  // console.log("Firebase initialized");
};

// Data Access Layer
export async function getAgendas(): Promise<Agenda[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockAgendas), 500));
}

export async function getGotongRoyong(): Promise<GotongRoyong[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockGotongRoyong), 500));
}

export async function getIuran(): Promise<Iuran[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockIuran), 500));
}

export async function getPengumuman(): Promise<Pengumuman[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockPengumuman), 500));
}

export async function getWarga(): Promise<Warga[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockWarga), 500));
}

export async function getLaporan(): Promise<Laporan[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockLaporan), 500));
}
