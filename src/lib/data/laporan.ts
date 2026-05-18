import { createClient } from '@/lib/supabase/server'
import { mockLaporan } from '@/lib/mock-data'

export async function getLaporan() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return mockLaporan
    }

    return data
  } catch (error) {
    return mockLaporan
  }
}
