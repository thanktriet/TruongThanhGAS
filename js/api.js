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
        console.log('Calling API:', data.action, data);
        
        // Sử dụng Supabase API - 100% migration
        if (window.supabaseAPI && window.supabaseAPI.callAPI) {
            console.log('Using Supabase API');
            const result = await window.supabaseAPI.callAPI(data);
            
            // Nếu lookup_contract cần fallback về Google Apps Script
            if (data.action === 'lookup_contract' && result.fallback) {
                console.log('lookup_contract: Falling back to Google Apps Script');
                return await callGoogleAppsScriptAPI(data);
            }
            
            return result;
        }
        
        // Nếu Supabase chưa sẵn sàng, báo lỗi
        console.error('Supabase API chưa được khởi tạo');
        return { 
            success: false, 
            message: 'Supabase chưa được khởi tạo. Vui lòng reload trang.' 
        };
    } catch (e) {
        console.error('API call error:', e);
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
