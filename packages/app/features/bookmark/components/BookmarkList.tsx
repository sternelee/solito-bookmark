import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native'
import { BookmarkItem } from '../types'

interface BookmarkListProps {
  bookmarks: BookmarkItem[]
  onBookmarkPress?: (bookmark: BookmarkItem) => void
  onBookmarkEdit?: (bookmark: BookmarkItem) => void
  onBookmarkDelete?: (bookmarkId: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  isLoading?: boolean
}

export function BookmarkList({
  bookmarks,
  onBookmarkPress,
  onBookmarkEdit,
  onBookmarkDelete,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}: BookmarkListProps) {
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null)

  const handleBookmarkLongPress = (bookmark: BookmarkItem) => {
    setSelectedBookmark(bookmark.id)

    Alert.alert(bookmark.title, `URL: ${bookmark.url}`, [
      {
        text: 'Open',
        onPress: () => {
          onBookmarkPress?.(bookmark)
          setSelectedBookmark(null)
        },
      },
      {
        text: 'Edit',
        onPress: () => {
          onBookmarkEdit?.(bookmark)
          setSelectedBookmark(null)
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Bookmark',
            `Are you sure you want to delete "${bookmark.title}"?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  onBookmarkDelete?.(bookmark.id)
                  setSelectedBookmark(null)
                },
              },
            ],
          )
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setSelectedBookmark(null),
      },
    ])
  }

  const renderBookmark = ({ item }: { item: BookmarkItem }) => (
    <TouchableOpacity
      style={[
        styles.bookmarkItem,
        selectedBookmark === item.id && styles.selectedBookmark,
      ]}
      onPress={() => onBookmarkPress?.(item)}
      onLongPress={() => handleBookmarkLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookmarkContent}>
        <Text style={styles.bookmarkTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.bookmarkUrl} numberOfLines={1}>
          {item.url}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
      <View style={styles.bookmarkMeta}>
        <Text style={styles.bookmarkDate}>
          {item.dateAdded?.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bookmarks...</Text>
      </View>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookmarks found</Text>
        <Text style={styles.emptySubtext}>
          Add some bookmarks to get started
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={bookmarks}
      renderItem={renderBookmark}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  bookmarkItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedBookmark: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  bookmarkContent: {
    flex: 1,
    marginRight: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bookmarkUrl: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#333333',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  bookmarkMeta: {
    alignItems: 'flex-end',
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#999999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
})

