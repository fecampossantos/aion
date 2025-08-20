# Architecture Documentation

## Overview

Aion follows a modular React Native architecture using Expo Router for navigation, SQLite for data persistence, and TypeScript for type safety. The app is organized into clear separation of concerns with reusable components and centralized state management.

## Technology Stack

### Core Technologies
- **React Native**: 0.76.5 - Cross-platform mobile framework
- **Expo**: ^52.0.23 - Development platform and runtime
- **TypeScript**: ^5.1.3 - Static type checking
- **Expo Router**: ~4.0.15 - File-based navigation system
- **SQLite**: ^15.0.4 - Local database via expo-sqlite

### UI & Interaction
- **React Native Safe Area Context**: 4.12.0 - Safe area handling
- **Expo Vector Icons**: Via @expo/vector-icons - Icon library
- **React Native Bouncy Checkbox**: ^3.0.7 - Enhanced checkbox component
- **React Native Chart Kit**: ^6.12.0 - Data visualization
- **React Native SVG**: 15.8.0 - SVG rendering support

### Device Integration
- **Expo Haptics**: ~14.0.0 - Haptic feedback
- **Expo Notifications**: ~0.29.11 - Push notifications
- **Date Time Picker**: 8.2.0 - Native date/time selection
- **Expo Print**: ~14.0.2 - PDF generation
- **Expo Sharing**: ~13.0.0 - Native sharing functionality

## Project Structure

```
aion/
├── app/                          # Application screens (Expo Router)
│   ├── (index)/                 # Tab group for main navigation
│   │   └── index.tsx            # Home screen - project list
│   ├── AddProject/              # Project creation flow
│   │   ├── index.tsx            # Add project screen
│   │   └── styles.tsx           # Screen-specific styles
│   ├── AddRecord/               # Manual time entry
│   ├── AddTask/                 # Task creation flow
│   ├── EditProject/             # Project editing
│   ├── Project/                 # Project details and management
│   │   ├── index.tsx            # Main project screen
│   │   ├── styles.tsx           # Project screen styles
│   │   └── components/          # Project-specific components
│   ├── ProjectInfo/             # Project information display
│   ├── Report/                  # Reporting and analytics
│   ├── Task/                    # Individual task management
│   └── _layout.tsx              # Root layout with providers
├── components/                   # Reusable UI components
│   ├── Button/                  # Custom button component
│   │   ├── index.tsx            # Button implementation
│   │   └── styles.tsx           # Button styles
│   ├── CheckBox/                # Custom checkbox component
│   ├── Content/                 # Content wrapper component
│   ├── CurrencyInput/           # Currency input with formatting
│   ├── LoadingView/             # Loading indicator
│   ├── ProjectCard/             # Project list item
│   ├── Task/                    # Task-related components
│   ├── TextInput/               # Custom text input
│   ├── Timer/                   # Timer functionality
│   │   ├── index.tsx            # Timer logic and UI
│   │   └── styles.tsx           # Timer styles
│   └── Timing/                  # Time display components
├── interfaces/                   # TypeScript type definitions
│   ├── Project.ts               # Project data model
│   ├── Task.ts                  # Task data model
│   └── Timing.ts                # Timing data model
├── utils/                       # Utility functions and services
│   ├── parser.ts                # Date/time parsing utilities
│   └── pdfReportService/        # PDF generation service
│       └── index.ts             # Report generation logic
├── globalStyle/                 # Global styling system
│   └── index.ts                 # Theme and style constants
└── assets/                      # Static assets
    ├── icon.png                 # App icon
    ├── splash.png               # Splash screen
    └── adaptive-icon.png        # Android adaptive icon
```

## Architectural Patterns

### 1. File-Based Routing (Expo Router)

The app uses Expo Router's file-based routing system where the file structure directly maps to navigation routes:

```typescript
// app/_layout.tsx - Root layout
export default function HomeLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="aionMainDatabase.db" onInit={migrateDbIfNeeded}>
        <Slot />
      </SQLiteProvider>
    </SafeAreaView>
  );
}
```

### 2. Component-Based Architecture

Each screen and reusable component follows a consistent structure:

```
ComponentName/
├── index.tsx      # Main component logic
└── styles.tsx     # Component-specific styles
```

### 3. Separation of Concerns

- **Screens**: Handle navigation, data fetching, and user interactions
- **Components**: Provide reusable UI elements with props interface
- **Interfaces**: Define TypeScript types for data models
- **Utils**: Contain business logic and helper functions
- **Global Styles**: Maintain consistent theming across the app

## Data Flow Architecture

### 1. Database Layer (SQLite)

```typescript
// Database initialization and migration
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Schema creation and versioning
  const DATABASE_VERSION = 1;
  // Migration logic here
}
```

### 2. Data Access Pattern

```typescript
// Screen-level data access
const MyScreen = () => {
  const database = useSQLiteContext();
  const [data, setData] = useState([]);
  
  const fetchData = async () => {
    const result = await database.getAllAsync("SELECT * FROM table");
    setData(result);
  };
  
  useEffect(() => {
    fetchData();
  }, []);
};
```

### 3. State Management

The app uses React's built-in state management:
- **Local State**: `useState` for component-specific state
- **Context**: SQLite context for database access
- **Props**: Data passing between parent and child components

