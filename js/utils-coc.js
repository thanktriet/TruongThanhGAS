/**
 * Utility Functions for COC (Certificate of Conformity) Calculations
 * Các hàm tiện ích để tính toán business days và lãi suất cho COC requests
 */

/**
 * Tính số ngày làm việc (business days) giữa 2 ngày (trừ thứ 7, chủ nhật)
 * @param {Date|string} startDate - Ngày bắt đầu
 * @param {Date|string} endDate - Ngày kết thúc
 * @returns {number} Số ngày làm việc
 */
function calculateBusinessDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    
    // Reset time to start of day
    current.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    while (current <= end) {
        const dayOfWeek = current.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

/**
 * Tính số ngày làm việc trễ (sau +5 ngày từ ngày đề nghị)
 * @param {Date|string} requestDate - Ngày đề nghị
 * @param {Date|string} actualIssueDate - Ngày cấp thực tế
 * @returns {number} Số ngày làm việc trễ (sau +5 ngày)
 */
function calculateDelayedBusinessDays(requestDate, actualIssueDate) {
    const request = new Date(requestDate);
    const issue = new Date(actualIssueDate);
    
    // Reset time to start of day
    request.setHours(0, 0, 0, 0);
    issue.setHours(0, 0, 0, 0);
    
    // Thêm 5 ngày làm việc vào ngày đề nghị
    let targetDate = new Date(request);
    let businessDaysAdded = 0;
    while (businessDaysAdded < 5) {
        targetDate.setDate(targetDate.getDate() + 1);
        const dayOfWeek = targetDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysAdded++;
        }
    }
    
    // Nếu ngày cấp thực tế <= target date, không trễ
    if (issue <= targetDate) {
        return 0;
    }
    
    // Tính số ngày làm việc trễ
    // Bắt đầu tính từ ngày sau target date
    targetDate.setDate(targetDate.getDate() + 1);
    return calculateBusinessDays(targetDate, issue);
}

/**
 * Tính lãi suất dựa trên số ngày trễ
 * @param {number} principalAmount - Số tiền gốc (principal_amount từ coc_request)
 * @param {number} delayedBusinessDays - Số ngày làm việc trễ
 * @param {number} interestRate - Lãi suất %/năm (mặc định 8%)
 * @returns {number} Số tiền lãi (đã làm tròn)
 */
function calculateInterest(principalAmount, delayedBusinessDays, interestRate = 8.0) {
    if (!principalAmount || principalAmount <= 0 || delayedBusinessDays <= 0) {
        return 0;
    }
    
    // Convert to number if string (remove thousands separators)
    const principal = typeof principalAmount === 'string' 
        ? parseFloat(principalAmount.replace(/\./g, '').replace(/,/g, '')) 
        : parseFloat(principalAmount);
    
    if (isNaN(principal) || principal <= 0) {
        return 0;
    }
    
    // Tính lãi theo business days (ngày làm việc)
    // 1 năm có khoảng 260 business days (52 tuần × 5 ngày làm việc)
    // Lãi suất hàng ngày làm việc = (interestRate / 100) / 260
    const BUSINESS_DAYS_PER_YEAR = 260;
    const dailyRate = (interestRate / 100) / BUSINESS_DAYS_PER_YEAR;
    const interest = principal * dailyRate * delayedBusinessDays;
    
    // Làm tròn đến hàng đơn vị
    return Math.round(interest);
}

// Export to window
if (typeof window !== 'undefined') {
    window.calculateBusinessDays = calculateBusinessDays;
    window.calculateDelayedBusinessDays = calculateDelayedBusinessDays;
    window.calculateInterest = calculateInterest;
}

