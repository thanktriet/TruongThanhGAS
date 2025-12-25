/**
 * Theme Management Utilities
 * Hệ thống áp dụng theme vào toàn bộ trang web
 */

/**
 * Helper function to adjust color opacity
 */
function adjustOpacity(color, opacity) {
    // Convert hex to rgba
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
}

/**
 * Helper function to adjust color brightness
 */
function adjustBrightness(color, percent) {
    // Convert hex to rgb, adjust brightness, convert back
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);
        
        r = Math.max(0, Math.min(255, r + (r * percent / 100)));
        g = Math.max(0, Math.min(255, g + (g * percent / 100)));
        b = Math.max(0, Math.min(255, b + (b * percent / 100)));
        
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    return color;
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

    // Apply CSS variables for theme colors
    const primaryColor = theme.primary_color || '#3B82F6';
    const secondaryColor = theme.secondary_color || '#6366F1';
    const accentColor = theme.accent_color || '#8B5CF6';
    
    root.style.setProperty('--theme-primary', primaryColor);
    root.style.setProperty('--theme-secondary', secondaryColor);
    root.style.setProperty('--theme-accent', accentColor);
    root.style.setProperty('--theme-background', theme.background_color || '#FFFFFF');
    root.style.setProperty('--theme-text', theme.text_color || '#1F2937');
    
    // Apply theme colors to sidebar (if exists) - use primary color
    const sidebar = document.querySelector('aside, #sidebar-container aside');
    if (sidebar) {
        sidebar.style.backgroundColor = primaryColor;
        console.log('[Theme] Applied primary color to sidebar:', primaryColor);
        
        // Also update hover colors for nav items in sidebar
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            // Set hover color to darker shade of primary
            if (!item.style.cssText.includes('hover:')) {
                item.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('active')) {
                        this.style.backgroundColor = adjustBrightness(primaryColor, -10);
                    }
                });
                item.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('active')) {
                        this.style.backgroundColor = '';
                    }
                });
            }
        });
    }
    
    // Apply theme colors to active nav items
    const activeNavItems = document.querySelectorAll('.nav-item.active');
    activeNavItems.forEach(item => {
        item.style.backgroundColor = primaryColor;
        item.style.borderLeftColor = secondaryColor;
    });
    
    // Create dynamic style element to apply theme to common elements
    let themeStyleElement = document.getElementById('dynamic-theme-styles');
    if (!themeStyleElement) {
        themeStyleElement = document.createElement('style');
        themeStyleElement.id = 'dynamic-theme-styles';
        document.head.appendChild(themeStyleElement);
    }
    
    // Helper function to darken color for hover states
    const darkenColor = (color, percent) => {
        // Simple darken function - you might want to use a library for better results
        return color; // Will use CSS filter or inline styles instead
    };
    
    // Generate comprehensive CSS rules for theme colors
    themeStyleElement.textContent = `
        /* Theme Colors - Applied dynamically */
        :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --theme-accent: ${accentColor};
        }
        
        /* Sidebar theming */
        aside.bg-slate-900,
        #sidebar-container aside {
            background-color: ${primaryColor} !important;
        }
        
        /* Active nav items */
        .nav-item.active {
            background-color: ${primaryColor} !important;
            border-left-color: ${secondaryColor} !important;
        }
        
        /* Primary buttons - all variants */
        button.bg-blue-600,
        button.bg-purple-600,
        button.bg-indigo-600,
        .bg-blue-600:not(button),
        .bg-purple-600:not(button),
        .bg-indigo-600:not(button) {
            background-color: ${primaryColor} !important;
        }
        
        /* Primary buttons hover */
        button.bg-blue-600:hover,
        button.bg-purple-600:hover,
        button.bg-indigo-600:hover,
        .bg-blue-600:hover:not(button),
        .bg-purple-600:hover:not(button),
        .bg-indigo-600:hover:not(button) {
            background-color: ${secondaryColor} !important;
        }
        
        /* Border colors */
        .border-blue-600,
        .border-purple-600,
        .border-indigo-600 {
            border-color: ${primaryColor} !important;
        }
        
        /* Text colors */
        .text-blue-600,
        .text-purple-600,
        .text-indigo-600 {
            color: ${primaryColor} !important;
        }
        
        /* Gradient backgrounds */
        .bg-gradient-to-r.from-blue-600,
        .bg-gradient-to-r.from-purple-600,
        .bg-gradient-to-r.from-indigo-600 {
            background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}) !important;
        }
        
        /* Role badges */
        .bg-blue-600.text-white,
        span.bg-blue-600 {
            background-color: ${accentColor} !important;
        }
        
        /* Card headers with colored backgrounds */
        .bg-blue-50,
        .bg-purple-50,
        .bg-indigo-50,
        .bg-green-50 {
            background-color: ${adjustOpacity(primaryColor, 0.1)} !important;
        }
    `;
    
    console.log('[Theme] Applied CSS variables and dynamic styles');
    console.log('[Theme] Primary:', primaryColor, 'Secondary:', secondaryColor, 'Accent:', accentColor);

    // Apply background to body, dashboard-view, and main container
    const body = document.body;
    const dashboardView = document.getElementById('dashboard-view');
    const mainElement = dashboardView ? dashboardView.querySelector('main') : null;
    
    // Reset background styles first
    const resetBackground = (element) => {
        if (!element) return;
        element.style.background = '';
        element.style.backgroundColor = '';
        element.style.backgroundImage = '';
        element.style.backgroundSize = '';
        element.style.backgroundPosition = '';
        element.style.backgroundAttachment = '';
        element.style.backgroundRepeat = '';
        // Remove bg-gray-100 class if exists
        if (element.classList) {
            element.classList.remove('bg-gray-100');
        }
    };
    
    resetBackground(body);
    if (dashboardView) {
        resetBackground(dashboardView);
    }
    if (mainElement) {
        resetBackground(mainElement);
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
    
    // Apply the final background to body, dashboard-view, and main element
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
        
        // Apply to main element if exists (this is what users actually see)
        if (mainElement) {
            mainElement.style.background = backgroundValue;
            mainElement.style.backgroundAttachment = 'fixed';
            console.log('[Theme] Applied background to main element');
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
            if (mainElement) {
                mainElement.style.backgroundSize = bgSize;
            }
        }
        
        console.log('[Theme] Final background value:', backgroundValue);
        console.log('[Theme] Body computed style:', window.getComputedStyle(body).background);
        if (dashboardView) {
            console.log('[Theme] Dashboard-view computed style:', window.getComputedStyle(dashboardView).background);
        }
        if (mainElement) {
            console.log('[Theme] Main element computed style:', window.getComputedStyle(mainElement).background);
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

