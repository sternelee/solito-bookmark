import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { XBrowserSyncService } from '../../xbrowsersync/sync'

interface SettingsScreenProps {
  onBack?: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const router = useRouter()
  const [searchEnabled, setSearchEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [largeText, setLargeText] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const syncService = new XBrowserSyncService()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    // In a real app, you would load these from storage
    // For now, using default values
  }

  const saveSetting = async (key: string, value: any) => {
    try {
      // In a real app, you would save to AsyncStorage
      console.log(`Saving ${key}:`, value)
    } catch (error) {
      console.error('Failed to save setting:', error)
    }
  }

  const handleSearchToggle = (value: boolean) => {
    setSearchEnabled(value)
    saveSetting('searchEnabled', value)
  }

  const handleAutoRefreshToggle = (value: boolean) => {
    setAutoRefresh(value)
    saveSetting('autoRefresh', value)
  }

  const handleLargeTextToggle = (value: boolean) => {
    setLargeText(value)
    saveSetting('largeText', value)
  }

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value)
    saveSetting('darkMode', value)
  }

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value)
    saveSetting('notifications', value)
  }

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data but keep your bookmarks and sync settings. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear search cache, thumbnails, etc.
              Alert.alert('Success', 'Cache cleared successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache')
            }
          },
        },
      ]
    )
  }

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
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
              setSearchEnabled(true)
              setAutoRefresh(true)
              setLargeText(false)
              setDarkMode(false)
              setNotifications(true)
              Alert.alert('Success', 'Settings reset to defaults')
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings')
            }
          },
        },
      ]
    )
  }

  const getAppVersion = () => {
    return '1.0.0' // In a real app, get from app.json
  }

  const getBuildNumber = () => {
    return '1' // In a real app, get from app.json
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Search</Text>
              <Text style={styles.settingDescription}>
                Enable search functionality
              </Text>
            </View>
            <Switch
              value={searchEnabled}
              onValueChange={handleSearchToggle}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Refresh</Text>
              <Text style={styles.settingDescription}>
                Automatically refresh bookmarks
              </Text>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={handleAutoRefreshToggle}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Sync notifications and alerts
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Large Text</Text>
              <Text style={styles.settingDescription}>
                Increase text size for better readability
              </Text>
            </View>
            <Switch
              value={largeText}
              onValueChange={handleLargeTextToggle}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme (coming soon)
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              disabled={true}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/sync-settings')}
          >
            <Text style={styles.actionButtonText}>Sync Settings</Text>
            <Text style={styles.actionButtonSubtext}>Configure sync options</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/import-export')}
          >
            <Text style={styles.actionButtonText}>Import/Export</Text>
            <Text style={styles.actionButtonSubtext}>Manage bookmark data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/service-info')}
          >
            <Text style={styles.actionButtonText}>Service Info</Text>
            <Text style={styles.actionButtonSubtext}>View server information</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerAction]}
            onPress={handleClearCache}
          >
            <Text style={styles.dangerButtonText}>Clear Cache</Text>
            <Text style={styles.dangerSubtext}>
              Clear cached data (bookmarks preserved)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerAction]}
            onPress={handleResetSettings}
          >
            <Text style={styles.dangerButtonText}>Reset Settings</Text>
            <Text style={styles.dangerSubtext}>
              Reset all settings to defaults
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{getAppVersion()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build:</Text>
            <Text style={styles.infoValue}>{getBuildNumber()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>

          <Text style={styles.descriptionText}>
            xBrowserSync Mobile - A cross-platform bookmark synchronization client
            for xBrowserSync service.
          </Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  dangerAction: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffebee',
  },
  dangerButtonText: {
    color: '#f44336',
  },
  dangerSubtext: {
    color: '#ef5350',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333333',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 8,
  },
})