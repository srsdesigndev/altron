let masterKey = '';
let passwords = [];
let directoryHandle = null;
let filteredPasswords = [];

// Check for File System Access API support
const supportsFileSystemAccess = 'showDirectoryPicker' in window;

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    if (!supportsFileSystemAccess) {
        showStatus('⚠️ File System Access API not supported. Please use Chrome/Edge browser.', 'error');
    }
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeSelector = document.querySelector('select');
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }
});

// Theme functions
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Help modal functions
function openHelp() {
    document.getElementById('helpModal').classList.remove('hidden');
}

function closeHelp() {
    document.getElementById('helpModal').classList.add('hidden');
}

function closeHelpOnBackdrop(event) {
    if (event.target.id === 'helpModal') {
        closeHelp();
    }
}

// View password modal functions
let currentViewedPassword = '';

function viewPassword(id) {
    const pwd = passwords.find(p => p.id === id);
    if (!pwd) return;

    currentViewedPassword = pwd.password;
    
    document.getElementById('viewPasswordLabel').textContent = pwd.label;
    document.getElementById('viewPasswordText').textContent = '••••••••••••';
    document.getElementById('viewPasswordDate').textContent = new Date(pwd.createdAt).toLocaleString();
    
    // Reset toggle icon
    const icon = document.getElementById('toggleViewPasswordIcon');
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    
    document.getElementById('viewPasswordModal').classList.remove('hidden');
}

function closeViewPassword() {
    document.getElementById('viewPasswordModal').classList.add('hidden');
    currentViewedPassword = '';
}

function closeViewPasswordOnBackdrop(event) {
    if (event.target.id === 'viewPasswordModal') {
        closeViewPassword();
    }
}

