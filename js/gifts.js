/**
 * Gift Management Functions
 */
function addGiftRow(containerId) {
    const container = $(containerId);
    if (!container) return;
    
    // Xóa message "Chưa có quà tặng" nếu đây là quà đầu tiên
    if (container.querySelectorAll('.gift-row').length === 0) {
        container.innerHTML = '';
    }
    
    const rowId = `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const html = `
        <div class="flex gap-2 mb-2 gift-row items-center bg-gray-50 p-2 rounded border border-gray-200" id="${rowId}">
            <input class="gift-name flex-1 border p-1.5 rounded text-sm outline-none focus:border-blue-500 bg-white" 
                   placeholder="Nhập tên quà tặng">
            <input class="gift-price w-32 border p-1.5 rounded text-sm text-right outline-none focus:border-blue-500 bg-white" 
                   placeholder="0" 
                   oninput="formatMoneyInput(this); calcGiftTotal('${containerId}')">
            <button type="button" 
                    onclick="removeGiftRow('${rowId}','${containerId}')" 
                    class="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function removeGiftRow(rowId, containerId) {
    const row = $(rowId);
    if (row) {
        row.remove();
        calcGiftTotal(containerId);
        
        // Kiểm tra nếu không còn quà nào thì hiển thị message
        const container = $(containerId);
        if (container && container.querySelectorAll('.gift-row').length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-2">Chưa có quà tặng. Nhấn "Thêm quà" để thêm.</p>';
        }
    }
}

function calcGiftTotal(containerId) {
    const container = $(containerId);
    if (!container) return;
    
    let total = 0;
    container.querySelectorAll('.gift-row').forEach(row => {
        const priceInput = row.querySelector('.gift-price');
        if (priceInput) {
            const val = parseInt(priceInput.value.replace(/\./g, '')) || 0;
            total += val;
        }
    });
    
    const displayId = containerId === 'gift-list-search' 
        ? 'total-gift-search' 
        : (containerId === 'gift-list-edit' ? 'total-gift-edit' : 'total-gift-manual');
    const displayEl = $(displayId);
    if (displayEl) {
        displayEl.textContent = total.toLocaleString('vi-VN') + ' đ';
    }
}

function packGiftData(containerId, hiddenInputId) {
    const container = $(containerId);
    const hiddenInput = $(hiddenInputId);
    if (!container || !hiddenInput) {
        console.error('packGiftData: Container or hiddenInput not found', { containerId, hiddenInputId });
        return;
    }
    
    const gifts = [];
    container.querySelectorAll('.gift-row').forEach(row => {
        const nameInput = row.querySelector('.gift-name');
        const priceInput = row.querySelector('.gift-price');
        const name = nameInput?.value.trim();
        
        if (name) {
            // Loại bỏ dấu chấm và các ký tự không phải số từ giá trị
            const priceValue = (priceInput?.value || '0').toString().replace(/\./g, '').replace(/[^\d]/g, '');
            gifts.push({
                name,
                price: priceValue || '0'
            });
        }
    });
    
    hiddenInput.value = JSON.stringify(gifts);
    console.log('packGiftData result:', hiddenInput.value);
}



