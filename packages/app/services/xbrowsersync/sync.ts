import { XBrowserSyncAPI } from './api'
import { StorageService } from '../storage'
import { XBrowserSyncConfig, SyncStatus } from './types'

export class XBrowserSyncService {
  private api: XBrowserSyncAPI
  private storage: StorageService
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.api = new XBrowserSyncAPI()
    this.storage = StorageService.getInstance()
  }

  // Initialize sync with configuration
  async initialize(config: XBrowserSyncConfig): Promise<void> {
    try {
      await this.storage.saveConfig(config)

      if (config.syncId) {
        // Validate existing sync
        const isHealthy = await this.api.checkSyncHealth(config.syncId)
        if (!isHealthy) {
          throw new Error('Invalid sync ID')
        }
      }

      // Setup auto-sync if enabled
      if (config.autoSync) {
        this.startAutoSync(config.syncInterval || 15) // Default 15 minutes
      }
    } catch (error) {
      console.error('Failed to initialize sync service:', error)
      throw error
    }
  }

  // Create a new sync
  async createSync(bookmarksData?: string, version?: string): Promise<string> {
    try {
      const response = await this.api.createBookmarks(bookmarksData, version)

      if (!response.id) {
        throw new Error('Failed to create sync: No ID returned')
      }

      // Update configuration with new sync ID
      const config = await this.storage.getConfig()
      if (config) {
        config.syncId = response.id
        await this.storage.saveConfig(config)
      }

      // Save bookmarks locally
      if (bookmarksData) {
        await this.storage.saveBookmarks(bookmarksData)
      }

      // Update sync status
      await this.updateSyncStatus({
        id: response.id,
        status: 'synced',
        lastSyncTime: new Date(),
      })

      return response.id
    } catch (error) {
      console.error('Failed to create sync:', error)
      throw error
    }
  }

  // Sync bookmarks from server
  async syncFromServer(): Promise<string | null> {
    try {
      const config = await this.storage.getConfig()
      if (!config?.syncId) {
        throw new Error('No sync ID configured')
      }

      const response = await this.api.getBookmarks(config.syncId)

      if (response.bookmarks) {
        await this.storage.saveBookmarks(response.bookmarks)
      }

      await this.updateSyncStatus({
        id: config.syncId,
        status: 'synced',
        lastSyncTime: new Date(),
      })

      return response.bookmarks || null
    } catch (error) {
      console.error('Failed to sync from server:', error)
      await this.updateSyncStatus({
        id: (await this.storage.getConfig())?.syncId || 'unknown',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // Sync bookmarks to server
  async syncToServer(bookmarksData: string, version?: string): Promise<void> {
    try {
      const config = await this.storage.getConfig()
      if (!config?.syncId) {
        throw new Error('No sync ID configured')
      }

      await this.api.updateBookmarks(config.syncId, bookmarksData, version)

      // Save locally as well
      await this.storage.saveBookmarks(bookmarksData)

      await this.updateSyncStatus({
        id: config.syncId,
        status: 'synced',
        lastSyncTime: new Date(),
      })
    } catch (error) {
      console.error('Failed to sync to server:', error)
      await this.updateSyncStatus({
        id: (await this.storage.getConfig())?.syncId || 'unknown',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // Get local bookmarks
  async getLocalBookmarks(): Promise<string | null> {
    return this.storage.getBookmarks()
  }

  // Save local bookmarks
  async saveLocalBookmarks(bookmarks: string): Promise<void> {
    await this.storage.saveBookmarks()

    // Mark as pending sync if we have a sync ID
    const config = await this.storage.getConfig()
    if (config?.syncId) {
      await this.updateSyncStatus({
        id: config.syncId,
        status: 'pending',
        lastSyncTime: new Date(),
      })
    }
  }

  // Check for conflicts and resolve
  async checkForConflicts(): Promise<boolean> {
    try {
      const config = await this.storage.getConfig()
      if (!config?.syncId) {
        return false
      }

      const serverLastUpdated = await this.api.getLastUpdated(config.syncId)
      const localStatus = await this.storage.getSyncStatus()

      if (serverLastUpdated.lastUpdated && localStatus?.lastSyncTime) {
        const serverTime = new Date(serverLastUpdated.lastUpdated)
        const localTime = new Date(localStatus.lastSyncTime)

        return serverTime > localTime
      }

      return false
    } catch (error) {
      console.error('Failed to check for conflicts:', error)
      return false
    }
  }

  // Get current configuration
  async getConfig(): Promise<XBrowserSyncConfig | null> {
    return this.storage.getConfig()
  }

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus | null> {
    return this.storage.getSyncStatus()
  }

  // Start automatic sync
  private startAutoSync(intervalMinutes: number): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(
      async () => {
        try {
          await this.syncFromServer()
        } catch (error) {
          console.error('Auto-sync failed:', error)
        }
      },
      intervalMinutes * 60 * 1000,
    )
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Update sync status
  private async updateSyncStatus(status: SyncStatus): Promise<void> {
    await this.storage.saveSyncStatus(status)
  }

  // Reset/clear all data
  async reset(): Promise<void> {
    this.stopAutoSync()
    await this.storage.clearAll()
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSync()
  }
}

