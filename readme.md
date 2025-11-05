## What is Altron?

Altron is a password manager that keeps your passwords on your computer instead of in the cloud. It's free, works offline, and doesn't require an account.

![Altron Landing Page](assets/landing-hero.png)


**Your Passwords, 100% Local & Secure**

A free, open-source password manager that prioritizes privacy and security by storing everything locally on your device. No cloud sync, no servers, no tracking—just pure, military-grade encryption.

## ✨ Why Altron?

- 🔒 **100% Local Storage** - Your passwords never leave your device
- 🔐 **AES-256-GCM Encryption** - Military-grade security standard
- 👁️ **Zero Knowledge Architecture** - We can't access your data even if we wanted to
- 🚀 **No Installation Required** - Runs directly in your browser
- 🎨 **6 Beautiful Themes** - Light, Dark, VS Code, Monokai, Solarized, and Neon
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔌 **Works Offline** - No internet connection needed
- 💰 **Free Forever** - No subscriptions, no premium features, no hidden costs

## 🎯 Key Features

### Security First
- **AES-256-GCM Encryption**: The same encryption standard used by banks and governments
- **Zero-Knowledge**: Your master key stays on your device—never transmitted anywhere
- **Local-Only Storage**: All data stored on your computer using File System Access API
- **No Telemetry**: Zero tracking, zero analytics, zero data collection

### Powerful Password Generation
- Generate cryptographically secure passwords up to 64 characters
- Customize character sets (uppercase, lowercase, numbers, symbols)
- Real-time password strength meter
- One-click copy to clipboard

### Seamless Experience
- **Quick Search**: Find passwords instantly with real-time filtering
- **Multiple Themes**: Choose from 6 professionally designed color schemes
- **Responsive UI**: Beautiful interface that works on any screen size
- **Intuitive Dashboard**: Clean, modern design for effortless password management

## 🚀 Getting Started

### Prerequisites
- Chrome or Edge browser (requires File System Access API)
- No installation or sign-up required!

### Quick Start

1. **Open Altron** in your browser
2. **Choose Storage** - Select a secure folder on your computer
3. **Set Master Key** - Create a strong passphrase (remember it well!)
4. **Start Managing** - Generate and store passwords securely

> ⚠️ **Important**: Your master key cannot be recovered if forgotten. This is by design to ensure maximum security.

## 🎨 Theme Showcase

Choose from 6 beautiful themes to match your style:
- 🌞 Light - Clean and bright
- 🌙 Dark - Easy on the eyes
- 💻 VS Code - Developer favorite
- 🎨 Monokai - Vibrant and colorful
- ☀️ Solarized - Carefully designed color palette
- 🌈 Neon - Bold and electric

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6.4.0
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Storage**: File System Access API

## 📖 How It Works

Altron uses browser-native Web Crypto API for encryption and File System Access API for local storage:

1. **Master Key Derivation**: Your master key is used to derive encryption keys
2. **AES-256-GCM Encryption**: Each password is encrypted individually
3. **Local File Storage**: Encrypted data is saved directly to your chosen folder
4. **No Network Requests**: Everything happens client-side in your browser

## 🔐 Security Model

### What We Protect
- ✅ All passwords encrypted with AES-256-GCM before storage
- ✅ Master key stored only in browser memory during active session
- ✅ No plaintext password storage at any time
- ✅ No network transmission of sensitive data
- ✅ Zero data collection or telemetry

### Your Responsibility
- 🔑 Remember your master key (cannot be recovered)
- 💾 Backup your encrypted password files regularly
- 🔒 Use a strong, unique master key
- 💻 Secure physical access to your device

## 🆚 Why Choose Altron Over Cloud Password Managers?

| Feature | Altron | Cloud Password Managers |
|---------|--------|------------------------|
| Privacy | 100% Local | Requires Trust |
| Cost | Free Forever | $3-10/month |
| Offline Access | Full Functionality | Limited |
| Data Location | Your Device Only | Remote Servers |
| Open Source | ✅ Yes | Usually No |
| Setup | Zero Setup | Account Required |

## 📋 Browser Support

- ✅ Chrome (recommended)
- ✅ Edge (recommended)
- ⚠️ Firefox (limited - no File System Access API)
- ⚠️ Safari (limited - no File System Access API)

## 🤝 Contributing

Contributions are welcome! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🎨 Theme designs
- 💻 Code contributions

## 📜 License

MIT License - Free to use, modify, and distribute.

## ⚠️ Disclaimer

Altron is designed for personal use. While we use industry-standard encryption, you are responsible for:
- Choosing a strong master key
- Backing up your encrypted files
- Securing your device
- Understanding the risks of local-only storage

## 🌟 Star This Project

If you find Altron useful, please consider starring this repository! It helps others discover this privacy-focused password manager.

## 📧 Support

- 📖 Check the [FAQ](https://github.com/srsdesigndev/altron#faq) for common questions
- 🐛 Report bugs via [GitHub Issues](https://github.com/srsdesigndev/altron/issues)
- 💬 Discussions and feature requests welcome!

---

**Built with ❤️ for privacy-conscious users**

*Remember: With great privacy comes great responsibility. Your master key is your only way to access your passwords—choose wisely and never forget it.*