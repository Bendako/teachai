import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#5855EB] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">t</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#5855EB] bg-clip-text text-transparent">
            teachai
          </h1>
        </div>
        <div>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
