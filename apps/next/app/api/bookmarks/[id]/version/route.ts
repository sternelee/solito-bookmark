import { NextRequest } from 'next/server'
import { BookmarksDB } from '../../lib/db'
import { validateRequiredData } from '../../lib/utils'
import { handleAPIError, createSuccessResponse, NotFoundError } from '../../../lib/errors'
import { VersionResponse } from '../../types'

// GET /api/bookmarks/[id]/version - Get version
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

    const response: VersionResponse = {
      version: bookmarks.version,
    }

    return createSuccessResponse(response)
  } catch (error) {
    console.error('Error getting version:', error)
    return handleAPIError(error)
  }
}

