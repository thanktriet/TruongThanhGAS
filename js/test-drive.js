/**
 * Test Drive - Xe lái thử
 */

let testDriveVehiclesData = [];
let testDriveRequestsData = [];
let testDriveRequestsFilter = { status: 'all' };

const TDR_CHECK_POINTS = [
    { key: 'ben_trai', label: 'Bên trái' },
    { key: 'ben_phai', label: 'Bên phải' },
    { key: 'phia_truoc', label: 'Phía trước' },
    { key: 'phia_sau', label: 'Phía sau' },
    { key: 'noi_that', label: 'Nội thất' }
];
const TDR_MUC_DICH_OPTIONS = [
    { value: 'Khach_lai_thu', label: 'Khách lái thử' },
    { value: 'Cong_vu', label: 'Công vụ' },
    { value: 'Ban_Lanh_Dao', label: 'Ban Lãnh Đạo Sử Dụng' },
    { value: 'Muc_dich_khac', label: 'Mục đích khác' }
];
const TDR_STATUS_OPTIONS = [
    { value: 'Tot', label: 'Tốt' },
    { value: 'Xe_xuoc_tray_mop_dinh_dinh', label: 'Xe hư hỏng, móp, trầy, xước' },
    { value: 'Xe_do', label: 'Xe dơ' },
    { value: 'Xe_bao_loi', label: 'Xe báo lỗi' }
];

function toDrivePreviewUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    return url.replace(/\/file\/d\/([^/]+)\/view/, '/file/d/$1/preview');
}

