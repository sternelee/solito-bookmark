import {
  BookmarkItem,
  BookmarkFolder,
  BookmarkTree,
  ParseResult,
} from './types'

export class BookmarkParser {
  // Parse bookmarks from JSON string (xBrowserSync format)
  static parseBookmarks(jsonString: string): ParseResult {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return {
          success: false,
          error: 'Empty bookmarks data',
        }
      }

      const data = JSON.parse(jsonString)

      // Handle different bookmark formats
      if (data.bookmarks) {
        return this.parsexBrowserSyncFormat(data.bookmarks)
      } else if (Array.isArray(data)) {
        return this.parseNetscapeFormat(data)
      } else if (data.children) {
        return this.parseChromeFormat(data)
      } else {
        return {
          success: false,
          error: 'Unsupported bookmark format',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Parse error',
      }
    }
  }

  // Parse xBrowserSync format
  private static parsexBrowserSyncFormat(bookmarksData: any): ParseResult {
    try {
      const items: (BookmarkItem | BookmarkFolder)[] = []

      if (bookmarksData.children) {
        items.push(...this.parseChildren(bookmarksData.children))
      }

      return {
        success: true,
        bookmarks: {
          items,
        },
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'xBrowserSync format error',
      }
    }
  }

  // Parse Netscape bookmark format
  private static parseNetscapeFormat(data: any[]): ParseResult {
    try {
      const items: (BookmarkItem | BookmarkFolder)[] = []

      for (const item of data) {
        if (item.type === 'url') {
          items.push({
            id: item.id || this.generateId(),
            title: item.title || item.name || 'Untitled',
            url: item.url || item.href || '',
            tags: item.tags || [],
            dateAdded: item.dateAdded ? new Date(item.dateAdded) : new Date(),
            lastModified: item.lastModified
              ? new Date(item.lastModified)
              : new Date(),
          })
        } else if (item.type === 'folder') {
          items.push({
            id: item.id || this.generateId(),
            name: item.title || item.name || 'Untitled Folder',
            parentId: item.parentId,
            children: item.children ? this.parseChildren(item.children) : [],
          })
        }
      }

      return {
        success: true,
        bookmarks: {
          items,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netscape format error',
      }
    }
  }

  // Parse Chrome bookmark format
  private static parseChromeFormat(data: any): ParseResult {
    try {
      const items: (BookmarkItem | BookmarkFolder)[] = []

      if (data.children) {
        items.push(...this.parseChildren(data.children))
      }

      return {
        success: true,
        bookmarks: {
          items,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chrome format error',
      }
    }
  }

  // Parse children recursively
  private static parseChildren(
    children: any[],
  ): (BookmarkItem | BookmarkFolder)[] {
    const items: (BookmarkItem | BookmarkFolder)[] = []

    for (const child of children) {
      if (child.type === 'url' || child.url) {
        items.push({
          id: child.id || this.generateId(),
          title: child.title || child.name || 'Untitled',
          url: child.url || child.href || '',
          tags: child.tags || [],
          dateAdded: child.dateAdded ? new Date(child.dateAdded) : new Date(),
          lastModified: child.lastModified
            ? new Date(child.lastModified)
            : new Date(),
        })
      } else if (child.type === 'folder' || child.children) {
        items.push({
          id: child.id || this.generateId(),
          name: child.title || child.name || 'Untitled Folder',
          parentId: child.parentId,
          children: child.children ? this.parseChildren(child.children) : [],
        })
      }
    }

    return items
  }

  // Convert bookmark tree back to JSON string
  static stringifyBookmarks(bookmarks: BookmarkTree): string {
    try {
      const exportData = {
        version: '1.0',
        bookmarks: {
          children: this.bookmarkTreeToChildren(bookmarks.items),
        },
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      throw new Error(`Failed to stringify bookmarks: ${error}`)
    }
  }

  // Convert bookmark tree to children format
  private static bookmarkTreeToChildren(
    items: (BookmarkItem | BookmarkFolder)[],
  ): any[] {
    return items.map((item) => {
      if ('url' in item) {
        // BookmarkItem
        const bookmark = item as BookmarkItem
        return {
          id: bookmark.id,
          type: 'url',
          title: bookmark.title,
          url: bookmark.url,
          tags: bookmark.tags || [],
          dateAdded: bookmark.dateAdded?.getTime(),
          lastModified: bookmark.lastModified?.getTime(),
        }
      } else {
        // BookmarkFolder
        const folder = item as BookmarkFolder
        return {
          id: folder.id,
          type: 'folder',
          title: folder.name,
          parentId: folder.parentId,
          children: folder.children
            ? this.bookmarkTreeToChildren(folder.children)
            : [],
        }
      }
    })
  }

  // Generate unique ID
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Search bookmarks
  static searchBookmarks(
    bookmarks: BookmarkTree,
    query: string,
  ): BookmarkItem[] {
    const results: BookmarkItem[] = []
    const lowerQuery = query.toLowerCase()

    const searchItems = (items: (BookmarkItem | BookmarkFolder)[]) => {
      for (const item of items) {
        if ('url' in item) {
          const bookmark = item as BookmarkItem
          if (
            bookmark.title.toLowerCase().includes(lowerQuery) ||
            bookmark.url.toLowerCase().includes(lowerQuery) ||
            bookmark.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
          ) {
            results.push(bookmark)
          }
        } else {
          const folder = item as BookmarkFolder
          if (folder.children) {
            searchItems(folder.children)
          }
        }
      }
    }

    searchItems(bookmarks.items)
    return results
  }

  // Get all bookmarks as flat list
  static flattenBookmarks(bookmarks: BookmarkTree): BookmarkItem[] {
    const flatList: BookmarkItem[] = []

    const flattenItems = (items: (BookmarkItem | BookmarkFolder)[]) => {
      for (const item of items) {
        if ('url' in item) {
          flatList.push(item as BookmarkItem)
        } else {
          const folder = item as BookmarkFolder
          if (folder.children) {
            flattenItems(folder.children)
          }
        }
      }
    }

    flattenItems(bookmarks.items)
    return flatList
  }
}

