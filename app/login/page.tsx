"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  auth,
  db,
  GoogleAuthProvider,
  doc,
  safeSignInWithEmailAndPassword,
  safeSignInWithPopup,
  safeSetDoc,
  safeGetDoc,
  serverTimestamp,
} from "@/lib/firebase"
import { QrCode } from "lucide-react"
import { useEffect } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check for Google auth result on component mount
  useEffect(() => {
    const storedAuthResult = sessionStorage.getItem("googleAuthResult")
    if (storedAuthResult) {
      const authResult = JSON.parse(storedAuthResult)

      // Process the Google auth result
      const processGoogleAuth = async () => {
        try {
          // Create/update user document in Firestore
          await safeSetDoc(
            doc(db, "restaurants", authResult.user.uid),
            {
              restaurantName: authResult.user.displayName || "My Restaurant",
              email: authResult.user.email,
              createdAt: new Date().toISOString(),
            },
            { merge: true },
          )

          toast({
            title: "Success!",
            description: "You've successfully logged in with Google.",
          })

          // Clear the stored auth result
          sessionStorage.removeItem("googleAuthResult")

          // Redirect to dashboard
          router.push("/dashboard")
        } catch (error) {
          console.error("Error processing Google auth:", error)
          toast({
            title: "Error",
            description: "Failed to complete Google authentication.",
            variant: "destructive",
          })
        }
      }

      processGoogleAuth()
    }
  }, [router])

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      if (!email || !password) {
        throw new Error("Please enter both email and password")
      }

      console.log("Logging in with:", { email })

      const userCredential = await safeSignInWithEmailAndPassword(auth, email, password)
      console.log("Login successful")

      toast({
        title: "Success!",
        description: "You've successfully logged in.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Failed to log in"

      // Handle specific Firebase auth errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please check and try again."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add these scopes for better user profile access
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters for Google Sign-In experience
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use popup instead of redirect for better error handling
        const result = await safeSignInWithPopup(auth, provider);
      
      if (!result || !result.user) {
        throw new Error('Failed to sign in with Google');
      }
      
      // Check if the user document already exists
      const userDoc = await safeGetDoc(doc(db, 'users', result.user.uid));
        
      // If user doesn't exist, create a new user document
      if (!userDoc.exists()) {
        const userData = {
          displayName: result.user.displayName || 'User',
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
        };
        
        await safeSetDoc(doc(db, 'users', result.user.uid), userData);
      }
      
      // Create or update restaurant document
          await safeSetDoc(
            doc(db, "restaurants", result.user.uid),
            {
              restaurantName: result.user.displayName || "My Restaurant",
              email: result.user.email,
          userId: result.user.uid,
          createdAt: serverTimestamp(),
            },
        { merge: true }
          );

          toast({
            title: "Success!",
        description: "Successfully signed in with Google!",
          });
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-100 to-amber-50 flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-lg font-bold text-orange-600"
      >
          <Image 
              src="/logo.png" 
              alt="Make Your Menu Logo" 
              width={40} 
              height={40} 
              className="h-14 w-auto rounded-2xl"
            />
      </Link>
      <Card className="w-full max-w-md border-orange-200 shadow-lg bg-white">
        <CardHeader className="space-y-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-lg">
          <CardTitle className="text-2xl text-white">Log in</CardTitle>
          <CardDescription className="text-orange-100">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Button
            variant="outline"
            className="w-full border-orange-200 hover:bg-orange-50 hover:border-orange-300 relative"
            onClick={handleGoogleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Log in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-orange-500 font-medium">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="border-orange-200 focus-visible:ring-orange-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-orange-200 focus-visible:ring-orange-500"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-orange-50 p-6 rounded-b-lg">
          <p className="text-center text-sm text-orange-700 w-full">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-orange-600 font-medium underline underline-offset-4 hover:text-orange-800"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
