import { createClient } from '@/lib/supabase/server'
import { mockKontakDarurat } from '@/lib/mock-data'

export async function getKontakDarurat() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return mockKontakDarurat
    }

    return data
  } catch (error) {
    return mockKontakDarurat
  }
}
