
// ===================================
// INITIALIZATION
// ===================================
        // Load TPKD users when page loads
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

// Note: Initialization is now handled in components.js after components are loaded
// This prevents accessing DOM elements before they exist

// ===================================
// CONTRACT LOOKUP INITIALIZATION
// ===================================
function initContractLookup() {
    const searchInput = $('search_code_input');
    if (!searchInput) return;
    
    // ĐÃ CHUYỂN SANG SUPABASE - Không dùng Google Apps Script nữa
    // Xóa hx-post attribute nếu có
    searchInput.removeAttribute('hx-post');
    
    // Dùng JavaScript để gọi Supabase API thay vì htmx
    // Function này sẽ được override trong init.js với logic Supabase
    // Giữ lại đây để tương thích ngược
    console.log('initContractLookup: Đã chuyển sang Supabase API');
}

// Note: Authentication functions (checkSession, handleLogin, showLogin, showChangePasswordModal, logout) are in auth.js and utils.js
// They are loaded before app.js, so they are available here

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
    if (id === 'my-requests') loadMyRequests();
    if (id === 'profile') loadProfile();
    if (id === 'users') loadUserManagement();
}


// ===================================
// MONEY & GIFT LOGIC
// ===================================
// formatMoneyInput is defined in utils.js and exported to window
// Use that function instead of redefining here

        function addGiftRow(containerId) {
    const container = $(containerId);
    if (!container) return;
    
    // Xóa message "Chưa có quà tặng" nếu đây là quà đầu tiên
    if (container.querySelectorAll('.gift-row').length === 0) {
        container.innerHTML = '';
    }
    
    const rowId = `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const html = `
        <div class="flex gap-2 mb-2 gift-row items-center bg-gray-50 p-2 rounded border border-gray-200" id="${rowId}">
            <input class="gift-name flex-1 border p-1.5 rounded text-sm outline-none focus:border-blue-500 bg-white" 
                   placeholder="Nhập tên quà tặng">
            <input class="gift-price w-32 border p-1.5 rounded text-sm text-right outline-none focus:border-blue-500 bg-white" 
                   placeholder="0" 
                   oninput="formatMoneyInput(this); calcGiftTotal('${containerId}')">
            <button type="button" 
                    onclick="removeGiftRow('${rowId}','${containerId}')" 
                    class="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition">
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
        
        // Kiểm tra nếu không còn quà nào thì hiển thị message
        const container = $(containerId);
        if (container && container.querySelectorAll('.gift-row').length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-2">Chưa có quà tặng. Nhấn "Thêm quà" để thêm.</p>';
        }
    }
}

        function calcGiftTotal(containerId) {
    const container = $(containerId);
    if (!container) return;
    
            let total = 0;
    container.querySelectorAll('.gift-row').forEach(row => {
        const priceInput = row.querySelector('.gift-price');
        if (priceInput) {
            const val = parseInt(priceInput.value.replace(/\./g, '')) || 0;
                total += val;
        }
    });
    
    const displayId = containerId === 'gift-list-search' 
        ? 'total-gift-search' 
        : (containerId === 'gift-list-edit' ? 'total-gift-edit' : 'total-gift-manual');
    const displayEl = $(displayId);
    if (displayEl) {
        displayEl.textContent = total.toLocaleString('vi-VN') + ' đ';
    }
}

        function packGiftData(containerId, hiddenInputId) {
    const container = $(containerId);
    const hiddenInput = $(hiddenInputId);
    if (!container || !hiddenInput) {
        console.error('packGiftData: Container or hiddenInput not found', { containerId, hiddenInputId });
        return;
    }
    
    const gifts = [];
    container.querySelectorAll('.gift-row').forEach(row => {
        const nameInput = row.querySelector('.gift-name');
        const priceInput = row.querySelector('.gift-price');
        const name = nameInput?.value.trim();
        
        if (name) {
            // Loại bỏ dấu chấm và các ký tự không phải số từ giá trị
            const priceValue = (priceInput?.value || '0').toString().replace(/\./g, '').replace(/[^\d]/g, '');
            gifts.push({
                name,
                price: priceValue || '0'
            });
        }
    });
    
    hiddenInput.value = JSON.stringify(gifts);
    console.log('packGiftData result:', hiddenInput.value);
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
    
    // Pack gift data trước khi submit
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
        ...Object.fromEntries(formData.entries()),
        approver_step0: formData.get('approver_step0') || '',
        productivity_bonus: formData.get('productivity_bonus')?.replace(/\./g, '') || '0'
    };
    
    // Validate approver_step0
    if (!payload.approver_step0) {
        Swal.fire('Lỗi', 'Vui lòng chọn TPKD duyệt', 'error');
        return;
    }
    
    // Validate productivity_bonus
    if (!payload.productivity_bonus || payload.productivity_bonus === '0') {
        Swal.fire('Lỗi', 'Vui lòng nhập lương năng suất', 'error');
        return;
    }
    
    // Đảm bảo gift_json được gửi lên (lấy từ hidden input)
    const giftJsonValue = $(hiddenInput)?.value || '[]';
    if (giftJsonValue) {
        payload.gift_json = giftJsonValue;
    }
    
    console.log('Submit payload:', payload);
    
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
            
            // Xóa quà tặng khỏi form sau khi submit
            const giftContainerEl = mode === 'search' ? $('gift-list-search') : $('gift-list-manual');
            if (giftContainerEl) {
                giftContainerEl.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-2">Chưa có quà tặng. Nhấn "Thêm quà" để thêm.</p>';
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
    if (!sessionStr) {
        const container = $('approval-list-container');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</p>';
        }
        return;
    }
    
    let session;
    try {
        session = JSON.parse(sessionStr);
    } catch (e) {
        console.error('Error parsing session:', e);
        const container = $('approval-list-container');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center">Lỗi dữ liệu phiên đăng nhập</p>';
        }
        return;
    }
    
    const container = $('approval-list-container');
    if (!container) {
        console.error('approval-list-container not found');
        return;
    }
    
    container.innerHTML = '<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i><p class="mt-2 text-gray-500">Đang tải danh sách...</p></div>';
    
    try {
        const res = await callAPI({
            action: 'get_pending_list',
            username: session.username,
            role: session.role
        });
        
        console.log('loadApprovalList response:', res);
        
        if (res.success && res.data) {
            approvalData = res.data;
            renderApprovalSummary();
            renderApprovalList();
        } else {
            const errorMsg = res.message || 'Không có dữ liệu hoặc lỗi không xác định';
            console.error('API returned error:', errorMsg);
            container.innerHTML = `<p class="text-red-500 text-center">${errorMsg}</p>`;
        }
    } catch (error) {
        console.error('Error in loadApprovalList:', error);
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối: ${error.message || 'Không thể kết nối đến server'}</p>`;
    }
}

function setApprovalFilter(key, value) {
    approvalFilters[key] = value;
    renderApprovalSummary();
    renderApprovalList();
}

function getApprovalStatus(item) {
    if (item.can_resubmit) return 'rejected';
    if (item.status_text && /từ chối|trả về/i.test(item.status_text)) return 'rejected';
    if (item.status_text && /hoàn tất|chờ in/i.test(item.status_text)) return 'completed';
    return 'pending';
}

function filterApprovalData() {
    const search = (approvalFilters.search || '').trim().toLowerCase();
    const status = approvalFilters.status || 'all';
    return approvalData.filter(item => {
        const statusMatch = status === 'all' || getApprovalStatus(item) === status;
        if (!statusMatch) return false;
        if (!search) return true;
        const haystack = [
            item.contract_code,
            item.customer,
            item.phone,
            item.requester,
            item.status_text
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(search);
    });
}

function renderApprovalSummary() {
    const summaryTotal = $('summary-total');
    const summaryPending = $('summary-pending');
    if (!summaryTotal || !summaryPending) return;
    const filtered = filterApprovalData();
    const pendingCount = approvalData.filter(item => getApprovalStatus(item) === 'pending').length;
    summaryTotal.textContent = approvalData.length.toString();
    summaryPending.textContent = pendingCount.toString();
}

function renderApprovalList() {
    const container = $('approval-list-container');
    if (!container) return;
    const tpl = $('tpl-pending-list')?.innerHTML;
    if (!tpl || typeof Mustache === 'undefined') {
        container.innerHTML = '<p class="text-red-500 text-center">Template không khả dụng.</p>';
        return;
    }
    const filtered = filterApprovalData();
    if (!filtered.length) {
        container.innerHTML = '<div class="text-center text-gray-400 py-12"><i class="fa-regular fa-folder-open text-4xl mb-2 opacity-30"></i><p>Không có đơn phù hợp bộ lọc.</p></div>';
        return;
    }
    container.innerHTML = Mustache.render(tpl, { data: filtered });
}

// ===================================
// MODAL
// ===================================
        function openDetail(jsonStr) {
    try {
        if (!jsonStr) {
            console.error('jsonStr is empty or undefined');
            Swal.fire('Lỗi', 'Không có dữ liệu để hiển thị', 'error');
            return;
        }
        
        let data;
        try {
            // Thử decode và parse JSON
            const decoded = decodeURIComponent(jsonStr);
            data = JSON.parse(decoded);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('jsonStr value:', jsonStr);
            Swal.fire('Lỗi', 'Dữ liệu không hợp lệ. Vui lòng thử lại.', 'error');
            return;
        }
        
        if (!data || typeof data !== 'object') {
            console.error('Invalid data format:', data);
            Swal.fire('Lỗi', 'Dữ liệu không đúng định dạng', 'error');
            return;
        }
        
        // Đảm bảo các trường mới có giá trị mặc định
        data.other_requirements = data.other_requirements || '';
        // Format productivity_bonus từ số sang VNĐ
        if (data.productivity_bonus) {
            const productivityBonusNum = parseInt(String(data.productivity_bonus).replace(/[^\d]/g, '')) || 0;
            data.productivity_bonus = productivityBonusNum > 0 ? productivityBonusNum.toLocaleString('vi-VN') : '';
        } else {
            data.productivity_bonus = '';
        }
        
        const sessionStr = localStorage.getItem('user_session');
        let session = null;
        
        if (sessionStr) {
            try {
                session = JSON.parse(sessionStr);
                // Kiểm tra xem có thể gửi lại không (step = 0 và là người tạo)
                data.can_resubmit = (data.step === 0 && 
                                    session && 
                                    (session.role === 'TVBH' || session.role === 'SALE') &&
                                    data.requester && 
                                    data.requester.toLowerCase() === session.username.toLowerCase());
                
                // Thêm is_admin flag
                data.is_admin = (session && session.role === 'ADMIN');
                
                // Kiểm tra quyền chỉnh sửa chi phí (tất cả các bộ phận có thể chỉnh sửa khi duyệt)
                // Chỉ cho phép chỉnh sửa khi đang ở bước duyệt của họ hoặc đã duyệt xong
                const workflow = [
                    { step: 0, role: 'TPKD' },
                    { step: 1, role: 'GDKD' },
                    { step: 2, role: 'BKS' },
                    { step: 3, role: 'BGD' },
                    { step: 4, role: 'KETOAN' }
                ];
                const currentStepConfig = workflow.find(w => w.step === data.step);
                const canEditAtCurrentStep = currentStepConfig && currentStepConfig.role === session.role;
                const isCompleted = data.step >= 4; // Step 4 (KETOAN) là hoàn tất
                // Không cho bất cứ ai chỉnh sửa lương năng suất sau khi hoàn thành
                if (isCompleted) {
                    data.can_edit_cost = false; // Không ai được chỉnh sửa sau khi hoàn thành
                } else {
                    data.can_edit_cost = (session && (session.role === 'ADMIN' || canEditAtCurrentStep));
                }
                
                // Kiểm tra quyền chỉnh sửa contract_code và vin_no khi đã hoàn tất
                // Cho phép: người tạo (requester), GDKD, BGD, BKS, KETOAN, ADMIN
                const isRequester = data.requester && session && 
                    data.requester.toLowerCase() === session.username.toLowerCase();
                const isRequesterRole = session && (session.role === 'TVBH' || session.role === 'SALE');
                const canEditCompletedByRequester = isCompleted && isRequester && isRequesterRole;
                const canEditCompletedByRole = isCompleted && session && 
                    (session.role === 'GDKD' || session.role === 'BGD' || session.role === 'BKS' || 
                     session.role === 'KETOAN' || session.role === 'ADMIN');
                data.can_edit_completed = canEditCompletedByRequester || canEditCompletedByRole;
                
                // Kiểm tra quyền in:
                // - Admin, GĐKD, BKS, BGĐ, KT: có thể in tất cả tờ trình đã hoàn tất
                // - TVBH/SALE: có thể in tờ trình của chính mình khi hoàn tất
                // - TPKD: có thể in tờ trình của mình hoặc được giao cho họ khi hoàn tất
                if (isCompleted && session) {
                    const isRequester = data.requester && data.requester.toLowerCase() === session.username.toLowerCase();
                    const canPrintRoles = ['ADMIN', 'GDKD', 'BKS', 'BGD', 'KETOAN'];
                    
                    if (canPrintRoles.includes(session.role)) {
                        // Admin, GĐKD, BKS, BGĐ, KT: in được tất cả
                        data.can_print = true;
                    } else if (session.role === 'TVBH' || session.role === 'SALE') {
                        // TVBH/SALE: chỉ in được tờ trình của chính mình
                        data.can_print = isRequester;
                    } else if (session.role === 'TPKD') {
                        // TPKD: in được tờ trình của mình hoặc được giao cho họ
                        const isMyRequest = isRequester;
                        const isAssignedToMe = data.approver_step0 && 
                                             data.approver_step0.toLowerCase() === session.username.toLowerCase();
                        data.can_print = isMyRequest || isAssignedToMe;
                    } else {
                        data.can_print = false;
                    }
                } else {
                    data.can_print = false;
                }
                
                // Tính toán chi phí và tỷ lệ
                const discountAmount = parseInt((data.discount_amount || '').replace(/[^\d]/g, '')) || 0;
                const giftAmount = parseInt((data.gift_amount || '').replace(/[^\d]/g, '')) || 0;
                const totalCost = discountAmount + giftAmount;
                const contractPrice = parseInt((data.contract_price || '').replace(/[^\d]/g, '')) || 0;
                const costPercentage = contractPrice > 0 ? ((totalCost / contractPrice) * 100).toFixed(2) : '0.00';
                data.total_cost = totalCost.toLocaleString('vi-VN');
                data.cost_percentage = costPercentage;
                
                // Tính next_status và is_completed nếu chưa có
                // Step 4 (Kế Toán) là bước cuối, sau đó có thể in (step >= 4)
                if (!data.next_status && !data.is_completed) {
                    const workflow = [
                        { step: 0, next: 1, label: 'Chờ TPKD duyệt' },
                        { step: 1, next: 2, label: 'Chờ GĐKD duyệt' },
                        { step: 2, next: 3, label: 'Chờ Ban Kiểm Soát' },
                        { step: 3, next: 4, label: 'Chờ Ban Giám Đốc' },
                        { step: 4, next: 6, label: 'Chờ Kế Toán kiểm tra' } // Step 4 = Hoàn tất
                    ];
                    const stepConfig = workflow.find(w => w.step === data.step);
                    if (data.step >= 4) {
                        data.is_completed = true;
                    } else if (stepConfig && stepConfig.next < 4) {
                        const nextConfig = workflow.find(w => w.step === stepConfig.next);
                        if (nextConfig) {
                            data.next_status = nextConfig.label;
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing session:', e);
            }
        }
        
        const tpl = $('tpl-order-detail');
        const modalBody = $('modal-detail-body');
        const modal = $('modal-detail');
        
        if (!tpl) {
            console.error('Template tpl-order-detail not found');
            Swal.fire('Lỗi', 'Template không tìm thấy', 'error');
            return;
        }
        
        if (!modalBody) {
            console.error('modal-detail-body not found');
            Swal.fire('Lỗi', 'Modal body không tìm thấy', 'error');
            return;
        }
        
        if (!modal) {
            console.error('modal-detail not found');
            Swal.fire('Lỗi', 'Modal không tìm thấy', 'error');
            return;
        }
        
        if (typeof Mustache === 'undefined') {
            console.error('Mustache is not loaded');
            modalBody.innerHTML = '<p class="p-4 text-red-500">Lỗi: Mustache không được tải. Vui lòng tải lại trang.</p>';
            modal.classList.remove('hidden');
            return;
        }
        
        try {
            modalBody.innerHTML = Mustache.render(tpl.innerHTML, data);
        } catch (renderError) {
            console.error('Error rendering template:', renderError);
            Swal.fire('Lỗi', 'Không thể render template: ' + renderError.message, 'error');
            return;
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
        console.error('Stack trace:', e.stack);
        Swal.fire('Lỗi', 'Không thể mở chi tiết: ' + (e.message || 'Lỗi không xác định'), 'error');
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

async function resubmitRequest(id) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    // Xác nhận trước khi gửi lại
    const confirmResult = await Swal.fire({
        title: 'Gửi lại đơn?',
        text: 'Đơn sẽ được gửi lại để duyệt từ đầu',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Gửi lại',
        cancelButtonText: 'Hủy'
    });
    
    if (!confirmResult.isConfirmed) {
        return;
    }
    
    try {
        const res = await callAPI({
            action: 'resubmit',
            id,
            username: session.username,
            role: session.role
        });
        
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã gửi lại đơn thành công', 'success');
            closeModal();
            loadApprovalList();
        } else {
            Swal.fire('Lỗi', res.message || 'Gửi lại thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in resubmitRequest:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

        async function confirmAction(id, decision) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    // Prompt for comment for both approve and reject
    let comment = '';
    let productivityBonus = '';
    let nextApprover = '';
    
    // Show loading immediately
    Swal.fire({
        title: 'Đang tải...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Get request detail to know next step and current productivity bonus
        let detailData = null;
        let nextRole = null;
        let nextStep = null;
        
        try {
            const detailRes = await callAPI({ action: 'get_request_detail', id, username: session.username });
            if (detailRes.success && detailRes.data) {
                detailData = detailRes.data;
                const workflow = [
                    { step: 0, next: 1, role: 'TPKD' },
                    { step: 1, next: 2, role: 'GDKD' },
                    { step: 2, next: 3, role: 'BKS' },
                    { step: 3, next: 4, role: 'BGD' },
                    { step: 4, next: 6, role: 'KETOAN' }
                ];
                const currentStep = detailData.step || 0;
                const stepConfig = workflow.find(w => w.step === currentStep);
                if (stepConfig && stepConfig.next < 6) {
                    const nextConfig = workflow.find(w => w.step === stepConfig.next);
                    if (nextConfig) {
                        nextRole = nextConfig.role;
                        nextStep = stepConfig.next;
                    }
                }
            }
        } catch (e) {
            console.error('Error getting request detail:', e);
            Swal.close();
            Swal.fire('Lỗi', 'Không thể tải thông tin tờ trình', 'error');
            return;
        }
        
        if (decision === 'approve') {
            // Load users for next role if available
            let usersHtml = '';
            if (nextRole) {
                try {
                    const usersRes = await callAPI({ action: 'get_users_by_role', role: nextRole });
                    if (usersRes.success && usersRes.users && usersRes.users.length > 0) {
                        usersHtml = `
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Chọn người duyệt tiếp theo (${nextRole}):</label>
                            <select id="swal-next-approver" class="swal2-select" style="width: 100%; margin-bottom: 15px; padding: 8px;">
                                <option value="">-- Chọn người duyệt --</option>
                        `;
                        usersRes.users.forEach(user => {
                            usersHtml += `<option value="${user.username}">${user.fullname} (${user.username})${user.group ? ' - ' + user.group : ''}</option>`;
                        });
                        usersHtml += '</select>';
                    }
                } catch (e) {
                    console.error('Error loading users:', e);
                }
            }
            
            // Get current productivity bonus from detail data
            const currentProductivityBonus = detailData ? (detailData.productivity_bonus || '') : '';
            const currentProductivityBonusFormatted = currentProductivityBonus || '0';
            
            // Close loading and show form
            Swal.close();
            
            // For approve: show form with comment, productivity bonus adjustment, and next approver
            const result = await Swal.fire({
                title: '<div style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">✓ Duyệt tờ trình</div>',
                html: `
                    <div style="text-align: left; padding: 5px 0;">
                        <!-- Lý do duyệt -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                <i class="fa-solid fa-comment-dots" style="color: #3b82f6; margin-right: 5px;"></i>
                                Lý do duyệt <span style="color: #9ca3af; font-weight: 400;">(tùy chọn)</span>
                            </label>
                            <textarea id="swal-comment" 
                                      class="swal2-textarea" 
                                      placeholder="Ví dụ: Đã kiểm tra và đồng ý..." 
                                      style="width: 100%; min-height: 70px; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; transition: border-color 0.2s;"
                                      onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';"
                                      onblur="this.style.borderColor='#e5e7eb';"></textarea>
                        </div>
                        
                        <!-- Điều chỉnh lương năng suất -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                                <i class="fa-solid fa-money-bill-wave" style="color: #10b981; margin-right: 5px;"></i>
                                Điều chỉnh lương năng suất (VNĐ)
                            </label>
                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #bae6fd;">
                                <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 3px;">TVBH đề xuất:</span>
                                <span style="font-size: 16px; font-weight: 700; color: #0284c7;">${currentProductivityBonusFormatted}</span>
                            </div>
                            <input id="swal-productivity" 
                                   type="text" 
                                   class="swal2-input" 
                                   value="${currentProductivityBonusFormatted}" 
                                   placeholder="Nhập số tiền mới (để trống = giữ nguyên)" 
                                   style="text-align: right; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; width: 100%; font-weight: 500; transition: border-color 0.2s;"
                                   oninput="this.value = this.value.replace(/[^0-9]/g, ''); if (this.value) this.value = parseInt(this.value).toLocaleString('vi-VN');"
                                   onfocus="this.style.borderColor='#10b981'; this.style.outline='none';"
                                   onblur="this.style.borderColor='#e5e7eb';">
                            <p style="font-size: 11px; color: #6b7280; margin-top: 6px; margin-bottom: 0; padding-left: 2px;">
                                <i class="fa-solid fa-info-circle" style="margin-right: 4px;"></i>
                                Để trống hoặc giữ nguyên giá trị hiện tại nếu không điều chỉnh
                            </p>
                        </div>
                        
                        <!-- Chọn người duyệt tiếp theo -->
                        ${usersHtml ? `
                        <div style="margin-bottom: 15px;">
                            ${usersHtml.replace('style="width: 100%; margin-bottom: 15px; padding: 8px;"', 'style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; transition: border-color 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\';" onblur="this.style.borderColor=\'#e5e7eb\';"')}
                        </div>
                        ` : ''}
                    </div>
                `,
                width: '520px',
                padding: '25px',
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Xác nhận',
                cancelButtonText: '<i class="fa-solid fa-times"></i> Hủy',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                buttonsStyling: true,
                allowOutsideClick: false,
                allowEscapeKey: true,
                customClass: {
                    popup: 'swal2-popup-custom',
                    title: 'swal2-title-custom',
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom'
                },
                preConfirm: () => {
                    // Read values before closing
                    const popup = Swal.getPopup();
                    if (!popup) return null;
                    
                    const commentInput = popup.querySelector('#swal-comment');
                    const productivityInput = popup.querySelector('#swal-productivity');
                    const nextApproverInput = popup.querySelector('#swal-next-approver');
                    
                    return {
                        comment: commentInput ? commentInput.value : '',
                        productivity_bonus: productivityInput ? productivityInput.value.replace(/\./g, '') : '',
                        next_approver: nextApproverInput ? nextApproverInput.value : ''
                    };
                },
                didOpen: () => {
                    const commentInput = Swal.getPopup().querySelector('#swal-comment');
                    if (commentInput) {
                        commentInput.focus();
                    }
                    // Add custom styles
                    const style = document.createElement('style');
                    style.textContent = `
                        .swal2-popup-custom {
                            border-radius: 12px !important;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
                        }
                        .swal2-title-custom {
                            padding: 0 0 15px 0 !important;
                            margin-bottom: 0 !important;
                        }
                        .swal2-confirm-custom {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                            border: none !important;
                            border-radius: 8px !important;
                            padding: 10px 24px !important;
                            font-weight: 600 !important;
                            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3) !important;
                            transition: all 0.2s !important;
                        }
                        .swal2-confirm-custom:hover {
                            transform: translateY(-1px) !important;
                            box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4) !important;
                        }
                        .swal2-cancel-custom {
                            border-radius: 8px !important;
                            padding: 10px 24px !important;
                            font-weight: 600 !important;
                            transition: all 0.2s !important;
                        }
                        .swal2-cancel-custom:hover {
                            background: #4b5563 !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            });
            
            if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.esc) {
                return;
            }
            
            // Read values from preConfirm result
            if (result.value && typeof result.value === 'object') {
                comment = result.value.comment || '';
                const newProductivityBonus = result.value.productivity_bonus || '';
                const oldProductivityBonus = currentProductivityBonus ? String(currentProductivityBonus).replace(/\./g, '') : '';
                // Chỉ gửi nếu có thay đổi, nếu không có thay đổi thì gửi rỗng để backend giữ nguyên
                productivityBonus = (newProductivityBonus && newProductivityBonus !== oldProductivityBonus) ? newProductivityBonus : '';
                nextApprover = result.value.next_approver || '';
            } else {
                // Fallback: try to read from DOM (should not happen if preConfirm works)
                console.warn('preConfirm did not return value, trying DOM fallback');
                const popup = Swal.getPopup();
                if (popup) {
                    const commentInput = popup.querySelector('#swal-comment');
                    const productivityInput = popup.querySelector('#swal-productivity');
                    const nextApproverInput = popup.querySelector('#swal-next-approver');
                    comment = commentInput ? commentInput.value : '';
                    const newProductivityBonus = productivityInput ? productivityInput.value.replace(/\./g, '') : '';
                    const oldProductivityBonus = currentProductivityBonus ? String(currentProductivityBonus).replace(/\./g, '') : '';
                    productivityBonus = (newProductivityBonus && newProductivityBonus !== oldProductivityBonus) ? newProductivityBonus : '';
                    nextApprover = nextApproverInput ? nextApproverInput.value : '';
                }
            }
            
            console.log('Approval data:', { comment, productivityBonus, nextApprover, currentProductivityBonus });
        } else {
            // For reject: only comment required
            const title = 'Lý do từ chối';
            const label = 'Nhập lý do từ chối (khuyến nghị)';
            const placeholder = 'Ví dụ: Giá không phù hợp, thiếu thông tin...';
            
            const result = await Swal.fire({
                title: title,
                input: 'textarea',
                inputLabel: label,
                inputPlaceholder: placeholder,
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                allowOutsideClick: false,
                allowEscapeKey: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'Vui lòng nhập lý do từ chối';
                    }
                    return null;
                }
            });
            
            if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.esc) {
                return;
            }
            
            comment = result.value || '';
            
            if (!comment.trim()) {
                Swal.fire('Lỗi', 'Vui lòng nhập lý do từ chối', 'error');
                return;
            }
        }
    } catch (e) {
        console.error('Error getting input:', e);
        if (decision === 'reject') {
            Swal.fire('Lỗi', 'Vui lòng nhập lý do từ chối', 'error');
            return;
        }
        comment = '';
        productivityBonus = '';
    }
    
    try {
        // Format productivity bonus for log if changed
        let productivityBonusFormatted = '';
        if (productivityBonus) {
            productivityBonusFormatted = Number(productivityBonus).toLocaleString('vi-VN') + ' VNĐ';
        }
        
        console.log('Sending approval request:', {
            action: 'approve_reject',
            id,
            username: session.username,
            role: session.role,
            decision,
            comment: comment || '',
            productivity_bonus: productivityBonus || '',
            productivity_bonus_formatted: productivityBonusFormatted,
            next_approver: nextApprover || ''
        });
        
        const res = await callAPI({
            action: 'approve_reject',
            id,
            username: session.username,
            role: session.role,
            decision,
            comment: comment || '',
            productivity_bonus: productivityBonus || '',
            productivity_bonus_formatted: productivityBonusFormatted,
            next_approver: nextApprover || ''
        });
        
        if (res.success) {
            Swal.fire('OK', res.message || 'Thành công', 'success');
            closeModal();
            loadApprovalList();
        } else {
            Swal.fire('Lỗi', res.message || 'Thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in confirmAction:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

// ===================================
// MY REQUESTS MANAGEMENT
// ===================================

// Note: myRequestsData and myRequestsFilters are declared in utils.js
// They are shared across modules

async function loadMyRequests() {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    const container = $('my-requests-list-container');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i><p class="mt-2 text-gray-500">Đang tải danh sách...</p></div>';
    
    try {
        const res = await callAPI({
            action: 'get_my_requests',
            username: session.username,
            role: session.role
        });
        
        if (res.success && res.data) {
            myRequestsData = res.data;
            renderMyRequestsList();
        } else {
            container.innerHTML = `<p class="text-red-500 text-center">${res.message || 'Không có dữ liệu'}</p>`;
        }
    } catch (error) {
        console.error('Error in loadMyRequests:', error);
        container.innerHTML = `<p class="text-red-500 text-center">Lỗi kết nối: ${error.message || 'Không thể kết nối đến server'}</p>`;
    }
}

function filterMyRequestsData() {
    const search = (myRequestsFilters.search || '').trim().toLowerCase();
    const status = myRequestsFilters.status || 'all';
    return myRequestsData.filter(item => {
        const statusMatch = status === 'all' || getMyRequestStatus(item) === status;
        if (!statusMatch) return false;
        if (!search) return true;
        const haystack = [
            item.contract_code,
            item.customer,
            item.phone,
            item.status_text
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(search);
    });
}

function getMyRequestStatus(item) {
    if (item.can_resubmit) return 'rejected';
    if (item.status_text && /từ chối|trả về/i.test(item.status_text)) return 'rejected';
    if (item.is_completed) return 'completed';
    return 'pending';
}

function renderMyRequestsList() {
    const container = $('my-requests-list-container');
    if (!container) return;
    const tpl = $('tpl-my-requests-list')?.innerHTML;
    if (!tpl || typeof Mustache === 'undefined') {
        container.innerHTML = '<p class="text-red-500 text-center">Template không khả dụng.</p>';
        return;
    }
    const filtered = filterMyRequestsData();
    container.innerHTML = Mustache.render(tpl, { data: filtered });
}

// Note: Filter setup is now handled in components.js after components are loaded

async function openEditRequest(id) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    try {
        const res = await callAPI({
            action: 'get_request_detail',
            id,
            username: session.username
        });
        
        if (!res.success || !res.data) {
            Swal.fire('Lỗi', res.message || 'Không tìm thấy tờ trình', 'error');
            return;
        }
        
        const data = res.data;
        
        // Fill form
        $('edit_request_id').value = data.id;
        $('edit_contract_code').value = data.contract_code || '';
        $('edit_customer_name').value = data.customer || '';
        $('edit_phone').value = data.phone || '';
        $('edit_cccd').value = data.cccd || '';
        $('edit_email').value = data.email || '';
        $('edit_address').value = data.address || '';
        $('edit_car_model').value = data.car_model || '';
        $('edit_car_version').value = data.car_version || '';
        $('edit_car_color').value = data.car_color || '';
        $('edit_vin_no').value = data.vin_no || '';
        $('edit_payment_method').value = data.payment || '';
        $('edit_contract_price').value = (data.contract_price || '').replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        $('edit_discount_details').value = data.discount_details || '';
        $('edit_discount_amount').value = (data.discount_amount || '').replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        $('edit_productivity_bonus').value = (data.productivity_bonus || '').replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        // Load gifts từ data
        const giftList = $('gift-list-edit');
        if (giftList) giftList.innerHTML = '';
        try {
            const gifts = JSON.parse(data.gift_json || '[]');
            if (Array.isArray(gifts) && gifts.length > 0) {
                gifts.forEach(gift => {
                    addGiftRow('gift-list-edit');
                    const rows = giftList.querySelectorAll('.gift-row');
                    const lastRow = rows[rows.length - 1];
                    if (lastRow) {
                        lastRow.querySelector('.gift-name').value = gift.name || '';
                        const priceValue = (gift.price || '0').toString().replace(/[^\d]/g, '');
                        lastRow.querySelector('.gift-price').value = priceValue ? Number(priceValue).toLocaleString('vi-VN') : '';
                    }
                });
            } else {
                giftList.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-2">Chưa có quà tặng. Nhấn "Thêm quà" để thêm.</p>';
            }
        } catch (e) {
            console.error('Error parsing gifts:', e);
            if (giftList) {
                giftList.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-2">Chưa có quà tặng. Nhấn "Thêm quà" để thêm.</p>';
            }
        }
        calcGiftTotal('gift-list-edit');
        
        // Show modal
        const modal = $('modal-edit-request');
        const modalContent = $('modal-edit-content');
        if (modal && modalContent) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }, 10);
        }
    } catch (error) {
        console.error('Error in openEditRequest:', error);
        Swal.fire('Lỗi', error.message || 'Không thể tải dữ liệu', 'error');
    }
}

