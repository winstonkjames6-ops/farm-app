'use client'

import { useState } from 'react'
import Link from 'next/link'

const T = {
  bg: '#F8F8F6',
  cyan: '#00BCC8',
  accent: '#00BCC8',
  border: 'rgba(0,0,0,0.08)',
  line: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.08)',
  padding: '24px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid rgba(0,0,0,0.12)',
  borderRadius: '10px',
  fontFamily: "'Hanken Grotesk', sans-serif",
  fontSize: '14px',
  color: '#111827',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: '11px',
      letterSpacing: '.1em', textTransform: 'uppercase' as const,
      color: T.ink3, marginBottom: '6px',
    }}>{children}</div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '12px' }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: '11px',
        letterSpacing: '.12em', textTransform: 'uppercase' as const,
        color: '#FFFFFF',
        background: 'rgba(0,0,0,0.38)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '3px 10px', borderRadius: '999px',
      }}>{children}</span>
    </div>
  )
}

// ── Mock athlete data ──────────────────────────────────────────────────────────

const MOCK_ATHLETES = [
  { id: 1, initials: 'LC', name: 'Liam Chen', age: 13, sport: 'Soccer' },
]

const SPORTS = ['Soccer','Basketball','Tennis','Volleyball','Lacrosse','Baseball','Swimming','Track']

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ParentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('Sarah Chen')
  const [email, setEmail] = useState('sarah.chen@email.com')
  const [phone, setPhone] = useState('+1 (512) 555-0182')
  const [location, setLocation] = useState('Austin, TX')
  const [athletes, setAthletes] = useState(MOCK_ATHLETES)
  const [editingAthleteId, setEditingAthleteId] = useState<number | null>(null)

  function handleSave() {
    setIsEditing(false)
  }

  function handleAthleteChange(id: number, field: string, value: string | number) {
    setAthletes((prev) => prev.map((a) => a.id === id ? { ...a, [field]: value } : a))
  }

  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── Profile header card ── */}
          <div style={cardStyle}>
            {!isEditing ? (
              /* VIEW MODE */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: '999px',
                  background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: '22px', color: '#FFFFFF', flexShrink: 0,
                }}>{initials}</div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                    fontWeight: 900, fontSize: '24px', color: T.ink, marginBottom: '4px',
                  }}>{name}</div>
                  <div style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '14px', color: T.ink3, marginBottom: '4px',
                  }}>{email}</div>
                  <div style={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '14px', color: T.ink3, marginBottom: '8px',
                  }}>{location}</div>

                  {/* Verified badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px 3px 8px',
                    border: '1.5px solid #00BCC8', borderRadius: '999px',
                    background: 'rgba(0,188,200,0.07)',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                         stroke="#00BCC8" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: '10.5px', letterSpacing: '.1em', textTransform: 'uppercase',
                      color: '#00838C',
                    }}>Verified Parent</span>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        border: '1.5px solid rgba(0,0,0,0.12)', color: T.ink2,
                        background: 'transparent', borderRadius: '12px',
                        padding: '8px 20px',
                        fontFamily: "'Archivo', sans-serif", fontWeight: 700,
                        fontSize: '13px', cursor: 'pointer',
                      }}
                    >Edit profile</button>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Edit header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: "'Archivo', sans-serif", fontWeight: 700,
                    fontSize: '17px', color: T.ink,
                  }}>Edit profile</span>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.ink3, fontSize: '13px',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                    }}
                  >Cancel</button>
                </div>

                {/* Avatar upload placeholder */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '999px', flexShrink: 0,
                    background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: '20px', color: '#FFFFFF',
                  }}>{initials}</div>
                  <button style={{
                    border: '1.5px solid rgba(0,0,0,0.12)', background: 'transparent',
                    borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
                    fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px',
                    fontWeight: 600, color: T.ink2,
                  }}>Change photo</button>
                </div>

                {/* Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <FieldLabel>First name</FieldLabel>
                    <input
                      style={inputStyle}
                      value={name.split(' ')[0]}
                      onChange={(e) => setName(e.target.value + ' ' + name.split(' ').slice(1).join(' '))}
                    />
                  </div>
                  <div>
                    <FieldLabel>Last name</FieldLabel>
                    <input
                      style={inputStyle}
                      value={name.split(' ').slice(1).join(' ')}
                      onChange={(e) => setName(name.split(' ')[0] + ' ' + e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input style={inputStyle} value={email}
                    onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>

                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <input style={inputStyle} value={phone}
                    onChange={(e) => setPhone(e.target.value)} type="tel" />
                </div>

                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input style={inputStyle} value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State" />
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  style={{
                    background: '#00BCC8', color: '#FFFFFF', border: 'none',
                    borderRadius: '12px', padding: '12px 24px',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: '15px', letterSpacing: '.08em', textTransform: 'uppercase',
                    cursor: 'pointer', width: '100%',
                  }}
                >Save changes</button>
              </div>
            )}
          </div>

          {/* ── Athletes ── */}
          <div>
            <SectionHeading>Athletes</SectionHeading>
            <div style={cardStyle}>
              {athletes.map((athlete, i) => (
                <div key={athlete.id}>
                  {editingAthleteId === athlete.id ? (
                    /* Athlete edit row */
                    <div style={{
                      paddingBottom: '16px',
                      borderBottom: i < athletes.length - 1 ? `1px solid ${T.line}` : 'none',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <FieldLabel>Name</FieldLabel>
                          <input style={inputStyle} value={athlete.name}
                            onChange={(e) => handleAthleteChange(athlete.id, 'name', e.target.value)} />
                        </div>
                        <div>
                          <FieldLabel>Age</FieldLabel>
                          <input style={inputStyle} value={athlete.age} type="number"
                            onChange={(e) => handleAthleteChange(athlete.id, 'age', parseInt(e.target.value))} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <FieldLabel>Sport</FieldLabel>
                        <select
                          value={athlete.sport}
                          onChange={(e) => handleAthleteChange(athlete.id, 'sport', e.target.value)}
                          style={{
                            ...inputStyle,
                            appearance: 'none', WebkitAppearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            paddingRight: '36px',
                          }}
                        >
                          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setEditingAthleteId(null)}
                          style={{
                            flex: 1, background: '#00BCC8', color: '#FFFFFF',
                            border: 'none', borderRadius: '10px', padding: '10px',
                            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                            fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >Save</button>
                        <button
                          onClick={() => setEditingAthleteId(null)}
                          style={{
                            padding: '10px 16px', background: 'transparent',
                            border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '10px',
                            fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px',
                            fontWeight: 600, color: T.ink2, cursor: 'pointer',
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Athlete view row */
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      paddingBottom: '16px', paddingTop: i > 0 ? '16px' : '0',
                      borderBottom: i < athletes.length - 1 ? `1px solid ${T.line}` : 'none',
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '999px',
                        background: '#F0EFEB', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700, fontSize: '14px', color: T.ink,
                      }}>{athlete.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Archivo', sans-serif", fontWeight: 600,
                          fontSize: '15px', color: T.ink,
                        }}>{athlete.name}</div>
                        <div style={{
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          fontSize: '13px', color: T.ink3,
                        }}>Age {athlete.age} · {athlete.sport}</div>
                      </div>
                      <button
                        onClick={() => setEditingAthleteId(athlete.id)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: T.accent, fontSize: '13px',
                          fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
                        }}
                      >Edit</button>
                    </div>
                  )}
                </div>
              ))}

              {/* Divider before add */}
              <div style={{ borderTop: `1px solid ${T.line}`, marginTop: athletes.length > 0 ? '16px' : '0', paddingTop: '16px' }}>
                <Link
                  href="/child/create"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    color: T.ink2, textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, background: '#F0EFEB', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke={T.ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
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
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
