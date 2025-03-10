import type React from "react"

export const metadata = {
  title: "AI Character Dashboard",
  description: "Generate and manage AI characters for social media",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}

