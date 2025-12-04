/**
 * Number to Words (Vietnamese) - Helper Functions
 */

function numberToWords(num) {
    if (num === null || num === undefined || num === '' || isNaN(num)) {
        return "";
    }
    if (parseInt(num) === 0) {
        return "Không đồng";
    }

    var ChuSo = [" không", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín"];
    var Tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
    var s = num.toString().replace(/[^0-9]/g, '');
    if (s === '') return "";
    
    var i, j, str, len, ketQua = "", lan = 0;
    len = s.length;

    for (i = len; i > 0; i -= 3) {
        let tmp = "";
        str = s.substring(i - 3 > 0 ? i - 3 : 0, i);
        let tram = str.length > 2 ? parseInt(str[0]) : 0;
        let chuc = str.length > 1 ? parseInt(str[str.length - 2]) : 0;
        let donvi = parseInt(str[str.length - 1]);
        
        if (tram || chuc || donvi) {
            if (tram) tmp += ChuSo[tram] + " trăm";
            if ((!tram && chuc && donvi) || (tram && chuc && !donvi) || (tram && chuc && donvi)) {
               if(chuc === 0) tmp += " lẻ";
            }
            if (chuc > 1) {
                tmp += ChuSo[chuc] + " mươi";
            }
            if (chuc == 1) {
                tmp += " mười";
            }
            if (donvi) {
                if (chuc > 1 && donvi == 1) tmp += " mốt";
                else if( (chuc === 1 || chuc === 0) && donvi === 1) tmp += ChuSo[donvi];
                else if (chuc != 0 && donvi == 5) tmp += " lăm";
                else if (donvi > 1) tmp += ChuSo[donvi];
            }
            ketQua = tmp + Tien[lan] + ketQua;
        }
        lan++;
    }
    
    ketQua = ketQua.trim().charAt(0).toUpperCase() + ketQua.trim().slice(1);
    return ketQua ? ketQua + " đồng chẵn." : "Không đồng";
}

// Export globally
if (typeof window !== 'undefined') {
    window.numberToWords = numberToWords;
}

