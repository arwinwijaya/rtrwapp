import { createClient } from '@/lib/supabase/server'
import { mockPengumuman } from '@/lib/mock-data'

export async function getPengumuman() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false })

    if (error || !data || data.length === 0) {
      return mockPengumuman
    }

    return data
  } catch (error) {
    return mockPengumuman
  }
}
