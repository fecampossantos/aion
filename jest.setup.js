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
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(() => ({
    runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
    getFirstAsync: jest.fn(() => Promise.resolve({ project_id: 1, name: 'Test Project' })),
    getAllAsync: jest.fn(() => Promise.resolve([
      { name: 'Test Task' },
      { timing_id: 1, task_id: 1, time: 3600, created_at: '2023-01-01T10:00:00Z' }
    ])),
    execAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
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