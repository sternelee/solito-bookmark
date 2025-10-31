export interface Bookmarks {
  id?: string
  _id?: string
  bookmarks?: string
  lastAccessed?: Date
  lastUpdated?: Date
  version?: string
}

export interface CreateBookmarksResponse {
  version?: string
  id?: string
  lastUpdated?: Date
}

export interface GetBookmarksResponse {
  bookmarks?: string
  version?: string
  lastUpdated?: Date
}

export interface UpdateBookmarksResponse {
  version?: string
  lastUpdated?: Date
}

export interface LastUpdatedResponse {
  lastUpdated?: Date
}

export interface VersionResponse {
  version?: string
}

