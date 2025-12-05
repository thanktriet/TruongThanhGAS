/**
 * Supabase Storage API
 * Upload files trực tiếp lên Supabase Storage (tránh CORS với Google Apps Script)
 */

// ===============================================================
// === UPLOAD FILES TO SUPABASE STORAGE ===
// ===============================================================
/**
 * Upload files lên Supabase Storage
 * @param {FileList|Array<File>} files - Danh sách files từ input
 * @param {String} bucketName - Tên bucket (default: 'order-files')
 * @param {String} folder - Folder path trong bucket (default: 'cccd')
 * @returns {Promise<{success: boolean, urls: Array}>}
 */
async function uploadFilesToSupabaseStorage(files, bucketName = 'order-files', folder = 'cccd') {
    try {
        const supabase = window.supabaseClient || (window.initSupabase && window.initSupabase());
        
        if (!supabase) {
            return {
                success: false,
                message: 'Supabase client chưa được khởi tạo. Vui lòng kiểm tra cấu hình.'
            };
        }

        if (!files || files.length === 0) {
            return { success: true, urls: [] };
        }

        const fileArray = Array.from(files);
        const uploadedFiles = [];

        console.log(`📤 Uploading ${fileArray.length} file(s) to Supabase Storage...`);

        for (const file of fileArray) {
            try {
                // Generate unique file name
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                const fileExt = file.name.split('.').pop();
                const fileName = `${folder}/${timestamp}_${randomStr}.${fileExt}`;
                const filePath = `${bucketName}/${fileName}`;

                console.log(`Uploading: ${file.name} → ${fileName}`);

                // Upload file
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error(`❌ Upload error for ${file.name}:`, error);
                    
                    // Check if file already exists
                    if (error.message && error.message.includes('already exists')) {
                        // Try with different name
                        const newFileName = `${folder}/${timestamp}_${randomStr}_${Math.random().toString(36).substring(2, 5)}.${fileExt}`;
                        const retryResult = await supabase.storage
                            .from(bucketName)
                            .upload(newFileName, file, {
                                cacheControl: '3600',
                                upsert: false
                            });
                        
                        if (retryResult.error) {
                            console.error(`❌ Retry upload also failed:`, retryResult.error);
                            continue;
                        }
                        
                        // Get public URL for retried file
                        const { data: urlData } = supabase.storage
                            .from(bucketName)
                            .getPublicUrl(newFileName);
                        
                        uploadedFiles.push({
                            name: file.name,
                            url: urlData.publicUrl,
                            path: newFileName
                        });
                    } else {
                        // Other error - skip this file
                        continue;
                    }
                } else {
                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(fileName);

                    uploadedFiles.push({
                        name: file.name,
                        url: urlData.publicUrl,
                        path: fileName
                    });
                    
                    console.log(`✅ Uploaded: ${file.name} → ${urlData.publicUrl}`);
                }
            } catch (fileError) {
                console.error(`❌ Error uploading file ${file.name}:`, fileError);
                // Continue with next file
                continue;
            }
        }

        if (uploadedFiles.length === 0) {
            return {
                success: false,
                message: 'Không thể upload bất kỳ file nào. Vui lòng kiểm tra lại.'
            };
        }

        return {
            success: true,
            urls: uploadedFiles,
            message: `Đã upload ${uploadedFiles.length}/${fileArray.length} file thành công`
        };
    } catch (error) {
        console.error('Upload to Supabase Storage error:', error);
        return {
            success: false,
            message: 'Lỗi upload file: ' + error.message
        };
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.supabaseStorageAPI = {
        uploadFiles: uploadFilesToSupabaseStorage
    };
}

