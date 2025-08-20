# Developer Documentation

## Overview

This documentation provides comprehensive information for developers working on the Aion time tracking app. It covers setup, development workflow, testing, building, and contribution guidelines.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing Guidelines](#testing-guidelines)
5. [Build & Release Process](#build--release-process)
6. [Code Standards](#code-standards)
7. [Contributing Guidelines](#contributing-guidelines)
8. [Troubleshooting](#troubleshooting)

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Node.js (v16 or higher)
node --version  # Should be >= 16.0.0

# npm or Yarn
npm --version   # or yarn --version

# Expo CLI
npm install -g @expo/cli

# Git
git --version
```

### Platform-Specific Setup

#### iOS Development (macOS only)
```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install iOS Simulator
# Available through Xcode
```

#### Android Development
```bash
# Install Android Studio
# Download from: https://developer.android.com/studio

# Set up Android SDK
# Configure ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Project Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd aion
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Start Development Server**
```bash
npm start
# or
yarn start
```

4. **Verify Setup**
```bash
# Run TypeScript check
npm run ts:check

# Run tests
npm test
```

## Project Structure

### Key Directories

```
aion/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components  
├── interfaces/             # TypeScript type definitions
├── utils/                  # Helper functions and services
├── globalStyle/            # Theme and styling
├── assets/                 # Static assets
├── docs/                   # Documentation (this file)
└── __tests__/              # Test files (if present)
```

### File Naming Conventions

- **Screens**: PascalCase directories with `index.tsx`
- **Components**: PascalCase directories with `index.tsx` and `styles.tsx`
- **Interfaces**: PascalCase `.ts` files
- **Utils**: camelCase `.ts` files
- **Styles**: camelCase or specific naming

### Import/Export Patterns

```typescript
// Named exports for utilities
export const utilityFunction = () => {};

// Default exports for components
export default Component;

// Interface exports
export interface MyInterface {}
export { MyInterface } from './interfaces/MyInterface';
```

## Development Workflow

### Branch Strategy

```bash
# Main branches
main          # Production-ready code
develop       # Integration branch

# Feature branches
feature/new-feature-name
fix/bug-description
hotfix/critical-fix
```

### Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/new-timer-controls
```

2. **Development Cycle**
```bash
# Make changes
# Test changes locally
npm run ts:check  # Type checking
npm test          # Run tests

# Commit changes
git add .
git commit -m "feat: add new timer controls"
```

3. **Testing on Devices**
```bash
# Start development server
npm start

# Test on iOS Simulator
npm run ios

# Test on Android Emulator  
npm run android

# Test on physical device
# Scan QR code with Expo Go app
```

4. **Pre-commit Checks**
```bash
# TypeScript compilation
npm run ts:check

# Run all tests
npm test

# Check for console errors
# Verify app functionality
```

### Environment Configuration

#### Development Environment Variables

```bash
# .env.local (if needed)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG_MODE=true
```

#### Database Configuration

The app uses SQLite with local storage:

```typescript
// Database location
const databaseName = "aionMainDatabase.db";

// Development vs Production
const isDevelopment = __DEV__;
```

## Testing Guidelines

### Test Structure

```bash
__tests__/
├── components/         # Component tests
├── screens/           # Screen integration tests
├── utils/             # Utility function tests
└── setup.js           # Test setup configuration
```

### Testing Framework Setup

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
```

### Component Testing

```typescript
// __tests__/components/Timer.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Timer from '../../components/Timer';

describe('Timer Component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Timer />);
    expect(getByTestId('timer-touchable')).toBeTruthy();
  });

  it('starts timer on press', () => {
    const mockOnInit = jest.fn();
    const { getByTestId } = render(<Timer onInit={mockOnInit} />);
    
    fireEvent.press(getByTestId('timer-touchable'));
    expect(mockOnInit).toHaveBeenCalled();
  });
});
```

### Database Testing

```typescript
// __tests__/database/migrations.test.ts
import { openDatabase } from 'expo-sqlite';

describe('Database Migrations', () => {
  let db: any;

  beforeEach(async () => {
    db = openDatabase(':memory:');
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('creates tables correctly', async () => {
    await migrateDbIfNeeded(db);
    
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    expect(tables).toContainEqual({ name: 'projects' });
    expect(tables).toContainEqual({ name: 'tasks' });
    expect(tables).toContainEqual({ name: 'timings' });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Timer.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Timer"
```

### Test Coverage Goals

- **Components**: Aim for >80% coverage
- **Utils**: Aim for >90% coverage  
- **Critical Paths**: 100% coverage for timer, database operations
- **Integration**: Cover major user workflows

## Build & Release Process

### Development Builds

```bash
# Start development server
npm start

# Build for specific platform
npm run android  # Android development
npm run ios      # iOS development (macOS only)
npm run web      # Web development
```

### Production Builds

#### EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure
```

#### Android Production Build

```bash
# Build APK for testing
npm run build:apk
# or
eas build -p android --profile preview

# Build AAB for Play Store
npm run build:androidAAB
# or  
eas build -p android --profile production
```

#### iOS Production Build

```bash
# Build for App Store
eas build -p ios --profile production

# Build for TestFlight
eas build -p ios --profile preview
```

### Build Configuration

#### EAS Build Profiles

```json
// eas.json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "release"
      }
    }
  }
}
```

#### App Configuration

```json
// app.json
{
  "expo": {
    "name": "aion",
    "slug": "aion", 
    "version": "1.1.2",
    "android": {
      "package": "com.fecampossantos.aion",
      "versionCode": 5
    }
  }
}
```

### Version Management

#### Versioning Strategy

- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Android versionCode**: Incremental integer
- **iOS Build Number**: Incremental integer

#### Release Process

1. **Update Version Numbers**
```json
// app.json
{
  "expo": {
    "version": "1.1.3",      // Semantic version
    "android": {
      "versionCode": 6        // Android version code
    },
    "ios": {
      "buildNumber": "6"      // iOS build number
    }
  }
}
```

2. **Create Release Branch**
```bash
git checkout -b release/1.1.3
```

3. **Build and Test**
```bash
# Run full test suite
npm test

# Build for all platforms
eas build --platform all
```

4. **Tag Release**
```bash
git tag v1.1.3
git push origin v1.1.3
```

## Code Standards

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true
  }
}
```

### Code Style Guidelines

#### Component Structure

```typescript
// components/MyComponent/index.tsx
import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default MyComponent;
```

#### Style Organization

```typescript
// components/MyComponent/styles.tsx
import { StyleSheet } from 'react-native';
import globalStyle from '../../globalStyle';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyle.background,
  },
  title: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: 18,
  },
});

export default styles;
```

#### Database Operations

```typescript
// Proper async/await usage
const createProject = async (name: string, hourlyCost: number) => {
  try {
    const result = await database.runAsync(
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
      name,
      hourlyCost
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Project creation failed');
  }
};
```

### Linting Configuration

```json
// .eslintrc.js
module.exports = {
  extends: ['expo', '@react-native-community'],
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### Code Review Checklist

- [ ] TypeScript types properly defined
- [ ] Components follow established patterns
- [ ] Database operations use prepared statements
- [ ] Error handling implemented
- [ ] Tests added for new functionality
- [ ] Performance considerations addressed
- [ ] Accessibility features maintained

## Contributing Guidelines

### Getting Started

1. **Fork Repository**
```bash
git clone https://github.com/yourusername/aion.git
cd aion
```

2. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Set Up Development Environment**
```bash
npm install
npm start
```

### Contribution Process

#### 1. Issue Creation

Before starting work:
- Check existing issues
- Create detailed issue description
- Discuss approach with maintainers

#### 2. Development

```bash
# Follow established patterns
# Write tests for new features
# Update documentation as needed
```

#### 3. Pull Request

```bash
# Ensure tests pass
npm test
npm run ts:check

# Create meaningful commit messages
git commit -m "feat: add project search functionality"

# Push to your fork
git push origin feature/your-feature-name
```

#### 4. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### Code Review Process

1. **Automated Checks**
   - TypeScript compilation
   - Test execution
   - Linting validation

2. **Manual Review**
   - Code quality assessment
   - Architecture compliance
   - Performance considerations

3. **Testing Requirements**
   - Unit tests for new functions
   - Integration tests for features
   - Manual testing on devices

### Issue Management

#### Bug Reports

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Environment**
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15.0]
- App Version: [e.g. 1.1.2]
```

#### Feature Requests

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why this feature is needed

**Proposed Solution**  
How you envision it working

**Alternative Solutions**
Other approaches considered
```

## Troubleshooting

### Common Development Issues

#### Metro Bundle Issues

```bash
# Clear Metro cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Reset project
rm -rf node_modules
npm install
```

#### TypeScript Errors

```bash
# Check TypeScript configuration
npm run ts:check

# Restart TypeScript service (VS Code)
Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

#### Simulator/Emulator Issues

```bash
# Reset iOS Simulator
# Device > Erase All Content and Settings

# Reset Android Emulator
# Cold boot from AVD Manager
```

#### Database Issues

```bash
# Clear app data during development
# Uninstall and reinstall app

# Check database schema
# Use SQLite viewer tools for debugging
```

### Performance Debugging

#### Memory Leaks

```typescript
// Use React DevTools Profiler
// Monitor component re-renders
// Check for proper cleanup in useEffect

useEffect(() => {
  const interval = setInterval(() => {
    // Timer logic
  }, 1000);

  return () => clearInterval(interval); // Cleanup
}, []);
```

#### Database Performance

```sql
-- Use EXPLAIN QUERY PLAN
EXPLAIN QUERY PLAN SELECT * FROM projects WHERE name = ?;

-- Add indexes for frequent queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
```

### Build Troubleshooting

#### Android Build Issues

```bash
# Check Java version
java -version

# Clear Gradle cache  
./gradlew clean

# Check Android SDK setup
echo $ANDROID_HOME
```

#### iOS Build Issues

```bash
# Check Xcode version
xcodebuild -version

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Check provisioning profiles
```

### Getting Help

1. **Documentation**: Check all documentation files
2. **Issues**: Search existing GitHub issues
3. **Community**: Expo community forums
4. **Support**: Contact maintainers through proper channels

### Development Tools

#### Recommended Extensions (VS Code)

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- React Native Tools

#### Debugging Tools

- **React Native Debugger**: Standalone debugging tool
- **Flipper**: Mobile app debugging platform
- **Expo DevTools**: Built-in debugging features

---

**Happy Coding!** Remember to follow the guidelines and contribute to making Aion even better.