# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-03

### Added
- Initial release of Altron Password Manager
- AES-256-GCM encryption for password storage
- Strong password generator (8-64 characters)
- Customizable character sets (uppercase, lowercase, numbers, symbols)
- Password strength meter
- Local file storage using File System Access API
- Master key authentication system
- 6 beautiful themes:
  - Light
  - Dark
  - VS Code Dark
  - Monokai
  - Solarized Dark
  - Neon
- Real-time password search functionality
- Password management features:
  - View password details
  - Copy to clipboard
  - Delete passwords
- Responsive design for desktop, tablet, and mobile
- Offline-first functionality
- Help modal with comprehensive usage instructions
- Lock/unlock functionality for security
- GitHub repository link in footer

### Security
- Zero-knowledge architecture (master key never stored)
- All encryption happens client-side
- No network requests or data transmission
- Complete offline functionality

---

## Future Releases

### [Unreleased]

#### Known Issues
- Saved passwords don't appear in list until searched (Issue #3)
- Multiple master keys and folders can be selected per session (Issue #1)
- Neon and Monokai themes need UX improvements (Issue #2)

#### Planned Features
- Auto-switch to Passwords tab after saving
- Restrict to single master key and folder per session
- Improved theme contrast and readability
- Password export/import functionality
- Password history tracking
- Breach detection alerts
- Browser extension for auto-fill

---

## Version Format

- **Major version** (X.0.0): Breaking changes
- **Minor version** (0.X.0): New features, backwards compatible
- **Patch version** (0.0.X): Bug fixes, backwards compatible

## Types of Changes

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

[1.0.0]: https://github.com/srsdesigndev/altron/releases/tag/v1.0.0