'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, CheckCircle, Circle, Camera } from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  cyan: '#00BCC8',
  cyanLight: 'rgba(0,188,200,0.08)',
  cyanBorder: 'rgba(0,188,200,0.25)',
  border: 'rgba(0,0,0,0.08)',
  line: 'rgba(0,0,0,0.08)',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
  surface2: '#F0EFEB',
  danger: '#EF4444',
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const SPORTS = [
  'Soccer','Basketball','Tennis','Volleyball',
  'Lacrosse','Baseball','Swimming','Track'
]

const PROFILE_ITEMS = [
  { key: 'photo',     label: 'Profile photo',           boost: '+10%', completed: true  },
  { key: 'name',      label: 'Full name set',            boost: '+10%', completed: true  },
  { key: 'location',  label: 'Location set',             boost: '+10%', completed: true  },
  { key: 'phone',     label: 'Phone number added',       boost: '+10%', completed: false },
  { key: 'athlete',   label: 'Athlete profile created',  boost: '+30%', completed: true  },
  { key: 'sport',     label: 'Athlete sport set',        boost: '+20%', completed: true  },
  { key: 'notifs',    label: 'Notifications configured', boost: '+10%', completed: false },
]

const MOCK_ATHLETES = [
  { id: 1, initials: 'LC', name: 'Liam Chen', age: 13, sport: 'Soccer' },
]

const NOTIF_ROWS = [
  { key: 'sessionReminder', label: 'Session reminders',    desc: '1 hour before each session' },
  { key: 'newMessage',      label: 'New trainer messages', desc: 'When a trainer messages you' },
  { key: 'reviewReminder',  label: 'Review reminders',     desc: 'After each completed session' },
  { key: 'promos',          label: 'Promotional updates',  desc: 'Tips, offers, and platform news' },
]

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  padding: '0 14px',
  fontSize: '16px',
  fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111827',
  background: '#FFFFFF',
}

function SectionCard({
  children, id, dangerBorder
}: {
  children: React.ReactNode; id?: string; dangerBorder?: boolean
}) {
  return (
    <div id={id} style={{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '14px',
      padding: '24px',
      border: dangerBorder
        ? '1px solid rgba(239,68,68,0.2)'
        : '1px solid rgba(0,0,0,0.08)',
    }}>
      {children}
    </div>
  )
}

function CardLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: '11px',
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      color: danger ? T.danger : T.ink3,
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '13px', color: '#374151',
      fontFamily: "'Hanken Grotesk', sans-serif",
      fontWeight: 500, marginBottom: '6px',
    }}>
      {children}
    </div>
  )
}

function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height: '44px',
        background: T.cyan, color: '#FFFFFF',
        border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: 600,
        fontFamily: "'Hanken Grotesk', sans-serif",
        cursor: 'pointer', marginTop: '20px',
        letterSpacing: '.02em',
      }}
    >
      Save changes
    </button>
  )
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: on ? T.cyan : '#E5E7EB',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0, padding: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: on ? '22px' : '2px',
        width: '20px', height: '20px',
        borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'left 0.2s ease',
      }} />
    </button>
  )
}

// ── Section: Photo + Profile Strength ──────────────────────────────────────────

