// Mock expo modules that cause issues in tests
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-notification-id')),
  dismissNotificationAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

// Mock expo-print
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'file://mock-pdf.pdf' })),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock-documents/',
  moveAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve(JSON.stringify({
    version: '1.0.0',
    timestamp: '2024-01-01T00:00:00.000Z',
    data: {
      projects: [{ project_id: 1, name: 'Test Project', hourly_cost: 50, created_at: '2024-01-01' }],
      tasks: [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }],
      timings: [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }]
    }
  }))),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  EncodingType: {
    UTF8: 'utf8'
  }
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));



// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
  })),
}));

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(() => ({
    runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
    getFirstAsync: jest.fn((query) => {
      // Handle count queries
      if (query && query.includes('COUNT(*)')) {
        return Promise.resolve({ count: 0 });
      }
      // Handle other queries
      return Promise.resolve({ project_id: 1, name: 'Test Project' });
    }),
    getAllAsync: jest.fn(() => Promise.resolve([
      { name: 'Test Task' },
      { timing_id: 1, task_id: 1, time: 3600, created_at: '2023-01-01T10:00:00Z' }
    ])),
    execAsync: jest.fn(() => Promise.resolve()),
  })),
  SQLiteDatabase: jest.fn().mockImplementation(() => ({
    runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
    getAllAsync: jest.fn(() => Promise.resolve([
      { project_id: 1, name: 'Test Project', hourly_cost: 50, created_at: '2024-01-01' }
    ])),
    execAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock expo-router
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterBack = jest.fn();

// Make mock functions globally available
global.mockRouterPush = mockRouterPush;
global.mockRouterReplace = mockRouterReplace;
global.mockRouterBack = mockRouterBack;

jest.mock('expo-router', () => ({
  router: {
    push: mockRouterPush,
    replace: mockRouterReplace,
    back: mockRouterBack,
  },
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    back: mockRouterBack,
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn((callback) => {
    // Execute the callback immediately in tests to simulate focus, but only once
    // to prevent infinite loops
    if (typeof callback === 'function') {
      callback();
    }
  }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    setOptions: jest.fn(),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
}));

// Mock @react-navigation/core
jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({
    setOptions: jest.fn(),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    goBack: jest.fn(),
  }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  const createMockIcon = (name) => ({ name: iconName, size, color, ...props }) => 
    React.createElement(Text, { testID: `${name.toLowerCase()}-${iconName}`, ...props }, iconName);

  return {
    AntDesign: createMockIcon('AntDesign'),
    Entypo: createMockIcon('Entypo'),
    Feather: createMockIcon('Feather'),
    FontAwesome: createMockIcon('FontAwesome'),
    Ionicons: createMockIcon('Ionicons'),
    MaterialIcons: createMockIcon('MaterialIcons'),
  };
});

// Mock react-native-bouncy-checkbox
jest.mock('react-native-bouncy-checkbox', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  
  return ({ onPress, isChecked, ...props }) => 
    React.createElement(Pressable, {
      testID: 'bouncy-checkbox',
      onPress: () => onPress(!isChecked),
      ...props
    }, React.createElement(Text, { testID: 'checkbox-state' }, isChecked ? 'checked' : 'unchecked'));
});

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  const MockPicker = function MockPicker({ selectedValue, onValueChange, children, testID }) {
    return React.createElement(View, { testID: testID || "picker" }, children);
  };
  
  MockPicker.Item = function MockPickerItem({ label, value }) {
    return React.createElement(View, { testID: `picker-item-${value}` }, 
      React.createElement(Text, null, label)
    );
  };
  
  return { Picker: MockPicker };
});

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockDateTimePicker({ testID, value, mode, onChange }) {
    return React.createElement(View, { testID: testID }, 
      React.createElement(Text, null, "Date Picker")
    );
  };
});

// Silence warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('expo-notifications')) return;
  originalWarn(...args);
};