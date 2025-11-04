# Contributing to Altron

Thank you for your interest in contributing to Altron! 🎉

We welcome contributions from everyone. By participating in this project, you agree to abide by our code of conduct.

## 🚀 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Suggesting Features

We love new ideas! Create an issue with:
- Clear description of the feature
- Why it would be useful
- How it should work
- Any mockups or examples (optional)

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/altron.git
   cd altron
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Test your changes thoroughly

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve bug description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes clearly
   - Link any related issues

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat: add password strength indicator
fix: resolve CSS loading issue on dashboard
docs: update README with installation steps
style: improve button hover states
refactor: simplify encryption logic
chore: update dependencies
```

## 🎨 Code Style

### HTML
- Use semantic HTML5 elements
- Keep proper indentation (2 spaces)
- Add comments for complex sections

### CSS
- Use Tailwind utility classes when possible
- Keep custom CSS organized in theme files
- Use meaningful class names

### JavaScript
- Use `const` and `let`, avoid `var`
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🧪 Testing

Before submitting a PR:
- [ ] Test in Chrome/Edge (primary browsers)
- [ ] Test all password operations (generate, save, view, delete)
- [ ] Test theme switching
- [ ] Test responsive design on mobile
- [ ] Verify no console errors
- [ ] Test offline functionality

## 🔒 Security

- **Never commit sensitive data** (passwords, keys, etc.)
- Report security issues privately via GitHub Security tab
- Don't open public issues for security vulnerabilities

## 💡 Development Tips

### Local Development
```bash
# Simply open index.html in Chrome/Edge
# Or use a local server:
npx serve .
# or
python -m http.server 8000
```

### File Structure
```
altron/
├── index.html              # Landing page
├── dashboard/
│   └── index.html          # Main app
├── css/
│   ├── dashboard/
│   │   └── style.css       # Dashboard styles & themes
│   └── landing/
│       └── style.css       # Landing page styles
├── script/
│   ├── dashboard/
│   │   ├── config.js       # Configuration
│   │   └── script.js       # Main logic
│   └── landing/
│       └── script.js       # Landing scripts
└── icons/
    └── favicon.ico
```

## 🎯 Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

## 📞 Questions?

- Create a GitHub issue with the `question` label
- Check existing issues and discussions
- Read the [README](README.md) for basic info

## 🙏 Thank You!

Every contribution, no matter how small, helps make Altron better. We appreciate your time and effort!

---

**Happy Contributing! 🚀**