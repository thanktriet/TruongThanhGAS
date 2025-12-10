/**
 * Sales Policies Management
 * Quản lý chính sách bán hàng cho HĐMB
 */

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
}

function withTimeout(promise, timeoutMs, errorMsg) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
        )
    ]);
}

// ======================================================
// LOAD SALES POLICIES LIST
// ======================================================

let hasLoadedPolicies = false;

async function loadSalesPoliciesList() {
    console.log('[Sales Policies] loadSalesPoliciesList called, hasLoadedPolicies:', hasLoadedPolicies);
    
    const container = document.getElementById('sales-policies-list');
    if (!container) {
        console.error('[Sales Policies] Container not found');
        return;
    }

    if (hasLoadedPolicies) {
        console.log('[Sales Policies] Already loaded, skipping');
        return;
    }

    console.log('[Sales Policies] Loading list...');
    container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p class="text-sm md:text-base">Đang tải danh sách...</p></div>';

    try {
        if (typeof window.callAPI !== 'function') {
            throw new Error('callAPI function not found');
        }

        console.log('[Sales Policies] Calling API with action: list_sales_policies');
        const result = await withTimeout(
            window.callAPI({ action: 'list_sales_policies' }),
            10000,
            'API call timeout sau 10 giây'
        );

        console.log('[Sales Policies] API result:', result);

        if (result && result.success && Array.isArray(result.data)) {
            console.log('[Sales Policies] Loaded', result.data.length, 'policies');
            renderSalesPoliciesList(result.data);
            hasLoadedPolicies = true;
        } else {
            console.error('[Sales Policies] API error:', result?.message || 'Không thể tải danh sách');
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i>
                    <p class="font-bold">${escapeHtml(result?.message || 'Không thể tải danh sách')}</p>
                    <button onclick="if(typeof window.loadSalesPoliciesList === 'function') window.loadSalesPoliciesList();" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Thử lại
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('[Sales Policies] Error:', error);
        const containerCheck = document.getElementById('sales-policies-list');
        if (containerCheck) {
            containerCheck.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i>
                    <p class="font-bold">Lỗi: ${escapeHtml(error.message)}</p>
                    <button onclick="if(typeof window.loadSalesPoliciesList === 'function') window.loadSalesPoliciesList();" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Thử lại
                    </button>
                </div>
            `;
        }
    }
}

// ======================================================
// RENDER SALES POLICIES LIST
// ======================================================

function renderSalesPoliciesList(policies) {
    console.log('[Sales Policies] renderSalesPoliciesList called with', policies ? policies.length : 0, 'policies');
    
    const container = document.getElementById('sales-policies-list');
    if (!container) {
        console.error('[Sales Policies] Container not found in renderSalesPoliciesList');
        return;
    }

    if (!Array.isArray(policies) || policies.length === 0) {
        console.warn('[Sales Policies] No policies to render');
        container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-inbox text-2xl mb-2"></i><p class="text-sm md:text-base">Chưa có chính sách nào</p><p class="text-xs mt-2">Vui lòng thêm chính sách mới</p></div>';
        return;
    }

    let html = '';
    
    try {
        policies.forEach((policy, index) => {
            try {
                if (!policy || !policy.id) {
                    console.warn('[Sales Policies] Invalid policy at index', index, policy);
                    return;
                }
                
                const policyId = policy.id;
                const policyName = escapeHtml(policy.name || '');
                const policyDesc = escapeHtml(policy.description || '');
                const displayOrder = policy.display_order || 0;
                const isActive = policy.is_active !== false;
                const validFrom = policy.valid_from || '';
                const validTo = policy.valid_to || '';
                const createdBy = escapeHtml(policy.created_by || '');
                const createdAt = formatDate(policy.created_at);

                // Dùng string concatenation thay template literal để tránh conflicts
                html += '<div class="border border-gray-200 rounded-lg p-3 md:p-4 bg-white hover:shadow-md transition" data-id="' + policyId + '">';
                html += '<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">';
                html += '<div class="flex-1 space-y-3">';
                html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">';
                html += '<div><label class="text-xs text-gray-500 uppercase mb-1 block">Tên chính sách</label>';
                html += '<input type="text" class="input text-sm md:text-base w-full policy-name" value="' + policyName + '" data-id="' + policyId + '" data-field="name" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">';
                html += '</div>';
                html += '<div><label class="text-xs text-gray-500 uppercase mb-1 block">Thứ tự hiển thị</label>';
                html += '<input type="number" class="input text-sm md:text-base w-full policy-order" value="' + displayOrder + '" min="0" data-id="' + policyId + '" data-field="display_order" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">';
                html += '</div></div>';
                html += '<div><label class="text-xs text-gray-500 uppercase mb-1 block">Mô tả đầy đủ</label>';
                html += '<textarea class="input text-sm md:text-base w-full policy-description" rows="2" data-id="' + policyId + '" data-field="description" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">' + policyDesc + '</textarea>';
                html += '</div>';
                html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-3">';
                html += '<div><label class="text-xs text-gray-500 uppercase mb-1 block">Ngày bắt đầu</label>';
                html += '<input type="date" class="input text-sm md:text-base w-full policy-valid-from" value="' + validFrom + '" data-id="' + policyId + '" data-field="valid_from" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">';
                html += '</div>';
                html += '<div><label class="text-xs text-gray-500 uppercase mb-1 block">Ngày kết thúc</label>';
                html += '<input type="date" class="input text-sm md:text-base w-full policy-valid-to" value="' + validTo + '" data-id="' + policyId + '" data-field="valid_to" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">';
                html += '</div>';
                html += '<div class="flex items-end"><label class="flex items-center gap-2 cursor-pointer">';
                html += '<input type="checkbox" class="policy-active w-4 h-4 text-orange-600 rounded" ' + (isActive ? 'checked' : '') + ' data-id="' + policyId + '" data-field="is_active" onchange="if(typeof window.handleUpdateSalesPolicyField === \'function\') window.handleUpdateSalesPolicyField(this);">';
                html += '<span class="text-xs md:text-sm font-medium">' + (isActive ? 'Đang áp dụng' : 'Tạm ngưng') + '</span>';
                html += '</label></div></div>';
                html += '<div class="text-xs text-gray-400">';
                html += createdBy ? 'Tạo bởi: ' + createdBy : '';
                html += createdAt ? ' • ' + createdAt : '';
                html += '</div></div>';
                html += '<div class="md:ml-4">';
                html += '<button type="button" class="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition font-semibold touch-manipulation text-sm md:text-base" data-id="' + policyId + '" data-name="' + policyName + '" onclick="if(typeof window.handleDeleteSalesPolicyClick === \'function\') window.handleDeleteSalesPolicyClick(this);">';
                html += '<i class="fa-solid fa-trash mr-2"></i>Xóa</button>';
                html += '</div></div></div>';
            } catch (policyError) {
                console.error('[Sales Policies] Error rendering policy at index', index, policyError, policy);
            }
        });

        console.log('[Sales Policies] Generated HTML length:', html.length);
        container.innerHTML = html;
        console.log('[Sales Policies] Rendered', policies.length, 'policies successfully');
        
        // Verify DOM
        const renderedItems = container.querySelectorAll('[data-id]');
        console.log('[Sales Policies] Found', renderedItems.length, 'policies in DOM after render');
    } catch (renderError) {
        console.error('[Sales Policies] Error in render function:', renderError);
        container.innerHTML = '<div class="text-center py-8 text-red-500"><i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i><p class="font-bold">Lỗi render: ' + escapeHtml(renderError.message) + '</p></div>';
    }
}

// ======================================================
// CREATE SALES POLICY
// ======================================================

async function handleCreateSalesPolicy(event) {
    event.preventDefault();

    const nameInput = document.getElementById('new-policy-name');
    const descInput = document.getElementById('new-policy-description');
    const orderInput = document.getElementById('new-policy-order');
    const validFromInput = document.getElementById('new-policy-valid-from');
    const validToInput = document.getElementById('new-policy-valid-to');
    const activeInput = document.getElementById('new-policy-active');
    const statusDiv = document.getElementById('create-policy-status');

    if (!nameInput || !descInput) return;

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (!name || !description) {
        if (statusDiv) {
            statusDiv.className = 'text-xs md:text-sm text-red-500 mt-2';
            statusDiv.textContent = 'Vui lòng nhập đầy đủ thông tin';
        }
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang thêm...';
    }

    if (statusDiv) {
        statusDiv.className = 'text-xs md:text-sm text-gray-500 mt-2';
        statusDiv.textContent = 'Đang xử lý...';
    }

    try {
        const result = await window.callAPI({
            action: 'create_sales_policy',
            name: name,
            description: description,
            display_order: parseInt(orderInput?.value) || 0,
            is_active: activeInput?.checked !== false,
            valid_from: validFromInput?.value || null,
            valid_to: validToInput?.value || null
        });

        if (result && result.success) {
            if (statusDiv) {
                statusDiv.className = 'text-xs md:text-sm text-green-500 mt-2';
                statusDiv.textContent = 'Đã thêm chính sách thành công!';
            }
            
            // Reset form
            if (nameInput) nameInput.value = '';
            if (descInput) descInput.value = '';
            if (orderInput) orderInput.value = '0';
            if (validFromInput) validFromInput.value = '';
            if (validToInput) validToInput.value = '';
            if (activeInput) activeInput.checked = true;
            
            // Reload list
            hasLoadedPolicies = false;
            setTimeout(() => {
                loadSalesPoliciesList();
                if (statusDiv) statusDiv.textContent = '';
            }, 1000);
        } else {
            if (statusDiv) {
                statusDiv.className = 'text-xs md:text-sm text-red-500 mt-2';
                statusDiv.textContent = 'Lỗi: ' + (result?.message || 'Không thể thêm chính sách');
            }
        }
    } catch (error) {
        console.error('[Sales Policies] Error creating:', error);
        if (statusDiv) {
            statusDiv.className = 'text-xs md:text-sm text-red-500 mt-2';
            statusDiv.textContent = 'Lỗi: ' + error.message;
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Thêm Chính Sách';
        }
    }
}

// ======================================================
// UPDATE SALES POLICY FIELD
// ======================================================

async function handleUpdateSalesPolicyField(element) {
    const policyId = element.getAttribute('data-id');
    const field = element.getAttribute('data-field');
    
    if (!policyId || !field) {
        console.error('[Sales Policies] Missing data attributes');
        return;
    }

    let value;
    if (element.type === 'checkbox') {
        value = element.checked;
    } else {
        value = element.value;
        if (field === 'display_order') {
            value = parseInt(value) || 0;
        }
    }

    try {
        const updateData = { id: policyId };
        updateData[field] = value;

        const result = await window.callAPI({
            action: 'update_sales_policy',
            ...updateData
        });

        if (result && result.success) {
            if (typeof window.showToast === 'function') {
                window.showToast('Đã cập nhật thành công', 'success');
            }
        } else {
            // Revert change
            if (element.type === 'checkbox') {
                element.checked = !value;
            } else {
                // Need to get old value from data attribute or reload
                hasLoadedPolicies = false;
                loadSalesPoliciesList();
            }
            if (typeof window.showToast === 'function') {
                window.showToast('Lỗi: ' + (result?.message || 'Không thể cập nhật'), 'danger');
            }
        }
    } catch (error) {
        console.error('[Sales Policies] Error updating:', error);
        // Revert
        if (element.type === 'checkbox') {
            element.checked = !value;
        }
    }
}

// ======================================================
// DELETE SALES POLICY
// ======================================================

async function handleDeleteSalesPolicyClick(element) {
    const policyId = element.getAttribute('data-id');
    const policyName = element.getAttribute('data-name') || 'chính sách này';

    if (!policyId) {
        console.error('[Sales Policies] Missing policy ID');
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa chính sách "${policyName}"?`)) {
        return;
    }

    const originalText = element.innerHTML;
    element.disabled = true;
    element.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang xóa...';

    try {
        const result = await window.callAPI({
            action: 'delete_sales_policy',
            id: policyId
        });

        if (result && result.success) {
            if (typeof window.showToast === 'function') {
                window.showToast('Đã xóa chính sách thành công', 'success');
            }
            hasLoadedPolicies = false;
            loadSalesPoliciesList();
        } else {
            element.disabled = false;
            element.innerHTML = originalText;
            if (typeof window.showToast === 'function') {
                window.showToast('Lỗi: ' + (result?.message || 'Không thể xóa'), 'danger');
            }
        }
    } catch (error) {
        console.error('[Sales Policies] Error deleting:', error);
        element.disabled = false;
        element.innerHTML = originalText;
        if (typeof window.showToast === 'function') {
            window.showToast('Lỗi: ' + error.message, 'danger');
        }
    }
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.loadSalesPoliciesList = loadSalesPoliciesList;
    window.renderSalesPoliciesList = renderSalesPoliciesList;
    window.handleCreateSalesPolicy = handleCreateSalesPolicy;
    window.handleUpdateSalesPolicyField = handleUpdateSalesPolicyField;
    window.handleDeleteSalesPolicyClick = handleDeleteSalesPolicyClick;
}

// Initialize
if (typeof window !== 'undefined') {
    console.log('[Sales Policies] Initializing...');
    
    // Check and load when tab becomes active
    const checkAndLoadPolicies = () => {
        const tab = document.getElementById('tab-sales-policies');
        console.log('[Sales Policies] Checking tab...', {
            tabExists: !!tab,
            isActive: tab?.classList.contains('active'),
            hasLoadedPolicies: hasLoadedPolicies
        });
        
        if (tab && tab.classList.contains('active') && !hasLoadedPolicies) {
            console.log('[Sales Policies] Tab is active, loading...');
            hasLoadedPolicies = true;
            loadSalesPoliciesList();
        } else if (tab && !tab.classList.contains('active')) {
            hasLoadedPolicies = false; // Reset when tab is not active
        }
    };

    // Try immediately after a delay
    setTimeout(() => {
        console.log('[Sales Policies] Initial check...');
        checkAndLoadPolicies();
    }, 1000);

    // Also listen for tab switches
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'tab-sales-policies' || target.querySelector('#tab-sales-policies')) {
                    console.log('[Sales Policies] Tab class changed, checking...');
                    setTimeout(checkAndLoadPolicies, 100);
                }
            }
        });
    });

    // Setup observer
    const setupObserver = () => {
        const container = document.querySelector('.tab-content');
        const tabsContainer = document.getElementById('tabs-container');
        
        let targetElement = null;
        if (container && container.parentElement) {
            targetElement = container.parentElement;
        } else if (tabsContainer && tabsContainer.parentElement) {
            targetElement = tabsContainer.parentElement;
        } else if (tabsContainer) {
            targetElement = tabsContainer;
        }
        
        if (targetElement) {
            console.log('[Sales Policies] Setting up MutationObserver');
            observer.observe(targetElement, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true
            });
        } else {
            if (!window._salesPoliciesObserverRetries) {
                window._salesPoliciesObserverRetries = 0;
            }
            if (window._salesPoliciesObserverRetries < 5) {
                window._salesPoliciesObserverRetries++;
                console.warn(`[Sales Policies] Container not found, retrying... (${window._salesPoliciesObserverRetries}/5)`);
                setTimeout(setupObserver, 1000);
            }
        }
    };

    // Setup observer after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(setupObserver, 1000);
        });
    } else {
        setTimeout(setupObserver, 1000);
    }

    console.log('[Sales Policies] Initialization complete');
}

