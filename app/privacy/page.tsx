'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const ACCENT = '#DFE104'

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    body: `We collect information you provide directly when you create an account, book a session, or contact us. This includes your name, email address, phone number, payment information, and — for parents — your child's first name, age, and sport interests. Trainers additionally provide credential documents, a profile photo, and their availability.

We also collect information automatically when you use FARM, including your IP address, device type, browser, the pages you visit, session timestamps, and in-app behaviour. This data helps us keep the platform secure, debug issues, and understand how users interact with FARM.`,
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    body: `We use the information we collect to create and manage your account, process payments and send receipts, match parents with appropriate trainers, send booking confirmations, reminders, and platform updates, investigate fraud or misuse, and comply with legal obligations.

We may use aggregated, anonymised data to improve our recommendation algorithms, pricing tools, and overall platform experience. We do not use your personal data to serve third-party advertising and we do not sell your data to any third party.`,
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    body: `When you book a session, we share limited information with the trainer: your name, your child's first name, the session type and sport, and any notes you include at booking. Trainers do not receive your payment details.

We use Stripe to process payments; your card details are transmitted directly to Stripe and are never stored on FARM's servers. We may share data with service providers (cloud hosting, analytics, email delivery) who process it strictly on our behalf under confidentiality agreements. We may disclose personal data if required by law, court order, or to protect the safety of our users or the public.`,
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: `FARM uses cookies and similar technologies (such as local storage) to keep you signed in between sessions, remember your preferences, and understand how you navigate the platform. We use first-party analytics cookies to measure feature usage — we do not use third-party advertising or tracking cookies.

You can disable or delete cookies through your browser settings. Doing so may affect your ability to stay signed in or use certain platform features. We do not use fingerprinting or cross-site tracking technologies.`,
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    body: `You have the right to access the personal data we hold about you, to correct inaccuracies, and to request deletion of your account and associated data. To submit any of these requests, email us at privacy@farmtraining.com. We will respond within 30 days.

If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to opt out of any sale of personal information (we do not sell data) and the right to non-discrimination for exercising your privacy rights. If you are in the European Union or United Kingdom, you have rights under the GDPR including the right to data portability and the right to lodge a complaint with your local supervisory authority.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: `If you have questions, concerns, or requests relating to this Privacy Policy or how FARM handles your data, please reach out to our privacy team.

Email: privacy@farmtraining.com
Response time: within 5 business days

FARM is operated by FARM Technologies, Inc. We take your privacy seriously and will do our best to address any concern promptly and transparently.`,
  },
]

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: '13px',
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: ACCENT,
      margin: 0,
    }}>
      {title}
    </h2>
  )
}

function SectionBody({ text }: { text: string }) {
  const paras = text.split('\n\n')
  return (
    <>
      {paras.map((para, i) => (
        <p key={i} style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.7)',
          margin: i < paras.length - 1 ? '0 0 14px' : '0',
          whiteSpace: 'pre-line',
        }}>
          {para}
        </p>
      ))}
    </>
  )
}

export default function PrivacyPage() {
  return (
    <div id="top" style={{
      minHeight: '100vh', background: '#0B0B0F', color: '#fff',
      fontFamily: "'Hanken Grotesk', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '8px', background: '#22C55E',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '16px', color: '#000',
          }}>F</span>
          <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '.02em' }}>FARM</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/how-it-works" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, transition: 'color .15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >How it works</Link>
          <Link href="/login" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, transition: 'color .15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >Log in</Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '72px 24px 120px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ width: '100%', maxWidth: '720px' }}
        >
          {/* Page heading */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: '12px', letterSpacing: '.18em',
              textTransform: 'uppercase', color: ACCENT,
              margin: '0 0 14px',
            }}>
              Legal
            </p>
            <h1 style={{
              fontFamily: "'Archivo', sans-serif", fontWeight: 900,
              fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-.03em',
              lineHeight: 1.05, margin: '0 0 12px', color: '#fff',
            }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Last updated: June 2026
            </p>
          </div>

          {/* Intro */}
          <p style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '15px', lineHeight: 1.75,
            color: 'rgba(255,255,255,0.55)',
            margin: '0 0 56px',
            paddingBottom: '56px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            Your privacy matters to us. This policy explains what data FARM collects, why we collect it, and how you can control it. We aim to be direct and clear — no legal boilerplate that obscures what we actually do.
          </p>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sections.map((section, i) => (
              <div key={section.id} id={section.id}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: '12px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '.06em', flexShrink: 0,
                  }}>
                    0{i + 1}
                  </span>
                  <SectionHeading title={section.title} />
                </div>
                <div style={{ paddingLeft: '32px' }}>
                  <SectionBody text={section.body} />
                </div>
                {i < sections.length - 1 && (
                  <div style={{ marginTop: '48px', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Contact callout */}
          <div style={{
            marginTop: '64px', padding: '28px 32px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: '0 0 6px' }}>
              Privacy questions or data requests?
            </p>
            <a href="mailto:privacy@farmtraining.com" style={{
              color: ACCENT, textDecoration: 'none', fontWeight: 600, fontSize: '15px',
              transition: 'opacity .15s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
            >
              privacy@farmtraining.com
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '28px 32px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '24px', height: '24px', borderRadius: '6px', background: '#22C55E',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '13px', color: '#000',
          }}>F</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© FARM 2026. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color .15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >Terms</Link>
          <Link href="/privacy" style={{ color: ACCENT, textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Privacy</Link>
          <a href="mailto:hello@farmtraining.com" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color .15s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)' }}
          >Contact</a>
        </div>
      </footer>

      {/* Back to top */}
      <a
        href="#top"
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 40,
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '9px 14px',
          background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          fontSize: '12px', fontWeight: 600, letterSpacing: '.04em',
          fontFamily: "'Hanken Grotesk', sans-serif",
          transition: 'border-color .15s ease, color .15s ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(255,255,255,0.3)'
          el.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(255,255,255,0.15)'
          el.style.color = 'rgba(255,255,255,0.6)'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
        Top
      </a>

    </div>
  )
}
