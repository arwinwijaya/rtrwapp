import { createClient } from '@/lib/supabase/server'
import { RondaSchedule } from '@/types'

export async function getRondaSchedules(): Promise<RondaSchedule[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ronda_schedules')
      .select('*, ronda_assignments(*, residents(*))')
      .order('date', { ascending: true })

    if (error || !data) {
      return []
    }

    // Map nested data to match frontend types if needed
    return data.map(item => ({
      ...item,
      assignments: item.ronda_assignments?.map((a: any) => ({
        ...a,
        resident: a.residents
      }))
    })) as RondaSchedule[]
  } catch (error) {
    return []
  }
}
