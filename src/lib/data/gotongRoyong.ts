import { createClient } from '@/lib/supabase/server'
import { mockGotongRoyong } from '@/lib/mock-data'

export async function getGotongRoyong() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gotong_royong')
      .select('*')
      .order('date', { ascending: true })

    if (error || !data || data.length === 0) {
      return mockGotongRoyong
    }

    return data
  } catch (error) {
    return mockGotongRoyong
  }
}
