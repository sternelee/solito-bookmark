import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookmarkList } from '../components/BookmarkList'
import { BookmarkForm } from '../components/BookmarkForm'
import { SyncStatusComponent } from '../../sync/components/SyncStatus'
import { BookmarkItem } from '../types'
import { XBrowserSyncService } from '../../../services/xbrowsersync/sync'

export function BookmarksScreen() {
  const router = useRouter()

  const {
    bookmarks,
    isLoading,
    error,
    syncStatus,
    syncFromServer,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getAllBookmarks,
    searchBookmarks,
  } = useBookmarks()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(
    null,
  )
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkItem[]>([])

  const syncService = new XBrowserSyncService()

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchBookmarks(searchQuery)
      setFilteredBookmarks(results)
    } else {
      setFilteredBookmarks(getAllBookmarks())
    }
  }, [searchQuery, bookmarks, searchBookmarks, getAllBookmarks])

  const handleBookmarkPress = (bookmark: BookmarkItem) => {
    Alert.alert('Open Bookmark', `Do you want to open ${bookmark.url}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open',
        onPress: () => {
          // In a real app, you would open the URL in a browser
          console.log('Opening URL:', bookmark.url)
        },
      },
    ])
  }

  const handleBookmarkEdit = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark)
  }

  const handleBookmarkDelete = (bookmarkId: string) => {
    deleteBookmark(bookmarkId)
  }

  const handleSaveBookmark = (bookmark: BookmarkItem) => {
    if (editingBookmark) {
      updateBookmark(bookmark)
      setEditingBookmark(null)
    } else {
      addBookmark(bookmark)
      setShowAddForm(false)
    }
  }

  const handleCancelForm = () => {
    setShowAddForm(false)
    setEditingBookmark(null)
  }

  const handleSync = async () => {
    try {
      await syncFromServer()
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync bookmarks. Please try again.')
    }
  }

  const handleConfigureSync = () => {
    router.push('/sync-settings')
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleSync}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Sync Status */}
      <SyncStatusComponent
        syncStatus={syncStatus}
        onSync={handleSync}
        onConfigure={handleConfigureSync}
        isLoading={syncStatus === 'syncing'}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bookmarks..."
          placeholderTextColor="#999999"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.quickActionButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/import-export')}
        >
          <Text style={styles.quickActionButtonText}>📁 Import/Export</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/service-info')}
        >
          <Text style={styles.quickActionButtonText}>ℹ️ Service Info</Text>
        </TouchableOpacity>
      </View>

      {/* Bookmarks List */}
      <BookmarkList
        bookmarks={filteredBookmarks}
        onBookmarkPress={handleBookmarkPress}
        onBookmarkEdit={handleBookmarkEdit}
        onBookmarkDelete={handleBookmarkDelete}
        isRefreshing={syncStatus === 'syncing'}
        isLoading={isLoading}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddForm(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Bookmark Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <BookmarkForm onSave={handleSaveBookmark} onCancel={handleCancelForm} />
      </Modal>

      {/* Edit Bookmark Modal */}
      <Modal
        visible={!!editingBookmark}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {editingBookmark && (
          <BookmarkForm
            bookmark={editingBookmark}
            onSave={handleSaveBookmark}
            onCancel={handleCancelForm}
          />
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
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
})

