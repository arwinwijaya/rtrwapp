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
 * Verify Payment (Admin Action)
 */
export async function verifyPayment(id: string, notes?: string) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin_id = user?.id;

  const { error } = await supabase.from('iuran_payments').update({
    status: 'Lunas',
    verified_by: admin_id,
    verified_at: new Date().toISOString(),
    paid_at: new Date().toISOString(), // Assume paid now if not set
    notes: notes
  }).eq('id', id);
  
  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  revalidatePath('/iuran');
  return { success: true };
}

/**
 * Reject Payment (Admin Action)
 */
export async function rejectPayment(id: string, notes: string) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase.from('iuran_payments').update({
    status: 'Ditolak',
    notes: notes
  }).eq('id', id);
  
  if (error) return { error: error.message };
  
  revalidatePath('/admin');
  revalidatePath('/iuran');
  return { success: true };
}

/**
 * Comprehensive Update/Create Payment Status
 */
export async function updatePaymentStatus(
  status: string, 
  resident_id: string, 
  period_id: string, 
  payment_id?: string, 
  notes?: string
) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin_id = user?.id;

  try {
    if (payment_id) {
      // Update existing payment row
      const updateData: any = { status, notes };
      
      if (status === 'Lunas') {
        updateData.verified_by = admin_id;
        updateData.verified_at = new Date().toISOString();
        updateData.paid_at = new Date().toISOString();
      } else if (status === 'Belum Bayar') {
        updateData.paid_at = null;
        updateData.verified_at = null;
        updateData.verified_by = null;
        updateData.payment_method = null;
        updateData.payment_proof_url = null;
      }

      const { error } = await supabase
        .from('iuran_payments')
        .update(updateData)
        .eq('id', payment_id);

      if (error) throw error;
    } else {
      // Create new payment row for this cell
      const { data: resident } = await supabase.from('residents').select('*').eq('id', resident_id).single();
      const { data: period } = await supabase.from('iuran_periods').select('amount').eq('id', period_id).single();

      if (!resident || !period) throw new Error('Data Warga atau Periode tidak ditemukan');

      const insertData: any = {
        period_id,
        resident_id,
        resident_name: resident.name,
        house_number: resident.house_number,
        block: resident.block,
        amount: period.amount,
        status,
        notes
      };

      if (status === 'Lunas') {
        insertData.verified_by = admin_id;
        insertData.verified_at = new Date().toISOString();
        insertData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('iuran_payments')
        .insert(insertData);

      if (error) throw error;
    }

    revalidatePath('/admin');
    revalidatePath('/iuran');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Confirm Payment (Resident Action)
 */
export async function confirmPayment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const payment_method = formData.get('payment_method') as string;
  const payment_proof_url = formData.get('payment_proof_url') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase.from('iuran_payments').update({
    status: 'Menunggu Verifikasi',
    payment_method,
    payment_proof_url,
    notes,
    paid_at: new Date().toISOString()
  }).eq('id', id);

  if (error) return { error: error.message };
  
  revalidatePath('/iuran');
  revalidatePath('/admin');
  return { success: true };
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
 * Create Activity (Gotong Royong / Kerja Bakti / Ronda)
 */
export async function createActivity(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const activity_type = formData.get('activity_type') as any || 'Gotong Royong'
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const host_name = formData.get('host_name') as string || null
  const required_participants = parseInt(formData.get('required_participants') as string || '0')
  const status = formData.get('status') as any || 'Scheduled'

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('gotong_royong').insert({
      housing_id: profile?.housing_id,
      title,
      activity_type,
      date,
      time,
      location,
      description,
      host_name,
      required_participants,
      status
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda')
    revalidatePath('/agenda/gotong-royong')
    revalidatePath('/agenda/kerja-bakti')
    revalidatePath('/agenda/yasinan')
    revalidatePath('/agenda/ronda')
    revalidatePath('/gotong-royong')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Generate Ronda Schedule
 */
export async function generateRondaSchedule(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const time = formData.get('time') as string || '22:00:00'
  const area = formData.get('area') as string || 'Lingkungan RT'
  const residents_per_day = parseInt(formData.get('residents_per_day') as string || '4')

  try {
    const supabase = await createClient()
    const { data: userAuth } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('housing_id').eq('id', userAuth.user?.id || '').single()
    const housing_id = adminProfile?.housing_id

    // 1. Get all active residents
    const { data: residents, error: resError } = await supabase
      .from('residents')
      .select('id')
      .eq('status', 'Aktif')
      .eq('housing_id', housing_id)
    
    if (resError) throw resError
    if (!residents || residents.length === 0) throw new Error('Tidak ada warga aktif untuk dijadwalkan.')

    // 2. Generate dates array
    const start = new Date(start_date)
    const end = new Date(end_date)
    const dates: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }

    // 3. Create schedules and assignments
    let residentIdx = 0
    for (const date of dates) {
      // Create schedule
      const { data: schedule, error: sError } = await supabase
        .from('ronda_schedules')
        .insert({
          housing_id,
          date,
          time,
          area,
          status: 'Scheduled'
        })
        .select()
        .single()

      if (sError) throw sError

      // Assign residents (rotation)
      const assignments = []
      for (let i = 0; i < residents_per_day; i++) {
        const resident = residents[residentIdx % residents.length]
        assignments.push({
          ronda_schedule_id: schedule.id,
          resident_id: resident.id,
          attendance_status: 'Belum Konfirmasi'
        })
        residentIdx++
      }

      const { error: aError } = await supabase.from('ronda_assignments').insert(assignments)
      if (aError) throw aError
    }

    revalidatePath('/admin')
    revalidatePath('/agenda/ronda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Create Single Ronda Schedule
 */
export async function createRondaSchedule(formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const date = formData.get('date') as string
  const time = formData.get('time') as string || '22:00:00'
  const area = formData.get('area') as string
  const notes = formData.get('notes') as string

  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('housing_id').eq('id', user.user?.id || '').single()

    const { error } = await supabase.from('ronda_schedules').insert({
      housing_id: profile?.housing_id,
      date,
      time,
      area,
      notes,
      status: 'Scheduled'
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda/ronda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Update Agenda
 */
export async function updateAgenda(id: string, formData: FormData) {
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
    const { error } = await supabase.from('agendas').update({
      title,
      category,
      date,
      time,
      location,
      description,
      visibility
    }).eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Update Activity (Gotong Royong / Yasinan)
 */
export async function updateActivity(id: string, formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const activity_type = formData.get('activity_type') as any
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const host_name = formData.get('host_name') as string || null
  const required_participants = parseInt(formData.get('required_participants') as string || '0')
  const status = formData.get('status') as any

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('gotong_royong').update({
      title,
      activity_type,
      date,
      time,
      location,
      description,
      host_name,
      required_participants,
      status
    }).eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda')
    revalidatePath('/agenda/gotong-royong')
    revalidatePath('/agenda/yasinan')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Update Single Ronda Schedule
 */
export async function updateRondaSchedule(id: string, formData: FormData) {
  if (!(await checkAdmin())) return { error: 'Unauthorized' }

  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const area = formData.get('area') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as any

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('ronda_schedules').update({
      date,
      time,
      area,
      notes,
      status
    }).eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/agenda/ronda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

