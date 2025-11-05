# Altron - Product Documentation

## What is Altron?

Altron is a local password manager that stores your passwords on your device rather than in the cloud. It uses encryption to keep your passwords secure and requires no account creation or subscription.

![Altron Landing Page](assets/landing-hero.png)

### Core Principles

- **Local Storage**: Your passwords never leave your device
- **Free to Use**: No subscription fees or premium tiers
- **Open Source**: Code is publicly available for review
- **Offline Capable**: Works without an internet connection
- **Privacy First**: No data collection or tracking

---

## Getting Started

### First Time Setup

When you open Altron, you'll need to:

1. **Select a folder** on your computer where passwords will be stored
2. **Create a master key** that will encrypt your passwords
3. **Grant permission** for the app to access the folder you selected

![Storage and Master Key Setup](assets/storage-and-master-key-auth.png)

The master key is the only thing standing between your passwords and anyone who accesses your device. Choose something memorable but difficult to guess.

**Important**: If you forget your master key, your passwords cannot be recovered. This is by design for maximum security.

### Understanding the Interface

Once unlocked, Altron opens to a simple dashboard with two main sections:

![Dashboard View](assets/generate-form.png)

**Create New**: Generate and save new passwords

**Passwords**: View, search, and manage saved passwords

---

## Core Features

### Password Generation

Altron helps you create strong, random passwords rather than reusing weak ones.

![Password Generator](assets/generate-action.png)

#### What You Can Control

- **Length**: Choose between 8 and 64 characters
- **Character Types**: Mix uppercase, lowercase, numbers, and symbols
- **Strength Indicator**: See how strong your password is in real-time

The generator uses your browser's cryptographic functions to create truly random passwords. Once generated, you can copy it immediately or save it with a label for future reference.

![Save Password Form](assets/password-save-form.png)

### Managing Your Passwords

Your saved passwords appear in a searchable list. Each entry shows the label you assigned and when it was created.

![Password List](assets/password-lists.png)

#### Available Actions

- **Search**: Filter passwords by typing in the search box
- **View**: Click to see the full password
- **Copy**: Copy password to clipboard with one click
- **Delete**: Remove passwords you no longer need

![View Password Options](assets/view-or-copy-password.png)

Passwords are hidden by default. Click the eye icon to reveal them when needed.

### Themes

Choose from six color schemes to match your preference. Your selection is remembered between sessions.

![Available Themes](assets/themes-available.png)

Themes include Light, Dark, VS Code Dark, Monokai, Solarized Dark, and Neon.

![Theme Selector](assets/themes-dropdown.png)

### Locking the Application

When you step away from your computer, lock Altron to prevent unauthorized access.

![Lock Screen](assets/lock-account.png)

Click the lock icon in the top right corner. You'll need to enter your master key again to regain access.

---

## How It Works

### The File System

Altron creates a single file called `passwords.enc` in the folder you selected during setup. This file contains all your encrypted passwords.

![File Access Permission](assets/allow-file-access.png)

The file is saved automatically whenever you add or remove a password. You don't need to manually save or export anything.

### Encryption Explained Simply

When you save a password:

1. You enter your master key
2. Altron uses it to encrypt the password
3. The encrypted version is saved to `passwords.enc`
4. Your master key is not stored anywhere

When you retrieve a password:

1. You enter your master key
2. Altron uses it to decrypt `passwords.enc`
3. Your passwords become visible
4. Locking the app clears the master key from memory

![Encrypted Storage Diagram](assets/encrypted-passwords-local.png)

This means that without your master key, the file is just meaningless encrypted data. Even if someone copies the file, they cannot read your passwords.

---

## Use Cases

### Personal Use

**Managing Multiple Accounts**

Most people have dozens of online accounts across email, banking, social media, shopping, and entertainment services. Altron helps you:

- Generate a unique password for each account
- Store them in one secure location
- Find specific passwords quickly when logging in
- Avoid the risk of password reuse

**Privacy-Conscious Users**

If you prefer not to trust cloud services with your sensitive information, Altron offers:

- Complete data control
- No reliance on third-party servers
- Transparency through open source code
- Offline functionality

**Travel and Limited Connectivity**

When traveling or in areas with poor internet:

- Access passwords without internet
- Generate new passwords offline
- No sync delays or connection errors
- Full functionality anywhere

### Professional Use

**Developers and Technical Users**

Developers often manage API keys, database credentials, and test accounts. Altron provides:

