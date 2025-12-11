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
            target.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
            
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
    await loadComponent('templates', 'templates-container');
    
    // Wait a bit for DOM to update after loading components
    await new Promise(resolve => setTimeout(resolve, 100));
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

