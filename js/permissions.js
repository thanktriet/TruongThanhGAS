/**
 * Permission Management System
 * Hệ thống quản lý quyền chi tiết cho từng user
 */

// ======================================================
// PERMISSION DEFINITIONS
// ======================================================

const ALL_PERMISSIONS = {
    // Tờ trình (Approval Requests)
    'create_request': { label: 'Tạo tờ trình', group: 'approval' },
    'view_my_requests': { label: 'Xem tờ trình của mình', group: 'approval' },
    'view_all_requests': { label: 'Xem tất cả tờ trình', group: 'approval' },
    'approve_request': { label: 'Duyệt tờ trình', group: 'approval' },
    'edit_request': { label: 'Sửa tờ trình', group: 'approval' },
    'print_request': { label: 'In tờ trình', group: 'approval' },
    'resubmit_request': { label: 'Gửi lại tờ trình', group: 'approval' },
    
    // Đơn hàng (Orders)
    'create_order': { label: 'Tạo đơn hàng', group: 'orders' },
    'view_my_orders': { label: 'Xem đơn hàng của mình', group: 'orders' },
    'view_all_orders': { label: 'Xem tất cả đơn hàng', group: 'orders' },
    'edit_order': { label: 'Sửa đơn hàng', group: 'orders' },
    'assign_contract_code': { label: 'Cấp mã đơn hàng', group: 'orders' },
    'view_order_detail': { label: 'Xem chi tiết đơn hàng', group: 'orders' },
    
    // Documents
    'create_hdmb': { label: 'Tạo Hợp đồng Mua Bán', group: 'documents' },
    'create_thoa_thuan': { label: 'Tạo Thỏa thuận lãi suất', group: 'documents' },
    'create_de_nghi': { label: 'Tạo Đề nghị giải ngân', group: 'documents' },
    
    // Báo cáo (Reports)
    'submit_daily_report': { label: 'Nhập báo cáo ngày', group: 'reports' },
    'view_reports': { label: 'Xem báo cáo', group: 'reports' },
    'view_dashboard': { label: 'Xem Dashboard', group: 'reports' },
    
    // Quản lý hệ thống
    'manage_users': { label: 'Quản lý users', group: 'system' },
    'manage_permissions': { label: 'Quản lý permissions', group: 'system' },
    'manage_car_models': { label: 'Quản lý dòng xe', group: 'system' },
    'manage_sales_policies': { label: 'Quản lý chính sách bán hàng', group: 'system' }
};

// Permission groups
const PERMISSION_GROUPS = {
    'approval': { label: 'TỜ TRÌNH', icon: 'fa-file-circle-plus' },
    'orders': { label: 'ĐƠN HÀNG', icon: 'fa-cart-shopping' },
    'documents': { label: 'TÀI LIỆU', icon: 'fa-file-contract' },
    'reports': { label: 'BÁO CÁO', icon: 'fa-chart-line' },
    'system': { label: 'HỆ THỐNG', icon: 'fa-cog' }
};

// ======================================================
// DEFAULT PERMISSIONS BY ROLE
// ======================================================

const DEFAULT_PERMISSIONS_BY_ROLE = {
    'ADMIN': {
        // Admin có tất cả quyền - sẽ được handle đặc biệt
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: true,
        create_order: false,
        view_my_orders: false,
        view_all_orders: true,
        edit_order: true,
        assign_contract_code: false,
        view_order_detail: true,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: true,
        view_dashboard: true,
        manage_users: true,
        manage_permissions: true,
        manage_car_models: true,
        manage_sales_policies: true
    },
    'TVBH': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: false,
        approve_request: false,
        edit_request: true,
        print_request: true,
        resubmit_request: true,
        create_order: true,
        view_my_orders: true,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: true,
        create_hdmb: true,
        create_thoa_thuan: true,
        create_de_nghi: true,
        submit_daily_report: true,
        view_reports: false,
        view_dashboard: false,
        manage_users: false,
        manage_permissions: false
    },
    'SALE': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: false,
        approve_request: false,
        edit_request: true,
        print_request: true,
        resubmit_request: true,
        create_order: true,
        view_my_orders: true,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: true,
        create_hdmb: true,
        create_thoa_thuan: true,
        create_de_nghi: true,
        submit_daily_report: true,
        view_reports: false,
        view_dashboard: false,
        manage_users: false,
        manage_permissions: false
    },
    'SALEADMIN': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: true,
        edit_order: false,
        assign_contract_code: true,
        view_order_detail: true,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: false,
        view_dashboard: false,
        manage_users: false,
        manage_permissions: false
    },
    'TPKD': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: false,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: false,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: false,
        view_dashboard: false,
        manage_users: false,
        manage_permissions: false
    },
    'GDKD': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: false,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: true,
        view_dashboard: true,
        manage_users: false,
        manage_permissions: false
    },
    'BKS': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: false,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: true,
        view_dashboard: true,
        manage_users: false,
        manage_permissions: false
    },
    'BGD': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: false,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: true,
        view_dashboard: true,
        manage_users: false,
        manage_permissions: false
    },
    'KETOAN': {
        create_request: true,
        view_my_requests: true,
        view_all_requests: true,
        approve_request: true,
        edit_request: true,
        print_request: true,
        resubmit_request: false,
        create_order: false,
        view_my_orders: false,
        view_all_orders: false,
        edit_order: false,
        assign_contract_code: false,
        view_order_detail: false,
        create_hdmb: false,
        create_thoa_thuan: false,
        create_de_nghi: false,
        submit_daily_report: false,
        view_reports: false,
        view_dashboard: false,
        manage_users: false,
        manage_permissions: false
    }
};