- Secure storage for development credentials
- Organization through descriptive labels
- Quick access during coding sessions
- No risk of accidentally committing passwords to version control

**Small Teams on Shared Devices**

In small offices or shared workstation environments:

- Each person uses their own master key
- Individual encrypted files prevent cross-access
- Lock function protects passwords when stepping away
- No shared cloud account vulnerabilities

### Specific Scenarios

**Migrating from a Cloud Service**

If you're leaving a cloud password manager:

- Export your passwords from the old service (usually to CSV)
- Manually add them to Altron with appropriate labels
- Delete the export file securely
- Cancel your subscription

**Setting Up a New Device**

To move your passwords to a new computer:

- Copy the `passwords.enc` file to the new device
- Open Altron and select the folder containing the file
- Enter your master key
- All passwords are now accessible on the new device

**Backing Up Your Passwords**

To protect against device failure:

- Copy `passwords.enc` to an external drive or secure cloud storage
- The file remains encrypted and requires your master key
- Regular backups ensure you won't lose access
- Store backups in locations you control

---

## User Experience Details

### Design Philosophy

Altron's interface focuses on three goals:

1. **Clarity**: Every element serves a clear purpose
2. **Efficiency**: Common tasks require minimal steps
3. **Security Visibility**: You always know the security state

### Navigation Flow

The application follows a simple structure:

```
Lock Screen
    ↓
Dashboard
    ├── Create New (Password Generator)
    └── Passwords (List and Management)
```

All functions are accessible within two clicks from the dashboard.

### Visual Feedback

The interface provides immediate feedback for actions:

- Password strength updates as you adjust settings
- Search filters results in real-time
- Copy action shows brief confirmation
- Delete requires confirmation to prevent accidents
- Theme changes apply instantly

### Error Prevention

Altron helps prevent common mistakes:

- Confirmation dialogs before deleting passwords
- Visual indication when passwords are shown vs hidden
- Clear status of locked vs unlocked state
- Guidance text on the lock screen

### Accessibility Considerations

The design accommodates different user needs:

- High contrast ratios in all themes
- Readable font sizes
- Clickable areas sized for easy selection
- Keyboard navigation support
- Clear visual hierarchy

---

## Browser Requirements

Altron requires specific browser capabilities that are not universally available.

### Supported Browsers

**Fully Supported:**
- Google Chrome (version 86 and later)
- Microsoft Edge (version 86 and later)

**Not Currently Supported:**
- Mozilla Firefox
- Apple Safari
- Opera (limited support)

### Why These Limitations?

Altron uses the File System Access API, which allows direct access to files on your computer. This API is currently only implemented in Chrome and Edge.

Without this API, the app would need to use file upload/download dialogs for every save and load operation, significantly degrading the user experience.

### Checking Compatibility

When you open Altron in an unsupported browser, you'll see a message explaining the limitation and suggesting an alternative browser.

---

## Security Considerations

### What Altron Protects Against

**External Threats:**
- Remote server breaches (no server exists)
- Network interception (no data transmission)
- Cloud service compromises (no cloud storage)
- Third-party access (everything local)

**Data Safety:**
- Passwords encrypted at rest
- Master key never stored
- No recovery backdoors
- Open source for audit

### What Altron Cannot Protect Against

**Device-Level Threats:**
- Physical access to an unlocked device
- Keyloggers or screen recording malware
- Compromised operating system
- Browser vulnerabilities

**User Responsibility:**
- Forgetting your master key means permanent data loss
- Weak master keys reduce security
- Leaving the app unlocked creates risk
- Not backing up means potential data loss

### Best Practices

To maximize security while using Altron:

1. **Choose a strong master key**: Use a passphrase of at least 12 characters
2. **Lock when away**: Always lock before leaving your device
3. **Keep software updated**: Use the latest browser version
4. **Back up regularly**: Copy `passwords.enc` to secure storage
5. **Use trusted devices**: Only install on devices you control
6. **Never share your master key**: It's the only protection

---

## Frequently Asked Questions

**Can I sync passwords across devices?**

No. Altron is designed for single-device use. You can manually copy the encrypted file to other devices, but there is no automatic sync.

**What happens if I forget my master key?**

Your passwords cannot be recovered. This is intentional—any recovery mechanism would weaken security. Choose a master key you can remember.

**Can I export my passwords?**

Currently, you can only access passwords through the Altron interface. Export functionality is planned for a future update.

