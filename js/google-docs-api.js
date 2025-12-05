/**
 * Google Docs API Wrapper
 * Gọi Google Apps Script Web App để upload files và tạo documents
 */

// ===============================================================
// === CONFIGURATION ===
// ===============================================================
// URL của Google Apps Script Web App sau khi deploy
// Cập nhật URL này sau khi deploy Google Apps Script
let GOOGLE_APPS_SCRIPT_URL = null; // Sẽ được set từ config

// Load config từ window hoặc từ file config
if (typeof window !== 'undefined' && window.GOOGLE_DOCS_CONFIG) {
    GOOGLE_APPS_SCRIPT_URL = window.GOOGLE_DOCS_CONFIG.url;
}

// ===============================================================
// === UPLOAD FILES TO GOOGLE DRIVE ===
// ===============================================================
/**
 * Upload files lên Google Drive
 * @param {FileList|Array<File>} files - Danh sách files từ input
 * @param {String} folderId - Folder ID để lưu (optional, dùng default)
 * @returns {Promise<{success: boolean, urls: Array}>}
 */
async function uploadFilesToGoogleDrive(files, folderId = null) {
    try {
        if (!GOOGLE_APPS_SCRIPT_URL) {
            return {
                success: false,
                message: 'Chưa cấu hình Google Apps Script URL. Vui lòng cập nhật trong js/google-docs-api.js'
            };
        }

        if (!files || files.length === 0) {
            return { success: true, urls: [] };
        }

        // Convert FileList to Array
        const fileArray = Array.from(files);
        
        // Convert files to base64
        const filePromises = fileArray.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    resolve({
                        name: file.name,
                        data: base64,
                        mimeType: file.type || 'application/octet-stream'
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const fileData = await Promise.all(filePromises);

        // Call Google Apps Script API
        // Use JSON for better compatibility with Google Apps Script
        // After deploying with correct settings (Anyone access), CORS should work
        
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'upload_files',
                    files: fileData,
                    folderId: folderId || null
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            // Log for debugging
            if (result.success) {
                console.log('✅ Upload successful:', result);
            } else {
                console.warn('⚠️ Upload returned error:', result);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error calling Google Apps Script:', error);
            
            // Check if it's a CORS error
            if (error.message && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
                return {
                    success: false,
                    message: 'Lỗi CORS: Không thể kết nối đến Google Apps Script từ domain này. ' +
                            'Vui lòng kiểm tra lại cấu hình deploy (Who has access: Anyone).',
                    corsError: true,
                    error: error.message
                };
            }
            
            return {
                success: false,
                message: 'Lỗi upload file: ' + error.message,
                error: error.message
            };
        }
    } catch (error) {
        console.error('Upload files error:', error);
        return {
            success: false,
            message: 'Lỗi upload file: ' + error.message
        };
    }
}

// ===============================================================
// === CREATE HỢP ĐỒNG MUA BÁN (HĐMB) ===
// ===============================================================
/**
 * Tạo Hợp đồng Mua Bán từ template
 * @param {Object} formData - Dữ liệu form
 * @returns {Promise<{success: boolean, fileUrl: string}>}
 */
async function createHDMB(formData) {
    try {
        if (!GOOGLE_APPS_SCRIPT_URL) {
            return {
                success: false,
                message: 'Chưa cấu hình Google Apps Script URL'
            };
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_hdmb',
                formData: formData
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Create HDMB error:', error);
        return {
            success: false,
            message: 'Lỗi tạo HĐMB: ' + error.message
        };
    }
}

// ===============================================================
// === CREATE THỎA THUẬN LÃI SUẤT ===
// ===============================================================
/**
 * Tạo Thỏa thuận lãi suất từ template
 * @param {Object} formData - Dữ liệu form
 * @returns {Promise<{success: boolean, docUrl: string, pdfUrl: string}>}
 */
async function createThoaThuan(formData) {
    try {
        if (!GOOGLE_APPS_SCRIPT_URL) {
            return {
                success: false,
                message: 'Chưa cấu hình Google Apps Script URL'
            };
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_thoa_thuan',
                formData: formData
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Create ThoaThuan error:', error);
        return {
            success: false,
            message: 'Lỗi tạo Thỏa thuận: ' + error.message
        };
    }
}

// ===============================================================
// === CREATE ĐỀ NGHỊ GIẢI NGÂN ===
// ===============================================================
/**
 * Tạo Đề nghị giải ngân từ template
 * @param {Object} formData - Dữ liệu form
 * @returns {Promise<{success: boolean, fileUrl: string}>}
 */
async function createDeNghiGiaiNgan(formData) {
    try {
        if (!GOOGLE_APPS_SCRIPT_URL) {
            return {
                success: false,
                message: 'Chưa cấu hình Google Apps Script URL'
            };
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_de_nghi_giai_ngan',
                formData: formData
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Create DeNghiGiaiNgan error:', error);
        return {
            success: false,
            message: 'Lỗi tạo Đề nghị giải ngân: ' + error.message
        };
    }
}

// ===============================================================
// === SET GOOGLE APPS SCRIPT URL ===
// ===============================================================
/**
 * Set Google Apps Script URL
 * @param {String} url - URL của Google Apps Script Web App
 */
function setGoogleAppsScriptURL(url) {
    GOOGLE_APPS_SCRIPT_URL = url;
    if (typeof window !== 'undefined') {
        window.GOOGLE_APPS_SCRIPT_URL = url;
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.googleDocsAPI = {
        uploadFiles: uploadFilesToGoogleDrive,
        createHDMB: createHDMB,
        createThoaThuan: createThoaThuan,
        createDeNghiGiaiNgan: createDeNghiGiaiNgan,
        setURL: setGoogleAppsScriptURL
    };
}

