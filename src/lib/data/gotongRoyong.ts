import { createClient } from '@/lib/supabase/server'
import { mockGotongRoyong } from '@/lib/mock-data'
import { GotongRoyong } from '@/types'

export async function getGotongRoyong(): Promise<GotongRoyong[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gotong_royong')
      .select('*')
      .order('date', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as GotongRoyong[]
  } catch (error) {
    return []
  }
}
