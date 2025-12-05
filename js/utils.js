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

function getSession() {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) return null;
    try {
        return JSON.parse(sessionStr);
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
    if (!el) return;
    let val = el.value.replace(/\D/g, '');
    el.value = val ? Number(val).toLocaleString('vi-VN') : '';
    
    const containerId = el.closest('#mode-search-container') 
        ? 'gift-list-search' 
        : 'gift-list-manual';
    calcGiftTotal(containerId);
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



