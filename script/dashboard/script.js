// ============================================
// GLOBAL STATE
// ============================================
let masterKey = '';
let passwords = [];
let directoryHandle = null;
let filteredPasswords = [];
let isStorageLocked = false;
let currentSession = null;
let userName = '';

// ============================================
// CONSTANTS
// ============================================
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MASTER_KEY_FILE = 'master.key';
const PASSWORDS_FILE = 'passwords.enc';
const SESSION_KEY = 'altron_session';
const DIRECTORY_HANDLE_KEY = 'altron_directory_handle';

// ============================================
// BROWSER COMPATIBILITY CHECK
// ============================================
const supportsFileSystemAccess = 'showDirectoryPicker' in window;

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    if (!supportsFileSystemAccess) {
        showStatus('⚠️ File System Access API not supported. Please use Chrome/Edge browser.', 'error');
        return;
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeSelector = document.querySelector('select[onchange="changeTheme(this.value)"]');
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }

    // Check if valid session exists
    if (isSessionValid()) {
        const session = getSession();
        userName = session.userName;
        
        // Try to restore directory handle from IndexedDB
        const restored = await restoreDirectoryHandle();
        
        if (restored) {
            // Auto-login with valid session
            try {
                await loadPasswords();
                showDashboard();
                updateHeaderUsername();
                showStatus('Welcome back, ' + userName + '!', 'success');
                setTimeout(() => hideStatus(), 2000);
            } catch (error) {
                // If loading fails, show lock screen
                showLockScreen();
            }
        } else {
            // Session exists but no directory handle - show lock screen
            showLockScreen();
        }
    } else {
        // No valid session - show onboarding
        showOnboarding();
    }
    
    // Run session check every minute
    setInterval(checkSessionExpiry, 60000);
});

// ============================================
// DIRECTORY HANDLE PERSISTENCE (IndexedDB)
// ============================================

/**
 * Save directory handle to IndexedDB
 */
async function saveDirectoryHandle() {
    if (!directoryHandle) return;
    
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readwrite');
        const store = tx.objectStore('handles');
        await store.put({ id: 'directory', handle: directoryHandle });
        await tx.complete;
    } catch (error) {
        console.error('Error saving directory handle:', error);
    }
}

/**
 * Restore directory handle from IndexedDB
 */
async function restoreDirectoryHandle() {
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const result = await store.get('directory');
        
        if (result && result.handle) {
            directoryHandle = result.handle;
            
            // Verify permission
            const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                directoryHandle = null;
                return false;
            }
            
            isStorageLocked = true;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error restoring directory handle:', error);
        return false;
    }
}

/**
 * Open IndexedDB
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AltronDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('handles')) {
                db.createObjectStore('handles', { keyPath: 'id' });
            }
        };
    });
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Show onboarding modal
 */
function showOnboarding() {
    document.getElementById('onboardingModal').classList.remove('hidden');
    document.getElementById('lockScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
}

/**
 * Show lock screen
 */
function showLockScreen() {
    document.getElementById('lockScreen').classList.remove('hidden');
    document.getElementById('onboardingModal').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
}

/**
 * Show dashboard
 */
function showDashboard() {
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('onboardingModal').classList.add('hidden');
    document.getElementById('lockScreen').classList.add('hidden');
}

// ============================================
// ONBOARDING FLOW
// ============================================

/**
 * Start onboarding process
 */
function startOnboarding() {
    document.getElementById('onboardingWelcome').classList.add('hidden');
    document.getElementById('onboardingName').classList.remove('hidden');
}

/**
 * Continue from name collection to folder selection
 */
function continueFromName() {
    const nameInput = document.getElementById('userNameInput').value.trim();
    const btn = event.target;
    
    if (!nameInput) {
        showStatus('Please enter your name', 'error');
        return;
    }
    
    // Add loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Continue...';
    
    setTimeout(() => {
        userName = nameInput;
        
        document.getElementById('onboardingName').classList.add('hidden');
        document.getElementById('onboardingFolder').classList.remove('hidden');
        
        document.getElementById('folderGreeting').textContent = `Great, ${userName}! Now let's set up your storage.`;
        
        btn.disabled = false;
        btn.innerHTML = 'Continue';
    }, 500);
}

/**
 * Select storage folder from onboarding
 */
async function selectFolderOnboarding() {
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
        
        document.getElementById('selectedFolderPath').innerHTML = `
            <div class="flex items-center justify-center gap-2 text-success font-semibold">
                <i class="fas fa-check-circle"></i>
                <span>Selected: ${directoryHandle.name}</span>
            </div>
        `;
        document.getElementById('continueToMasterKeyBtn').disabled = false;
        
        hideLoading();
    } catch (error) {
        hideLoading();
        if (error.name !== 'AbortError') {
            showStatus('Error selecting folder: ' + error.message, 'error');
        }
    }
}

