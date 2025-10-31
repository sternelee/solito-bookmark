import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { BookmarkParser } from '../../bookmark/parser'
import { XBrowserSyncService } from '../../xbrowsersync/sync'
import { BookmarkTree } from '../../bookmark/types'

export function useImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported?: number
    errors?: string[]
  } | null>(null)

  const syncService = new XBrowserSyncService()

  // Import bookmarks from JSON string
  const importFromJson = useCallback(
    async (jsonData: string, replaceExisting = false) => {
      setIsImporting(true)
      setImportResult(null)

      try {
        // Parse the JSON data
        const parseResult = BookmarkParser.parseBookmarks(jsonData)
        if (!parseResult.success || !parseResult.bookmarks) {
          throw new Error(parseResult.error || 'Failed to parse bookmarks')
        }

        // Get current bookmarks if not replacing
        let finalBookmarks: BookmarkTree
        if (replaceExisting) {
          finalBookmarks = parseResult.bookmarks
        } else {
          const currentBookmarksJson = await syncService.getLocalBookmarks()
          const currentBookmarks = currentBookmarksJson
            ? BookmarkParser.parseBookmarks(currentBookmarksJson)
            : null

          const currentItems = currentBookmarks?.success
            ? currentBookmarks.bookmarks?.items || []
            : []

          finalBookmarks = {
            items: [...currentItems, ...parseResult.bookmarks.items],
          }
        }

        // Save locally
        await syncService.saveLocalBookmarks(
          BookmarkParser.stringifyBookmarks(finalBookmarks)
        )

        // Try to sync to server if configured
        const config = await syncService.getConfig()
        if (config?.syncId) {
          try {
            await syncService.syncToServer(
              BookmarkParser.stringifyBookmarks(finalBookmarks)
            )
          } catch (syncError) {
            console.warn('Failed to sync imported bookmarks:', syncError)
          }
        }

        const importedCount = parseResult.bookmarks.items.filter(
          item => 'url' in item
        ).length

        setImportResult({
          success: true,
          message: `Successfully imported ${importedCount} bookmarks`,
          imported: importedCount,
        })
      } catch (error) {
        setImportResult({
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to import bookmarks',
        })
      } finally {
        setIsImporting(false)
      }
    },
    [syncService]
  )

  // Export bookmarks to JSON string
  const exportToJson = useCallback(async (): Promise<string | null> => {
    setIsExporting(true)

    try {
      const bookmarksJson = await syncService.getLocalBookmarks()
      if (!bookmarksJson) {
        throw new Error('No bookmarks found to export')
      }

      // Validate that the bookmarks can be parsed
      const parseResult = BookmarkParser.parseBookmarks(bookmarksJson)
      if (!parseResult.success) {
        throw new Error('Invalid bookmark format')
      }

      return bookmarksJson
    } catch (error) {
      Alert.alert(
        'Export Error',
        error instanceof Error ? error.message : 'Failed to export bookmarks'
      )
      return null
    } finally {
      setIsExporting(false)
    }
  }, [syncService])

  // Get export statistics
  const getExportStats = useCallback(async () => {
    try {
      const bookmarksJson = await syncService.getLocalBookmarks()
      if (!bookmarksJson) {
        return { bookmarkCount: 0, folderCount: 0, size: 0 }
      }

      const parseResult = BookmarkParser.parseBookmarks(bookmarksJson)
      if (!parseResult.success || !parseResult.bookmarks) {
        return { bookmarkCount: 0, folderCount: 0, size: bookmarksJson.length }
      }

      const bookmarkCount = parseResult.bookmarks.items.filter(
        item => 'url' in item
      ).length
      const folderCount = parseResult.bookmarks.items.filter(
        item => !('url' in item)
      ).length

      return {
        bookmarkCount,
        folderCount,
        size: bookmarksJson.length,
      }
    } catch (error) {
      return { bookmarkCount: 0, folderCount: 0, size: 0 }
    }
  }, [syncService])

  // Clear import result
  const clearImportResult = useCallback(() => {
    setImportResult(null)
  }, [])

  return {
    isImporting,
    isExporting,
    importResult,
    importFromJson,
    exportToJson,
    getExportStats,
    clearImportResult,
  }
}