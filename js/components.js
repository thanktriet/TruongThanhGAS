/**
 * Component Loader
 * Loads HTML components dynamically
 */

async function loadComponent(componentName, targetElementId) {
    try {
        // Add cache-busting query parameter to ensure fresh content
        const cacheBuster = `?v=${Date.now()}`;
        const response = await fetch(`components/${componentName}.html${cacheBuster}`, {
            cache: 'no-store'
        });
        if (!response.ok) {
            console.error(`Failed to load component: ${componentName}`);
            return;
        }
        const html = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            // Extract scripts from HTML before inserting (scripts won't execute in inserted HTML)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const scripts = tempDiv.querySelectorAll('script');
            const scriptsToExecute = [];
            
            // Remove scripts from HTML and save them
            scripts.forEach(script => {
                scriptsToExecute.push({
                    content: script.innerHTML,
                    type: script.type || 'text/javascript',
                    src: script.src || null
                });
                script.remove();
            });
            
            // Insert HTML without scripts
            target.innerHTML = tempDiv.innerHTML;
            
            // Execute scripts after HTML is inserted
            scriptsToExecute.forEach(scriptData => {
                if (scriptData.src) {
                    // External script - create and append
                    const newScript = document.createElement('script');
                    newScript.src = scriptData.src;
                    newScript.type = scriptData.type;
                    document.body.appendChild(newScript);
                } else {
                    // Inline script - execute directly
                    const newScript = document.createElement('script');
                    newScript.type = scriptData.type;
                    newScript.textContent = scriptData.content;
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                }
            });
        } else {
            console.error(`Target element not found: ${targetElementId}`);
        }
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
    }
}

async function loadComponentAppend(componentName, targetElementId) {
    try {
        const cacheBuster = `?v=${Date.now()}`;
        const response = await fetch(`components/${componentName}.html${cacheBuster}`);
        if (!response.ok) {
            console.error(`[Components] Failed to load component ${componentName}: HTTP ${response.status} ${response.statusText}`);
            return;
        }
        const html = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            // Extract scripts from HTML before inserting (scripts won't execute in inserted HTML)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const scripts = tempDiv.querySelectorAll('script');
            const scriptsToExecute = [];
            
            // Remove scripts from HTML and save them
            scripts.forEach(script => {
                scriptsToExecute.push({
                    content: script.innerHTML,
                    type: script.type || 'text/javascript',
                    src: script.src || null
                });
                script.remove();
            });
            
            // Insert HTML without scripts
            target.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
            
            // Execute scripts after HTML is inserted
            scriptsToExecute.forEach((scriptData, index) => {
                try {
                    if (scriptData.src) {
                        // External script - create and append
                        const newScript = document.createElement('script');
                        newScript.src = scriptData.src;
                        newScript.type = scriptData.type;
                        document.body.appendChild(newScript);
                    } else {
                        // Inline script - execute directly
                        const newScript = document.createElement('script');
                        newScript.type = scriptData.type;
                        newScript.textContent = scriptData.content;
                        document.body.appendChild(newScript);
                        document.body.removeChild(newScript);
                    }
                } catch (scriptError) {
                    console.error(`[Components] Error executing script ${index + 1} for ${componentName}:`, scriptError);
                }
            });
        } else {
            console.error(`[Components] Target element not found: ${targetElementId}`);
        }
    } catch (error) {
        console.error(`[Components] Error loading component ${componentName}:`, error);
        console.error(`[Components] Error stack:`, error.stack);
    }
}

/** Ẩn màn hình loading (gọi sau khi shell + checkSession xong) */
function hideAppLoading() {
    const el = document.getElementById('app-loading');
    if (el) {
        el.style.opacity = '0';
        setTimeout(function () { el.remove(); }, 300);
    }
}

/** Chỉ tải shell: login + sidebar + header → hiển thị màn hình sớm, tránh trắng lâu */
async function loadCriticalComponents() {
    await loadComponent('login', 'login-container');
    await loadComponent('sidebar', 'sidebar-container');
    await loadComponent('header', 'header-container');
}

