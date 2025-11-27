"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"

interface MentionedUser {
  username: string
  avatar_url: string
  first_name: string
  last_name: string
}

interface UserMentionProps {
  username: string
}

function UserMention({ username }: UserMentionProps) {
  const [user, setUser] = useState<MentionedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [username])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/user/profile/${username}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch mentioned user:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-sm">
        <span className="w-4 h-4 rounded-full bg-muted-foreground/20 animate-pulse" />
        <span className="text-muted-foreground">@{username}</span>
      </span>
    )
  }

  if (!user) {
    return <span className="text-muted-foreground">@{username}</span>
  }

  return (
    <Link
      href={`/user/${username}`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
    >
      {user.avatar_url ? (
        <img src={user.avatar_url || "/placeholder.svg"} alt={username} className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-bold">{username.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <span className="text-sm font-medium">@{username}</span>
    </Link>
  )
}

interface BioWithMentionsProps {
  bio: string
}

export function BioWithMentions({ bio }: BioWithMentionsProps) {
  const parseBio = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      // Add mention component
      const username = match[1]
      parts.push(<UserMention key={`${match.index}-${username}`} username={username} />)

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return <div className="whitespace-pre-wrap break-words space-y-1">{parseBio(bio)}</div>
}
