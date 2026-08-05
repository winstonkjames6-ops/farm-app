import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminCertifications from '@/components/admin/AdminCertifications'

const SIGNED_URL_EXPIRY_SECONDS = 300

export default async function Page() {
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

  const { data: trainers, error } = await supabase
    .from('trainers')
    .select(`
      id,
      bio,
      credentials,
      years_experience,
      id_verification_url,
      profile:profiles!profile_id(name, email)
    `)
    .eq('certification_status', 'pending')
    .order('id', { ascending: true })

  if (error) {
    console.error('[admin-certifications] fetch:', error.message)
  }

  const initialTrainers = await Promise.all(
    (trainers ?? []).map(async (row: any) => {
      let docUrl: string | null = null
      if (row.id_verification_url) {
        const { data: signed } = await supabase.storage
          .from('verification-docs')
          .createSignedUrl(row.id_verification_url, SIGNED_URL_EXPIRY_SECONDS)
        docUrl = signed?.signedUrl ?? null
      }
      return {
        id: row.id,
        name: row.profile?.name ?? 'Unknown',
        email: row.profile?.email ?? '',
        bio: row.bio ?? null,
        credentials: row.credentials ?? null,
        yearsExperience: row.years_experience ?? null,
        docUrl,
      }
    })
  )

  return <AdminCertifications initialTrainers={initialTrainers} />
}