// ======================================================
// HELPER FUNCTIONS
// ======================================================

/**
 * Lấy tất cả permissions (cho ADMIN)
 */
function getAllPermissions() {
    const allPerms = {};
    Object.keys(ALL_PERMISSIONS).forEach(key => {
        allPerms[key] = true;
    });
    return allPerms;
}

/**
 * Lấy default permissions theo role
 */
function getDefaultPermissionsByRole(role) {
    return DEFAULT_PERMISSIONS_BY_ROLE[role] || {};
}

/**
 * Lấy permissions của user (merge với role defaults nếu không có)
 */
function getUserPermissions(user) {
    if (!user) return {};
    
    // Nếu user là ADMIN, có tất cả quyền
    if (user.role === 'ADMIN') {
        return getAllPermissions();
    }
    
    // Lấy permissions từ user object (có thể là JSON string hoặc object)
    let customPermissions = {};
    if (user.permissions) {
        if (typeof user.permissions === 'string') {
            try {
                const parsed = JSON.parse(user.permissions);
                // Chỉ dùng nếu không phải empty object
                if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                    customPermissions = parsed;
                }
            } catch (e) {
                console.error('Error parsing permissions:', e);
            }
        } else if (typeof user.permissions === 'object') {
            // Chỉ dùng nếu không phải empty object
            if (Object.keys(user.permissions).length > 0) {
                customPermissions = user.permissions;
            }
        }
    }
    
    // Nếu có custom permissions, dùng nó
    if (Object.keys(customPermissions).length > 0) {
        return customPermissions;
    }
    
    // Nếu không, dùng default permissions theo role
    return getDefaultPermissionsByRole(user.role);
}

/**
 * Check permission
 */
function hasPermission(user, permissionName) {
    if (!user || !permissionName) return false;
    
    // ADMIN luôn có tất cả quyền
    if (user.role === 'ADMIN') {
        return true;
    }
    
    const permissions = getUserPermissions(user);
    return permissions[permissionName] === true;
}

/**
 * Check multiple permissions (AND) - tất cả phải true
 */
function hasAllPermissions(user, permissionNames) {
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.every(perm => hasPermission(user, perm));
}

/**
 * Check multiple permissions (OR) - chỉ cần một true
 */
function hasAnyPermission(user, permissionNames) {
    if (!permissionNames || permissionNames.length === 0) return false;
    return permissionNames.some(perm => hasPermission(user, perm));
}

/**
 * Lấy danh sách permissions theo group
 */
function getPermissionsByGroup() {
    const grouped = {};
    
    Object.keys(ALL_PERMISSIONS).forEach(key => {
        const perm = ALL_PERMISSIONS[key];
        const group = perm.group || 'other';
        
        if (!grouped[group]) {
            grouped[group] = [];
        }
        
        grouped[group].push({
            key: key,
            label: perm.label
        });
    });
    
    return grouped;
}

// ======================================================
// EXPORT TO WINDOW
// ======================================================

if (typeof window !== 'undefined') {
    window.Permissions = {
        ALL_PERMISSIONS,
        PERMISSION_GROUPS,
        DEFAULT_PERMISSIONS_BY_ROLE,
        getAllPermissions,
        getDefaultPermissionsByRole,
        getUserPermissions,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        getPermissionsByGroup
    };
    
    // Shortcuts
    window.hasPermission = hasPermission;
    window.hasAllPermissions = hasAllPermissions;
    window.hasAnyPermission = hasAnyPermission;
    window.getUserPermissions = getUserPermissions;
}

