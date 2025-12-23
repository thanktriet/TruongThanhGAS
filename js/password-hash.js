/**
 * Password Hashing Utilities
 * Migrated from MD5 to PBKDF2 for better security
 * 
 * PBKDF2 (Password-Based Key Derivation Function 2) is much stronger than MD5:
 * - Uses SHA-256 as the underlying hash function
 * - Supports salt (random for each password)
 * - Supports iteration count (100,000 iterations by default)
 * - Resistant to rainbow table attacks
 */

/**
 * Hash password using PBKDF2 (new, secure method)
 * @param {string} password - Plain text password
 * @param {string} salt - Optional salt (if not provided, will generate a new one)
 * @returns {Promise<string>} - Hashed password in format: salt:iterations:hash
 */
async function hashPasswordPBKDF2(password, salt = null) {
    try {
        // Convert password to ArrayBuffer
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);

        // Generate salt if not provided (16 bytes = 128 bits)
        let saltArray;
        if (salt) {
            // If salt is provided as hex string, convert to ArrayBuffer
            saltArray = hexToArrayBuffer(salt);
        } else {
            saltArray = crypto.getRandomValues(new Uint8Array(16));
        }

        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derive key using PBKDF2
        // Parameters: SHA-256, 100,000 iterations, 256 bits (32 bytes)
        const iterations = 100000;
        const hashLength = 256; // bits

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltArray,
                iterations: iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            hashLength
        );

        // Convert to hex string
        const hashHex = arrayBufferToHex(derivedBits);
        const saltHex = arrayBufferToHex(saltArray);

        // Return format: salt:iterations:hash (all in hex)
        return `${saltHex}:${iterations}:${hashHex}`;
    } catch (error) {
        console.error('PBKDF2 hashing error:', error);
        throw error;
    }
}

/**
 * Verify password against PBKDF2 hash
 * @param {string} password - Plain text password to verify
 * @param {string} hashString - Hashed password in format: salt:iterations:hash
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPasswordPBKDF2(password, hashString) {
    try {
        // Parse hash string: salt:iterations:hash
        const parts = hashString.split(':');
        if (parts.length !== 3) {
            console.error('Invalid PBKDF2 hash format');
            return false;
        }

        const [saltHex, iterationsStr, hashHex] = parts;
        const iterations = parseInt(iterationsStr, 10);

        if (isNaN(iterations) || iterations <= 0) {
            console.error('Invalid iterations in hash');
            return false;
        }

        // Hash the password with the same salt and iterations
        const testHash = await hashPasswordPBKDF2(password, saltHex);

        // Compare hashes (constant-time comparison to prevent timing attacks)
        return constantTimeEquals(testHash, hashString);
    } catch (error) {
        console.error('PBKDF2 verification error:', error);
        return false;
    }
}

/**
 * Hash password using MD5 (legacy, for backward compatibility)
 * @param {string} str - Plain text password
 * @returns {string} - MD5 hash (hex string)
 */
function hashPasswordMD5(str) {
    if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.MD5(String(str)).toString();
    }
    // Fallback nếu không có crypto-js (không nên xảy ra trong production)
    console.warn('CryptoJS not loaded, using simple hash (INSECURE)');
    return btoa(str).split('').reverse().join('');
}

/**
 * Verify password - supports both MD5 (legacy) and PBKDF2 (new)
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored hash from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, storedHash) {
    if (!password || !storedHash) {
        return false;
    }

    // Check if it's PBKDF2 format (contains colons: salt:iterations:hash)
    if (storedHash.includes(':')) {
        return await verifyPasswordPBKDF2(password, storedHash);
    }

    // Otherwise, assume it's MD5 (legacy)
    const md5Hash = hashPasswordMD5(password);
    return constantTimeEquals(md5Hash, storedHash);
}

/**
 * Hash password - creates PBKDF2 hash (new secure method)
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - PBKDF2 hash
 */
async function hashPassword(password) {
    return await hashPasswordPBKDF2(password);
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - True if strings are equal
 */
function constantTimeEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer|Uint8Array} buffer - Buffer to convert
 * @returns {string} - Hex string
 */
function arrayBufferToHex(buffer) {
    const array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Convert hex string to ArrayBuffer
 * @param {string} hex - Hex string
 * @returns {ArrayBuffer} - ArrayBuffer
 */
function hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
}

// Export functions to window for use in other scripts
if (typeof window !== 'undefined') {
    window.hashPassword = hashPassword;
    window.hashPasswordPBKDF2 = hashPasswordPBKDF2;
    window.hashPasswordMD5 = hashPasswordMD5;
    window.verifyPassword = verifyPassword;
    window.verifyPasswordPBKDF2 = verifyPasswordPBKDF2;
}

