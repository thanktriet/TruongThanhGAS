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
    
    if (id === 'approval') loadApprovalList();
    if (id === 'my-requests') loadMyRequests();
    if (id === 'profile') loadProfile();
    if (id === 'users') loadUserManagement();
    // New tab handlers
    if (id === 'my-orders' && typeof loadMyOrders === 'function') loadMyOrders();
    if (id === 'orders-admin' && typeof loadOrdersForAdmin === 'function') loadOrdersForAdmin();
    if (id === 'daily-report' && typeof loadTodayReport === 'function') loadTodayReport();
    if (id === 'reports-dashboard' && typeof loadReportsDashboard === 'function') loadReportsDashboard();
    if (id === 'reports-mtd-detail' && typeof loadMtdDetailReport === 'function') loadMtdDetailReport();
    if (id === 'car-models') {
        console.log('🔄 Switching to car-models tab');
        if (typeof window.loadCarModelsList === 'function') {
            console.log('✅ loadCarModelsList function found, calling...');
            window.loadCarModelsList();
        } else {
            console.error('❌ loadCarModelsList function not found');
            // Try to find and call it
            setTimeout(() => {
                if (typeof window.loadCarModelsList === 'function') {
                    console.log('✅ loadCarModelsList found after delay, calling...');
                    window.loadCarModelsList();
                } else {
                    console.error('❌ loadCarModelsList still not found after delay');
                }
            }, 500);
        }
    }
}


