import { NextRequest, NextResponse } from 'next/server'
import { SyncLogsService } from '../sync-logs/lib/service'
import { RateLimitError, handleAPIError } from '../lib/errors'
import { getConfig } from '../config'

// Rate limiting middleware
export async function rateLimitMiddleware(request: NextRequest) {
  const config = getConfig()

  // Skip rate limiting if disabled
  if (config.dailyNewSyncsLimit <= 0) {
    return null
  }

  // Only apply rate limiting to bookmark creation endpoints
  const { pathname } = new URL(request.url)
  if (pathname === '/api/bookmarks' && request.method === 'POST') {
    const limitCheck = await SyncLogsService.newSyncsLimitHit(request)

    if (limitCheck.limitHit) {
      const error = new RateLimitError(
        `Daily new syncs limit exceeded. Limit: ${limitCheck.dailyLimit}, Remaining: ${limitCheck.remaining}`
      )

      // Add rate limit headers
      const response = handleAPIError(error)
      response.headers.set('X-RateLimit-Limit', limitCheck.dailyLimit?.toString() || '0')
      response.headers.set('X-RateLimit-Remaining', limitCheck.remaining?.toString() || '0')
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 86400000).toISOString()) // Next day

      return response
    }

    // Add rate limit headers for successful requests
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limitCheck.dailyLimit?.toString() || '0')
    response.headers.set('X-RateLimit-Remaining', limitCheck.remaining?.toString() || '0')
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 86400000).toISOString()) // Next day

    return response
  }

  return null
}

// CORS middleware
export function corsMiddleware(request: NextRequest, response?: Response) {
  const config = getConfig()
  const origin = request.headers.get('origin')

  // Check if origin is allowed
  const isAllowedOrigin = !origin ||
    config.allowedOrigins.length === 0 ||
    config.allowedOrigins.includes('*') ||
    config.allowedOrigins.includes(origin)

  if (isAllowedOrigin) {
    const headers = new Headers(response?.headers)
    headers.set('Access-Control-Allow-Origin', origin || '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    headers.set('Access-Control-Max-Age', '86400') // 24 hours

    if (response) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
  }

  return response
}

// Security headers middleware
export function securityHeadersMiddleware(response: Response) {
  const headers = new Headers(response.headers)

  // Add security headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// Request logging middleware
export function requestLoggerMiddleware(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`)
}