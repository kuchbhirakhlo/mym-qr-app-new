"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface AuthFallbackProps {
  mode: "login" | "signup"
  onDemoAuth: (email: string, password: string, restaurantName?: string) => Promise<void>
}

export function AuthFallback({ mode, onDemoAuth }: AuthFallbackProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password")
  const [restaurantName, setRestaurantName] = useState("Demo Restaurant")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show fallback after 2 seconds if Firebase auth is still having issues
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDemoAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onDemoAuth(email, password, mode === "signup" ? restaurantName : undefined)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to authenticate in demo mode",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!showFallback) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-orange-100 to-amber-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-orange-600 font-medium">Connecting to authentication service...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-100 to-amber-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-orange-200 shadow-lg bg-white">
        <CardHeader className="space-y-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-white" />
            <CardTitle className="text-2xl text-white">Authentication Issue</CardTitle>
          </div>
          <CardDescription className="text-orange-100">
            We're having trouble connecting to our authentication service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Utensils className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-amber-800 mb-2">Demo Mode Available</h3>
            <p className="text-amber-700 text-sm">
              You can continue in demo mode to explore the application without creating a real account.
            </p>
          </div>

          <form onSubmit={handleDemoAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="text-orange-700">
                  Restaurant Name
                </Label>
                <Input
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-orange-200 focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-orange-200 focus-visible:ring-orange-500"
              />
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? "Processing..." : `Continue in Demo Mode`}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-orange-50 p-6 rounded-b-lg flex flex-col gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            Try Again with Firebase
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-orange-600 hover:bg-orange-50">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
