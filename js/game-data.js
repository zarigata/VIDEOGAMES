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
        id: "snowball-descent",
        title: "Snowball Descent",
        description: "Roll downhill gathering snow and grow your snowball while avoiding obstacles. Pure vector-based graphics with no images - an authentic arcade experience.",
        image: "assets/snowball-descent.jpg",
        path: "games/snowball-descent/index.html",
        tags: ["arcade", "physics", "vector"],
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
