/**
 * Car Models Management
 * Quản lý dòng xe cho báo cáo
 */

// ======================================================
// LOAD CAR MODELS LIST
// ======================================================

async function loadCarModelsList() {
    const container = document.getElementById('car-models-list');
    if (!container) {
        console.error('car-models-list container not found');
        return;
    }

    console.log('[Car Models] Loading list...');
    container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Đang tải danh sách...</p></div>';

    try {
        if (typeof window.callAPI !== 'function') {
            throw new Error('callAPI function not found');
        }

        const result = await window.callAPI({
            action: 'list_car_models'
        });

        console.log('[Car Models] API result:', result);

        if (result && result.success && Array.isArray(result.data)) {
            console.log('[Car Models] Rendering', result.data.length, 'items');
            renderCarModelsList(result.data);
        } else {
            const errorMsg = result?.message || 'Không thể tải danh sách';
            console.error('[Car Models] Error:', errorMsg);
            showError(container, errorMsg);
        }
    } catch (error) {
        console.error('[Car Models] Error loading:', error);
        showError(container, error.message || 'Không thể tải danh sách');
    }
}

// ======================================================
// RENDER CAR MODELS LIST
// ======================================================

function renderCarModelsList(carModels) {
    const container = document.getElementById('car-models-list');
    if (!container) return;

    if (!Array.isArray(carModels) || carModels.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-inbox text-2xl mb-2"></i><p>Chưa có dòng xe nào</p><p class="text-xs mt-2">Vui lòng thêm dòng xe mới</p></div>';
        return;
    }

    let html = '';
    carModels.forEach(model => {
        const modelId = model.id || '';
        const modelName = escapeHtml(model.name || '');
        const displayOrder = model.display_order || 0;
        const isActive = model.is_active !== false;
        const createdBy = escapeHtml(model.created_by || '');
        const createdAt = formatDate(model.created_at);

        html += `
            <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition" data-id="${modelId}">
                <div class="flex items-center justify-between">
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="text-xs text-gray-500 uppercase">Tên dòng xe</label>
                            <input 
                                type="text" 
                                class="input mt-1 car-model-name" 
                                value="${modelName}" 
                                data-model-id="${modelId}"
                                data-field="name"
                                onchange="handleUpdateCarModelField(this)"
                            >
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 uppercase">Thứ tự hiển thị</label>
                            <input 
                                type="number" 
                                class="input mt-1 car-model-order" 
                                value="${displayOrder}" 
                                min="0"
                                data-model-id="${modelId}"
                                data-field="display_order"
                                onchange="handleUpdateCarModelField(this)"
                            >
                        </div>
                        <div class="flex items-end">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    class="car-model-active w-4 h-4 text-purple-600 rounded" 
                                    ${isActive ? 'checked' : ''}
                                    data-model-id="${modelId}"
                                    data-field="is_active"
                                    onchange="handleUpdateCarModelField(this)"
                                >
                                <span class="text-sm font-medium">${isActive ? 'Đang sử dụng' : 'Tạm ngưng'}</span>
                            </label>
                        </div>
                    </div>
                    <div class="ml-4">
                        <button 
                            type="button"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                            data-model-id="${modelId}"
                            data-model-name="${modelName}"
                            onclick="handleDeleteCarModelClick(this)"
                        >
                            <i class="fa-solid fa-trash mr-2"></i>Xóa
                        </button>
                    </div>
                </div>
                <div class="mt-2 text-xs text-gray-400">
                    ${createdBy ? `Tạo bởi: ${createdBy}` : ''}
                    ${createdAt ? ` • ${createdAt}` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('[Car Models] Rendered', carModels.length, 'items');
}

// ======================================================
// CREATE CAR MODEL
// ======================================================

async function handleCreateCarModel(event) {
    event.preventDefault();

    const nameInput = document.getElementById('new-car-model-name');
    const orderInput = document.getElementById('new-car-model-order');
    const activeInput = document.getElementById('new-car-model-active');
    const statusDiv = document.getElementById('create-car-model-status');

    if (!nameInput || !orderInput || !activeInput || !statusDiv) {
        console.error('[Car Models] Form elements not found');
        return;
    }

    const name = nameInput.value.trim();
    if (!name) {
        statusDiv.className = 'text-sm text-red-500 mt-2';
        statusDiv.textContent = 'Vui lòng nhập tên dòng xe';
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang thêm...';
    }

    statusDiv.className = 'text-sm text-gray-500 mt-2';
    statusDiv.textContent = 'Đang xử lý...';

    try {
        const result = await window.callAPI({
            action: 'create_car_model',
            name: name,
            display_order: parseInt(orderInput.value) || 0,
            is_active: activeInput.checked
        });

        if (result && result.success) {
            statusDiv.className = 'text-sm text-green-500 mt-2';
            statusDiv.textContent = 'Đã thêm dòng xe thành công!';
            
            // Reset form
            nameInput.value = '';
            orderInput.value = '0';
            activeInput.checked = true;
            
            // Reload list
            setTimeout(() => {
                loadCarModelsList();
                statusDiv.textContent = '';
            }, 1000);
        } else {
            statusDiv.className = 'text-sm text-red-500 mt-2';
            statusDiv.textContent = 'Lỗi: ' + (result?.message || 'Không thể thêm dòng xe');
        }
    } catch (error) {
        console.error('[Car Models] Error creating:', error);
        statusDiv.className = 'text-sm text-red-500 mt-2';
        statusDiv.textContent = 'Lỗi: ' + error.message;
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Thêm';
        }
    }
}

// ======================================================
// UPDATE CAR MODEL FIELD
// ======================================================

async function handleUpdateCarModelField(input) {
    const modelId = input.dataset.modelId;
    const field = input.dataset.field;
    
    if (!modelId || !field) {
        console.error('[Car Models] Missing modelId or field');
        return;
    }

    let value;
    if (field === 'is_active') {
        value = input.checked;
    } else if (field === 'display_order') {
        value = parseInt(input.value) || 0;
    } else {
        value = input.value.trim();
    }

    try {
        const result = await window.callAPI({
            action: 'update_car_model',
            id: modelId,
            [field]: value
        });

        if (result && result.success) {
            if (typeof window.showToast === 'function') {
                window.showToast('Đã cập nhật thành công', 'success');
            }
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('Lỗi: ' + (result?.message || 'Không thể cập nhật'), 'danger');
            }
            // Reload để reset giá trị
            loadCarModelsList();
        }
    } catch (error) {
        console.error('[Car Models] Error updating:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Lỗi: ' + error.message, 'danger');
        }
        // Reload để reset giá trị
        loadCarModelsList();
    }
}

// ======================================================
// DELETE CAR MODEL
// ======================================================

function handleDeleteCarModelClick(button) {
    const modelId = button.dataset.modelId;
    const modelName = button.dataset.modelName || '';

    if (!modelId) {
        console.error('[Car Models] Missing modelId');
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa dòng xe "${modelName}"?\n\nLưu ý: Hành động này không thể hoàn tác!`)) {
        return;
    }

    deleteCarModel(modelId);
}

