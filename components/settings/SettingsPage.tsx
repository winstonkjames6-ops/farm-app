'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { T } from '@/lib/theme'

type Role = 'parent' | 'trainer' | 'athlete'
type SupabaseClient = ReturnType<typeof createClient>

// ── Shared styles ──────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.90)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderRadius: '14px',
  border: '1px solid rgba(0,0,0,0.08)',
  padding: '20px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #E5E7EB',
  padding: '0 12px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none', boxSizing: 'border-box', color: T.ink, background: '#FFFFFF',
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: T.cyan, fontSize: '13px', fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif",
}

const secondaryBtnStyle: React.CSSProperties = {
  height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)',
  background: 'transparent', color: T.ink2, fontSize: '13px', fontWeight: 600,
  fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
}

const dangerBtnStyle: React.CSSProperties = {
  height: '36px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)',
  background: 'transparent', color: T.danger, fontSize: '13px', fontWeight: 700,
  fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
}

const errorTextStyle: React.CSSProperties = {
  fontSize: '12px', color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px',
}

const pendingTextStyle: React.CSSProperties = {
  fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '8px',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '11px',
      letterSpacing: '.12em', textTransform: 'uppercase' as const, color: T.ink3,
      marginBottom: '10px',
    }}>{children}</div>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '26px', borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

function ToggleRow({
  label, hint, on, onToggle, isLast,
}: {
  label: string
  hint?: string
  on: boolean
  onToggle: () => void
  isLast?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      padding: '14px 0', borderBottom: isLast ? 'none' : `1px solid ${T.line}`,
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
            {hint}
          </div>
        )}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const [supabase] = useState<SupabaseClient>(() => createClient())

  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [sessionReminders, setSessionReminders] = useState(true)
  const [messages, setMessages] = useState(true)
  const [reviewReminders, setReviewReminders] = useState(true)
  const [bookingRequests, setBookingRequests] = useState(true)
  const [promoUpdates, setPromoUpdates] = useState(false)
  const [shareProgress, setShareProgress] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      setUserId(user.id)
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('role, notif_session_reminders, notif_messages, notif_review_reminders, notif_promo_updates, notif_booking_requests, share_progress, public_profile')
        .eq('id', user.id)
        .single()
      if (data) {
        setRole(data.role)
        setSessionReminders(data.notif_session_reminders)
        setMessages(data.notif_messages)
        setReviewReminders(data.notif_review_reminders)
        setPromoUpdates(data.notif_promo_updates)
        setBookingRequests(data.notif_booking_requests)
        setShareProgress(data.share_progress)
        setPublicProfile(data.public_profile)
      }
      setLoaded(true)
    }
    load()
  }, [supabase])

  async function toggleField(column: string, current: boolean, setter: (v: boolean) => void) {
    const next = !current
    setter(next)
    if (!userId) return
    const { error } = await supabase.from('profiles').update({ [column]: next }).eq('id', userId)
    if (error) setter(current)
  }

  if (!loaded) return null

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <button
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              border: '1.5px solid rgba(0,0,0,0.12)', background: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, padding: 0,
            }}
          >
            <ArrowLeft size={18} color={T.ink} />
          </button>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '26px', color: T.ink,
          }}>Settings</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Notifications — all roles */}
          <div id="tour-settings-overview">
            <SectionLabel>Notifications</SectionLabel>
            <div style={cardStyle}>
              <ToggleRow
                label="Session reminders"
                hint="Get notified 1 hour before sessions"
                on={sessionReminders}
                onToggle={() => toggleField('notif_session_reminders', sessionReminders, setSessionReminders)}
              />
              <ToggleRow
                label={role === 'trainer' ? 'New messages' : 'New trainer messages'}
                hint={role === 'trainer' ? 'When a parent messages you' : 'When a trainer messages you'}
                on={messages}
                onToggle={() => toggleField('notif_messages', messages, setMessages)}
              />
              {role === 'trainer' && (
                <ToggleRow
                  label="Booking requests"
                  hint="When a parent requests a new session"
                  on={bookingRequests}
                  onToggle={() => toggleField('notif_booking_requests', bookingRequests, setBookingRequests)}
                />
              )}
              {role !== 'trainer' && (
                <ToggleRow
                  label="Review reminders"
                  hint="Reminder to rate completed sessions"
                  on={reviewReminders}
                  onToggle={() => toggleField('notif_review_reminders', reviewReminders, setReviewReminders)}
                />
              )}
              <ToggleRow
                label="Promotional updates"
                hint="Tips, offers, and platform news"
                on={promoUpdates}
                onToggle={() => toggleField('notif_promo_updates', promoUpdates, setPromoUpdates)}
                isLast
              />
            </div>
          </div>

          {/* Privacy — parent only */}
          {role === 'parent' && (
            <div>
              <SectionLabel>Privacy</SectionLabel>
              <div style={cardStyle}>
                <ToggleRow
                  label="Share athlete progress"
                  hint="Allow trainers to share session clips with other parents"
                  on={shareProgress}
                  onToggle={() => toggleField('share_progress', shareProgress, setShareProgress)}
                />
                <ToggleRow
                  label="Public profile"
                  hint="Let other parents and trainers see your review history"
                  on={publicProfile}
                  onToggle={() => toggleField('public_profile', publicProfile, setPublicProfile)}
                  isLast
                />
              </div>
            </div>
          )}

          {/* App */}
          <div>
            <SectionLabel>App</SectionLabel>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                    Language
                  </div>
                  <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
                    More languages coming soon
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif" }}>English</span>
              </div>
            </div>
          </div>

          {/* Account */}
          <AccountSection
            supabase={supabase}
            initialEmail={email}
            onLogOut={async () => { await supabase.auth.signOut(); router.push('/login') }}
            onDeleted={() => router.push('/')}
          />

        </div>
      </div>
    </div>
  )
}

