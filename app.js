/**
 * Hệ Thống Phê Duyệt Giá Xe - Main Application Script
 * Optimized version
 */

// ===================================
// CONFIGURATION
// ===================================
const API_URL = "https://script.google.com/macros/s/AKfycbwTyybDq0fVwdJz0IdCM-t1uLc3EKhclv58q9ey9kiKtUd4NMvpDR-ptWbH2b34bwkR/exec";

// ===================================
// UTILITY FUNCTIONS
// ===================================
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    addGiftRow('gift-list-manual');
    initContractLookup();
});

// ===================================
// CONTRACT LOOKUP INITIALIZATION
// ===================================
function initContractLookup() {
    const searchInput = $('search_code_input');
    if (!searchInput) return;
    
    // Set hx-post URL
    searchInput.setAttribute('hx-post', API_URL);
    
    // Process with htmx if available
    if (typeof htmx !== 'undefined') {
        htmx.process(searchInput);
        
        // Override htmx request to send JSON with search_code (backend expects search_code)
        searchInput.addEventListener('htmx:configRequest', (event) => {
            const searchCode = searchInput.value.trim().toUpperCase();
            if (!searchCode) {
                event.preventDefault();
                return;
            }
            
            // Override to send JSON instead of form data
            event.detail.headers['Content-Type'] = 'application/json';
            // Clear parameters and set body as JSON string
            event.detail.parameters = {};
            const requestBody = {
                action: 'lookup_contract',
                search_code: searchCode  // Backend expects 'search_code', not 'contract_code'
            };
            event.detail.body = JSON.stringify(requestBody);
            
            console.log('Sending lookup request:', requestBody);
        });
        
        // Handle response for debugging
        searchInput.addEventListener('htmx:afterRequest', (event) => {
            console.log('Response status:', event.detail.xhr.status);
            if (event.detail.xhr.status === 200) {
                try {
                    const response = JSON.parse(event.detail.xhr.responseText);
                    console.log('Response data:', response);
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            }
        });
        
        // Handle successful response after swap
        searchInput.addEventListener('htmx:afterSwap', (event) => {
            // Wait a bit for DOM to update
            setTimeout(() => {
                const actionArea = $('action-area');
                if (actionArea) actionArea.classList.remove('hidden');
                
                // Store contract_code in the hidden field
                const contractCode = searchInput.value.trim().toUpperCase();
                const hiddenContractCode = $('lookup-contract-code') || 
                                          document.querySelector('#form-create-request input[name="contract_code"]');
                
                if (hiddenContractCode) {
                    hiddenContractCode.value = contractCode;
                } else {
                    // Create hidden field if not exists
                    const form = $('form-create-request');
                    if (form) {
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'contract_code';
                        hiddenInput.id = 'lookup-contract-code';
                        hiddenInput.value = contractCode;
                        form.appendChild(hiddenInput);
                    }
                }
                
                // Initialize gift row if template rendered successfully
                if (typeof addGiftRow === 'function') {
                    const giftList = $('gift-list-search');
                    if (giftList && giftList.children.length === 0) {
                        addGiftRow('gift-list-search');
                    }
                }
            }, 100);
        });
    }
}

// ===================================
// AUTHENTICATION
// ===================================
function checkSession() {
    const session = localStorage.getItem('user_session');
    const login = $('login-view');
    const dash = $('dashboard-view');
    
    if (session) {
        try {
            const user = JSON.parse(session);
            $('user-fullname').textContent = user.fullname || 'User';
            $('user-role').textContent = user.role || 'ROLE';
            
            const navApproval = $('nav-approval');
            if (user.role === 'SALE' || user.role === 'TVBH') {
                navApproval?.classList.add('hidden');
            } else {
                switchTab('approval');
            }
            
            login?.classList.add('hidden');
            dash?.classList.remove('hidden');
            dash?.classList.add('flex');
        } catch (e) {
            console.error('Error parsing session:', e);
            localStorage.removeItem('user_session');
            showLogin();
        }
    } else {
        showLogin();
    }
}

function showLogin() {
    const login = $('login-view');
    const dash = $('dashboard-view');
    login?.classList.remove('hidden');
    dash?.classList.add('hidden');
    dash?.classList.remove('flex');
}

async function handleLogin(e) {
    e.preventDefault();
    const username = $('login-user')?.value;
    const password = $('login-pass')?.value;
    
    if (!username || !password) {
        Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    try {
        const res = await callAPI({ action: 'login', username, password });
        if (res.success && res.user) {
            localStorage.setItem('user_session', JSON.stringify(res.user));
            location.reload();
        } else {
            Swal.fire('Lỗi', res.message || 'Đăng nhập thất bại', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
    }
}

function logout() {
    localStorage.removeItem('user_session');
    location.reload();
}

// ===================================
// NAVIGATION
// ===================================
function switchTab(id) {
    $$('.tab-content').forEach(el => el.classList.remove('active'));
    $$('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tab = $(`tab-${id}`);
    const nav = $(`nav-${id}`);
    
    if (tab) tab.classList.add('active');
    if (nav) nav.classList.add('active');
    
    if (id === 'approval') loadApprovalList();
}

function toggleCreateMode(mode) {
    const search = $('mode-search-container');
    const manual = $('mode-manual-container');
    const btnS = $('btn-mode-search');
    const btnM = $('btn-mode-manual');
    
    const isSearch = mode === 'search';
    
    if (isSearch) {
        search?.classList.remove('hidden');
        manual?.classList.add('hidden');
        btnS?.classList.add('bg-blue-600', 'text-white', 'shadow');
        btnS?.classList.remove('text-gray-600');
        btnM?.classList.remove('bg-blue-600', 'text-white', 'shadow');
        btnM?.classList.add('text-gray-600');
    } else {
        manual?.classList.remove('hidden');
        search?.classList.add('hidden');
        btnM?.classList.add('bg-blue-600', 'text-white', 'shadow');
        btnM?.classList.remove('text-gray-600');
        btnS?.classList.remove('bg-blue-600', 'text-white', 'shadow');
        btnS?.classList.add('text-gray-600');
    }
}

// ===================================
// MONEY & GIFT LOGIC
// ===================================
function formatMoneyInput(el) {
    if (!el) return;
    let val = el.value.replace(/\D/g, '');
    el.value = val ? Number(val).toLocaleString('vi-VN') : '';
    
    const containerId = el.closest('#mode-search-container') 
        ? 'gift-list-search' 
        : 'gift-list-manual';
    calcGiftTotal(containerId);
}

function addGiftRow(containerId) {
    const container = $(containerId);
    if (!container) return;
    
    const rowId = `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const html = `
        <div class="flex gap-2 mb-2 gift-row" id="${rowId}">
            <input class="gift-name flex-1 border p-1.5 rounded text-sm outline-none focus:border-blue-500" 
                   placeholder="Tên quà">
            <input class="gift-price w-28 border p-1.5 rounded text-sm text-right outline-none focus:border-blue-500" 
                   placeholder="0" 
                   oninput="formatMoneyInput(this)">
            <button type="button" 
                    onclick="removeGiftRow('${rowId}','${containerId}')" 
                    class="text-red-400 hover:text-red-600 px-1">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function removeGiftRow(rowId, containerId) {
    const row = $(rowId);
    if (row) {
        row.remove();
        calcGiftTotal(containerId);
    }
}

function calcGiftTotal(containerId) {
    const container = $(containerId);
    if (!container) return;
    
    let total = 0;
    container.querySelectorAll('.gift-price').forEach(el => {
        const val = parseInt(el.value.replace(/\./g, '')) || 0;
        total += val;
    });
    
    const displayId = containerId === 'gift-list-search' 
        ? 'total-gift-search' 
        : 'total-gift-manual';
    const displayEl = $(displayId);
    if (displayEl) {
        displayEl.textContent = total.toLocaleString('vi-VN');
    }
}

function packGiftData(containerId, hiddenInputId) {
    const container = $(containerId);
    const hiddenInput = $(hiddenInputId);
    if (!container || !hiddenInput) return;
    
    const gifts = [];
    container.querySelectorAll('.gift-row').forEach(row => {
        const nameInput = row.querySelector('.gift-name');
        const priceInput = row.querySelector('.gift-price');
        const name = nameInput?.value.trim();
        
        if (name) {
            gifts.push({
                name,
                price: priceInput?.value || '0'
            });
        }
    });
    
    hiddenInput.value = JSON.stringify(gifts);
}

// ===================================
// FORM SUBMISSION
// ===================================
async function handleSubmitRequest(e, mode) {
    e.preventDefault();
    
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    let session;
    try {
        session = JSON.parse(sessionStr);
    } catch (e) {
        Swal.fire('Lỗi', 'Dữ liệu phiên không hợp lệ', 'error');
        logout();
        return;
    }
    
    const formId = mode === 'search' ? 'form-create-request' : 'form-manual-create';
    const giftContainer = mode === 'search' ? 'gift-list-search' : 'gift-list-manual';
    const hiddenInput = mode === 'search' ? 'hidden_gift_json_search' : 'hidden_gift_json_manual';
    
    packGiftData(giftContainer, hiddenInput);
    
    const form = $(formId);
    if (!form) {
        Swal.fire('Lỗi', 'Không tìm thấy form', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const payload = {
        action: "submit_request",
        requester: session.username,
        ...Object.fromEntries(formData.entries())
    };
    
    if (mode === 'search') {
        const contractCode = $('search_code_input')?.value;
        if (contractCode) payload.contract_code = contractCode;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    
    const orgHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';
    btn.disabled = true;
    
    try {
        const res = await callAPI(payload);
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã gửi thành công', 'success');
            form.reset();
            
            const giftContainerEl = $(giftContainer);
            if (giftContainerEl) {
                giftContainerEl.innerHTML = '';
                addGiftRow(giftContainer);
            }
            
            const totalEl = $(mode === 'search' ? 'total-gift-search' : 'total-gift-manual');
            if (totalEl) totalEl.textContent = '0';
            
            if (mode === 'search') {
                const searchResult = $('search-result');
                const searchInput = $('search_code_input');
                const actionArea = $('action-area');
                
                if (searchResult) {
                    searchResult.innerHTML = '<div class="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50"><p>Đã gửi xong.</p></div>';
                }
                if (searchInput) searchInput.value = '';
                if (actionArea) actionArea.classList.add('hidden');
            }
        } else {
            Swal.fire('Lỗi', res.message || 'Gửi thất bại', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
    } finally {
        btn.innerHTML = orgHtml;
        btn.disabled = false;
    }
}

// ===================================
// APPROVAL
// ===================================
async function loadApprovalList() {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) return;
    
    let session;
    try {
        session = JSON.parse(sessionStr);
    } catch (e) {
        console.error('Error parsing session:', e);
        return;
    }
    
    const container = $('approval-list-container');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i></div>';
    
    try {
        const res = await callAPI({
            action: 'get_pending_list',
            username: session.username,
            role: session.role
        });
        
        if (res.success && res.data) {
            const tpl = $('tpl-pending-list')?.innerHTML;
            if (tpl && typeof Mustache !== 'undefined') {
                container.innerHTML = Mustache.render(tpl, { data: res.data });
            } else {
                container.innerHTML = '<p class="text-red-500 text-center">Lỗi render template</p>';
            }
        } else {
            container.innerHTML = '<p class="text-red-500 text-center">' + (res.message || 'Lỗi tải dữ liệu') + '</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center">Lỗi kết nối</p>';
    }
}

// ===================================
// MODAL
// ===================================
function openDetail(jsonStr) {
    try {
        const data = JSON.parse(decodeURIComponent(jsonStr));
        const tpl = $('tpl-order-detail')?.innerHTML;
        const modalBody = $('modal-detail-body');
        const modal = $('modal-detail');
        
        if (!tpl || !modalBody || !modal) return;
        
        if (typeof Mustache !== 'undefined') {
            modalBody.innerHTML = Mustache.render(tpl, data);
        } else {
            modalBody.innerHTML = '<p>Lỗi: Mustache không được tải</p>';
        }
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            const modalContent = $('modal-content');
            if (modalContent) {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }
        }, 10);
    } catch (e) {
        console.error('Error opening detail:', e);
        Swal.fire('Lỗi', 'Không thể mở chi tiết', 'error');
    }
}

function closeModal() {
    const modal = $('modal-detail');
    const modalContent = $('modal-content');
    
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    
    setTimeout(() => {
        if (modal) modal.classList.add('hidden');
    }, 200);
}

async function confirmAction(id, decision) {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    let session;
    try {
        session = JSON.parse(sessionStr);
    } catch (e) {
        Swal.fire('Lỗi', 'Dữ liệu phiên không hợp lệ', 'error');
        logout();
        return;
    }
    
    try {
        const res = await callAPI({
            action: 'approve_reject',
            id,
            username: session.username,
            role: session.role,
            decision
        });
        
        if (res.success) {
            Swal.fire('OK', res.message || 'Thành công', 'success');
            closeModal();
            loadApprovalList();
        } else {
            Swal.fire('Lỗi', res.message || 'Thất bại', 'error');
        }
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
    }
}

// ===================================
// API CALLER
// ===================================
async function callAPI(data) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
    } catch (e) {
        console.error('API call error:', e);
        return { success: false, message: 'Lỗi kết nối' };
    }
}

// ===================================
// CSS HELPER
// ===================================
(function() {
    if (!document.getElementById('app-dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'app-dynamic-styles';
        style.innerHTML = `
            .label { 
                display: block; 
                font-size: 0.875rem; 
                font-weight: 700; 
                color: #374151; 
                margin-bottom: 0.25rem; 
            }
            .input { 
                width: 100%; 
                border: 1px solid #d1d5db; 
                padding: 0.5rem; 
                border-radius: 0.5rem; 
                outline: none; 
            }
            .input:focus { 
                border-color: #2563eb; 
                box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); 
            }
        `;
        document.head.appendChild(style);
    }
})();