/**
 * Continue to master key setup
 */
async function continueToMasterKey() {
    if (!directoryHandle) {
        showStatus('Please select a storage folder first', 'error');
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
    
    showLoading();
    
    try {
        const hasMasterKey = await masterKeyFileExists();
        
        if (hasMasterKey) {
            document.getElementById('onboardingModal').classList.add('hidden');
            showLockScreen();
            showStatus('This folder already has a master key. Please enter it to unlock.', 'info');
        } else {
            document.getElementById('onboardingFolder').classList.add('hidden');
            document.getElementById('masterKeyExplanationModal').classList.remove('hidden');
        }
    } catch (error) {
        showStatus('Error checking folder: ' + error.message, 'error');
    } finally {
        hideLoading();
        btn.disabled = false;
        btn.innerHTML = 'Continue';
    }
}

/**
 * Show master key creation form
 */
function showMasterKeyCreation() {
    document.getElementById('masterKeyExplanationModal').classList.add('hidden');
    document.getElementById('masterKeyCreationModal').classList.remove('hidden');
}

/**
 * Create master key from onboarding
 */
async function createMasterKey() {
    const newMasterKey = document.getElementById('newMasterKeyInput').value;
    const confirmMasterKey = document.getElementById('confirmMasterKeyInput').value;
    const btn = event.target;
    
    if (!newMasterKey || !confirmMasterKey) {
        showStatus('Please fill in both fields', 'error');
        return;
    }
    
    if (newMasterKey !== confirmMasterKey) {
        showStatus('Master keys do not match', 'error');
        return;
    }
    
    if (newMasterKey.length < 8) {
        showStatus('Master key must be at least 8 characters', 'error');
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating...';
    showLoading();
    
    try {
        masterKey = newMasterKey;
        
        await createMasterKeyFile(newMasterKey, userName);
        
        createSession(userName, directoryHandle.name);
        
        await saveDirectoryHandle();
        
        isStorageLocked = true;
        
        document.getElementById('onboardingModal').classList.add('hidden');
        showDashboard();
        updateHeaderUsername();
        
        await loadPasswords();
        
        showStatus('Welcome to Altron, ' + userName + '! Your master key has been created.', 'success');
        setTimeout(() => hideStatus(), 3000);
        
    } catch (error) {
        showStatus('Error creating master key: ' + error.message, 'error');
    } finally {
        hideLoading();
        btn.disabled = false;
        btn.innerHTML = 'Create Master Key & Continue';
    }
}

/**
 * Update header with username
 */
function updateHeaderUsername() {
    const session = getSession();
    if (session && session.userName) {
        document.getElementById('headerUsername').textContent = session.userName;
        document.getElementById('userSection').classList.remove('hidden');
    }
}

/**
 * Close onboarding (for returning users)
 */
function closeOnboarding() {
    document.getElementById('onboardingModal').classList.add('hidden');
    showLockScreen();
}

// ============================================
// CRYPTOGRAPHY - PBKDF2 HASHING
// ============================================

function generateSalt() {
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    return Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashMasterKey(masterKey, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(masterKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const saltBuffer = new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );

    return Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function verifyMasterKey(inputKey, storedHash, salt) {
    const inputHash = await hashMasterKey(inputKey, salt);
    return inputHash === storedHash;
}

// ============================================
// MASTER KEY FILE MANAGEMENT
// ============================================

async function masterKeyFileExists() {
    if (!directoryHandle) return false;
    
    try {
        await directoryHandle.getFileHandle(MASTER_KEY_FILE);
        return true;
    } catch (error) {
        return false;
    }
}

async function createMasterKeyFile(masterKey, userName) {
    if (!directoryHandle) throw new Error('No storage folder selected');

    try {
        const salt = generateSalt();
        const hash = await hashMasterKey(masterKey, salt);
        
        const masterKeyData = {
            hash: hash,
            salt: salt,
            userName: userName,
            createdAt: new Date().toISOString()
        };

        const fileHandle = await directoryHandle.getFileHandle(MASTER_KEY_FILE, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(masterKeyData, null, 2));
        await writable.close();

        return true;
    } catch (error) {
        console.error('Error creating master key file:', error);
        throw new Error('Failed to create master key file');
    }
}

async function loadMasterKeyFile() {
    if (!directoryHandle) throw new Error('No storage folder selected');

    try {
        const fileHandle = await directoryHandle.getFileHandle(MASTER_KEY_FILE);
        const file = await fileHandle.getFile();
        const content = await file.text();
        return JSON.parse(content);
    } catch (error) {
        console.error('Error loading master key file:', error);
        throw new Error('Failed to load master key file');
    }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

function createSession(userName, folderName) {
    const session = {
        sessionId: crypto.randomUUID(),
        userName: userName,
        folderName: folderName,
        sessionExpiry: Date.now() + SESSION_DURATION,
        isAuthenticated: true,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    currentSession = session;
    return session;
}

function getSession() {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        currentSession = session;
        return session;
    } catch (error) {
        console.error('Error reading session:', error);
        return null;
    }
}

function isSessionValid() {
    const session = getSession();
    
    if (!session) return false;
    if (!session.isAuthenticated) return false;
    if (Date.now() > session.sessionExpiry) return false;
    
    return true;
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    currentSession = null;
}

async function clearDirectoryHandle() {
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readwrite');
        const store = tx.objectStore('handles');
        await store.delete('directory');
        await tx.complete;
    } catch (error) {
        console.error('Error clearing directory handle:', error);
    }
}

function checkSessionExpiry() {
    const session = getSession();
    
    if (session && Date.now() > session.sessionExpiry) {
        lockApp();
        showStatus('Session expired after 7 days. Please log in again.', 'info');
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// ============================================
// MODAL MANAGEMENT
// ============================================

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

let currentViewedPassword = '';

function viewPassword(id) {
    const pwd = passwords.find(p => p.id === id);
    if (!pwd) return;

    currentViewedPassword = pwd.password;
    
    document.getElementById('viewPasswordLabel').textContent = pwd.label;
    document.getElementById('viewPasswordText').textContent = '••••••••••••';
    document.getElementById('viewPasswordDate').textContent = new Date(pwd.createdAt).toLocaleString();
    
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

// ============================================
// LOADING OVERLAY
// ============================================
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================
// PASSWORD VISIBILITY TOGGLES
// ============================================
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

function toggleNewMasterKeyVisibility() {
    const input = document.getElementById('newMasterKeyInput');
    const icon = document.getElementById('toggleNewMasterKeyIcon');
    
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

function toggleConfirmMasterKeyVisibility() {
    const input = document.getElementById('confirmMasterKeyInput');
    const icon = document.getElementById('toggleConfirmMasterKeyIcon');
    
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

// ============================================
// TAB MANAGEMENT
// ============================================
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('tab-active');
    });
    
    if (tabName === 'create') {
        tabs[0].classList.add('tab-active');
    } else if (tabName === 'passwords') {
        tabs[1].classList.add('tab-active');
    }

    document.getElementById('createTab').classList.add('hidden');
    document.getElementById('passwordsTab').classList.add('hidden');

    if (tabName === 'create') {
        document.getElementById('createTab').classList.remove('hidden');
    } else if (tabName === 'passwords') {
        document.getElementById('passwordsTab').classList.remove('hidden');
    }
}

// ============================================
// STORAGE FOLDER SELECTION (Lock Screen)
// ============================================
async function selectDirectory() {
    if (!supportsFileSystemAccess) {
        showStatus('File System Access API not supported in this browser', 'error');
        return;
    }

    if (isStorageLocked) {
        showStatus('Storage folder is locked for this session. Click "Lock" to change folders.', 'info');
        return;
    }

    try {
        showLoading();
        directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });
        
        document.getElementById('selectedPath').textContent = `✓ ${directoryHandle.name}`;
        
        const hasMasterKey = await masterKeyFileExists();
        
        if (hasMasterKey) {
            showStatus('Storage folder selected. Enter your master key to unlock.', 'success');
        } else {
            showStatus('New folder detected. This folder has no master key. Please go through onboarding first.', 'error');
            directoryHandle = null;
            document.getElementById('selectedPath').textContent = '';
        }
        
        setTimeout(() => hideStatus(), 3000);
    } catch (error) {
        if (error.name !== 'AbortError') {
            showStatus('Error selecting folder: ' + error.message, 'error');
        }
    } finally {
        hideLoading();
    }
}

// ============================================
// UNLOCK APP (Lock Screen)
// ============================================
async function unlockApp() {
    const input = document.getElementById('masterKeyInput').value;
    const btn = event.target;
    
    if (!input) {
        showStatus('Please enter a master key', 'error');
        return;
    }

    if (!directoryHandle) {
        showStatus('Please select a storage folder first', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Unlocking...';
    showLoading();
    
    try {
        const hasMasterKey = await masterKeyFileExists();
        
        if (!hasMasterKey) {
            showStatus('This folder has no master key. Please go through onboarding first.', 'error');
            hideLoading();
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Unlock';
            return;
        }
        
        const masterKeyData = await loadMasterKeyFile();
        const isValid = await verifyMasterKey(input, masterKeyData.hash, masterKeyData.salt);
        
        if (!isValid) {
            showStatus('Incorrect master key. Please try again.', 'error');
            hideLoading();
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock"></i> Unlock';
            return;
        }
        
        masterKey = input;
        userName = masterKeyData.userName;
        
        createSession(masterKeyData.userName, directoryHandle.name);
        
        await saveDirectoryHandle();
        
        await loadPasswords();
        
        isStorageLocked = true;
        
        showDashboard();
        updateHeaderUsername();
        
        showStatus('Welcome back, ' + userName + '!', 'success');
        setTimeout(() => hideStatus(), 2000);
        
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-unlock"></i> Unlock';
    }
}

// ============================================
// LOCK APP (LOGOUT)
// ============================================
async function lockApp() {
    clearSession();
    await clearDirectoryHandle();
    
    masterKey = '';
    passwords = [];
    filteredPasswords = [];
    directoryHandle = null;
    isStorageLocked = false;
    userName = '';
    
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
    document.getElementById('masterKeyInput').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('savePasswordCard').classList.add('hidden');
    document.getElementById('generatedPasswordSection').classList.add('hidden');
    document.getElementById('selectedPath').textContent = '';
    
    showOnboarding();
    
    showStatus('Logged out successfully', 'info');
    setTimeout(() => hideStatus(), 2000);
}

// ============================================
// PASSWORD GENERATION
// ============================================
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

function copyToClipboard() {
    const password = document.getElementById('generatedPassword').textContent;
    navigator.clipboard.writeText(password).then(() => {
        showStatus('Copied to clipboard', 'success');
        setTimeout(() => hideStatus(), 1500);
    });
}

// ============================================
// ENCRYPTION / DECRYPTION
// ============================================
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

// ============================================
// PASSWORD STORAGE
// ============================================
async function savePassword() {
    const label = document.getElementById('passwordLabel').value.trim();
    const password = document.getElementById('passwordToSave').value.trim();
    const confirmed = document.getElementById('confirmUsed').checked;
    const btn = event.target;

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

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
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
        
        filteredPasswords = passwords;
        document.getElementById('searchInput').value = '';
        renderPasswordList();

        document.getElementById('passwordLabel').value = '';
        document.getElementById('passwordToSave').value = '';
        document.getElementById('confirmUsed').checked = false;
        document.getElementById('generatedPasswordSection').classList.add('hidden');
        document.getElementById('savePasswordCard').classList.add('hidden');

        const savePasswordInput = document.getElementById('passwordToSave');
        const savePasswordIcon = document.getElementById('toggleSavePasswordIcon');
        savePasswordInput.type = 'password';
        savePasswordIcon.classList.remove('fa-eye-slash');
        savePasswordIcon.classList.add('fa-eye');

        switchTab('passwords');

        showStatus('Password saved successfully', 'success');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        showStatus('Error saving password: ' + error.message, 'error');
    } finally {
        hideLoading();
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Save';
    }
}

async function savePasswords() {
    if (!directoryHandle) return;

    try {
        const encryptedData = await encrypt(JSON.stringify(passwords));
        const fileHandle = await directoryHandle.getFileHandle(PASSWORDS_FILE, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(encryptedData);
        await writable.close();
    } catch (error) {
        showStatus('Error saving passwords: ' + error.message, 'error');
    }
}

async function loadPasswords() {
    if (!directoryHandle) return;

    try {
        const fileHandle = await directoryHandle.getFileHandle(PASSWORDS_FILE);
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

// ============================================
// PASSWORD LIST MANAGEMENT (TILE VIEW)
// ============================================

function getInitials(label) {
    const words = label.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return label.substring(0, 2).toUpperCase();
}

function getAvatarColor(label) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
    ];
    
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

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

function renderPasswordList() {
    const grid = document.getElementById('passwordGrid');
    const emptyState = document.getElementById('emptyState');
    const searchBox = document.getElementById('searchBox');
    const passwordCount = document.getElementById('passwordCount');

    passwordCount.textContent = `(${passwords.length})`;

    if (passwords.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        searchBox.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    searchBox.classList.remove('hidden');
    
    if (filteredPasswords.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-secondary">No passwords match your search</div>';
        return;
    }

    grid.innerHTML = filteredPasswords.map(pwd => {
        const initials = getInitials(pwd.label);
        const bgColor = getAvatarColor(pwd.label);
        
        return `
            <div class="password-tile bg-secondary border border-custom rounded-xl p-4 hover:shadow-lg transition">
                <div class="flex items-start gap-3 mb-3">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" 
                         style="background-color: ${bgColor}">
                        ${initials}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-primary truncate">${escapeHtml(pwd.label)}</h3>
                        <p class="text-xs text-secondary mt-1">
                            <i class="fas fa-calendar mr-1"></i>
                            ${new Date(pwd.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <button onclick="viewPassword(${pwd.id})" 
                            class="flex-1 px-3 py-2 bg-tertiary border border-custom rounded-lg hover:bg-primary transition text-sm"
                            title="View">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    <button onclick="copyPasswordToClipboard(${pwd.id})" 
                            class="px-3 py-2 bg-tertiary border border-custom rounded-lg hover:bg-primary transition"
                            title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="deletePassword(${pwd.id})" 
                            class="px-3 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition"
                            title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function copyPasswordToClipboard(id) {
    const pwd = passwords.find(p => p.id === id);
    if (!pwd) return;

    navigator.clipboard.writeText(pwd.password).then(() => {
        showStatus('Password copied to clipboard', 'success');
        setTimeout(() => hideStatus(), 1500);
    });
}

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

async function deleteAllPasswords() {
    if (!confirm('⚠️ Delete ALL passwords? This action cannot be undone!')) return;
    
    if (!confirm('Are you absolutely sure? This will permanently delete all ' + passwords.length + ' passwords.')) return;
    
    showLoading();
    
    try {
        passwords = [];
        filteredPasswords = [];
        await savePasswords();
        renderPasswordList();
        showStatus('All passwords deleted', 'info');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        showStatus('Error deleting passwords: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================
// STATUS MESSAGES
// ============================================
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    
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

// ============================================
// UTILITIES
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showCreatePasswordForm() {
    switchTab('create');
}