function openTestDriveImage(url, label) {
    if (!url) return;
    const isMobile = window.innerWidth < 640 || ('ontouchstart' in window);
    if (isMobile && typeof Swal !== 'undefined') {
        const previewUrl = toDrivePreviewUrl(url);
        const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        Swal.fire({
            html: '<iframe src="' + esc(previewUrl) + '" style="width:100%;height:70vh;border:none;border-radius:8px;"></iframe>',
            title: label || 'Xem ảnh',
            showConfirmButton: true,
            confirmButtonText: 'Đóng',
            width: '95%',
            customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl' }
        });
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

function buildTdrCheckFormHtml(prefix) {
    let html = '<div class="text-left space-y-3">';
    TDR_CHECK_POINTS.forEach(p => {
        const selId = prefix + '_' + p.key;
        const fileId = prefix + '_img_' + p.key;
        html += '<div class="bg-white rounded-xl border border-slate-200 p-3 sm:p-3 tdr-check-point touch-manipulation" data-point="' + p.key + '">';
        html += '<label class="block text-sm font-medium text-gray-700 mb-2">' + p.label + '</label>';
        html += '<select id="' + selId + '" class="input w-full text-sm border-gray-300 rounded-xl py-2.5 min-h-[44px] tdr-status-select touch-manipulation" data-point="' + p.key + '">';
        TDR_STATUS_OPTIONS.forEach(o => { html += '<option value="' + o.value + '">' + o.label + '</option>'; });
        html += '</select>';
        html += '<div class="tdr-file-wrap hidden mt-2 pt-2 border-t border-slate-100" data-point="' + p.key + '"><label class="block text-xs font-medium text-gray-500 mb-1">Ảnh (bắt buộc)</label><input type="file" id="' + fileId + '" accept="image/*" multiple class="input w-full text-sm rounded-xl py-2 min-h-[44px] touch-manipulation"></div>';
        html += '</div>';
    });
    html += '</div>';
    return html;
}

function bindMucDichToggle() {
    const sel = document.getElementById('tdr-muc-dich-loai');
    const wrapKhach = document.getElementById('tdr-muc-dich-khach-lai-thu');
    const wrapChiTiet = document.getElementById('tdr-muc-dich-chi-tiet');
    const chiTietInput = document.getElementById('tdr-muc-dich-chi-tiet-input');
    if (!sel || !wrapKhach || !wrapChiTiet) return;
    const toggle = () => {
        const v = sel.value;
        const isKhach = v === 'Khach_lai_thu';
        const isKhac = v === 'Cong_vu' || v === 'Ban_Lanh_Dao' || v === 'Muc_dich_khac';
        wrapKhach.classList.toggle('hidden', !isKhach);
        wrapChiTiet.classList.toggle('hidden', !isKhac);
        if (chiTietInput) chiTietInput.required = isKhac;
        if (chiTietInput && !isKhac) chiTietInput.value = '';
    };
    toggle();
    sel.addEventListener('change', toggle);
}

async function collectMucDichData() {
    const sel = document.getElementById('tdr-muc-dich-loai');
    const type = sel && sel.value ? sel.value : '';
    if (!type) return { error: 'Vui lòng chọn mục đích sử dụng xe' };
    const uploadApi = typeof window.googleDocsAPI !== 'undefined' && window.googleDocsAPI.uploadTestDriveImages;
    if (type === 'Khach_lai_thu') {
        const bangLaiEl = document.getElementById('tdr-anh-bang-lai');
        const giayDeNghiEl = document.getElementById('tdr-anh-giay-de-nghi');
        const bangLaiFiles = bangLaiEl && bangLaiEl.files && bangLaiEl.files.length ? bangLaiEl.files : null;
        const giayFiles = giayDeNghiEl && giayDeNghiEl.files && giayDeNghiEl.files.length ? giayDeNghiEl.files : null;
        if (!bangLaiFiles || bangLaiFiles.length === 0) return { error: 'Vui lòng đính kèm ảnh Bằng lái xe' };
        if (!giayFiles || giayFiles.length === 0) return { error: 'Vui lòng đính kèm ảnh Giấy đề nghị lái thử (có đủ chữ ký)' };
        if (!uploadApi) return { error: 'Chức năng upload ảnh chưa sẵn sàng' };
        const upBangLai = await uploadApi(bangLaiFiles);
        if (!upBangLai.success || !upBangLai.urls) return { error: upBangLai.message || 'Lỗi upload ảnh Bằng lái xe' };
        const upGiay = await uploadApi(giayFiles);
        if (!upGiay.success || !upGiay.urls) return { error: upGiay.message || 'Lỗi upload ảnh Giấy đề nghị lái thử' };
        const toUrls = (arr) => Array.isArray(arr) ? arr.map(u => typeof u === 'string' ? u : (u && u.url) || '').filter(Boolean) : [];
        return {
            muc_dich_extra: { type, anh_bang_lai: toUrls(upBangLai.urls), anh_giay_de_nghi: toUrls(upGiay.urls) },
            muc_dich_su_dung_xe: 'Khách lái thử'
        };
    }
    const chiTietInput = document.getElementById('tdr-muc-dich-chi-tiet-input');
    const chiTiet = (chiTietInput && chiTietInput.value ? chiTietInput.value : '').trim();
    if (!chiTiet) return { error: 'Vui lòng nhập mục đích cụ thể' };
    const lbl = TDR_MUC_DICH_OPTIONS.find(o => o.value === type);
    return {
        muc_dich_extra: { type, chi_tiet: chiTiet },
        muc_dich_su_dung_xe: (lbl ? lbl.label : type) + ' - ' + chiTiet
    };
}

function bindTdrStatusToggle(prefix, container) {
    const root = container || document;
    root.querySelectorAll('.tdr-status-select').forEach(sel => {
        const point = sel.getAttribute('data-point');
        const wrap = root.querySelector('.tdr-file-wrap[data-point="' + point + '"]');
        const toggle = () => {
            if (wrap) wrap.classList.toggle('hidden', sel.value === 'Tot' || sel.value === 'tot');
        };
        toggle();
        sel.addEventListener('change', toggle);
    });
}

async function collectTdrCheckWithUpload(prefix) {
    const preCheck = {};
    const uploadApi = typeof window.googleDocsAPI !== 'undefined' && window.googleDocsAPI.uploadTestDriveImages;
    for (const p of TDR_CHECK_POINTS) {
        const sel = document.getElementById(prefix + '_' + p.key);
        const fileEl = document.getElementById(prefix + '_img_' + p.key);
        const status = (sel && sel.value) ? sel.value : 'tot';
        const entry = { status };
        const needImage = status !== 'Tot' && status !== 'tot';
        if (needImage) {
            const files = fileEl && fileEl.files && fileEl.files.length ? fileEl.files : null;
            if (!files || files.length === 0) {
                if (uploadApi) return { error: 'Vui lòng chọn ít nhất 1 ảnh cho điểm "' + p.label + '" (trạng thái không Tốt).' };
                entry.images = [];
            } else {
                if (uploadApi) {
                    const up = await uploadApi(files);
                    if (!up.success || !up.urls) return { error: up.message || 'Lỗi upload ảnh ' + p.label };
                    // GAS trả về urls là array of { name, url, id } → chuẩn hóa thành array URL string
                    entry.images = Array.isArray(up.urls) ? up.urls.map(function (u) { return typeof u === 'string' ? u : (u && u.url) || ''; }).filter(Boolean) : [];
                } else {
                    entry.images = [];
                }
            }
        }
        preCheck[p.key] = entry;
    }
    return { preCheck };
}

async function loadTestDriveVehicles(retryCount) {
    retryCount = retryCount || 0;
    const container = document.getElementById('test-drive-vehicles-list');
    if (!container) {
        console.warn('[loadTestDriveVehicles] Container test-drive-vehicles-list not found');
        if (retryCount < 3) {
            setTimeout(() => loadTestDriveVehicles(retryCount + 1), 300);
        }
        return;
    }
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) {
        container.innerHTML = '<div class="text-center py-8"><p class="text-amber-600 mb-2">Phiên đăng nhập hết hạn.</p><button type="button" onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Tải lại trang</button></div>';
        return;
    }
    container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Đang tải...</p></div>';
    try {
        const res = await callAPI({ action: 'list_test_drive_vehicles', username: session.username, role: session.role });
        if (!res.success && (res.message || '').includes('chưa được khởi tạo') && retryCount < 2) {
            setTimeout(() => loadTestDriveVehicles(retryCount + 1), 800);
            return;
        }
        if (!res.success) {
            container.innerHTML = '<div class="text-center py-8"><p class="text-red-500 mb-2">' + (res.message || 'Lỗi tải dữ liệu') + '</p><button type="button" onclick="loadTestDriveVehicles()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Tải lại</button></div>';
            return;
        }
        testDriveVehiclesData = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        const statusBadge = (s) => {
            const map = { ranh: 'bg-green-100 text-green-800', dang_su_dung: 'bg-yellow-100 text-yellow-800', tam_khoa: 'bg-red-100 text-red-800' };
            const lbl = { ranh: 'Rảnh', dang_su_dung: 'Đang sử dụng', tam_khoa: 'Tạm khóa' };
            return '<span class="text-xs font-bold px-2 py-1 rounded ' + (map[s] || 'bg-gray-100') + '">' + (lbl[s] || s) + '</span>';
        };
        if (!testDriveVehiclesData.length) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Chưa có xe lái thử nào</p>';
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const tinhTrangSummary = (obj) => {
            if (!obj || typeof obj !== 'object') return '-';
            const pts = ['ben_trai', 'ben_phai', 'phia_truoc', 'phia_sau', 'noi_that'];
            const labels = { Tot: 'Tốt', Xe_xuoc_tray_mop_dinh_dinh: 'Hư hỏng, móp, trầy, xước', Xe_do: 'Dơ', Xe_bao_loi: 'Lỗi' };
            const arr = pts.map(k => { const e = obj[k]; return e && e.status ? (labels[e.status] || e.status) : null; }).filter(Boolean);
            return arr.length ? arr.join(', ') : '-';
        };
        container.innerHTML = testDriveVehiclesData.map(v => {
            const hanBH = v.han_bao_hiem ? String(v.han_bao_hiem).split('T')[0] : null;
            const hanDK = v.han_dang_kiem ? String(v.han_dang_kiem).split('T')[0] : null;
            const hetHan = (hanBH && hanBH < today) || (hanDK && hanDK < today);
            const statusLbl = v.trang_thai_su_dung === 'tam_khoa' && hetHan ? 'Tạm khóa (hết hạn BH/ĐK)' : (v.trang_thai_su_dung === 'ranh' ? 'Rảnh' : v.trang_thai_su_dung === 'dang_su_dung' ? 'Đang sử dụng' : 'Tạm khóa');
            const statusClass = v.trang_thai_su_dung === 'ranh' ? 'bg-green-100 text-green-800' : v.trang_thai_su_dung === 'dang_su_dung' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
            return `
        <div class="p-4 sm:p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold text-indigo-800 text-lg">${v.bien_so_xe || '-'}</span>
                    <span class="text-gray-600">${v.loai_xe || ''} ${v.phien_ban || ''}</span>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${statusClass}">${statusLbl}</span>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 pt-2 border-t border-gray-100">
                <div class="flex items-start gap-1.5"><i class="fa-solid fa-shield-halved text-slate-400 mt-0.5"></i><span>BH ${v.han_bao_hiem_fmt || '-'} · ĐK ${v.han_dang_kiem_fmt || '-'}</span></div>
                <div class="flex items-start gap-1.5"><i class="fa-solid fa-gauge-high text-slate-400 mt-0.5"></i><span>ODO: ${v.odo_hien_tai ?? 0} km</span></div>
                <div class="flex items-start gap-1.5"><i class="fa-solid fa-road text-slate-400 mt-0.5"></i><span>Tổng: ${v.tong_quang_duong_da_di ?? 0} km</span></div>
                <div class="flex items-start gap-1.5"><i class="fa-solid fa-clipboard-check text-slate-400 mt-0.5"></i><span class="text-gray-700">${tinhTrangSummary(v.tinh_trang_hien_tai)}</span></div>
            </div>
        </div>`;
        }).join('');
    } catch (e) {
        console.error('[loadTestDriveVehicles] Error:', e);
        container.innerHTML = '<div class="text-center py-8"><p class="text-red-500 mb-2">Lỗi: ' + (e.message || 'Không tải được danh sách') + '</p><button type="button" onclick="loadTestDriveVehicles()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Tải lại</button></div>';
    }
}

async function handleCreateTestDriveVehicle(e) {
    e.preventDefault();
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) { Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error'); return; }
    const form = e.target;
    const fd = new FormData(form);
    const payload = { username: session.username, role: session.role };
    fd.forEach((v, k) => { payload[k] = v; });
    const res = await callAPI({ action: 'create_test_drive_vehicle', ...payload });
    const statusEl = document.getElementById('create-vehicle-status');
    if (res.success) {
        if (statusEl) statusEl.textContent = 'Đã thêm xe thành công';
        if (typeof Swal !== 'undefined') Swal.fire('Thành công', 'Đã thêm xe lái thử', 'success');
        form.reset();
        loadTestDriveVehicles();
    } else {
        if (statusEl) statusEl.textContent = res.message || 'Lỗi';
        if (typeof Swal !== 'undefined') Swal.fire('Lỗi', res.message || 'Không thể thêm xe', 'error');
    }
}

async function loadTestDriveRequestCreate() {
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) return;
    const sel = document.getElementById('test-drive-vehicle-select');
    const statusEl = document.getElementById('test-drive-vehicle-select-status');
    if (!sel) return;
    // Bind mục đích toggle ngay để form hiện điều kiện khi chọn Khách lái thử / mục đích khác
    bindMucDichToggle();
    sel.innerHTML = '<option value="">Đang tải...</option>';
    try {
        const res = await callAPI({ action: 'list_test_drive_vehicles', for_request: true, username: session.username, role: session.role });
        sel.innerHTML = '<option value="">-- Chọn xe --</option>';
        if (!res.success) {
            if (statusEl) statusEl.innerHTML = '<span class="text-red-500 text-sm">' + (res.message || 'Lỗi tải danh sách xe') + ' <button type="button" onclick="loadTestDriveRequestCreate && loadTestDriveRequestCreate()" class="underline ml-1">Tải lại</button></span>';
            return;
        }
        const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        list.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.setAttribute('data-odo', String(v.odo_hien_tai != null ? v.odo_hien_tai : 0));
            opt.textContent = `${v.bien_so_xe || ''} - ${v.loai_xe || ''} ${v.phien_ban || ''}`.trim() || v.id;
            sel.appendChild(opt);
        });
        if (statusEl) statusEl.textContent = list.length ? list.length + ' xe đủ điều kiện' : 'Chưa có xe rảnh và còn hạn BH/ĐK';
        const odoHintEl = document.getElementById('tdr-odo-system-hint');
        const updateOdoHint = () => {
            if (!odoHintEl) return;
            const chosen = sel.options[sel.selectedIndex];
            if (!chosen || !chosen.value) {
                odoHintEl.textContent = '';
                return;
            }
            const odoSys = chosen.getAttribute('data-odo');
            const odoNum = odoSys != null && odoSys !== '' ? parseInt(odoSys, 10) : null;
            if (odoNum != null && !isNaN(odoNum)) {
                odoHintEl.textContent = 'ODO trong hệ thống (quản lý xe lái thử, chỉ tham khảo — không phải số thực tế): ' + odoNum.toLocaleString('vi-VN') + ' km';
            } else {
                odoHintEl.textContent = '';
            }
        };
        sel.addEventListener('change', updateOdoHint);
        updateOdoHint();
        const preCheckContainer = document.getElementById('tdr-create-pre-check-container');
        if (preCheckContainer && !preCheckContainer.querySelector('.tdr-status-select')) {
            preCheckContainer.innerHTML = buildTdrCheckFormHtml('tdr_create_pre');
            bindTdrStatusToggle('tdr_create_pre');
        }
    } catch (e) {
        console.error('[loadTestDriveRequestCreate] Error:', e);
        sel.innerHTML = '<option value="">-- Chọn xe --</option>';
        if (statusEl) statusEl.innerHTML = '<span class="text-red-500 text-sm">Lỗi: ' + (e.message || 'Không tải được') + ' <button type="button" onclick="loadTestDriveRequestCreate && loadTestDriveRequestCreate()" class="underline ml-1">Tải lại</button></span>';
    }
}

