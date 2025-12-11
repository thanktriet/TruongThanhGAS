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
}


