import { NewSyncLog } from '../types'

let syncLogsStore: Map<string, NewSyncLog> = new Map()

export class SyncLogsDB {
  static async create(logData: Partial<NewSyncLog>): Promise<NewSyncLog> {
    const id = this.generateId()
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Start of next day

    const syncLog: NewSyncLog = {
      id,
      expiresAt: tomorrow,
      syncCreated: now,
      ...logData,
    }

    syncLogsStore.set(id, syncLog)
    return syncLog
  }

  static async findByIpAddress(ipAddress: string): Promise<NewSyncLog[]> {
    const allLogs = Array.from(syncLogsStore.values())
    const now = new Date()

    // Filter by IP address and non-expired logs
    return allLogs.filter(
      (log) =>
        log.ipAddress === ipAddress && log.expiresAt && log.expiresAt > now,
    )
  }

  static async findByDateRange(
    ipAddress: string,
    startDate: Date,
    endDate: Date,
  ): Promise<NewSyncLog[]> {
    const allLogs = Array.from(syncLogsStore.values())

    return allLogs.filter(
      (log) =>
        log.ipAddress === ipAddress &&
        log.syncCreated &&
        log.syncCreated >= startDate &&
        log.syncCreated <= endDate &&
        log.expiresAt &&
        log.expiresAt > new Date(),
    )
  }

  static async deleteExpired(): Promise<number> {
    const now = new Date()
    let deletedCount = 0

    syncLogsStore.forEach((log, id) => {
      if (log.expiresAt && log.expiresAt <= now) {
        syncLogsStore.delete(id)
        deletedCount++
      }
    })

    return deletedCount
  }

  static async delete(id: string): Promise<boolean> {
    return syncLogsStore.delete(id)
  }

  static async clear(): Promise<void> {
    syncLogsStore.clear()
  }

  static async getAll(): Promise<NewSyncLog[]> {
    return Array.from(syncLogsStore.values())
  }

  static async cleanup(): Promise<void> {
    await this.deleteExpired()
  }

  private static generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  // Get count of syncs for an IP address in the last 24 hours
  static async getTodaySyncCount(ipAddress: string): Promise<number> {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const logs = await this.findByDateRange(ipAddress, startOfDay, now)
    return logs.length
  }
}