async function handleCreateTestDriveRequest(e) {
    e.preventDefault();
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) { Swal.fire('Lỗi', 'Phiên đăng nhập đã hết hạn', 'error'); return; }
    const form = e.target;
    const mucDichRes = await collectMucDichData();
    if (mucDichRes.error) {
        Swal.fire('Lỗi', mucDichRes.error, 'error');
        return;
    }
    const odoEl = document.getElementById('tdr-create-odo');
    const odoTruoc = odoEl ? parseInt(odoEl.value, 10) : null;
    if (odoTruoc == null || isNaN(odoTruoc) || odoTruoc < 0) {
        Swal.fire('Lỗi', 'Vui lòng nhập ODO trước khi nhận xe (số km hợp lệ).', 'error');
        return;
    }
    const collected = await collectTdrCheckWithUpload('tdr_create_pre');
    if (collected.error) {
        Swal.fire('Lỗi', collected.error, 'error');
        return;
    }
    const fd = new FormData(form);
    const payload = { username: session.username, nguoi_tao: session.fullname || session.username, odo_truoc: odoTruoc, pre_check: collected.preCheck, muc_dich_extra: mucDichRes.muc_dich_extra, muc_dich_su_dung_xe: mucDichRes.muc_dich_su_dung_xe };
    fd.forEach((v, k) => { if (k !== 'odo_truoc' && k !== 'muc_dich_loai' && k !== 'muc_dich_chi_tiet') payload[k] = v; });
    payload.odo_truoc = odoTruoc;
    payload.pre_check = collected.preCheck;
    const res = await callAPI({ action: 'create_test_drive_request', ...payload });
    const statusEl = document.getElementById('create-request-status');
    if (res.success) {
        if (typeof Swal !== 'undefined') Swal.fire('Thành công', 'Đã tạo tờ trình. Bạn có thể gửi duyệt từ danh sách.', 'success');
        form.reset();
        bindMucDichToggle();
        const preCheckContainer = document.getElementById('tdr-create-pre-check-container');
        if (preCheckContainer) preCheckContainer.innerHTML = buildTdrCheckFormHtml('tdr_create_pre');
        bindTdrStatusToggle('tdr_create_pre');
        if (statusEl) statusEl.textContent = 'Đã tạo tờ trình. Chuyển sang "Danh sách tờ trình" để gửi duyệt.';
        switchTab('test-drive-requests');
    } else {
        if (statusEl) statusEl.textContent = res.message || 'Lỗi';
        if (typeof Swal !== 'undefined') Swal.fire('Lỗi', res.message || 'Không thể tạo tờ trình', 'error');
    }
}

