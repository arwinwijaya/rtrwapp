import { createClient } from '@/lib/supabase/server'
import { mockIuran } from '@/lib/mock-data'
import { Iuran } from '@/types'

export async function getIuran(): Promise<Iuran[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('iuran_payments')
      .select('*, iuran_periods(*, iuran_types(*))')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return mockIuran as Iuran[]
    }

    // Mapping Supabase data to the existing frontend type structure for compatibility
    return data.map(item => ({
      id: item.id,
      period_id: item.period_id,
      resident_id: item.resident_id,
      resident_name: item.resident_name || "Warga",
      amount: item.amount,
      status: item.status,
      payment_method: item.payment_method,
      payment_proof_url: item.payment_proof_url,
      paid_at: item.paid_at,
      verified_by: item.verified_by,
      verified_at: item.verified_at,
      notes: item.notes,
      iuran_period: item.iuran_periods ? {
        id: item.iuran_periods.id,
        iuran_type_id: item.iuran_periods.iuran_type_id,
        month: item.iuran_periods.month,
        year: item.iuran_periods.year,
        amount: item.iuran_periods.amount,
        iuran_type: item.iuran_periods.iuran_types
      } : undefined
    }))
  } catch (error) {
    return mockIuran as Iuran[]
  }
}
