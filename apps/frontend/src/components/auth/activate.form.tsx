"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@frontend/components/ui/button"
import { Input } from "@frontend/components/ui/input"
import { Label } from "@frontend/components/ui/label"

export function ActivateForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // TODO: Implement activation logic here

    setIsLoading(false)
    router.push("/login")
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activation-code">Activation Code</Label>
        <Input id="activation-code" placeholder="Enter your activation code" required />
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Activating..." : "Activate Account"}
      </Button>
    </form>
  )
}

