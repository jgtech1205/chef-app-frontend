"use client"

import type { ReactNode } from 'react'
import { SidebarNavigation } from './SidebarNavigation'
import { BottomNavigation } from './BottomNavigation'
import type { Locale } from '@/lib/i18n'

interface LayoutWrapperProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  locale: Locale
  showNavigation?: boolean
}

export function LayoutWrapper({ children, activeTab, onTabChange, locale, showNavigation = true }: LayoutWrapperProps) {
  if (!showNavigation) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} locale={locale} />

      <div className="md:ml-64">
        <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} locale={locale} />
    </div>
  )
}


