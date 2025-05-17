/* 
 * ===================================================
 * ================ HONEST GAMES PORTAL ==============
 * =========== GAME DATA CONFIGURATION FILE ==========
 * ===================================================
 * ======= CODEX v1.0 - THE HONEST GAME VAULT ========
 * ===================================================
 */

/**
 * GAME DATA STORAGE SYSTEM
 * 
 * This module houses all available games in the portal
 * Each game must include:
 *   - id: Unique identifier for the game
 *   - title: Display name of the game
 *   - description: Short description of what the game actually is
 *   - image: Path to the game's thumbnail image
 *   - path: Path to the game's HTML file
 *   - tags: Array of categories/tags
 *   - created: Creation date
 */

const GAMES = [
    {
        id: "match-3",
        title: "Actually Match 3",
        description: "The real deal match-3 puzzle game. No false advertising - just match 3 gems and score points. No complicated storyline, just pure gameplay.",
        image: "assets/match-3.jpg",
        path: "games/match-3/index.html",
        tags: ["puzzle", "casual", "match-3"],
        created: "2025-05-17"
    },
    {
        id: "runner",
        title: "Honest Runner",
        description: "A straightforward runner game where you actually run and dodge obstacles. No princesses to save, no complicated plot twists.",
        image: "assets/runner.jpg",
        path: "games/runner/index.html",
        tags: ["arcade", "runner", "casual"],
        created: "2025-05-17"
    },
    {
        id: "snake",
        title: "Just Snake",
        description: "The classic snake game. Eat food, grow longer, don't hit walls or yourself. That's it - exactly as advertised.",
        image: "assets/snake.jpg",
        path: "games/snake/index.html",
        tags: ["classic", "arcade", "snake"],
        created: "2025-05-17"
    },
    {
        id: "memory",
        title: "Memory Match",
        description: "A real memory card matching game. Find pairs of matching cards. No hidden fees, no bait and switch.",
        image: "assets/memory.jpg",
        path: "games/memory/index.html",
        tags: ["puzzle", "memory", "casual"],
        created: "2025-05-17"
    }
];

/**
 * GAME API INTERFACE
 * External interface for accessing game data
 * Used by game-loader.js to populate and navigate games
 */
const GameAPI = {
    /**
     * Get all available games in the portal
     * @returns {Array} Array of game objects
     */
    getAllGames: () => {
        return GAMES;
    },
    
    /**
     * Find a specific game by its ID
     * @param {string} id - The unique identifier of the game
     * @returns {Object|null} Game object if found, null otherwise
     */
    getGameById: (id) => {
        return GAMES.find(game => game.id === id) || null;
    },
    
    /**
     * Filter games by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array} Array of games that have the specified tag
     */
    getGamesByTag: (tag) => {
        return GAMES.filter(game => game.tags.includes(tag));
    },
    
    /**
     * Get all available tags across all games
     * @returns {Array} Array of unique tags
     */
    getAllTags: () => {
        const allTags = new Set();
        GAMES.forEach(game => {
            game.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }
};
