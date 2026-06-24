'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ── design tokens ── */
const D = {
  bg:         '#09090B',
  surface:    '#111113',
  surface2:   '#18181B',
  border:     'rgba(255,255,255,0.08)',
  accent:     '#DFE104',
  accentDim:  'rgba(223,225,4,0.10)',
  muted:      'rgba(255,255,255,0.40)',
  muted2:     'rgba(255,255,255,0.20)',
  text:       '#F0F0F0',
} as const

const font = {
  heading: "'Barlow Condensed', sans-serif",
  body:    "'Hanken Grotesk', sans-serif",
} as const

/* ── shared style helpers ── */
const inputStyle: React.CSSProperties = {
  background:    D.surface2,
  border:        `1px solid ${D.border}`,
  color:         D.text,
  padding:       '10px 14px',
  borderRadius:  0,
  fontFamily:    font.body,
  fontSize:      '14px',
  width:         '100%',
  outline:       'none',
  boxSizing:     'border-box',
  appearance:    'none',
  WebkitAppearance: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily:    font.heading,
  fontSize:      '11px',
  fontWeight:    600,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color:         D.muted,
  display:       'block',
  marginBottom:  '6px',
}

type Amount = 60 | 75 | 90 | 'custom'
type SessionType = 'in-person' | 'remote'

const SPORTS = ['Soccer', 'Tennis', 'Basketball', 'Volleyball', 'Lacrosse', 'Other']
const AMOUNTS: Amount[] = [60, 75, 90, 'custom']

