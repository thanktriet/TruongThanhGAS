/*
 * File: dashboard.js
 * Script này bảo vệ trang dashboard
 */

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUS4aLRcEjqZfM_71ytnS4rH9mGOFoH-RrTQ_c5sgxlrNtmCQC7e_Ls5paCRt1eimPQQ/exec';

// Hàm tự chạy ngay khi tải trang
(function() {
    // 1. Lấy token từ bộ nhớ
    const token = localStorage.getItem('sessionToken');

    if (!token) {
        // 2. Nếu không có token, đuổi về trang đăng nhập
        window.location.href = 'index.html';
        return;
    }

    // 3. Nếu có token, gửi lên server để kiểm tra
    verifyToken(token);

})();

function verifyToken(token) {
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
            action: 'verifyToken',
            token: token
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            // 4. Token hợp lệ, chào mừng user
            document.getElementById('username').textContent = result.username;
        } else {
            // 5. Token không hợp lệ (hết hạn, giả mạo), xóa token cũ và đuổi về
            localStorage.removeItem('sessionToken');
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Lỗi xác thực:', error);
        window.location.href = 'index.html';
    });
}

// Xử lý nút Đăng xuất
document.getElementById('logoutButton').addEventListener('click', function() {
    const token = localStorage.getItem('sessionToken');
    
    // Xóa token ở frontend
    localStorage.removeItem('sessionToken');

    // Báo cho backend biết để xóa token ở server (không bắt buộc nhưng nên làm)
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'logout',
            token: token
        })
    });

    // Chuyển về trang đăng nhập
    window.location.href = 'index.html';
});
