'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// Same shape as the admin_roles check duplicated across the admin pages/layout —
// shared here so the dashboard headers can conditionally show an admin entry point.
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('admin_roles')
        .select('profile_id')
        .eq('profile_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setIsAdmin(true)
        })
    })
  }, [])

  return isAdmin
}
