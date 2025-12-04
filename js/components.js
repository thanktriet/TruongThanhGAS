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
    
    // Load tabs (append to container)
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
    loadAllComponents();
}