**Is my data backed up automatically?**

No. You are responsible for backing up the `passwords.enc` file. Since it's encrypted, you can store it wherever you keep important files.

**How do I uninstall Altron?**

Simply close the application and delete its files. Your `passwords.enc` file will remain wherever you chose to store it unless you delete it separately.

**Can I use Altron on mobile?**

Not currently. The File System Access API is not available on mobile browsers. A mobile version is being considered for future development.

**Is Altron as secure as commercial password managers?**

Altron uses the same encryption standard (AES-256) as commercial options. The main difference is that commercial managers offer additional features like sync, browser extensions, and breach monitoring.

---

## Limitations and Trade-offs

Altron makes specific trade-offs to maintain its privacy-first approach:

### What's Missing Compared to Cloud Services

**No Cross-Device Sync**: Your passwords are on one device only
**No Browser Auto-Fill**: You must copy and paste passwords manually
**No Mobile App**: Currently desktop-only
**No Password Sharing**: Cannot share passwords with others
**No Account Recovery**: Forgetting your master key means data loss
**No Breach Monitoring**: Does not check if passwords appear in known breaches

### Why These Limitations Exist

Each missing feature would require either:
- Sending data to external servers (violates privacy commitment)
- Creating account systems (adds attack surface)
- Implementing complex sync protocols (increases code complexity)

Altron prioritizes simplicity and privacy over feature completeness.

### Who Should Use Altron

Altron is well-suited for users who:
- Value privacy over convenience
- Primarily use one computer
- Are comfortable with manual processes
- Want full control of their data
- Prefer open source software
- Don't want subscription fees

### Who Should Consider Alternatives

You may prefer a cloud password manager if you:
- Need passwords on multiple devices
- Want automatic browser integration
- Require mobile access
- Share passwords with team members
- Want comprehensive support services
- Need breach monitoring

---

## Comparison with Other Solutions

### Altron vs. Cloud Password Managers

**Similarities:**
- Strong encryption (AES-256)
- Password generation
- Secure storage
- Master key protection

**Key Differences:**
- **Storage Location**: Altron keeps everything local; others use cloud servers
- **Cost**: Altron is free; others typically charge $3-10/month
- **Sync**: Others sync automatically; Altron requires manual file copying
- **Convenience**: Others offer browser extensions; Altron requires copy/paste
- **Trust Model**: Altron trusts your device security; others trust their infrastructure

### Altron vs. Browser Built-in Password Managers

**Altron Advantages:**
- Stronger encryption
- Not tied to browser vendor
- Open source code
- Works across different browsers
- More control over backup

**Browser Manager Advantages:**
- Automatic integration
- No separate application
- Easier to use
- Often includes sync
- Pre-installed

### Altron vs. Encrypted Text Files

Some users store passwords in encrypted text files or documents.

**Altron Advantages:**
- Purpose-built interface
- Password generation
- Search functionality
- Organized structure
- Better encryption implementation

**Encrypted File Advantages:**
- Works with any encryption tool
- Simpler concept
- More portable
- No specific software required

---

## Future Direction

Altron is actively developed with planned improvements based on user needs.

### Short-Term Plans (Next Few Months)

- Bug fixes for refresh issues
- Improved theme contrast and readability
- Keyboard shortcut support
- Password import from other managers
- Export functionality

### Medium-Term Plans (6-12 Months)

- Browser extension for auto-fill
- Password categories and folders
- Password strength analysis
- Breach detection integration
- Secure notes storage

### Long-Term Possibilities

These features are being considered but not confirmed:

- Mobile application
- Optional encrypted cloud backup
- Password sharing capabilities
- Multiple vault support
- Advanced security analytics

All future features will maintain the core commitment to local storage and user privacy.

---

## Getting Help

### Documentation

This document covers the essential product information. For technical details, see the full documentation included with the project.

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check existing issues on the project repository
2. Provide clear description and steps to reproduce
3. Include browser version and operating system
4. Note any error messages

### Community

Users can discuss Altron, share tips, and help each other through the project's discussion forums.

---

## License and Credits

Altron is open source software released under the MIT License. This means you can use, modify, and distribute it freely.

The project uses several open source technologies:
- Web Crypto API for encryption
- File System Access API for storage
- Tailwind CSS for styling
- Font Awesome for icons

All credit to the developers and maintainers of these projects.

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Product Version**: 1.0.0