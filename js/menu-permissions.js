/**
 * Menu Permissions Management
 * Quản lý hiển thị/ẩn menu items dựa trên permissions
 */

/**
 * Function để update menu items dựa trên permissions của user
 * Có thể gọi sau khi permissions được cập nhật
 */
function updateMenuItemsByPermissions(user) {
    if (!user) {
        user = getSession();
    }
    
    if (!user) {
        console.warn('No user session found for updating menu items');
        return;
    }

    // Helper function để show/hide menu item dựa trên permission
    function toggleMenuByPermission(menuId, permissionName, fallbackRoles = []) {
        const menuElement = $(menuId);
        if (!menuElement) return;

        let shouldShow = false;

        // Check permission first
        if (typeof hasPermission === 'function') {
            shouldShow = hasPermission(user, permissionName);
        }

        // Fallback to role check if no permission or permission check failed
        if (!shouldShow && fallbackRoles.length > 0) {
            shouldShow = fallbackRoles.includes(user.role);
        }

        // Update visibility
        if (shouldShow) {
            menuElement.classList.remove('hidden');
        } else {
            menuElement.classList.add('hidden');
        }
    }

    // =====================================================
    // TỜ TRÌNH MENUS
    // =====================================================
    toggleMenuByPermission('nav-create', 'create_request', 
        ['ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN']);
    
    toggleMenuByPermission('nav-my-requests', 'view_my_requests',
        ['ADMIN', 'TVBH', 'SALE', 'TPKD', 'GDKD', 'BKS', 'BGD', 'KETOAN']);
    
    // Approval menu - logic đặc biệt
    const navApproval = $('nav-approval');
    if (navApproval) {
        let shouldShowApproval = false;
        
        if (typeof hasPermission === 'function') {
            shouldShowApproval = hasPermission(user, 'approve_request');
        }
        
        if (!shouldShowApproval) {
            // Ẩn nếu là SALE hoặc TVBH (không có quyền duyệt mặc định)
            if (user.role === 'SALE' || user.role === 'TVBH') {
                shouldShowApproval = false;
            } else if (user.role === 'ADMIN') {
                // ADMIN luôn có quyền duyệt
                shouldShowApproval = true;
            } else {
                // Các role khác có quyền duyệt
                shouldShowApproval = true;
            }
        }
        
        if (shouldShowApproval) {
            navApproval.classList.remove('hidden');
        } else {
            navApproval.classList.add('hidden');
        }
    }

    // =====================================================
    // ĐƠN HÀNG MENUS
    // =====================================================
    toggleMenuByPermission('nav-order-create', 'create_order', ['TVBH', 'SALE']);
    
    // nav-my-orders: Hiển thị nếu có view_my_orders HOẶC view_all_orders
    const navMyOrders = $('nav-my-orders');
    if (navMyOrders) {
        let shouldShow = false;
        
        // Check view_my_orders permission
        if (typeof hasPermission === 'function') {
            shouldShow = hasPermission(user, 'view_my_orders') || hasPermission(user, 'view_all_orders');
        }
        
        // Fallback to role check
        if (!shouldShow) {
            shouldShow = ['TVBH', 'SALE', 'ADMIN', 'SALEADMIN'].includes(user.role);
        }
        
        if (shouldShow) {
            navMyOrders.classList.remove('hidden');
        } else {
            navMyOrders.classList.add('hidden');
        }
    }
    
    toggleMenuByPermission('nav-orders-admin', 'view_all_orders', ['ADMIN', 'SALEADMIN']);
    
    // =====================================================
    // BÁO CÁO MENUS
    // =====================================================
    toggleMenuByPermission('nav-daily-report', 'submit_daily_report', ['TVBH', 'SALE']);
    toggleMenuByPermission('nav-reports-dashboard', 'view_dashboard', ['ADMIN', 'GDKD', 'BKS', 'BGD']);
    toggleMenuByPermission('nav-reports-mtd-detail', 'view_dashboard', ['ADMIN', 'GDKD', 'BKS', 'BGD']);
    
    // =====================================================
    // HỆ THỐNG MENUS
    // =====================================================
    toggleMenuByPermission('nav-users', 'manage_users', ['ADMIN']);
    toggleMenuByPermission('nav-mobile-users', 'manage_users', ['ADMIN']);
    toggleMenuByPermission('nav-car-models', 'manage_car_models', ['ADMIN']);
    toggleMenuByPermission('nav-sales-policies', 'manage_sales_policies', ['ADMIN']);
    toggleMenuByPermission('nav-tvbh-targets', 'manage_tvbh_targets', ['ADMIN']);
}

/**
 * Refresh user session từ database và update menu items
 * Gọi sau khi permissions được cập nhật
 */
async function refreshUserSessionAndMenu() {
    try {
        const currentUser = getSession();
        if (!currentUser || !currentUser.username) {
            console.warn('No user session to refresh');
            return;
        }

        // Get updated user info from database
        const result = await callAPI({
            action: 'list_users',
            username: currentUser.username,
            role: currentUser.role
        });

        if (result.success && result.users) {
            const updatedUser = result.users.find(u => 
                u.username.toLowerCase() === currentUser.username.toLowerCase()
            );

            if (updatedUser) {
                // Update session with new permissions
                const sessionUser = {
                    ...currentUser,
                    permissions: updatedUser.permissions || {}
                };
                
                localStorage.setItem('user_session', JSON.stringify(sessionUser));
                
                // Update menu items
                updateMenuItemsByPermissions(sessionUser);
                
                console.log('✅ User session and menu items updated');
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error refreshing user session:', error);
        return false;
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.updateMenuItemsByPermissions = updateMenuItemsByPermissions;
    window.refreshUserSessionAndMenu = refreshUserSessionAndMenu;
}

