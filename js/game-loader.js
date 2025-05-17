/* 
 * ===================================================
 * ================ HONEST GAMES PORTAL ==============
 * ======= GAME LOADER / INTERFACE CONTROLLER ========
 * ===================================================
 * === CODEX v1.0 - Initial Release - May 17, 2025 ===
 * ===================================================
 *
 * :: THIS CODE IS NOT OBFUSCATED ::
 * :: BECAUSE WE KEEP EVERYTHING HONEST HERE ::
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
        
        // ==> TRANSITION TO GAME VIEW
        gameFrameContainer.innerHTML = '';
        gameFrameContainer.appendChild(iframe);
        gameGrid.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // ==> LOG GAME LAUNCH
        console.log(`[GAME LOADER] Launching game: ${game.title} (${game.id})`);
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
            
            // Clear iframe to stop game execution
            gameFrameContainer.innerHTML = '';
        });
    }
});
