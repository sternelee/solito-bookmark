export interface BookmarkItem {
  id: string
  title: string
  url: string
  folder?: string
  favicon?: string
  tags?: string[]
  dateAdded?: Date
  lastModified?: Date
}

export interface BookmarkFolder {
  id: string
  name: string
  parentId?: string
  children?: (BookmarkItem | BookmarkFolder)[]
}

export interface BookmarkTree {
  items: (BookmarkItem | BookmarkFolder)[]
}

export interface ParseResult {
  success: boolean
  bookmarks?: BookmarkTree
  error?: string
}

