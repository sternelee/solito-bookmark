export interface Config {
  allowedOrigins: string[]
  dailyNewSyncsLimit: number
  maxSyncSize: number
  location?: string
  server: {
    relativePath: string
    port: number
  }
  status: {
    message: string
    enabled: boolean
  }
  version: string
  api: {
    version: string
    title: string
    description: string
  }
}

const defaultConfig: Config = {
  allowedOrigins: [],
  dailyNewSyncsLimit: 3,
  maxSyncSize: 5242880, // 5MB
  server: {
    relativePath: '/',
    port: 3000,
  },
  status: {
    message: 'xBrowserSync Service - Online',
    enabled: true,
  },
  version: '1.1.8',
  api: {
    version: '1.1.8',
    title: 'xBrowserSync API',
    description:
      'A bookmark sync service that provides a REST API for creating, retrieving and updating encrypted browser bookmark data.',
  },
}

// Merge user config with default config
function mergeConfig(userConfig: Partial<Config> = {}): Config {
  return {
    ...defaultConfig,
    ...userConfig,
    server: {
      ...defaultConfig.server,
      ...userConfig.server,
    },
    status: {
      ...defaultConfig.status,
      ...userConfig.status,
    },
    api: {
      ...defaultConfig.api,
      ...userConfig.api,
    },
  }
}

// Try to load user config from environment variables or JSON
let config: Config

try {
  // Check for environment variables first
  const envConfig: Partial<Config> = {}

  if (process.env.DAILY_NEW_SYNCS_LIMIT) {
    envConfig.dailyNewSyncsLimit = parseInt(
      process.env.DAILY_NEW_SYNCS_LIMIT,
      10,
    )
  }

  if (process.env.MAX_SYNC_SIZE) {
    envConfig.maxSyncSize = parseInt(process.env.MAX_SYNC_SIZE, 10)
  }

  if (process.env.LOCATION) {
    envConfig.location = process.env.LOCATION
  }

  if (process.env.STATUS_MESSAGE) {
    envConfig.status = {
      ...defaultConfig.status,
      message: process.env.STATUS_MESSAGE,
    }
  }

  if (process.env.VERSION) {
    envConfig.version = process.env.VERSION
  }

  if (process.env.PORT) {
    envConfig.server = {
      ...defaultConfig.server,
      port: parseInt(process.env.PORT, 10),
    }
  }

  config = mergeConfig(envConfig)
} catch (error) {
  console.warn('Failed to load user config, using defaults:', error)
  config = mergeConfig()
}

export function getConfig(): Config {
  return config
}

export function updateConfig(updates: Partial<Config>): void {
  config = mergeConfig({ ...config, ...updates })
}

