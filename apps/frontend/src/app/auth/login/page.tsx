import { LoginForm } from "@frontend/components/auth/login.form"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>
      </div>
      <LoginForm />
    </div>
  )
}