/** Tải toàn bộ tab (song song), rồi modals, templates */
async function loadRemainingComponents() {
    const tabComponents = [
        ['create', 'tabs-container'], ['approval', 'tabs-container'], ['my-requests', 'tabs-container'],
        ['order-create', 'tabs-container'], ['my-orders', 'tabs-container'], ['orders-admin', 'tabs-container'],
        ['daily-report', 'tabs-container'], ['hdmb-create', 'tabs-container'], ['thoa-thuan-create', 'tabs-container'],
        ['de-nghi-create', 'tabs-container'], ['document-files', 'tabs-container'], ['coc-create', 'tabs-container'],
        ['coc-requests', 'tabs-container'], ['test-drive-vehicles', 'tabs-container'], ['test-drive-request-create', 'tabs-container'],
        ['test-drive-requests', 'tabs-container'], ['reports-dashboard', 'tabs-container'], ['reports-mtd-detail', 'tabs-container'],
        ['profile', 'tabs-container'], ['users', 'tabs-container'], ['car-models', 'tabs-container'],
        ['sales-policies', 'tabs-container'], ['tvbh-targets', 'tabs-container'], ['themes', 'tabs-container']
    ];
    await Promise.all(tabComponents.map(([name, target]) => loadComponentAppend(name, target)));

    await loadComponent('modals', 'modals-container');
    const modalExtras = [
        ['modals-hdmb', 'modals-container'], ['modals-thoa-thuan', 'modals-container'], ['modals-de-nghi', 'modals-container'],
        ['modals-order-detail', 'modals-container'], ['modals-user-permissions', 'modals-container'], ['modals-change-password', 'modals-container'],
        ['modals-coc-issue', 'modals-container'], ['modals-coc-disburse', 'modals-container'], ['modals-coc-financial', 'modals-container'],
        ['modals-coc-detail', 'modals-container']
    ];
    await Promise.all(modalExtras.map(([name, target]) => loadComponentAppend(name, target)));
    await loadComponent('templates', 'templates-container');

    await new Promise(resolve => setTimeout(resolve, 100));
}

async function loadAllComponents() {
    await loadCriticalComponents();
    await loadRemainingComponents();
}

/**
 * Initialize formatMoneyInput for money input fields
 */
