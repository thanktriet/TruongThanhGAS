/**
 * API Caller
 */
async function callAPI(data) {
    try {
        console.log('Calling API:', data.action, data);
        
        // Sử dụng FormData để tránh CORS preflight request
        // Google Apps Script Web App xử lý FormData tốt hơn JSON và không trigger preflight
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== null && value !== undefined) {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });
        
        const res = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors', // Giữ cors mode
            body: formData
            // Không set Content-Type header để browser tự set với boundary cho FormData
            // Điều này giúp tránh preflight request
        });
        
        console.log('API Response status:', res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }
        
        const responseText = await res.text();
        console.log('API Response text:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Response:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        console.log('API Result:', result);
        return result;
    } catch (e) {
        console.error('API call error:', e);
        return { 
            success: false, 
            message: e.message || 'Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.' 
        };
    }
}

