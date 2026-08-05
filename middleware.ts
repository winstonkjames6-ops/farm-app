import '@/lib/env'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove, required for Server Components to read auth state
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const gatedPrefixes = [
    '/dashboard',
    '/onboarding-athlete-preview-tmp',
    '/onboarding-parent-preview-tmp',
    '/onboarding-preview-tmp',
    '/pc-preview-tmp',
    '/settings-preview-tmp',
  ]

  if (gatedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/dashboard') && user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile?.role) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const role = profile.role as 'parent' | 'trainer' | 'athlete'
    const roleHome = role === 'trainer' ? '/dashboard/trainer'
      : role === 'athlete' ? '/dashboard/athlete'
      : '/dashboard'

    if (pathname.startsWith('/dashboard/trainer') && role !== 'trainer') {
      return NextResponse.redirect(new URL(roleHome, request.url))
    }

    if (pathname.startsWith('/dashboard/athlete') && role !== 'athlete') {
      return NextResponse.redirect(new URL(roleHome, request.url))
    }

    if (
      !pathname.startsWith('/dashboard/trainer') &&
      !pathname.startsWith('/dashboard/athlete') &&
      !pathname.startsWith('/dashboard/admin') &&
      role !== 'parent'
    ) {
      return NextResponse.redirect(new URL(roleHome, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
