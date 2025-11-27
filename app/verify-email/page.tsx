"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Your email has been verified successfully!")
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-600" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-600" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          )}
          {status === "error" && (
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Return to Home
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
