import { Bookmarks } from '../types'

let bookmarksStore: Map<string, Bookmarks> = new Map()

export class BookmarksDB {
  static async create(bookmarksData: Partial<Bookmarks>): Promise<Bookmarks> {
    const id = this.generateId()
    const now = new Date()
    const bookmarks: Bookmarks = {
      id,
      lastAccessed: now,
      lastUpdated: now,
      ...bookmarksData,
    }

    bookmarksStore.set(id, bookmarks)
    return bookmarks
  }

  static async findById(id: string): Promise<Bookmarks | null> {
    const bookmarks = bookmarksStore.get(id)
    if (bookmarks) {
      // Update lastAccessed
      bookmarks.lastAccessed = new Date()
      bookmarksStore.set(id, bookmarks)
    }
    return bookmarks || null
  }

  static async update(
    id: string,
    updateData: Partial<Bookmarks>,
  ): Promise<Bookmarks | null> {
    const existing = bookmarksStore.get(id)
    if (!existing) {
      return null
    }

    const updated: Bookmarks = {
      ...existing,
      ...updateData,
      lastUpdated: new Date(),
      lastAccessed: new Date(),
    }

    bookmarksStore.set(id, updated)
    return updated
  }

  static async delete(id: string): Promise<boolean> {
    return bookmarksStore.delete(id)
  }

  static async getAll(): Promise<Bookmarks[]> {
    return Array.from(bookmarksStore.values())
  }

  static async clear(): Promise<void> {
    bookmarksStore.clear()
  }

  private static generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }
}

