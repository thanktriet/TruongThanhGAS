/**
 * Initialization Functions
 */
async function loadTPKDUsers() {
    try {
        const res = await callAPI({ action: 'get_users_by_role', role: 'TPKD' });
        if (res.success && res.users) {
            const select = $('approver_step0');
            if (select) {
                select.innerHTML = '<option value="">-- Chọn TPKD --</option>';
                res.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = `${user.fullname} (${user.username})${user.group ? ' - ' + user.group : ''}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading TPKD users:', error);
    }
}

function initContractLookup() {
    const searchInput = $('search_code_input');
    if (!searchInput) return;
    
    // Dùng JavaScript để gọi Supabase API thay vì htmx với Google Apps Script
    // Xóa hx-post attribute nếu có
    searchInput.removeAttribute('hx-post');
    
    // Handle lookup với Supabase API
    searchInput.addEventListener('blur', async () => {
        const searchCode = searchInput.value.trim().toUpperCase();
        if (!searchCode) return;
        
        try {
            // Gọi Supabase API thông qua callAPI
            if (typeof callAPI !== 'function') {
                console.error('callAPI function chưa được load');
                return;
            }
            
            const result = await callAPI({
                action: 'lookup_contract',
                search_code: searchCode
            });
            
            if (result.success && result.data) {
                // Fill form với data từ Supabase
                fillContractData(result.data);
                
                // Show action area
                const actionArea = $('action-area');
                if (actionArea) actionArea.classList.remove('hidden');
            } else {
                console.warn('Lookup contract result:', result);
                // Nếu không tìm thấy, vẫn show form để nhập thủ công
            }
        } catch (error) {
            console.error('Error looking up contract:', error);
        }
    });
}

// Helper function để fill contract data vào form
function fillContractData(data) {
    if ($('customer_name')) $('customer_name').value = data.name || '';
    if ($('phone')) $('phone').value = data.phone || '';
    if ($('cccd')) $('cccd').value = data.cccd || '';
    if ($('email')) $('email').value = data.email || '';
    if ($('address')) $('address').value = data.address || '';
    if ($('car_model')) $('car_model').value = data.carModel || '';
    if ($('car_version')) $('car_version').value = data.carVersion || '';
    if ($('car_color')) $('car_color').value = data.carColor || '';
    if ($('payment_method')) $('payment_method').value = data.payment || '';
}

// Note: Initialization is now handled in components.js after components are loaded
// This prevents accessing DOM elements before they exist

