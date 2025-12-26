/**
 * API Caller - 100% Supabase với fallback cho lookup_contract
 */

// Helper function cho fallback Google Apps Script (chỉ dùng cho lookup_contract)
async function callGoogleAppsScriptAPI(data) {
    try {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== null && value !== undefined) {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });
        
        const res = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            body: formData
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }
        
        const responseText = await res.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('Invalid JSON response from server');
        }
        
        return result;
    } catch (e) {
        console.error('Google Apps Script API fallback error:', e);
        return { 
            success: false, 
            message: e.message || 'Lỗi kết nối đến Google Apps Script' 
        };
    }
}

/**
 * API Caller - 100% Supabase (với fallback cho lookup_contract)
 */
async function callAPI(data) {
    try {
        console.log('[callAPI] Called with action:', data.action, 'data keys:', Object.keys(data));
        
        // Kiểm tra và đợi Supabase API sẵn sàng (với retry)
        if (!window.supabaseAPI || !window.supabaseAPI.callAPI) {
            console.warn('[callAPI] window.supabaseAPI chưa sẵn sàng, đang đợi...');
            // Đợi tối đa 2 giây để Supabase API load
            let retries = 0;
            const maxRetries = 20; // 20 * 100ms = 2 giây
            while (retries < maxRetries && (!window.supabaseAPI || !window.supabaseAPI.callAPI)) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            if (!window.supabaseAPI || !window.supabaseAPI.callAPI) {
                console.error('[callAPI] Supabase API chưa được khởi tạo sau', maxRetries * 100, 'ms');
                console.error('[callAPI] window.supabaseAPI:', window.supabaseAPI);
                console.error('[callAPI] window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
                console.error('[callAPI] window.supabase:', typeof window.supabase);
                return { 
                    success: false, 
                    message: 'Supabase chưa được khởi tạo. Vui lòng reload trang.' 
                };
            }
        }
        
        console.log('[callAPI] Using Supabase API, calling window.supabaseAPI.callAPI...');
        try {
            const result = await window.supabaseAPI.callAPI(data);
            console.log('[callAPI] Got result from supabaseAPI.callAPI:', {
                success: result?.success,
                hasData: !!result?.data,
                message: result?.message,
                resultType: typeof result,
                resultKeys: result ? Object.keys(result) : []
            });
            
            // Nếu lookup_contract cần fallback về Google Apps Script
            if (data.action === 'lookup_contract' && result && result.fallback) {
                return await callGoogleAppsScriptAPI(data);
            }
            
            return result;
        } catch (callError) {
            console.error('[callAPI] Error calling window.supabaseAPI.callAPI:', callError);
            throw callError;
        }
    } catch (e) {
        console.error('[callAPI] API call error:', e);
        return { 
            success: false, 
            message: e.message || 'Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.' 
        };
    }
}

// Export callAPI ra window để có thể dùng từ bất kỳ đâu
if (typeof window !== 'undefined') {
    window.callAPI = callAPI;
    console.log('✅ window.callAPI đã được expose');
} else {
    console.error('❌ window is undefined, không thể expose callAPI');
}
