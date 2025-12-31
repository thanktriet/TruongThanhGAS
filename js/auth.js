/**
 * Authentication Functions
 */
function checkSession() {
    const user = getSession();
    // Components are loaded into containers, so we need to find the actual elements
    // login-view is inside login-container, dashboard-view is the container itself
    const loginContainer = $('login-container');
    const loginView = $('login-view') || loginContainer?.querySelector('#login-view');
    const dash = $('dashboard-view');
    
    if (user) {
        // Kiểm tra nếu cần đổi mật khẩu
        if (user.need_change_pass) {
            if (loginView) loginView.classList.remove('hidden');
            if (loginContainer) loginContainer.style.display = 'block';
            dash?.classList.add('hidden');
            dash?.classList.remove('flex');
            // Hiển thị modal đổi mật khẩu
            showChangePasswordModal(user, true);
            return;
        }
        
        // Wait for sidebar to be loaded before accessing elements
        const userFullname = $('user-fullname');
        const userRole = $('user-role');
        if (userFullname) userFullname.textContent = user.fullname || 'User';
        if (userRole) userRole.textContent = user.role || 'ROLE';
        
        $('nav-profile')?.classList.remove('hidden');
        $('nav-mobile-profile')?.classList.remove('hidden');
        
        if (user.role === 'ADMIN') {
            $('nav-users')?.classList.remove('hidden');
            $('nav-mobile-users')?.classList.remove('hidden');
        } else {
            $('nav-users')?.classList.add('hidden');
            $('nav-mobile-users')?.classList.add('hidden');
        }
        
        if (typeof loadProfile === 'function') {
            loadProfile();
        }
        
        // Show/hide menu based on permissions - dùng helper function nếu có, fallback về logic cũ
        if (typeof window.updateMenuItemsByPermissions === 'function') {
            window.updateMenuItemsByPermissions(user);
        } else {
            // Fallback: Logic cũ với permission checks
            // TỜ TRÌNH menus
            if (typeof hasPermission === 'function' && hasPermission(user, 'create_request')) {
                $('nav-create')?.classList.remove('hidden');
            } else if (user.role === 'TVBH' || user.role === 'SALE' || user.role === 'TPKD' || user.role === 'GDKD' || user.role === 'BKS' || user.role === 'BGD' || user.role === 'KETOAN') {
                $('nav-create')?.classList.remove('hidden');
            } else {
                $('nav-create')?.classList.add('hidden');
            }
            
            if (typeof hasPermission === 'function' && hasPermission(user, 'view_my_requests')) {
                $('nav-my-requests')?.classList.remove('hidden');
            } else if (user.role === 'TVBH' || user.role === 'SALE' || user.role === 'TPKD' || user.role === 'GDKD' || user.role === 'BKS' || user.role === 'BGD' || user.role === 'KETOAN') {
                $('nav-my-requests')?.classList.remove('hidden');
            } else {
                $('nav-my-requests')?.classList.add('hidden');
            }
            
            const navApproval = $('nav-approval');
            if (typeof hasPermission === 'function' && hasPermission(user, 'approve_request')) {
                navApproval?.classList.remove('hidden');
                if (typeof switchTab === 'function') {
                    switchTab('approval');
                }
            } else if (user.role === 'SALE' || user.role === 'TVBH') {
                navApproval?.classList.add('hidden');
            } else {
                navApproval?.classList.remove('hidden');
                if (typeof switchTab === 'function') {
                    switchTab('approval');
                }
            }
            
            // TVBH menus
            if (typeof hasPermission === 'function' && hasPermission(user, 'create_order')) {
                $('nav-order-create')?.classList.remove('hidden');
            } else if (user.role === 'TVBH' || user.role === 'SALE') {
                $('nav-order-create')?.classList.remove('hidden');
            } else {
                $('nav-order-create')?.classList.add('hidden');
            }
            
            // nav-my-orders: Hiển thị nếu có view_my_orders HOẶC view_all_orders
            let shouldShowMyOrders = false;
            if (typeof hasPermission === 'function') {
                shouldShowMyOrders = hasPermission(user, 'view_my_orders') || hasPermission(user, 'view_all_orders');
            }
            if (!shouldShowMyOrders) {
                shouldShowMyOrders = ['TVBH', 'SALE', 'ADMIN', 'SALEADMIN'].includes(user.role);
            }
            if (shouldShowMyOrders) {
                $('nav-my-orders')?.classList.remove('hidden');
            } else {
                $('nav-my-orders')?.classList.add('hidden');
            }
            
            if (typeof hasPermission === 'function' && hasPermission(user, 'submit_daily_report')) {
                $('nav-daily-report')?.classList.remove('hidden');
            } else if (user.role === 'TVBH' || user.role === 'SALE') {
                $('nav-daily-report')?.classList.remove('hidden');
            } else {
                $('nav-daily-report')?.classList.add('hidden');
            }
            
            // SALEADMIN/ADMIN menu - Xem tất cả đơn hàng
            if (typeof hasPermission === 'function' && hasPermission(user, 'view_all_orders')) {
                $('nav-orders-admin')?.classList.remove('hidden');
            } else if (user.role === 'SALEADMIN' || user.role === 'ADMIN') {
                $('nav-orders-admin')?.classList.remove('hidden');
            } else {
                $('nav-orders-admin')?.classList.add('hidden');
            }
            
            // Dashboard menu
            if (typeof hasPermission === 'function' && hasPermission(user, 'view_dashboard')) {
                $('nav-reports-dashboard')?.classList.remove('hidden');
                $('nav-reports-mtd-detail')?.classList.remove('hidden');
            } else if (['ADMIN', 'GDKD', 'BKS', 'BGD'].includes(user.role)) {
                $('nav-reports-dashboard')?.classList.remove('hidden');
                $('nav-reports-mtd-detail')?.classList.remove('hidden');
            } else {
                $('nav-reports-dashboard')?.classList.add('hidden');
                $('nav-reports-mtd-detail')?.classList.add('hidden');
            }
            
            // Manage users menu
            if (typeof hasPermission === 'function' && hasPermission(user, 'manage_users')) {
                $('nav-users')?.classList.remove('hidden');
                $('nav-mobile-users')?.classList.remove('hidden');
            } else if (user.role === 'ADMIN') {
                $('nav-users')?.classList.remove('hidden');
                $('nav-mobile-users')?.classList.remove('hidden');
            } else {
                $('nav-users')?.classList.add('hidden');
                $('nav-mobile-users')?.classList.add('hidden');
            }
            
            // Manage TVBH targets menu
            if (typeof hasPermission === 'function' && hasPermission(user, 'manage_tvbh_targets')) {
                $('nav-tvbh-targets')?.classList.remove('hidden');
            } else if (user.role === 'ADMIN') {
                $('nav-tvbh-targets')?.classList.remove('hidden');
            } else {
                $('nav-tvbh-targets')?.classList.add('hidden');
            }
        }
        
        if (loginView) loginView.classList.add('hidden');
        if (loginContainer) {
            loginContainer.style.display = 'none';
            loginContainer.classList.add('hidden');
        }
        dash?.classList.remove('hidden');
        dash?.classList.add('flex');
    } else {
        showLogin();
    }
}

