/**
 * Theme Management Utilities
 * Hệ thống áp dụng theme vào toàn bộ trang web
 */

/**
 * Load và áp dụng theme đang active
 */
async function loadAndApplyActiveTheme() {
    try {
        const result = await window.callAPI({
            action: 'get_active_theme'
        });

        if (result.success && result.data) {
            applyTheme(result.data);
        }
    } catch (error) {
        console.error('[Theme] Load active theme error:', error);
    }
}

/**
 * Áp dụng theme vào trang
 */
function applyTheme(theme) {
    if (!theme) return;

    console.log('[Theme] Applying theme:', theme.name);

    // Get root element
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--theme-primary', theme.primary_color || '#3B82F6');
    root.style.setProperty('--theme-secondary', theme.secondary_color || '#6366F1');
    root.style.setProperty('--theme-accent', theme.accent_color || '#8B5CF6');
    root.style.setProperty('--theme-background', theme.background_color || '#FFFFFF');
    root.style.setProperty('--theme-text', theme.text_color || '#1F2937');

    // Apply background gradient or color
    const body = document.body;
    if (theme.background_gradient) {
        body.style.background = theme.background_gradient;
        body.style.backgroundAttachment = 'fixed';
    } else if (theme.background_color) {
        body.style.backgroundColor = theme.background_color;
    }

    // Apply background image if exists
    if (theme.background_image_url) {
        body.style.backgroundImage = `url(${theme.background_image_url})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundRepeat = 'no-repeat';
    }

    // Apply background pattern
    if (theme.background_pattern && theme.background_pattern !== 'none') {
        applyBackgroundPattern(theme.background_pattern);
    }

    // Apply logo if exists
    if (theme.logo_url) {
        const logoElement = document.querySelector('#header-logo, .logo, [data-theme-logo]');
        if (logoElement) {
            if (logoElement.tagName === 'IMG') {
                logoElement.src = theme.logo_url;
            } else {
                logoElement.style.backgroundImage = `url(${theme.logo_url})`;
                logoElement.style.backgroundSize = 'contain';
                logoElement.style.backgroundRepeat = 'no-repeat';
                logoElement.style.backgroundPosition = 'center';
            }
        }
    }

    // Store theme in localStorage for quick access
    localStorage.setItem('active_theme', JSON.stringify(theme));

    console.log('[Theme] Theme applied successfully');
}

/**
 * Apply background pattern
 */
function applyBackgroundPattern(pattern) {
    const body = document.body;
    let patternStyle = '';

    switch (pattern) {
        case 'dots':
            patternStyle = `
                background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
                background-size: 20px 20px;
            `;
            break;
        case 'lines':
            patternStyle = `
                background-image: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.05) 2px,
                    rgba(0,0,0,0.05) 4px
                );
            `;
            break;
        case 'grid':
            patternStyle = `
                background-image: 
                    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
                background-size: 20px 20px;
            `;
            break;
        case 'waves':
            patternStyle = `
                background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            `;
            break;
        default:
            return;
    }

    // Apply pattern as overlay
    if (patternStyle) {
        body.style.cssText += patternStyle;
    }
}

/**
 * Reset theme to default
 */
function resetTheme() {
    const root = document.documentElement;
    const body = document.body;

    root.style.removeProperty('--theme-primary');
    root.style.removeProperty('--theme-secondary');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-background');
    root.style.removeProperty('--theme-text');

    body.style.background = '';
    body.style.backgroundImage = '';
    body.style.backgroundColor = '';

    localStorage.removeItem('active_theme');
}

// Export to window
if (typeof window !== 'undefined') {
    window.loadAndApplyActiveTheme = loadAndApplyActiveTheme;
    window.applyTheme = applyTheme;
    window.resetTheme = resetTheme;
    
    console.log('✅ Theme utilities exposed to window');
}

// Auto-load theme on page load (only once, with error handling)
if (typeof document !== 'undefined') {
    let themeLoaded = false;
    const tryLoadTheme = () => {
        if (themeLoaded) return;
        themeLoaded = true;
        // Wrap in try-catch to prevent blocking if themes table doesn't exist yet
        loadAndApplyActiveTheme().catch(error => {
            console.warn('[Theme] Could not load active theme (table may not exist yet):', error.message);
            themeLoaded = false; // Allow retry
        });
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(tryLoadTheme, 500);
        });
    } else {
        setTimeout(tryLoadTheme, 500);
    }
}

