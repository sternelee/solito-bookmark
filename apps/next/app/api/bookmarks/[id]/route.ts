import { NextRequest } from 'next/server'
import { BookmarksDB } from '../lib/db'
import {
  getBookmarksData,
  validateRequiredData,
  validateSyncSize
} from '../lib/utils'
import { handleAPIError, createSuccessResponse, NotFoundError } from '../../lib/errors'
import { getConfig } from '../../config'
import { GetBookmarksResponse, UpdateBookmarksResponse } from '../types'

// GET /api/bookmarks/[id] - Retrieve bookmarks
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    validateRequiredData(id, 'id')

    const bookmarks = await BookmarksDB.findById(id)
    if (!bookmarks) {
      throw new NotFoundError('Bookmarks not found')
    }

    const response: GetBookmarksResponse = {
      bookmarks: bookmarks.bookmarks,
      version: bookmarks.version,
      lastUpdated: bookmarks.lastUpdated,
    }

    return createSuccessResponse(response)

  } catch (error) {
    console.error('Error getting bookmarks:', error)
    return handleAPIError(error)
  }
}

// PUT /api/bookmarks/[id] - Update bookmarks
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    validateRequiredData(id, 'id')

    const body = await request.json()
    const bookmarksData = body.bookmarks || ''
    const lastUpdated = body.lastUpdated
    const version = body.version

    validateRequiredData(bookmarksData, 'bookmarks')

    // Validate sync size
    const config = getConfig()
    validateSyncSize(bookmarksData, config.maxSyncSize)

    const existingBookmarks = await BookmarksDB.findById(id)
    if (!existingBookmarks) {
      throw new NotFoundError('Bookmarks not found')
    }

    const updateData: any = {
      bookmarks: bookmarksData,
    }

    if (version) {
      updateData.version = version
    }

    const updatedBookmarks = await BookmarksDB.update(id, updateData)
    if (!updatedBookmarks) {
      throw new Error('Failed to update bookmarks')
    }

    const response: UpdateBookmarksResponse = {
      version: updatedBookmarks.version,
      lastUpdated: updatedBookmarks.lastUpdated,
    }

    return createSuccessResponse(response)

  } catch (error) {
    console.error('Error updating bookmarks:', error)
    return handleAPIError(error)
  }
}