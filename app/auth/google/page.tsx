"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function GoogleAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const mode = searchParams.get("mode") || "signin"
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

  // Google logo colors
  const logoColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"]

  useEffect(() => {
    // Pre-fill with a Google-like email if empty
    if (!email) {
      setEmail("user@gmail.com")
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store auth info in sessionStorage to simulate a successful Google auth
      sessionStorage.setItem(
        "googleAuthResult",
        JSON.stringify({
          user: {
            uid: "google-user-id",
            email: email,
            displayName: email.split("@")[0],
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              email.split("@")[0],
            )}&background=4285F4&color=fff`,
            providerData: [
              {
                providerId: "google.com",
                uid: email,
                displayName: email.split("@")[0],
                email: email,
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  email.split("@")[0],
                )}&background=4285F4&color=fff`,
              },
            ],
          },
          credential: {
            accessToken: "mock-google-access-token",
            idToken: "mock-google-id-token",
          },
        }),
      )

      // Redirect back to the app
      router.push(redirectUrl)
    } catch (error) {
      console.error("Google auth simulation error:", error)
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 items-center text-center">
          <div className="flex mb-6">
            {/* Google logo */}
            <div className="flex">
              {["G", "o", "o", "g", "l", "e"].map((letter, i) => (
                <span
                  key={i}
                  style={{ color: i < 4 ? logoColors[i] : i === 4 ? logoColors[2] : logoColors[3] }}
                  className="text-3xl font-bold"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">{mode === "signup" ? "Sign up" : "Sign in"}</CardTitle>
          <CardDescription>
            {mode === "signup" ? "Create your Google Account" : "Use your Google Account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                required
                defaultValue="••••••••"
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">Note: This is a simulated Google login. Any password will work.</p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="link"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : mode === "signup" ? (
                  "Sign up"
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-600">
          <div>
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:text-blue-800"
              onClick={() => {
                const newMode = mode === "signup" ? "signin" : "signup"
                router.push(`/auth/google?mode=${newMode}&redirect=${encodeURIComponent(redirectUrl)}`)
              }}
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </Button>
          </div>
          <div className="text-xs">This is a simulated Google authentication page for demonstration purposes.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
