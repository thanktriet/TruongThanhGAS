/**
 * Navigation Functions
 */
function switchTab(id) {
    $$('.tab-content').forEach(el => el.classList.remove('active'));
    $$('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tab = $(`tab-${id}`);
    const nav = $(`nav-${id}`);
    
    if (tab) tab.classList.add('active');
    if (nav) nav.classList.add('active');
    
    // Update mobile bottom nav active state
    updateMobileBottomNav(id);
    
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
    
    if (id === 'themes') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b6dc82df-6454-4237-a979-ab49405f20fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation.js:81',message:'Navigation: themes tab activated',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        console.log('[Navigation] Switching to themes tab');
        // Increase delay to ensure component is fully loaded
        setTimeout(() => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b6dc82df-6454-4237-a979-ab49405f20fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation.js:85',message:'Navigation: Checking loadThemes function',data:{loadThemesType:typeof window.loadThemes},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            console.log('[Navigation] Checking for loadThemes function...');
            console.log('[Navigation] window.loadThemes exists?', typeof window.loadThemes);
            
            if (typeof window.loadThemes === 'function') {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b6dc82df-6454-4237-a979-ab49405f20fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation.js:89',message:'Navigation: CALLING loadThemes',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
                // #endregion
                console.log('[Navigation] Calling loadThemes()...');
                try {
                    window.loadThemes();
                } catch (error) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b6dc82df-6454-4237-a979-ab49405f20fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation.js:93',message:'Navigation: ERROR calling loadThemes',data:{errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
                    // #endregion
                    console.error('[Navigation] Error calling loadThemes():', error);
                }
            } else {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b6dc82df-6454-4237-a979-ab49405f20fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation.js:96',message:'Navigation: loadThemes NOT FOUND',data:{availableFunctions:Object.keys(window).filter(k => k.includes('Theme') || k.includes('theme')).join(',')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
                // #endregion
                console.error('[Navigation] loadThemes function not found on window object');
                console.error('[Navigation] Available window functions:', Object.keys(window).filter(k => k.includes('Theme') || k.includes('theme')).join(', '));
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

// Export to window
if (typeof window !== 'undefined') {
    window.switchTab = switchTab;
    window.updateMobileBottomNav = updateMobileBottomNav;
}