## Core Components

### 1. Timer Component

The timer is the heart of the time tracking functionality:

```typescript
interface TimerProps {
  onStop?: (timeInSeconds: number) => void;
  onInit?: () => void;
  disabled?: boolean;
  textToShowWhenStopped?: null | string;
  taskName?: string;
}

const Timer = ({ onStop, onInit, disabled, textToShowWhenStopped, taskName }: TimerProps) => {
  // Timer logic implementation
};
```

**Features:**
- Real-time counting with second precision
- Haptic feedback on interaction
- Background notifications
- Start/stop state management
- Callback system for time recording

### 2. ProjectCard Component

Displays project information and handles navigation:

```typescript
interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  // Navigation and display logic
};
```

### 3. Custom Input Components

#### TextInput
```typescript
// Custom text input with consistent styling
const TextInput = ({ value, onChangeText, placeholder, ...props }) => {
  // Implementation with global styles
};
```

#### CurrencyInput
```typescript
// Specialized input for currency values
const CurrencyInput = ({ value, onChange, placeholder }) => {
  // Currency formatting and validation
};
```

## Styling Architecture

### Global Style System

```typescript
// globalStyle/index.ts
const globalStyle = {
  black: {
    light: "#363636",
    main: "#1C1C1C", 
    dark: "#0A0A0A",
  },
  background: "#1C1C1C",
  white: "#ffffff",
  font: {
    regular: "OpenSans_400Regular",
    medium: "OpenSans_500Medium",
    bold: "OpenSans_700Bold",
    // ... italic variants
  },
  padding: {
    horizontal: 24
  }
};
```

### Component Styling Pattern

```typescript
// Component-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyle.background,
    padding: globalStyle.padding.horizontal,
  },
  text: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
  },
});
```

## Navigation Architecture

### Screen Navigation Flow

```
Home (Project List)
├── AddProject → Create new project
├── Project Details
│   ├── ProjectInfo → View/edit project details
│   ├── AddTask → Create new task
│   ├── Task Details
│   │   ├── Timer → Track time
│   │   └── AddRecord → Manual time entry
│   └── Report → Generate time reports
└── EditProject → Modify project settings
```

### Navigation Implementation

```typescript
// Using Expo Router navigation
const router = useRouter();

// Navigate to screen with parameters
router.push({
  pathname: "Project",
  params: { projectID: project.project_id },
});

// Navigate back
router.push("/");
```

## Database Architecture

### Schema Design

The database follows a relational model with clear relationships:

```sql
Projects (1:many) Tasks (1:many) Timings
```

### Migration System

```typescript
// Version-based migration system
const DATABASE_VERSION = 1;

if (currentDbVersion === 0) {
  // Initial schema setup
}
// Future migrations would be added here
// if (currentDbVersion === 1) { ... }
```

## Error Handling Strategy

### 1. Database Errors

```typescript
try {
  await database.runAsync(query, params);
} catch (error) {
  console.error("Database operation failed:", error);
  setErrorMessage("Operation failed. Please try again.");
}
```

### 2. User Input Validation

```typescript
const validateInput = (input: string): string | null => {
  if (!input.trim()) {
    return "Field cannot be empty";
  }
  return null;
};
```

### 3. Async Operation Handling

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAsyncOperation = async () => {
  setIsLoading(true);
  try {
    await performOperation();
  } catch (error) {
    handleError(error);
  } finally {
    setIsLoading(false);
  }
};
```

## Performance Considerations

### 1. Database Optimization
- WAL mode enabled for better concurrent access
- Indexed foreign key columns for faster joins
- Prepared statements for SQL injection prevention

### 2. React Native Optimization
- FlatList for large data sets (when needed)
- Lazy loading of screens via Expo Router
- Memoization of expensive calculations

### 3. Memory Management
- Cleanup of timers and intervals
- Proper state management to prevent memory leaks
- Efficient image handling in assets

## Security Considerations

### 1. Data Protection
- Local SQLite database (no network exposure)
- Input validation and sanitization
- Parameterized SQL queries

### 2. User Privacy
- No external data transmission
- Local-only data storage
- No analytics or tracking

## Testing Strategy

### Test Configuration

```javascript
// jest.config.js
{
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)"
  ]
}
```

### Testing Patterns

1. **Component Testing**: Test UI components in isolation
2. **Integration Testing**: Test screen flows and database operations
3. **Unit Testing**: Test utility functions and business logic

## Deployment Architecture

### Build Configuration

```json
// eas.json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Platform Targets
- **Android**: APK and AAB builds via EAS Build
- **iOS**: IPA builds via EAS Build (configured)
- **Web**: Static build via Expo (development only)

## Future Architecture Considerations

### Potential Enhancements

1. **State Management**: Consider Redux Toolkit for complex state
2. **Offline Sync**: Cloud synchronization capabilities
3. **Data Export**: CSV/JSON export functionality
4. **Backup System**: Automated data backup
5. **Performance Monitoring**: Crash reporting and analytics
6. **Internationalization**: Multi-language support structure

### Scalability Considerations

1. **Database**: Consider database size limits and archiving
2. **Performance**: Monitor app performance with large datasets
3. **Memory**: Optimize for long-running timer sessions
4. **Storage**: Implement data cleanup and optimization