async function loadTestDriveRequests() {
    setupTestDriveFilters();
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) return;
    const container = document.getElementById('test-drive-requests-container');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Đang tải...</p></div>';
    try {
        const res = await callAPI({ action: 'get_test_drive_requests', username: session.username, role: session.role });
        if (!res.success) {
            container.innerHTML = '<p class="text-red-500 text-center py-8">' + (res.message || 'Lỗi') + '</p>';
            return;
        }
        testDriveRequestsData = res.data || [];
        const statusFilter = (document.getElementById('test-drive-status-filter') || {}).value || 'all';
        let list = testDriveRequestsData;
        if (statusFilter !== 'all') list = list.filter(r => (r.trang_thai_to_trinh || r.trang_thai_label) === statusFilter);
        const statusForDisplay = (r) => r.trang_thai_to_trinh === 'Tu_Choi' ? 'Tu_Choi' : (r.trang_thai_label || r.trang_thai_to_trinh);
        const statusBadge = (s) => {
            const m = { Draft: 'bg-gray-100', Cho_BKS_Duyet: 'bg-yellow-100', Cho_BGD_Duyet: 'bg-yellow-100', Da_Duyet_Dang_Su_Dung: 'bg-blue-100', Hoan_Thanh: 'bg-green-100', Tu_Choi: 'bg-red-100' };
            const lbl = { Draft: 'Nháp', Cho_BKS_Duyet: 'Chờ BKS', Cho_BGD_Duyet: 'Chờ BGĐ', Da_Duyet_Dang_Su_Dung: 'Đang sử dụng', Hoan_Thanh: 'Hoàn thành', Tu_Choi: 'Từ chối' };
            return '<span class="text-xs font-bold px-2 py-1 rounded ' + (m[s] || 'bg-gray-100') + '">' + (lbl[s] || s) + '</span>';
        };
        if (!list.length) {
            const emptyMsg = statusFilter === 'all' && !testDriveRequestsData.length ? 'Chưa có tờ trình nào' : 'Không có tờ trình phù hợp với bộ lọc';
            container.innerHTML = '<p class="text-gray-500 text-center py-8">' + emptyMsg + '</p>';
            return;
        }
        container.innerHTML = list.map(r => {
            const statusVal = statusForDisplay(r);
            const statusLbl = { Draft: 'Nháp', Cho_BKS_Duyet: 'Chờ BKS duyệt', Cho_BGD_Duyet: 'Chờ BGĐ duyệt', Da_Duyet_Dang_Su_Dung: 'Đang sử dụng xe', Hoan_Thanh: 'Hoàn thành', Tu_Choi: 'Từ chối' }[statusVal] || statusVal;
            const statusClass = { Draft: 'bg-gray-100', Cho_BKS_Duyet: 'bg-yellow-100', Cho_BGD_Duyet: 'bg-yellow-100', Da_Duyet_Dang_Su_Dung: 'bg-blue-100', Hoan_Thanh: 'bg-green-100', Tu_Choi: 'bg-red-100' }[statusVal] || 'bg-gray-100';
            const timeDi = r.thoi_gian_di ? new Date(r.thoi_gian_di).toLocaleString('vi-VN') : '-';
            const timeVe = r.thoi_gian_ve_du_kien ? new Date(r.thoi_gian_ve_du_kien).toLocaleString('vi-VN') : '-';
            return `
        <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition shadow-sm" onclick="openTestDriveDetail('${r.id}')">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <span class="font-bold text-blue-800">${r.vehicle_label || '-'}</span>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${statusClass}">${statusLbl}</span>
                    </div>
                    <p class="text-sm text-gray-700">${(r.muc_dich_su_dung_xe || '-').substring(0, 100)}${(r.muc_dich_su_dung_xe || '').length > 100 ? '…' : ''}</p>
                    <div class="mt-2 pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                        <p><i class="fa-solid fa-user mr-1.5 text-slate-400 w-4"></i>${r.requester_fullname || r.nguoi_tao} · ${r.ngay_tao ? new Date(r.ngay_tao).toLocaleString('vi-VN') : '-'}</p>
                        <p><i class="fa-solid fa-clock mr-1.5 text-slate-400 w-4"></i>Đi: ${timeDi} · Về: ${timeVe}</p>
                        ${r.lo_trinh ? '<p><i class="fa-solid fa-route mr-1.5 text-slate-400 w-4"></i>' + (r.lo_trinh || '-') + '</p>' : ''}
                    </div>
                </div>
            </div>
        </div>`;
        }).join('');
    } catch (e) {
        console.error('[loadTestDriveRequests] Error:', e);
        container.innerHTML = '<p class="text-red-500 text-center py-8">Lỗi: ' + (e.message || 'Không tải được danh sách') + '</p>';
    }
}