function showLogin() {
    const loginContainer = $('login-container');
    const loginView = $('login-view') || loginContainer?.querySelector('#login-view');
    const dash = $('dashboard-view');
    if (loginView) loginView.classList.remove('hidden');
    if (loginContainer) {
        loginContainer.style.display = 'block';
        loginContainer.classList.remove('hidden');
    }
    dash?.classList.add('hidden');
    dash?.classList.remove('flex');
}

async function handleLogin(e) {
    e.preventDefault();
    const username = $('login-user')?.value;
    const password = $('login-pass')?.value;
    
    if (!username || !password) {
        Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    try {
        const res = await callAPI({ action: 'login', username, password });
        if (res.success && res.user) {
            // Kiểm tra nếu cần đổi mật khẩu
            if (res.user.need_change_pass) {
                // Hiển thị modal yêu cầu đổi mật khẩu
                await showChangePasswordModal(res.user, true);
            } else {
                // Đăng nhập bình thường - thêm login_time để track session timeout
                const userWithTime = {
                    ...res.user,
                    login_time: new Date().toISOString()
                };
                localStorage.setItem('user_session', JSON.stringify(userWithTime));
                
                // Hiển thị thông báo đăng nhập thành công
                await Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    text: `Chào mừng ${res.user.fullname || res.user.username}`,
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                
                location.reload();
            }
        } else {
            // Login failed - clear password and re-enable form
            const passwordInput = document.getElementById('login-pass');
            const loginBtn = document.getElementById('btn-login');
            
            // Clear password for security
            if (passwordInput) {
                passwordInput.value = '';
            }
            
            // Show error message
            await Swal.fire('Lỗi', res.message || 'Đăng nhập thất bại', 'error');
            
            // Re-enable button and focus password field
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.classList.remove('loading');
                const btnText = document.getElementById('btn-login-text');
                if (btnText) btnText.textContent = 'Đăng Nhập';
            }
            
            // Focus password field for easy retry
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 300);
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        // Connection error - clear password and re-enable form
        const passwordInput = document.getElementById('login-pass');
        const loginBtn = document.getElementById('btn-login');
        
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        await Swal.fire('Lỗi', 'Không thể kết nối đến server', 'error');
        
        // Re-enable button and focus password field
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            const btnText = document.getElementById('btn-login-text');
            if (btnText) btnText.textContent = 'Đăng Nhập';
        }
        
        if (passwordInput) {
            setTimeout(() => passwordInput.focus(), 300);
        }
    }
}

