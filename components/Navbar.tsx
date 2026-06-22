'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-dark-bg border-b border-dark-tertiary">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          <span className="text-orange-primary">FARM</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <a href="#how-it-works" className="text-text-secondary hover:text-orange-primary transition">
            How it works
          </a>
          <a href="#why-farm" className="text-text-secondary hover:text-orange-primary transition">
            Why FARM
          </a>
          <a href="#faq" className="text-text-secondary hover:text-orange-primary transition">
            FAQ
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex gap-4">
          <Link href="/auth/signup?type=parent" className="btn-secondary text-sm">
            I'm looking for a trainer
          </Link>
          <Link href="/auth/signup?type=trainer" className="btn-primary text-sm">
            I'm a trainer
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-orange-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-dark-secondary border-b border-dark-tertiary md:hidden">
            <div className="flex flex-col p-4 gap-4">
              <a href="#how-it-works" className="text-text-secondary">How it works</a>
              <a href="#why-farm" className="text-text-secondary">Why FARM</a>
              <a href="#faq" className="text-text-secondary">FAQ</a>
              <Link href="/auth/signup?type=parent" className="btn-secondary text-center">
                Looking for trainer
              </Link>
              <Link href="/auth/signup?type=trainer" className="btn-primary text-center">
                I'm a trainer
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
