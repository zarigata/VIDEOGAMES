/**
 * ██████╗  █████╗ ██████╗ ██╗ ██████╗  █████╗ ████████╗ █████╗     ███████╗███████╗███████╗███████╗ ██████╗████████╗███████╗
 * ███████╗█████╗█ ██████╗ ██║ ██████╗  █████╗  ████████╗█████╗     █████████████████████████████████ ████████████████████████
 * ╚══███╔╝██╔══██╗██╔══██╗██║██╔════╝ ██╔══██╗╚══██╔══╝██╔══██╗    ███████╗██╔════╝██╔════╝███████╗██║████████╗██╔════╝
 *   ███╔╝ ███████║██████╔╝██║██║  ███╗███████║   ██║   ███████║    █████████████╗  █████╗  █████████████╔═══██║███████╗
 *  ███╔╝  ██╔══██║██╔══██╗██║██║   ██║██╔══██║   ██║   ██╔══██║    ╚════██║██╔══╝  ██╔══╝  ██╔══██║██║   ██║╚════██║
 * ███████╗██║  ██║██║  ██║██║╚██████╔╝██║  ██║   ██║   ██║  ██║    ███████║███████╗███████╗██║  ██║███████╔╝███████║
 * ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚══════╝
 * 
 * =================================================================================================================
 * === ZARIGATA PREMIUM EFFECTS ENGINE v1.0.2 === AUTHORIZED ACCESS ONLY === ZARI DEVELOPMENT UNIT X99 ===
 * =================================================================================================================
 * 
 * ::CODEX INFORMATION::
 * This module handles all premium visual and interactive effects for the ZARIGATA game portal.
 * Features include:
 * - Wave animations in background
 * - Enhanced fullscreen mode with animations
 * - Premium screen effects (scanlines, pixelation, glare)
 * - Battery life simulation
 * - Enhanced responsive design
 * - Sound effects for interactions
 * 
 * ::SECURITY LEVEL:: AMBER
 * ::REVISION DATE:: 2025-05-17
 * ::AUTHORIZATION:: ZARI DEVELOPMENT UNIT X99
 */

