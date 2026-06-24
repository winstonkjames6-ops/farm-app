'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const ACCENT = '#DFE104'

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    body: `By creating an account or using the FARM platform in any way, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not access or use the platform.

FARM reserves the right to update or modify these Terms at any time. We will provide notice of material changes by updating the "Last Updated" date at the top of this page or by sending an email to the address associated with your account. Your continued use of FARM after any changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    id: 'platform-use',
    title: 'Platform Use',
    body: `FARM is a marketplace that connects parents and youth athletes with independent sports trainers. You must be at least 18 years old to create an account. Minors may use the platform only under the direct supervision of a parent or legal guardian who has accepted these Terms on their behalf.

You agree not to use FARM to engage in any unlawful activity, misrepresent your identity or credentials, harass or harm other users, scrape or copy platform content without permission, or attempt to circumvent FARM's payment system by arranging sessions outside the platform. FARM reserves the right to suspend or permanently terminate any account that violates these rules.`,
  },
  {
    id: 'payments',
    title: 'Payments and Refunds',
    body: `Session fees are charged at the time of booking via Stripe, our payment processor. Trainers set their own hourly rates. FARM retains 15% of each session fee to cover platform operations; trainers receive the remaining 85%.

Cancellations made more than 24 hours before a scheduled session are eligible for a full refund to the original payment method within 5–10 business days. Cancellations made within 24 hours of a session are non-refundable, unless the cancellation is initiated by the trainer — in which case a full refund is automatically issued. FARM does not facilitate cash payments or off-platform financial arrangements.`,
  },
  {
    id: 'trainer-responsibilities',
    title: 'Trainer Responsibilities',
    body: `Trainers who use FARM are independent contractors, not employees or agents of FARM. By listing yourself as a trainer on the platform, you represent that all information on your profile — including credentials, experience, sport specializations, and availability — is accurate and current.

You agree to maintain any certifications or licenses your profile claims, conduct sessions in a safe and professional manner, arrive on time or communicate promptly if you need to reschedule, and comply with all applicable laws including those governing youth activity and data privacy. Trainers are solely responsible for their own income taxes and any applicable business licensing requirements.`,
  },
  {
    id: 'parent-responsibilities',
    title: 'Parent Responsibilities',
    body: `Parents and guardians are responsible for ensuring their child is in good health and medically cleared to participate in physical activity before booking a session. You agree to provide trainers with accurate, complete information about your child's health, physical limitations, and any conditions that may affect their ability to train safely.

By booking a session, you acknowledge that youth sports training carries inherent physical risks and agree to hold FARM harmless for injuries that occur during or as a result of a session. You are responsible for your child's behaviour during sessions and for ensuring they follow the trainer's instructions.`,
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    body: `FARM is a technology platform and does not employ, endorse, or supervise trainers. We are not a party to the training relationship between trainers and families and are not liable for the conduct, actions, or omissions of any trainer or parent on or off the platform.

To the maximum extent permitted by applicable law, FARM's total liability to you for any claim arising out of or related to your use of the platform shall not exceed the total amount you paid to FARM in the 30-day period immediately preceding the event giving rise to the claim. In no event shall FARM be liable for any indirect, incidental, punitive, special, or consequential damages, even if advised of the possibility of such damages.`,
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
      margin: '0 0 14px',
    }}>
      {title}
    </h2>
  )
}

function SectionBody({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.7)',
          margin: i < text.split('\n\n').length - 1 ? '0 0 14px' : '0',
        }}>
          {para}
        </p>
      ))}
    </>
  )
}

export default function TermsPage() {
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
              Terms of Service
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
            These Terms of Service govern your use of the FARM platform, website, and mobile applications. Please read them carefully. By accessing FARM, you agree to be bound by these terms.
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

          {/* Contact */}
          <div style={{
            marginTop: '64px', padding: '28px 32px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: '0 0 6px' }}>
              Questions about these terms?
            </p>
            <a href="mailto:legal@farmtraining.com" style={{
              color: ACCENT, textDecoration: 'none', fontWeight: 600, fontSize: '15px',
              transition: 'opacity .15s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
            >
              legal@farmtraining.com
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
          <Link href="/terms" style={{ color: ACCENT, textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color .15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >Privacy</Link>
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
