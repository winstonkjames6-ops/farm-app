'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type TourStep = {
  id: string
  targetId: string
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right'
  route: string
}

const PARENT_TOUR_STEPS: TourStep[] = [
  {
    id: 'home-welcome',
    targetId: 'tour-home-header',
    title: 'Welcome to your dashboard',
    body: 'This is your home base. See upcoming sessions, past bookings, and your athletes at a glance.',
    position: 'bottom',
    route: '/dashboard',
  },
  {
    id: 'home-upcoming',
    targetId: 'tour-home-upcoming',
    title: 'Upcoming sessions',
    body: 'Your next session lives here. Hit "Join session" when it\'s time, or cancel if you need to reschedule.',
    position: 'bottom',
    route: '/dashboard',
  },
  {
    id: 'home-athletes',
    targetId: 'tour-home-athletes',
    title: 'Your athletes',
    body: 'Add your child here to build their profile. Trainers use this info to tailor each session.',
    position: 'top',
    route: '/dashboard',
  },
  {
    id: 'search-bar',
    targetId: 'tour-search-bar',
    title: 'Find a trainer',
    body: 'Search by name or specialty. Every trainer on FARM is background-checked and credential-verified.',
    position: 'bottom',
    route: '/dashboard/search',
  },
  {
    id: 'search-filters',
    targetId: 'tour-search-filters',
    title: 'Filter by what matters',
    body: 'Narrow by sport, session format, price, and availability. Use filters to find exactly the right fit.',
    position: 'right',
    route: '/dashboard/search',
  },
  {
    id: 'search-card',
    targetId: 'tour-search-first-card',
    title: 'Trainer cards',
    body: 'Each card shows ratings, credentials, and availability. Click "View Profile" to see full details and book.',
    position: 'bottom',
    route: '/dashboard/search',
  },
  {
    id: 'messages-list',
    targetId: 'tour-messages-list',
    title: 'Your conversations',
    body: 'All your trainer conversations in one place. Tap any thread to continue chatting.',
    position: 'right',
    route: '/dashboard/messages',
  },
  {
    id: 'messages-input',
    targetId: 'tour-messages-input',
    title: 'Send a message',
    body: 'Message your trainer directly here. All communication stays on-platform for your protection.',
    position: 'top',
    route: '/dashboard/messages',
  },
  {
    id: 'profile-athletes',
    targetId: 'tour-profile-athletes',
    title: 'Manage your athletes',
    body: 'Edit athlete profiles, add new children, and control what trainers can see and do.',
    position: 'bottom',
    route: '/dashboard/profile',
  },
  {
    id: 'profile-notifications',
    targetId: 'tour-profile-notifications-anchor',
    title: 'Notification settings',
    body: 'Choose how and when FARM contacts you — session reminders, trainer messages, and more.',
    position: 'bottom',
    route: '/dashboard/profile',
  },
  {
    id: 'profile-permissions',
    targetId: 'tour-profile-permissions-anchor',
    title: 'Athlete permissions',
    body: 'Fine-grained controls for what trainers can do with your athlete. You\'re always in control.',
    position: 'top',
    route: '/dashboard/profile',
  },
  {
    id: 'settings-overview',
    targetId: 'tour-settings-overview',
    title: 'Account settings',
    body: 'Update your account details, payment methods, privacy controls, and connected devices here.',
    position: 'bottom',
    route: '/dashboard/settings',
  },
]

type TourContextType = {
  active: boolean
  stepIndex: number
  steps: TourStep[]
  currentStep: TourStep | null
  startTour: () => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  hasSeenTour: boolean
}

const TourContext = createContext<TourContextType | null>(null)

export function TourProvider({ children, role = 'parent' }: { children: ReactNode; role?: string }) {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const router = useRouter()

  const steps = PARENT_TOUR_STEPS

  useEffect(() => {
    const seen = localStorage.getItem('farm-tour-seen')
    const pending = localStorage.getItem('farm-tour-pending')

    if (pending) {
      // We navigated here to start the tour — activate now
      localStorage.removeItem('farm-tour-pending')
      const t = setTimeout(() => setActive(true), 600)
      return () => clearTimeout(t)
    } else if (!seen) {
      // First visit — set pending flag and navigate to step 0 route
      localStorage.setItem('farm-tour-pending', 'true')
      router.push(steps[0].route)
    } else {
      setHasSeenTour(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = active ? steps[stepIndex] : null

  const startTour = useCallback(() => {
    setStepIndex(0)
    const currentPath = window.location.pathname
    if (currentPath === steps[0].route) {
      // Already on the right page — activate directly
      setActive(true)
    } else {
      // Navigate first, activate on remount via pending flag
      localStorage.setItem('farm-tour-pending', 'true')
      router.push(steps[0].route)
    }
  }, [router, steps])

  const endTour = useCallback(() => {
    setActive(false)
    localStorage.setItem('farm-tour-seen', 'true')
    setHasSeenTour(true)
  }, [])

  const nextStep = useCallback(() => {
    const next = stepIndex + 1
    if (next >= steps.length) {
      endTour()
      return
    }
    const nextRoute = steps[next].route
    const currentRoute = steps[stepIndex].route
    if (nextRoute !== currentRoute) {
      router.push(nextRoute)
      // Delay stepIndex update until new page has time to render
      setTimeout(() => setStepIndex(next), 600)
    } else {
      setStepIndex(next)
    }
  }, [stepIndex, steps, endTour, router])

  const prevStep = useCallback(() => {
    const prev = stepIndex - 1
    if (prev < 0) return
    const prevRoute = steps[prev].route
    const currentRoute = steps[stepIndex].route
    if (prevRoute !== currentRoute) {
      router.push(prevRoute)
      setTimeout(() => setStepIndex(prev), 600)
    } else {
      setStepIndex(prev)
    }
  }, [stepIndex, steps, router])

  return (
    <TourContext.Provider value={{ active, stepIndex, steps, currentStep, startTour, endTour, nextStep, prevStep, hasSeenTour }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}