function closeEditModal() {
    const modal = $('modal-edit-request');
    const modalContent = $('modal-edit-content');
    
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    
    setTimeout(() => {
        if (modal) modal.classList.add('hidden');
    }, 200);
}

async function handleUpdateRequest(event) {
    event.preventDefault();
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Pack gift data trước khi submit
    packGiftData('gift-list-edit', 'hidden_gift_json_edit');
    const giftJson = $('hidden_gift_json_edit')?.value || '[]';
    
    const data = {
        action: 'update_request',
        id: formData.get('edit_request_id'),
        username: session.username,
        role: session.role,
        contract_code: formData.get('edit_contract_code'),
        customer_name: formData.get('edit_customer_name'),
        phone: formData.get('edit_phone'),
        cccd: formData.get('edit_cccd'),
        email: formData.get('edit_email'),
        address: formData.get('edit_address'),
        car_model: formData.get('edit_car_model'),
        car_version: formData.get('edit_car_version'),
        car_color: formData.get('edit_car_color'),
        vin_no: formData.get('edit_vin_no'),
        payment_method: formData.get('edit_payment_method'),
        contract_price: formData.get('edit_contract_price')?.replace(/\./g, '') || '0',
        discount_details: formData.get('edit_discount_details'),
        discount_amount: formData.get('edit_discount_amount')?.replace(/\./g, '') || '0',
        gift_json: giftJson,
        other_requirements: formData.get('edit_other_requirements') || '',
        productivity_bonus: formData.get('edit_productivity_bonus')?.replace(/\./g, '') || '0'
    };
    
    try {
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const res = await callAPI(data);
        
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã cập nhật tờ trình thành công', 'success');
            closeEditModal();
            loadMyRequests();
            if (typeof loadApprovalList === 'function') loadApprovalList();
        } else {
            Swal.fire('Lỗi', res.message || 'Cập nhật thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in handleUpdateRequest:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

async function handleUpdateAndResubmit(event) {
    event.preventDefault();
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    // Xác nhận trước khi trình lại
    const confirmResult = await Swal.fire({
        title: 'Lưu và trình lại?',
        text: 'Tờ trình sẽ được lưu thay đổi và gửi lại để duyệt từ đầu',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
    });
    
    if (!confirmResult.isConfirmed) {
        return;
    }
    
    const form = $('form-edit-request');
    if (!form) {
        Swal.fire('Lỗi', 'Không tìm thấy form', 'error');
        return;
    }
    
    const formData = new FormData(form);
    
    // Pack gift data trước khi submit
    packGiftData('gift-list-edit', 'hidden_gift_json_edit');
    const giftJson = $('hidden_gift_json_edit')?.value || '[]';
    
    const updateData = {
        action: 'update_request',
        id: formData.get('edit_request_id'),
        username: session.username,
        role: session.role,
        contract_code: formData.get('edit_contract_code'),
        customer_name: formData.get('edit_customer_name'),
        phone: formData.get('edit_phone'),
        cccd: formData.get('edit_cccd'),
        email: formData.get('edit_email'),
        address: formData.get('edit_address'),
        car_model: formData.get('edit_car_model'),
        car_version: formData.get('edit_car_version'),
        car_color: formData.get('edit_car_color'),
        vin_no: formData.get('edit_vin_no'),
        payment_method: formData.get('edit_payment_method'),
        contract_price: formData.get('edit_contract_price')?.replace(/\./g, '') || '0',
        discount_details: formData.get('edit_discount_details'),
        discount_amount: formData.get('edit_discount_amount')?.replace(/\./g, '') || '0',
        gift_json: giftJson
    };
    
    try {
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Bước 1: Cập nhật tờ trình
        const updateRes = await callAPI(updateData);
        
        if (!updateRes.success) {
            Swal.fire('Lỗi', updateRes.message || 'Cập nhật thất bại', 'error');
            return;
        }
        
        // Bước 2: Gửi lại để duyệt
        const resubmitRes = await callAPI({
            action: 'resubmit',
            id: formData.get('edit_request_id'),
            username: session.username,
            role: session.role
        });
        
        if (resubmitRes.success) {
            Swal.fire('Thành công', 'Đã lưu thay đổi và trình lại tờ trình thành công', 'success');
            closeEditModal();
            loadMyRequests();
            if (typeof loadApprovalList === 'function') loadApprovalList();
        } else {
            Swal.fire('Lỗi', resubmitRes.message || 'Trình lại thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in handleUpdateAndResubmit:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

function printRequest(id) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    // Open print window with template
    const printWindow = window.open('', '_blank');
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>PHIẾU TRÌNH ĐỀ XUẤT CHƯƠNG TRÌNH BÁN HÀNG</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page { margin: 1cm; size: A4; }
                }
                body { 
                    font-family: "Times New Roman", serif; 
                    font-size: 10pt; 
                    padding: 10px; 
                    line-height: 1.3;
                    margin: 0;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 10px; 
                }
                .header h1 { 
                    font-size: 13pt; 
                    font-weight: bold; 
                    text-transform: uppercase; 
                    margin-bottom: 5px;
                }
                .header-info {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 5px;
                    font-size: 9pt;
                }
                .section { 
                    margin-bottom: 8px; 
                }
                .section-title { 
                    font-weight: bold; 
                    font-size: 10pt; 
                    margin-bottom: 5px; 
                    text-transform: uppercase;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 8px; 
                    font-size: 9pt;
                }
                table, table td, table th { 
                    border: 1px solid #000; 
                }
                table td, table th { 
                    padding: 3px 5px; 
                    text-align: left;
                    vertical-align: top;
                }
                table th {
                    background: #f0f0f0;
                    font-weight: bold;
                    text-align: center;
                    font-size: 9pt;
                }
                .label { 
                    font-weight: bold; 
                    background: #f5f5f5; 
                    width: 30%;
                    font-size: 9pt;
                }
                .text-right {
                    text-align: right;
                }
                .total { 
                    font-weight: bold; 
                    font-size: 10pt; 
                }
                .signature-section {
                    margin-top: 15px;
                    display: flex;
                    justify-content: space-around;
                }
                .signature-box {
                    text-align: center;
                    width: 150px;
                }
                .signature-box-title {
                    font-weight: bold;
                    margin-bottom: 40px;
                    font-size: 9pt;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PHIẾU TRÌNH ĐỀ XUẤT CHƯƠNG TRÌNH BÁN HÀNG</h1>
                <div class="header-info">
                    <div>Ngày <span id="print-day">${day}</span> tháng <span id="print-month">${month}</span> năm <span id="print-year">${year}</span></div>
                    <div>Số hợp đồng: <span id="print-contract-code"></span></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">I. THÔNG TIN KHÁCH HÀNG</div>
                <table>
                    <tr>
                        <td class="label">Tên khách hàng:</td>
                        <td id="print-customer"></td>
                    </tr>
                    <tr>
                        <td class="label">Địa chỉ:</td>
                        <td id="print-address"></td>
                    </tr>
                    <tr>
                        <td class="label">CMND/CCCD:</td>
                        <td id="print-cccd"></td>
                    </tr>
                    <tr>
                        <td class="label">Số điện thoại:</td>
                        <td id="print-phone"></td>
                    </tr>
                    <tr>
                        <td class="label">Email:</td>
                        <td id="print-email"></td>
                    </tr>
                    <tr>
                        <td class="label">Người đại diện (đối với tổ chức):</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="label">Chức vụ (nếu có):</td>
                        <td></td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">II. THÔNG TIN XE</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">STT</th>
                            <th style="width: 50%;">Mặt hàng</th>
                            <th style="width: 20%;">Số khung</th>
                            <th style="width: 25%;" class="text-right">Giá trị hợp đồng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: center;">1</td>
                            <td>
                                <div><strong>XE Ô TÔ CON</strong></div>
                                <div>Nhãn hiệu: <span id="print-car-brand">VinFast</span></div>
                                <div>Ký hiệu xe: <span id="print-car-model"></span><span id="print-car-version"></span></div>
                                <div>Màu sơn: <span id="print-car-color"></span></div>
                                <div>Số chỗ ngồi: 5</div>
                                <div>Năm SX: <span id="print-car-year">2025</span></div>
                            </td>
                            <td id="print-vin"></td>
                            <td class="text-right" id="print-contract-price"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="label">Tổng giá trị hợp đồng (A):</td>
                            <td class="text-right total" id="print-total-contract"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">III. CHI PHÍ BÁN HÀNG</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 25%;">Nội dung</th>
                            <th style="width: 50%;">Diễn giải chi tiết</th>
                            <th style="width: 25%;" class="text-right">Tổng giá trị quy đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="label">Giảm giá tiền mặt</td>
                            <td id="print-discount-details"></td>
                            <td class="text-right" id="print-discount-amount"></td>
                        </tr>
                        <tr>
                            <td class="label">Quà tặng</td>
                            <td id="print-gift-details"></td>
                            <td class="text-right" id="print-gift-amount"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" class="label">Tổng chi phí (B):</td>
                            <td class="text-right total" id="print-total-cost"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">IV. GIÁ TRỊ HỢP ĐỒNG SAU ƯU ĐÃI</div>
                <table>
                    <tr>
                        <td class="label" style="width: 70%;">(A) - (B):</td>
                        <td class="text-right total" id="print-final-price"></td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">V. PHÂN BỔ CHI PHÍ BÁN HÀNG</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40%;">Nội dung</th>
                            <th style="width: 20%;" class="text-right">Chi phí bán hàng (VNĐ)</th>
                            <th style="width: 20%;" class="text-right">Tỷ lệ (%)</th>
                            <th style="width: 20%;" class="text-right">Lương năng suất (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="label">Chi phí bán hàng</td>
                            <td class="text-right" id="print-sales-cost"></td>
                            <td class="text-right" id="print-cost-percentage"></td>
                            <td class="text-right" id="print-productivity-bonus"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">VI. YÊU CẦU KHÁC</div>
                <table>
                    <tr>
                        <td style="width: 30%;" class="label">Nội dung:</td>
                        <td id="print-other-requirements"></td>
                    </tr>
                    <tr>
                        <td class="label">Người thực hiện:</td>
                        <td id="print-requester"></td>
                    </tr>
                </table>
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-box-title">Ban Giám đốc</div>
                </div>
                <div class="signature-box">
                    <div class="signature-box-title">Kiểm soát</div>
                </div>
                <div class="signature-box">
                    <div class="signature-box-title">Kế toán</div>
                </div>
                <div class="signature-box">
                    <div class="signature-box-title">Phòng Kinh doanh</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    // Load data and fill template
    callAPI({
        action: 'get_request_detail',
        id,
        username: session.username
    }).then(res => {
        if (res.success && res.data) {
            const d = res.data;
            
            // Header
            printWindow.document.getElementById('print-contract-code').textContent = d.contract_code || '';
            
            // I. THÔNG TIN KHÁCH HÀNG
            printWindow.document.getElementById('print-customer').textContent = d.customer || '';
            printWindow.document.getElementById('print-address').textContent = d.address || '';
            printWindow.document.getElementById('print-cccd').textContent = d.cccd || '';
            printWindow.document.getElementById('print-phone').textContent = d.phone || '';
            printWindow.document.getElementById('print-email').textContent = d.email || '';
            
            // II. THÔNG TIN XE
            const carModelFull = (d.car_model || '') + (d.car_version ? ' ' + d.car_version : '');
            printWindow.document.getElementById('print-car-model').textContent = carModelFull;
            printWindow.document.getElementById('print-car-color').textContent = d.car_color || '';
            printWindow.document.getElementById('print-vin').textContent = d.vin_no || '';
            const contractPrice = (d.contract_price || '').replace(/[^\d]/g, '');
            printWindow.document.getElementById('print-contract-price').textContent = contractPrice ? Number(contractPrice).toLocaleString('vi-VN') : '0';
            printWindow.document.getElementById('print-total-contract').textContent = contractPrice ? Number(contractPrice).toLocaleString('vi-VN') : '0';
            
            // III. CHI PHÍ BÁN HÀNG
            printWindow.document.getElementById('print-discount-details').textContent = d.discount_details || '';
            const discountAmount = (d.discount_amount || '').replace(/[^\d]/g, '');
            printWindow.document.getElementById('print-discount-amount').textContent = discountAmount ? Number(discountAmount).toLocaleString('vi-VN') : '0';
            
            // Quà tặng - format từ gift_details
            const giftDetails = d.gift_details || '';
            printWindow.document.getElementById('print-gift-details').textContent = giftDetails || 'Không có';
            const giftAmount = (d.gift_amount || '').replace(/[^\d]/g, '');
            printWindow.document.getElementById('print-gift-amount').textContent = giftAmount ? Number(giftAmount).toLocaleString('vi-VN') : '0';
            
            // Tổng chi phí (B) = Giảm giá + Quà tặng
            const totalCost = (parseInt(discountAmount) || 0) + (parseInt(giftAmount) || 0);
            printWindow.document.getElementById('print-total-cost').textContent = totalCost.toLocaleString('vi-VN');
            
            // IV. GIÁ TRỊ HỢP ĐỒNG SAU ƯU ĐÃI
            const finalPrice = (d.final_price || '').replace(/[^\d]/g, '');
            printWindow.document.getElementById('print-final-price').textContent = finalPrice ? Number(finalPrice).toLocaleString('vi-VN') : '0';
            
            // V. PHÂN BỔ CHI PHÍ BÁN HÀNG
            const salesCost = totalCost; // Chi phí bán hàng = Tổng chi phí (B)
            const contractPriceNum = parseInt(contractPrice) || 0;
            const costPercentage = contractPriceNum > 0 ? ((salesCost / contractPriceNum) * 100).toFixed(2) : '0.00';
            const productivityBonus = (d.productivity_bonus || '').replace(/[^\d]/g, '');
            
            printWindow.document.getElementById('print-sales-cost').textContent = salesCost.toLocaleString('vi-VN');
            printWindow.document.getElementById('print-cost-percentage').textContent = costPercentage + '%';
            printWindow.document.getElementById('print-productivity-bonus').textContent = productivityBonus ? Number(productivityBonus).toLocaleString('vi-VN') : '';
            
            // VI. YÊU CẦU KHÁC
            printWindow.document.getElementById('print-other-requirements').textContent = d.other_requirements || '';
            // Hiển thị fullname thay vì username
            printWindow.document.getElementById('print-requester').textContent = d.requester_fullname || d.requester || '';
            
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            printWindow.close();
            Swal.fire('Lỗi', res.message || 'Không thể tải dữ liệu để in', 'error');
        }
    }).catch(error => {
        printWindow.close();
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    });
}

// ===================================
// PROFILE MANAGEMENT
// ===================================

async function loadProfile() {
    const form = $('form-profile');
    if (!form) return;
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        return;
    }

    const statusEl = $('profile-status');
    statusEl.textContent = 'Đang tải...';
    form.classList.add('opacity-70');

    try {
        const res = await callAPI({ action: 'get_profile', username: session.username });
        if (res.success && res.profile) {
            const profile = res.profile;
            $('profile_username').value = profile.username || '';
            $('profile_role').value = profile.role || '';
            $('profile_fullname').value = profile.fullname || '';
            $('profile_email').value = profile.email || '';
            $('profile_phone').value = profile.phone || '';
            $('profile_group').value = profile.group || '';
            statusEl.textContent = 'Đã tải dữ liệu.';
        } else {
            statusEl.textContent = res.message || 'Không thể tải hồ sơ.';
        }
    } catch (error) {
        console.error(error);
        statusEl.textContent = 'Lỗi kết nối.';
    } finally {
        form.classList.remove('opacity-70');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        return;
    }

    const statusEl = $('profile-status');
    statusEl.textContent = 'Đang lưu...';

    try {
        const res = await callAPI({
            action: 'update_profile',
            username: session.username,
            fullname: $('profile_fullname').value,
            email: $('profile_email').value,
            phone: $('profile_phone').value,
            group: $('profile_group').value
        });
        if (res.success) {
            statusEl.textContent = res.message || 'Đã lưu thay đổi.';
            const stored = getSession() || {};
            stored.fullname = $('profile_fullname').value;
            stored.email = $('profile_email').value;
            stored.phone = $('profile_phone').value;
            stored.group = $('profile_group').value;
            localStorage.setItem('user_session', JSON.stringify(stored));
            $('user-fullname').textContent = stored.fullname || 'User';
        } else {
            statusEl.textContent = res.message || 'Lưu thất bại.';
        }
    } catch (error) {
        console.error(error);
        statusEl.textContent = 'Lỗi kết nối.';
    }
}

// ===================================
// USER MANAGEMENT (ADMIN)
// ===================================

async function loadUserManagement() {
    const container = $('user-list-container');
    if (!container) return;
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
        container.innerHTML = '<div class="text-center text-red-500 py-6">Chỉ ADMIN mới được truy cập chức năng này.</div>';
        return;
    }

    container.innerHTML = '<div class="text-center text-gray-500 py-6"><i class="fa-solid fa-spinner fa-spin text-xl mb-2"></i><p>Đang tải danh sách...</p></div>';

    try {
        const res = await callAPI({ action: 'list_users', username: session.username, role: session.role });
        if (res.success) {
            cachedUsers = res.users || [];
            container.innerHTML = renderUserTable(cachedUsers);
        } else {
            container.innerHTML = `<div class="text-center text-red-500 py-6">${res.message || 'Không thể tải danh sách người dùng.'}</div>`;
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="text-center text-red-500 py-6">Lỗi kết nối đến server.</div>';
    }
}

function renderUserTable(users) {
    if (!users.length) {
        return '<div class="text-center text-gray-500 py-6">Chưa có người dùng nào.</div>';
    }

    let rows = users.map(user => {
        const encoded = encodeURIComponent(user.username);
        return `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="py-2 px-3 font-mono">${user.username}</td>
                <td class="py-2 px-3">${user.fullname || ''}</td>
                <td class="py-2 px-3 font-bold">${user.role || ''}</td>
                <td class="py-2 px-3">${user.email || ''}</td>
                <td class="py-2 px-3">${user.phone || ''}</td>
                <td class="py-2 px-3">${user.group || ''}</td>
                <td class="py-2 px-3">
                    <span class="px-2 py-1 text-xs rounded ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
                        ${user.active ? 'Đang hoạt động' : 'Bị khóa'}
                    </span>
                </td>
                <td class="py-2 px-3 space-x-2">
                    <button onclick="openEditUserModal('${encoded}')" class="text-blue-600 hover:text-blue-800 text-xs font-semibold">Sửa</button>
                    <button onclick="openUserPermissionsModal('${user.username}')" class="text-purple-600 hover:text-purple-800 text-xs font-semibold">
                        <i class="fa-solid fa-key mr-1"></i>Quyền
                    </button>
                    <button onclick="resetUserPasswordPrompt('${encoded}')" class="text-red-600 hover:text-red-800 text-xs font-semibold">Reset MK</button>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div class="overflow-x-auto">
            <table class="min-w-full text-left">
                <thead class="bg-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th class="py-2 px-3">Username</th>
                        <th class="py-2 px-3">Họ tên</th>
                        <th class="py-2 px-3">Vai trò</th>
                        <th class="py-2 px-3">Email</th>
                        <th class="py-2 px-3">SĐT</th>
                        <th class="py-2 px-3">Nhóm</th>
                        <th class="py-2 px-3">Trạng thái</th>
                        <th class="py-2 px-3">Hành động</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

async function handleCreateUser(e) {
    e.preventDefault();
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
        Swal.fire('Lỗi', 'Bạn không có quyền thực hiện thao tác này', 'error');
        return;
    }
    const form = e.target;
    const statusEl = $('create-user-status');
    statusEl.textContent = 'Đang tạo người dùng...';

    const payload = {
        action: 'create_user',
        username: session.username,
        role: session.role,
        new_username: form.new_username.value.trim(),
        new_fullname: form.new_fullname.value.trim(),
        new_role: form.new_role.value.trim(),
        new_group: form.new_group.value.trim(),
        new_email: form.new_email.value.trim(),
        new_phone: form.new_phone.value.trim(),
        new_password: form.new_password.value.trim()
    };

    try {
        const res = await callAPI(payload);
        if (res.success) {
            statusEl.textContent = res.message || 'Đã tạo người dùng.';
            form.reset();
            loadUserManagement();
        } else {
            statusEl.textContent = res.message || 'Không thể tạo người dùng.';
        }
    } catch (error) {
        console.error(error);
        statusEl.textContent = 'Lỗi kết nối.';
    }
}

async function openEditUserModal(encodedUsername) {
    const username = decodeURIComponent(encodedUsername);
    const target = cachedUsers.find(u => u.username === username);
    if (!target) {
        Swal.fire('Lỗi', 'Không tìm thấy người dùng', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: `Chỉnh sửa: ${username}`,
        html: `
            <div class="text-left space-y-3">
                <div>
                    <label class="text-xs font-semibold text-gray-500">Họ tên</label>
                    <input id="swal-fullname" class="swal2-input" value="${target.fullname || ''}">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500">Vai trò</label>
                    <select id="swal-role" class="swal2-input">
                        ${['TVBH','TPKD','GDKD','BKS','BGD','KETOAN','ADMIN'].map(role => `<option value="${role}" ${target.role === role ? 'selected' : ''}>${role}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500">Nhóm</label>
                    <input id="swal-group" class="swal2-input" value="${target.group || ''}">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500">Email</label>
                    <input id="swal-email" class="swal2-input" value="${target.email || ''}">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-500">Số điện thoại</label>
                    <input id="swal-phone" class="swal2-input" value="${target.phone || ''}">
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <input type="checkbox" id="swal-active" ${target.active ? 'checked' : ''}>
                    <label for="swal-active">Đang hoạt động</label>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
            return {
                fullname: document.getElementById('swal-fullname').value.trim(),
                role: document.getElementById('swal-role').value,
                group: document.getElementById('swal-group').value.trim(),
                email: document.getElementById('swal-email').value.trim(),
                phone: document.getElementById('swal-phone').value.trim(),
                active: document.getElementById('swal-active').checked
            };
        }
    });

    if (!formValues) return;

    const session = getSession();
    try {
        const res = await callAPI({
            action: 'update_user',
            username: session.username,
            role: session.role,
            target_username: username,
            fullname: formValues.fullname,
            user_role: formValues.role,
            group: formValues.group,
            email: formValues.email,
            phone: formValues.phone,
            active: formValues.active
        });
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã cập nhật người dùng', 'success');
            loadUserManagement();
        } else {
            Swal.fire('Lỗi', res.message || 'Không thể cập nhật người dùng', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
    }
}

async function resetUserPasswordPrompt(encodedUsername) {
    const username = decodeURIComponent(encodedUsername);
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
        Swal.fire('Lỗi', 'Bạn không có quyền thực hiện thao tác này', 'error');
        return;
    }

    const { value: newPass } = await Swal.fire({
        title: `Reset mật khẩu cho ${username}`,
        input: 'text',
        inputLabel: 'Nhập mật khẩu mới (để trống = 123456)',
        showCancelButton: true,
        confirmButtonText: 'Reset',
        cancelButtonText: 'Hủy'
    });

    if (newPass === undefined) return;

    try {
        const res = await callAPI({
            action: 'reset_user_password',
            username: session.username,
            role: session.role,
            target_username: username,
            new_password: newPass
        });
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã reset mật khẩu', 'success');
        } else {
            Swal.fire('Lỗi', res.message || 'Không thể reset mật khẩu', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
    }
}

async function saveCompletedRequestInfo(id) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    const contractCodeInput = $('detail-contract-code');
    const vinNoInput = $('detail-vin-no');
    
    if (!contractCodeInput && !vinNoInput) {
        Swal.fire('Lỗi', 'Không tìm thấy các trường cần cập nhật', 'error');
        return;
    }
    
    const contractCode = contractCodeInput ? contractCodeInput.value.trim() : '';
    const vinNo = vinNoInput ? vinNoInput.value.trim() : '';
    
    try {
        Swal.fire({
            title: 'Đang lưu...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const res = await callAPI({
            action: 'update_request',
            id,
            username: session.username,
            role: session.role,
            contract_code: contractCode,
            vin_no: vinNo
        });
        
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã cập nhật thông tin thành công', 'success');
            // Reload detail to reflect changes
            const currentDetailJson = $('modal-detail-body').dataset.json;
            if (currentDetailJson) {
                openDetail(currentDetailJson);
            } else {
                if (typeof loadApprovalList === 'function') loadApprovalList();
            }
        } else {
            Swal.fire('Lỗi', res.message || 'Cập nhật thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in saveCompletedRequestInfo:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

async function saveProductivityBonus(id) {
    const session = getSession();
    if (!session) {
        Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error');
        logout();
        return;
    }
    
    const productivityBonusInput = $('detail-productivity-bonus');
    
    if (!productivityBonusInput) {
        Swal.fire('Lỗi', 'Không tìm thấy trường lương năng suất', 'error');
        return;
    }
    
    // Lấy giá trị và loại bỏ dấu phân cách nghìn
    const productivityBonusRaw = productivityBonusInput.value.replace(/\./g, '').trim();
    
    if (!productivityBonusRaw) {
        Swal.fire('Lỗi', 'Vui lòng nhập lương năng suất', 'error');
        return;
    }
    
    // Format lại để hiển thị trong log
    const productivityBonusFormatted = Number(productivityBonusRaw).toLocaleString('vi-VN') + ' VNĐ';
    
    try {
        Swal.fire({
            title: 'Đang lưu...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const res = await callAPI({
            action: 'update_productivity_bonus',
            id,
            username: session.username,
            role: session.role,
            productivity_bonus: productivityBonusRaw,
            productivity_bonus_formatted: productivityBonusFormatted
        });
        
        if (res.success) {
            Swal.fire('Thành công', res.message || 'Đã cập nhật lương năng suất thành công', 'success');
            // Reload detail to reflect changes
            const currentDetailJson = $('modal-detail-body').dataset.json;
            if (currentDetailJson) {
                openDetail(currentDetailJson);
            } else {
                loadApprovalList(); // Fallback
            }
        } else {
            Swal.fire('Lỗi', res.message || 'Cập nhật thất bại', 'error');
        }
    } catch (error) {
        console.error('Error in saveProductivityBonus:', error);
        Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
    }
}

// ===================================
// API CALLER - ĐÃ CHUYỂN SANG SUPABASE
// ===================================
// Function callAPI đã được migrate sang Supabase trong js/api.js
// Không cần định nghĩa lại ở đây, sẽ dùng function từ js/api.js

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
