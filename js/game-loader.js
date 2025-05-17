/* 
 * ===================================================
 * ================ ZARIGATA RETRO PORTAL ============
 * ======== GAME LOADER / INTERFACE CONTROLLER =======
 * ===================================================
 * ======= CODEX v1.0 - ZARI BUILD - MAY 17, 2025 ====
 * ===================================================
 *
 * :: CODE MODULE: GAME_MANAGEMENT_SYSTEM_v3.9b ::
 * :: ENHANCED FULLSCREEN RENDERER ACTIVE ::
 * :: SECURITY LEVEL: ZARI_ACCESS_GRANTED ::
 */

/**
 * =========================================
 * GAME PORTAL INTERFACE MANAGER
 * =========================================
 * Controls the entire game selection and loading process
 * Handles UI state transitions and game iframe embedding
 */
document.addEventListener('DOMContentLoaded', () => {
    // ===== CRITICAL SYSTEM REFERENCES =====
    const gameGrid = document.getElementById('game-grid');
    const gameContainer = document.getElementById('game-container');
    const gameFrameContainer = document.getElementById('game-frame-container');
    const backButton = document.getElementById('back-button');
    const currentGameTitle = document.getElementById('current-game-title');
    
    // ===== INITIALIZATION SEQUENCE =====
    initializeGames();
    setupEventListeners();
    
    /**
     * BOOTSTRAP PROTOCOL: POPULATE GAME GRID
     * Renders all available games from the GameAPI
     */
    function initializeGames() {
        // Clear existing game cards if any
        gameGrid.innerHTML = '';
        
        // Retrieve all games from the API
        const games = GameAPI.getAllGames();
        
        // Generate game cards for each game
        games.forEach(game => {
            const gameCard = createGameCard(game);
            gameGrid.appendChild(gameCard);
        });
    }
    
    /**
     * GENERATE GAME CARD ELEMENT
     * Creates a DOM element for a game card
     * @param {Object} game - Game data object
     * @returns {HTMLElement} The game card DOM element
     */
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = game.id;
        
        // ==> INJECT CARD CONTENTS
        card.innerHTML = `
            <img src="${game.image}" alt="${game.title}" class="game-image">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-tags">
                    ${game.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        // ==> BIND CLICK EVENT
        card.addEventListener('click', () => {
            loadGame(game.id);
        });
        
        return card;
    }
    
    /**
     * GAME LOADER PROTOCOL
     * Loads a game by its ID and switches the UI state
     * @param {string} gameId - The ID of the game to load
     */
    function loadGame(gameId) {
        const game = GameAPI.getGameById(gameId);
        
        if (!game) {
            console.error(`[ERROR] Game with ID "${gameId}" not found in database`);
            return;
        }
        
        // ==> UPDATE UI ELEMENTS
        currentGameTitle.textContent = game.title;
        
        // ==> CREATE GAME IFRAME
        const iframe = document.createElement('iframe');
        iframe.src = game.path;
        iframe.title = game.title;
        iframe.setAttribute('allowfullscreen', '');
        iframe.allow = 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        
        // ==> TRANSITION TO GAME VIEW
        gameFrameContainer.innerHTML = '';
        gameFrameContainer.appendChild(iframe);
        gameGrid.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // ==> APPLY FULLSCREEN MODE IF ENABLED
        if (window.GamePortalConfig && window.GamePortalConfig.retro.fullscreenGames) {
            document.body.classList.add('fullscreen-game');
            
            // Request actual fullscreen if supported by browser
            if (document.documentElement.requestFullscreen) {
                try {
                    // Don't wait for this to complete
                    document.documentElement.requestFullscreen().catch(() => {
                        console.log('Fullscreen request was denied');
                    });
                } catch (error) {
                    console.log('Fullscreen API not available');
                }
            }
        }
        
        // ==> LOG GAME LAUNCH
        console.log(`[ZARI_LOADER] Launching game: ${game.title} (${game.id})`);
    }
    
    /**
     * EVENT BINDING PROTOCOL
     * Sets up all necessary event listeners
     */
    function setupEventListeners() {
        // ==> BACK BUTTON HANDLER
        backButton.addEventListener('click', () => {
            // Return to game selection view
            gameContainer.classList.add('hidden');
            gameGrid.classList.remove('hidden');
            
            // Exit fullscreen if active
            if (document.body.classList.contains('fullscreen-game')) {
                document.body.classList.remove('fullscreen-game');
                
                // Exit browser fullscreen if active
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(err => {
                        console.log('Error exiting fullscreen:', err);
                    });
                }
            }
            
            // Clear iframe to stop game execution
            gameFrameContainer.innerHTML = '';
        });
        
        // ==> HANDLE FULLSCREEN API CHANGES
        document.addEventListener('fullscreenchange', () => {
            // If user manually exits fullscreen, update our UI accordingly
            if (!document.fullscreenElement && document.body.classList.contains('fullscreen-game')) {
                document.body.classList.remove('fullscreen-game');
            }
        });
    }
});
