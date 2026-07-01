'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function AuthTestPage() {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [logInEmail, setLogInEmail] = useState('')
  const [logInPassword, setLogInPassword] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email: signUpEmail, password: signUpPassword })
    if (error) setError(error.message)
    else setMessage('Sign up successful — check your email to confirm.')
  }

  async function handleLogIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email: logInEmail, password: logInPassword })
    if (error) setError(error.message)
    else setMessage('Logged in.')
  }

  async function handleLogOut() {
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '32px', maxWidth: '480px' }}>
      <h1>Auth Test</h1>

      <section style={{ marginBottom: '24px', padding: '12px', border: '1px solid #ccc' }}>
        <strong>Auth state:</strong>{' '}
        {user ? (
          <>
            Logged in as <code>{user.email}</code>{' '}
            <button onClick={handleLogOut}>Log Out</button>
          </>
        ) : (
          'Not logged in'
        )}
      </section>

      {error && (
        <p style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Error: {error}
        </p>
      )}
      {message && (
        <p style={{ color: 'green', border: '1px solid green', padding: '8px' }}>
          {message}
        </p>
      )}

      <section style={{ marginBottom: '24px' }}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="email"
            placeholder="Email"
            value={signUpEmail}
            onChange={e => setSignUpEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={signUpPassword}
            onChange={e => setSignUpPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      </section>

      <section>
        <h2>Log In</h2>
        <form onSubmit={handleLogIn} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="email"
            placeholder="Email"
            value={logInEmail}
            onChange={e => setLogInEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={logInPassword}
            onChange={e => setLogInPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
      </section>
    </div>
  )
}
