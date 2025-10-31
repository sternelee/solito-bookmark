import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware, corsMiddleware, securityHeadersMiddleware, requestLoggerMiddleware } from './app/api/rate-limit/middleware'

export async function middleware(request: NextRequest) {
  // Log request
  requestLoggerMiddleware(request)

  // Handle OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 })
    return corsMiddleware(request, response)
  }

  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request)
  if (rateLimitResponse) {
    return corsMiddleware(request, securityHeadersMiddleware(rateLimitResponse))
  }

  // Continue with the request
  const response = NextResponse.next()

  // Apply CORS and security headers
  const corsResponse = corsMiddleware(request, response)
  return securityHeadersMiddleware(corsResponse || response)
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}