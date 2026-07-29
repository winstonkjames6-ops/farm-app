'use client'

import { ProfileCard } from '@/components/profile/ProfileCard'
import { MapPin, Mail } from 'lucide-react'

const BANNER = 'data:image/svg+xml;base64,' + btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0%" stop-color="#0d8f9c"/><stop offset="100%" stop-color="#00343a"/>' +
  '</linearGradient></defs><rect width="800" height="300" fill="url(#g)"/></svg>'
)

const contactRows = [
  { key: 'location', icon: <MapPin size={13} />, label: 'Austin, TX' },
  { key: 'email', icon: <Mail size={13} />, label: 'jordan@example.com' },
]

const stats = [
  { value: '24', label: 'Sessions' },
  { value: '4.9', label: 'Rating' },
]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ fontFamily: 'sans-serif', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>{label}</div>
      <div style={{ maxWidth: '420px' }}>{children}</div>
    </div>
  )
}

export default function Preview() {
  return (
    <div style={{ padding: '40px', background: '#333', minHeight: '100vh' }}>
      <Row label="LIGHT (no banner, theme_preference=light)">
        <ProfileCard
          themePreference="light"
          backgroundMode="full"
          bannerImageUrl={null}
          name="Jordan Smith"
          verified
          verifiedLabel="Verified"
          metaLine="Youth soccer coach · 8 years experience"
          specialtyTags={['Soccer', 'Speed & Agility']}
          stats={stats}
          contactRows={contactRows}
          onEditProfile={() => {}}
          onOpenSettings={() => {}}
        />
      </Row>
      <Row label="DARK (no banner, theme_preference=dark)">
        <ProfileCard
          themePreference="dark"
          backgroundMode="full"
          bannerImageUrl={null}
          name="Jordan Smith"
          verified
          verifiedLabel="Verified"
          metaLine="Youth soccer coach · 8 years experience"
          specialtyTags={['Soccer', 'Speed & Agility']}
          stats={stats}
          contactRows={contactRows}
          onEditProfile={() => {}}
          onOpenSettings={() => {}}
        />
      </Row>
      <Row label="BANNER, theme_preference=light + banner_image_url set (background_mode=full, ignored)">
        <ProfileCard
          themePreference="light"
          backgroundMode="full"
          bannerImageUrl={BANNER}
          name="Jordan Smith"
          verified
          verifiedLabel="Verified"
          metaLine="Youth soccer coach · 8 years experience"
          specialtyTags={['Soccer', 'Speed & Agility']}
          stats={stats}
          contactRows={contactRows}
          onEditProfile={() => {}}
          onOpenSettings={() => {}}
        />
      </Row>
      <Row label="BANNER, theme_preference=dark + banner_image_url set">
        <ProfileCard
          themePreference="dark"
          backgroundMode="full"
          bannerImageUrl={BANNER}
          name="Jordan Smith"
          verified
          verifiedLabel="Verified"
          metaLine="Youth soccer coach · 8 years experience"
          specialtyTags={['Soccer', 'Speed & Agility']}
          stats={stats}
          contactRows={contactRows}
          onEditProfile={() => {}}
          onOpenSettings={() => {}}
        />
      </Row>
    </div>
  )
}
