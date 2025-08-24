"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { auth, safeOnAuthStateChanged } from "@/lib/firebase"
import { Sidebar } from "@/components/sidebar"
import { QrCode } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard layout mounted, checking auth state")

    const unsubscribe = safeOnAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user")
      if (!user) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-orange-100 to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-orange-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 w-full md:pl-64">
        {/* Mobile header - with space reserved on left for sidebar button */}
        <div className="md:hidden flex h-16 items-center border-b bg-white shadow-sm">
          <div className="w-14"></div> {/* Space reserved for menu button */}
          <div className="flex-1 flex justify-center items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Make Your Menu Logo" 
              width={40} 
              height={40} 
              className="h-14 w-auto rounded-2xl"
            />
              <span className="font-semibold text-orange-600">MakeYourMenu</span>
            </Link>
          </div>
          <div className="w-14"></div> {/* Balanced space on right */}
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
