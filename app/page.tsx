import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import CredentialBar from '@/components/landing/CredentialBar'
import HowItWorks from '@/components/landing/HowItWorks'
import WhyFarm from '@/components/landing/WhyFarm'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import PartnerMarquee from '@/components/landing/PartnerMarquee'
import Faq from '@/components/landing/Faq'
import CtaBand from '@/components/landing/CtaBand'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="bg-farm-bg">
      <Nav />
      <Hero />
      <CredentialBar />
      <HowItWorks />
      <WhyFarm />
      <Pricing />
      <Testimonials />
      <PartnerMarquee />
      <Faq />
      <CtaBand />
      <Footer />
    </div>
  )
}
