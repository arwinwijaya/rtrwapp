import { createClient } from '@/lib/supabase/server'
import { GotongRoyong, ActivityType } from '@/types'

export async function getGotongRoyong(type?: ActivityType): Promise<GotongRoyong[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('gotong_royong')
      .select('*')
      .order('date', { ascending: true })

    if (type) {
      query = query.eq('activity_type', type)
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    return data as GotongRoyong[]
  } catch (error) {
    return []
  }
}
