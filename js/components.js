/**
 * Component Loader
 * Loads HTML components dynamically
 */

async function loadComponent(componentName, targetElementId) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) {
            console.error(`Failed to load component: ${componentName}`);
            return;
        }
        const html = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            target.innerHTML = html;
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
            console.error(`Failed to load component: ${componentName}`);
            return;
        }
        const html = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            target.insertAdjacentHTML('beforeend', html);
        } else {
            console.error(`Target element not found: ${targetElementId}`);
        }
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
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
    await loadComponentAppend('profile', 'tabs-container');
    await loadComponentAppend('users', 'tabs-container');
    
    // Load modals and templates
    await loadComponent('modals', 'modals-container');
    await loadComponent('templates', 'templates-container');
}

// Load components when DOM is ready
async function initializeApp() {
    // First load all components
    await loadAllComponents();
    
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

