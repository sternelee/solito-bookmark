import { NextRequest } from 'next/server'
import { RequiredDataException, ValidationError } from '../../lib/errors'

export function getSyncId(request: NextRequest): string {
  const { pathname } = new URL(request.url)
  const pathSegments = pathname.split('/')
  return pathSegments[pathSegments.length - 2] // Get the ID from /api/bookmarks/[id]
}

export function getBookmarksData(request: NextRequest): string {
  // Try to get bookmarks data from request body
  const contentType = request.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return (request.body as any) || ''
  }

  // For form data or other content types
  return ''
}

export function validateRequiredData(data: any, fieldName: string): void {
  if (!data || data === '') {
    throw new RequiredDataException(fieldName)
  }
}

export function validateSyncSize(bookmarksData: string, maxSize: number): void {
  if (bookmarksData && Buffer.byteLength(bookmarksData, 'utf8') > maxSize) {
    throw new ValidationError(
      `Sync size exceeds maximum allowed size of ${maxSize} bytes`,
    )
  }
}

