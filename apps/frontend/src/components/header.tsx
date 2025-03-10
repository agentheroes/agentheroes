import { Bell, User } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">AI Character Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">
            <Bell className="h-6 w-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

