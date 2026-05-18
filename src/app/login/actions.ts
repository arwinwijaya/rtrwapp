'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // mock login fallback for development if Supabase isn't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Just mock redirect to admin for demo purposes if no supabase
    const email = formData.get('email') as string
    if (email.includes('admin')) redirect('/admin')
    else redirect('/warga')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Email atau password salah.' }
  }

  // Fetch role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user?.id)
    .single()

  revalidatePath('/', 'layout')

  if (profile?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/warga')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
