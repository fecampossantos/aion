# Contributing to Aion

Thank you for your interest in contributing to Aion! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Expo CLI
- React Native development environment

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/aion.git`
3. Install dependencies: `yarn install`
4. Start the development server: `yarn dev`

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting and structure
- Use meaningful variable and function names
- Add JSDoc comments for all new functions

### Testing
- Write tests for all new functionality
- Ensure all tests pass: `yarn test`
- Maintain good test coverage
- Use descriptive test names

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(timer): add pause functionality
fix(project): resolve project deletion issue
docs(readme): update installation instructions
```

## 🐛 Reporting Issues

### Bug Reports
- Use the issue template
- Provide detailed reproduction steps
- Include device/OS information
- Add screenshots if applicable

### Feature Requests
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity

## 🔧 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass**
6. **Submit a pull request** with a clear description

### PR Guidelines
- Use descriptive titles
- Reference related issues
- Include screenshots for UI changes
- Keep changes focused and manageable

## 📚 Project Structure

```
chrono/
├── app/                 # Main app screens
├── components/          # Reusable UI components
├── interfaces/          # TypeScript type definitions
├── utils/              # Utility functions
├── globalStyle/        # Theme and styling
├── tests/              # Test files
└── docs/               # Documentation
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

### Test Structure
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for complex workflows

## 🎨 UI/UX Guidelines

- Follow the existing design system
- Use theme colors and spacing consistently
- Ensure accessibility standards are met
- Test on different screen sizes

## 📱 Platform Considerations

- Test on both iOS and Android
- Consider platform-specific behaviors
- Use Expo APIs when possible
- Handle platform differences gracefully

## 🔒 Security

- Never commit sensitive information
- Follow security best practices
- Report security vulnerabilities privately
- Use environment variables for secrets

## 📖 Documentation

- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include usage examples

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🤝 Community

- Be respectful and inclusive
- Help other contributors
- Participate in discussions
- Share knowledge and best practices

## 📞 Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community channels
- Reach out to maintainers

## 🎯 Contribution Areas

We welcome contributions in these areas:
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations
- 📱 Platform support
- 🌐 Localization

Thank you for contributing to Aion! 🚀
