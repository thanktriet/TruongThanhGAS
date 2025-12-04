/**
 * Google Docs API Configuration
 * Cấu hình URL của Google Apps Script Web App
 */

// Cập nhật URL này sau khi deploy Google Apps Script
const GOOGLE_DOCS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAyNjxqIFTX0w0c5Fg-vg01WYBQ2ieqfZnIyRKbVFCXZ0aIg0Nh5TgMvvPerHU9-nO/exec";

// Export config
if (typeof window !== 'undefined') {
    window.GOOGLE_DOCS_CONFIG = {
        url: GOOGLE_DOCS_SCRIPT_URL
    };
    
    // Set URL trong google-docs-api.js
    if (typeof setGoogleAppsScriptURL === 'function') {
        setGoogleAppsScriptURL(GOOGLE_DOCS_SCRIPT_URL);
    }
}

