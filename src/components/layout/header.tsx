"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg">
              <span className="text-sm font-bold text-white">t</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              teachai
            </h1>
          </Link>
          
          {/* Desktop Navigation - Removed redundant links as they're available in sidebar */}
          
          <SignedOut>
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#testimonials", label: "Testimonials" },
                { href: "#contact", label: "Contact" }
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </SignedOut>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <SignedOut>
              <SignInButton>
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5855EB] hover:to-[#7C3AED] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 rounded-lg shadow-sm"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <SignedIn>
                {/* Navigation links removed - available in sidebar */}
              </SignedIn>
              <SignedOut>
                {[
                  { href: "#features", label: "Features" },
                  { href: "#pricing", label: "Pricing" },
                  { href: "#testimonials", label: "Testimonials" },
                  { href: "#contact", label: "Contact" }
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </SignedOut>
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <SignedOut>
                <div className="space-y-2">
                  <SignInButton>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5855EB] hover:to-[#7C3AED] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 rounded-lg shadow-sm"
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Account</span>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
