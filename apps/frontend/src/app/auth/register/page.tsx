import { RegisterForm } from "@frontend/components/auth/register.form"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}