function PhotoSection({ initials }: { initials: string }) {
  const strength = PROFILE_ITEMS
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + parseInt(i.boost), 0)
  const [expanded, setExpanded] = useState(false)

  return (
    <SectionCard id="section-photo">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '999px',
            background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '30px', color: '#FFFFFF',
          }}>{initials}</div>
          <button style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '30px', height: '30px', borderRadius: '999px',
            background: T.cyan, border: '2px solid #FFFFFF',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 0,
          }}>
            <Camera size={14} color="#FFFFFF" />
          </button>
        </div>

        {/* Strength meter */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '20px', color: T.ink, marginBottom: '4px',
          }}>Profile strength</div>

          <div
            onClick={() => setExpanded((e) => !e)}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '8px 0',
              cursor: 'pointer', maxWidth: '320px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <div style={{
                width: '140px', height: '4px',
                background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden', flexShrink: 0,
              }}>
                <div style={{
                  width: `${strength}%`, height: '100%',
                  background: T.cyan, borderRadius: '999px',
                }} />
              </div>
              <span style={{
                fontSize: '13px', color: '#374151',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>{strength}% complete</span>
            </div>
            <ChevronDown
              size={16} color={T.ink3}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s', flexShrink: 0,
              }}
            />
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ maxWidth: '320px', paddingTop: '4px' }}>
                  {PROFILE_ITEMS.map((item, i) => (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 0',
                        borderBottom: i < PROFILE_ITEMS.length - 1
                          ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      {item.completed
                        ? <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                        : <Circle size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
                      }
                      <span style={{
                        flex: 1, fontSize: '13px',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        color: item.completed ? T.ink2 : T.ink,
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <span style={{
                          fontSize: '12px', color: T.cyan,
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          fontWeight: 600, flexShrink: 0,
                        }}>{item.boost}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button style={{
          height: '44px', padding: '0 20px',
          background: T.cyan, color: '#FFFFFF',
          border: 'none', borderRadius: '8px', fontSize: '14px',
          fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
        }}>Upload photo</button>
        <button style={{
          height: '44px', padding: '0 20px',
          background: 'transparent', color: T.ink2,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: '8px', fontSize: '14px',
          fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
        }}>Remove photo</button>
      </div>
    </SectionCard>
  )
}

// ── Section: Basic Info ────────────────────────────────────────────────────────

function BasicInfoSection() {
  const [firstName, setFirstName] = useState('Sarah')
  const [lastName, setLastName]   = useState('Chen')
  const [email, setEmail]         = useState('sarah.chen@email.com')
  const [phone, setPhone]         = useState('+1 (512) 555-0182')
  const [location, setLocation]   = useState('Austin, TX')

  return (
    <SectionCard id="section-basic-info">
      <CardLabel>Basic Info</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel>First name</FieldLabel>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputBase}
            />
          </div>
          <div>
            <FieldLabel>Last name</FieldLabel>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputBase}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            value={email} type="email"
            onChange={(e) => setEmail(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <input
            value={phone} type="tel"
            onChange={(e) => setPhone(e.target.value)}
            style={inputBase}
          />
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State"
            style={inputBase}
          />
        </div>
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Athletes ──────────────────────────────────────────────────────────

function AthletesSection() {
  const [athletes, setAthletes] = useState(MOCK_ATHLETES)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(id: number, field: string, value: string | number) {
    setAthletes((prev) =>
      prev.map((a) => a.id === id ? { ...a, [field]: value } : a)
    )
  }

  const selectStyle: React.CSSProperties = {
    ...inputBase,
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
    cursor: 'pointer',
  }

  return (
    <SectionCard id="section-athletes">
      <CardLabel>Athletes</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {athletes.map((athlete, i) => (
          <div key={athlete.id}>
            {editingId === athlete.id ? (
              <div style={{
                paddingTop: i > 0 ? '16px' : '0',
                paddingBottom: '16px',
                borderBottom: `1px solid ${T.line}`,
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px',
                  gap: '12px', marginBottom: '12px',
                }}>
                  <div>
                    <FieldLabel>Name</FieldLabel>
                    <input
                      style={inputBase} value={athlete.name}
                      onChange={(e) => handleChange(athlete.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Age</FieldLabel>
                    <input
                      style={inputBase} value={athlete.age} type="number"
                      onChange={(e) => handleChange(athlete.id, 'age', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <FieldLabel>Sport</FieldLabel>
                  <select
                    value={athlete.sport}
                    onChange={(e) => handleChange(athlete.id, 'sport', e.target.value)}
                    style={selectStyle}
                  >
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      flex: 1, height: '44px',
                      background: T.cyan, color: '#FFFFFF',
                      border: 'none', borderRadius: '8px', fontSize: '14px',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >Save</button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      height: '44px', padding: '0 16px',
                      background: 'transparent', color: T.ink2,
                      border: '1px solid rgba(0,0,0,0.12)',
                      borderRadius: '8px', fontSize: '14px',
                      fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                paddingTop: i > 0 ? '16px' : '0', paddingBottom: '16px',
                borderBottom: `1px solid ${T.line}`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '999px',
                  background: T.surface2, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: '14px', color: T.ink,
                }}>{athlete.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 600, fontSize: '15px', color: T.ink,
                  }}>{athlete.name}</div>
                  <div style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '13px', color: T.ink3,
                  }}>Age {athlete.age} · {athlete.sport}</div>
                </div>
                <button
                  onClick={() => setEditingId(athlete.id)}
                  style={{
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', color: T.cyan, fontSize: '13px',
                    fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
                  }}
                >Edit</button>
              </div>
            )}
          </div>
        ))}

        {/* Add athlete */}
        <Link
          href="/child/create"
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            paddingTop: '16px', color: T.ink2, textDecoration: 'none',
          }}
        >
          <div style={{
            width: 44, height: 44, background: T.surface2,
            borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke={T.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, fontSize: '15px', color: T.ink,
            }}>Add an athlete</div>
            <div style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '13px', color: T.ink3,
            }}>Create a profile for your child to find the right coach</div>
          </div>
        </Link>
      </div>
    </SectionCard>
  )
}

// ── Section: Notifications ─────────────────────────────────────────────────────

function NotificationsSection() {
  const [state, setState] = useState<Record<string, { email: boolean; sms: boolean }>>({
    sessionReminder: { email: true,  sms: false },
    newMessage:      { email: true,  sms: false },
    reviewReminder:  { email: true,  sms: false },
    promos:          { email: false, sms: false },
  })

  function toggle(key: string, ch: 'email' | 'sms') {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], [ch]: !prev[key][ch] } }))
  }

  return (
    <SectionCard id="section-notifications">
      <CardLabel>Notifications</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Column headers */}
        <div style={{
          display: 'flex', alignItems: 'center',
          paddingBottom: '8px', borderBottom: `1px solid ${T.line}`,
          marginBottom: '4px',
        }}>
          <div style={{ flex: 1 }} />
          {['Email', 'SMS'].map((ch) => (
            <div key={ch} style={{
              width: '52px', textAlign: 'center', flexShrink: 0,
              fontSize: '11px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            }}>{ch}</div>
          ))}
        </div>

        {NOTIF_ROWS.map((row, i) => (
          <div key={row.key} style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < NOTIF_ROWS.length - 1 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px', fontWeight: 500, color: T.ink,
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}>{row.label}</div>
              <div style={{
                fontSize: '12px', color: T.ink3,
                fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
              }}>{row.desc}</div>
            </div>
            <div style={{ width: '52px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <ToggleSwitch on={state[row.key].email} onChange={() => toggle(row.key, 'email')} />
            </div>
            <div style={{ width: '52px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <ToggleSwitch on={state[row.key].sms} onChange={() => toggle(row.key, 'sms')} />
            </div>
          </div>
        ))}
      </div>
      <SaveButton />
    </SectionCard>
  )
}

// ── Section: Danger Zone ───────────────────────────────────────────────────────

function DangerZoneSection() {
  return (
    <SectionCard dangerBorder>
      <CardLabel danger>Danger Zone</CardLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '16px 0', borderBottom: `1px solid ${T.line}`,
        }}>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 500, color: T.ink,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>Log out</div>
            <div style={{
              fontSize: '12px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
            }}>Sign out of your account on this device</div>
          </div>
          <button style={{
            padding: '8px 16px',
            border: '1px solid rgba(0,0,0,0.12)',
            color: T.ink2, background: 'transparent',
            borderRadius: '8px', fontSize: '14px',
            fontFamily: "'Hanken Grotesk', sans-serif",
            cursor: 'pointer', minHeight: '44px', flexShrink: 0,
          }}>Log out</button>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '16px 0',
        }}>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 500, color: T.danger,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>Delete account</div>
            <div style={{
              fontSize: '12px', color: T.ink3,
              fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '2px',
            }}>Permanently delete your account and all data</div>
          </div>
          <button style={{
            padding: '8px 16px',
            border: '1px solid rgba(239,68,68,0.4)',
            color: T.danger, background: 'transparent',
            borderRadius: '8px', fontSize: '14px',
            fontFamily: "'Hanken Grotesk', sans-serif",
            cursor: 'pointer', minHeight: '44px', flexShrink: 0,
          }}>Request deletion</button>
        </div>
      </div>
    </SectionCard>
  )
}

