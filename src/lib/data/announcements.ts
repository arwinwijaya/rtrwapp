import { createClient } from '@/lib/supabase/server'
import { mockPengumuman } from '@/lib/mock-data'
import { Pengumuman } from '@/types'

export async function getPengumuman(): Promise<Pengumuman[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false })

    if (error || !data) {
      return []
    }

    return data as Pengumuman[]
  } catch (error) {
    return []
  }
}
