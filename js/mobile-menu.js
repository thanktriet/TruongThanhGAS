/**
 * Mobile Menu Functions
 */

// Toggle mobile menu
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobile-sidebar');
    const sidebarContent = document.getElementById('mobile-sidebar-content');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    
    if (!sidebar || !sidebarContent) return;
    
    if (sidebar.classList.contains('hidden')) {
        // Open menu
        sidebar.classList.remove('hidden');
        setTimeout(() => {
            sidebarContent.classList.remove('-translate-x-full');
        }, 10);
        
        // Update toggle button icon
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Sync menu items from desktop sidebar
        syncMobileMenuItems();
        
        // Update user info
        syncMobileUserInfo();
    } else {
        closeMobileMenu();
    }
}

// Close mobile menu
function closeMobileMenu() {
    const sidebar = document.getElementById('mobile-sidebar');
    const sidebarContent = document.getElementById('mobile-sidebar-content');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    
    if (!sidebar || !sidebarContent) return;
    
    sidebarContent.classList.add('-translate-x-full');
    setTimeout(() => {
        sidebar.classList.add('hidden');
    }, 300);
    
    // Update toggle button icon
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Sync menu items from desktop sidebar to mobile
function syncMobileMenuItems() {
    const desktopNav = document.querySelector('aside nav');
    const mobileNav = document.getElementById('mobile-nav-menu');
    
    if (!desktopNav || !mobileNav) {
        // Fallback: create menu items manually
        createMobileMenuItemsFallback();
        return;
    }
    
    // Clone visible menu items from desktop sidebar
    mobileNav.innerHTML = '';
    
    const desktopItems = desktopNav.querySelectorAll('.nav-item:not(.hidden)');
    desktopItems.forEach(item => {
        const cloned = item.cloneNode(true);
        cloned.onclick = function(e) {
            const originalOnclick = item.getAttribute('onclick');
            if (originalOnclick) {
                eval(originalOnclick);
            }
            closeMobileMenu();
            e.stopPropagation();
        };
        
        // Update classes for mobile
        cloned.classList.remove('hover:bg-slate-800');
        cloned.classList.add('active:bg-slate-800', 'touch-manipulation');
        
        mobileNav.appendChild(cloned);
    });
    
    // Update active state
    updateMobileMenuActiveState();
}

// Fallback: Create menu items manually if desktop sidebar not available
function createMobileMenuItemsFallback() {
    const mobileNav = document.getElementById('mobile-nav-menu');
    if (!mobileNav) return;
    
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    if (!session || !session.role) return;
    
    const role = session.role;
    const permissions = session.permissions || {};
    
    let menuItems = [];
    
    // Common menu items
    if (role === 'ADMIN' || permissions.create_request || ['ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN'].includes(role)) {
        menuItems.push({
            id: 'create',
            icon: 'fa-file-circle-plus',
            text: 'Tạo Tờ Trình',
            onclick: "switchTab('create'); closeMobileMenu();"
        });
    }
    
    if (role === 'ADMIN' || permissions.view_my_requests || ['ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN'].includes(role)) {
        menuItems.push({
            id: 'my-requests',
            icon: 'fa-folder-open',
            text: 'Quản lý tờ trình của tôi',
            onclick: "switchTab('my-requests'); closeMobileMenu();"
        });
    }
    
    if (role === 'ADMIN' || permissions.approve_requests || ['ADMIN', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN'].includes(role)) {
        menuItems.push({
            id: 'approval',
            icon: 'fa-list-check',
            text: 'Duyệt Đơn',
            onclick: "switchTab('approval'); closeMobileMenu();"
        });
    }
    
    // TVBH specific
    if (role === 'TVBH' || role === 'ADMIN') {
        menuItems.push({
            id: 'order-create',
            icon: 'fa-file-circle-plus',
            text: 'Nhập Đơn Hàng',
            onclick: "switchTab('order-create'); closeMobileMenu();"
        });
        menuItems.push({
            id: 'my-orders',
            icon: 'fa-list',
            text: 'Quản Lý Đơn Hàng',
            onclick: "switchTab('my-orders'); closeMobileMenu();"
        });
        menuItems.push({
            id: 'daily-report',
            icon: 'fa-calendar-day',
            text: 'Báo Cáo Ngày',
            onclick: "switchTab('daily-report'); closeMobileMenu();"
        });
    }
    
    // Admin/SaleAdmin
    if (role === 'ADMIN' || role === 'SALEADMIN' || permissions.view_all_orders) {
        menuItems.push({
            id: 'orders-admin',
            icon: 'fa-clipboard-list',
            text: 'Quản Lý Đơn Hàng (Admin)',
            onclick: "switchTab('orders-admin'); closeMobileMenu();"
        });
    }
    
    // Reports
    if (role === 'ADMIN' || permissions.view_reports || ['ADMIN', 'GDKD', 'BKS', 'BGD'].includes(role)) {
        menuItems.push({
            id: 'reports-dashboard',
            icon: 'fa-chart-line',
            text: 'Dashboard Báo Cáo',
            onclick: "switchTab('reports-dashboard'); closeMobileMenu();"
        });
        menuItems.push({
            id: 'reports-mtd-detail',
            icon: 'fa-table',
            text: 'Báo Cáo MTD Chi Tiết',
            onclick: "switchTab('reports-mtd-detail'); closeMobileMenu();"
        });
    }
    
    // Profile
    menuItems.push({
        id: 'profile',
        icon: 'fa-id-badge',
        text: 'Hồ sơ cá nhân',
        onclick: "switchTab('profile'); closeMobileMenu();"
    });
    
    // Admin only
    if (role === 'ADMIN' || permissions.manage_users) {
        menuItems.push({
            id: 'users',
            icon: 'fa-users-gear',
            text: 'Quản lý User',
            onclick: "switchTab('users'); closeMobileMenu();"
        });
    }
    
    if (role === 'ADMIN' || permissions.manage_car_models) {
        menuItems.push({
            id: 'car-models',
            icon: 'fa-car',
            text: 'Quản Lý Dòng Xe',
            onclick: "switchTab('car-models'); closeMobileMenu();"
        });
    }
    
    // Render menu items
    mobileNav.innerHTML = '';
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-item w-full text-left px-4 py-3 active:bg-slate-800 transition flex items-center gap-3 touch-manipulation';
        btn.id = `mobile-nav-${item.id}`;
        btn.onclick = function(e) {
            eval(item.onclick);
            e.stopPropagation();
        };
        btn.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.text}`;
        mobileNav.appendChild(btn);
    });
    
    updateMobileMenuActiveState();
}

// Update active state in mobile menu
function updateMobileMenuActiveState() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const tabId = activeTab.id.replace('tab-', '');
    
    // Update desktop nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `nav-${tabId}`) {
            item.classList.add('active');
        }
    });
    
    // Update mobile nav
    document.querySelectorAll('#mobile-nav-menu .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `mobile-nav-${tabId}`) {
            item.classList.add('active');
            item.classList.add('bg-slate-800');
        }
    });
}

// Sync user info to mobile header
function syncMobileUserInfo() {
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    if (!session) return;
    
    const mobileFullname = document.getElementById('mobile-user-fullname');
    const mobileRole = document.getElementById('mobile-user-role');
    
    if (mobileFullname) {
        mobileFullname.textContent = session.fullname || session.username || 'User';
    }
    
    if (mobileRole) {
        mobileRole.textContent = session.role || 'USER';
    }
}

// Listen for tab switches to update mobile menu active state
if (typeof window !== 'undefined') {
    // Override switchTab to update mobile menu
    const originalSwitchTab = window.switchTab;
    if (originalSwitchTab) {
        window.switchTab = function(id) {
            originalSwitchTab(id);
            setTimeout(() => {
                updateMobileMenuActiveState();
                if (typeof window.updateMobileBottomNav === 'function') {
                    const activeTab = document.querySelector('.tab-content.active');
                    if (activeTab) {
                        const tabId = activeTab.id.replace('tab-', '');
                        window.updateMobileBottomNav(tabId);
                    }
                }
            }, 100);
        };
    }
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('mobile-sidebar');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        
        if (!sidebar || sidebar.classList.contains('hidden')) return;
        
        // If click is outside sidebar and not on toggle button
        if (!sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Sync user info on load
    window.addEventListener('load', function() {
        setTimeout(() => {
            syncMobileUserInfo();
        }, 500);
    });
}

// updateMobileBottomNav is now defined in navigation.js
// DO NOT redefine it here to avoid infinite recursion

// Show/hide bottom nav items based on permissions
function updateMobileBottomNavVisibility() {
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    if (!session || !session.role) return;
    
    const role = session.role;
    const permissions = session.permissions || {};
    
    // Profile button - always show if logged in
    const profileBtn = document.getElementById('mobile-nav-bottom-profile');
    if (profileBtn) {
        profileBtn.classList.remove('hidden');
    }
    
    // Show/hide other buttons based on role/permissions
    // This can be expanded based on requirements
}

// Expose functions globally
if (typeof window !== 'undefined') {
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.syncMobileMenuItems = syncMobileMenuItems;
    window.updateMobileMenuActiveState = updateMobileMenuActiveState;
    // updateMobileBottomNav is defined in navigation.js, no need to expose here
    window.updateMobileBottomNavVisibility = updateMobileBottomNavVisibility;
    
    // Initialize on load
    window.addEventListener('load', function() {
        setTimeout(() => {
            updateMobileBottomNavVisibility();
            if (typeof window.updateMobileBottomNav === 'function') {
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab) {
                    const tabId = activeTab.id.replace('tab-', '');
                    window.updateMobileBottomNav(tabId);
                }
            }
        }, 500);
    });
}

