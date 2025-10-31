import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { XBrowserSyncService } from '../../../services/xbrowsersync/sync'
import { XBrowserSyncConfig } from '../../../services/xbrowsersync/types'

interface SyncSettingsScreenProps {
  onBack?: () => void
}

export function SyncSettingsScreen({ onBack }: SyncSettingsScreenProps) {
  const [config, setConfig] = useState<XBrowserSyncConfig | null>(null)
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api')
  const [syncId, setSyncId] = useState('')
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState('15')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const syncService = new XBrowserSyncService()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const savedConfig = await syncService.getConfig()
      if (savedConfig) {
        setConfig(savedConfig)
        setApiUrl(savedConfig.apiUrl)
        setSyncId(savedConfig.syncId || '')
        setAutoSync(savedConfig.autoSync ?? true)
        setSyncInterval((savedConfig.syncInterval ?? 15).toString())
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const testConnection = async () => {
    setIsTesting(true)
    try {
      // Test API connection
      const response = await fetch(`${apiUrl.trim()}/bookmarks`)
      if (response.ok) {
        Alert.alert('Success', 'API connection successful!')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Could not connect to the API. Please check the URL and try again.',
      )
    } finally {
      setIsTesting(false)
    }
  }

  const createNewSync = async () => {
    setIsLoading(true)
    try {
      const newConfig: XBrowserSyncConfig = {
        apiUrl: apiUrl.trim(),
        autoSync,
        syncInterval: parseInt(syncInterval) || 15,
      }

      await syncService.initialize(newConfig)
      const newSyncId = await syncService.createSync()

      setSyncId(newSyncId)
      setConfig({ ...newConfig, syncId: newSyncId })

      Alert.alert('Success', 'New sync created successfully!')
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create sync. Please check your settings and try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const connectToExistingSync = async () => {
    if (!syncId.trim()) {
      Alert.alert('Error', 'Please enter a sync ID')
      return
    }

    setIsLoading(true)
    try {
      const newConfig: XBrowserSyncConfig = {
        apiUrl: apiUrl.trim(),
        syncId: syncId.trim(),
        autoSync,
        syncInterval: parseInt(syncInterval) || 15,
      }

      await syncService.initialize(newConfig)
      setConfig(newConfig)

      Alert.alert('Success', 'Connected to existing sync!')
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to connect to sync. Please check the sync ID and try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!config) return

    setIsLoading(true)
    try {
      const updatedConfig: XBrowserSyncConfig = {
        ...config,
        apiUrl: apiUrl.trim(),
        autoSync,
        syncInterval: parseInt(syncInterval) || 15,
      }

      await syncService.initialize(updatedConfig)
      setConfig(updatedConfig)

      Alert.alert('Success', 'Settings saved successfully!')
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const resetSync = async () => {
    Alert.alert(
      'Reset Sync',
      'This will remove all sync settings and local data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncService.reset()
              setConfig(null)
              setSyncId('')
              Alert.alert('Success', 'Sync reset successfully!')
            } catch (error) {
              Alert.alert('Error', 'Failed to reset sync')
            }
          },
        },
      ],
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sync Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <View style={styles.field}>
            <Text style={styles.label}>API URL</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://localhost:3000/api"
              placeholderTextColor="#999999"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.testButton}
              onPress={testConnection}
              disabled={isTesting}
            >
              <Text style={styles.testButtonText}>
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Configuration</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Sync ID</Text>
            <TextInput
              style={styles.input}
              value={syncId}
              onChangeText={setSyncId}
              placeholder="Enter existing sync ID or create new"
              placeholderTextColor="#999999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={createNewSync}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>Create New Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.connectButton]}
              onPress={connectToExistingSync}
              disabled={isLoading}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto Sync</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Auto Sync</Text>
            <Switch value={autoSync} onValueChange={setAutoSync} />
          </View>

          {autoSync && (
            <View style={styles.field}>
              <Text style={styles.label}>Sync Interval (minutes)</Text>
              <TextInput
                style={styles.input}
                value={syncInterval}
                onChangeText={setSyncInterval}
                placeholder="15"
                placeholderTextColor="#999999"
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {config && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.statusText}>
              Connected: {config.syncId ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.statusText}>
              Auto Sync: {config.autoSync ? 'Enabled' : 'Disabled'}
            </Text>
            {config.syncId && (
              <Text style={styles.statusText}>Sync ID: {config.syncId}</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSettings}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSync}>
            <Text style={styles.resetButtonText}>Reset Sync</Text>
          </TouchableOpacity>
        </View>
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
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  testButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#2196f3',
  },
  connectButton: {
    backgroundColor: '#4caf50',
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  connectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})

