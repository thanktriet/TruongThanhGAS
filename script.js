/*
 * File: script.js (của trang index.html)
 * ĐÃ THÊM LOG ĐỂ GỠ LỖI
 */

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUS4aLRcEjqZfM_71ytnS4rH9mGOFoH-RrTQ_c5sgxlrNtmCQC7e_Ls5paCRt1eimPQQ/exec';

// Chuyển hướng nếu đã đăng nhập rồi
if (localStorage.getItem('sessionToken')) {
    window.location.href = 'dashboard.html';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn form gửi theo cách truyền thống

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    const loginButton = document.getElementById('loginButton');

    messageDiv.textContent = 'Đang đăng nhập...';
    loginButton.disabled = true;

    const data = {
        action: 'login',
        username: username,
        password: password
    };

    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data) // Gửi dữ liệu dưới dạng chuỗi JSON
    })
    .then(response => response.json())
    .then(result => {
        
        // --- BẮT ĐẦU VÙNG GỠ LỖI ---
        console.log('Phản hồi từ Server:', result); // DÒNG 1: In ra kết quả nhận được

        if (result.status === 'success' && result.token) {
            
            console.log('Đã nhận Token, đang lưu...'); // DÒNG 2: Báo hiệu chuẩn bị lưu
            localStorage.setItem('sessionToken', result.token);
            
            console.log('Đã lưu Token! Đang chuyển hướng...'); // DÒNG 3: Báo hiệu chuẩn bị chuyển trang
            window.location.href = 'dashboard.html';

        } else {
            // Đăng nhập thất bại
            console.warn('Lỗi đăng nhập hoặc không có token:', result.message); // DÒNG 4: Báo lỗi nếu thất bại
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'red';
        }
        // --- KẾT THÚC VÙNG GỠ LỖI ---

    })
    .catch(error => {
        console.error('Lỗi fetch:', error); // DÒNG 5: Báo lỗi nếu mạng
        messageDiv.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        messageDiv.style.color = 'red';
    })
    .finally(() => {
        loginButton.disabled = false;
    });
});