async function deleteCarModel(modelId) {
    try {
        const result = await window.callAPI({
            action: 'delete_car_model',
            id: modelId
        });

        if (result && result.success) {
            if (typeof window.showToast === 'function') {
                window.showToast('Đã xóa dòng xe thành công', 'success');
            }
            // Reload list
            loadCarModelsList();
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('Lỗi: ' + (result?.message || 'Không thể xóa'), 'danger');
            }
        }
    } catch (error) {
        console.error('[Car Models] Error deleting:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Lỗi: ' + error.message, 'danger');
        }
    }
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

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
        if (isNaN(date.getTime())) {
            console.warn('[formatDate] Invalid date:', dateString);
            return '-';
        }
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.warn('[formatDate] Date format error:', e, 'value:', dateString);
        return '-';
    }
}

function showError(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-8 text-red-500">
            <i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i>
            <p class="font-bold">Lỗi: ${escapeHtml(message)}</p>
            <p class="text-sm mt-2">Vui lòng mở Console (F12) để xem chi tiết</p>
            <button 
                type="button"
                onclick="loadCarModelsList()" 
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                <i class="fa-solid fa-rotate mr-2"></i>Thử lại
            </button>
        </div>
    `;
}

// ======================================================
// INITIALIZATION
// ======================================================

// Expose functions globally
if (typeof window !== 'undefined') {
    window.loadCarModelsList = loadCarModelsList;
    window.renderCarModelsList = renderCarModelsList;
    window.handleCreateCarModel = handleCreateCarModel;
    window.handleUpdateCarModelField = handleUpdateCarModelField;
    window.handleDeleteCarModelClick = handleDeleteCarModelClick;
    window.deleteCarModel = deleteCarModel;
    
    console.log('[Car Models] Functions exposed to window');
}

// Auto load when tab is shown
if (typeof window !== 'undefined') {
    let hasLoaded = false;
    
    // Check and load when tab becomes active
    const checkAndLoad = () => {
        const tab = document.getElementById('tab-car-models');
        console.log('[Car Models] Checking tab...', {
            tabExists: !!tab,
            isActive: tab?.classList.contains('active'),
            hasLoaded: hasLoaded
        });
        
        if (tab && tab.classList.contains('active') && !hasLoaded) {
            console.log('[Car Models] Tab is active, loading...');
            hasLoaded = true;
            loadCarModelsList();
        } else if (tab && !tab.classList.contains('active')) {
            hasLoaded = false; // Reset khi tab không active
        }
    };

    // Try immediately after a delay
    setTimeout(() => {
        console.log('[Car Models] Initial check...');
        checkAndLoad();
    }, 1000);

    // Also listen for tab switches
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'tab-car-models' || target.querySelector('#tab-car-models')) {
                    console.log('[Car Models] Tab class changed, checking...');
                    setTimeout(checkAndLoad, 100);
                }
            }
        });
    });

    // Setup observer
    const setupObserver = () => {
        const container = document.querySelector('.tab-content');
        const tabsContainer = document.getElementById('tabs-container');
        
        // Try to find container - check multiple possible locations
        let targetElement = null;
        if (container && container.parentElement) {
            targetElement = container.parentElement;
        } else if (tabsContainer && tabsContainer.parentElement) {
            targetElement = tabsContainer.parentElement;
        } else if (tabsContainer) {
            targetElement = tabsContainer;
        }
        
        if (targetElement) {
            console.log('[Car Models] Setting up MutationObserver on:', targetElement.id || targetElement.className);
            observer.observe(targetElement, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true
            });
        } else {
            // Only retry a few times to avoid infinite loop
            if (!window._carModelsObserverRetries) {
                window._carModelsObserverRetries = 0;
            }
            if (window._carModelsObserverRetries < 5) {
                window._carModelsObserverRetries++;
                console.warn(`[Car Models] Container not found, retrying... (${window._carModelsObserverRetries}/5)`);
                setTimeout(setupObserver, 1000);
            } else {
                console.warn('[Car Models] Container not found after 5 retries, observer not set up');
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

    console.log('[Car Models] Initialization complete');
}

