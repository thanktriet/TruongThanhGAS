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
    
    if (!window.supabase) {
        console.error('Supabase library chưa được load. Đảm bảo đã load @supabase/supabase-js');
        return null;
    }
    
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
        // Export ra window để có thể dùng trong test page
        window.supabaseClient = supabaseClient;
        console.log('✅ Supabase client đã được khởi tạo');
    }
    return supabaseClient;
}

// Tự động khởi tạo khi DOM ready
if (typeof window !== 'undefined') {
    // Khởi tạo ngay khi script load nếu config đã sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => initSupabase(), 100);
        });
    } else {
        setTimeout(() => initSupabase(), 100);
    }
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
            active: data.active,
            permissions: data.permissions || {}  // ✅ Thêm permissions từ database
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

            // Logic hiển thị theo role:
            // - TPKD: chỉ xem tờ trình của chính mình hoặc tờ trình được TVBH trình cho họ
            // - Admin, GĐKD, BKS, BGĐ, KT: xem được tất cả tờ trình
            let show = false;
            
            if (role === 'TPKD') {
                // TPKD chỉ xem được:
                // 1. Tờ trình của chính mình (mình là requester)
                // 2. Tờ trình mà TVBH trình cho họ (approver_step0 = username của họ)
                const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
                const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
                show = isMyRequest || isAssignedToMe;
            } else if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
                // Admin, GĐKD, BKS, BGĐ, KT: xem được tất cả tờ trình
                show = true;
            } else {
                // TVBH/SALE: chỉ xem tờ trình của mình
                show = isRejectedAndRequester ||
                       (isRequester && row.current_step >= 0) ||
                       canViewCompleted;
            }

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
                    can_resubmit: (row.current_step === 0 && isRequester),
                    is_completed: isCompleted, // Flag để template biết tờ trình đã hoàn tất
                    // Quyền in:
                    // - Admin, GĐKD, BKS, BGĐ, KT: có thể in tất cả tờ trình đã hoàn tất
                    // - TVBH/SALE: có thể in tờ trình của chính mình khi hoàn tất
                    // - TPKD: có thể in tờ trình của mình hoặc được giao cho họ khi hoàn tất
                    can_print: false // Sẽ được tính ở đây
                };

                // Tính can_print dựa vào role và quyền sở hữu
                if (isCompleted) {
                    if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
                        // Admin, GĐKD, BKS, BGĐ, KT: in được tất cả
                        item.can_print = true;
                    } else if (role === 'TVBH' || role === 'SALE') {
                        // TVBH/SALE: chỉ in được tờ trình của chính mình
                        item.can_print = isRequester;
                    } else if (role === 'TPKD') {
                        // TPKD: in được tờ trình của mình hoặc được giao cho họ
                        const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
                        const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
                        item.can_print = isMyRequest || isAssignedToMe;
                    }
                }

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

        // Kiểm tra: Không cho điều chỉnh lương năng suất sau khi hoàn thành
        const isCompleted = approval.current_step >= 4;
        if (isCompleted && d.productivity_bonus !== undefined && d.productivity_bonus !== null && d.productivity_bonus !== '') {
            const newProductivityBonus = parseVND(d.productivity_bonus);
            const oldProductivityBonus = approval.productivity_bonus || 0;
            if (newProductivityBonus !== oldProductivityBonus) {
                return { success: false, message: 'Không được điều chỉnh lương năng suất sau khi tờ trình đã hoàn thành' };
            }
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

        // Logic lọc theo role:
        // - TPKD: chỉ lấy tờ trình của mình hoặc được trình cho mình
        // - Admin, GĐKD, BKS, BGĐ, KT: lấy tất cả
        // - TVBH/SALE: chỉ lấy tờ trình của mình
        if (role === 'TPKD') {
            // TPKD: tờ trình của mình hoặc được trình cho mình
            query = query.or(`requester.eq.${username},approver_step0.eq.${username}`);
        } else if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
            // Admin, GĐKD, BKS, BGĐ, KT: lấy tất cả
            // Không filter gì
        } else {
            // TVBH/SALE: chỉ lấy tờ trình của mình
            query = query.eq('requester', username);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, message: 'Lỗi: ' + error.message };
        }

        // Filter theo role nếu cần
        let filteredData = data;
        if (role === 'TPKD') {
            // TPKD: chỉ tờ trình của mình hoặc được trình cho mình
            const usernameLower = String(username).toLowerCase();
            filteredData = data.filter(row => {
                const isMyRequest = String(row.requester || '').toLowerCase() === usernameLower;
                const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
                return isMyRequest || isAssignedToMe;
            });
        } else if (role !== 'ADMIN' && role !== 'GDKD' && role !== 'BKS' && role !== 'BGD' && role !== 'KETOAN') {
            // TVBH/SALE: chỉ tờ trình của mình
            const usernameLower = String(username).toLowerCase();
            filteredData = data.filter(row => 
                String(row.requester || '').toLowerCase() === usernameLower
            );
        }

        const resultList = filteredData.map(row => {
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
                can_resubmit: (row.current_step === 0),
                is_completed: row.current_step >= 4, // Flag để template biết tờ trình đã hoàn tất
                // Quyền in sẽ được tính ở đây
                can_print: false
            };

            // Tính can_print dựa vào role và quyền sở hữu
            const isCompleted = row.current_step >= 4;
            const usernameLower = String(username).toLowerCase();
            
            if (isCompleted) {
                if (role === 'ADMIN' || role === 'GDKD' || role === 'BKS' || role === 'BGD' || role === 'KETOAN') {
                    // Admin, GĐKD, BKS, BGĐ, KT: in được tất cả
                    item.can_print = true;
                } else if (role === 'TVBH' || role === 'SALE') {
                    // TVBH/SALE: chỉ in được tờ trình của chính mình
                    const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
                    item.can_print = isMyRequest;
                } else if (role === 'TPKD') {
                    // TPKD: in được tờ trình của mình hoặc được giao cho họ
                    const isMyRequest = String(row.requester).toLowerCase() === usernameLower;
                    const isAssignedToMe = String(row.approver_step0 || '').toLowerCase() === usernameLower;
                    item.can_print = isMyRequest || isAssignedToMe;
                }
            }

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

        // Kiểm tra quyền xem tờ trình
        // Lấy user role từ session (cần truyền từ frontend)
        // Sẽ kiểm tra ở frontend trước khi gọi function này
        // Function này chỉ trả về data, không kiểm tra quyền chi tiết

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
            productivity_bonus: approval.productivity_bonus ? formatCurrency(approval.productivity_bonus) : '',
            approver_step0: approval.approver_step0 || '', // Cần để kiểm tra quyền in cho TPKD
            // can_print sẽ được set ở frontend dựa vào role
            can_print: false
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

        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Tìm contract trong Supabase
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('contract_code', code.toUpperCase())
            .single();
        
        if (error || !data) {
            // Không tìm thấy trong Supabase, có thể fallback về Google Apps Script nếu cần
            return { 
                success: false, 
                message: 'Không tìm thấy đơn hàng: ' + code,
                fallback: true 
            };
        }
        
        return {
            success: true,
            data: {
                tvbh: data.tvbh || '',
                name: data.name || '',
                phone: data.phone || '',
                cccd: data.cccd || '',
                issueDate: data.issue_date ? formatDate(data.issue_date) : '',
                issuePlace: data.issue_place || '',
                email: data.email || '',
                carModel: data.car_model || '',
                carVersion: data.car_version || '',
                carColor: data.car_color || '',
                payment: data.payment || '',
                address: data.address || ''
            }
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
            active: user.active,
            permissions: user.permissions || {}
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
 * P.1. UPDATE USER PERMISSIONS (Admin only)
 */
async function supabaseUpdateUserPermissions(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Chỉ ADMIN mới có quyền update permissions
        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền quản lý permissions' };
        }

        if (!d.target_username) {
            return { success: false, message: 'Thiếu username' };
        }

        // Validate permissions structure
        if (!d.permissions || typeof d.permissions !== 'object') {
            return { success: false, message: 'Permissions không hợp lệ' };
        }

        // Ensure permissions is a valid JSONB object (only boolean values)
        const permissionsToSave = {};
        Object.keys(d.permissions).forEach(key => {
            permissionsToSave[key] = d.permissions[key] === true;
        });

        const { error } = await supabase
            .from('users')
            .update({ 
                permissions: permissionsToSave,
                updated_at: new Date().toISOString()
            })
            .eq('username', d.target_username.toLowerCase());

        if (error) {
            return { success: false, message: 'Lỗi cập nhật: ' + error.message };
        }

        return { success: true, message: 'Đã cập nhật permissions thành công' };
    } catch (e) {
        console.error('Update user permissions error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * P.1. UPDATE USER PERMISSIONS (Admin only)
 */
async function supabaseUpdateUserPermissions(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Chỉ ADMIN mới có quyền update permissions
        if (d.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền quản lý permissions' };
        }

        if (!d.target_username) {
            return { success: false, message: 'Thiếu username' };
        }

        // Validate permissions structure
        if (!d.permissions || typeof d.permissions !== 'object') {
            return { success: false, message: 'Permissions không hợp lệ' };
        }

        // Ensure permissions is a valid JSONB object (only boolean values)
        const permissionsToSave = {};
        Object.keys(d.permissions).forEach(key => {
            permissionsToSave[key] = d.permissions[key] === true;
        });

        const { error } = await supabase
            .from('users')
            .update({ 
                permissions: permissionsToSave,
                updated_at: new Date().toISOString()
            })
            .eq('username', d.target_username.toLowerCase());

        if (error) {
            return { success: false, message: 'Lỗi cập nhật: ' + error.message };
        }

        return { success: true, message: 'Đã cập nhật permissions thành công' };
    } catch (e) {
        console.error('Update user permissions error:', e);
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

        // Kiểm tra quyền: Không cho bất cứ ai cập nhật lương năng suất sau khi hoàn thành
        const isCompleted = approval.current_step >= 4;
        if (isCompleted) {
            return { success: false, message: 'Không được cập nhật lương năng suất sau khi tờ trình đã hoàn thành' };
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
// CUSTOMERS API - Quản lý khách hàng
// ======================================================

/**
 * Tìm kiếm khách hàng theo CCCD
 */
async function supabaseSearchCustomerByCCCD(cccd) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!cccd || !cccd.trim()) {
            return { success: false, message: 'Vui lòng nhập số CCCD' };
        }

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('cccd', cccd.trim())
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Không tìm thấy
                return { success: false, message: 'Không tìm thấy khách hàng với CCCD: ' + cccd };
            }
            throw error;
        }

        return { success: true, data: data };
    } catch (e) {
        console.error('Search customer error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Tạo hoặc cập nhật khách hàng
 */
async function supabaseUpsertCustomer(customerData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!customerData.cccd || !customerData.cccd.trim()) {
            return { success: false, message: 'Số CCCD là bắt buộc' };
        }

        if (!customerData.name || !customerData.name.trim()) {
            return { success: false, message: 'Tên khách hàng là bắt buộc' };
        }

        const customer = {
            cccd: customerData.cccd.trim(),
            name: customerData.name.trim(),
            phone: customerData.phone || null,
            email: customerData.email || null,
            address: customerData.address || null,
            issue_date: customerData.issue_date || null,
            issue_place: customerData.issue_place || null,
            cccd_front_image_url: customerData.cccd_front_image_url || null,
            cccd_back_image_url: customerData.cccd_back_image_url || null,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('customers')
            .upsert(customer, { onConflict: 'cccd' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã lưu thông tin khách hàng thành công' };
    } catch (e) {
        console.error('Upsert customer error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// ORDERS API - Quản lý đơn hàng
// ======================================================

/**
 * TVBH tạo đơn hàng mới
 */
async function supabaseCreateOrder(orderData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!orderData.requester) {
            return { success: false, message: 'Thiếu thông tin người tạo' };
        }

        if (!orderData.customer_cccd) {
            return { success: false, message: 'Thiếu thông tin khách hàng (CCCD)' };
        }

        // Đảm bảo customer tồn tại
        const customerCheck = await supabaseSearchCustomerByCCCD(orderData.customer_cccd);
        if (!customerCheck.success) {
            return { success: false, message: 'Khách hàng chưa được tạo. Vui lòng tạo khách hàng trước.' };
        }

        // Handle attachments - ensure it's a valid JSON array
        let attachmentsJSON = '[]';
        if (orderData.attachments) {
            if (Array.isArray(orderData.attachments)) {
                attachmentsJSON = JSON.stringify(orderData.attachments);
            } else if (typeof orderData.attachments === 'string') {
                // Already a JSON string, validate it
                try {
                    JSON.parse(orderData.attachments);
                    attachmentsJSON = orderData.attachments;
                } catch (e) {
                    console.warn('Invalid attachments JSON string, using empty array');
                    attachmentsJSON = '[]';
                }
            }
        }

        const order = {
            requester: orderData.requester,
            customer_cccd: orderData.customer_cccd.trim(),
            car_model: orderData.car_model || null,
            car_version: orderData.car_version || null,
            car_color: orderData.car_color || null,
            payment_method: orderData.payment_method || null,
            status: 'pending', // Chưa có mã
            attachments: attachmentsJSON,
            notes: orderData.notes || null
        };

        const { data, error } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã tạo đơn hàng thành công' };
    } catch (e) {
        console.error('Create order error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * TVBH lấy danh sách đơn hàng của mình
 */
async function supabaseGetMyOrders(username, filters = {}) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        let query = supabase
            .from('orders')
            .select(`
                *,
                customers:customer_cccd (
                    cccd, name, phone, email, address,
                    cccd_front_image_url, cccd_back_image_url,
                    issue_date, issue_place
                )
            `)
            .eq('requester', username)
            .order('created_at', { ascending: false });

        // Filter theo status
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        // Filter theo có/không có mã
        if (filters.has_contract_code !== undefined) {
            if (filters.has_contract_code) {
                query = query.not('contract_code', 'is', null);
            } else {
                query = query.is('contract_code', null);
            }
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return { success: true, data: data || [] };
    } catch (e) {
        console.error('Get my orders error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * SaleAdmin lấy danh sách tất cả đơn hàng (ưu tiên chưa có mã)
 */
async function supabaseGetOrdersForSaleAdmin(filters = {}) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        let query = supabase
            .from('orders')
            .select(`
                *,
                customers:customer_cccd (
                    cccd, name, phone, email, address, 
                    cccd_front_image_url, cccd_back_image_url,
                    issue_date, issue_place
                ),
                requester_user:requester (
                    username, fullname, "group"
                )
            `)
            .order('contract_code', { ascending: true, nullsFirst: true }) // Đơn chưa có mã lên đầu
            .order('created_at', { ascending: false });

        // Filter theo TVBH
        if (filters.requester) {
            query = query.eq('requester', filters.requester);
        }

        // Filter theo status
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return { success: true, data: data || [] };
    } catch (e) {
        console.error('Get orders for sale admin error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * SaleAdmin cấp mã đơn hàng (contract_code)
 */
async function supabaseAssignContractCode(orderId, contractCode, assignedSale) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!contractCode || !contractCode.trim()) {
            return { success: false, message: 'Vui lòng nhập mã đơn hàng' };
        }

        // Kiểm tra mã đã tồn tại chưa
        const { data: existingOrder, error: checkError } = await supabase
            .from('orders')
            .select('id')
            .eq('contract_code', contractCode.trim())
            .neq('id', orderId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        if (existingOrder) {
            return { success: false, message: 'Mã đơn hàng đã tồn tại: ' + contractCode };
        }

        // Cập nhật đơn hàng
        const updateData = {
            contract_code: contractCode.trim(),
            assigned_sale: assignedSale || null,
            status: 'assigned',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã cấp mã đơn hàng thành công' };
    } catch (e) {
        console.error('Assign contract code error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// DAILY REPORTS API - Báo cáo ngày
// ======================================================

/**
 * TVBH nhập báo cáo ngày
 */
async function supabaseSubmitDailyReport(reportData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!reportData.tvbh || !reportData.date) {
            return { success: false, message: 'Thiếu thông tin báo cáo' };
        }

        // Xóa báo cáo cũ của ngày hôm nay (nếu có)
        const today = new Date(reportData.date).toISOString().split('T')[0];
        
        const { error: deleteError } = await supabase
            .from('daily_reports')
            .delete()
            .eq('tvbh', reportData.tvbh)
            .eq('date', today);

        if (deleteError && deleteError.code !== 'PGRST116') {
            console.warn('Delete old reports error:', deleteError);
        }

        // Tạo báo cáo mới
        const reports = [];

        // Báo cáo KHTN
        if (reportData.khtn && parseFloat(reportData.khtn) > 0) {
            reports.push({
                date: today,
                tvbh: reportData.tvbh,
                group: reportData.group || null,
                car_model: null, // KHTN không có dòng xe
                khtn: parseFloat(reportData.khtn) || 0,
                hop_dong: 0,
                xhd: 0,
                doanh_thu: 0
            });
        }

        // Báo cáo theo từng dòng xe
        if (reportData.carModels && Array.isArray(reportData.carModels)) {
            reportData.carModels.forEach(model => {
                const hopDong = parseFloat(model.hopDong) || 0;
                const xhd = parseFloat(model.xhd) || 0;
                const doanhThu = parseFloat(model.doanhThu) || 0;

                if (hopDong > 0 || xhd > 0 || doanhThu > 0) {
                    reports.push({
                        date: today,
                        tvbh: reportData.tvbh,
                        group: reportData.group || null,
                        car_model: model.name || null,
                        khtn: 0,
                        hop_dong: hopDong,
                        xhd: xhd,
                        doanh_thu: doanhThu
                    });
                }
            });
        }

        if (reports.length === 0) {
            return { success: true, message: 'Không có dữ liệu mới để lưu' };
        }

        const { data, error } = await supabase
            .from('daily_reports')
            .insert(reports)
            .select();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: `Đã lưu ${data.length} dòng báo cáo` };
    } catch (e) {
        console.error('Submit daily report error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy báo cáo hôm nay của TVBH
 */
async function supabaseGetTodayReport(tvbhName) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('daily_reports')
            .select('*')
            .eq('tvbh', tvbhName)
            .eq('date', today)
            .order('car_model', { ascending: true, nullsFirst: true });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return { success: true, data: null };
        }

        // Gom dữ liệu theo format như app2
        const reportData = {
            khtn: 0,
            carModels: {}
        };

        data.forEach(row => {
            if (!row.car_model) {
                // KHTN
                reportData.khtn += parseFloat(row.khtn) || 0;
            } else {
                // Dòng xe
                if (!reportData.carModels[row.car_model]) {
                    reportData.carModels[row.car_model] = {
                        hopDong: 0,
                        xhd: 0,
                        doanhThu: 0
                    };
                }
                reportData.carModels[row.car_model].hopDong += parseFloat(row.hop_dong) || 0;
                reportData.carModels[row.car_model].xhd += parseFloat(row.xhd) || 0;
                reportData.carModels[row.car_model].doanhThu += parseFloat(row.doanh_thu) || 0;
            }
        });

        return { success: true, data: reportData };
    } catch (e) {
        console.error('Get today report error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy danh sách dòng xe từ database
 * Lấy từ bảng car_models (chỉ lấy các dòng xe đang active)
 */
async function supabaseGetCarModels() {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Lấy từ bảng car_models (chỉ lấy is_active = true)
        const { data, error } = await supabase
            .from('car_models')
            .select('name')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.warn('Không thể lấy danh sách xe từ car_models, thử fallback:', error);
            // Fallback: Lấy từ orders và approvals
            return await supabaseGetCarModelsFallback();
        }

        if (!data || data.length === 0) {
            // Nếu không có dữ liệu, thử fallback
            return await supabaseGetCarModelsFallback();
        }

        // Trả về danh sách tên xe
        const carModels = data.map(row => row.name).filter(name => name && name.trim());
        
        return { success: true, data: carModels };
    } catch (e) {
        console.error('Get car models error:', e);
        // Fallback về danh sách mặc định nếu có lỗi
        return await supabaseGetCarModelsFallback();
    }
}

/**
 * Fallback: Lấy danh sách xe từ orders và approvals (nếu bảng car_models chưa có dữ liệu)
 */
async function supabaseGetCarModelsFallback() {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            const defaultModels = ['VF 5 Plus', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'];
            return { success: true, data: defaultModels };
        }

        // Lấy từ orders
        const { data: ordersData } = await supabase
            .from('orders')
            .select('car_model')
            .not('car_model', 'is', null);

        // Lấy từ approvals
        const { data: approvalsData } = await supabase
            .from('approvals')
            .select('car_model')
            .not('car_model', 'is', null);

        // Gom tất cả car_model vào Set để loại bỏ trùng
        const carModelsSet = new Set();
        
        if (ordersData && Array.isArray(ordersData)) {
            ordersData.forEach(row => {
                if (row.car_model && row.car_model.trim()) {
                    carModelsSet.add(row.car_model.trim());
                }
            });
        }
        
        if (approvalsData && Array.isArray(approvalsData)) {
            approvalsData.forEach(row => {
                if (row.car_model && row.car_model.trim()) {
                    carModelsSet.add(row.car_model.trim());
                }
            });
        }

        // Nếu không có dữ liệu, trả về danh sách mặc định
        if (carModelsSet.size === 0) {
            const defaultModels = ['VF 5 Plus', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'];
            return { success: true, data: defaultModels };
        }

        // Sắp xếp và trả về
        const carModels = Array.from(carModelsSet).sort();
        
        return { success: true, data: carModels };
    } catch (e) {
        console.error('Get car models fallback error:', e);
        const defaultModels = ['VF 5 Plus', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'];
        return { success: true, data: defaultModels };
    }
}

// ======================================================
// CAR MODELS MANAGEMENT API - Quản lý dòng xe (ADMIN only)
// ======================================================

/**
 * Lấy danh sách tất cả dòng xe (cho admin quản lý)
 */
async function supabaseListCarModels() {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const { data, error } = await supabase
            .from('car_models')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return { success: true, data: data || [] };
    } catch (e) {
        console.error('List car models error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Tạo dòng xe mới
 */
async function supabaseCreateCarModel(carModelData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền tạo dòng xe
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền tạo dòng xe' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_car_models')) {
            return { success: false, message: 'Bạn không có quyền quản lý dòng xe' };
        }

        if (!carModelData.name || !carModelData.name.trim()) {
            return { success: false, message: 'Tên dòng xe không được để trống' };
        }

        const username = session.username;

        const { data, error } = await supabase
            .from('car_models')
            .insert({
                name: carModelData.name.trim(),
                display_order: carModelData.display_order || 0,
                is_active: carModelData.is_active !== undefined ? carModelData.is_active : true,
                created_by: username,
                updated_by: username
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, message: 'Dòng xe này đã tồn tại' };
            }
            throw error;
        }

        return { success: true, data: data, message: 'Đã tạo dòng xe thành công' };
    } catch (e) {
        console.error('Create car model error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Cập nhật dòng xe
 */
async function supabaseUpdateCarModel(id, carModelData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền sửa dòng xe
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền cập nhật dòng xe' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_car_models')) {
            return { success: false, message: 'Bạn không có quyền quản lý dòng xe' };
        }

        if (!id) {
            return { success: false, message: 'ID không hợp lệ' };
        }

        const username = session.username;

        const updateData = {
            updated_by: username
        };

        if (carModelData.name !== undefined) {
            updateData.name = carModelData.name.trim();
        }
        if (carModelData.display_order !== undefined) {
            updateData.display_order = carModelData.display_order;
        }
        if (carModelData.is_active !== undefined) {
            updateData.is_active = carModelData.is_active;
        }

        const { data, error } = await supabase
            .from('car_models')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, message: 'Tên dòng xe này đã tồn tại' };
            }
            throw error;
        }

        return { success: true, data: data, message: 'Đã cập nhật dòng xe thành công' };
    } catch (e) {
        console.error('Update car model error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Xóa dòng xe
 */
async function supabaseDeleteCarModel(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền xóa dòng xe
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền xóa dòng xe' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_car_models')) {
            return { success: false, message: 'Bạn không có quyền quản lý dòng xe' };
        }

        const id = d.id || d;
        if (!id) {
            return { success: false, message: 'ID không hợp lệ' };
        }

        const { error } = await supabase
            .from('car_models')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return { success: true, message: 'Đã xóa dòng xe thành công' };
    } catch (e) {
        console.error('Delete car model error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// SALES POLICIES API - Quản lý chính sách bán hàng
// ======================================================

/**
 * Lấy danh sách tất cả chính sách bán hàng (ADMIN only)
 */
async function supabaseListSalesPolicies() {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const { data, error } = await supabase
            .from('sales_policies')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return { success: true, data: data || [] };
    } catch (e) {
        console.error('List sales policies error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy danh sách chính sách đang active (cho form HĐMB)
 */
async function supabaseGetActiveSalesPolicies() {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        const today = new Date().toISOString().split('T')[0];

        // Query: lấy tất cả policies active
        // Nếu có valid_from và valid_to: kiểm tra today nằm trong khoảng
        // Nếu không có valid dates (NULL): luôn hiển thị (không giới hạn thời gian)
        const { data, error } = await supabase
            .from('sales_policies')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        // Filter theo valid dates ở client side để xử lý NULL
        const filteredData = (data || []).filter(policy => {
            // Nếu không có valid_from và valid_to: luôn hiển thị
            if (!policy.valid_from && !policy.valid_to) {
                return true;
            }
            
            // Nếu có valid_from: today >= valid_from (hoặc valid_from là NULL)
            const validFromCheck = !policy.valid_from || policy.valid_from <= today;
            
            // Nếu có valid_to: today <= valid_to (hoặc valid_to là NULL)
            const validToCheck = !policy.valid_to || policy.valid_to >= today;
            
            return validFromCheck && validToCheck;
        });

        console.log('[Sales Policies] Found', filteredData.length, 'active policies for today', today);
        
        return { success: true, data: filteredData };
    } catch (e) {
        console.error('Get active sales policies error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Tạo chính sách bán hàng mới
 */
async function supabaseCreateSalesPolicy(policyData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền tạo chính sách
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền tạo chính sách bán hàng' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_sales_policies')) {
            return { success: false, message: 'Bạn không có quyền quản lý chính sách bán hàng' };
        }

        if (!policyData.name || !policyData.name.trim()) {
            return { success: false, message: 'Tên chính sách không được để trống' };
        }

        if (!policyData.description || !policyData.description.trim()) {
            return { success: false, message: 'Mô tả chính sách không được để trống' };
        }

        const username = session.username;

        const { data, error } = await supabase
            .from('sales_policies')
            .insert({
                name: policyData.name.trim(),
                description: policyData.description.trim(),
                display_order: policyData.display_order || 0,
                is_active: policyData.is_active !== undefined ? policyData.is_active : true,
                valid_from: policyData.valid_from || null,
                valid_to: policyData.valid_to || null,
                created_by: username,
                updated_by: username
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã tạo chính sách thành công' };
    } catch (e) {
        console.error('Create sales policy error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Cập nhật chính sách bán hàng
 */
async function supabaseUpdateSalesPolicy(id, policyData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền sửa chính sách
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền cập nhật chính sách bán hàng' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_sales_policies')) {
            return { success: false, message: 'Bạn không có quyền quản lý chính sách bán hàng' };
        }

        if (!id) {
            return { success: false, message: 'ID không hợp lệ' };
        }

        const username = session.username;

        const updateData = {
            updated_by: username,
            updated_at: new Date().toISOString()
        };

        if (policyData.name !== undefined) {
            updateData.name = policyData.name.trim();
        }
        if (policyData.description !== undefined) {
            updateData.description = policyData.description.trim();
        }
        if (policyData.display_order !== undefined) {
            updateData.display_order = policyData.display_order;
        }
        if (policyData.is_active !== undefined) {
            updateData.is_active = policyData.is_active;
        }
        if (policyData.valid_from !== undefined) {
            updateData.valid_from = policyData.valid_from || null;
        }
        if (policyData.valid_to !== undefined) {
            updateData.valid_to = policyData.valid_to || null;
        }

        const { data, error } = await supabase
            .from('sales_policies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã cập nhật chính sách thành công' };
    } catch (e) {
        console.error('Update sales policy error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Xóa chính sách bán hàng
 */
async function supabaseDeleteSalesPolicy(d) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền xóa chính sách
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền xóa chính sách bán hàng' };
        }

        // ✅ SECURITY: Kiểm tra permission nếu có hàm hasPermission
        if (typeof hasPermission === 'function' && !hasPermission(session, 'manage_sales_policies')) {
            return { success: false, message: 'Bạn không có quyền quản lý chính sách bán hàng' };
        }

        const id = d.id || d;
        if (!id) {
            return { success: false, message: 'ID không hợp lệ' };
        }

        const { error } = await supabase
            .from('sales_policies')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return { success: true, message: 'Đã xóa chính sách thành công' };
    } catch (e) {
        console.error('Delete sales policy error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// DASHBOARD & MTD REPORTS API - Báo cáo tổng hợp
// ======================================================

/**
 * Lấy dữ liệu Dashboard (Báo cáo Ngày + MTD Tổng)
 * @param {string} filterDate - "yyyy-MM-dd" (Ngày báo cáo, nếu null thì lấy hôm nay)
 * @param {string} filterMonth - "yyyy-MM" (Tháng cho MTD, nếu null thì lấy tháng hiện tại)
 */
async function supabaseGetDashboardData(filterDate = null, filterMonth = null) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Xác định ngày báo cáo
        let selectedDateStr;
        if (filterDate) {
            // filterDate đã là format YYYY-MM-DD từ input type="date"
            // Sử dụng trực tiếp không cần convert để tránh timezone issues
            selectedDateStr = filterDate;
        } else {
            // Mặc định hôm nay - format YYYY-MM-DD
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            selectedDateStr = `${year}-${month}-${day}`;
        }
        
        // Tạo Date object từ selectedDateStr để format display (chỉ để hiển thị)
        const [year, month, day] = selectedDateStr.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        
        // Debug logging
        console.log('[Dashboard] Date filter:', {
            filterDate: filterDate,
            selectedDateStr: selectedDateStr,
            selectedDate: selectedDate,
            year: year,
            month: month,
            day: day
        });

        // Xác định tháng cần lấy dữ liệu cho MTD
        let startDate, endDate, mtdEndDate;
        if (filterMonth) {
            const [year, month] = filterMonth.split('-').map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            // MTD kết thúc ở ngày được chọn hoặc cuối tháng (tùy vào ngày nào nhỏ hơn)
            mtdEndDate = selectedDate <= endDate ? selectedDate : endDate;
        } else {
            // Mặc định tháng hiện tại
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0, 23, 59, 59);
            mtdEndDate = selectedDate <= endDate ? selectedDate : endDate;
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const mtdEndDateStr = mtdEndDate.toISOString().split('T')[0];

        // 1. Lấy danh sách TVBH (role = 'TVBH')
        // Note: Column name là 'fullname' (không phải 'full_name')
        const { data: tvbhUsers, error: tvbhError } = await supabase
            .from('users')
            .select('username, fullname, "group"')
            .eq('role', 'TVBH')
            .eq('active', true)
            .order('"group"', { ascending: true, nullsFirst: false })
            .order('username', { ascending: true });

        if (tvbhError) {
            console.error('Error fetching TVBH users:', tvbhError);
            return { success: false, message: 'Lỗi lấy danh sách TVBH: ' + tvbhError.message };
        }

        if (!tvbhUsers || tvbhUsers.length === 0) {
            return { 
                success: true, 
                data: {
                    daily: [['Nhóm', 'TVBH', 'KHTN (Hôm nay)', 'Số Ký HĐ (Hôm nay)', 'Số XHĐ (Hôm nay)', 'Doanh Thu (Hôm nay)'], ['TỔNG CỘNG', '', 0, 0, 0, '0']],
                    mtdTotal: [['Hạng', 'Nhóm', 'TVBH', 'KHTN (TĐ)', 'KHTN (CT)', 'KHTN (%)', 'HĐ (TĐ)', 'HĐ (CT)', 'HĐ (%)', 'XHĐ (TĐ)', 'XHĐ (CT)', 'XHĐ (%)', 'Doanh Thu (TĐ)', 'Doanh Thu (CT)', 'Doanh Thu (%)'], ['', 'TỔNG CỘNG', '', 0, 0, '0%', 0, 0, '0%', 0, 0, '0%', '0', '0', '0%']]
                }
            };
        }

        // Tạo map TVBH -> Group
        const tvbhMap = {};
        tvbhUsers.forEach(user => {
            tvbhMap[user.username] = user.group || '';
        });

        // 2. Lấy dữ liệu báo cáo ngày (ngày được chọn)
        console.log('[Dashboard] Querying daily_reports with date:', selectedDateStr);
        const { data: dailyReports, error: dailyError } = await supabase
            .from('daily_reports')
            .select('tvbh, khtn, hop_dong, xhd, doanh_thu, date')
            .eq('date', selectedDateStr);

        if (dailyError) {
            console.error('[Dashboard] Error fetching daily reports:', dailyError);
            return { success: false, message: 'Lỗi lấy báo cáo ngày: ' + dailyError.message };
        }

        console.log('[Dashboard] Daily reports found:', {
            count: dailyReports?.length || 0,
            reports: dailyReports?.slice(0, 5) || [], // Log first 5 for debugging
            allDates: dailyReports?.map(r => r.date) || []
        });

        // Tính tổng theo TVBH cho báo cáo ngày và lưu danh sách TVBH đã báo cáo
        const dailyStats = {};
        const reportedTvbhSet = new Set();
        
        // Khởi tạo stats cho tất cả TVBH với giá trị 0
        tvbhUsers.forEach(user => {
            dailyStats[user.username] = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
        });
        
        // Tính tổng từ các báo cáo
        (dailyReports || []).forEach(report => {
            if (dailyStats[report.tvbh]) {
                dailyStats[report.tvbh].khtn += parseFloat(report.khtn) || 0;
                dailyStats[report.tvbh].hopDong += parseFloat(report.hop_dong) || 0;
                dailyStats[report.tvbh].xhd += parseFloat(report.xhd) || 0;
                dailyStats[report.tvbh].doanhThu += parseFloat(report.doanh_thu) || 0;
            }
        });
        
        // Đánh dấu TVBH đã báo cáo (có ít nhất 1 giá trị > 0)
        Object.keys(dailyStats).forEach(tvbh => {
            const stats = dailyStats[tvbh];
            if (stats.khtn > 0 || stats.hopDong > 0 || stats.xhd > 0 || stats.doanhThu > 0) {
                reportedTvbhSet.add(tvbh);
            }
        });

        // 3. Lấy dữ liệu MTD (từ đầu tháng đến ngày được chọn)
        const { data: mtdReports, error: mtdError } = await supabase
            .from('daily_reports')
            .select('tvbh, khtn, hop_dong, xhd, doanh_thu')
            .gte('date', startDateStr)
            .lte('date', mtdEndDateStr);

        if (mtdError) {
            console.error('Error fetching MTD reports:', mtdError);
            return { success: false, message: 'Lỗi lấy báo cáo MTD: ' + mtdError.message };
        }

        // Tính tổng MTD theo TVBH
        const mtdStats = {};
        (mtdReports || []).forEach(report => {
            if (!mtdStats[report.tvbh]) {
                mtdStats[report.tvbh] = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
            }
            mtdStats[report.tvbh].khtn += parseFloat(report.khtn) || 0;
            mtdStats[report.tvbh].hopDong += parseFloat(report.hop_dong) || 0;
            mtdStats[report.tvbh].xhd += parseFloat(report.xhd) || 0;
            mtdStats[report.tvbh].doanhThu += parseFloat(report.doanh_thu) || 0;
        });

        // 4. Tạo bảng Báo cáo Ngày
        // Format date string for header
        const dateDisplay = selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dailyHeaders = ['Nhóm', 'TVBH', `KHTN (${dateDisplay})`, `Số Ký HĐ (${dateDisplay})`, `Số XHĐ (${dateDisplay})`, `Doanh Thu (${dateDisplay})`];
        const dailyData = [dailyHeaders];
        let dailyTotalKHTN = 0, dailyTotalHopDong = 0, dailyTotalXHD = 0, dailyTotalDoanhThu = 0;

        // Hiển thị TẤT CẢ TVBH (100%), sắp xếp theo group và username
        const sortedTvbhUsers = [...tvbhUsers].sort((a, b) => {
            // Sort by group first, then by username
            const groupA = (a.group || '').toLowerCase();
            const groupB = (b.group || '').toLowerCase();
            if (groupA !== groupB) {
                return groupA.localeCompare(groupB);
            }
            return a.username.localeCompare(b.username);
        });

        sortedTvbhUsers.forEach(user => {
            const stats = dailyStats[user.username] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
            dailyData.push([
                user.group || '',
                user.username,
                stats.khtn,
                stats.hopDong,
                stats.xhd,
                stats.doanhThu.toLocaleString('vi-VN')
            ]);
            // Chỉ tính tổng từ các giá trị thực tế (không tính lại nhiều lần)
            dailyTotalKHTN += stats.khtn;
            dailyTotalHopDong += stats.hopDong;
            dailyTotalXHD += stats.xhd;
            dailyTotalDoanhThu += stats.doanhThu;
        });

        dailyData.push(['TỔNG CỘNG', '', dailyTotalKHTN, dailyTotalHopDong, dailyTotalXHD, dailyTotalDoanhThu.toLocaleString('vi-VN')]);

        // 5. Tạo bảng MTD Tổng (có chỉ tiêu và xếp hạng)
        const calcPercent = (actual, target) => (!target || target === 0) ? 0 : (actual / target);

        const mtdTotalHeaders = [
            'Hạng', 'Nhóm', 'TVBH',
            'KHTN (TĐ)', 'KHTN (CT)', 'KHTN (%)',
            'HĐ (TĐ)', 'HĐ (CT)', 'HĐ (%)',
            'XHĐ (TĐ)', 'XHĐ (CT)', 'XHĐ (%)',
            'Doanh Thu (TĐ)', 'Doanh Thu (CT)', 'Doanh Thu (%)'
        ];
        const mtdTotalData = [mtdTotalHeaders];

        const mtdStatsArray = [];
        let totalTargets = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
        let totalActuals = { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };

        // 4. Lấy chỉ tiêu từ database
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const targetsResult = await supabaseGetTvbhTargetsForMonth(monthStr);
        const targetMap = targetsResult.success ? (targetsResult.data || {}) : {};

        tvbhUsers.forEach(user => {
            const stats = mtdStats[user.username] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };
            // Lấy chỉ tiêu từ database, nếu không có thì = 0
            const targets = targetMap[user.username] || { khtn: 0, hopDong: 0, xhd: 0, doanhThu: 0 };

            mtdStatsArray.push({
                nhom: user.group || '',
                tvbh: user.username,
                khtn: { actual: stats.khtn, target: targets.khtn, percent: calcPercent(stats.khtn, targets.khtn) },
                hopDong: { actual: stats.hopDong, target: targets.hopDong, percent: calcPercent(stats.hopDong, targets.hopDong) },
                xhd: { actual: stats.xhd, target: targets.xhd, percent: calcPercent(stats.xhd, targets.xhd) },
                doanhThu: { actual: stats.doanhThu, target: targets.doanhThu, percent: calcPercent(stats.doanhThu, targets.doanhThu) }
            });

            totalActuals.khtn += stats.khtn;
            totalActuals.hopDong += stats.hopDong;
            totalActuals.xhd += stats.xhd;
            totalActuals.doanhThu += stats.doanhThu;
            totalTargets.khtn += targets.khtn;
            totalTargets.hopDong += targets.hopDong;
            totalTargets.xhd += targets.xhd;
            totalTargets.doanhThu += targets.doanhThu;
        });

        // Sắp xếp theo doanh thu giảm dần
        mtdStatsArray.sort((a, b) => b.doanhThu.actual - a.doanhThu.actual);

        mtdStatsArray.forEach((stats, index) => {
            const rank = index + 1;
            mtdTotalData.push([
                rank,
                stats.nhom,
                stats.tvbh,
                stats.khtn.actual,
                stats.khtn.target,
                (stats.khtn.percent * 100).toFixed(1) + '%',
                stats.hopDong.actual,
                stats.hopDong.target,
                (stats.hopDong.percent * 100).toFixed(1) + '%',
                stats.xhd.actual,
                stats.xhd.target,
                (stats.xhd.percent * 100).toFixed(1) + '%',
                stats.doanhThu.actual.toLocaleString('vi-VN'),
                stats.doanhThu.target.toLocaleString('vi-VN'),
                (stats.doanhThu.percent * 100).toFixed(1) + '%'
            ]);
        });

        mtdTotalData.push([
            '',
            'TỔNG CỘNG',
            '',
            totalActuals.khtn,
            totalTargets.khtn,
            (calcPercent(totalActuals.khtn, totalTargets.khtn) * 100).toFixed(1) + '%',
            totalActuals.hopDong,
            totalTargets.hopDong,
            (calcPercent(totalActuals.hopDong, totalTargets.hopDong) * 100).toFixed(1) + '%',
            totalActuals.xhd,
            totalTargets.xhd,
            (calcPercent(totalActuals.xhd, totalTargets.xhd) * 100).toFixed(1) + '%',
            totalActuals.doanhThu.toLocaleString('vi-VN'),
            totalTargets.doanhThu.toLocaleString('vi-VN'),
            (calcPercent(totalActuals.doanhThu, totalTargets.doanhThu) * 100).toFixed(1) + '%'
        ]);

        return {
            success: true,
            data: {
                daily: dailyData,
                mtdTotal: mtdTotalData,
                reportedTvbhSet: Array.from(reportedTvbhSet) // Convert Set to Array để có thể serialize
            }
        };
    } catch (e) {
        console.error('Get dashboard data error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy báo cáo MTD chi tiết
 */
/**
 * Lấy báo cáo MTD chi tiết theo TVBH và dòng xe
 * @param {Object} filters - { filterMonth: "yyyy-MM", group: "Nhóm 1", tvbh: "tvbh1", carModel: "VF8" }
 */
async function supabaseGetMtdDetailReport(filters = {}) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // 1. Xác định tháng (mặc định tháng hiện tại)
        let startDateStr, endDateStr;
        if (filters.filterMonth) {
            // filterMonth format: "yyyy-MM"
            const [year, month] = filters.filterMonth.split('-');
            startDateStr = `${year}-${month}-01`;
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
            endDateStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        } else {
            // Mặc định tháng hiện tại
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        }

        console.log('[MTD Detail] Querying from', startDateStr, 'to', endDateStr);

        // 2. Lấy danh sách TVBH users
        let tvbhQuery = supabase
            .from('users')
            .select('username, fullname, "group"')
            .eq('role', 'TVBH')
            .eq('active', true);

        // Filter theo group nếu có
        if (filters.group) {
            tvbhQuery = tvbhQuery.eq('group', filters.group);
        }

        // Filter theo TVBH nếu có
        if (filters.tvbh) {
            tvbhQuery = tvbhQuery.eq('username', filters.tvbh);
        }

        const { data: tvbhUsers, error: tvbhError } = await tvbhQuery
            .order('group', { ascending: true })
            .order('username', { ascending: true });

        if (tvbhError) {
            console.error('[MTD Detail] Error fetching TVBH users:', tvbhError);
            return { success: false, message: 'Lỗi lấy danh sách TVBH: ' + tvbhError.message };
        }

        if (!tvbhUsers || tvbhUsers.length === 0) {
            return {
                success: true,
                data: {
                    mtdDetail: [],
                    groups: [],
                    tvbhs: [],
                    carModels: []
                }
            };
        }

        // 3. Lấy dữ liệu daily_reports trong tháng
        let reportsQuery = supabase
            .from('daily_reports')
            .select('tvbh, "group", car_model, hop_dong, xhd, doanh_thu')
            .gte('date', startDateStr)
            .lte('date', endDateStr);

        // Filter theo TVBH nếu có
        if (filters.tvbh) {
            reportsQuery = reportsQuery.eq('tvbh', filters.tvbh);
        }

        // Filter theo group nếu có
        if (filters.group) {
            reportsQuery = reportsQuery.eq('group', filters.group);
        }

        // Filter theo car_model nếu có
        if (filters.carModel) {
            reportsQuery = reportsQuery.eq('car_model', filters.carModel);
        }

        const { data: reports, error: reportsError } = await reportsQuery;

        if (reportsError) {
            console.error('[MTD Detail] Error fetching reports:', reportsError);
            return { success: false, message: 'Lỗi lấy báo cáo: ' + reportsError.message };
        }

        console.log('[MTD Detail] Found', reports?.length || 0, 'reports');

        // 4. Tạo map TVBH -> Group
        const tvbhMap = {};
        const tvbhSet = new Set();
        tvbhUsers.forEach(user => {
            tvbhMap[user.username] = user.group || '';
            tvbhSet.add(user.username);
        });

        // 5. Aggregate dữ liệu theo TVBH và car_model
        // Structure: mtdDetailStats[tvbh][carModel] = { hopDong, xhd, doanhThu }
        const mtdDetailStats = {};
        const allCarModelsSet = new Set();

        // Khởi tạo stats cho tất cả TVBH
        tvbhUsers.forEach(user => {
            if (!mtdDetailStats[user.username]) {
                mtdDetailStats[user.username] = {};
            }
        });

        // Aggregate từ reports (chỉ lấy reports có car_model, bỏ qua KHTN)
        (reports || []).forEach(report => {
            // Chỉ xử lý reports có car_model (bỏ qua KHTN reports)
            if (!report.car_model || !tvbhSet.has(report.tvbh)) {
                return;
            }

            const tvbh = report.tvbh;
            const carModel = report.car_model;

            allCarModelsSet.add(carModel);

            if (!mtdDetailStats[tvbh]) {
                mtdDetailStats[tvbh] = {};
            }
            if (!mtdDetailStats[tvbh][carModel]) {
                mtdDetailStats[tvbh][carModel] = { hopDong: 0, xhd: 0, doanhThu: 0 };
            }

            mtdDetailStats[tvbh][carModel].hopDong += Number(report.hop_dong || 0);
            mtdDetailStats[tvbh][carModel].xhd += Number(report.xhd || 0);
            mtdDetailStats[tvbh][carModel].doanhThu += Number(report.doanh_thu || 0);
        });

        // 6. Lấy danh sách car models (từ reports hoặc fallback)
        let allCarModels = Array.from(allCarModelsSet).sort();
        
        // Nếu không có car_model nào trong reports, lấy từ car_models table hoặc orders
        if (allCarModels.length === 0) {
            const carModelsResult = await supabaseGetCarModels();
            if (carModelsResult.success && carModelsResult.data && carModelsResult.data.length > 0) {
                allCarModels = carModelsResult.data.map(c => c.name).filter(Boolean).sort();
            }
        }

        // Filter car models nếu có filter
        let filteredCarModels = allCarModels;
        if (filters.carModel) {
            filteredCarModels = allCarModels.filter(m => m === filters.carModel);
        }

        // 7. Tạo headers: ["Nhóm", "TVBH", "Ký HĐ (model1)", "XHĐ (model1)", "Doanh Thu (model1)", ...]
        const headers = ['Nhóm', 'TVBH'];
        filteredCarModels.forEach(model => {
            headers.push(`Ký HĐ (${model})`, `XHĐ (${model})`, `Doanh Thu (${model})`);
        });

        // 8. Tạo data rows
        const mtdDetailData = [headers];
        const totalStatsByCar = {};

        // Khởi tạo tổng cho mỗi car model
        filteredCarModels.forEach(model => {
            totalStatsByCar[model] = { hopDong: 0, xhd: 0, doanhThu: 0 };
        });

        // Tạo rows cho mỗi TVBH
        tvbhUsers.forEach(user => {
            const tvbh = user.username;
            const row = [tvbhMap[tvbh] || '', tvbh];

            filteredCarModels.forEach(model => {
                const stats = (mtdDetailStats[tvbh] && mtdDetailStats[tvbh][model])
                    ? mtdDetailStats[tvbh][model]
                    : { hopDong: 0, xhd: 0, doanhThu: 0 };

                row.push(stats.hopDong, stats.xhd, stats.doanhThu.toLocaleString('vi-VN'));

                // Cộng vào tổng
                totalStatsByCar[model].hopDong += stats.hopDong;
                totalStatsByCar[model].xhd += stats.xhd;
                totalStatsByCar[model].doanhThu += stats.doanhThu;
            });

            mtdDetailData.push(row);
        });

        // 9. Thêm dòng tổng cộng nếu có nhiều hơn 1 TVBH
        if (tvbhUsers.length > 1) {
            const totalRow = ['TỔNG CỘNG', ''];
            filteredCarModels.forEach(model => {
                const totalStats = totalStatsByCar[model];
                totalRow.push(
                    totalStats.hopDong,
                    totalStats.xhd,
                    totalStats.doanhThu.toLocaleString('vi-VN')
                );
            });
            mtdDetailData.push(totalRow);
        }

        // 10. Lấy danh sách groups và TVBHs để populate filters
        const groups = [...new Set(tvbhUsers.map(u => u.group).filter(Boolean))].sort();
        const tvbhs = tvbhUsers.map(u => ({ username: u.username, fullname: u.fullname, group: u.group }));

        return {
            success: true,
            data: {
                mtdDetail: mtdDetailData,
                groups: groups,
                tvbhs: tvbhs,
                carModels: allCarModels
            }
        };
    } catch (e) {
        console.error('[MTD Detail] Get MTD detail report error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy báo cáo ngày cho một ngày cụ thể
 */
async function supabaseGetDailyReportForDate(dateString) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // TODO: Implement logic từ daily_reports table
        return { 
            success: true, 
            data: {
                daily: []
            },
            message: 'Tính năng báo cáo ngày cụ thể đang được phát triển'
        };
    } catch (e) {
        console.error('Get daily report for date error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

// ======================================================
// TVBH TARGETS API - Quản lý chỉ tiêu TVBH
// ======================================================

/**
 * Lấy danh sách chỉ tiêu TVBH (có thể filter theo tháng)
 */
async function supabaseListTvbhTargets(month = null) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // Retry logic nếu bảng chưa có trong cache
        let retries = 3;
        let lastError = null;
        
        while (retries > 0) {
            try {
                let query = supabase
                    .from('tvbh_targets')
                    .select('*')
                    .order('month', { ascending: false })
                    .order('tvbh', { ascending: true });

                if (month) {
                    query = query.eq('month', month);
                }

                const { data, error } = await query;

                if (error) {
                    // Nếu lỗi là "table not found in schema cache", thử lại sau 500ms
                    if (error.message && error.message.includes('schema cache') && retries > 1) {
                        lastError = error;
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 500));
                        continue;
                    }
                    throw error;
                }

                return { success: true, data: data || [] };
            } catch (e) {
                lastError = e;
                if (e.message && e.message.includes('schema cache') && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                throw e;
            }
        }
        
        throw lastError || new Error('Failed after retries');
    } catch (e) {
        console.error('List TVBH targets error:', e);
        return { success: false, message: 'Lỗi: ' + (e.message || 'Không thể lấy danh sách chỉ tiêu') };
    }
}

/**
 * Lấy chỉ tiêu của một TVBH cho một tháng cụ thể
 */
async function supabaseGetTvbhTarget(tvbh, month) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!tvbh || !month) {
            return { success: false, message: 'Thiếu thông tin TVBH hoặc tháng' };
        }

        const { data, error } = await supabase
            .from('tvbh_targets')
            .select('*')
            .eq('tvbh', tvbh.toLowerCase())
            .eq('month', month)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Không tìm thấy
                return { success: true, data: null };
            }
            throw error;
        }

        return { success: true, data: data };
    } catch (e) {
        console.error('Get TVBH target error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Lấy chỉ tiêu của nhiều TVBH cho một tháng (dùng cho dashboard)
 */
async function supabaseGetTvbhTargetsForMonth(month) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        if (!month) {
            return { success: false, message: 'Thiếu thông tin tháng' };
        }

        // Retry logic nếu bảng chưa có trong cache
        let retries = 3;
        let lastError = null;
        
        while (retries > 0) {
            try {
                const { data, error } = await supabase
                    .from('tvbh_targets')
                    .select('*')
                    .eq('month', month);

                if (error) {
                    // Nếu lỗi là "table not found in schema cache", thử lại sau 500ms
                    if (error.message && error.message.includes('schema cache') && retries > 1) {
                        lastError = error;
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 500));
                        continue;
                    }
                    throw error;
                }

                // Tạo map: tvbh -> targets
                const targetMap = {};
                (data || []).forEach(target => {
                    targetMap[target.tvbh] = {
                        khtn: parseFloat(target.khtn) || 0,
                        hopDong: parseFloat(target.hop_dong) || 0,
                        xhd: parseFloat(target.xhd) || 0,
                        doanhThu: parseFloat(target.doanh_thu) || 0
                    };
                });

                return { success: true, data: targetMap };
            } catch (e) {
                lastError = e;
                if (e.message && e.message.includes('schema cache') && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                throw e;
            }
        }
        
        // Nếu vẫn lỗi sau retries, trả về empty map thay vì lỗi (để dashboard vẫn chạy được)
        console.warn('Schema cache issue after retries, returning empty targets map');
        return { success: true, data: {} };
    } catch (e) {
        console.error('Get TVBH targets for month error:', e);
        // Nếu lỗi là schema cache, trả về empty map thay vì lỗi
        if (e.message && e.message.includes('schema cache')) {
            console.warn('Schema cache issue, returning empty targets map');
            return { success: true, data: {} };
        }
        return { success: false, message: 'Lỗi: ' + (e.message || 'Không thể lấy chỉ tiêu') };
    }
}

/**
 * Tạo hoặc cập nhật chỉ tiêu TVBH
 */
async function supabaseUpsertTvbhTarget(targetData) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền quản lý chỉ tiêu
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền quản lý chỉ tiêu TVBH' };
        }

        if (!targetData.tvbh || !targetData.month) {
            return { success: false, message: 'Thiếu thông tin TVBH hoặc tháng' };
        }

        const username = session.username;

        const targetRecord = {
            tvbh: targetData.tvbh.toLowerCase().trim(),
            month: targetData.month.trim(),
            khtn: parseFloat(targetData.khtn) || 0,
            hop_dong: parseFloat(targetData.hop_dong) || 0,
            xhd: parseFloat(targetData.xhd) || 0,
            doanh_thu: parseFloat(targetData.doanh_thu) || 0,
            updated_by: username,
            updated_at: new Date().toISOString()
        };

        // Nếu là tạo mới, thêm created_by
        const { data: existing } = await supabase
            .from('tvbh_targets')
            .select('id')
            .eq('tvbh', targetRecord.tvbh)
            .eq('month', targetRecord.month)
            .single();

        if (!existing) {
            targetRecord.created_by = username;
        }

        const { data, error } = await supabase
            .from('tvbh_targets')
            .upsert(targetRecord, { onConflict: 'tvbh,month' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, data: data, message: 'Đã lưu chỉ tiêu thành công' };
    } catch (e) {
        console.error('Upsert TVBH target error:', e);
        return { success: false, message: 'Lỗi: ' + e.message };
    }
}

/**
 * Xóa chỉ tiêu TVBH
 */
async function supabaseDeleteTvbhTarget(id) {
    try {
        const supabase = initSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase chưa được khởi tạo' };
        }

        // ✅ SECURITY: Kiểm tra session
        const session = typeof getSession === 'function' ? getSession() : (() => {
            try {
                const sessionStr = localStorage.getItem('user_session');
                return sessionStr ? JSON.parse(sessionStr) : null;
            } catch (e) {
                return null;
            }
        })();
        
        if (!session || !session.username) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        // ✅ SECURITY: Chỉ ADMIN mới có quyền xóa chỉ tiêu
        if (session.role !== 'ADMIN') {
            return { success: false, message: 'Chỉ ADMIN mới có quyền xóa chỉ tiêu TVBH' };
        }

        if (!id) {
            return { success: false, message: 'ID không hợp lệ' };
        }

        const { error } = await supabase
            .from('tvbh_targets')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return { success: true, message: 'Đã xóa chỉ tiêu thành công' };
    } catch (e) {
        console.error('Delete TVBH target error:', e);
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
            
            case 'update_user_permissions':
                return await supabaseUpdateUserPermissions(data);
            
            case 'get_users_by_role':
                return await supabaseGetUsersByRole(data.role);
            
            case 'update_productivity_bonus':
                return await supabaseUpdateProductivityBonus(data);
            
            // Customers API
            case 'search_customer_by_cccd':
                return await supabaseSearchCustomerByCCCD(data.cccd);
            
            case 'upsert_customer':
                return await supabaseUpsertCustomer(data);
            
            // Orders API
            case 'create_order':
                return await supabaseCreateOrder(data);
            
            case 'get_my_orders':
                return await supabaseGetMyOrders(data.username, data.filters || {});
            
            case 'get_orders_for_saleadmin':
                return await supabaseGetOrdersForSaleAdmin(data.filters || {});
            
            case 'assign_contract_code':
                return await supabaseAssignContractCode(data.orderId, data.contract_code, data.assigned_sale);
            
            // Daily Reports API
            case 'submit_daily_report':
                return await supabaseSubmitDailyReport(data);
            
            case 'get_today_report':
                return await supabaseGetTodayReport(data.tvbhName);
            
            case 'get_car_models':
                return await supabaseGetCarModels();
            
            // Car Models Management API (ADMIN only)
            case 'list_car_models':
                return await supabaseListCarModels();
            
            case 'create_car_model':
                return await supabaseCreateCarModel(data);
            
            case 'update_car_model':
                return await supabaseUpdateCarModel(data.id, data);
            
            case 'delete_car_model':
                return await supabaseDeleteCarModel(data);
            
            // Sales Policies Management API (ADMIN only)
            case 'list_sales_policies':
                return await supabaseListSalesPolicies();
            
            case 'create_sales_policy':
                return await supabaseCreateSalesPolicy(data);
            
            case 'update_sales_policy':
                return await supabaseUpdateSalesPolicy(data.id, data);
            
            case 'delete_sales_policy':
                return await supabaseDeleteSalesPolicy(data);
            
            case 'get_active_sales_policies':
                return await supabaseGetActiveSalesPolicies();
            
            // Dashboard & Reports API
            case 'get_dashboard_data':
                return await supabaseGetDashboardData(data.filterDate, data.filterMonth);
            
            case 'get_mtd_detail_report':
                return await supabaseGetMtdDetailReport(data.filters || {});
            
            case 'get_daily_report_for_date':
                return await supabaseGetDailyReportForDate(data.dateString);
            
            // TVBH Targets API
            case 'list_tvbh_targets':
                return await supabaseListTvbhTargets(data.month || null);
            
            case 'get_tvbh_target':
                return await supabaseGetTvbhTarget(data.tvbh, data.month);
            
            case 'get_tvbh_targets_for_month':
                return await supabaseGetTvbhTargetsForMonth(data.month);
            
            case 'upsert_tvbh_target':
                return await supabaseUpsertTvbhTarget(data.targetData || data);
            
            case 'delete_tvbh_target':
                return await supabaseDeleteTvbhTarget(data.id);
            
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
    // Customers API
    searchCustomerByCCCD: supabaseSearchCustomerByCCCD,
    upsertCustomer: supabaseUpsertCustomer,
    // Orders API
    createOrder: supabaseCreateOrder,
    getMyOrders: supabaseGetMyOrders,
    getOrdersForSaleAdmin: supabaseGetOrdersForSaleAdmin,
    assignContractCode: supabaseAssignContractCode,
    // Daily Reports API
    submitDailyReport: supabaseSubmitDailyReport,
    getTodayReport: supabaseGetTodayReport,
    // Wrapper
    callAPI: callSupabaseAPI,
    init: initSupabase
};

// Export init function để có thể gọi từ bên ngoài
window.initSupabase = initSupabase;

// Tự động khởi tạo khi DOM ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    function autoInitSupabase() {
        // Đợi cả SUPABASE_CONFIG và supabase library đều load xong
        if (window.SUPABASE_CONFIG && window.supabase) {
            const client = initSupabase();
            if (client) {
                console.log('✅ Supabase client đã được tự động khởi tạo');
            }
        } else {
            // Retry sau 100ms nếu chưa sẵn sàng
            setTimeout(autoInitSupabase, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitSupabase);
    } else {
        autoInitSupabase();
    }
}

