/**
 * Utility Functions
 */
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

let cachedUsers = [];
let approvalData = [];
let approvalFilters = { search: '', status: 'all' };
let myRequestsData = [];
let myRequestsFilters = { search: '', status: 'all' };

// Session timeout: 8 giờ (8 * 60 * 60 * 1000 ms)
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 giờ

function getSession() {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) return null;
    try {
        const user = JSON.parse(sessionStr);
        
        // Kiểm tra session timeout
        if (user.login_time) {
            const loginTime = new Date(user.login_time).getTime();
            const now = Date.now();
            const elapsed = now - loginTime;
            
            if (elapsed > SESSION_TIMEOUT_MS) {
                // Session đã hết hạn
                console.log('Session expired. Elapsed:', Math.floor(elapsed / 1000 / 60), 'minutes');
                localStorage.removeItem('user_session');
                return null;
            }
        } else {
            // Nếu không có login_time, thêm vào để tương thích với session cũ
            user.login_time = new Date().toISOString();
            localStorage.setItem('user_session', JSON.stringify(user));
        }
        
        return user;
    } catch (e) {
        console.error('Invalid session data', e);
        localStorage.removeItem('user_session');
        return null;
    }
}

function logout() {
    localStorage.removeItem('user_session');
    location.reload();
}

function formatMoneyInput(el) {
    if (!el) {
        console.warn('[formatMoneyInput] Element is null or undefined');
        return;
    }
    
    try {
        // Lấy giá trị hiện tại, loại bỏ tất cả ký tự không phải số (bao gồm dấu chấm)
        let val = el.value.replace(/\D/g, '');
        // Format lại với dấu chấm phân cách hàng nghìn
        el.value = val ? Number(val).toLocaleString('vi-VN') : '';
        console.log('[formatMoneyInput] Formatted value:', el.value, 'from raw:', val);
        
        // Chỉ tính tổng quà tặng nếu đây là input giá quà tặng (có class gift-price)
        if (el.classList && el.classList.contains('gift-price')) {
            const containerId = el.closest('#mode-search-container') 
                ? 'gift-list-search' 
                : 'gift-list-manual';
            // Kiểm tra xem function calcGiftTotal có tồn tại không trước khi gọi
            if (typeof calcGiftTotal === 'function') {
                calcGiftTotal(containerId);
            } else if (typeof window.calcGiftTotal === 'function') {
                window.calcGiftTotal(containerId);
            }
        }
    } catch (error) {
        console.error('[formatMoneyInput] Error:', error);
    }
}

// Export formatMoneyInput to window for use in components
if (typeof window !== 'undefined') {
    window.formatMoneyInput = formatMoneyInput;
    
    // Đảm bảo function có thể được gọi từ inline event handlers
    // Thêm vào global scope để đảm bảo tương thích
    if (typeof globalThis !== 'undefined') {
        globalThis.formatMoneyInput = formatMoneyInput;
    }
}

/**
 * Show toast notification
 * Wrapper for SweetAlert2 to maintain consistency
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'danger', 'info'
 */
function showToast(message, type = 'success') {
    if (typeof Swal === 'undefined') {
        // Fallback to console if SweetAlert2 is not loaded
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }
    
    // Map type to SweetAlert2 icon and title
    const typeMap = {
        'success': { icon: 'success', title: 'Thành công' },
        'error': { icon: 'error', title: 'Lỗi' },
        'danger': { icon: 'error', title: 'Lỗi' },
        'warning': { icon: 'warning', title: 'Cảnh báo' },
        'info': { icon: 'info', title: 'Thông tin' }
    };
    
    const config = typeMap[type] || typeMap['success'];
    
    Swal.fire({
        icon: config.icon,
        title: config.title,
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}

// Export showToast to window for use in components
if (typeof window !== 'undefined') {
    window.showToast = showToast;
}