// ── View mode (public-facing profile) ─────────────────────────────────────────

function ViewMode({
  onEdit, name, location
}: {
  onEdit: () => void; name: string; location: string
}) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile card */}
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '32px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '12px', textAlign: 'center', position: 'relative',
      }}>
        {/* Edit button top right */}
        <button
          onClick={onEdit}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            border: '1.5px solid rgba(0,0,0,0.12)', color: T.ink2,
            background: 'transparent', borderRadius: '10px',
            padding: '7px 16px',
            fontFamily: "'Archivo', sans-serif", fontWeight: 700,
            fontSize: '13px', cursor: 'pointer',
          }}
        >Edit profile</button>

        {/* Avatar */}
        <div style={{
          width: 88, height: 88, borderRadius: '999px',
          background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: '28px', color: '#FFFFFF',
        }}>{initials}</div>

        {/* Name */}
        <div>
          <div style={{
            fontFamily: "'Archivo Black', 'Archivo', sans-serif",
            fontWeight: 900, fontSize: '26px', color: T.ink, lineHeight: 1.1,
          }}>{name}</div>
          <div style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '14px', color: T.ink3, marginTop: '6px',
          }}>{location}</div>
        </div>

        {/* Verified badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px 3px 8px',
          border: '1.5px solid #00BCC8', borderRadius: '999px',
          background: 'rgba(0,188,200,0.07)',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
               stroke="#00BCC8" strokeWidth={2.2}
               strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase',
            color: '#00838C',
          }}>Verified Parent</span>
        </div>

        {/* Member since */}
        <div style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '13px', color: T.ink3,
        }}>Member since June 2026</div>
      </div>

      {/* Athletes card — view only */}
      <div>
        <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: '11px', letterSpacing: '.12em',
            textTransform: 'uppercase', color: '#FFFFFF',
            background: 'rgba(0,0,0,0.38)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            padding: '3px 10px', borderRadius: '999px',
          }}>Athletes</span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)',
          padding: '0 24px',
        }}>
          {MOCK_ATHLETES.map((athlete, i) => (
            <div key={athlete.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 0',
              borderBottom: i < MOCK_ATHLETES.length - 1
                ? `1px solid ${T.line}` : 'none',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '999px',
                background: T.surface2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: '14px', color: T.ink,
              }}>{athlete.initials}</div>
              <div>
                <div style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontWeight: 600, fontSize: '15px', color: T.ink,
                }}>{athlete.name}</div>
                <div style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '13px', color: T.ink3,
                }}>Age {athlete.age} · {athlete.sport}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Edit mode ──────────────────────────────────────────────────────────────────

function EditMode({ onBack }: { onBack: () => void }) {
  const [name] = useState('Sarah Chen')
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Edit header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '28px', color: T.ink,
          }}>Edit profile</div>
          <div style={{
            fontSize: '14px', color: T.ink2,
            fontFamily: "'Hanken Grotesk', sans-serif", marginTop: '4px',
          }}>Changes are saved per section</div>
        </div>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: '1px solid rgba(0,0,0,0.12)', color: T.ink2,
            background: 'transparent', borderRadius: '8px',
            padding: '8px 16px', fontSize: '14px',
            fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer',
            minHeight: '44px',
          }}
        >← Back to profile</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PhotoSection initials={initials} />
        <BasicInfoSection />
        <AthletesSection />
        <NotificationsSection />
        <DangerZoneSection />
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ParentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 24px' }}>
        <motion.div
          key={isEditing ? 'edit' : 'view'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {isEditing ? (
            <EditMode onBack={() => setIsEditing(false)} />
          ) : (
            <ViewMode
              onEdit={() => setIsEditing(true)}
              name="Sarah Chen"
              location="Austin, TX"
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
