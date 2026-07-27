import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'trainer') {
          const { data: trainer } = await supabase
            .from('trainers')
            .select('years_experience, location, rate')
            .eq('profile_id', user.id)
            .single()
          const onboarded = !!(trainer && trainer.years_experience != null && trainer.location && trainer.rate != null)
          if (!onboarded) {
            return NextResponse.redirect(`${origin}/onboarding/setup`)
          }
        }
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
