import { useState, useEffect, useCallback } from 'react'
import { XBrowserSyncService } from '../../../services/xbrowsersync/sync'
import { BookmarkParser } from '../parser'
import { BookmarkTree, BookmarkItem } from '../types'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkTree | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<string>('idle')

  const syncService = new XBrowserSyncService()

  // Load bookmarks from local storage
  const loadLocalBookmarks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const bookmarksJson = await syncService.getLocalBookmarks()
      if (bookmarksJson) {
        const parseResult = BookmarkParser.parseBookmarks(bookmarksJson)
        if (parseResult.success && parseResult.bookmarks) {
          setBookmarks(parseResult.bookmarks)
        } else {
          setError(parseResult.error || 'Failed to parse bookmarks')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks')
    } finally {
      setIsLoading(false)
    }
  }, [syncService])

  // Sync bookmarks from server
  const syncFromServer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSyncStatus('syncing')

      const bookmarksJson = await syncService.syncFromServer()
      if (bookmarksJson) {
        const parseResult = BookmarkParser.parseBookmarks(bookmarksJson)
        if (parseResult.success && parseResult.bookmarks) {
          setBookmarks(parseResult.bookmarks)
          setSyncStatus('synced')
        } else {
          setError(parseResult.error || 'Failed to parse synced bookmarks')
          setSyncStatus('error')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync bookmarks')
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [syncService])

  // Save bookmarks locally
  const saveLocalBookmarks = useCallback(
    async (bookmarkTree: BookmarkTree) => {
      try {
        setIsLoading(true)
        setError(null)

        const bookmarksJson = BookmarkParser.stringifyBookmarks(bookmarkTree)
        await syncService.saveLocalBookmarks(bookmarksJson)
        setBookmarks(bookmarkTree)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to save bookmarks',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [syncService],
  )

  // Sync bookmarks to server
  const syncToServer = useCallback(
    async (bookmarkTree: BookmarkTree) => {
      try {
        setIsLoading(true)
        setError(null)
        setSyncStatus('syncing')

        const bookmarksJson = BookmarkParser.stringifyBookmarks(bookmarkTree)
        await syncService.syncToServer(bookmarksJson)
        setBookmarks(bookmarkTree)
        setSyncStatus('synced')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to sync bookmarks to server',
        )
        setSyncStatus('error')
      } finally {
        setIsLoading(false)
      }
    },
    [syncService],
  )

  // Add new bookmark
  const addBookmark = useCallback(
    async (bookmark: BookmarkItem) => {
      if (!bookmarks) return

      try {
        const newBookmarks: BookmarkTree = {
          items: [...bookmarks.items, bookmark],
        }

        // Save locally first
        await saveLocalBookmarks(newBookmarks)

        // Try to sync to server if configured
        const config = await syncService.getConfig()
        if (config?.syncId) {
          await syncToServer(newBookmarks)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add bookmark')
      }
    },
    [bookmarks, saveLocalBookmarks, syncToServer, syncService],
  )

  // Update bookmark
  const updateBookmark = useCallback(
    async (updatedBookmark: BookmarkItem) => {
      if (!bookmarks) return

      try {
        const newBookmarks: BookmarkTree = {
          items: bookmarks.items.map((item) => {
            if ('url' in item && item.id === updatedBookmark.id) {
              return updatedBookmark
            }
            return item
          }),
        }

        // Save locally first
        await saveLocalBookmarks(newBookmarks)

        // Try to sync to server if configured
        const config = await syncService.getConfig()
        if (config?.syncId) {
          await syncToServer(newBookmarks)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update bookmark',
        )
      }
    },
    [bookmarks, saveLocalBookmarks, syncToServer, syncService],
  )

  // Delete bookmark
  const deleteBookmark = useCallback(
    async (bookmarkId: string) => {
      if (!bookmarks) return

      try {
        const newBookmarks: BookmarkTree = {
          items: bookmarks.items.filter((item) => {
            if ('url' in item) {
              return item.id !== bookmarkId
            }
            return true // Keep folders
          }),
        }

        // Save locally first
        await saveLocalBookmarks(newBookmarks)

        // Try to sync to server if configured
        const config = await syncService.getConfig()
        if (config?.syncId) {
          await syncToServer(newBookmarks)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete bookmark',
        )
      }
    },
    [bookmarks, saveLocalBookmarks, syncToServer, syncService],
  )

  // Import bookmarks from JSON
  const importBookmarks = useCallback(
    async (bookmarksJson: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const parseResult = BookmarkParser.parseBookmarks(bookmarksJson)
        if (!parseResult.success || !parseResult.bookmarks) {
          throw new Error(parseResult.error || 'Failed to parse bookmarks')
        }

        await saveLocalBookmarks(parseResult.bookmarks)

        // Try to sync to server if configured
        const config = await syncService.getConfig()
        if (config?.syncId) {
          await syncToServer(parseResult.bookmarks)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to import bookmarks',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [saveLocalBookmarks, syncToServer, syncService],
  )

  // Export bookmarks to JSON
  const exportBookmarks = useCallback((): string | null => {
    if (!bookmarks) return null

    try {
      return BookmarkParser.stringifyBookmarks(bookmarks)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to export bookmarks',
      )
      return null
    }
  }, [bookmarks])

  // Search bookmarks
  const searchBookmarks = useCallback(
    (query: string): BookmarkItem[] => {
      if (!bookmarks || !query.trim()) return []

      return BookmarkParser.searchBookmarks(bookmarks, query)
    },
    [bookmarks],
  )

  // Get all bookmarks as flat list
  const getAllBookmarks = useCallback((): BookmarkItem[] => {
    if (!bookmarks) return []

    return BookmarkParser.flattenBookmarks(bookmarks)
  }, [bookmarks])

  // Initialize on mount
  useEffect(() => {
    loadLocalBookmarks()
  }, [loadLocalBookmarks])

  return {
    bookmarks,
    isLoading,
    error,
    syncStatus,
    loadLocalBookmarks,
    syncFromServer,
    saveLocalBookmarks,
    syncToServer,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    exportBookmarks,
    searchBookmarks,
    getAllBookmarks,
  }
}

