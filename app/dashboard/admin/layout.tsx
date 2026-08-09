import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: adminRow } = await supabase
    .from('admin_roles')
    .select('profile_id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    redirect('/dashboard')
  }

  return <AdminShell>{children}</AdminShell>
}
