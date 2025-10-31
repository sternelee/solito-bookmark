export interface GetInfoResponse {
  location?: string
  maxSyncSize: number
  message: string
  status: number
  version: string
}

export enum ServiceStatus {
  offline = 0,
  online = 1,
  degraded = 2,
  maintenance = 3,
}