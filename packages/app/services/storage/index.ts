import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { XBrowserSyncConfig, SyncStatus } from '../xbrowsersync/types'

export class StorageService {
  private static instance: StorageService

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // Configuration storage
  async saveConfig(config: XBrowserSyncConfig): Promise<void> {
    try {
      await AsyncStorage.setItem('xbrowsersync_config', JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }

  async getConfig(): Promise<XBrowserSyncConfig | null> {
    try {
      const configData = await AsyncStorage.getItem('xbrowsersync_config')
      return configData ? JSON.parse(configData) : null
    } catch (error) {
      console.error('Failed to load config:', error)
      return null
    }
  }

  async removeConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem('xbrowsersync_config')
    } catch (error) {
      console.error('Failed to remove config:', error)
      throw error
    }
  }

  // Bookmark storage (local cache)
  async saveBookmarks(bookmarks: string): Promise<void> {
    try {
      await AsyncStorage.setItem('bookmarks_cache', bookmarks)
    } catch (error) {
      console.error('Failed to save bookmarks cache:', error)
      throw error
    }
  }

  async getBookmarks(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('bookmarks_cache')
    } catch (error) {
      console.error('Failed to load bookmarks cache:', error)
      return null
    }
  }

  async removeBookmarks(): Promise<void> {
    try {
      await AsyncStorage.removeItem('bookmarks_cache')
    } catch (error) {
      console.error('Failed to remove bookmarks cache:', error)
      throw error
    }
  }

  // Sync status storage
  async saveSyncStatus(status: SyncStatus): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_status', JSON.stringify(status))
    } catch (error) {
      console.error('Failed to save sync status:', error)
      throw error
    }
  }

  async getSyncStatus(): Promise<SyncStatus | null> {
    try {
      const statusData = await AsyncStorage.getItem('sync_status')
      return statusData ? JSON.parse(statusData) : null
    } catch (error) {
      console.error('Failed to load sync status:', error)
      return null
    }
  }

  async removeSyncStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem('sync_status')
    } catch (error) {
      console.error('Failed to remove sync status:', error)
      throw error
    }
  }

  // Secure storage for sensitive data (like passwords/tokens if needed)
  async saveSecureData(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error('Failed to save secure data:', error)
      throw error
    }
  }

  async getSecureData(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key)
      return value
    } catch (error) {
      console.error('Failed to load secure data:', error)
      return null
    }
  }

  async removeSecureData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error('Failed to remove secure data:', error)
      throw error
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'xbrowsersync_config',
        'bookmarks_cache',
        'sync_status',
      ])
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw error
    }
  }
}

