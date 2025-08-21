# Aion - Time Tracking App

**Aion** is a React Native mobile application built with Expo that helps users track time spent on projects and tasks. The app features project management, task creation, real-time timer functionality, and PDF report generation.

## 📱 Features

### Core Functionality
- **Project Management**: Create, edit, and manage projects with hourly cost rates
- **Task Management**: Add tasks to projects and mark them as completed
- **Time Tracking**: Built-in timer with start/stop functionality and notifications
- **Real-time Timing**: Automatic time recording with second-by-second precision
- **Data Persistence**: SQLite database for reliable local data storage

### Advanced Features
- **PDF Reports**: Generate detailed time reports for projects (feature in development)
- **Cost Calculation**: Automatic calculation of project costs based on time tracked and hourly rates
- **Haptic Feedback**: Enhanced user experience with tactile feedback
- **Notifications**: Background notifications when timer is running
- **Dark Theme**: Modern dark UI design

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons
- **Testing**: Jest with React Native Testing Library

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (v16 or higher)
- npm or Yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Physical device with Expo Go app (optional)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aion
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

## 📱 Usage Guide

### Creating a Project
1. Open the app and tap the "+" button on the home screen
2. Enter a project name and hourly cost rate
3. Tap "adicionar projeto" to create the project

### Managing Tasks
1. Select a project from the home screen
2. Tap "Adicionar tarefa" to create a new task
3. Enter task details and save
4. Mark tasks as completed using the checkbox

### Time Tracking
1. Navigate to a task
2. Tap the timer button to start tracking time
3. The app will show a notification while the timer is running
4. Tap the timer again to stop and save the time entry

### Viewing Reports
1. Go to a project and tap "Ver relatório"
2. Select date range for the report
3. Generate PDF reports (feature in development)

## 🏗️ Project Structure

```
aion/
├── app/                     # Main application screens
│   ├── (index)/            # Home screen
│   ├── AddProject/         # Add project screen
│   ├── AddRecord/          # Add time record screen
│   ├── AddTask/            # Add task screen
│   ├── EditProject/        # Edit project screen
│   ├── Project/            # Project details screen
│   ├── ProjectInfo/        # Project information screen
│   ├── Report/             # Reports screen
│   ├── Task/               # Task details screen
│   └── _layout.tsx         # Root layout with SQLite provider
├── components/             # Reusable UI components
│   ├── Button/            # Custom button component
│   ├── CheckBox/          # Custom checkbox component
│   ├── Content/           # Content wrapper component
│   ├── CurrencyInput/     # Currency input component
│   ├── LoadingView/       # Loading screen component
│   ├── ProjectCard/       # Project card component
│   ├── Task/              # Task-related components
│   ├── TextInput/         # Custom text input component
│   ├── Timer/             # Timer component
│   └── Timing/            # Timing display components
├── interfaces/            # TypeScript interfaces
│   ├── Project.ts         # Project data model
│   ├── Task.ts            # Task data model
│   └── Timing.ts          # Timing data model
├── utils/                 # Utility functions
│   ├── parser.ts          # Date and time parsing utilities
│   └── pdfReportService/  # PDF report generation
├── globalStyle/           # Global styles and theme
└── assets/               # Images, icons, and other assets
```

## 💾 Database Schema

The app uses SQLite with the following tables:

### Projects Table
```sql
CREATE TABLE projects (
  project_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hourly_cost REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  task_id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  name TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);
```

### Timings Table
```sql
CREATE TABLE timings (
  timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  time INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
```

## 📜 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run ts:check` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run build:apk` - Build APK for Android (preview profile)
- `npm run build:androidAAB` - Build Android App Bundle

## 🧪 Testing

The project includes Jest testing setup with React Native Testing Library:

```bash
npm test
```

Test files should be placed in `__tests__/` directories or use the `.test.ts` or `.spec.ts` suffix.

## 🔧 Build & Deployment

### Android APK
```bash
npm run build:apk
```

### Android App Bundle (AAB)
```bash
npm run build:androidAAB
```

### iOS Build
Configure EAS build profile and run:
```bash
eas build -p ios
```

## 🎨 Design System

The app uses a consistent dark theme with the following color palette:

- **Background**: `#1C1C1C` (Eerie Black)
- **Secondary**: `#363636` (Jet Black)
- **Dark**: `#0A0A0A` (Night Black)
- **Text**: `#FFFFFF` (White)
- **Font Family**: Open Sans (Regular, Medium, Bold, Italic variants)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Known Issues & Roadmap

### Current Issues
- None (let me know if you find any 😅)

### Planned Features
- Data backup and restore - _in progress on background agents_
- Multi-language support
- Last worked on tasks display on projects screen - _in progress on background agents_
- Tasks analysis (burndown chart) - _in progress on background agents_

## 📞 Support

For support and questions, please create an issue in the repository.

---

**Version**: 1.1.2  
**Package**: com.fecampossantos.aion  
**Built with**: ❤️ using React Native and Expo