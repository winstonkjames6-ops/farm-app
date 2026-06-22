import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FARM | On-Demand Youth Sports Training',
  description: 'Book curated 1-on-1 trainers in your sport. 85% goes straight to your coach.',
  keywords: 'sports training, youth coaching, soccer, volleyball, tennis, lacrosse',
  openGraph: {
    title: 'FARM | On-Demand Youth Sports Training',
    description: 'Book curated 1-on-1 trainers in your sport.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
