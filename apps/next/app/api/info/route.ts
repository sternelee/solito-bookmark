import { NextRequest } from 'next/server'
import { getConfig } from '../config'
import { ServiceStatus } from './types'
import { createSuccessResponse } from '../lib/errors'

// GET /api/info - Get service information
export async function GET(request: NextRequest) {
  try {
    const config = getConfig()

    // Convert location code to uppercase if set
    const location = config.location?.toUpperCase()

    // Create response object from config settings
    const serviceInfo = {
      location,
      maxSyncSize: config.maxSyncSize,
      message: stripScriptsFromHtml(config.status.message),
      status: ServiceStatus.online,
      version: config.version,
    }

    return createSuccessResponse(serviceInfo)
  } catch (error) {
    console.error('Error getting service info:', error)

    // Return basic info even if there's an error
    const fallbackInfo = {
      location: undefined,
      maxSyncSize: 5242880, // 5MB default
      message: 'xBrowserSync Service - Status unavailable',
      status: ServiceStatus.degraded,
      version: '1.1.8',
    }

    return createSuccessResponse(fallbackInfo, 500)
  }
}

// Remove script tags from HTML content
function stripScriptsFromHtml(html: string): string {
  if (!html) return html

  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

