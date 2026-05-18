import { createClient } from '@/lib/supabase/server'
import { mockHousingProfile } from '@/lib/mock-data'

export async function getHousingProfile() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('housing_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      return mockHousingProfile
    }

    return data
  } catch (error) {
    return mockHousingProfile
  }
}
