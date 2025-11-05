# Security Policy

## Overview

Altron is a local password manager that prioritizes security and privacy. All passwords are encrypted and stored locally on your device. We take security seriously and appreciate responsible disclosure of any vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

We currently support security updates for version 1.0.x. Older versions are not maintained.

## Reporting a Vulnerability

If you discover a security vulnerability in Altron, please report it responsibly:

### How to Report

**Email:** Create an issue on GitHub with the label `security` or contact the maintainer directly

**What to Include:**
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Updates:** Every 3-5 days until resolved
- **Resolution:** Security fixes will be prioritized and released as soon as possible

### Please DO NOT:
- Publicly disclose the vulnerability before it's fixed
- Exploit the vulnerability beyond what's necessary to demonstrate it
- Access or modify other users' data

## Security Best Practices

When using Altron:

- **Choose a strong master key** - Use at least 12 characters with mixed types
- **Lock when away** - Always lock the application when leaving your device
- **Keep browsers updated** - Use the latest version of Chrome or Edge
- **Backup securely** - Store backup copies of `passwords.enc` in secure locations
- **Never share your master key** - It's the only protection for your passwords

## Known Limitations

Altron cannot protect against:
- Physical access to an unlocked device
- Keyloggers or malware on compromised systems
- Screen recording software
- Browser vulnerabilities

## Security Features

- **AES-256-GCM encryption** - Military-grade encryption for all passwords
- **Zero-knowledge architecture** - Master key never stored or transmitted
- **Local-only storage** - No cloud services or network transmission
- **Open source** - Code is publicly auditable
- **No recovery mechanism** - No backdoors by design

## Acknowledgments

We appreciate security researchers and users who help keep Altron secure. Responsible disclosure helps protect all users.

---

**Last Updated:** November 2025
