import { createClient } from '@/lib/supabase/server'
import { 
  mockWarga, 
  mockIuran, 
  mockAgendas, 
  mockGotongRoyong, 
  mockPengumuman, 
  mockLaporan, 
  mockKontakDarurat,
  mockIuranTypes,
  mockIuranPeriods
} from '@/lib/mock-data'

export async function getAdminStats() {
  try {
    const supabase = await createClient()
    const { count: wargaCount } = await supabase.from('residents').select('*', { count: 'exact', head: true })
    const { count: agendaCount } = await supabase.from('agendas').select('*', { count: 'exact', head: true })
    const { count: reportCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Open')
    const { count: unpaidCount } = await supabase.from('iuran_payments').select('*', { count: 'exact', head: true }).eq('status', 'Belum Bayar')

    return {
      warga: wargaCount || mockWarga.length,
      agenda: agendaCount || mockAgendas.length,
      laporan: reportCount || mockLaporan.filter(l => l.status === 'Open').length,
      iuran: unpaidCount || mockIuran.filter(i => i.status === 'Belum Bayar').length
    }
  } catch (error) {
    return {
      warga: mockWarga.length,
      agenda: mockAgendas.length,
      laporan: mockLaporan.filter(l => l.status === 'Open').length,
      iuran: mockIuran.filter(i => i.status === 'Belum Bayar').length
    }
  }
}

export async function getIuranTypes() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('iuran_types').select('*').order('display_order', { ascending: true })
    return data || mockIuranTypes
  } catch (error) {
    return []
  }
}

export async function getIuranPeriods() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('iuran_periods').select('*, iuran_types(*)').order('year', { ascending: false }).order('month', { ascending: false })
    return data || mockIuranPeriods
  } catch (error) {
    return []
  }
}
