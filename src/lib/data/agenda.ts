import { createClient } from '@/lib/supabase/server'
import { mockAgendas } from '@/lib/mock-data'
import { Agenda } from '@/types'

export async function getAgendas(): Promise<Agenda[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .order('date', { ascending: true })

    if (error || !data || data.length === 0) {
      return mockAgendas as Agenda[]
    }

    return data as Agenda[]
  } catch (error) {
    return mockAgendas as Agenda[]
  }
}
