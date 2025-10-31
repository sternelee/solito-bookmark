import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { XBrowserSyncAPI } from '../../../services/xbrowsersync/api'

interface ServiceInfo {
  location?: string
  maxSyncSize: number
  message: string
  status: number
  version: string
}

interface ServiceInfoScreenProps {
  onBack?: () => void
}

export function ServiceInfoScreen({ onBack }: ServiceInfoScreenProps) {
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = new XBrowserSyncAPI()

  const loadServiceInfo = async () => {
    try {
      setError(null)
      const info = await api.getServiceInfo()
      setServiceInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service information')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadServiceInfo()
  }

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return 'Offline'
      case 1:
        return 'Online'
      case 2:
        return 'Degraded'
      case 3:
        return 'Maintenance'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return '#f44336' // red
      case 1:
        return '#4caf50' // green
      case 2:
        return '#ff9800' // orange
      case 3:
        return '#9e9e9e' // grey
      default:
        return '#666666' // dark grey
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    loadServiceInfo()
  }, [])

  if (isLoading && !serviceInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Service Info</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading service information...</Text>
        </View>
      </View>
    )
  }

  if (error && !serviceInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Service Info</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServiceInfo}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Service Info</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {serviceInfo && (
          <>
            {/* Status Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Service Status</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(serviceInfo.status) },
                  ]}
                />
                <Text style={styles.statusText}>
                  {getStatusText(serviceInfo.status)}
                </Text>
              </View>
              <Text style={styles.messageText}>{serviceInfo.message}</Text>
            </View>

            {/* Version Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Version Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version:</Text>
                <Text style={styles.infoValue}>{serviceInfo.version}</Text>
              </View>
            </View>

            {/* Configuration */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configuration</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Max Sync Size:</Text>
                <Text style={styles.infoValue}>
                  {formatBytes(serviceInfo.maxSyncSize)}
                </Text>
              </View>
              {serviceInfo.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{serviceInfo.location}</Text>
                </View>
              )}
            </View>

            {/* API Endpoints */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>API Endpoints</Text>
              <View style={styles.endpointContainer}>
                <Text style={styles.endpointText}>• GET /api/info</Text>
                <Text style={styles.endpointText}>• POST /api/bookmarks</Text>
                <Text style={styles.endpointText}>• GET /api/bookmarks/:id</Text>
                <Text style={styles.endpointText}>• PUT /api/bookmarks/:id</Text>
                <Text style={styles.endpointText}>• GET /api/bookmarks/:id/version</Text>
                <Text style={styles.endpointText}>• GET /api/bookmarks/:id/lastUpdated</Text>
              </View>
            </View>

            {/* Server Information */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Server Information</Text>
              <Text style={styles.descriptionText}>
                xBrowserSync is a free and open-source bookmark synchronization service.
                It provides a REST API for creating, retrieving, and updating encrypted
                browser bookmark data across multiple devices and browsers.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#2196f3',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  messageText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  endpointContainer: {
    paddingVertical: 8,
  },
  endpointText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
})