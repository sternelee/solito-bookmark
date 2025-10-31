import { NextRequest } from 'next/server'
import { SyncLogsDB } from './db'
import { getConfig } from '../../config'
import { NewSyncLog, CreateLogResponse, LimitCheckResponse } from '../types'

export class SyncLogsService {
  // Create a new sync log entry
  static async createLog(request: NextRequest): Promise<CreateLogResponse> {
    try {
      const ipAddress = this.getClientIpAddress(request)

      const newLog: NewSyncLog = {
        ipAddress,
      }

      const createdLog = await SyncLogsDB.create(newLog)

      return {
        success: true,
        id: createdLog.id,
      }
    } catch (error) {
      console.error('Error creating sync log:', error)
      return {
        success: false,
      }
    }
  }

  // Check if new syncs limit has been hit for an IP address
  static async newSyncsLimitHit(
    request: NextRequest,
  ): Promise<LimitCheckResponse> {
    try {
      const config = getConfig()

      // If daily new syncs limit is disabled, return false
      if (config.dailyNewSyncsLimit <= 0) {
        return {
          limitHit: false,
          remaining: -1,
          dailyLimit: -1,
        }
      }

      const ipAddress = this.getClientIpAddress(request)
      const todaySyncCount = await SyncLogsDB.getTodaySyncCount(ipAddress)

      const limitHit = todaySyncCount >= config.dailyNewSyncsLimit

      return {
        limitHit,
        remaining: Math.max(0, config.dailyNewSyncsLimit - todaySyncCount),
        dailyLimit: config.dailyNewSyncsLimit,
      }
    } catch (error) {
      console.error('Error checking sync limit:', error)
      // In case of error, allow the sync to proceed
      return {
        limitHit: false,
        remaining: -1,
        dailyLimit: -1,
      }
    }
  }

  // Get client IP address from request
  static getClientIpAddress(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = request.headers.get('x-client-ip')

    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim()
    }

    if (realIp) {
      return realIp.trim()
    }

    if (clientIp) {
      return clientIp.trim()
    }

    // Fallback to request IP (this might not work as expected in some environments)
    try {
      const requestUrl = new URL(request.url)
      return requestUrl.hostname || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Cleanup expired logs
  static async cleanupExpiredLogs(): Promise<number> {
    try {
      return await SyncLogsDB.deleteExpired()
    } catch (error) {
      console.error('Error cleaning up expired logs:', error)
      return 0
    }
  }

  // Get sync statistics for an IP address
  static async getSyncStats(request: NextRequest): Promise<{
    todayCount: number
    weeklyCount: number
    totalCount: number
    dailyLimit: number
  }> {
    try {
      const ipAddress = this.getClientIpAddress(request)
      const config = getConfig()

      const now = new Date()
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const todayLogs = await SyncLogsDB.findByDateRange(
        ipAddress,
        startOfDay,
        now,
      )
      const weeklyLogs = await SyncLogsDB.findByDateRange(
        ipAddress,
        startOfWeek,
        now,
      )
      const allLogs = await SyncLogsDB.findByIpAddress(ipAddress)

      return {
        todayCount: todayLogs.length,
        weeklyCount: weeklyLogs.length,
        totalCount: allLogs.length,
        dailyLimit: config.dailyNewSyncsLimit,
      }
    } catch (error) {
      console.error('Error getting sync stats:', error)
      return {
        todayCount: 0,
        weeklyCount: 0,
        totalCount: 0,
        dailyLimit: 0,
      }
    }
  }
}

