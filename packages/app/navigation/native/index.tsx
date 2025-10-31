import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { BookmarksScreen } from 'app/features/bookmark/screens/BookmarksScreen'
import { SyncSettingsScreen } from 'app/features/sync/screens/SyncSettingsScreen'
import { ServiceInfoScreen } from 'app/features/info/screens/ServiceInfoScreen'
import { ImportExportScreen } from 'app/features/import-export/screens/ImportExportScreen'
import { SettingsScreen } from 'app/features/settings/screens/SettingsScreen'

const Stack = createNativeStackNavigator<{
  bookmarks: undefined
  'sync-settings': undefined
  'service-info': undefined
  'import-export': undefined
  'settings': undefined
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="bookmarks"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1a1a1a',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="bookmarks"
        component={BookmarksScreen}
        options={{
          title: 'xBrowserSync',
          headerStyle: {
            backgroundColor: '#2196f3',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      />
      <Stack.Screen
        name="sync-settings"
        component={SyncSettingsScreen}
        options={{
          title: 'Sync Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="service-info"
        component={ServiceInfoScreen}
        options={{
          title: 'Service Info',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="import-export"
        component={ImportExportScreen}
        options={{
          title: 'Import/Export',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  )
}
