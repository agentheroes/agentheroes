import { ActivateForm } from "@frontend/components/auth/activate.form"

export default function ActivatePage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Activate your account</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the activation code sent to your email</p>
      </div>
      <ActivateForm />
    </div>
  )
}

