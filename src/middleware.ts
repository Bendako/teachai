import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
])

const isSecretFreePublicRoute = createRouteMatcher(['/'])

function secretFreeNotFoundResponse() {
  return new NextResponse(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404: Not Found</title></head><body><main><h1>404</h1><p>This page could not be found.</p></main></body></html>',
    {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

const authenticatedMiddleware = clerkMiddleware(async (auth, request) => {
  // Protect all routes that are not public
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) {
    if (isSecretFreePublicRoute(request)) {
      return NextResponse.next()
    }

    return secretFreeNotFoundResponse()
  }

  return authenticatedMiddleware(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ]
}
