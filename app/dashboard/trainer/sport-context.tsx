'use client'

import { createContext, useContext, useState } from 'react'

type TrainerSportContextValue = {
  primarySport: string
  setPrimarySport: (s: string) => void
}

export const TrainerSportContext = createContext<TrainerSportContextValue>({
  primarySport: 'soccer',
  setPrimarySport: () => {},
})

export function TrainerSportProvider({ children }: { children: React.ReactNode }) {
  const [primarySport, setPrimarySport] = useState('soccer')
  return (
    <TrainerSportContext.Provider value={{ primarySport, setPrimarySport }}>
      {children}
    </TrainerSportContext.Provider>
  )
}

export function useTrainerSport() {
  return useContext(TrainerSportContext)
}
