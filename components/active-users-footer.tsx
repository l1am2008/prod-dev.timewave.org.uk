"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

interface ActiveUser {
  id: number
  username: string
  first_name: string
  last_name: string
  avatar_url: string
}

export function ActiveUsersFooter() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsListening(true)
      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        fetch("/api/active-users", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch((error) => console.error("[v0] Heartbeat failed:", error))
      }, 30000)

      // Send initial heartbeat
      fetch("/api/active-users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("[v0] Heartbeat failed:", error))

      return () => clearInterval(heartbeat)
    }
  }, [])

  useEffect(() => {
    fetchActiveUsers()
    const interval = setInterval(fetchActiveUsers, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("/api/active-users")
      if (response.ok) {
        const data = await response.json()
        setActiveUsers(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch active users:", error)
    }
  }

  if (activeUsers.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Currently Active</span>
            <span className="text-foreground">({activeUsers.length})</span>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex-shrink-0 relative group cursor-pointer"
                title={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url || "/placeholder.svg"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full border-2 border-background object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {/* Active indicator dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
