import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  XBrowserSyncConfig,
  SyncStatus,
} from '../../../services/xbrowsersync/types'

interface SyncStatusProps {
  config?: XBrowserSyncConfig | null
  syncStatus?: SyncStatus | null
  onSync?: () => void
  onConfigure?: () => void
  isLoading?: boolean
}

export function SyncStatusComponent({
  config,
  syncStatus,
  onSync,
  onConfigure,
  isLoading = false,
}: SyncStatusProps) {
  if (!config) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, styles.statusDisconnected]} />
          <Text style={styles.statusText}>Not Configured</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.configureButton]}
          onPress={onConfigure}
          disabled={isLoading}
        >
          <Text style={styles.configureButtonText}>Setup Sync</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const getStatusColor = () => {
    switch (syncStatus?.status) {
      case 'synced':
        return styles.statusSynced
      case 'syncing':
        return styles.statusSyncing
      case 'pending':
        return styles.statusPending
      case 'error':
        return styles.statusError
      default:
        return styles.statusDisconnected
    }
  }

  const getStatusText = () => {
    if (isLoading) return 'Syncing...'

    switch (syncStatus?.status) {
      case 'synced':
        return 'Synced'
      case 'syncing':
        return 'Syncing...'
      case 'pending':
        return 'Pending Sync'
      case 'error':
        return 'Sync Error'
      default:
        return 'Connected'
    }
  }

  const getLastSyncTime = () => {
    if (!syncStatus?.lastSyncTime) return null

    const now = new Date()
    const syncTime = new Date(syncStatus.lastSyncTime)
    const diffMs = now.getTime() - syncTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, getStatusColor()]} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {syncStatus?.lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last sync: {getLastSyncTime()}
            </Text>
          )}
          {syncStatus?.errorMessage && (
            <Text style={styles.errorText}>{syncStatus.errorMessage}</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={onSync}
          disabled={isLoading || syncStatus?.status === 'syncing'}
        >
          <Text style={styles.syncButtonText}>
            {syncStatus?.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.configureButton]}
          onPress={onConfigure}
          disabled={isLoading}
        >
          <Text style={styles.configureButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {config.autoSync && (
        <Text style={styles.autoSyncText}>
          Auto-sync enabled (every {config.syncInterval || 15} minutes)
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusSynced: {
    backgroundColor: '#4caf50',
  },
  statusSyncing: {
    backgroundColor: '#ff9800',
  },
  statusPending: {
    backgroundColor: '#2196f3',
  },
  statusError: {
    backgroundColor: '#f44336',
  },
  statusDisconnected: {
    backgroundColor: '#9e9e9e',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#2196f3',
  },
  configureButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  configureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  autoSyncText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
})

