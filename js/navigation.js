/**
 * Navigation Functions
 */
function switchTab(id) {
    console.log('[Navigation] ========== switchTab CALLED ==========');
    console.log('[Navigation] switchTab called with id:', id);
    
    $$('.tab-content').forEach(el => el.classList.remove('active'));
    $$('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tab = $(`tab-${id}`);
    const nav = $(`nav-${id}`);
    
    console.log('[Navigation] Tab element found:', !!tab, 'Nav element found:', !!nav);
    
    if (tab) tab.classList.add('active');
    if (nav) nav.classList.add('active');
    
    // Update mobile bottom nav active state
    updateMobileBottomNav(id);
    
    // Lưu tab hiện tại vào localStorage để khôi phục khi refresh
    try {
        localStorage.setItem('current_tab', id);
        console.log('[Navigation] Saved current tab to localStorage:', id);
    } catch (e) {
        console.warn('[Navigation] Could not save tab to localStorage:', e);
    }
    
    if (id === 'approval') loadApprovalList();
    if (id === 'my-requests') loadMyRequests();
    if (id === 'profile') loadProfile();
    if (id === 'users') loadUserManagement();
    // New tab handlers
    if (id === 'my-orders' && typeof loadMyOrders === 'function') loadMyOrders();
    if (id === 'orders-admin' && typeof loadOrdersForAdmin === 'function') loadOrdersForAdmin();
    if (id === 'daily-report') {
        console.log('[Navigation] Switching to daily-report tab');
        setTimeout(() => {
            if (typeof window.loadCarModels === 'function') {
                console.log('[Navigation] Loading car models...');
                window.loadCarModels();
            }
            if (typeof window.loadTodayReport === 'function') {
                console.log('[Navigation] Loading today report...');
                window.loadTodayReport();
            }
        }, 300);
    }
    if (id === 'reports-dashboard' && typeof loadReportsDashboard === 'function') loadReportsDashboard();
    if (id === 'reports-mtd-detail' && typeof loadMtdDetailReport === 'function') loadMtdDetailReport();
    if (id === 'car-models') {
        console.log('[Navigation] Switching to car-models tab');
        setTimeout(() => {
            if (typeof window.loadCarModelsList === 'function') {
                console.log('[Navigation] Calling loadCarModelsList...');
                window.loadCarModelsList();
            } else {
                console.error('[Navigation] loadCarModelsList function not found');
            }
        }, 300);
    }
    
    if (id === 'sales-policies') {
        console.log('[Navigation] Switching to sales-policies tab');
        setTimeout(() => {
            if (typeof window.loadSalesPoliciesList === 'function') {
                console.log('[Navigation] Calling loadSalesPoliciesList...');
                window.loadSalesPoliciesList();
            } else {
                console.error('[Navigation] loadSalesPoliciesList function not found');
            }
        }, 300);
    }
    
    if (id === 'tvbh-targets') {
        console.log('[Navigation] Switching to tvbh-targets tab');
        setTimeout(() => {
            // Không auto-load, chờ user chọn tháng và click "Lọc"
        }, 300);
    }
    
    if (id === 'coc-requests') {
        console.log('[Navigation] Switching to coc-requests tab');
        setTimeout(() => {
            if (typeof window.loadCocRequests === 'function') {
                window.loadCocRequests();
            } else {
                console.error('[Navigation] loadCocRequests function not found');
            }
        }, 300);
    }
    if (id === 'test-drive-vehicles') {
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (typeof window.loadTestDriveVehicles === 'function') {
                    try {
                        window.loadTestDriveVehicles();
                    } catch (err) {
                        console.error('[Navigation] loadTestDriveVehicles error:', err);
                    }
                } else {
                    setTimeout(() => window.loadTestDriveVehicles && window.loadTestDriveVehicles(), 500);
                }
            }, 400);
        });
    }
    if (id === 'test-drive-request-create') {
        setTimeout(() => {
            if (typeof window.loadTestDriveRequestCreate === 'function') {
                try { window.loadTestDriveRequestCreate(); } catch (e) { console.error('[Navigation] loadTestDriveRequestCreate error:', e); }
            }
        }, 300);
    }
    if (id === 'test-drive-requests' && typeof loadTestDriveRequests === 'function') {
        loadTestDriveRequests();
    }
    
    if (id === 'login-promo') {
        setTimeout(() => {
            if (typeof window.loadLoginPromo === 'function') window.loadLoginPromo();
        }, 300);
    }
    if (id === 'themes') {
        console.log('[Navigation] ========== THEMES TAB ACTIVATED ==========');
        console.log('[Navigation] Switching to themes tab');
        
        // Increase delay to ensure component is fully loaded
        setTimeout(() => {
            console.log('[Navigation] Checking for loadThemes function...');
            console.log('[Navigation] window.loadThemes type:', typeof window.loadThemes);
            console.log('[Navigation] window.loadThemes:', window.loadThemes);
            
            if (typeof window.loadThemes === 'function') {
                console.log('[Navigation] ✅ loadThemes found, calling now...');
                try {
                    window.loadThemes();
                } catch (error) {
                    console.error('[Navigation] ❌ Error calling loadThemes():', error);
                    console.error('[Navigation] Error stack:', error.stack);
                }
            } else {
                console.error('[Navigation] ❌ loadThemes function not found on window object');
                const themeFunctions = Object.keys(window).filter(k => k.toLowerCase().includes('theme'));
                console.error('[Navigation] Available theme-related functions:', themeFunctions.join(', '));
            }
        }, 500); // Increased from 300ms to 500ms to ensure component is ready
    }
}

/**
 * Update mobile bottom navigation active state
 */
function updateMobileBottomNav(activeTabId) {
    // Reset all buttons
    const allButtons = document.querySelectorAll('[id^="mobile-nav-bottom-"]');
    allButtons.forEach(btn => {
        btn.classList.remove('text-blue-600');
        btn.classList.add('text-gray-500');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.remove('text-blue-600');
        }
    });
    
    // Set active button
    let activeButtonId = null;
    if (activeTabId === 'create') {
        activeButtonId = 'mobile-nav-bottom-create';
    } else if (activeTabId === 'approval') {
        activeButtonId = 'mobile-nav-bottom-approval';
    } else if (activeTabId === 'profile') {
        activeButtonId = 'mobile-nav-bottom-profile';
    }
    
    if (activeButtonId) {
        const activeBtn = document.getElementById(activeButtonId);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-500');
            activeBtn.classList.add('text-blue-600');
            const icon = activeBtn.querySelector('i');
            if (icon) {
                icon.classList.add('text-blue-600');
            }
        }
    }
}

// Export to window - OVERRIDE any existing switchTab
if (typeof window !== 'undefined') {
    console.log('[Navigation] Exposing switchTab to window...');
    window.switchTab = switchTab;
    window.updateMobileBottomNav = updateMobileBottomNav;
    console.log('[Navigation] ✅ switchTab exposed to window');
    console.log('[Navigation] window.switchTab type:', typeof window.switchTab);
}

