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


