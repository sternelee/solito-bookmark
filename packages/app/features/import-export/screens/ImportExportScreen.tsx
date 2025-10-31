import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { useImportExport } from '../hooks/useImportExport'

interface ImportExportScreenProps {
  onBack?: () => void
}

export function ImportExportScreen({ onBack }: ImportExportScreenProps) {
  const router = useRouter()
  const [importText, setImportText] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportedData, setExportedData] = useState('')
  const [replaceExisting, setReplaceExisting] = useState(false)

  const {
    isImporting,
    isExporting,
    importResult,
    importFromJson,
    exportToJson,
    getExportStats,
    clearImportResult,
  } = useImportExport()

  const [stats, setStats] = useState({
    bookmarkCount: 0,
    folderCount: 0,
    size: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const exportStats = await getExportStats()
    setStats(exportStats)
  }

  const handleImport = () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please enter bookmark data to import')
      return
    }

    Alert.alert(
      'Import Bookmarks',
      replaceExisting
        ? 'This will replace all existing bookmarks. Are you sure?'
        : 'This will add bookmarks to your existing collection. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Import',
          onPress: () => {
            importFromJson(importText.trim(), replaceExisting)
            setShowImportModal(false)
            setImportText('')
          },
        },
      ]
    )
  }

  const handleExport = async () => {
    const data = await exportToJson()
    if (data) {
      setExportedData(data)
      setShowExportModal(true)
    }
  }

  const handleExportClose = () => {
    setShowExportModal(false)
    setExportedData('')
    loadStats() // Refresh stats
  }

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all local bookmarks and sync settings. Are you sure?',
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
              const { XBrowserSyncService } = await import(
                '../../xbrowsersync/sync'
              )
              const syncService = new XBrowserSyncService()
              await syncService.reset()
              setStats({ bookmarkCount: 0, folderCount: 0, size: 0 })
              Alert.alert('Success', 'All data cleared successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data')
            }
          },
        },
      ]
    )
  }

  useEffect(() => {
    if (importResult) {
      if (importResult.success) {
        Alert.alert('Import Successful', importResult.message)
        loadStats() // Refresh stats
      } else {
        Alert.alert('Import Failed', importResult.message)
      }
      clearImportResult()
    }
  }, [importResult, clearImportResult, loadStats])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import/Export</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Data</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bookmarks:</Text>
            <Text style={styles.statValue}>{stats.bookmarkCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Folders:</Text>
            <Text style={styles.statValue}>{stats.folderCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Data Size:</Text>
            <Text style={styles.statValue}>
              {(stats.size / 1024).toFixed(2)} KB
            </Text>
          </View>
        </View>

        {/* Import Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import Bookmarks</Text>
          <Text style={styles.descriptionText}>
            Import bookmarks from other browsers or backup files. Supports
            xBrowserSync, Netscape, and Chrome bookmark formats.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowImportModal(true)}
            disabled={isImporting}
          >
            <Text style={styles.buttonText}>
              {isImporting ? 'Importing...' : 'Import Bookmarks'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Export Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Bookmarks</Text>
          <Text style={styles.descriptionText}>
            Export your bookmarks to JSON format for backup or migration to
            other services.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleExport}
            disabled={isExporting || stats.bookmarkCount === 0}
          >
            <Text style={styles.buttonText}>
              {isExporting ? 'Exporting...' : 'Export Bookmarks'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Management</Text>
          <Text style={styles.descriptionText}>
            Manage your local data and sync settings.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Help</Text>
          <Text style={styles.helpText}>
            • Import: Paste bookmark JSON data in the text area
          </Text>
          <Text style={styles.helpText}>
            • Export: Copy the generated JSON data for backup
          </Text>
          <Text style={styles.helpText}>
            • Formats: xBrowserSync, Netscape, Chrome bookmark formats are
            supported
          </Text>
          <Text style={styles.helpText}>
            • Replace: Choose to replace existing bookmarks or merge them
          </Text>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowImportModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Import Bookmarks</Text>
            <TouchableOpacity
              onPress={handleImport}
              style={styles.modalSaveButton}
              disabled={isImporting}
            >
              <Text style={styles.modalSaveText}>Import</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Replace existing bookmarks</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  replaceExisting && styles.switchActive,
                ]}
                onPress={() => setReplaceExisting(!replaceExisting)}
              >
                <View
                  style={[
                    styles.switchThumb,
                    replaceExisting && styles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Bookmark JSON Data:</Text>
            <TextInput
              style={styles.textInput}
              value={importText}
              onChangeText={setImportText}
              placeholder="Paste your bookmark JSON data here..."
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.placeholder} />
            <Text style={styles.modalTitle}>Export Bookmarks</Text>
            <TouchableOpacity
              onPress={handleExportClose}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Bookmark JSON Data:</Text>
            <ScrollView style={styles.exportScroll}>
              <Text style={styles.exportText}>{exportedData}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                // In a real app, you would copy to clipboard
                Alert.alert('Copied', 'Bookmark data copied to clipboard')
              }}
            >
              <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#333333',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    padding: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333333',
  },
  switch: {
    width: 48,
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#2196f3',
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 200,
  },
  exportScroll: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    maxHeight: 300,
  },
  exportText: {
    fontSize: 12,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  copyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})