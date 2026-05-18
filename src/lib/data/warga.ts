import { createClient } from '@/lib/supabase/server'
import { mockWarga } from '@/lib/mock-data'

export async function getWarga() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return mockWarga
    }

    return data
  } catch (error) {
    return mockWarga
  }
}
