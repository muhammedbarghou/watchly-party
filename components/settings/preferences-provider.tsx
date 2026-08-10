"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { UserPreferences } from "@/lib/settings/types"

type PreferencesContextValue = {
  preferences: UserPreferences
  setPreferences: (preferences: UserPreferences) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

type PreferencesProviderProps = {
  children: ReactNode
  initialPreferences: UserPreferences
}

export const PreferencesProvider = ({
  children,
  initialPreferences,
}: PreferencesProviderProps) => {
  const [preferences, setPreferencesState] =
    useState<UserPreferences>(initialPreferences)

  useEffect(() => {
    setPreferencesState(initialPreferences)
  }, [initialPreferences])

  const setPreferences = useCallback((next: UserPreferences) => {
    setPreferencesState(next)
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
    }),
    [preferences, setPreferences]
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
