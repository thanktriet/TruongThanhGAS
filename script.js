/*
 * File: script.js
 * Frontend logic để gọi API Backend
 */

// DÁN URL WEB APP CỦA BẠN (từ Bước 1) VÀO ĐÂY
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUS4aLRcEjqZfM_71ytnS4rH9mGOFoH-RrTQ_c5sgxlrNtmCQC7e_Ls5paCRt1eimPQQ/exec';

// Lắng nghe sự kiện submit form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn form gửi theo cách truyền thống

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const loginButton = document.getElementById('loginButton');

    // Hiển thị trạng thái đang tải
    messageDiv.textContent = 'Đang đăng nhập...';
    loginButton.disabled = true;

    // Chuẩn bị dữ liệu gửi lên backend
    const data = {
        action: 'login', // Cho backend biết chúng ta muốn làm gì
        username: username,
        password: password
    };

    // Gọi API của Apps Script bằng fetch
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors', // Cần thiết để gọi API từ domain khác (GitHub -> Google)
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Apps Script thường nhận text/plain
        },
        body: JSON.stringify(data) // Gửi dữ liệu dưới dạng chuỗi JSON
    })
    .then(response => response.json()) // Chuyển đổi phản hồi sang JSON
    .then(result => {
        console.log(result); // Xem kết quả ở Console
        
        if (result.status === 'success') {
            // Đăng nhập thành công
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            
            // Chuyển hướng đến trang chính của ERP (ví dụ: dashboard.html)
            // window.location.href = 'dashboard.html';
        } else {
            // Đăng nhập thất bại
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'red';
        }
    })
    .catch(error => {
        // Xử lý lỗi mạng hoặc lỗi phân tích JSON
        console.error('Lỗi:', error);
        messageDiv.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        messageDiv.style.color = 'red';
    })
    .finally(() => {
        // Kích hoạt lại nút bấm
        loginButton.disabled = false;
    });
});
