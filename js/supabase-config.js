/**
 * Supabase Configuration
 * Lấy từ environment variables hoặc hardcode (chỉ dùng cho development)
 */

// Lấy từ .env hoặc hardcode cho development
// Trong production, nên dùng environment variables
const SUPABASE_URL = 'https://knrnlfsokkrtpvtkuuzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtucm5sZnNva2tydHB2dGt1dXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjkxMDEsImV4cCI6MjA4MDQwNTEwMX0.Md8Kwp8PCuHwoEIASH3zuOipy2Dmll9ml-mBUcy3RXg';

// Export để sử dụng trong các module khác
window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};


