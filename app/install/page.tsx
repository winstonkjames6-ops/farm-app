'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg: '#09090B',
  surface: '#111113',
  surface2: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  ink: '#FAFAFA',
  ink2: '#A1A1AA',
  ink3: '#71717A',
  yellow: '#00BCC8',
}

const barlow = "'Barlow Condensed', sans-serif"
const hanken = "'Hanken Grotesk', sans-serif"

// ── Device data ───────────────────────────────────────────────────────────────

type DeviceKey = 'ios' | 'android' | 'desktop'

const DEVICES: { key: DeviceKey; label: string }[] = [
  { key: 'ios', label: 'iOS' },
  { key: 'android', label: 'Android' },
  { key: 'desktop', label: 'Desktop' },
]

type Step = { icon: React.ReactNode; text: string }

const STEPS: Record<DeviceKey, Step[]> = {
  ios: [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
      text: "Tap the Share icon at the bottom of Safari",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <line x1="14" y1="17" x2="21" y2="17" />
          <line x1="17.5" y1="14" x2="17.5" y2="21" />
        </svg>
      ),
      text: "Scroll down and select \"Add to Home Screen\"",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      text: "Tap Add in the top-right corner",
    },
  ],
  android: [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
        </svg>
      ),
      text: "Tap the three-dot menu in the top-right of Chrome",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <line x1="14" y1="17" x2="21" y2="17" />
          <line x1="17.5" y1="14" x2="17.5" y2="21" />
        </svg>
      ),
      text: "Select \"Add to Home Screen\"",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      text: "Tap Add to confirm",
    },
  ],
  desktop: [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <rect x="2" y="3" width="20" height="14" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      text: "Look for the install icon (⊕) in your browser's address bar",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      text: "Click it and select \"Install\"",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      text: "FARM opens as a standalone app — no browser chrome",
    },
  ],
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InstallPage() {
  const [activeDevice, setActiveDevice] = useState<DeviceKey>('ios')

  const steps = STEPS[activeDevice]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        padding: '48px 20px 80px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: barlow,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: T.ink3,
            textDecoration: 'none',
            textTransform: 'uppercase',
            marginBottom: '36px',
          }}
        >
          ← Home
        </Link>

        {/* Headline */}
        <h1
          style={{
            fontFamily: barlow,
            fontWeight: 800,
            fontSize: 'clamp(36px, 8vw, 60px)',
            color: T.ink,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 0.95,
            margin: '0 0 10px',
          }}
        >
          Add FARM to
          <br />
          Your Home Screen
        </h1>
        <div style={{ width: 48, height: 3, background: T.yellow, marginBottom: '28px' }} />

        <p
          style={{
            fontFamily: hanken,
            fontSize: '15px',
            color: T.ink2,
            lineHeight: 1.55,
            margin: '0 0 32px',
          }}
        >
          Install FARM for instant access — no App Store required. Works on any device.
        </p>

        {/* Device tabs */}
        <div
          style={{
            display: 'flex',
            marginBottom: '28px',
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {DEVICES.map((d) => {
            const active = activeDevice === d.key
            return (
              <button
                key={d.key}
                onClick={() => setActiveDevice(d.key)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? `2px solid ${T.yellow}` : '2px solid transparent',
                  color: active ? T.yellow : T.ink3,
                  fontFamily: barlow,
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  transition: 'color 0.15s',
                }}
              >
                {d.label}
              </button>
            )
          })}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {steps.map((step, i) => (
            <motion.div
              key={`${activeDevice}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                background: T.surface,
                border: `1px solid ${T.border}`,
                padding: '18px 20px',
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: T.yellow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: barlow,
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#09090B',
                }}
              >
                {i + 1}
              </div>

              {/* Icon */}
              <div style={{ color: T.ink3, flexShrink: 0, paddingTop: '4px' }}>
                {step.icon}
              </div>

              {/* Text */}
              <p
                style={{
                  fontFamily: hanken,
                  fontSize: '14px',
                  color: T.ink2,
                  lineHeight: 1.5,
                  margin: 0,
                  paddingTop: '3px',
                }}
              >
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* App mockup */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            padding: '28px 20px',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: T.yellow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontFamily: barlow,
              fontWeight: 800,
              fontSize: '28px',
              color: '#09090B',
              letterSpacing: '0.04em',
            }}
          >
            F
          </div>
          <div
            style={{
              fontFamily: barlow,
              fontWeight: 700,
              fontSize: '15px',
              color: T.ink,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            FARM
          </div>
          <div
            style={{
              fontFamily: hanken,
              fontSize: '12px',
              color: T.ink3,
              lineHeight: 1.4,
            }}
          >
            Looks like this on your home screen
          </div>
        </div>

        {/* Done button */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button
            style={{
              width: '100%',
              padding: '15px',
              background: T.yellow,
              border: 'none',
              color: '#09090B',
              fontFamily: barlow,
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
