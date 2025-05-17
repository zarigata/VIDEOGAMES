/**
 * ███████╗ ██████╗ ██████╗  ██████╗███████╗    ███████╗████████╗ █████╗ ██████╗ ████████╗██╗   ██╗██████╗ 
 * ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║   ██║██╔══██╗
 * █████╗  ██║   ██║██████╔╝██║     █████╗      ███████╗   ██║   ███████║██████╔╝   ██║   ██║   ██║██████╔╝
 * ██╔══╝  ██║   ██║██╔══██╗██║     ██╔══╝      ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██║   ██║██╔═══╝ 
 * ██║     ╚██████╔╝██║  ██║╚██████╗███████╗    ███████║   ██║   ██║  ██║██║  ██║   ██║   ╚██████╔╝██║     
 * ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝     
 *                                                                                                           
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX EMERGENCY STARTUP OVERRIDE v1.7.3 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module provides a failsafe emergency startup mechanism for the ZARIGATA portal.
 * It bypasses the normal startup animation and directly loads the game selection grid.
 * Designed to recover from hung animations and startup failures.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * AUTHORIZATION LEVEL: OVERRIDE ALPHA
 */

// Self-executing function to avoid polluting global namespace
(function() {
    'use strict';
    
    /**
     * EMERGENCY_STARTUP_OVERRIDE
     * Force the portal to load regardless of animation state
     */
    function forcePortalStartup() {
        console.log('::ZARIGATA EMERGENCY OVERRIDE:: Executing emergency startup protocol');
        
        // PHASE 1: Forcibly remove startup animation
        const startupElement = document.getElementById('zarigata-startup');
        if (startupElement) {
            startupElement.style.display = 'none';
            startupElement.classList.remove('active');
            startupElement.classList.remove('fade-out');
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: Removed startup animation');
        }
        
        // PHASE 2: Ensure main container is visible
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'block';
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: Main container forced visible');
        }
        
        // PHASE 3: Force display of game grid
        const gameGrid = document.getElementById('game-grid');
        if (gameGrid) {
            gameGrid.style.display = 'grid';
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: Game grid forced visible');
            
            // PHASE 3.1: Populate game grid if empty
            if (gameGrid.children.length === 0 && window.GameAPI && window.GameAPI.getAllGames) {
                try {
                    const games = window.GameAPI.getAllGames();
                    if (games && games.length > 0) {
                        gameGrid.innerHTML = '';
                        games.forEach(game => {
                            const card = document.createElement('div');
                            card.className = 'game-card';
                            card.dataset.gameId = game.id;
                            
                            card.innerHTML = `
                                <div class="game-info">
                                    <h3 class="game-title">${game.title}</h3>
                                    <p class="game-description">${game.description}</p>
                                </div>
                            `;
                            
                            card.addEventListener('click', () => {
                                // Try to load game if loadGame function exists
                                if (typeof loadGame === 'function') {
                                    loadGame(game.id);
                                } else {
                                    // Manual fallback
                                    const gameContainer = document.getElementById('game-container');
                                    const gameFrameContainer = document.getElementById('game-frame-container');
                                    const currentGameTitle = document.getElementById('current-game-title');
                                    
                                    if (gameContainer && gameFrameContainer) {
                                        // Update UI
                                        gameGrid.style.display = 'none';
                                        gameContainer.classList.remove('hidden');
                                        if (currentGameTitle) currentGameTitle.textContent = game.title;
                                        
                                        // Create iframe
                                        gameFrameContainer.innerHTML = '';
                                        const iframe = document.createElement('iframe');
                                        iframe.src = game.path;
                                        iframe.title = game.title;
                                        iframe.className = 'game-frame';
                                        gameFrameContainer.appendChild(iframe);
                                    }
                                }
                            });
                            
                            gameGrid.appendChild(card);
                        });
                        console.log('::ZARIGATA EMERGENCY OVERRIDE:: Games populated successfully');
                    }
                } catch (e) {
                    console.error('::ZARIGATA EMERGENCY OVERRIDE:: Failed to populate games:', e);
                }
            }
        }
        
        // PHASE 4: Add back button functionality if missing
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                const gameContainer = document.getElementById('game-container');
                const gameGrid = document.getElementById('game-grid');
                const gameFrameContainer = document.getElementById('game-frame-container');
                
                if (gameContainer && gameGrid && gameFrameContainer) {
                    gameContainer.classList.add('hidden');
                    gameGrid.style.display = 'grid';
                    gameFrameContainer.innerHTML = '';
                }
            });
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: Back button functionality ensured');
        }
        
        console.log('::ZARIGATA EMERGENCY OVERRIDE:: Emergency startup completed');
    }
    
    // Execute emergency startup after a delay to let normal startup attempt first
    setTimeout(forcePortalStartup, 1500);
    
    // Create emergency UI button for manual override
    setTimeout(() => {
        const startupElement = document.getElementById('zarigata-startup');
        if (startupElement && startupElement.style.display !== 'none') {
            const emergencyButton = document.createElement('button');
            emergencyButton.innerText = 'EMERGENCY START';
            emergencyButton.style.position = 'absolute';
            emergencyButton.style.bottom = '20px';
            emergencyButton.style.left = '50%';
            emergencyButton.style.transform = 'translateX(-50%)';
            emergencyButton.style.padding = '10px 20px';
            emergencyButton.style.background = '#ff3333';
            emergencyButton.style.color = 'white';
            emergencyButton.style.border = 'none';
            emergencyButton.style.borderRadius = '5px';
            emergencyButton.style.cursor = 'pointer';
            emergencyButton.style.fontFamily = '"Press Start 2P", monospace';
            emergencyButton.style.fontSize = '12px';
            emergencyButton.style.zIndex = '10000';
            
            emergencyButton.addEventListener('click', () => {
                forcePortalStartup();
            });
            
            startupElement.appendChild(emergencyButton);
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: Emergency button added');
        }
    }, 3000);
    
    // Add keyboard shortcut for emergency override
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+F12 for emergency override
        if (e.ctrlKey && e.shiftKey && e.key === 'F12') {
            forcePortalStartup();
        }
    });
    
    // Add last resort timed override if page appears hung after 5 seconds
    setTimeout(() => {
        const startupElement = document.getElementById('zarigata-startup');
        const gameGrid = document.getElementById('game-grid');
        
        if ((startupElement && startupElement.style.display !== 'none') || 
            (gameGrid && gameGrid.children.length === 0)) {
            console.log('::ZARIGATA EMERGENCY OVERRIDE:: 5-second last resort override triggered');
            forcePortalStartup();
        }
    }, 5000);
    
    console.log('::ZARIGATA EMERGENCY OVERRIDE:: Module loaded and ready');
})();
