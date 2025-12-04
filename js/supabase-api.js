/**
 * Supabase API - Thay thế Google Apps Script Backend
 */

// Khởi tạo Supabase client
let supabaseClient = null;

function initSupabase() {
    if (!window.SUPABASE_CONFIG) {
        console.error('Supabase config chưa được load');
        return null;
    }
    
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
    }
    return supabaseClient;
}

// Utility functions
function hashPassword(str) {
    // MD5 hash - tương tự như trong code.gs
    if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.MD5(String(str)).toString();
    }
    // Fallback nếu không có crypto-js
    console.warn('CryptoJS not loaded, using simple hash');
    return btoa(str).split('').reverse().join('');
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN');
}

function parseVND(str) {
    if (!str) return 0;
    const cleanStr = String(str).replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr);
    return isNaN(num) ? 0 : num;
}

function formatCurrency(num) {
    if (!num) return '0';
    return new Number(num).toLocaleString('vi-VN');
}

// ======================================================
// API FUNCTIONS - Tương ứng với code.gs
// ======================================================

/**
 * A. ĐĂNG NHẬP
 */
async function supabaseLogin(username, password) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const hash = hashPassword(password);
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username.toLowerCase())
            .eq('active', true)
            .single();

        if (error || !data) {
            return { success: false, message: 'Sai thông tin đăng nhập' };
        }

        // Verify password
        if (data.password !== hash) {
            return { success: false, message: 'Sai thông tin đăng nhập' };
        }

        if (!data.active) {
            return { success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
        }

        const user = {
            username: data.username,
            fullname: data.fullname,
            role: data.role,
            need_change_pass: data.need_change_pass,
            phone: data.phone || '',
            email: data.email || '',
            group: data.group || '',
            active: data.active
        };

        return { success: true, user };
    } catch (e) {
        console.error('Login error:', e);
        return { success: false, message: 'Lỗi đăng nhập: ' + e.message };
    }
}

/**
 * B. ĐỔI MẬT KHẨU
 */