function openTestDriveDetail(id) {
    const session = typeof getSession === 'function' ? getSession() : null;
    if (!session) return;
    callAPI({ action: 'get_test_drive_request_detail', id, username: session.username }).then(res => {
        if (!res.success) { Swal.fire('Lỗi', res.message || 'Không tải được chi tiết', 'error'); return; }
        const d = res.data;
        const roleUpper = (session.role || '').toUpperCase();
        const isAdmin = roleUpper === 'ADMIN';
        const canApprove = (d.current_step === 1 || d.current_step === 2) && (typeof hasPermission === 'function' && hasPermission(session, 'approve_test_drive'));
        const isRequester = (d.requester_username || d.nguoi_tao) === session.username;
        const canSubmit = d.current_step === 0 && (isRequester || isAdmin);
        const canComplete = d.current_step === 3 && (isRequester || isAdmin);
        const btns = [];
        if (canSubmit) btns.push('<button id="tdr-btn-submit" class="mr-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Gửi duyệt</button>');
        if (canApprove) {
            btns.push('<button id="tdr-btn-approve" class="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Duyệt</button>');
            btns.push('<button id="tdr-btn-reject" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Từ chối</button>');
        }
        if (canComplete) btns.push('<button id="tdr-btn-complete" class="mr-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Hoàn trả xe</button>');
        const statusLbl = (s) => ({
            Tot: 'Tốt', tot: 'Tốt',
            Xe_xuoc_tray_mop_dinh_dinh: 'Xe hư hỏng, móp, trầy, xước',
            Xe_do: 'Xe dơ', do: 'Dơ',
            Xe_bao_loi: 'Xe báo lỗi', bao_loi: 'Báo lỗi'
        }[s] || s);
        const toImageUrl = (item) => (item == null ? '' : (typeof item === 'string' ? item : (item && item.url) || ''));
        const fmtCheck = (obj, withLinks) => {
            if (!obj || typeof obj !== 'object') return '';
            const badgeClass = (st) => (st === 'Tốt' || st === 'tot') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : (st.indexOf('xước') >= 0 || st.indexOf('Xước') >= 0 || st.indexOf('hư hỏng') >= 0 || st.indexOf('Hư hỏng') >= 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : (st === 'Dơ' || st === 'dơ' ? 'bg-slate-200 text-slate-800 border border-slate-300' : 'bg-red-100 text-red-800 border border-red-200'));
            return TDR_CHECK_POINTS.map(p => {
                const e = obj[p.key];
                if (!e) return '';
                const st = statusLbl(e.status || '');
                let imgs = '';
                const imgList = Array.isArray(e.images) ? e.images.map(toImageUrl).filter(Boolean) : [];
                if (imgList.length) {
                    if (withLinks) {
                        const escUrl = (u) => (u || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        imgs = ' <span class="inline-flex flex-wrap gap-1">' + imgList.map((url, idx) => '<a href="#" onclick="openTestDriveImage(\'' + escUrl(url) + '\', \'' + (imgList.length > 1 ? 'Ảnh ' + (idx + 1) : 'Xem ảnh') + '\'); return false;" class="text-blue-600 hover:underline text-xs font-medium inline-flex items-center gap-0.5"><i class="fa-solid fa-image"></i> ' + (imgList.length > 1 ? 'Ảnh ' + (idx + 1) : 'Xem ảnh') + '</a>').join(' ') + '</span>';
                    } else {
                        imgs = ' <span class="text-slate-500 text-xs">(' + imgList.length + ' ảnh)</span>';
                    }
                }
                return '<div class="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0"><span class="text-slate-700 text-sm">' + p.label + '</span><span class="flex items-center gap-2 shrink-0 flex-wrap justify-end"><span class="text-xs font-semibold px-2.5 py-1 rounded-lg ' + badgeClass(st) + '">' + st + '</span>' + imgs + '</span></div>';
            }).filter(Boolean).join('');
        };
        const preCheckStr = fmtCheck(d.pre_check, true);
        const postCheckStr = fmtCheck(d.post_check, true);
        const actionLabel = (a) => ({ submitted: 'Gửi duyệt', approved: 'Duyệt', rejected: 'Từ chối', completed: 'Hoàn trả xe' }[a] || a);
        const esc = (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
        const steps = [
            { step: 0, label: 'Nháp (Người tạo)' },
            { step: 1, label: 'Chờ BKS duyệt' },
            { step: 2, label: 'Chờ BGĐ duyệt' },
            { step: 3, label: 'Đang sử dụng xe' },
            { step: 4, label: 'Hoàn thành' }
        ];
        const currentStep = d.trang_thai_to_trinh === 'Tu_Choi' ? -1 : (d.current_step ?? 0);
        const workflowStepper = '<div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">' +
            '<p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2"><span class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600"><i class="fa-solid fa-diagram-project text-sm"></i></span> Workflow: Người tạo → BKS → BGĐ</p>' +
            '<div class="flex flex-wrap items-center gap-2">' + steps.map((s, i) => {
            const active = currentStep === s.step;
            const done = currentStep > s.step;
            const cls = active ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : (done ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200');
            return '<span class="text-xs font-semibold px-3 py-2 rounded-lg ' + cls + '">' + (i + 1) + '. ' + s.label + '</span>';
        }).join('') + (currentStep === -1 ? ' <span class="text-xs font-semibold px-3 py-2 rounded-lg bg-red-100 text-red-800 border border-red-200">Từ chối</span>' : '') + '</div></div>';
        const statusTrangThai = ({ Draft: 'Nháp', Cho_BKS_Duyet: 'Chờ BKS duyệt', Cho_BGD_Duyet: 'Chờ BGĐ duyệt', Da_Duyet_Dang_Su_Dung: 'Đang sử dụng xe', Hoan_Thanh: 'Hoàn thành', Tu_Choi: 'Từ chối' }[d.trang_thai_to_trinh] || d.trang_thai_to_trinh || '-');
        const statusBadgeClass = d.trang_thai_to_trinh === 'Hoan_Thanh' ? 'bg-green-100 text-green-800' : d.trang_thai_to_trinh === 'Tu_Choi' ? 'bg-red-100 text-red-800' : d.trang_thai_to_trinh === 'Da_Duyet_Dang_Su_Dung' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800';
        const approvalLogsHtml = (d.approval_logs && d.approval_logs.length)
            ? '<div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm"><p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2"><span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><i class="fa-solid fa-clock-rotate-left text-sm"></i></span> Lịch sử duyệt</p><ul class="space-y-0 max-h-40 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-100">'
                + d.approval_logs.map(l => '<li class="flex flex-wrap gap-x-2 gap-y-1 items-baseline py-3 px-3 text-sm bg-slate-50/50 first:rounded-t-lg last:rounded-b-lg"><span class="text-slate-500 text-xs shrink-0 w-full sm:w-auto">' + (l.created_at ? new Date(l.created_at).toLocaleString('vi-VN') : '') + '</span><span class="font-medium text-slate-700">' + esc(l.approver_username) + (l.approver_role ? ' <span class="text-slate-400 font-normal">(' + esc(l.approver_role) + ')</span>' : '') + '</span><span class="font-semibold text-blue-600">' + actionLabel(l.action) + '</span>' + (l.comment ? '<span class="text-slate-600 text-xs w-full">' + esc(l.comment) + '</span>' : '') + '</li>').join('')
                + '</ul></div>'
            : '';
        const row = (label, value) => value == null || value === '' ? '' : '<div class="flex justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0"><span class="text-slate-500 text-sm shrink-0 min-w-[120px]">' + label + '</span><span class="text-slate-900 text-sm font-medium text-right break-words">' + value + '</span></div>';
        const me = d.muc_dich_extra || {};
        const imgLinks = (arr) => Array.isArray(arr) ? arr.map(u => (typeof u === 'string' ? u : (u && u.url) || '')).filter(Boolean) : [];
        const bangLaiUrls = imgLinks(me.anh_bang_lai);
        const giayUrls = imgLinks(me.anh_giay_de_nghi);
        let mucDichBody = row('Mục đích', esc(d.muc_dich_su_dung_xe || '-'));
        if (me.type === 'Khach_lai_thu' && (bangLaiUrls.length || giayUrls.length)) {
            const escUrl = (u) => (u || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            let links = '';
            if (bangLaiUrls.length) links += '<span class="inline-flex items-center gap-1"><i class="fa-solid fa-id-card text-slate-500"></i> Bằng lái: ' + bangLaiUrls.map(u => '<a href="#" onclick="openTestDriveImage(\'' + escUrl(u) + '\', \'Bằng lái xe\'); return false;" class="text-blue-600 hover:underline text-xs">Xem</a>').join(', ') + '</span>';
            if (giayUrls.length) links += (links ? ' · ' : '') + '<span class="inline-flex items-center gap-1"><i class="fa-solid fa-file-signature text-slate-500"></i> Giấy đề nghị: ' + giayUrls.map(u => '<a href="#" onclick="openTestDriveImage(\'' + escUrl(u) + '\', \'Giấy đề nghị lái thử\'); return false;" class="text-blue-600 hover:underline text-xs">Xem</a>').join(', ') + '</span>';
            mucDichBody += '<div class="flex flex-wrap gap-x-4 gap-y-1 py-2.5 border-b border-slate-100 text-sm">' + links + '</div>';
        }
        const sectionCard = (icon, iconColor, title, body) => '<div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">' +
            '<p class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2"><span class="w-8 h-8 rounded-lg flex items-center justify-center ' + iconColor + '"><i class="fa-solid ' + icon + ' text-sm"></i></span>' + title + '</p>' + body + '</div>';
        const html = `
            <div class="text-left max-h-[78vh] overflow-y-auto pr-1 space-y-5">
                <div class="sticky top-0 z-10 -mx-1 px-1 pt-0 pb-2 bg-gradient-to-b from-white via-white to-transparent">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <i class="fa-solid fa-car-side text-blue-600"></i>
                            </div>
                            <div>
                                <p class="text-base font-bold text-slate-800">${esc(d.vehicle_label || 'Tờ trình lái thử')}</p>
                                <p class="text-xs text-slate-500">${esc(d.requester_fullname || d.nguoi_tao || '')} · ${d.ngay_tao ? new Date(d.ngay_tao).toLocaleDateString('vi-VN') : ''}</p>
                            </div>
                        </div>
                        <span class="text-sm font-semibold px-4 py-2 rounded-xl ${statusBadgeClass} shadow-sm">${statusTrangThai}</span>
                    </div>
                </div>
                ${sectionCard('fa-file-lines', 'bg-blue-50 text-blue-600', 'Thông tin tờ trình', '<div class="space-y-0">' +
                    row('Xe', d.vehicle_label || '-') +
                    row('Người tạo', esc(d.requester_fullname || d.nguoi_tao)) +
                    mucDichBody +
                    row('Thời gian đi (dự kiến)', d.thoi_gian_di ? new Date(d.thoi_gian_di).toLocaleString('vi-VN') : '-') +
                    row('Thời gian về (dự kiến)', d.thoi_gian_ve_du_kien ? new Date(d.thoi_gian_ve_du_kien).toLocaleString('vi-VN') : '-') +
                    (d.lo_trinh ? row('Lộ trình', esc(d.lo_trinh)) : '') +
                    (d.so_dien_thoai ? row('Số điện thoại', esc(d.so_dien_thoai)) : '') +
                    (d.dia_diem_don || d.dia_diem_tra ? row('Địa điểm lấy xe / trả', esc(d.dia_diem_don || '-') + ' → ' + esc(d.dia_diem_tra || '-')) : '') +
                    (d.so_km_du_kien != null ? row('Km dự kiến', d.so_km_du_kien + ' km') : '') +
                    (d.ghi_chu ? row('Ghi chú', esc(d.ghi_chu)) : '') +
                '</div>')}
                ${workflowStepper}
                ${sectionCard('fa-gauge-high', 'bg-indigo-50 text-indigo-600', 'ODO & Quãng đường', '<div class="space-y-0">' +
                    (d.odo_truoc != null ? row('ODO trước khi đi', d.odo_truoc + ' km') : '<div class="py-3 text-slate-500 text-sm">Chưa nhập (nhập khi gửi duyệt)</div>') +
                    (d.current_step >= 4 ? (row('ODO sau khi trả', d.odo_sau != null ? d.odo_sau + ' km' : '-') + (d.quang_duong != null ? row('Quãng đường', d.quang_duong + ' km') : '') + (d.noi_tra_chia_khoa ? row('Nơi trả chìa khoá', esc(d.noi_tra_chia_khoa)) : '')) : '') +
                    (d.thoi_gian_ve_thuc_te ? row('Thời gian về thực tế', new Date(d.thoi_gian_ve_thuc_te).toLocaleString('vi-VN')) : '') +
                '</div>')}
                ${sectionCard('fa-clipboard-check', 'bg-amber-50 text-amber-600', 'Kiểm tra trước đi (5 điểm)', preCheckStr ? '<div class="bg-amber-50/50 rounded-lg p-4 space-y-0 border border-amber-100">' + preCheckStr + '</div>' : '<p class="text-slate-500 text-sm py-3">Chưa kiểm tra (nhập khi gửi duyệt)</p>')}
                ${sectionCard('fa-clipboard-check', 'bg-emerald-50 text-emerald-600', 'Kiểm tra sau trả (5 điểm)', postCheckStr ? '<div class="bg-emerald-50/50 rounded-lg p-4 space-y-0 border border-emerald-100">' + postCheckStr + '</div>' : '<p class="text-slate-500 text-sm py-3">Chưa kiểm tra (nhập khi hoàn trả xe)</p>')}
                ${approvalLogsHtml}
                ${d.history_log ? '<details class="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"><summary class="px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100">Lịch sử (history_log)</summary><pre class="text-xs p-4 overflow-auto max-h-28 border-t border-slate-200 bg-white">' + String(d.history_log) + '</pre></details>' : ''}
                ${btns.length ? '<div class="pt-4 mt-2 flex flex-wrap gap-3">' + btns.map(b => b.replace('px-4 py-2', 'px-5 py-2.5 font-medium').replace('rounded ', 'rounded-xl ')) + '</div>' : ''}
            </div>
        `;
        Swal.fire({
            title: '',
            html,
            showConfirmButton: true,
            confirmButtonText: 'Đóng',
            width: '640px',
            customClass: { popup: 'rounded-2xl shadow-xl pt-4', confirmButton: 'rounded-xl px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white' },
            didOpen: () => {
                const submitBtn = document.getElementById('tdr-btn-submit');
                const approveBtn = document.getElementById('tdr-btn-approve');
                const rejectBtn = document.getElementById('tdr-btn-reject');
                const completeBtn = document.getElementById('tdr-btn-complete');
                if (submitBtn) submitBtn.onclick = () => { Swal.close(); doTdrAction(id, 'submit', session); };
                if (approveBtn) approveBtn.onclick = () => { Swal.close(); doTdrAction(id, 'approve', session); };
                if (rejectBtn) rejectBtn.onclick = () => { Swal.close(); doTdrAction(id, 'reject', session); };
                if (completeBtn) completeBtn.onclick = () => { Swal.close(); doTdrAction(id, 'complete', session); };
            }
        });
    });
}

async function doTdrAction(id, action, session) {
    if (action === 'submit') {
        const detailRes = await callAPI({ action: 'get_test_drive_request_detail', id, username: session.username });
        const d = detailRes.success && detailRes.data ? detailRes.data : null;
        const REQUIRED_POINTS = ['ben_trai', 'ben_phai', 'phia_truoc', 'phia_sau', 'noi_that'];
        const hasPreCheck = d && d.pre_check && typeof d.pre_check === 'object' && REQUIRED_POINTS.every(k => d.pre_check[k] && d.pre_check[k].status);
        const hasOdo = d && d.odo_truoc != null && !isNaN(parseInt(d.odo_truoc, 10)) && parseInt(d.odo_truoc, 10) >= 0;
        let odoTruoc, preCheck;
        if (hasOdo && hasPreCheck) {
            odoTruoc = parseInt(d.odo_truoc, 10);
            preCheck = d.pre_check;
        } else {
            const odoAndPreHtml = '<div class="text-left space-y-4 py-1">' +
                '<div class="bg-slate-50 rounded-lg p-3"><label class="block text-sm font-medium text-gray-700 mb-2">ODO trước khi nhận xe (km) *</label><input type="number" id="tdr-submit-odo" class="input w-full border-gray-300 rounded-lg" min="0" placeholder="VD: 15000" value="' + (d && d.odo_truoc != null ? d.odo_truoc : '') + '" required></div>' +
                '<p class="text-sm font-medium text-gray-700">Kiểm tra tình trạng xe (5 điểm) — nếu không Tốt phải đính kèm ảnh:</p>' +
                buildTdrCheckFormHtml('tdr_pre') + '</div>';
            const res = await Swal.fire({
                title: 'Gửi duyệt — ODO & Kiểm tra xe',
                html: odoAndPreHtml,
                showCancelButton: true,
                confirmButtonText: 'Gửi duyệt',
                cancelButtonText: 'Hủy',
                width: '560px',
                customClass: { popup: 'rounded-2xl shadow-xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' },
                didOpen: () => { const popup = document.querySelector('.swal2-popup'); bindTdrStatusToggle('tdr_pre', popup); },
                preConfirm: async () => {
                    const odoEl = document.getElementById('tdr-submit-odo');
                    odoTruoc = odoEl ? parseInt(odoEl.value, 10) : null;
                    if (odoTruoc == null || isNaN(odoTruoc) || odoTruoc < 0) {
                        Swal.showValidationMessage('Vui lòng nhập ODO trước khi nhận xe (số km hợp lệ).');
                        return false;
                    }
                    const collected = await collectTdrCheckWithUpload('tdr_pre');
                    if (collected.error) {
                        Swal.showValidationMessage(collected.error);
                        return false;
                    }
                    preCheck = collected.preCheck;
                    return true;
                }
            });
            if (!res.isConfirmed) return;
        }
        const x = await callAPI({ action: 'submit_test_drive_request', id, username: session.username, role: session.role, odo_truoc: odoTruoc, pre_check: preCheck });
        Swal.fire(x.success ? 'Thành công' : 'Lỗi', x.message || '', x.success ? 'success' : 'error');
        if (x.success) loadTestDriveRequests();
    } else if (action === 'approve' || action === 'reject') {
        const { value: comment } = await Swal.fire({
            title: action === 'reject' ? 'Lý do từ chối' : 'Xác nhận duyệt',
            input: action === 'reject' ? 'textarea' : null,
            inputPlaceholder: action === 'reject' ? 'Nhập lý do...' : null,
            showCancelButton: true,
            confirmButtonText: action === 'reject' ? 'Từ chối' : 'Duyệt',
            cancelButtonText: 'Hủy'
        });
        if (action === 'reject' && comment === undefined) return;
        const x = await callAPI({ action: 'process_test_drive_approval', id, decision: action, comment: comment || '', username: session.username, role: session.role });
        Swal.fire(x.success ? 'Thành công' : 'Lỗi', x.message || '', x.success ? 'success' : 'error');
        if (x.success) loadTestDriveRequests();
    } else if (action === 'complete') {
        const completeHtml = '<div class="text-left space-y-4 py-1">' +
            '<div class="grid grid-cols-1 gap-3"><div class="bg-slate-50 rounded-lg p-3"><label class="block text-sm font-medium text-gray-700 mb-2">ODO sau khi trả (km) *</label><input type="number" id="tdr-complete-odo" class="input w-full border-gray-300 rounded-lg" min="0" placeholder="VD: 15100" required></div>' +
            '<div class="bg-slate-50 rounded-lg p-3"><label class="block text-sm font-medium text-gray-700 mb-2">Thời gian về thực tế</label><input type="datetime-local" id="tdr-complete-ve" class="input w-full border-gray-300 rounded-lg"></div>' +
            '<div class="bg-slate-50 rounded-lg p-3"><label class="block text-sm font-medium text-gray-700 mb-2">Nơi trả chìa khoá <span class="text-red-500">*</span></label><select id="tdr-complete-noi-tra-chia-khoa" class="input w-full border-gray-300 rounded-lg" required><option value="Tu_dung_chia_khoa" selected>Tủ đựng chìa khoá</option><option value="Gui_truc_tiep_BKS">Gửi trực tiếp cho BKS</option><option value="Khac">Khác</option></select><input type="text" id="tdr-complete-noi-tra-chia-khoa-khac" class="input w-full border-gray-300 rounded-lg mt-2 hidden" placeholder="Ghi rõ nơi trả..."></div></div>' +
            '<p class="text-sm font-medium text-gray-700">Kiểm tra tình trạng xe sau khi trả (5 điểm) — nếu không Tốt phải đính kèm ảnh:</p>' +
            buildTdrCheckFormHtml('tdr_post') + '</div>';
        const res = await Swal.fire({
            title: 'Hoàn trả xe',
            html: completeHtml,
            customClass: { popup: 'rounded-2xl shadow-xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' },
            width: '560px',
            showCancelButton: true,
            confirmButtonText: 'Hoàn thành',
            cancelButtonText: 'Hủy',
            width: '520px',
            didOpen: () => {
                const popup = document.querySelector('.swal2-popup');
                bindTdrStatusToggle('tdr_post', popup);
                const selNoiTra = document.getElementById('tdr-complete-noi-tra-chia-khoa');
                const inputKhac = document.getElementById('tdr-complete-noi-tra-chia-khoa-khac');
                if (selNoiTra && inputKhac) {
                    const toggleKhac = () => { inputKhac.classList.toggle('hidden', selNoiTra.value !== 'Khac'); if (selNoiTra.value !== 'Khac') inputKhac.value = ''; };
                    toggleKhac();
                    selNoiTra.addEventListener('change', toggleKhac);
                }
            },
            preConfirm: async () => {
                const odoEl = document.getElementById('tdr-complete-odo');
                const veEl = document.getElementById('tdr-complete-ve');
                const noiTraEl = document.getElementById('tdr-complete-noi-tra-chia-khoa');
                const noiTraKhacEl = document.getElementById('tdr-complete-noi-tra-chia-khoa-khac');
                const odoSau = odoEl ? parseInt(odoEl.value, 10) : null;
                if (odoSau == null || isNaN(odoSau) || odoSau < 0) {
                    Swal.showValidationMessage('Vui lòng nhập ODO sau khi trả (số km hợp lệ).');
                    return false;
                }
                let noiTraChiaKhoa = 'Tủ đựng chìa khoá';
                if (noiTraEl) {
                    if (noiTraEl.value === 'Khac') {
                        if (noiTraKhacEl && noiTraKhacEl.value.trim()) noiTraChiaKhoa = noiTraKhacEl.value.trim();
                        else {
                            Swal.showValidationMessage('Vui lòng ghi rõ nơi trả chìa khoá khi chọn Khác.');
                            return false;
                        }
                    } else if (noiTraEl.value === 'Gui_truc_tiep_BKS') noiTraChiaKhoa = 'Gửi trực tiếp cho BKS';
                }
                const thoiGianVe = veEl && veEl.value ? veEl.value : null;
                const collected = await collectTdrCheckWithUpload('tdr_post');
                if (collected.error) {
                    Swal.showValidationMessage(collected.error);
                    return false;
                }
                return { odoSau, thoiGianVe: thoiGianVe || new Date().toISOString(), postCheck: collected.preCheck, noiTraChiaKhoa: noiTraChiaKhoa || 'Tủ đựng chìa khoá' };
            }
        });
        if (!res.isConfirmed || !res.value) return;
        const { odoSau, thoiGianVe, postCheck, noiTraChiaKhoa } = res.value;
        const x = await callAPI({
            action: 'complete_test_drive_return',
            id,
            username: session.username,
            odo_sau: odoSau,
            thoi_gian_ve_thuc_te: thoiGianVe,
            post_check: postCheck,
            noi_tra_chia_khoa: noiTraChiaKhoa || 'Tủ đựng chìa khoá'
        });
        Swal.fire(x.success ? 'Thành công' : 'Lỗi', x.message || '', x.success ? 'success' : 'error');
        if (x.success) loadTestDriveRequests();
    }
}

function setupTestDriveFilters() {
    const filterEl = document.getElementById('test-drive-status-filter');
    if (filterEl) {
        filterEl.onchange = () => loadTestDriveRequests();
    }
}

if (typeof window !== 'undefined') {
    window.loadTestDriveVehicles = loadTestDriveVehicles;
    window.handleCreateTestDriveVehicle = handleCreateTestDriveVehicle;
    window.loadTestDriveRequestCreate = loadTestDriveRequestCreate;
    window.handleCreateTestDriveRequest = handleCreateTestDriveRequest;
    window.loadTestDriveRequests = loadTestDriveRequests;
    window.openTestDriveDetail = openTestDriveDetail;
    window.openTestDriveImage = openTestDriveImage;
    window.setupTestDriveFilters = setupTestDriveFilters;
}
