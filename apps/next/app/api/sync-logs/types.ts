export interface NewSyncLog {
  id?: string
  expiresAt?: Date
  ipAddress?: string
  syncCreated?: Date
}

export interface CreateLogResponse {
  success: boolean
  id?: string
}

export interface LimitCheckResponse {
  limitHit: boolean
  remaining?: number
  dailyLimit?: number
}