function initFormatMoneyInputs() {
    console.log('[initFormatMoneyInputs] Starting initialization...');
    
    // Đảm bảo formatMoneyInput function tồn tại
    if (typeof window.formatMoneyInput !== 'function') {
        console.error('[initFormatMoneyInputs] formatMoneyInput function not found on window');
        // Thử tạo một fallback function
        window.formatMoneyInput = function(el) {
            if (!el) return;
            let val = el.value.replace(/\D/g, '');
            el.value = val ? Number(val).toLocaleString('vi-VN') : '';
            console.log('[formatMoneyInput] Formatted value:', el.value);
        };
        console.log('[initFormatMoneyInputs] Created fallback formatMoneyInput function');
    }
    
    // Thêm event listener cho các input tiền trong form create (dùng data attribute để tìm)
    const formManual = document.getElementById('form-manual-create');
    if (formManual) {
        console.log('[initFormatMoneyInputs] Found form-manual-create');
        // Tìm bằng data attribute hoặc name attribute
        const moneyInputs = formManual.querySelectorAll('input[data-money-input="true"], input[name="contract_price"], input[name="discount_amount"], input[name="productivity_bonus"]');
        console.log('[initFormatMoneyInputs] Found', moneyInputs.length, 'money inputs');
        
        moneyInputs.forEach((input, index) => {
            console.log(`[initFormatMoneyInputs] Setting up input ${index}:`, input.name || input.getAttribute('name'), 'value:', input.value);
            // Đảm bảo không có inline handler conflict
            input.removeAttribute('oninput');
            
            // Lưu value và các attributes quan trọng
            const currentValue = input.value;
            const currentName = input.name;
            const currentId = input.id;
            const currentClass = input.className;
            const currentRequired = input.required;
            const currentPlaceholder = input.placeholder;
            const currentType = input.type;
            
            // Tạo input mới
            const newInput = document.createElement('input');
            newInput.type = currentType || 'text';
            newInput.name = currentName;
            if (currentId) newInput.id = currentId;
            if (currentClass) newInput.className = currentClass;
            if (currentRequired) newInput.required = currentRequired;
            if (currentPlaceholder) newInput.placeholder = currentPlaceholder;
            newInput.value = currentValue;
            
            // Copy các data attributes
            Array.from(input.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    newInput.setAttribute(attr.name, attr.value);
                }
            });
            
            // Thay thế input cũ bằng input mới
            input.parentNode.replaceChild(newInput, input);
            
            // Thêm event listener mới
            newInput.addEventListener('input', function(e) {
                console.log('[initFormatMoneyInputs] Input event fired for:', this.name || this.getAttribute('name'), 'value:', this.value);
                if (typeof window.formatMoneyInput === 'function') {
                    try {
                        window.formatMoneyInput(this);
                        console.log('[initFormatMoneyInputs] After formatMoneyInput, value:', this.value);
                    } catch (error) {
                        console.error('[initFormatMoneyInputs] Error in formatMoneyInput:', error);
                    }
                } else {
                    console.error('[initFormatMoneyInputs] formatMoneyInput is not a function, type:', typeof window.formatMoneyInput);
                    // Fallback: format manually
                    let val = this.value.replace(/\D/g, '');
                    this.value = val ? Number(val).toLocaleString('vi-VN') : '';
                    console.log('[initFormatMoneyInputs] Fallback format, value:', this.value);
                }
            });
        });
        
        // Thêm MutationObserver cho gift price inputs
        const giftContainer = document.getElementById('gift-list-manual');
        if (giftContainer) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            const giftPriceInputs = node.querySelectorAll ? node.querySelectorAll('.gift-price') : [];
                            giftPriceInputs.forEach(input => {
                                if (!input.hasAttribute('data-formatted')) {
                                    input.setAttribute('data-formatted', 'true');
                                    input.removeAttribute('oninput');
                                    input.addEventListener('input', function() {
                                        if (typeof window.formatMoneyInput === 'function') {
                                            window.formatMoneyInput(this);
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });
            observer.observe(giftContainer, { childList: true, subtree: true });
        }
    } else {
        console.warn('[initFormatMoneyInputs] form-manual-create not found');
    }
    
    // Cũng thêm cho form search (nếu có)
    const formSearch = document.getElementById('form-create-request');
    if (formSearch) {
        const moneyInputs = formSearch.querySelectorAll('input[name="contract_price"], input[name="discount_amount"], input[name="productivity_bonus"]');
        moneyInputs.forEach(input => {
            input.removeAttribute('oninput');
            input.addEventListener('input', function() {
                if (typeof window.formatMoneyInput === 'function') {
                    window.formatMoneyInput(this);
                }
            }, true);
        });
        
        const giftContainerSearch = document.getElementById('gift-list-search');
        if (giftContainerSearch) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const giftPriceInputs = node.querySelectorAll ? node.querySelectorAll('.gift-price') : [];
                            giftPriceInputs.forEach(input => {
                                if (!input.hasAttribute('data-formatted')) {
                                    input.setAttribute('data-formatted', 'true');
                                    input.removeAttribute('oninput');
                                    input.addEventListener('input', function() {
                                        if (typeof window.formatMoneyInput === 'function') {
                                            window.formatMoneyInput(this);
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });
            observer.observe(giftContainerSearch, { childList: true, subtree: true });
        }
    }
    
    console.log('[initFormatMoneyInputs] Initialization complete');
}

// Load components when DOM is ready
async function initializeApp() {
    try {
        // Bước 1: Tải shell (login, sidebar, header) → hiển thị màn hình ngay, tránh trắng lâu
        await loadCriticalComponents();
        if (typeof checkSession === 'function') {
            checkSession();
        }
        hideAppLoading();

        // Bước 2: Tải các tab + modals song song (nền), không chặn giao diện
        await loadRemainingComponents();
        await new Promise(resolve => setTimeout(resolve, 50));

        // Khôi phục tab từ localStorage sau khi components đã load xong
        // Xóa tất cả active classes trước để đảm bảo không bị conflict với HTML defaults
        setTimeout(() => {
            // Refresh menu visibility (sidebar đã load xong)
            if (typeof updateMenuItemsByPermissions === 'function') {
                const session = typeof getSession === 'function' ? getSession() : null;
                if (session) updateMenuItemsByPermissions(session);
            }
            // Remove all active classes từ HTML defaults
            document.querySelectorAll('.tab-content.active').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
            
            if (typeof switchTab === 'function') {
                try {
                    const savedTab = localStorage.getItem('current_tab');
                    if (savedTab) {
                        // Kiểm tra xem tab element có tồn tại không
                        const tabElement = document.getElementById(`tab-${savedTab}`);
                        if (tabElement) {
                            console.log('[Components] Restoring saved tab:', savedTab);
                            switchTab(savedTab);
                            return; // Exit early after restoring
                        } else {
                            console.log('[Components] Saved tab element not found, using default');
                        }
                    } else {
                        console.log('[Components] No saved tab found, using default');
                    }
                    
                    // Tab mặc định - chỉ chạy nếu không có saved tab hoặc saved tab không tồn tại
                    const defaultTab = 'create';
                    switchTab(defaultTab);
                } catch (e) {
                    console.warn('[Components] Could not restore tab from localStorage:', e);
                    const defaultTab = 'create';
                    switchTab(defaultTab);
                }
            }
        }, 400); // Tăng timeout lên 400ms để đảm bảo components đã render hoàn toàn
        
        // Then initialize app functions after components are loaded
        if (typeof loadTPKDUsers === 'function') {
            loadTPKDUsers();
        }
        if (typeof addGiftRow === 'function') {
            addGiftRow('gift-list-manual');
        }
        if (typeof initContractLookup === 'function') {
            initContractLookup();
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
    
    // Setup filters (direct bind)
    const approvalSearch = $('approval-search');
    if (approvalSearch) {
        approvalSearch.addEventListener('input', (e) => {
            if (typeof setApprovalFilter === 'function') {
                setApprovalFilter('search', e.target.value);
            }
        });
    }
    const approvalStatus = $('approval-status-filter');
    if (approvalStatus) {
        approvalStatus.addEventListener('change', (e) => {
            if (typeof setApprovalFilter === 'function') {
                setApprovalFilter('status', e.target.value);
            }
        });
    }
    const approvalStep = $('approval-step-filter');
    if (approvalStep) {
        approvalStep.addEventListener('change', (e) => {
            if (typeof setApprovalFilter === 'function') {
                setApprovalFilter('step', e.target.value);
            }
        });
    }
    // Event delegation cho bộ lọc duyệt đơn (phòng component load sau)
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'approval-step-filter' && typeof setApprovalFilter === 'function') {
            setApprovalFilter('step', e.target.value);
        }
        if (e.target && e.target.id === 'approval-status-filter' && typeof setApprovalFilter === 'function') {
            setApprovalFilter('status', e.target.value);
        }
    });
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'approval-search' && typeof setApprovalFilter === 'function') {
            setApprovalFilter('search', e.target.value);
        }
    });
    
    // My requests filters
    const myRequestsSearch = $('my-requests-search');
    if (myRequestsSearch) {
        myRequestsSearch.addEventListener('input', (e) => {
            if (typeof myRequestsFilters !== 'undefined') {
                myRequestsFilters.search = e.target.value;
                if (typeof renderMyRequestsList === 'function') {
                    renderMyRequestsList();
                }
            }
        });
    }
    const myRequestsStatus = $('my-requests-status-filter');
    if (myRequestsStatus) {
        myRequestsStatus.addEventListener('change', (e) => {
            if (typeof myRequestsFilters !== 'undefined') {
                myRequestsFilters.status = e.target.value;
                if (typeof renderMyRequestsList === 'function') {
                    renderMyRequestsList();
                }
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