function toggleViewPasswordVisibility() {
    const textEl = document.getElementById('viewPasswordText');
    const icon = document.getElementById('toggleViewPasswordIcon');
    
    if (textEl.textContent === '••••••••••••') {
        textEl.textContent = currentViewedPassword;
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        textEl.textContent = '••••••••••••';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function copyViewedPassword() {
    navigator.clipboard.writeText(currentViewedPassword).then(() => {
        showStatus('Password copied to clipboard', 'success');
        setTimeout(() => hideStatus(), 1500);
    });
}

// Loading functions
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Toggle master key visibility
function toggleMasterKeyVisibility() {
    const input = document.getElementById('masterKeyInput');
    const icon = document.getElementById('toggleMasterKeyIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toggle save password visibility
function toggleSavePasswordVisibility() {
    const input = document.getElementById('passwordToSave');
    const icon = document.getElementById('toggleSavePasswordIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('tab-active'));
    event.target.closest('.tab-btn').classList.add('tab-active');

    // Update tab content
    document.getElementById('createTab').classList.add('hidden');
    document.getElementById('passwordsTab').classList.add('hidden');

    if (tabName === 'create') {
        document.getElementById('createTab').classList.remove('hidden');
    } else {
        document.getElementById('passwordsTab').classList.remove('hidden');
    }
}

// Select directory for storage
async function selectDirectory() {
    if (!supportsFileSystemAccess) {
        showStatus('File System Access API not supported in this browser', 'error');
        return;
    }

    try {
        showLoading();
        directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });
        
        document.getElementById('selectedPath').textContent = `✓ ${directoryHandle.name}`;
        showStatus('Storage folder selected successfully', 'success');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        if (error.name !== 'AbortError') {
            showStatus('Error selecting folder: ' + error.message, 'error');
        }
    } finally {
        hideLoading();
    }
}

// Unlock app
async function unlockApp() {
    const input = document.getElementById('masterKeyInput').value;
    
    if (!input) {
        showStatus('Please enter a master key', 'error');
        return;
    }

    if (!directoryHandle) {
        showStatus('Please select a storage folder first', 'error');
        return;
    }

    showLoading();
    masterKey = input;
    
    try {
        await loadPasswords();
        
        document.getElementById('lockScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('navbar').classList.remove('hidden');
        document.getElementById('footer').classList.remove('hidden');
        
        showStatus('Unlocked successfully', 'success');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Lock app
function lockApp() {
    masterKey = '';
    passwords = [];
    filteredPasswords = [];
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('lockScreen').classList.remove('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
    document.getElementById('masterKeyInput').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('savePasswordCard').classList.add('hidden');
    document.getElementById('generatedPasswordSection').classList.add('hidden');
    
    const input = document.getElementById('masterKeyInput');
    const icon = document.getElementById('toggleMasterKeyIcon');
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    
    showStatus('App locked', 'info');
    setTimeout(() => hideStatus(), 2000);
}

// Generate password
function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const useUppercase = document.getElementById('useUppercase').checked;
    const useLowercase = document.getElementById('useLowercase').checked;
    const useNumbers = document.getElementById('useNumbers').checked;
    const useSymbols = document.getElementById('useSymbols').checked;

    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        showStatus('Please select at least one character type', 'error');
        setTimeout(() => hideStatus(), 2000);
        return;
    }

    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    const crypto = window.crypto || window.msCrypto;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }

    document.getElementById('generatedPassword').textContent = password;
    document.getElementById('passwordToSave').value = password;
    document.getElementById('generatedPasswordSection').classList.remove('hidden');
    document.getElementById('savePasswordCard').classList.remove('hidden');
    
    calculateStrength(password);
}

// Calculate password strength
function calculateStrength(password) {
    let strength = 0;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 10;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    let color, text;
    if (strength < 40) {
        color = '#ff3b30';
        text = 'Weak';
    } else if (strength < 70) {
        color = '#ff9500';
        text = 'Medium';
    } else {
        color = '#34c759';
        text = 'Strong';
    }

    strengthBar.style.width = strength + '%';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

// Copy to clipboard
function copyToClipboard() {
    const password = document.getElementById('generatedPassword').textContent;
    navigator.clipboard.writeText(password).then(() => {
        showStatus('Copied to clipboard', 'success');
        setTimeout(() => hideStatus(), 1500);
    });
}

// Encrypt data
async function encrypt(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(masterKey.padEnd(32, '0').slice(0, 32));
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
}

// Decrypt data
async function decrypt(encryptedData) {
    try {
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(masterKey.padEnd(32, '0').slice(0, 32));
        
        const key = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const encryptedBuffer = combined.slice(12);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        throw new Error('Decryption failed - wrong master key?');
    }
}

// Save password
async function savePassword() {
    const label = document.getElementById('passwordLabel').value.trim();
    const password = document.getElementById('passwordToSave').value.trim();
    const confirmed = document.getElementById('confirmUsed').checked;

    if (!label || !password) {
        showStatus('Label and password are required', 'error');
        setTimeout(() => hideStatus(), 2000);
        return;
    }

    if (!confirmed) {
        showStatus('Please confirm you will use this password', 'error');
        setTimeout(() => hideStatus(), 2000);
        return;
    }

    showLoading();

    try {
        const passwordEntry = {
            id: Date.now(),
            label,
            password,
            createdAt: new Date().toISOString()
        };

        passwords.push(passwordEntry);
        await savePasswords();
        renderPasswordList();

        document.getElementById('passwordLabel').value = '';
        document.getElementById('passwordToSave').value = '';
        document.getElementById('confirmUsed').checked = false;
        document.getElementById('generatedPasswordSection').classList.add('hidden');
        document.getElementById('savePasswordCard').classList.add('hidden');

        // Reset password field to hidden
        const savePasswordInput = document.getElementById('passwordToSave');
        const savePasswordIcon = document.getElementById('toggleSavePasswordIcon');
        savePasswordInput.type = 'password';
        savePasswordIcon.classList.remove('fa-eye-slash');
        savePasswordIcon.classList.add('fa-eye');

        // Switch to passwords tab
        const passwordsTab = document.querySelectorAll('.tab-btn')[1];
        passwordsTab.click();

        showStatus('Password saved successfully', 'success');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        showStatus('Error saving password: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Save passwords to file
async function savePasswords() {
    if (!directoryHandle) return;

    try {
        const encryptedData = await encrypt(JSON.stringify(passwords));
        const fileHandle = await directoryHandle.getFileHandle('passwords.enc', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encryptedData);
        await writable.close();
    } catch (error) {
        showStatus('Error saving passwords: ' + error.message, 'error');
    }
}

// Load passwords from file
async function loadPasswords() {
    if (!directoryHandle) return;

    try {
        const fileHandle = await directoryHandle.getFileHandle('passwords.enc');
        const file = await fileHandle.getFile();
        const encryptedData = await file.text();
        
        if (encryptedData) {
            const decryptedData = await decrypt(encryptedData);
            passwords = JSON.parse(decryptedData);
            filteredPasswords = passwords;
            renderPasswordList();
        }
    } catch (error) {
        if (error.name !== 'NotFoundError') {
            console.error('Error loading passwords:', error);
        }
    }
}

// Filter passwords
function filterPasswords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredPasswords = passwords;
    } else {
        filteredPasswords = passwords.filter(pwd => 
            pwd.label.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPasswordList();
}

// Render password list
function renderPasswordList() {
    const list = document.getElementById('passwordList');
    const emptyMessage = document.getElementById('emptyMessage');
    const searchBox = document.getElementById('searchBox');
    const passwordCount = document.getElementById('passwordCount');

    passwordCount.textContent = `(${passwords.length})`;

    if (passwords.length === 0) {
        list.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        searchBox.classList.add('hidden');
        return;
    }

    searchBox.classList.remove('hidden');
    
    if (filteredPasswords.length === 0) {
        list.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        emptyMessage.querySelector('p').textContent = 'No passwords match your search';
        return;
    }

    emptyMessage.classList.add('hidden');
    list.innerHTML = filteredPasswords.map(pwd => `
        <li class="bg-tertiary border border-custom rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition">
            <div class="flex-1">
                <div class="font-semibold text-primary mb-1">${escapeHtml(pwd.label)}</div>
                <div class="text-sm text-secondary flex items-center gap-2">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(pwd.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="viewPassword(${pwd.id})" class="px-3 py-2 bg-secondary border border-custom rounded-lg hover:bg-tertiary transition" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="copyPasswordToClipboard(${pwd.id})" class="px-3 py-2 bg-secondary border border-custom rounded-lg hover:bg-tertiary transition" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="deletePassword(${pwd.id})" class="px-3 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// Copy password to clipboard
function copyPasswordToClipboard(id) {
    const pwd = passwords.find(p => p.id === id);
    if (!pwd) return;

    navigator.clipboard.writeText(pwd.password).then(() => {
        showStatus('Password copied to clipboard', 'success');
        setTimeout(() => hideStatus(), 1500);
    });
}

// Delete password
async function deletePassword(id) {
    if (!confirm('Delete this password?')) return;

    showLoading();

    try {
        passwords = passwords.filter(p => p.id !== id);
        filteredPasswords = filteredPasswords.filter(p => p.id !== id);
        await savePasswords();
        renderPasswordList();
        showStatus('Password deleted', 'info');
        setTimeout(() => hideStatus(), 1500);
    } catch (error) {
        showStatus('Error deleting password: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Show/hide status
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    
    // Reset classes
    statusEl.className = 'mb-5 px-4 py-3 rounded-lg border-l-4';
    
    if (type === 'success') {
        statusEl.classList.add('bg-green-50', 'text-green-700', 'border-green-500');
    } else if (type === 'error') {
        statusEl.classList.add('bg-red-50', 'text-red-700', 'border-red-500');
    } else if (type === 'info') {
        statusEl.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-500');
    }
}

function hideStatus() {
    const statusEl = document.getElementById('statusMessage');
    statusEl.classList.add('hidden');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}