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
        // Try multiple methods to avoid CORS issues
        
        // Method 1: Try FormData (works better with Google Apps Script for CORS)
        try {
            console.log('🔹 Trying FormData method...');
            const formData = new FormData();
            formData.append('action', 'upload_files');
            formData.append('files', JSON.stringify(fileData));
            if (folderId) {
                formData.append('folderId', folderId);
            }

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response: ' + responseText);
            }
            
            // Log for debugging
            if (result.success) {
                console.log('✅ Upload successful (FormData):', result);
            } else {
                console.warn('⚠️ Upload returned error (FormData):', result);
            }
            
            return result;
        } catch (formDataError) {
            console.warn('⚠️ FormData method failed, trying JSON with text/plain...', formDataError);
            
            // Method 2: Try JSON with text/plain Content-Type (avoids preflight)
            try {
                console.log('🔹 Trying JSON with text/plain method...');
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
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

                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error('Invalid JSON response: ' + responseText);
                }
                
                if (result.success) {
                    console.log('✅ Upload successful (text/plain):', result);
                } else {
                    console.warn('⚠️ Upload returned error (text/plain):', result);
                }
                
                return result;
            } catch (textPlainError) {
                console.warn('⚠️ text/plain method failed, trying JSON...', textPlainError);
                
                // Method 3: Try standard JSON
                try {
                    console.log('🔹 Trying standard JSON method...');
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
                    
                    if (result.success) {
                        console.log('✅ Upload successful (JSON):', result);
                    } else {
                        console.warn('⚠️ Upload returned error (JSON):', result);
                    }
                    
                    return result;
                } catch (jsonError) {
                    console.error('❌ All methods failed. Last error:', jsonError);
                    
                    // All methods failed - likely CORS issue
                    if (jsonError.message && (jsonError.message.includes('CORS') || jsonError.message.includes('Failed to fetch'))) {
                        return {
                            success: false,
                            message: 'Lỗi CORS: Không thể kết nối đến Google Apps Script từ domain này. ' +
                                    'Google Apps Script Web App có hạn chế về CORS. Vui lòng xem ALTERNATIVE_UPLOAD.md để tìm giải pháp thay thế.',
                            corsError: true,
                            error: jsonError.message
                        };
                    }
                    
                    throw jsonError;
                }
            }
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

        // Try multiple methods to avoid CORS issues
        // Method 1: Try FormData
        try {
            console.log('🔹 Trying FormData method for createHDMB...');
            const formDataObj = new FormData();
            formDataObj.append('action', 'create_hdmb');
            formDataObj.append('formData', JSON.stringify(formData));

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response: ' + responseText);
            }

            if (result.success) {
                console.log('✅ Create HDMB successful (FormData):', result);
            }
            return result;
        } catch (formDataError) {
            console.warn('⚠️ FormData method failed, trying text/plain...', formDataError);
            
            // Method 2: Try text/plain
            try {
                console.log('🔹 Trying text/plain method for createHDMB...');
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify({
                        action: 'create_hdmb',
                        formData: formData
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error('Invalid JSON response: ' + responseText);
                }

                if (result.success) {
                    console.log('✅ Create HDMB successful (text/plain):', result);
                }
                return result;
            } catch (textPlainError) {
                console.warn('⚠️ text/plain method failed, trying JSON...', textPlainError);
                
                // Method 3: Try standard JSON
                try {
                    console.log('🔹 Trying standard JSON method for createHDMB...');
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

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('✅ Create HDMB successful (JSON):', result);
                    }
                    return result;
                } catch (jsonError) {
                    console.error('❌ All methods failed for createHDMB:', jsonError);
                    
                    // Check if it's a CORS error
                    if (jsonError.message && (jsonError.message.includes('CORS') || jsonError.message.includes('Failed to fetch'))) {
                        return {
                            success: false,
                            message: 'Lỗi CORS: Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại cấu hình deploy.',
                            corsError: true,
                            error: jsonError.message
                        };
                    }
                    
                    throw jsonError;
                }
            }
        }
    } catch (error) {
        console.error('Create HDMB error:', error);
        return {
            success: false,
            message: 'Lỗi tạo HĐMB: ' + error.message,
            error: error.message
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

        // Try multiple methods to avoid CORS issues
        // Method 1: Try FormData
        try {
            console.log('🔹 Trying FormData method for createThoaThuan...');
            const formDataObj = new FormData();
            formDataObj.append('action', 'create_thoa_thuan');
            formDataObj.append('formData', JSON.stringify(formData));

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response: ' + responseText);
            }

            if (result.success) {
                console.log('✅ Create ThoaThuan successful (FormData):', result);
            }
            return result;
        } catch (formDataError) {
            console.warn('⚠️ FormData method failed, trying text/plain...', formDataError);
            
            // Method 2: Try text/plain
            try {
                console.log('🔹 Trying text/plain method for createThoaThuan...');
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify({
                        action: 'create_thoa_thuan',
                        formData: formData
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error('Invalid JSON response: ' + responseText);
                }

                if (result.success) {
                    console.log('✅ Create ThoaThuan successful (text/plain):', result);
                }
                return result;
            } catch (textPlainError) {
                console.warn('⚠️ text/plain method failed, trying JSON...', textPlainError);
                
                // Method 3: Try standard JSON
                try {
                    console.log('🔹 Trying standard JSON method for createThoaThuan...');
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

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('✅ Create ThoaThuan successful (JSON):', result);
                    }
                    return result;
                } catch (jsonError) {
                    console.error('❌ All methods failed for createThoaThuan:', jsonError);
                    
                    // Check if it's a CORS error
                    if (jsonError.message && (jsonError.message.includes('CORS') || jsonError.message.includes('Failed to fetch'))) {
                        return {
                            success: false,
                            message: 'Lỗi CORS: Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại cấu hình deploy.',
                            corsError: true,
                            error: jsonError.message
                        };
                    }
                    
                    throw jsonError;
                }
            }
        }
    } catch (error) {
        console.error('Create ThoaThuan error:', error);
        return {
            success: false,
            message: 'Lỗi tạo Thỏa thuận: ' + error.message,
            error: error.message
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

        // Try multiple methods to avoid CORS issues
        // Method 1: Try FormData
        try {
            console.log('🔹 Trying FormData method for createDeNghiGiaiNgan...');
            const formDataObj = new FormData();
            formDataObj.append('action', 'create_de_nghi_giai_ngan');
            formDataObj.append('formData', JSON.stringify(formData));

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response: ' + responseText);
            }

            if (result.success) {
                console.log('✅ Create DeNghiGiaiNgan successful (FormData):', result);
            }
            return result;
        } catch (formDataError) {
            console.warn('⚠️ FormData method failed, trying text/plain...', formDataError);
            
            // Method 2: Try text/plain
            try {
                console.log('🔹 Trying text/plain method for createDeNghiGiaiNgan...');
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify({
                        action: 'create_de_nghi_giai_ngan',
                        formData: formData
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error('Invalid JSON response: ' + responseText);
                }

                if (result.success) {
                    console.log('✅ Create DeNghiGiaiNgan successful (text/plain):', result);
                }
                return result;
            } catch (textPlainError) {
                console.warn('⚠️ text/plain method failed, trying JSON...', textPlainError);
                
                // Method 3: Try standard JSON
                try {
                    console.log('🔹 Trying standard JSON method for createDeNghiGiaiNgan...');
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

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('✅ Create DeNghiGiaiNgan successful (JSON):', result);
                    }
                    return result;
                } catch (jsonError) {
                    console.error('❌ All methods failed for createDeNghiGiaiNgan:', jsonError);
                    
                    // Check if it's a CORS error
                    if (jsonError.message && (jsonError.message.includes('CORS') || jsonError.message.includes('Failed to fetch'))) {
                        return {
                            success: false,
                            message: 'Lỗi CORS: Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại cấu hình deploy.',
                            corsError: true,
                            error: jsonError.message
                        };
                    }
                    
                    throw jsonError;
                }
            }
        }
    } catch (error) {
        console.error('Create DeNghiGiaiNgan error:', error);
        return {
            success: false,
            message: 'Lỗi tạo Đề nghị giải ngân: ' + error.message,
            error: error.message
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

