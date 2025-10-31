import { NextRequest } from 'next/server'
import { BookmarksDB } from '../../lib/db'
import { validateRequiredData } from '../../lib/utils'
import { handleAPIError, createSuccessResponse, NotFoundError } from '../../../lib/errors'
import { LastUpdatedResponse } from '../../types'

// GET /api/bookmarks/[id]/lastUpdated - Get last updated timestamp
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    validateRequiredData(id, 'id')

    const bookmarks = await BookmarksDB.findById(id)
    if (!bookmarks) {
      throw new NotFoundError('Bookmarks not found')
    }

    const response: LastUpdatedResponse = {
      lastUpdated: bookmarks.lastUpdated,
    }

    return createSuccessResponse(response)
  } catch (error) {
    console.error('Error getting last updated:', error)
    return handleAPIError(error)
  }
}

