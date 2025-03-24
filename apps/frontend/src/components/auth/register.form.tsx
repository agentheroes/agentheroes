"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "@frontend/components/ui/button"
import { Input } from "@frontend/components/ui/input"
import { Label } from "@frontend/components/ui/label"
import { toast } from "@frontend/hooks/use-toast"
import { registerFormSchema, type RegisterFormValues } from "@packages/shared/dto/auth/register.form.dto"
import {useFetch} from "@frontend/hooks/use-fetch";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter();
  const fetch = useFetch();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setAuthError(null)

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({...data, provider: 'LOCAL'}),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setAuthError(errorData || "Registration failed");
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong with the server. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{authError}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          placeholder="m@example.com" 
          type="email"
          {...register("email")} 
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          {...register("password")} 
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          id="confirm-password" 
          type="password"
          {...register("confirmPassword")} 
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  )
}

