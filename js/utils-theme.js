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
    if (!theme) {
        console.warn('[Theme] No theme provided to applyTheme');
        return;
    }

    console.log('[Theme] Applying theme:', theme.name);
    console.log('[Theme] Theme data:', {
        primary_color: theme.primary_color,
        background_gradient: theme.background_gradient,
        background_color: theme.background_color,
        background_image_url: theme.background_image_url
    });

    // Get root element
    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--theme-primary', theme.primary_color || '#3B82F6');
    root.style.setProperty('--theme-secondary', theme.secondary_color || '#6366F1');
    root.style.setProperty('--theme-accent', theme.accent_color || '#8B5CF6');
    root.style.setProperty('--theme-background', theme.background_color || '#FFFFFF');
    root.style.setProperty('--theme-text', theme.text_color || '#1F2937');

    // Apply background to both body and dashboard-view container
    const body = document.body;
    const dashboardView = document.getElementById('dashboard-view');
    
    // Reset background styles first
    const resetBackground = (element) => {
        element.style.background = '';
        element.style.backgroundColor = '';
        element.style.backgroundImage = '';
        element.style.backgroundSize = '';
        element.style.backgroundPosition = '';
        element.style.backgroundAttachment = '';
        element.style.backgroundRepeat = '';
    };
    
    resetBackground(body);
    if (dashboardView) {
        resetBackground(dashboardView);
    }
    
    // Build background string with base color/gradient
    let backgroundValue = '';
    
    // Apply background image first (lowest layer)
    if (theme.background_image_url) {
        console.log('[Theme] Applying background image:', theme.background_image_url);
        backgroundValue = `url(${theme.background_image_url})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundRepeat = 'no-repeat';
    }
    
    // Apply gradient or color (middle layer)
    if (theme.background_gradient) {
        console.log('[Theme] Applying gradient:', theme.background_gradient);
        if (backgroundValue) {
            // Combine image and gradient
            backgroundValue = `${theme.background_gradient}, ${backgroundValue}`;
        } else {
            backgroundValue = theme.background_gradient;
        }
    } else if (theme.background_color) {
        console.log('[Theme] Applying background color:', theme.background_color);
        if (backgroundValue) {
            // Combine image and color
            backgroundValue = `${theme.background_color}, ${backgroundValue}`;
        } else {
            backgroundValue = theme.background_color;
        }
    }
    
    // Apply background pattern as overlay (top layer)
    if (theme.background_pattern && theme.background_pattern !== 'none') {
        console.log('[Theme] Applying background pattern:', theme.background_pattern);
        const patternBg = getBackgroundPattern(theme.background_pattern);
        if (patternBg) {
            if (backgroundValue) {
                backgroundValue = `${patternBg}, ${backgroundValue}`;
            } else {
                backgroundValue = patternBg;
            }
        }
    }
    
    // Apply the final background to both body and dashboard-view
    if (backgroundValue) {
        // Apply to body
        body.style.background = backgroundValue;
        body.style.backgroundAttachment = 'fixed';
        
        // Apply to dashboard-view if exists (main container)
        if (dashboardView) {
            dashboardView.style.background = backgroundValue;
            dashboardView.style.backgroundAttachment = 'fixed';
            console.log('[Theme] Applied background to dashboard-view');
        }
        
        // Set background size for patterns
        let bgSize = '';
        if (theme.background_pattern && (theme.background_pattern === 'grid' || theme.background_pattern === 'dots')) {
            bgSize = theme.background_image_url ? '20px 20px, cover' : '20px 20px';
        } else if (theme.background_image_url) {
            bgSize = 'cover';
        }
        
        if (bgSize) {
            body.style.backgroundSize = bgSize;
            if (dashboardView) {
                dashboardView.style.backgroundSize = bgSize;
            }
        }
        
        console.log('[Theme] Final background value:', backgroundValue);
        console.log('[Theme] Body computed style:', window.getComputedStyle(body).background);
        if (dashboardView) {
            console.log('[Theme] Dashboard-view computed style:', window.getComputedStyle(dashboardView).background);
        }
    }

    // Apply logo if exists
    if (theme.logo_url) {
        const logoElement = document.querySelector('#header-logo, .logo, [data-theme-logo]');
        if (logoElement) {
            console.log('[Theme] Applying logo:', theme.logo_url);
            if (logoElement.tagName === 'IMG') {
                logoElement.src = theme.logo_url;
            } else {
                logoElement.style.backgroundImage = `url(${theme.logo_url})`;
                logoElement.style.backgroundSize = 'contain';
                logoElement.style.backgroundRepeat = 'no-repeat';
                logoElement.style.backgroundPosition = 'center';
            }
        } else {
            console.warn('[Theme] Logo element not found');
        }
    }

    // Store theme in localStorage for quick access
    localStorage.setItem('active_theme', JSON.stringify(theme));

    console.log('[Theme] ✅ Theme applied successfully');
    console.log('[Theme] Body background style:', body.style.background || body.style.backgroundColor || 'none');
}

/**
 * Get background pattern CSS value (returns string for use in background property)
 */
function getBackgroundPattern(pattern) {
    switch (pattern) {
        case 'dots':
            return 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)';
        case 'lines':
            return 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)';
        case 'grid':
            return 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)';
        case 'waves':
            return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
        default:
            return null;
    }
}

/**
 * Apply background pattern (legacy function, kept for compatibility)
 */
function applyBackgroundPattern(pattern) {
    const patternBg = getBackgroundPattern(pattern);
    if (patternBg) {
        const body = document.body;
        // Add pattern as overlay using multiple backgrounds
        const currentBg = body.style.background || '';
        if (currentBg) {
            body.style.background = `${patternBg}, ${currentBg}`;
        } else {
            body.style.background = patternBg;
            if (pattern === 'grid' || pattern === 'dots') {
                body.style.backgroundSize = '20px 20px';
            }
        }
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

