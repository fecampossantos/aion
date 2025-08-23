# Aion - Time Tracking App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

**Aion** is a React Native mobile application built with Expo that helps users track time spent on projects and tasks. The app features project management, task creation, real-time timer functionality, and PDF report generation.

## 🌟 Why Open Source?

Aion is now open source! We believe in the power of community collaboration to create better software. By making Aion open source, we hope to:

- **Improve Quality**: Get feedback and contributions from developers worldwide
- **Foster Innovation**: Allow the community to suggest and implement new features
- **Share Knowledge**: Help other developers learn from our codebase
- **Build Community**: Create a space for developers to collaborate and grow

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting ideas, your help is appreciated.

**Getting Started:**
- Read our [Contributing Guide](CONTRIBUTING.md)
- Check out our [Code of Conduct](CODE_OF_CONDUCT.md)
- Look for issues labeled `good first issue` or `help wanted`
- Join our community discussions

**Quick Start:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📱 Features

### Core Functionality
- **Project Management**: Create, edit, and manage projects with hourly cost rates
- **Task Management**: Add tasks to projects and mark them as completed
- **Time Tracking**: Built-in timer with start/stop functionality and notifications
- **Real-time Timing**: Automatic time recording with second-by-second precision
- **Data Persistence**: SQLite database for reliable local data storage

### Advanced Features
- **Data Backup & Restore**: Export all data to JSON files and save to device storage
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

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting ideas, your help is appreciated.

**Getting Started:**
- Read our [Contributing Guide](CONTRIBUTING.md)
- Check out our [Code of Conduct](CODE_OF_CONDUCT.md)
- Look for issues labeled `good first issue` or `help wanted`
- Join our community discussions

**Quick Start:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🌟 Open Source Community

### **Why We're Open Source**
Aion is now open source because we believe in the power of community collaboration. By making our code public, we hope to:

- **Improve Quality**: Get feedback and contributions from developers worldwide
- **Foster Innovation**: Allow the community to suggest and implement new features
- **Share Knowledge**: Help other developers learn from our codebase
- **Build Community**: Create a space for developers to collaborate and grow

### **Community Guidelines**
- **Be Respectful**: Treat all community members with respect and kindness
- **Help Others**: Share knowledge and help newcomers get started
- **Follow Standards**: Adhere to our coding standards and contribution guidelines
- **Report Issues**: Help us improve by reporting bugs and suggesting features

### **Ways to Contribute**
- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new functionality
- 🔧 **Code Contributions**: Submit pull requests with improvements
- 📚 **Documentation**: Help improve our docs and guides
- 🧪 **Testing**: Help ensure code quality and reliability
- 🌐 **Localization**: Help translate the app to other languages

### **Getting Help**
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community chat
- **Pull Requests**: For code contributions
- **Security Issues**: Report privately via [SECURITY.md](SECURITY.md)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ **Use**: You can use this software for any purpose
- ✅ **Modify**: You can modify the source code
- ✅ **Distribute**: You can distribute copies
- ✅ **Commercial Use**: You can use it commercially
- ✅ **Attribution**: You must include the original license and copyright notice

## 🐛 Known Issues & Roadmap

### Current Issues
- None (let me know if you find any 😅)

### Planned Features
- Multi-language support
- PDF templates options
- improve header on mains screen with animation and blur
   - "aion" text should become smaller and more to the left upper side - add button should disappear - background should be blurred

## 📞 Support

For support and questions, please create an issue in the repository.

## 🚀 Project Status

**Current Version**: 1.1.2  
**Package**: com.fecampossantos.aion  
**Status**: Active Development  
**Open Source**: ✅ Yes  

## 🌍 Community & Resources

- **📖 Documentation**: [docs/](docs/) - Comprehensive guides and API docs
- **🐛 Issues**: [GitHub Issues](https://github.com/fecampossantos/aion/issues) - Report bugs and request features
- **💬 Discussions**: [GitHub Discussions](https://github.com/fecampossantos/aion/discussions) - Community chat and Q&A
- **📋 Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- **📜 License**: [LICENSE](LICENSE) - MIT License details
- **🔒 Security**: [SECURITY.md](SECURITY.md) - Security policy and reporting

## 🙏 Acknowledgments

Aion wouldn't be possible without the amazing open source community:

- **React Native** - The foundation of our mobile app
- **Expo** - The tools and services that make development easier
- **Contributors** - Everyone who helps improve Aion
- **Users** - The people who use and provide feedback on our app

---

**Built with**: ❤️ using React Native and Expo  
**Made Open Source**: 🌟 for the community