// ── Account section ──────────────────────────────────────────────────────────

function AccountSection({
  supabase, initialEmail, onLogOut, onDeleted,
}: {
  supabase: SupabaseClient
  initialEmail: string
  onLogOut: () => void
  onDeleted: () => void
}) {
  const [editingEmail, setEditingEmail] = useState(false)
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailPending, setEmailPending] = useState<string | null>(null)
  const [savingEmail, setSavingEmail] = useState(false)

  const [editingPassword, setEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  async function handleSaveEmail() {
    if (email === initialEmail) { setEditingEmail(false); return }
    setSavingEmail(true); setEmailError(null); setEmailPending(null)
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/auth/callback` }
    )
    setSavingEmail(false)
    if (error) {
      setEmailError(error.message)
    } else {
      setEmailPending(`Confirmation email sent to ${email}. Your login email won't change until you click the link in that email.`)
      setEditingEmail(false)
    }
  }

  async function handleSavePassword() {
    setPasswordError(null); setPasswordSaved(false)
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setEditingPassword(false)
    }
  }

  return (
    <div>
      <SectionLabel>Account</SectionLabel>
      <div style={cardStyle}>

        {/* Email */}
        <div style={{ padding: '14px 0', borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Email
            </div>
            {!editingEmail && (
              <button onClick={() => setEditingEmail(true)} style={linkButtonStyle}>Change</button>
            )}
          </div>
          {editingEmail ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEmail() }} style={{ marginTop: '8px' }}>
              <input
                style={inputStyle} type="email" value={email} autoFocus
                disabled={savingEmail}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <span style={{ ...pendingTextStyle, marginTop: 0 }}>{savingEmail ? 'Saving…' : 'Press Enter to save'}</span>
                <button
                  type="button"
                  onClick={() => { setEditingEmail(false); setEmail(initialEmail); setEmailError(null) }}
                  style={secondaryBtnStyle}
                >Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ fontSize: '13px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
              {email}
            </div>
          )}
          {emailError && <div style={errorTextStyle}>{emailError}</div>}
          {emailPending && <div style={pendingTextStyle}>{emailPending}</div>}
        </div>

        {/* Password */}
        <div style={{ padding: '14px 0', borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                Password
              </div>
              {!editingPassword && (
                <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
                  ••••••••
                </div>
              )}
            </div>
            {!editingPassword && (
              <button
                onClick={() => { setEditingPassword(true); setPasswordSaved(false) }}
                style={linkButtonStyle}
              >Change</button>
            )}
          </div>
          {editingPassword && (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSavePassword() }}
              style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <input
                style={inputStyle} type="password" placeholder="New password" autoFocus
                disabled={savingPassword}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                style={inputStyle} type="password" placeholder="Confirm new password"
                disabled={savingPassword}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...pendingTextStyle, marginTop: 0 }}>{savingPassword ? 'Saving…' : 'Press Enter to save'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPassword(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(null)
                  }}
                  style={secondaryBtnStyle}
                >Cancel</button>
              </div>
            </form>
          )}
          {passwordError && <div style={errorTextStyle}>{passwordError}</div>}
          {passwordSaved && <div style={pendingTextStyle}>Password updated.</div>}
        </div>

        {/* Log out */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          padding: '14px 0', borderBottom: `1px solid ${T.line}`,
        }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: T.ink, fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Log out
          </div>
          <button onClick={onLogOut} style={secondaryBtnStyle}>Log out</button>
        </div>

        {/* Delete account */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: T.danger, fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Delete account
            </div>
            <div style={{ fontSize: '12px', color: T.ink3, fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px' }}>
              Permanently delete your account and all data
            </div>
          </div>
          <button onClick={() => setShowDeleteModal(true)} style={dangerBtnStyle}>Delete</button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          supabase={supabase}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={async () => {
            await supabase.auth.signOut()
            onDeleted()
          }}
        />
      )}
    </div>
  )
}

// ── Delete account confirmation modal ───────────────────────────────────────────

function DeleteAccountModal({
  supabase, onCancel, onDeleted,
}: {
  supabase: SupabaseClient
  onCancel: () => void
  onDeleted: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE' && !deleting

  async function handleDelete() {
    if (!canDelete) return
    setDeleting(true)
    setError(null)
    const { error } = await supabase.rpc('delete_own_account')
    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }
    onDeleted()
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '24px',
        width: '420px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px',
          color: T.danger, marginBottom: '4px',
        }}>Delete your account?</div>
        <div style={{
          fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif",
          lineHeight: 1.5, marginBottom: '16px',
        }}>
          This permanently deletes your profile, bookings, messages, and reviews. This cannot be undone.
        </div>
        <div style={{ fontSize: '13px', color: T.ink2, fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: '8px' }}>
          Type <strong>DELETE</strong> to confirm
        </div>
        <input
          style={inputStyle}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={deleting}
          placeholder="DELETE"
        />
        {error && <div style={errorTextStyle}>{error}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={handleDelete} disabled={!canDelete}
            style={{ ...dangerBtnStyle, flex: 1, height: '40px', opacity: canDelete ? 1 : 0.5 }}
          >{deleting ? 'Deleting…' : 'Delete my account'}</button>
          <button
            onClick={onCancel} disabled={deleting}
            style={{ ...secondaryBtnStyle, flex: 1, height: '40px' }}
          >Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