// IIFE to avoid polluting global scope
(function() {
    'use strict';
    
    // ===================== CORE VARIABLES & CONFIG =====================
    const ZarigataEffects = {
        settings: {
            enablePixelation: true,
            enableScanlines: true,
            enableScreenGlare: true,
            enableScreenGhosting: true,
            enableWaveEffects: true,
            enableButtonSounds: true,
            enableStartupSound: true,
            darkMode: false,
            batteryLevel: 100, // 0-100
            batteryDrainRate: 0.01, // % per second
            soundVolume: 0.7 // 0-1
        },
        
        elements: {
            body: document.body,
            container: null,
            gameScreen: null,
            settingsModal: null,
            startupAnimation: null,
            waveContainer: null,
            batteryIndicator: null
        },
        
        sounds: {
            buttonPress: null,
            buttonHover: null,
            startup: null,
            gameStart: null,
            toggleSwitch: null
        },
        
        timers: {
            batteryDrain: null,
            startupSequence: null
        },
        
        // State
        isFullscreen: false,
        isInitialized: false
    };

    // ===================== INITIALIZATION =====================
    /**
     * ::CODEX:: SYSTEM INITIALIZATION SEQUENCE
     * - Creates necessary DOM elements
     * - Loads sound resources
     * - Applies initial effects
     * - Sets up event listeners
     * - Starts the startup animation
     */
    function initialize() {
        if (ZarigataEffects.isInitialized) return;
        
        // Immediate fix - if startup is hung, clear it
        const startupElement = document.getElementById('zarigata-startup');
        if (startupElement) {
            // Force any hung startup to complete
            const forceComplete = function() {
                startupElement.style.display = 'none';
                startupElement.classList.remove('active');
                startupElement.classList.remove('fade-out');
                console.log('::ZARIGATA EFFECTS ENGINE:: Forced startup completion');
                
                // Initialize game grid
                setTimeout(() => {
                    if (typeof initializeGames === 'function') {
                        initializeGames();
                    }
                }, 100);
            };
            
            // Check if startup appears to be hung (been active for a while)
            if (startupElement.classList.contains('active')) {
                forceComplete();
                
                // Skip the rest of startup since we're forcing completion
                ZarigataEffects.isInitialized = true;
                console.log('::ZARIGATA EFFECTS ENGINE:: Fixed hung startup');
                return;
            }
        }
        
        // Load from localStorage if available
        loadSettings();
        
        // Cache DOM elements
        cacheElements();
        
        // Create wave background
        createWaveEffects();
        
        // Create battery indicator
        createBatteryIndicator();
        
        // Initialize sounds
        initSounds();
        
        // Apply initial effects
        applyEffects();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start battery simulation
        startBatterySimulation();
        
        // Play startup animation with shorter timeout
        playStartupAnimation();
        
        // Mark as initialized
        ZarigataEffects.isInitialized = true;
        
        // Force completion after a timeout as a failsafe
        setTimeout(() => {
            if (startupElement && startupElement.style.display !== 'none') {
                forceComplete();
            }
        }, 3000);
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Initialized successfully with failsafes');
    }

    // ===================== ELEMENT CREATION & CACHING =====================
    /**
     * ::CODEX:: ELEMENT CACHING PROTOCOL
     * Cache all necessary DOM elements for faster access
     */
    function cacheElements() {
        const elements = ZarigataEffects.elements;
        
        // Core elements
        elements.container = document.querySelector('.container');
        elements.gameScreen = document.querySelector('.game-screen');
        elements.settingsModal = document.querySelector('.modal-overlay');
        elements.startupAnimation = document.querySelector('.startup-animation');
        
        // Add ZARIGATA frame class to body
        if (!elements.body.classList.contains('zarigata-frame')) {
            elements.body.classList.add('zarigata-frame');
        }
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Elements cached');
    }

    /**
     * ::CODEX:: WAVE GENERATION ALGORITHM
     * Creates animated wave background elements for premium visual effect
     */
    function createWaveEffects() {
        if (!ZarigataEffects.settings.enableWaveEffects) return;
        
        // Create wave container if it doesn't exist
        if (!document.querySelector('.wave-container')) {
            const waveContainer = document.createElement('div');
            waveContainer.className = 'wave-container';
            
            // Create three wave elements with different timing
            for (let i = 1; i <= 3; i++) {
                const wave = document.createElement('div');
                wave.className = `wave wave${i}`;
                waveContainer.appendChild(wave);
            }
            
            // Add to body as first child for background positioning
            document.body.insertBefore(waveContainer, document.body.firstChild);
            ZarigataEffects.elements.waveContainer = waveContainer;
        }
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Wave effects created');
    }

    /**
     * ::CODEX:: BATTERY SIMULATION PROTOCOL
     * Creates a battery indicator and simulation for immersive experience
     */
    function createBatteryIndicator() {
        // Skip if already exists
        if (document.querySelector('.battery-indicator')) return;
        
        // Find the screen frame
        const screenFrame = document.querySelector('.screen-frame');
        if (!screenFrame) return;
        
        // Create battery indicator elements
        const batteryIndicator = document.createElement('div');
        batteryIndicator.className = 'battery-indicator';
        batteryIndicator.innerHTML = `
            BAT <div class="battery-level"></div>
        `;
        
        screenFrame.appendChild(batteryIndicator);
        ZarigataEffects.elements.batteryIndicator = batteryIndicator;
        
        // Update battery display initially
        updateBatteryDisplay();
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Battery indicator created');
    }

    // ===================== SOUND MANAGEMENT =====================
    /**
     * ::CODEX:: AUDIO SUBSYSTEM INITIALIZATION
     * Loads and configures all sound effects for the portal
     */
    function initSounds() {
        // Skip if sounds already initialized
        if (ZarigataEffects.sounds.buttonPress) return;
        
        const sounds = ZarigataEffects.sounds;
        
        // Create Audio objects
        sounds.buttonPress = new Audio('sounds/button-press.mp3');
        sounds.buttonHover = new Audio('sounds/button-hover.mp3');
        sounds.startup = new Audio('sounds/startup.mp3');
        sounds.gameStart = new Audio('sounds/game-start.mp3');
        sounds.toggleSwitch = new Audio('sounds/toggle-switch.mp3');
        
        // Configure settings
        Object.values(sounds).forEach(sound => {
            if (sound) {
                sound.volume = ZarigataEffects.settings.soundVolume;
            }
        });
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Sounds initialized');
    }

    /**
     * ::CODEX:: SOUND EMISSION PROTOCOL
     * Plays a specific sound effect if sound is enabled
     */
    function playSound(soundName) {
        const settings = ZarigataEffects.settings;
        const sounds = ZarigataEffects.sounds;
        
        // Check if sounds are enabled before playing
        if ((soundName === 'startup' && settings.enableStartupSound) ||
            (soundName !== 'startup' && settings.enableButtonSounds)) {
            
            const sound = sounds[soundName];
            if (sound) {
                // Reset sound to beginning if already playing
                sound.pause();
                sound.currentTime = 0;
                sound.volume = settings.soundVolume;
                
                // Play the sound
                sound.play().catch(error => {
                    console.warn('::ZARIGATA EFFECTS ENGINE:: Sound play error:', error);
                });
            }
        }
    }

    // ===================== EFFECTS APPLICATION =====================
    /**
     * ::CODEX:: EFFECTS RENDERING PROTOCOL
     * Applies visual effects based on current settings
     */
    function applyEffects() {
        const settings = ZarigataEffects.settings;
        const body = ZarigataEffects.elements.body;
        
        // Apply body class effects
        body.classList.toggle('pixelated', settings.enablePixelation);
        body.classList.toggle('scanlines', settings.enableScanlines);
        body.classList.toggle('screen-glare', settings.enableScreenGlare);
        body.classList.toggle('screen-ghosting', settings.enableScreenGhosting);
        body.classList.toggle('dark-mode', settings.darkMode);
        
        // Show/hide wave effects
        if (ZarigataEffects.elements.waveContainer) {
            ZarigataEffects.elements.waveContainer.style.display = 
                settings.enableWaveEffects ? 'block' : 'none';
        }
        
        // Ensure battery level is displayed correctly
        updateBatteryDisplay();
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Effects applied');
    }

    // ===================== BATTERY SIMULATION =====================
    /**
     * ::CODEX:: BATTERY POWER MANAGEMENT PROTOCOL
     * Starts the battery drain simulation for immersive effect
     */
    function startBatterySimulation() {
        // Clear any existing timer
        if (ZarigataEffects.timers.batteryDrain) {
            clearInterval(ZarigataEffects.timers.batteryDrain);
        }
        
        // Start new battery drain simulation
        ZarigataEffects.timers.batteryDrain = setInterval(() => {
            const settings = ZarigataEffects.settings;
            
            // Reduce battery level
            settings.batteryLevel = Math.max(0, settings.batteryLevel - settings.batteryDrainRate);
            
            // Update the display
            updateBatteryDisplay();
            
            // Save settings periodically
            if (Math.random() < 0.1) { // 10% chance each tick to avoid excessive writes
                saveSettings();
            }
        }, 1000); // Update every second
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Battery simulation started');
    }

    /**
     * ::CODEX:: BATTERY DISPLAY UPDATE ROUTINE
     * Updates the visual representation of battery status
     */
    function updateBatteryDisplay() {
        const batteryLevel = ZarigataEffects.settings.batteryLevel;
        const batteryElement = document.querySelector('.battery-level');
        
        if (batteryElement) {
            // Update battery level visually (width from 0-8px based on percentage)
            const width = (batteryLevel / 100) * 8;
            batteryElement.style.setProperty('--battery-width', `${width}px`);
            
            // Change color based on level
            let color = '#8bac0f'; // Green when full
            
            if (batteryLevel < 15) {
                color = '#fe0100'; // Red when critical
            } else if (batteryLevel < 40) {
                color = '#ffcc00'; // Yellow when low
            }
            
            batteryElement.style.setProperty('--battery-color', color);
            
            // Update the actual element
            batteryElement.querySelector('::before').style.backgroundColor = color;
            batteryElement.querySelector('::before').style.width = `${width}px`;
        }
    }

    // ===================== STARTUP ANIMATION =====================
    /**
     * ::CODEX:: SYSTEM BOOT SEQUENCE
     * Plays the ZARIGATA startup animation with sound
     */
    function playStartupAnimation() {
        // CODEX CRITICAL BOOT SEQUENCE v2.1 - FORCE DIRECT DISPLAY INJECTION
        const startupElement = document.getElementById('zarigata-startup');
        if (!startupElement) {
            console.error('::ZARIGATA EFFECTS ENGINE:: Startup animation element not found');
            // Force immediately to game menu if element is missing
            if (typeof initializeGames === 'function') {
                initializeGames();
            }
            return;
        }
        
        // OVERRIDE ANY PREVIOUS STATE - force clean start
        startupElement.classList.remove('fade-out');
        startupElement.classList.remove('active');
        startupElement.style.display = 'flex';
        
        // ENHANCED PROGRESS BAR ANIMATION - ULTRA RELIABLE
        const progressBar = startupElement.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.style.transition = 'none';
            
            // Force browser to recognize style change before setting transition
            setTimeout(() => {
                progressBar.style.transition = 'width 1.5s linear';
                progressBar.style.width = '100%';
            }, 50);
        }

        // DIRECT ACTIVATION PROTOCOL
        startupElement.classList.add('active');
        
        // AUDIO FEEDBACK SYSTEM
        playSound('startup');
        
        // ULTRA-SHORT SEQUENCE WITH GUARANTEED COMPLETION
        // Clear any previous timers to avoid conflicts
        if (ZarigataEffects.timers.startupSequence) {
            clearTimeout(ZarigataEffects.timers.startupSequence);
        }
        
        // ACCELERATED FADE SEQUENCE - only 1.5s total animation time
        ZarigataEffects.timers.startupSequence = setTimeout(() => {
            startupElement.classList.add('fade-out');
            
            // PORTAL ACTIVATION SEQUENCE
            setTimeout(() => {
                // FORCE HIDE
                startupElement.style.display = 'none';
                startupElement.classList.remove('active');
                startupElement.classList.remove('fade-out');
                
                // PORTAL INITIALIZATION
                console.log('::ZARIGATA EFFECTS ENGINE:: Startup complete, initializing games');
                
                // CRITICAL: Force game grid initialization
                try {
                    // Try direct function call first
                    if (typeof initializeGames === 'function') {
                        initializeGames();
                    // Fallback to manual DOM manipulation if needed
                    } else if (document.getElementById('game-grid')) {
                        const gameContainer = document.getElementById('game-container');
                        const gameGrid = document.getElementById('game-grid');
                        
                        // Show grid, hide container
                        if (gameGrid) gameGrid.style.display = 'grid';
                        if (gameContainer) gameContainer.classList.add('hidden');
                        
                        // Try to populate from game data if available
                        if (window.GameAPI && window.GameAPI.getAllGames) {
                            const games = window.GameAPI.getAllGames();
                            if (games && games.length > 0) {
                                gameGrid.innerHTML = '';
                                games.forEach(game => {
                                    const card = document.createElement('div');
                                    card.className = 'game-card';
                                    card.innerHTML = `<div class="game-info"><h3>${game.title}</h3></div>`;
                                    gameGrid.appendChild(card);
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('::ZARIGATA EFFECTS ENGINE:: Error initializing games:', e);
                }
                
                console.log('::ZARIGATA EFFECTS ENGINE:: Startup animation completed');
            }, 600); // Faster fade-out completion
        }, 1500); // Shorter initial display time
        
        // TRIPLE FAILSAFE SYSTEM - guarantees completion in max 3 seconds
        setTimeout(() => {
            if (startupElement.style.display !== 'none') {
                startupElement.style.display = 'none';
                startupElement.classList.remove('active');
                startupElement.classList.remove('fade-out');
                
                // Final attempt to initialize games
                if (typeof initializeGames === 'function') {
                    initializeGames();
                }
                
                console.warn('::ZARIGATA EFFECTS ENGINE:: PRIMARY FAILSAFE ACTIVATED');
            }
        }, 3000);
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Enhanced startup animation activated');
    }

    // ===================== FULLSCREEN HANDLING =====================
    /**
     * ::CODEX:: DISPLAY EXPANSION PROTOCOL
     * Toggles fullscreen mode for the game screen
     */
    function toggleFullscreen() {
        const gameScreen = ZarigataEffects.elements.gameScreen;
        if (!gameScreen) return;
        
        if (!ZarigataEffects.isFullscreen) {
            // Enter fullscreen
            gameScreen.classList.add('fullscreen-game', 'entering-fullscreen');
            
            // Request browser fullscreen if supported
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn('::ZARIGATA EFFECTS ENGINE:: Error entering fullscreen:', err);
                });
            }
            
            // Remove animation class after it completes
            setTimeout(() => {
                gameScreen.classList.remove('entering-fullscreen');
            }, 300);
            
            ZarigataEffects.isFullscreen = true;
        } else {
            // Exit fullscreen
            gameScreen.classList.add('exiting-fullscreen');
            
            // Exit browser fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => {
                    console.warn('::ZARIGATA EFFECTS ENGINE:: Error exiting fullscreen:', err);
                });
            }
            
            // Remove classes after animation completes
            setTimeout(() => {
                gameScreen.classList.remove('fullscreen-game', 'exiting-fullscreen');
            }, 300);
            
            ZarigataEffects.isFullscreen = false;
        }
        
        // Play button sound
        playSound('buttonPress');
        
        console.log(`::ZARIGATA EFFECTS ENGINE:: Fullscreen ${ZarigataEffects.isFullscreen ? 'enabled' : 'disabled'}`);
    }

    // ===================== SETTINGS MANAGEMENT =====================
    /**
     * ::CODEX:: CONFIGURATION PERSISTENCE PROTOCOL
     * Saves current settings to localStorage
     */
    function saveSettings() {
        try {
            localStorage.setItem('zarigataSettings', JSON.stringify(ZarigataEffects.settings));
            console.log('::ZARIGATA EFFECTS ENGINE:: Settings saved');
        } catch (error) {
            console.warn('::ZARIGATA EFFECTS ENGINE:: Error saving settings:', error);
        }
    }

    /**
     * ::CODEX:: CONFIGURATION RETRIEVAL PROTOCOL
     * Loads settings from localStorage if available
     */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('zarigataSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // Merge saved settings with defaults
                Object.assign(ZarigataEffects.settings, parsedSettings);
                console.log('::ZARIGATA EFFECTS ENGINE:: Settings loaded');
            }
        } catch (error) {
            console.warn('::ZARIGATA EFFECTS ENGINE:: Error loading settings:', error);
        }
    }

    /**
     * ::CODEX:: SETTINGS UPDATE PROTOCOL
     * Updates a specific setting and applies changes
     */
    function updateSetting(setting, value) {
        if (ZarigataEffects.settings.hasOwnProperty(setting)) {
            ZarigataEffects.settings[setting] = value;
            
            // Apply effects with new settings
            applyEffects();
            
            // Save to localStorage
            saveSettings();
            
            // Play toggle sound
            playSound('toggleSwitch');
            
            console.log(`::ZARIGATA EFFECTS ENGINE:: Setting updated: ${setting} = ${value}`);
        }
    }

    // ===================== EVENT LISTENERS =====================
    /**
     * ::CODEX:: EVENT BINDING PROTOCOL
     * Sets up all event listeners for interactive elements
     */
    function setupEventListeners() {
        // Get elements
        const container = ZarigataEffects.elements.container;
        const settingsModal = ZarigataEffects.elements.settingsModal;
        
        // Fullscreen toggle in settings
        const fullscreenToggle = document.querySelector('#fullscreen-toggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('change', () => {
                toggleFullscreen();
            });
        }
        
        // Settings toggles
        document.querySelectorAll('.toggle-checkbox').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const setting = this.dataset.setting;
                if (setting) {
                    updateSetting(setting, this.checked);
                }
            });
            
            // Set initial state from settings
            const setting = toggle.dataset.setting;
            if (setting && ZarigataEffects.settings.hasOwnProperty(setting)) {
                toggle.checked = ZarigataEffects.settings[setting];
            }
        });
        
        // Button sound effects
        document.querySelectorAll('.game-card, .back-button, .settings-button, .close-modal, .dpad-button, .action-button, .option-button').forEach(button => {
            // Click sound
            button.addEventListener('click', () => {
                playSound('buttonPress');
            });
            
            // Hover sound
            button.addEventListener('mouseenter', () => {
                playSound('buttonHover');
            });
        });
        
        // Back button fullscreen handling
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (ZarigataEffects.isFullscreen) {
                    toggleFullscreen();
                }
            });
        }
        
        // Fullscreen change event (browser API)
        document.addEventListener('fullscreenchange', () => {
            // If browser fullscreen was exited, update our state
            if (!document.fullscreenElement && ZarigataEffects.isFullscreen) {
                const gameScreen = ZarigataEffects.elements.gameScreen;
                if (gameScreen) {
                    gameScreen.classList.remove('fullscreen-game');
                    ZarigataEffects.isFullscreen = false;
                }
            }
        });
        
        console.log('::ZARIGATA EFFECTS ENGINE:: Event listeners set up');
    }

    // ===================== PUBLIC API =====================
    // Expose API to global scope
    window.ZarigataEffects = {
        init: initialize,
        toggleFullscreen: toggleFullscreen,
        updateSetting: updateSetting,
        playSound: playSound
    };
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initialize);
})();
