import type { User } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  user: User | null
  className?: string
}

export function UserAvatar({ user, className = "" }: UserAvatarProps) {
  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "??"

  return (
    <Avatar className={className}>
      <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
      <AvatarFallback className="bg-orange-100 text-orange-600">{initials}</AvatarFallback>
    </Avatar>
  )
}
