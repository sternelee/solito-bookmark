import {
  Bookmark,
  CreateBookmarkResponse,
  GetBookmarkResponse,
  UpdateBookmarkResponse,
  LastUpdatedResponse,
  VersionResponse,
} from './types'

export class XBrowserSyncAPI {
  private apiUrl: string

  constructor(apiUrl: string = 'http://localhost:3000/api') {
    this.apiUrl = apiUrl
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Create a new bookmarks sync
  async createBookmarks(
    bookmarksData?: string,
    version?: string,
  ): Promise<CreateBookmarkResponse> {
    const body: any = {}

    if (bookmarksData) {
      body.bookmarks = bookmarksData
    }

    if (version) {
      body.version = version
    }

    return this.makeRequest<CreateBookmarkResponse>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  // Get bookmarks by ID
  async getBookmarks(id: string): Promise<GetBookmarkResponse> {
    return this.makeRequest<GetBookmarkResponse>(
      `/bookmarks/${encodeURIComponent(id)}`,
    )
  }

  // Update bookmarks
  async updateBookmarks(
    id: string,
    bookmarksData: string,
    version?: string,
  ): Promise<UpdateBookmarkResponse> {
    const body: any = {
      bookmarks: bookmarksData,
    }

    if (version) {
      body.version = version
    }

    return this.makeRequest<UpdateBookmarkResponse>(
      `/bookmarks/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
    )
  }

  // Get last updated timestamp
  async getLastUpdated(id: string): Promise<LastUpdatedResponse> {
    return this.makeRequest<LastUpdatedResponse>(
      `/bookmarks/${encodeURIComponent(id)}/lastUpdated`,
    )
  }

  // Get version
  async getVersion(id: string): Promise<VersionResponse> {
    return this.makeRequest<VersionResponse>(
      `/bookmarks/${encodeURIComponent(id)}/version`,
    )
  }

  // Check if sync exists and is accessible
  async checkSyncHealth(id: string): Promise<boolean> {
    try {
      await this.getVersion(id)
      return true
    } catch (error) {
      return false
    }
  }

  // Get service information
  async getServiceInfo(): Promise<{
    location?: string
    maxSyncSize: number
    message: string
    status: number
    version: string
  }> {
    return this.makeRequest('/info')
  }
}

