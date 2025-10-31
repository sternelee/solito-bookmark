export interface Bookmark {
  id?: string
  _id?: string
  bookmarks?: string
  lastAccessed?: Date
  lastUpdated?: Date
  version?: string
}

export interface CreateBookmarkResponse {
  version?: string
  id?: string
  lastUpdated?: Date
}

export interface GetBookmarkResponse {
  bookmarks?: string
  version?: string
  lastUpdated?: Date
}

export interface UpdateBookmarkResponse {
  version?: string
  lastUpdated?: Date
}

export interface LastUpdatedResponse {
  lastUpdated?: Date
}

export interface VersionResponse {
  version?: string
}

export interface SyncStatus {
  id: string
  status: 'synced' | 'pending' | 'error'
  lastSyncTime?: Date
  errorMessage?: string
}

export interface XBrowserSyncConfig {
  apiUrl: string
  syncId?: string
  autoSync?: boolean
  syncInterval?: number // in minutes
}

