import { NextRequest } from 'next/server'
import { BookmarksDB } from './lib/db'
import {
  getBookmarksData,
  validateRequiredData,
  validateSyncSize,
} from './lib/utils'
import {
  handleAPIError,
  createSuccessResponse,
  ServiceUnavailableError,
  NewSyncsForbiddenException,
  NewSyncsLimitExceededException,
} from '../lib/errors'
import { SyncLogsService } from '../sync-logs/lib/service'
import { getConfig } from '../config'
import { CreateBookmarksResponse } from './types'

// POST /api/bookmarks - Create new bookmarks sync
export async function POST(request: NextRequest) {
  try {
    const config = getConfig()

    // Check if service is accepting new syncs
    if (!config.status.enabled) {
      throw new NewSyncsForbiddenException()
    }

    // Check daily new syncs limit
    if (config.dailyNewSyncsLimit > 0) {
      const limitCheck = await SyncLogsService.newSyncsLimitHit(request)
      if (limitCheck.limitHit) {
        throw new NewSyncsLimitExceededException()
      }
    }

    const body = await request.json()
    const version = body.version

    // Handle v2 API - create empty sync with version
    if (version && !body.bookmarks) {
      validateRequiredData(version, 'version')

      const newBookmarks = await BookmarksDB.create({
        version,
        bookmarks: '',
      })

      // Create log entry if daily limit is enabled
      if (config.dailyNewSyncsLimit > 0) {
        await SyncLogsService.createLog(request)
      }

      const response: CreateBookmarksResponse = {
        id: newBookmarks.id,
        version: newBookmarks.version,
        lastUpdated: newBookmarks.lastUpdated,
      }

      return createSuccessResponse(response, 201)
    }

    // Handle v1 API - create sync with bookmarks data
    const bookmarksData = body.bookmarks || getBookmarksData(request)
    validateRequiredData(bookmarksData, 'bookmarks')
    validateSyncSize(bookmarksData, config.maxSyncSize)

    const newBookmarks = await BookmarksDB.create({
      bookmarks: bookmarksData,
      version: body.version,
    })

    // Create log entry if daily limit is enabled
    if (config.dailyNewSyncsLimit > 0) {
      await SyncLogsService.createLog(request)
    }

    const response: CreateBookmarksResponse = {
      id: newBookmarks.id,
      version: newBookmarks.version,
      lastUpdated: newBookmarks.lastUpdated,
    }

    return createSuccessResponse(response, 201)
  } catch (error) {
    console.error('Error creating bookmarks:', error)
    return handleAPIError(error)
  }
}

