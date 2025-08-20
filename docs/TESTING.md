# Testing Documentation

This document describes the testing setup and available commands for the Aion project.

## Available Test Commands

### Basic Testing
- `yarn test` - Run all tests once
- `yarn test:watch` - Run tests in watch mode (re-runs when files change)

### Coverage Testing
- `yarn test:coverage` - Run all tests with coverage report
- `yarn test:coverage:watch` - Run tests with coverage in watch mode

## Coverage Configuration

The project is configured with Jest coverage reporting that includes:

- **Coverage Directory**: `coverage/` (added to `.gitignore`)
- **Coverage Reporters**: 
  - Text (console output)
  - LCOV (for CI/CD tools)
  - HTML (detailed browser view)
- **Coverage Thresholds**:
  - Branches: 35%
  - Functions: 34%
  - Lines: 40%
  - Statements: 40%

## Coverage Collection

Coverage is collected from:
- `app/**/*.{ts,tsx}` - All app screens and components
- `components/**/*.{ts,tsx}` - Reusable components
- `interfaces/**/*.{ts,tsx}` - Type definitions
- `utils/**/*.{ts,tsx}` - Utility functions

Excludes:
- Test files (`*.test.{ts,tsx}`)
- Type definition files (`*.d.ts`)
- Node modules

## Current Coverage Status

As of the latest run:
- **Overall Coverage**: 64.33% statements, 59% branches, 58.28% functions, 65.15% lines
- **Well Tested Components**: 
  - LoadingView, Button, CheckBox, ProjectCard, TextInput, Timing (100% coverage)
  - AddButton component (100% coverage)
  - Content components: BackButton, Body, Header, Wrapper (100% coverage)
  - Timer component (85% coverage)
  - Task component (64% coverage, improved)
  - AddProject screen (96% coverage)
  - **AddTask screen (100% coverage)** ✨
  - **EditProject screen (100% statements, 94% branches, 100% functions, 100% lines)** ✨
  - **Project screen (87.8% statements, 71.42% branches, 73.33% functions, 89.47% lines)** ✨ NEW!
  - AddRecord screen (5% coverage - basic structure tested)
- **Recently Added Tests**: Content components, interface validations, enhanced existing tests, AddRecord basic tests, comprehensive AddTask tests, comprehensive EditProject tests, **comprehensive Project tests**
- **Areas for Improvement**: App screens (Report, Task)

## Running Tests

### Development
```bash
# Run tests once
yarn test

# Run tests in watch mode
yarn test:watch
```

### Coverage Analysis
```bash
# Generate coverage report
yarn test:coverage

# Generate coverage report in watch mode
yarn test:coverage:watch
```

### Type Checking
```bash
# Check TypeScript types
yarn ts:check
```

## Test Structure

Tests are co-located with the code they test:
- Component tests: `components/ComponentName/index.test.tsx`
- Screen tests: `app/ScreenName/index.test.tsx`
- Utility tests: `utils/utilityName.test.ts`

## Jest Configuration

The project uses `jest-expo` preset with custom configuration:
- Setup files for mocking Expo modules
- Transform ignore patterns for React Native compatibility
- Coverage thresholds and reporting configuration

## Recent Improvements

### Added Tests For:
- **LoadingView**: Complete component coverage with proper testIDs
- **Content/index**: Export structure validation
- **AddButton**: Full interaction testing including navigation and state management
- **Task Component**: Enhanced tests for checkbox interactions, disabled states, and completed tasks
- **Timer Component**: Extended tests for custom text display, state management, and prop handling
- **Content Components**: Complete coverage for BackButton, Body, Header, and Wrapper (100% coverage)
- **Interface Files**: Comprehensive validation for Project, Task, and Timing interfaces
- **AddRecord Screen**: Basic component structure and export validation
- **AddTask Screen**: Comprehensive testing including form validation, database operations, navigation, and edge cases (100% coverage)
- **EditProject Screen**: Comprehensive testing including form validation, error handling, duplicate checking, database operations, and navigation (100% statements, 94% branches coverage)

### Coverage Improvements:
- **Overall statements**: 40.03% → 57.73% (+17.70%)
- **Overall branches**: 36.77% → 52.79% (+16.02%)  
- **Overall functions**: 34.97% → 51.53% (+16.56%)
- **Overall lines**: 40.6% → 58.66% (+18.06%)

### Test Status: ✅ ALL TESTS PASSING
- **28 test suites** passing
- **191 tests** passing
- **0 failing tests**

### Technical Enhancements:
- Added testIDs to components for better testability
- Added JSDoc documentation to new and updated components
- Improved mock setup for expo-router testing
- Enhanced test structure with proper cleanup and setup
- **Coverage Configuration**: Excluded style files and layout files from coverage collection
- **Component Improvements**: Enhanced Content components with conditional rendering and proper TypeScript types

## Coverage Exclusions

The following file types are intentionally excluded from coverage collection:

### 🚫 Excluded from Coverage
- **Style Files** (`*.styles.tsx`): Pure styling components that don't contain business logic
- **Layout Files** (`*_layout.tsx`): Configuration and setup files, not business logic
- **Test Files** (`*.test.{ts,tsx}`): Test files themselves
- **Type Definitions** (`*.d.ts`): TypeScript declaration files

### ✅ Included in Coverage
- **Component Logic** (`components/**/*.{ts,tsx}`): Business logic and user interactions
- **App Screens** (`app/**/*.{ts,tsx}`): Main application functionality
- **Utility Functions** (`utils/**/*.{ts,tsx}`): Business logic functions
- **Interface Definitions** (`interfaces/**/*.{ts,tsx}`): Type validation and structure

## Next Steps

To further improve test coverage:
1. Add tests for untested app screens (AddRecord, AddTask, EditProject, etc.)
2. Test edge cases in existing components
3. Add integration tests for complex workflows
4. Consider adding E2E tests for critical user journeys
5. Test interface definitions and type utilities
