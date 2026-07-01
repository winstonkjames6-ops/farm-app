'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTour } from './tour-context'

function useElementRect(targetId: string | null, active: boolean, stepIndex: number) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!targetId || !active) { setRect(null); return }

    let rafId: number
    let scrollTimeout: ReturnType<typeof setTimeout>

    function measure() {
      const el = document.getElementById(targetId!)
      if (el) {
        // Scroll element into view so it's visible before measuring
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Wait for scroll to complete then measure
        scrollTimeout = setTimeout(() => {
          const el2 = document.getElementById(targetId!)
          if (el2) setRect(el2.getBoundingClientRect())
        }, 400)
      }
    }

    // Re-measure on scroll — keeps spotlight locked to element
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const el = document.getElementById(targetId!)
        if (el) setRect(el.getBoundingClientRect())
      })
    }

    // Initial measure — delay longer after step changes to allow route/render
    const t1 = setTimeout(measure, 100)
    const t2 = setTimeout(() => {
      const el = document.getElementById(targetId!)
      if (el) setRect(el.getBoundingClientRect())
    }, 800)
    const t3 = setTimeout(() => {
      const el = document.getElementById(targetId!)
      if (el) setRect(el.getBoundingClientRect())
    }, 1200)

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    // Also listen on the main scrollable container
    document.querySelectorAll('main').forEach(el => {
      el.addEventListener('scroll', onScroll, { passive: true })
    })

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(scrollTimeout)
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', onScroll)
      document.querySelectorAll('main').forEach(el => {
        el.removeEventListener('scroll', onScroll)
      })
    }
  }, [targetId, active, stepIndex])

  return rect
}

const PAD = 12

export default function TourOverlay() {
  const { active, currentStep, stepIndex, steps, nextStep, prevStep, endTour } = useTour()
  const rect = useElementRect(currentStep?.targetId ?? null, active, stepIndex)

  if (!active || !currentStep) return null

  const spotX = rect ? rect.left - PAD : -999
  const spotY = rect ? rect.top - PAD : -999
  const spotW = rect ? rect.width + PAD * 2 : 0
  const spotH = rect ? rect.height + PAD * 2 : 0

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const tooltipW = 280

  let tooltipX = 0
  let tooltipY = 0
  let arrowSide: 'top' | 'bottom' | 'left' | 'right' = 'top'

  if (rect) {
    const pos = currentStep.position
    if (pos === 'bottom') {
      tooltipX = Math.min(Math.max(rect.left + rect.width / 2 - tooltipW / 2, 16), vw - tooltipW - 16)
      tooltipY = rect.bottom + PAD + 12
      arrowSide = 'top'
    } else if (pos === 'top') {
      tooltipX = Math.min(Math.max(rect.left + rect.width / 2 - tooltipW / 2, 16), vw - tooltipW - 16)
      tooltipY = rect.top - PAD - 12 - 140
      arrowSide = 'bottom'
    } else if (pos === 'right') {
      tooltipX = rect.right + PAD + 12
      tooltipY = rect.top + rect.height / 2 - 70
      arrowSide = 'left'
    } else if (pos === 'left') {
      tooltipX = rect.left - PAD - tooltipW - 12
      tooltipY = rect.top + rect.height / 2 - 70
      arrowSide = 'right'
    }
    tooltipX = Math.max(16, Math.min(tooltipX, vw - tooltipW - 16))
    const tooltipHeight = 220 // approximate
    tooltipY = Math.max(16, Math.min(tooltipY, vh - tooltipHeight - 16))
  } else {
    tooltipX = vw / 2 - tooltipW / 2
    tooltipY = vh / 2 - 100
  }

  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* SVG spotlight overlay */}
          <motion.svg
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              width: '100vw', height: '100vh',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <mask id="tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {rect && (
                  <rect
                    x={spotX} y={spotY} width={spotW} height={spotH}
                    rx="10" ry="10" fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(0,0,0,0.65)"
              mask="url(#tour-spotlight-mask)"
            />
            {rect && (
              <rect
                x={spotX} y={spotY} width={spotW} height={spotH}
                rx="10" ry="10"
                fill="none"
                stroke="#00BCC8"
                strokeWidth="2"
              />
            )}
          </motion.svg>

          {/* Tooltip */}
          <motion.div
            key={`tooltip-${stepIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              position: 'fixed',
              left: tooltipX,
              top: tooltipY,
              width: tooltipW,
              zIndex: 9001,
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '18px 20px',
              fontFamily: "'Hanken Grotesk', sans-serif",
              pointerEvents: 'all',
            }}
          >
            {/* Arrow */}
            {rect && (
              <div style={{
                position: 'absolute',
                ...(arrowSide === 'top' && { top: -8, left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #FFFFFF', width: 0, height: 0 }),
                ...(arrowSide === 'bottom' && { bottom: -8, left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #FFFFFF', width: 0, height: 0 }),
                ...(arrowSide === 'left' && { left: -8, top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '8px solid #FFFFFF', width: 0, height: 0 }),
                ...(arrowSide === 'right' && { right: -8, top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '8px solid #FFFFFF', width: 0, height: 0 }),
              }} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  background: 'linear-gradient(140deg, #00BCC8 0%, #00D4E2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#FFFFFF',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {stepIndex + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#00BCC8', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {stepIndex + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={endTour}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 6px', fontFamily: "'Archivo', sans-serif" }}>
              {currentStep.title}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.55, margin: '0 0 16px' }}>
              {currentStep.body}
            </p>

            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', marginBottom: '14px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '999px', background: '#00BCC8',
                width: `${((stepIndex + 1) / steps.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isFirst && (
                <button
                  onClick={prevStep}
                  style={{
                    flex: 1, height: '36px', borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.12)', background: 'transparent',
                    color: '#6B7280', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={nextStep}
                style={{
                  flex: 2, height: '36px', borderRadius: '8px',
                  border: 'none', background: '#00BCC8',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                }}
              >
                {isLast ? 'Done ✓' : 'Next →'}
              </button>
            </div>

            {/* Skip link */}
            {!isLast && (
              <button
                onClick={endTour}
                style={{
                  display: 'block', width: '100%', background: 'none', border: 'none',
                  color: '#9CA3AF', fontSize: '12px', cursor: 'pointer', marginTop: '10px',
                  fontFamily: "'Hanken Grotesk', sans-serif", textAlign: 'center',
                }}
              >
                Skip tour
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