async function supabaseChangePassword(username, oldPass, newPass) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!newPass || newPass.trim().length < 6) {
            return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
        }

        // Lấy user hiện tại
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username.toLowerCase())
            .single();

        if (userError || !userData) {
            return { success: false, message: 'Không tìm thấy người dùng' };
        }

        // Nếu có oldPass, kiểm tra mật khẩu cũ
        if (oldPass) {
            const oldHash = hashPassword(oldPass);
            if (oldHash !== userData.password) {
                return { success: false, message: 'Mật khẩu cũ không đúng' };
            }
        }

        // Cập nhật mật khẩu mới
        const newHash = hashPassword(newPass);
        const { data, error } = await supabase
            .from('users')
            .update({
                password: newHash,
                need_change_pass: false,
                updated_at: new Date().toISOString()
            })
            .eq('username', username.toLowerCase())
            .select()
            .single();

        if (error) {
            return { success: false, message: 'Lỗi cập nhật mật khẩu: ' + error.message };
        }

        const user = {
            username: data.username,
            fullname: data.fullname,
            role: data.role,
            need_change_pass: data.need_change_pass,
            phone: data.phone || '',
            email: data.email || '',
            group: data.group || '',
            active: data.active
        };

        return { success: true, message: 'Đã đổi mật khẩu thành công', user };
    } catch (e) {
        console.error('Change password error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * C. TẠO TỜ TRÌNH
 */
async function supabaseCreateRequest(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const id = 'REQ_' + new Date().getTime();
        const contractPrice = parseVND(d.contract_price);
        const discountAmount = parseVND(d.discount_amount);

        // Xử lý Quà tặng JSON
        let giftTotalMoney = 0;
        let giftDescriptionArr = [];
        try {
            const giftJsonStr = d.gift_json;
            let gifts = [];
            if (typeof giftJsonStr === 'string') {
                gifts = JSON.parse(giftJsonStr || "[]");
            } else if (Array.isArray(giftJsonStr)) {
                gifts = giftJsonStr;
            }

            if (Array.isArray(gifts)) {
                gifts.forEach(item => {
                    if (item.name) {
                        const price = parseVND(item.price);
                        giftTotalMoney += price;
                        giftDescriptionArr.push(`- ${item.name} [${formatCurrency(price)}]`);
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing gift_json:', e);
        }

        const finalGiftDetails = giftDescriptionArr.join('\n') || "Không có quà";
        const finalPrice = contractPrice - discountAmount;

        const approvalData = {
            id: id,
            date: new Date().toISOString(),
            requester: d.requester,
            contract_code: d.contract_code,
            customer_name: d.customer_name,
            phone: d.phone,
            cccd: d.cccd,
            email: d.email || '',
            address: d.address,
            car_model: d.car_model || '',
            car_version: d.car_version || '',
            car_color: d.car_color || '',
            vin_no: d.vin_no || '',
            payment_method: d.payment_method || '',
            contract_price: contractPrice,
            discount_details: d.discount_details || '',
            discount_amount: discountAmount,
            gift_details: finalGiftDetails,
            gift_amount: giftTotalMoney,
            final_price: finalPrice,
            current_step: 0,
            status_text: 'Chờ TPKD duyệt',
            history_log: '',
            other_requirements: d.other_requirements || '',
            productivity_bonus: parseVND(d.productivity_bonus || '0'),
            approver_step0: d.approver_step0 || ''
        };

        const { data, error } = await supabase
            .from('approvals')
            .insert([approvalData])
            .select()
            .single();

        if (error) {
            return { success: false, message: 'Lỗi tạo tờ trình: ' + error.message };
        }

        return { success: true, message: 'Đã gửi yêu cầu thành công!' };
    } catch (e) {
        console.error('Create request error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * D. LẤY DANH SÁCH CHỜ DUYỆT
 */
async function supabaseGetPendingList(username, role) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Workflow steps
        const WORKFLOW = [
            { step: 0, role: 'TPKD', label: 'Chờ TPKD duyệt', next: 1 },
            { step: 1, role: 'GDKD', label: 'Chờ GĐKD duyệt', next: 2 },
            { step: 2, role: 'BKS', label: 'Chờ Ban Kiểm Soát', next: 3 },
            { step: 3, role: 'BGD', label: 'Chờ Ban Giám Đốc', next: 4 },
            { step: 4, role: 'KETOAN', label: 'Chờ Kế Toán kiểm tra', next: 6 }
        ];

        const targetSteps = WORKFLOW.filter(w => w.role === role).map(w => w.step);

        // Lấy tất cả approvals
        const { data: allApprovals, error } = await supabase
            .from('approvals')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            return { success: false, message: 'Lỗi: ' + error.message };
        }

        // Filter và format data
        const resultList = [];
        const usernameLower = String(username).toLowerCase();

        allApprovals.forEach(row => {
            const isRequester = (role === 'TVBH' || role === 'SALE') && 
                               String(row.requester).toLowerCase() === usernameLower;
            const isRejectedAndRequester = (row.current_step === 0 && isRequester);
            const isCompleted = row.current_step >= 4;
            const canViewCompleted = (role === 'GDKD' || role === 'BGD' || role === 'BKS' || role === 'KETOAN') && isCompleted;

            const show = isRejectedAndRequester ||
                       (role === 'ADMIN') ||
                       (targetSteps.includes(row.current_step)) ||
                       (isRequester && row.current_step >= 0) ||
                       canViewCompleted;

            if (show) {
                const item = {
                    id: row.id,
                    date: formatDate(row.date),
                    requester: row.requester,
                    contract_code: row.contract_code,
                    customer: row.customer_name,
                    phone: row.phone || '',
                    cccd: row.cccd || '',
                    email: row.email || '',
                    address: row.address || '',
                    car_model: row.car_model || '',
                    car_version: row.car_version || '',
                    car_color: row.car_color || '',
                    vin_no: row.vin_no || '',
                    payment: row.payment_method || '',
                    contract_price: formatCurrency(row.contract_price || 0),
                    discount_details: row.discount_details || '',
                    discount_amount: formatCurrency(row.discount_amount || 0),
                    gift_details: row.gift_details || '',
                    gift_amount: formatCurrency(row.gift_amount || 0),
                    final_price: formatCurrency(row.final_price || 0),
                    step: row.current_step || 0,
                    status_text: row.current_step >= 4 ? 'Hoàn tất' : (row.status_text || ''),
                    logs: row.history_log || '',
                    other_requirements: row.other_requirements || '',
                    max_cost_rate: row.max_cost_rate ? formatCurrency(row.max_cost_rate) : '',
                    productivity_bonus: row.productivity_bonus ? formatCurrency(row.productivity_bonus) : '',
                    can_resubmit: (row.current_step === 0 && isRequester)
                };

                // Parse logs
                if (item.logs) {
                    const logLines = item.logs.split('\n');
                    const logEntries = [];
                    logLines.forEach(logLine => {
                        const trimmed = logLine.trim();
                        if (!trimmed) return;
                        const parts = trimmed.split(' | ');
                        if (parts.length >= 3) {
                            logEntries.push({
                                time: parts[0],
                                user: parts[1].split(' (')[0],
                                role: parts[1].split(' (')[1] ? parts[1].split(' (')[1].replace(')', '') : '',
                                action: parts[2],
                                comment: parts.length > 3 ? parts.slice(3).join(' | ').replace('Lý do: ', '') : '',
                                is_approve: parts[2].indexOf('DUYỆT') !== -1,
                                is_reject: parts[2].indexOf('TỪ CHỐI') !== -1
                            });
                        }
                    });
                    item.log_entries = logEntries;
                }

                item.json_string = encodeURIComponent(JSON.stringify(item));
                resultList.push(item);
            }
        });

        return { success: true, data: resultList };
    } catch (e) {
        console.error('Get pending list error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * E. DUYỆT / TỪ CHỐI
 */
async function supabaseProcessApproval(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Validate comment for reject
        if (d.decision === 'reject' && (!d.comment || d.comment.trim() === '')) {
            return { success: false, message: 'Vui lòng nhập lý do từ chối' };
        }

        // Lấy approval hiện tại
        const { data: approval, error: getError } = await supabase
            .from('approvals')
            .select('*')
            .eq('id', d.id)
            .single();

        if (getError || !approval) {
            return { success: false, message: 'Không tìm thấy đơn hàng' };
        }

        const WORKFLOW = [
            { step: 0, role: 'TPKD', label: 'Chờ TPKD duyệt', next: 1 },
            { step: 1, role: 'GDKD', label: 'Chờ GĐKD duyệt', next: 2 },
            { step: 2, role: 'BKS', label: 'Chờ Ban Kiểm Soát', next: 3 },
            { step: 3, role: 'BGD', label: 'Chờ Ban Giám Đốc', next: 4 },
            { step: 4, role: 'KETOAN', label: 'Chờ Kế Toán kiểm tra', next: 6 }
        ];

        const currentStep = approval.current_step || 0;
        const stepConfig = WORKFLOW.find(w => w.step === currentStep);

        if (d.role !== 'ADMIN' && (!stepConfig || stepConfig.role !== d.role)) {
            return { success: false, message: 'Không có quyền duyệt!' };
        }

        // Tạo log entry
        const time = new Date().toLocaleString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        const actionText = d.decision === 'approve' ? 'DUYỆT' : 'TỪ CHỐI';
        const commentText = d.comment && d.comment.trim() ? ' | Lý do: ' + d.comment.trim() : '';
        const newLog = time + ' | ' + d.username + ' (' + d.role + ') | ' + actionText + commentText;
        const oldLog = approval.history_log || '';
        const updatedLog = oldLog ? oldLog + "\n" + newLog : newLog;

        // Cập nhật approval
        let updateData = {
            history_log: updatedLog,
            updated_at: new Date().toISOString()
        };

        if (d.decision === 'reject') {
            updateData.current_step = 0;
            updateData.status_text = 'Đã từ chối - Trả về cho người tạo chỉnh sửa';
            if (d.comment && d.comment.trim()) {
                updateData.status_text += ' | Lý do: ' + d.comment.trim();
            }
        } else {
            const nextStep = stepConfig.next;
            if (nextStep >= 6 || currentStep === 4) {
                updateData.current_step = 4;
                updateData.status_text = 'Hoàn tất';
            } else {
                const nextConfig = WORKFLOW.find(w => w.step === nextStep);
                updateData.current_step = nextStep;
                updateData.status_text = nextConfig ? nextConfig.label : 'Hoàn tất';
            }

            // Lưu người được chọn cho bước tiếp theo
            if (d.next_approver) {
                const approverCol = 'approver_step' + updateData.current_step;
                updateData[approverCol] = d.next_approver;
            }

            // Lưu lương năng suất nếu có điều chỉnh
            if (d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
                const newProductivityBonus = parseVND(d.productivity_bonus);
                if (newProductivityBonus !== (approval.productivity_bonus || 0)) {
                    updateData.productivity_bonus = newProductivityBonus;
                    const oldFormatted = approval.productivity_bonus ? formatCurrency(approval.productivity_bonus) + ' VNĐ' : 'Chưa nhập';
                    const newFormatted = d.productivity_bonus_formatted || (formatCurrency(newProductivityBonus) + ' VNĐ');
                    const logEntry = time + ' | ' + d.username + ' (' + d.role + ') | ĐIỀU CHỈNH LƯƠNG NĂNG SUẤT | ' + oldFormatted + ' → ' + newFormatted;
                    updateData.history_log = updatedLog + "\n" + logEntry;
                }
            }
        }

        const { error: updateError } = await supabase
            .from('approvals')
            .update(updateData)
            .eq('id', d.id);

        if (updateError) {
            return { success: false, message: 'Lỗi cập nhật: ' + updateError.message };
        }

        return { success: true, message: 'Thao tác thành công' };
    } catch (e) {
        console.error('Process approval error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * F. LẤY DANH SÁCH TỜ TRÌNH CỦA USER
 */
async function supabaseGetMyRequests(username, role) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        let query = supabase
            .from('approvals')
            .select('*')
            .order('date', { ascending: false });

        // Nếu không phải ADMIN, chỉ lấy đơn của user này
        if (role !== 'ADMIN') {
            query = query.eq('requester', username);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, message: 'Lỗi: ' + error.message };
        }

        const resultList = data.map(row => {
            const item = {
                id: row.id,
                date: formatDate(row.date),
                requester: row.requester,
                contract_code: row.contract_code,
                customer: row.customer_name,
                phone: row.phone || '',
                cccd: row.cccd || '',
                email: row.email || '',
                address: row.address || '',
                car_model: row.car_model || '',
                car_version: row.car_version || '',
                car_color: row.car_color || '',
                vin_no: row.vin_no || '',
                payment: row.payment_method || '',
                contract_price: formatCurrency(row.contract_price || 0),
                discount_details: row.discount_details || '',
                discount_amount: formatCurrency(row.discount_amount || 0),
                gift_details: row.gift_details || '',
                gift_amount: formatCurrency(row.gift_amount || 0),
                final_price: formatCurrency(row.final_price || 0),
                step: row.current_step || 0,
                status_text: row.current_step >= 4 ? 'Hoàn tất' : (row.status_text || ''),
                logs: row.history_log || '',
                other_requirements: row.other_requirements || '',
                max_cost_rate: row.max_cost_rate ? formatCurrency(row.max_cost_rate) : '',
                productivity_bonus: row.productivity_bonus ? formatCurrency(row.productivity_bonus) : '',
                can_resubmit: (row.current_step === 0)
            };

            // Parse logs và gift_json tương tự như trên
            // ... (code tương tự)

            item.json_string = encodeURIComponent(JSON.stringify(item));
            return item;
        });

        return { success: true, data: resultList };
    } catch (e) {
        console.error('Get my requests error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * G. LẤY CHI TIẾT TỜ TRÌNH
 */
async function supabaseGetRequestDetail(id, username) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const { data: approval, error } = await supabase
            .from('approvals')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !approval) {
            return { success: false, message: 'Không tìm thấy tờ trình' };
        }

        // Kiểm tra quyền
        const requester = String(approval.requester).toLowerCase();
        if (requester !== String(username).toLowerCase() && username !== 'admin') {
            return { success: false, message: 'Không có quyền xem tờ trình này' };
        }

        // Lấy fullname của requester
        const { data: userData } = await supabase
            .from('users')
            .select('fullname')
            .eq('username', approval.requester)
            .single();

        const item = {
            id: approval.id,
            date: formatDate(approval.date),
            requester: approval.requester,
            requester_fullname: userData?.fullname || approval.requester,
            contract_code: approval.contract_code,
            customer: approval.customer_name,
            phone: approval.phone || '',
            cccd: approval.cccd || '',
            email: approval.email || '',
            address: approval.address || '',
            car_model: approval.car_model || '',
            car_version: approval.car_version || '',
            car_color: approval.car_color || '',
            vin_no: approval.vin_no || '',
            payment: approval.payment_method || '',
            contract_price: formatCurrency(approval.contract_price || 0),
            discount_details: approval.discount_details || '',
            discount_amount: formatCurrency(approval.discount_amount || 0),
            gift_details: approval.gift_details || '',
            gift_amount: formatCurrency(approval.gift_amount || 0),
            final_price: formatCurrency(approval.final_price || 0),
            step: approval.current_step || 0,
            status_text: approval.current_step >= 4 ? 'Hoàn tất' : (approval.status_text || ''),
            logs: approval.history_log || '',
            other_requirements: approval.other_requirements || '',
            max_cost_rate: approval.max_cost_rate ? formatCurrency(approval.max_cost_rate) : '',
            productivity_bonus: approval.productivity_bonus ? formatCurrency(approval.productivity_bonus) : ''
        };

        // Parse gift_json
        try {
            const giftLines = item.gift_details.split('\n');
            const gifts = [];
            giftLines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed && trimmed.startsWith('- ')) {
                    const match = trimmed.match(/- (.+?) \[(.+?)\]/);
                    if (match) {
                        gifts.push({ 
                            name: match[1], 
                            price: match[2].replace(/\./g, '').replace(/[^\d]/g, '') 
                        });
                    }
                }
            });
            item.gift_json = JSON.stringify(gifts);
        } catch (e) {
            item.gift_json = '[]';
        }

        return { success: true, data: item };
    } catch (e) {
        console.error('Get request detail error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * H. CẬP NHẬT TỜ TRÌNH
 */
async function supabaseUpdateRequest(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Lấy approval hiện tại
        const { data: approval, error: getError } = await supabase
            .from('approvals')
            .select('*')
            .eq('id', d.id)
            .single();

        if (getError || !approval) {
            return { success: false, message: 'Không tìm thấy tờ trình' };
        }

        const currentStep = approval.current_step || 0;
        const requester = String(approval.requester).toLowerCase();
        const isCompleted = currentStep >= 4;
        const isRejected = currentStep === 0;
        const isRequester = (requester === String(d.username).toLowerCase());
        const isAdmin = (d.username === 'admin' || d.role === 'ADMIN');
        const isTVBH = (d.role === 'TVBH' || d.role === 'SALE');
        const canEditCompleted = (d.role === 'GDKD' || d.role === 'BGD' || d.role === 'BKS' || d.role === 'KETOAN' || isAdmin);

        // Kiểm tra quyền
        if (!isRejected && !isCompleted) {
            return { success: false, message: 'Chỉ có thể sửa tờ trình đã bị từ chối hoặc đã hoàn tất' };
        }

        if (isRejected) {
            if (!isRequester && !isAdmin) {
                return { success: false, message: 'Chỉ người tạo mới có thể sửa tờ trình đã bị từ chối' };
            }
            if (isRequester && !isTVBH && !isAdmin) {
                return { success: false, message: 'Chỉ TVBH/SALE hoặc ADMIN mới có thể sửa tờ trình' };
            }
        } else if (isCompleted) {
            const canEditCompletedByRequester = isRequester && (d.role === 'TVBH' || d.role === 'SALE');
            if (!canEditCompleted && !canEditCompletedByRequester) {
                return { success: false, message: 'Chỉ người tạo, GDKD, BGD, BKS, KETOAN hoặc ADMIN mới có thể sửa tờ trình đã hoàn tất' };
            }
        }

        // Tính toán lại giá trị
        const contractPrice = parseVND(d.contract_price);
        const discountAmount = parseVND(d.discount_amount);

        // Xử lý Quà tặng JSON
        let giftTotalMoney = 0;
        let giftDescriptionArr = [];
        try {
            let gifts = [];
            if (typeof d.gift_json === 'string') {
                gifts = JSON.parse(d.gift_json || "[]");
            } else if (Array.isArray(d.gift_json)) {
                gifts = d.gift_json;
            }

            gifts.forEach(item => {
                if (item.name) {
                    const price = parseVND(item.price);
                    giftTotalMoney += price;
                    giftDescriptionArr.push(`- ${item.name} [${formatCurrency(price)}]`);
                }
            });
        } catch (e) {
            console.error('Error parsing gift_json:', e);
        }

        const finalGiftDetails = giftDescriptionArr.join('\n') || "Không có quà";
        const finalPrice = contractPrice - discountAmount;

        // Cập nhật dữ liệu
        let updateData = {
            updated_at: new Date().toISOString()
        };

        if (isCompleted) {
            // Chỉ cho phép update contract_code và vin_no
            if (d.contract_code !== undefined) updateData.contract_code = d.contract_code;
            if (d.vin_no !== undefined) updateData.vin_no = d.vin_no || '';

            // Ghi log thay đổi
            const logChanges = [];
            if (d.contract_code !== undefined && String(d.contract_code) !== String(approval.contract_code)) {
                logChanges.push('Số hợp đồng: ' + (approval.contract_code || '') + ' → ' + d.contract_code);
            }
            if (d.vin_no !== undefined && String(d.vin_no || '') !== String(approval.vin_no || '')) {
                logChanges.push('Số khung: ' + (approval.vin_no || '') + ' → ' + (d.vin_no || ''));
            }
            if (logChanges.length > 0) {
                const time = new Date().toLocaleString('vi-VN', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
                });
                const newLog = time + ' | ' + d.username + ' (' + d.role + ') | CẬP NHẬT THÔNG TIN | ' + logChanges.join(', ');
                updateData.history_log = (approval.history_log || '') + "\n" + newLog;
            }
        } else {
            // Khi bị từ chối: cho phép sửa tất cả
            updateData = {
                contract_code: d.contract_code,
                customer_name: d.customer_name,
                phone: d.phone,
                cccd: d.cccd,
                email: d.email || '',
                address: d.address,
                car_model: d.car_model || '',
                car_version: d.car_version || '',
                car_color: d.car_color || '',
                vin_no: d.vin_no || '',
                payment_method: d.payment_method || '',
                contract_price: contractPrice,
                discount_details: d.discount_details || '',
                discount_amount: discountAmount,
                gift_details: finalGiftDetails,
                gift_amount: giftTotalMoney,
                final_price: finalPrice,
                other_requirements: d.other_requirements || '',
                productivity_bonus: parseVND(d.productivity_bonus || '0'),
                updated_at: new Date().toISOString()
            };
        }

        const { error: updateError } = await supabase
            .from('approvals')
            .update(updateData)
            .eq('id', d.id);

        if (updateError) {
            return { success: false, message: 'Lỗi cập nhật: ' + updateError.message };
        }

        return { success: true, message: 'Đã cập nhật tờ trình thành công!' };
    } catch (e) {
        console.error('Update request error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * I. GỬI LẠI ĐƠN SAU KHI BỊ TỪ CHỐI
 */
async function supabaseResubmitRequest(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const { data: approval, error: getError } = await supabase
            .from('approvals')
            .select('*')
            .eq('id', d.id)
            .single();

        if (getError || !approval) {
            return { success: false, message: 'Không tìm thấy đơn hàng' };
        }

        const currentStep = approval.current_step || 0;
        const requester = String(approval.requester).toLowerCase();

        // Chỉ người tạo mới có thể gửi lại
        if (requester !== String(d.username).toLowerCase() && d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ người tạo đơn mới có thể gửi lại!' };
        }

        // Chỉ có thể gửi lại khi step = 0
        if (currentStep !== 0) {
            return { success: false, message: 'Đơn này không thể gửi lại!' };
        }

        // Tạo log entry
        const time = new Date().toLocaleString('vi-VN', { 
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
        });
        const newLog = time + ' | ' + d.username + ' (' + d.role + ') | GỬI LẠI ĐỂ DUYỆT';
        const oldLog = approval.history_log || '';

        const { error: updateError } = await supabase
            .from('approvals')
            .update({
                current_step: 0,
                status_text: 'Chờ TPKD duyệt',
                history_log: oldLog ? oldLog + "\n" + newLog : newLog,
                updated_at: new Date().toISOString()
            })
            .eq('id', d.id);

        if (updateError) {
            return { success: false, message: 'Lỗi: ' + updateError.message };
        }

        return { success: true, message: 'Đã gửi lại đơn thành công!' };
    } catch (e) {
        console.error('Resubmit request error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * J. TRA CỨU HỢP ĐỒNG
 * Note: lookup_contract cần truy cập Google Sheets external
 * Có thể tạo bảng contracts trong Supabase để migrate hoàn toàn
 * Hiện tại return false để frontend có thể fallback về Google Apps Script nếu cần
 */
async function supabaseLookupContract(code) {
    try {
        if (!code) {
            return { success: false, message: 'Thiếu mã đơn hàng' };
        }

        // TODO: Tạo bảng contracts trong Supabase và migrate data từ Google Sheets
        // Hiện tại trả về false để frontend có thể fallback về Google Apps Script
        
        // Nếu có bảng contracts trong Supabase, implement ở đây:
        /*
        const supabase = initSupabase();
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('contract_code', code.toLowerCase())
            .single();
        
        if (error || !data) {
            return { success: false, message: 'Không tìm thấy đơn hàng: ' + code };
        }
        
        return {
            success: true,
            data: {
                tvbh: data.tvbh,
                name: data.name,
                phone: data.phone,
                cccd: data.cccd,
                issueDate: formatDate(data.issue_date),
                issuePlace: data.issue_place,
                email: data.email,
                carModel: data.car_model,
                carVersion: data.car_version,
                carColor: data.car_color,
                payment: data.payment,
                address: data.address
            }
        };
        */
        
        // Tạm thời return false để fallback
        return { 
            success: false, 
            message: 'USE_FALLBACK', // Special message để frontend biết cần fallback
            fallback: true 
        };
    } catch (e) {
        console.error('Lookup contract error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * K. LẤY PROFILE USER
 */
async function supabaseGetUserProfile(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!d.username) {
            return { success: false, message: 'Thiếu username' };
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', d.username.toLowerCase())
            .single();

        if (error || !data) {
            return { success: false, message: 'Không tìm thấy người dùng' };
        }

        const profile = {
            username: data.username,
            fullname: data.fullname,
            role: data.role,
            need_change_pass: data.need_change_pass,
            phone: data.phone || '',
            email: data.email || '',
            group: data.group || '',
            active: data.active
        };

        return { success: true, profile };
    } catch (e) {
        console.error('Get user profile error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * L. CẬP NHẬT PROFILE USER
 */
async function supabaseUpdateUserProfile(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!d.username) {
            return { success: false, message: 'Thiếu username' };
        }

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (d.fullname !== undefined) updateData.fullname = d.fullname;
        if (d.phone !== undefined) updateData.phone = d.phone || '';
        if (d.email !== undefined) updateData.email = d.email || '';
        if (d.group !== undefined) updateData.group = d.group || '';

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('username', d.username.toLowerCase())
            .select()
            .single();

        if (error) {
            return { success: false, message: 'Lỗi cập nhật: ' + error.message };
        }

        const profile = {
            username: data.username,
            fullname: data.fullname,
            role: data.role,
            need_change_pass: data.need_change_pass,
            phone: data.phone || '',
            email: data.email || '',
            group: data.group || '',
            active: data.active
        };

        return { success: true, message: 'Đã cập nhật hồ sơ', profile };
    } catch (e) {
        console.error('Update user profile error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * M. DANH SÁCH USERS (Admin only)
 */
async function supabaseListUsers(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền xem danh sách người dùng' };
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('username');

        if (error) {
            return { success: false, message: 'Lỗi: ' + error.message };
        }

        const users = data.map(user => ({
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            need_change_pass: user.need_change_pass,
            phone: user.phone || '',
            email: user.email || '',
            group: user.group || '',
            active: user.active
        }));

        return { success: true, users };
    } catch (e) {
        console.error('List users error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * N. TẠO USER (Admin only)
 */
async function supabaseCreateUser(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền tạo người dùng' };
        }

        const username = (d.new_username || d.username || '').trim().toLowerCase();
        if (!username) {
            return { success: false, message: 'Thiếu tên đăng nhập' };
        }
        if (!d.new_fullname) {
            return { success: false, message: 'Thiếu họ tên' };
        }
        if (!d.new_role) {
            return { success: false, message: 'Thiếu vai trò' };
        }

        // Kiểm tra username đã tồn tại chưa
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return { success: false, message: 'Tên đăng nhập đã tồn tại' };
        }

        const passwordPlain = d.new_password || '123456';
        const hashed = hashPassword(passwordPlain);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                username: username,
                password: hashed,
                fullname: d.new_fullname,
                role: d.new_role.toUpperCase(),
                need_change_pass: true,
                phone: d.new_phone || '',
                email: d.new_email || '',
                group: d.new_group || '',
                active: true
            }])
            .select()
            .single();

        if (error) {
            return { success: false, message: 'Lỗi tạo user: ' + error.message };
        }

        return { success: true, message: 'Đã tạo người dùng mới với mật khẩu tạm: ' + passwordPlain };
    } catch (e) {
        console.error('Create user error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * O. CẬP NHẬT USER (Admin only)
 */
async function supabaseUpdateUser(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền chỉnh sửa người dùng' };
        }

        if (!d.target_username) {
            return { success: false, message: 'Thiếu username cần chỉnh sửa' };
        }

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (d.fullname !== undefined) updateData.fullname = d.fullname;
        if (d.user_role !== undefined) updateData.role = d.user_role.toUpperCase();
        if (d.phone !== undefined) updateData.phone = d.phone || '';
        if (d.email !== undefined) updateData.email = d.email || '';
        if (d.group !== undefined) updateData.group = d.group || '';
        if (d.active !== undefined) updateData.active = !!d.active;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('username', d.target_username.toLowerCase())
            .select()
            .single();

        if (error) {
            return { success: false, message: 'Lỗi cập nhật: ' + error.message };
        }

        const user = {
            username: data.username,
            fullname: data.fullname,
            role: data.role,
            need_change_pass: data.need_change_pass,
            phone: data.phone || '',
            email: data.email || '',
            group: data.group || '',
            active: data.active
        };

        return { success: true, message: 'Đã cập nhật người dùng', user };
    } catch (e) {
        console.error('Update user error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * P. RESET USER PASSWORD (Admin only)
 */
async function supabaseResetUserPassword(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền reset mật khẩu' };
        }

        if (!d.target_username) {
            return { success: false, message: 'Thiếu username cần reset' };
        }

        const newPassword = d.new_password || '123456';
        const hashed = hashPassword(newPassword);

        const { error } = await supabase
            .from('users')
            .update({
                password: hashed,
                need_change_pass: true,
                updated_at: new Date().toISOString()
            })
            .eq('username', d.target_username.toLowerCase());

        if (error) {
            return { success: false, message: 'Lỗi reset password: ' + error.message };
        }

        return { success: true, message: 'Đã reset mật khẩu về: ' + newPassword };
    } catch (e) {
        console.error('Reset user password error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Q. LẤY USERS THEO ROLE
 */
async function supabaseGetUsersByRole(targetRole) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const { data, error } = await supabase
            .from('users')
            .select('username, fullname, role, group, active')
            .eq('role', targetRole)
            .eq('active', true)
            .order('fullname');

        if (error) {
            return { success: false, message: 'Lỗi: ' + error.message };
        }

        const users = data.map(user => ({
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            group: user.group || ''
        }));

        return { success: true, users };
    } catch (e) {
        console.error('Get users by role error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * R. CẬP NHẬT LƯƠNG NĂNG SUẤT
 */
async function supabaseUpdateProductivityBonus(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!d.id) {
            return { success: false, message: 'Thiếu ID tờ trình' };
        }

        // Lấy approval hiện tại
        const { data: approval, error: getError } = await supabase
            .from('approvals')
            .select('*')
            .eq('id', d.id)
            .single();

        if (getError || !approval) {
            return { success: false, message: 'Không tìm thấy tờ trình' };
        }

        const oldProductivityBonus = approval.productivity_bonus || 0;

        if (d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
            const newProductivityBonus = parseVND(d.productivity_bonus);

            if (newProductivityBonus !== oldProductivityBonus) {
                // Cập nhật productivity bonus
                const { error: updateError } = await supabase
                    .from('approvals')
                    .update({
                        productivity_bonus: newProductivityBonus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', d.id);

                if (updateError) {
                    return { success: false, message: 'Lỗi cập nhật: ' + updateError.message };
                }

                // Ghi log điều chỉnh
                const time = new Date().toLocaleString('vi-VN', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
                });
                const oldFormatted = oldProductivityBonus ? formatCurrency(oldProductivityBonus) + ' VNĐ' : 'Chưa nhập';
                const newFormatted = d.productivity_bonus_formatted || (formatCurrency(newProductivityBonus) + ' VNĐ');
                const logEntry = time + ' | ' + d.username + ' (' + d.role + ') | ĐIỀU CHỈNH LƯƠNG NĂNG SUẤT | ' + oldFormatted + ' → ' + newFormatted;
                const oldLog = approval.history_log || '';

                await supabase
                    .from('approvals')
                    .update({
                        history_log: oldLog ? oldLog + "\n" + logEntry : logEntry
                    })
                    .eq('id', d.id);
            }
        }

        return { success: true, message: 'Đã cập nhật lương năng suất thành công' };
    } catch (e) {
        console.error('Update productivity bonus error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// WRAPPER FUNCTION - Tương thích với callAPI hiện tại
// ======================================================

/**
 * Wrapper function để tương thích với code hiện tại
 * Tự động chuyển từ Google Apps Script sang Supabase
 */
async function callSupabaseAPI(data) {
    const action = data.action;

    try {
        switch (action) {
            case 'login':
                return await supabaseLogin(data.username, data.password);
            
            case 'change_password':
                return await supabaseChangePassword(data.username, data.old_pass, data.new_pass);
            
            case 'submit_request':
                return await supabaseCreateRequest(data);
            
            case 'get_pending_list':
                return await supabaseGetPendingList(data.username, data.role);
            
            case 'get_my_requests':
                return await supabaseGetMyRequests(data.username, data.role);
            
            case 'approve_reject':
                return await supabaseProcessApproval(data);
            
            case 'get_request_detail':
                return await supabaseGetRequestDetail(data.id, data.username);
            
            case 'update_request':
                return await supabaseUpdateRequest(data);
            
            case 'resubmit':
                return await supabaseResubmitRequest(data);
            
            case 'lookup_contract':
                // lookup_contract vẫn cần Google Sheets external, có thể migrate sau
                // Tạm thời return lỗi để fallback (nếu cần)
                return await supabaseLookupContract(data.search_code);
            
            case 'get_profile':
                return await supabaseGetUserProfile(data);
            
            case 'update_profile':
                return await supabaseUpdateUserProfile(data);
            
            case 'list_users':
                return await supabaseListUsers(data);
            
            case 'create_user':
                return await supabaseCreateUser(data);
            
            case 'update_user':
                return await supabaseUpdateUser(data);
            
            case 'reset_user_password':
                return await supabaseResetUserPassword(data);
            
            case 'get_users_by_role':
                return await supabaseGetUsersByRole(data.role);
            
            case 'update_productivity_bonus':
                return await supabaseUpdateProductivityBonus(data);
            
            default:
                return { success: false, message: 'Action không được hỗ trợ: ' + action };
        }
    } catch (e) {
        console.error('Supabase API error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// Export để sử dụng
window.supabaseAPI = {
    login: supabaseLogin,
    changePassword: supabaseChangePassword,
    createRequest: supabaseCreateRequest,
    getPendingList: supabaseGetPendingList,
    getMyRequests: supabaseGetMyRequests,
    processApproval: supabaseProcessApproval,
    getRequestDetail: supabaseGetRequestDetail,
    updateRequest: supabaseUpdateRequest,
    resubmitRequest: supabaseResubmitRequest,
    callAPI: callSupabaseAPI
};

