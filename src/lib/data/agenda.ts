import { createClient } from '@/lib/supabase/server'
import { mockAgendas } from '@/lib/mock-data'

export async function getAgendas() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .order('date', { ascending: true })

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch failed or empty, falling back to mock agendas", error)
      return mockAgendas
    }

    return data
  } catch (error) {
    console.warn("Supabase not configured, falling back to mock agendas")
    return mockAgendas
  }
}
