import type React from "react"
import {CanOnboarding} from "@frontend/components/auth/can.onboarding";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CanOnboarding>
      {children}
    </CanOnboarding>
  )
}

