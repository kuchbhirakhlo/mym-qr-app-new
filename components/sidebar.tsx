"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { auth, safeSignOut, safeOnAuthStateChanged } from "@/lib/firebase"
import { LayoutDashboard, Utensils, QrCode, LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { UserAvatar } from "@/components/user-avatar"
import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    // Get the current user
    setUser(auth.currentUser)

    // Set up auth state change listener using the safe wrapper
    const unsubscribe = safeOnAuthStateChanged(auth, (user: User | null) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await safeSignOut(auth)
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/dashboard/menu/create",
      label: "Create Menu",
      icon: <Utensils className="h-5 w-5" />,
    },
    {
      href: "/dashboard/qr-codes",
      label: "QR Codes",
      icon: <QrCode className="h-5 w-5" />,
    },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-4 bg-gradient-to-r from-orange-500 to-amber-500">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
        <Image 
              src="/logo.png" 
              alt="Make Your Menu Logo" 
              width={40} 
              height={40} 
              className="h-14 w-auto rounded-2xl"
            />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4 bg-gradient-to-b from-orange-50 to-amber-50">
        {user && (
          <div className="px-4 py-2 mb-4 flex items-center gap-3 border-b border-orange-100 pb-4">
            <UserAvatar user={user} />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 truncate">
                {user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
          </div>
        )}
        <nav className="grid gap-2 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4 bg-orange-50">
        <Button
          variant="outline"
          className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar (always visible) */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white shadow-md fixed left-0 top-0 z-20">
        <SidebarContent />
      </div>
      
      {/* Mobile sidebar (only visible when toggled) */}
      <div className="md:hidden fixed z-50 top-3 left-4">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-orange-600 bg-white/90 rounded-full shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r bg-white shadow-lg">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
