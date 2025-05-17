/* 
 * ===================================================
 * ================ ZARIGATA GAMES PORTAL =============
 * ========= 8-BIT NOSTALGIA CONFIGURATION FILE ======
 * ===================================================
 * ===== CODEX v1.0 - MASTER BUILD - May 17, 2025 ====
 * ===================================================
 *
 * .:[ RETRO GAMING MANIFEST CONFIGURATION ]:.  
 * :: This module controls the ZARIGATA retro experience ::
 * :: Secret settings to unlock additional features ::
 *
 * .:[ 01010111 01100101 01101100 01100011 01101111 01101101 01100101 ]:.  
 * .:[ DEVELOPER ACCESS: ZARI - LEVEL 99 ]:.  
 */

const GamePortalConfig = {
    // Portal display settings
    portal: {
        title: "ZARIGATA PORTAL",
        tagline: "Authentic Retro Games That Actually Deliver",
        theme: {
            // GameBoy color palette
            primary: "#0f380f",      // GameBoy dark green
            secondary: "#306230",    // GameBoy medium green
            highlight: "#8bac0f",    // GameBoy light green
            background: "#9bbc0f",   // GameBoy pale green (screen color)
            textDark: "#0f380f",     // GameBoy dark text
            textLight: "#306230",    // GameBoy medium text
            frame: "#8b8b8b",        // GameBoy gray frame
            buttons: "#2f2f2f",      // GameBoy button color
        },
        footer: "© 2025 ZARIGATA - Created by Zari - Press START to continue",
        defaultView: "grid",        // 'grid' or 'list'
    },
    
    // Game loading settings
    gameLoader: {
        fadeTransition: true,       // Use fade effect when switching games
        transitionSpeed: 300,       // Transition speed in ms
        preloadAssets: true,        // Preload game assets for smoother experience
        showLoadingScreen: true,    // Show loading screen while game loads
        startupSound: true,         // Play GameBoy startup sound when loading games
    },
    
    // ZARIGATA system settings
    retro: {
        pixelEffect: true,          // Show pixel-like grid on screen
        scanlines: true,            // Show scanlines effect
        frameVisible: true,         // Show the ZARIGATA frame around the content
        buttonSounds: true,         // Play button click sounds
        screenGlare: true,          // Add screen glare/reflection effect
        powerLED: true,             // Show power LED indicator
        ghosting: true,             // Screen ghosting/motion blur effect
        startupAnimation: true,     // Show ZARIGATA startup animation
        fullscreenGames: true,      // Launch games in fullscreen mode
    },

    // Advanced settings
    advanced: {
        enableAnalytics: false,     // Enable anonymous usage analytics
        debugMode: false,           // Show debug information in console
        enableServiceWorker: true,  // Enable offline support via service worker
        cacheStrategy: "assets",    // What to cache: "none", "assets", "all"
        batterySimulation: true,    // Simulate battery percentage
    },

    /**
     * Apply configuration settings to the DOM
     * This method is called when the page loads
     */
    applyConfig: function() {
        // Apply ZARIGATA theme colors
        document.documentElement.style.setProperty('--primary-color', this.portal.theme.primary);
        document.documentElement.style.setProperty('--secondary-color', this.portal.theme.secondary);
        document.documentElement.style.setProperty('--highlight-color', this.portal.theme.highlight);
        document.documentElement.style.setProperty('--background-color', this.portal.theme.background);
        document.documentElement.style.setProperty('--text-dark', this.portal.theme.textDark);
        document.documentElement.style.setProperty('--text-light', this.portal.theme.textLight);
        document.documentElement.style.setProperty('--frame-color', this.portal.theme.frame);
        document.documentElement.style.setProperty('--button-color', this.portal.theme.buttons);
        
        // Apply text content
        document.querySelector('.title').textContent = this.portal.title;
        document.querySelector('.tagline').textContent = this.portal.tagline;
        document.querySelector('footer p').textContent = this.portal.footer;
        
        // Apply ZARIGATA visual effects
        document.body.classList.toggle('pixelated', this.retro.pixelEffect);
        document.body.classList.toggle('scanlines', this.retro.scanlines);
        document.body.classList.toggle('gameboy-frame', this.retro.frameVisible);
        document.body.classList.toggle('screen-glare', this.retro.screenGlare);
        document.body.classList.toggle('screen-ghosting', this.retro.ghosting);
        
        // Update settings toggle states
        if (document.getElementById('pixel-effect-toggle')) {
            document.getElementById('pixel-effect-toggle').checked = this.retro.pixelEffect;
            document.getElementById('scanlines-toggle').checked = this.retro.scanlines;
            document.getElementById('frame-toggle').checked = this.retro.frameVisible;
            document.getElementById('button-sounds-toggle').checked = this.retro.buttonSounds;
            document.getElementById('screen-glare-toggle').checked = this.retro.screenGlare;
            document.getElementById('ghosting-toggle').checked = this.retro.ghosting;
            document.getElementById('startup-sound-toggle').checked = this.gameLoader.startupSound;
            document.getElementById('startup-anim-toggle').checked = this.retro.startupAnimation;
            document.getElementById('fullscreen-toggle').checked = this.retro.fullscreenGames;
        }
        
        // Apply other settings
        if (this.advanced.debugMode) {
            console.log('[GB-CONFIG] Debug mode enabled');
            console.log('[GB-CONFIG]', this);
        }
        
        // Play startup sound if enabled and this is the first load
        if (this.retro.startupAnimation && !window.startupPlayed && document.getElementById('gameboy-startup')) {
            window.startupPlayed = true;
            document.getElementById('gameboy-startup').classList.add('show');
            
            // Play startup sound if enabled
            if (this.gameLoader.startupSound && document.getElementById('startup-sound')) {
                // Try to play sound with user interaction catch
                try {
                    document.getElementById('startup-sound').play();
                } catch (e) {
                    console.log('Sound autoplay restricted by browser');
                }
            }
            
            // Hide startup screen after animation
            setTimeout(() => {
                document.getElementById('gameboy-startup').classList.remove('show');
            }, 2500);
        }
    }
};

// Export for use in other scripts
window.GamePortalConfig = GamePortalConfig;

// Auto-apply configuration when script loads
document.addEventListener('DOMContentLoaded', () => {
    GamePortalConfig.applyConfig();
});
