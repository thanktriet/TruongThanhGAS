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
        const response = await fetch(`components/${componentName}.html`);
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

async function loadAllComponents() {
    // Load login view
    await loadComponent('login', 'login-container');
    
    // Load dashboard components
    await loadComponent('sidebar', 'sidebar-container');
    await loadComponent('header', 'header-container');
    
    // Load tabs (append to container - all tabs go into tabs-container)
    await loadComponentAppend('create', 'tabs-container');
    await loadComponentAppend('approval', 'tabs-container');
    await loadComponentAppend('my-requests', 'tabs-container');
    // New tabs for integration
    await loadComponentAppend('order-create', 'tabs-container');
    await loadComponentAppend('my-orders', 'tabs-container');
    await loadComponentAppend('orders-admin', 'tabs-container');
    await loadComponentAppend('daily-report', 'tabs-container');
    await loadComponentAppend('hdmb-create', 'tabs-container');
    await loadComponentAppend('thoa-thuan-create', 'tabs-container');
    await loadComponentAppend('de-nghi-create', 'tabs-container');
    console.log('[Components] Loading document-files component...');
    await loadComponentAppend('document-files', 'tabs-container');
    console.log('[Components] document-files component loaded');
    await loadComponentAppend('coc-create', 'tabs-container');
    await loadComponentAppend('coc-requests', 'tabs-container');
    await loadComponentAppend('reports-dashboard', 'tabs-container');
    await loadComponentAppend('reports-mtd-detail', 'tabs-container');
    await loadComponentAppend('profile', 'tabs-container');
    await loadComponentAppend('users', 'tabs-container');
    await loadComponentAppend('car-models', 'tabs-container');
    await loadComponentAppend('sales-policies', 'tabs-container');
    await loadComponentAppend('tvbh-targets', 'tabs-container');
    
    // Load modals and templates
    await loadComponent('modals', 'modals-container');
    await loadComponentAppend('modals-hdmb', 'modals-container');
    await loadComponentAppend('modals-thoa-thuan', 'modals-container');
    await loadComponentAppend('modals-de-nghi', 'modals-container');
    await loadComponentAppend('modals-order-detail', 'modals-container');
    await loadComponentAppend('modals-user-permissions', 'modals-container');
    await loadComponentAppend('modals-change-password', 'modals-container');
    await loadComponentAppend('modals-coc-issue', 'modals-container');
    await loadComponentAppend('modals-coc-disburse', 'modals-container');
    await loadComponentAppend('modals-coc-financial', 'modals-container');
    await loadComponentAppend('modals-coc-detail', 'modals-container');
    await loadComponent('templates', 'templates-container');
    
    // Wait a bit for DOM to update after loading components
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Không cần initFormatMoneyInputs nữa vì dùng inline handler trong HTML
    // initFormatMoneyInputs();
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
        // First load all components
        await loadAllComponents();
        
        // Wait a bit more to ensure DOM is fully updated
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Then initialize app functions after components are loaded
        if (typeof loadTPKDUsers === 'function') {
            loadTPKDUsers();
        }
        if (typeof checkSession === 'function') {
            checkSession();
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
    
    // Setup filters
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