async function showChangePasswordModal(user, isFirstLogin = false) {
    // Use the new modal component instead of SweetAlert
    if (typeof window.openChangePasswordModal === 'function') {
        window.openChangePasswordModal(isFirstLogin);
        return;
    }
    
    // Fallback to SweetAlert if modal not loaded yet
    console.warn('Change password modal component not loaded, using SweetAlert fallback');
    const title = isFirstLogin 
        ? 'Yêu cầu đổi mật khẩu' 
        : 'Đổi mật khẩu';
    const message = isFirstLogin
        ? 'Đây là lần đăng nhập đầu tiên. Vui lòng đổi mật khẩu để tiếp tục.'
        : 'Vui lòng đổi mật khẩu của bạn.';
    
    const result = await Swal.fire({
        title: title,
        html: `
            <div style="text-align: left;">
                <p style="margin-bottom: 15px; color: #666;">${message}</p>
                ${!isFirstLogin ? `
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Mật khẩu cũ:</label>
                <input id="swal-old-pass" type="password" class="swal2-input" placeholder="Nhập mật khẩu cũ" style="margin-bottom: 15px;" required>
                ` : ''}
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Mật khẩu mới:</label>
                <input id="swal-new-pass" type="password" class="swal2-input" placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" style="margin-bottom: 15px;" required>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Xác nhận mật khẩu mới:</label>
                <input id="swal-confirm-pass" type="password" class="swal2-input" placeholder="Nhập lại mật khẩu mới" required>
            </div>
        `,
        showCancelButton: false,
        confirmButtonText: 'Đổi mật khẩu',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            const newPassInput = Swal.getPopup().querySelector('#swal-new-pass');
            if (newPassInput) newPassInput.focus();
        },
        preConfirm: () => {
            const oldPassInput = Swal.getPopup().querySelector('#swal-old-pass');
            const newPassInput = Swal.getPopup().querySelector('#swal-new-pass');
            const confirmPassInput = Swal.getPopup().querySelector('#swal-confirm-pass');
            
            const oldPass = oldPassInput ? oldPassInput.value : '';
            const newPass = newPassInput ? newPassInput.value : '';
            const confirmPass = confirmPassInput ? confirmPassInput.value : '';
            
            if (!newPass || newPass.length < 6) {
                Swal.showValidationMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
                return false;
            }
            
            if (newPass !== confirmPass) {
                Swal.showValidationMessage('Mật khẩu xác nhận không khớp');
                return false;
            }
            
            if (!isFirstLogin && !oldPass) {
                Swal.showValidationMessage('Vui lòng nhập mật khẩu cũ');
                return false;
            }
            
            return { oldPass, newPass };
        }
    });
    
    if (result.isConfirmed && result.value) {
        try {
            Swal.fire({
                title: 'Đang xử lý...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const changeRes = await callAPI({
                action: 'change_password',
                username: user.username,
                old_pass: result.value.oldPass || '',
                new_pass: result.value.newPass
            });
            
            if (changeRes.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: changeRes.message || 'Đã đổi mật khẩu thành công',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Cập nhật user session với thông tin mới
                    if (changeRes.user) {
                        localStorage.setItem('user_session', JSON.stringify(changeRes.user));
                    } else {
                        // Nếu không có user mới, cập nhật need_change_pass = false
                        user.need_change_pass = false;
                        localStorage.setItem('user_session', JSON.stringify(user));
                    }
                    location.reload();
                });
            } else {
                Swal.fire('Lỗi', changeRes.message || 'Đổi mật khẩu thất bại', 'error');
                // Nếu là lần đăng nhập đầu tiên, hiển thị lại modal
                if (isFirstLogin) {
                    await showChangePasswordModal(user, true);
                }
            }
        } catch (error) {
            Swal.fire('Lỗi', error.message || 'Không thể kết nối đến server', 'error');
            // Nếu là lần đăng nhập đầu tiên, hiển thị lại modal
            if (isFirstLogin) {
                await showChangePasswordModal(user, true);
            }
        }
    }
}