export default function GiftPage() {
  const [recipientName,  setRecipientName]  = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sport,          setSport]          = useState('Soccer')
  const [sessionType,    setSessionType]    = useState<SessionType>('in-person')
  const [message,        setMessage]        = useState('')
  const [amount,         setAmount]         = useState<Amount>(60)
  const [customAmount,   setCustomAmount]   = useState('')
  const [submitted,      setSubmitted]      = useState(false)

  /* derive displayed dollar amount */
  const displayAmount: string =
    amount === 'custom'
      ? customAmount.trim()
        ? `$${customAmount.replace(/^\$/, '')}`
        : '$—'
      : `$${amount}`

  return (
    <div
      style={{
        background:             D.bg,
        minHeight:              '100vh',
        color:                  D.text,
        fontFamily:             font.body,
        WebkitFontSmoothing:    'antialiased',
        MozOsxFontSmoothing:    'grayscale',
        overflowX:              'hidden',
      }}
    >

      {/* ── NAV ── */}
      <nav
        style={{
          position:     'sticky',
          top:          0,
          zIndex:       50,
          background:   D.bg,
          borderBottom: `1px solid ${D.border}`,
        }}
      >
        <div
          style={{
            maxWidth:       '1080px',
            margin:         '0 auto',
            padding:        '0 24px',
            height:         '60px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily:     font.heading,
              fontSize:       '22px',
              fontWeight:     800,
              letterSpacing:  '.06em',
              color:          D.accent,
              textDecoration: 'none',
            }}
          >
            FARM
          </Link>
          <Link
            href="/search"
            style={{
              fontFamily:     font.body,
              fontSize:       '14px',
              color:          D.muted,
              textDecoration: 'none',
            }}
          >
            Find a trainer →
          </Link>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          style={{ marginBottom: '44px' }}
        >
          <h1
            style={{
              fontFamily:    font.heading,
              fontSize:      '52px',
              fontWeight:    800,
              textTransform: 'uppercase',
              color:         D.text,
              margin:        '0 0 10px',
              lineHeight:    1,
              letterSpacing: '.02em',
            }}
          >
            Gift a Session
          </h1>
          <p
            style={{
              fontFamily: font.body,
              fontSize:   '16px',
              color:      D.muted,
              margin:     0,
            }}
          >
            Give the gift of expert coaching.
          </p>
        </motion.div>

        {/* ── BODY: form + preview ── */}
        <AnimatePresence mode="wait">
          {submitted ? (

            /* ── SUCCESS ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '20px',
                minHeight:      '340px',
                textAlign:      'center',
              }}
            >
              {/* checkmark */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="30" stroke={D.accent} strokeWidth="2.5" />
                <polyline
                  points="20,33 29,42 45,24"
                  stroke={D.accent}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <h2
                style={{
                  fontFamily:    font.heading,
                  fontSize:      '36px',
                  fontWeight:    800,
                  color:         D.accent,
                  margin:        0,
                  letterSpacing: '.04em',
                }}
              >
                Gift Sent.
              </h2>

              <p
                style={{
                  fontFamily: font.body,
                  fontSize:   '15px',
                  color:      D.muted,
                  maxWidth:   '440px',
                  margin:     0,
                  lineHeight: 1.6,
                }}
              >
                Gift sent to{' '}
                <span style={{ color: D.text }}>{recipientEmail || 'the recipient'}</span>.
                {' '}They&apos;ll receive instructions to book their session.
              </p>

              <button
                onClick={() => {
                  setSubmitted(false)
                  setRecipientName('')
                  setRecipientEmail('')
                  setSport('Soccer')
                  setSessionType('in-person')
                  setMessage('')
                  setAmount(60)
                  setCustomAmount('')
                }}
                style={{
                  background:     'none',
                  border:         'none',
                  cursor:         'pointer',
                  fontFamily:     font.body,
                  fontSize:       '15px',
                  color:          D.accent,
                  textDecoration: 'underline',
                  padding:        0,
                }}
              >
                Send another
              </button>
            </motion.div>

          ) : (

            /* ── FORM + PREVIEW ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                display:    'flex',
                flexWrap:   'wrap',
                gap:        '32px',
                alignItems: 'flex-start',
              }}
            >

              {/* ── FORM (left) ── */}
              <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* RECIPIENT NAME */}
                <div>
                  <label htmlFor="gift-recipient-name" style={labelStyle}>Recipient Name</label>
                  <input
                    id="gift-recipient-name"
                    type="text"
                    placeholder="Athlete's full name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* RECIPIENT EMAIL */}
                <div>
                  <label htmlFor="gift-recipient-email" style={labelStyle}>Recipient Email</label>
                  <input
                    id="gift-recipient-email"
                    type="email"
                    placeholder="parent@email.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* SPORT */}
                <div>
                  <label htmlFor="gift-sport" style={labelStyle}>Sport</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="gift-sport"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      style={{
                        ...inputStyle,
                        cursor: 'pointer',
                        paddingRight: '36px',
                      }}
                    >
                      {SPORTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {/* custom arrow */}
                    <svg
                      width="12"
                      height="7"
                      viewBox="0 0 12 7"
                      fill="none"
                      aria-hidden="true"
                      style={{
                        position:      'absolute',
                        right:         '12px',
                        top:           '50%',
                        transform:     'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    >
                      <polyline
                        points="1,1 6,6 11,1"
                        stroke="rgba(255,255,255,0.55)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* SESSION TYPE */}
                <div>
                  <span style={labelStyle}>Session Type</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['in-person', 'remote'] as SessionType[]).map((t) => {
                      const active = sessionType === t
                      return (
                        <button
                          key={t}
                          onClick={() => setSessionType(t)}
                          style={{
                            flex:          1,
                            padding:       '10px 0',
                            background:    active ? D.accent : 'transparent',
                            border:        `1px solid ${active ? D.accent : D.border}`,
                            color:         active ? D.bg : D.muted,
                            fontFamily:    font.heading,
                            fontSize:      '13px',
                            fontWeight:    700,
                            letterSpacing: '.10em',
                            textTransform: 'uppercase',
                            cursor:        'pointer',
                            borderRadius:  0,
                            transition:    'background .15s,color .15s,border-color .15s',
                          }}
                        >
                          {t === 'in-person' ? 'In-Person' : 'Remote'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* PERSONAL MESSAGE */}
                <div>
                  <label htmlFor="gift-message" style={labelStyle}>Personal Message</label>
                  <textarea
                    id="gift-message"
                    placeholder="Write a message for the recipient..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      ...inputStyle,
                      resize:  'vertical',
                      display: 'block',
                    }}
                  />
                </div>

                {/* AMOUNT */}
                <div>
                  <span style={labelStyle}>Amount</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {AMOUNTS.map((a) => {
                      const active = amount === a
                      const label  = a === 'custom' ? 'Custom' : `$${a}`
                      return (
                        <button
                          key={String(a)}
                          onClick={() => setAmount(a)}
                          style={{
                            padding:       '10px 20px',
                            background:    active ? D.accent : 'transparent',
                            border:        `1px solid ${active ? D.accent : D.border}`,
                            color:         active ? D.bg : D.muted,
                            fontFamily:    font.heading,
                            fontSize:      '13px',
                            fontWeight:    700,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            cursor:        'pointer',
                            borderRadius:  0,
                            transition:    'background .15s,color .15s,border-color .15s',
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {/* custom amount input */}
                  <AnimatePresence>
                    {amount === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{   opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', marginTop: '10px' }}
                      >
                        <input
                          type="text"
                          placeholder="$0"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
                          style={inputStyle}
                          aria-label="Custom amount"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SUBMIT */}
                <button
                  onClick={() => setSubmitted(true)}
                  style={{
                    width:         '100%',
                    padding:       '14px',
                    background:    D.accent,
                    border:        'none',
                    color:         D.bg,
                    fontFamily:    font.heading,
                    fontSize:      '15px',
                    fontWeight:    700,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    cursor:        'pointer',
                    borderRadius:  0,
                    marginTop:     '4px',
                    transition:    'opacity .15s',
                  }}
                >
                  Purchase Gift
                </button>
              </div>

              {/* ── GIFT CARD PREVIEW (right) ── */}
              <div
                style={{
                  width:     '320px',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  position:  'sticky',
                  top:       '80px',
                }}
              >
                <div
                  style={{
                    background: D.surface,
                    border:     `2px solid ${D.accent}`,
                    borderRadius: 0,
                    boxShadow:  '0 0 40px rgba(223,225,4,0.06)',
                    overflow:   'hidden',
                  }}
                >

                  {/* ── ticket top half ── */}
                  <div style={{ padding: '20px 22px 18px' }}>
                    {/* eyebrow */}
                    <div
                      style={{
                        fontFamily:    font.heading,
                        fontSize:      '11px',
                        fontWeight:    600,
                        letterSpacing: '.18em',
                        textTransform: 'uppercase',
                        color:         D.accent,
                        marginBottom:  '14px',
                      }}
                    >
                      FARM Gift Card
                    </div>

                    {/* amount */}
                    <div
                      style={{
                        fontFamily:    font.heading,
                        fontSize:      '52px',
                        fontWeight:    800,
                        color:         D.accent,
                        lineHeight:    1,
                        marginBottom:  '12px',
                        letterSpacing: '.01em',
                      }}
                    >
                      {displayAmount}
                    </div>

                    {/* sport tag */}
                    <div
                      style={{
                        fontFamily:    font.heading,
                        fontSize:      '12px',
                        fontWeight:    700,
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        color:         D.accent,
                        opacity:       0.65,
                      }}
                    >
                      {sport} · {sessionType === 'in-person' ? 'In-Person' : 'Remote'}
                    </div>
                  </div>

                  {/* ── ticket perforation ── */}
                  <div
                    style={{
                      position: 'relative',
                      height:   '1px',
                      margin:   '0 0',
                    }}
                    aria-hidden="true"
                  >
                    {/* left notch */}
                    <div
                      style={{
                        position:     'absolute',
                        left:         '-13px',
                        top:          '-10px',
                        width:        '20px',
                        height:       '20px',
                        borderRadius: '50%',
                        background:   D.bg,
                        border:       `2px solid ${D.accent}`,
                        borderLeft:   'none',
                      }}
                    />
                    {/* right notch */}
                    <div
                      style={{
                        position:     'absolute',
                        right:        '-13px',
                        top:          '-10px',
                        width:        '20px',
                        height:       '20px',
                        borderRadius: '50%',
                        background:   D.bg,
                        border:       `2px solid ${D.accent}`,
                        borderRight:  'none',
                      }}
                    />
                    {/* dashed rule */}
                    <div
                      style={{
                        position:   'absolute',
                        left:       '10px',
                        right:      '10px',
                        top:        '-0.5px',
                        height:     '1px',
                        background: `repeating-linear-gradient(
                          90deg,
                          rgba(223,225,4,0.30) 0px,
                          rgba(223,225,4,0.30) 6px,
                          transparent 6px,
                          transparent 11px
                        )`,
                      }}
                    />
                  </div>

                  {/* ── ticket bottom half ── */}
                  <div style={{ padding: '20px 22px 22px' }}>

                    {/* recipient */}
                    <div
                      style={{
                        fontFamily:   font.body,
                        fontSize:     '18px',
                        fontWeight:   600,
                        color:        recipientName ? D.text : D.muted,
                        marginBottom: '12px',
                        letterSpacing: '-.01em',
                      }}
                    >
                      {recipientName || 'Recipient Name'}
                    </div>

                    {/* message blockquote */}
                    <blockquote
                      style={{
                        borderLeft:  `2px solid ${D.accent}`,
                        margin:      '0 0 16px',
                        paddingLeft: '12px',
                        fontFamily:  font.body,
                        fontSize:    '13px',
                        fontStyle:   'italic',
                        lineHeight:  1.55,
                        color:       message ? D.muted : 'rgba(255,255,255,0.22)',
                      }}
                    >
                      {message || 'Your message will appear here…'}
                    </blockquote>

                    {/* footer line */}
                    <div
                      style={{
                        fontFamily:    font.heading,
                        fontSize:      '10px',
                        fontWeight:    600,
                        letterSpacing: '.13em',
                        textTransform: 'uppercase',
                        color:         D.muted2,
                        marginTop:     '4px',
                      }}
                    >
                      Redeemable for 1 training session on FARM
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
