import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useMemo } from 'react'

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationContainer
      linking={useMemo(
        () => ({
          prefixes: [Linking.createURL('/')],
          config: {
            initialRouteName: 'bookmarks',
            screens: {
              bookmarks: '',
              'sync-settings': 'sync-settings',
              'service-info': 'service-info',
              'import-export': 'import-export',
              'settings': 'settings',
            },
          },
        }),
        [],
      )}
    >
      {children}
    </NavigationContainer>
  )
}
