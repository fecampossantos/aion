# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Aion seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [INSERT_SECURITY_EMAIL].

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s) related to the vulnerability**
- **The location of the affected source code (tag/branch/commit or direct URL)**
- **Any special configuration required to reproduce the issue**
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code (if possible)**
- **Impact of the issue, including how an attacker might exploit it**

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

Aion follows the principle of [Responsible Disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure).

## Disclosure Policy

When we receive a security bug report, we will:

1. **Confirm the problem** and determine affected versions.
2. **Audit code** to find any similar problems.
3. **Prepare fixes** for all supported versions. These fixes will be released as new minor versions.

## Comments on this Policy

If you have suggestions on how this process could be improved please submit a pull request.

## Security Best Practices

### For Users
- Keep your app updated to the latest version
- Use strong, unique passwords for any accounts
- Enable two-factor authentication when available
- Be cautious with backup files and data exports
- Report suspicious activity immediately

### For Developers
- Never commit sensitive information to version control
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Follow secure coding practices
- Keep dependencies updated

### For Contributors
- Review code for security vulnerabilities
- Test security features thoroughly
- Follow the project's security guidelines
- Report any security concerns privately

## Security Features

Aion includes several security features:

- **Local Data Storage**: All data is stored locally on the device
- **No Network Communication**: The app doesn't send data to external servers
- **Input Validation**: All user inputs are validated before processing
- **Secure File Handling**: Safe handling of backup and restore files
- **Permission Management**: Minimal required permissions for app functionality

## Security Updates

Security updates will be released as patch versions (e.g., 1.1.3) and will include:

- Security vulnerability fixes
- Security-related improvements
- Critical bug fixes

## Contact

For security-related questions or concerns, please contact:

- **Security Email**: [INSERT_SECURITY_EMAIL]
- **GitHub Issues**: For non-security related issues
- **Discussions**: For general questions and community support

## Acknowledgments

We would like to thank all security researchers and contributors who help keep Aion secure by responsibly reporting vulnerabilities.

## License

This security policy is licensed under the same terms as the Aion project.
