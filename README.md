# FARM Landing Page

On-demand youth sports training marketplace landing page.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Add hero image (optional)

Replace the emoji placeholder in `components/Hero.tsx`:
- Go to Unsplash and search "youth sports training"
- Download an image
- Save as `public/hero.jpg`
- In Hero.tsx, replace the emoji div with:
```tsx
<img 
  src="/hero.jpg" 
  alt="Coach training youth athlete" 
  className="w-full h-full object-cover"
/>
```

## Project Structure

```
farm-landing-page/
├── app/
│   ├── layout.tsx        (Root layout)
│   ├── page.tsx          (Landing page)
│   └── globals.css       (Global styles)
├── components/
│   ├── Navbar.tsx        (Navigation)
│   ├── Hero.tsx          (Hero section)
│   ├── HowItWorks.tsx    (4-step process)
│   ├── WhyFARM.tsx       (6 benefits)
│   ├── FAQ.tsx           (Collapsible FAQs)
│   └── CTA.tsx           (Call-to-action footer)
├── tailwind.config.ts    (Color palette)
├── package.json
└── tsconfig.json
```

## Colors

- **Primary Orange**: `#ff8c42`
- **Dark Background**: `#1a1a1a`
- **Secondary Gray**: `#2a2a2a`

All configured in `tailwind.config.ts`.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set custom domain
# → Vercel dashboard → Settings → Domains
# → Add farm.coach
```

## Key Components

### Hero
- Headline + subheadline
- Two CTAs (parent / trainer signup)
- Background gradient overlay
- Social proof placeholders

### How It Works
- 4-step grid (browse, pick time, pay, rate)
- Interactive hover effects
- Emoji icons

### Why FARM
- 6 key benefits with expand animation
- 3-column responsive grid

### FAQ
- 6 collapsible accordion items
- Click to expand/collapse
- Email fallback

### CTA
- Final signup CTAs
- Footer with links
- Divider separator

## Styling

All components use:
- Tailwind CSS utilities
- Custom CSS variables (colors)
- Responsive design (mobile-first)
- Dark theme with orange accent

## Next Steps

Once deployed:
1. Door-knock Week 1 with farm.coach link
2. Post in Facebook groups
3. Share with coaches at Week 1–3
4. Track signup conversion rate
5. Build signup forms (Week 3)

---

Built for FARM validation phase (8 weeks).
