'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { ResidentStatus, UserRole } from '@/types'

/**
 * Validates if the current user is an admin
 */
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'RT Admin' || profile?.role === 'RW Admin'
}

/**
 * Create a new resident
 */
export async function createResident(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const house_number = formData.get('house_number') as string
  const block = formData.get('block') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const family_members_count = parseInt(formData.get('family_members_count') as string || '1')
  const status = formData.get('status') as ResidentStatus
  const create_account = formData.get('create_account') === 'on'
  const password = formData.get('password') as string

  try {
    const supabase = await createClient()
    const { data: userAuth } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('housing_id').eq('id', userAuth.user?.id || '').single()
    const housing_id = adminProfile?.housing_id

    // 1. Create resident record
    const { data: resident, error: resError } = await supabase
      .from('residents')
      .insert({
        name,
        house_number,
        block,
        phone,
        email,
        family_members_count,
        status,
        housing_id,
        role: 'Warga'
      })
      .select()
      .single()

    if (resError) throw resError

    // 2. Optionally create Supabase Auth account
    if (create_account && email && password) {
      try {
        const adminSupabase = createAdminClient()
        const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name }
        })

        if (authError) {
           return { success: true, warning: 'Data warga tersimpan, tetapi pembuatan akun login gagal: ' + authError.message }
        }

        if (authUser.user) {
          await adminSupabase.from('profiles').insert({
            id: authUser.user.id,
            housing_id,
            name,
            email,
            role: 'Warga',
            status: 'Aktif',
            resident_id: resident.id
          })
          await adminSupabase.from('residents').update({ profile_id: authUser.user.id }).eq('id', resident.id)
        }
      } catch (err: any) {
        return { success: true, warning: 'Data warga tersimpan, tetapi pembuatan akun login membutuhkan konfigurasi server admin key.' }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/warga')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Generic Delete Action
 */
export async function deleteData(table: string, id: string) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

/**
 * Update Housing Profile
 */
export async function updateHousingProfile(id: string, data: any) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('housing_profiles').update(data).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/profil')
  return { success: true }
}

/**
 * Update Report Status
 */
export async function updateReportStatus(id: string, status: string, admin_notes?: string) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('reports').update({ status, admin_notes }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/laporan')
  return { success: true }
}

/**
 * Verify Payment
 */
export async function verifyPayment(id: string, admin_id: string, notes?: string) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('iuran_payments').update({ 
    status: 'Lunas', 
    verified_by: admin_id, 
    verified_at: new Date().toISOString(),
    notes: notes 
  }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/iuran')
  return { success: true }
}

/**
 * Create Iuran Period and Generate Payments
 */
export async function createIuranPeriod(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const iuran_type_id = formData.get('iuran_type_id') as string
  const month = formData.get('month') as string
  const year = parseInt(formData.get('year') as string)
  const amount = parseFloat(formData.get('amount') as string)
  const title = formData.get('title') as string
  const due_date = formData.get('due_date') as string
  const generate_payments = formData.get('generate_payments') === 'on'

  try {
    const supabase = await createClient()
    const { data: adminUser } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('housing_id').eq('id', adminUser.user?.id || '').single()
    const housing_id = adminProfile?.housing_id

    const { data: period, error: pError } = await supabase
      .from('iuran_periods')
      .insert({
        housing_id,
        iuran_type_id,
        title,
        month,
        year,
        amount,
        due_date,
        status: 'open'
      })
      .select()
      .single()

    if (pError) throw pError

    if (generate_payments) {
      const { data: residents } = await supabase.from('residents').select('id, name, house_number, block').eq('status', 'Aktif')
      if (residents && residents.length > 0) {
        const payments = residents.map(r => ({
          period_id: period.id,
          resident_id: r.id,
          resident_name: r.name,
          house_number: r.house_number,
          block: r.block,
          amount: amount,
          status: 'Belum Bayar'
        }))
        await supabase.from('iuran_payments').insert(payments)
      }
    }

    revalidatePath('/admin')
    revalidatePath('/iuran')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Create Agenda
 */
export async function createAgenda(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const category = formData.get('category') as any
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const visibility = formData.get('visibility') as any

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('agendas').insert({
      housing_id: profile?.housing_id,
      title,
      category,
      date,
      time,
      location,
      description,
      visibility,
      created_by: user.user?.id
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Create Announcement
 */
export async function createAnnouncement(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const priority = formData.get('priority') as any
  const visibility = formData.get('visibility') as any

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('announcements').insert({
      housing_id: profile?.housing_id,
      title,
      content,
      category,
      priority,
      visibility,
      publish_date: new Date().toISOString().split('T')[0],
      created_by: user.user?.id
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/pengumuman')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Create Gotong Royong
 */
export async function createGotongRoyong(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const required_participants = parseInt(formData.get('required_participants') as string || '0')

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('gotong_royong').insert({
      housing_id: profile?.housing_id,
      title,
      date,
      time,
      location,
      description,
      required_participants,
      status: 'Scheduled'
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/gotong-royong')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Create Emergency Contact
 */
export async function createEmergencyContact(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const phone = formData.get('phone') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const display_order = parseInt(formData.get('display_order') as string || '0')

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('emergency_contacts').insert({
      housing_id: profile?.housing_id,
      name,
      role,
      phone,
      category,
      description,
      display_order,
      is_active: true
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/kontak')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

