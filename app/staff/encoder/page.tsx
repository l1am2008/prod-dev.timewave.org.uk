"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EncoderInfo {
  encoder_id: string
  encoder_password: string
  encoder_active: boolean
  username: string
}

export default function EncoderPage() {
  const { toast } = useToast()
  const [encoderInfo, setEncoderInfo] = useState<EncoderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchEncoderInfo()
  }, [])

  const fetchEncoderInfo = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEncoderInfo(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch encoder info:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!encoderInfo?.encoder_id) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Encoder Information</h2>
          <p className="text-muted-foreground">Your broadcasting credentials</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No encoder has been assigned to your account yet. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Encoder Information</h2>
        <p className="text-muted-foreground">Your broadcasting credentials</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connection Details</CardTitle>
            <Badge variant={encoderInfo.encoder_active ? "default" : "secondary"}>
              {encoderInfo.encoder_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>Use these credentials to connect your broadcasting software</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Server URL</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("https://admin.stream.timewave.org.uk", "Server URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm">https://admin.stream.timewave.org.uk</code>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Port</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard("8000", "Port")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm">8000</code>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Mount Point</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard("/timewave_radio", "Mount Point")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm">/timewave_radio</code>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Username</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(encoderInfo.username, "Username")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm">{encoderInfo.username}</code>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Password</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(encoderInfo.encoder_password, "Password")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <code className="text-sm">{showPassword ? encoderInfo.encoder_password : "••••••••••••••••"}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcasting Software</CardTitle>
          <CardDescription>Recommended tools for streaming</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-medium min-w-[80px]">OBS Studio:</span>
              <span className="text-muted-foreground">Professional streaming software with advanced features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium min-w-[80px]">Mixxx:</span>
              <span className="text-muted-foreground">DJ software with built-in broadcasting capabilities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium min-w-[80px]">BUTT:</span>
              <span className="text-muted-foreground">Simple broadcast tool for basic streaming needs</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
