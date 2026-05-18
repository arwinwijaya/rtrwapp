import { createClient } from '@/lib/supabase/server'
import { mockIuran } from '@/lib/mock-data'

export async function getIuran() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('iuran_payments')
      .select('*, iuran_periods(*)')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return mockIuran
    }

    // Mapping Supabase data to the existing frontend type structure for compatibility
    return data.map(item => ({
      id: item.id,
      resident_id: item.resident_id,
      resident_name: item.resident_name || "Warga", // Assumes we might join profiles
      house_number: "0", // Fallback if join is missing
      block: "X",
      month: item.iuran_periods?.month || "Unknown",
      year: item.iuran_periods?.year || new Date().getFullYear(),
      amount: item.amount,
      status: item.status,
      payment_proof_url: item.payment_proof_url,
      verified_by: item.verified_by,
      verified_at: item.verified_at,
      notes: item.notes
    }))
  } catch (error) {
    return mockIuran
  }
}
