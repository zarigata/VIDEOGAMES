/**
 * ██████╗ ███████╗███████╗ ██████╗███████╗███╗   ██╗████████╗     ██████╗  █████╗ ███╗   ███╗███████╗     ██╗███████╗
 * ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝████╗  ██║╚══██╔══╝    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝     ██║██╔════╝
 * ██║  ██║█████╗  ███████╗██║     █████╗  ██╔██╗ ██║   ██║       ██║  ███╗███████║██╔████╔██║█████╗       ██║███████╗
 * ██║  ██║██╔══╝  ╚════██║██║     ██╔══╝  ██║╚██╗██║   ██║       ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ██   ██║╚════██║
 * ██████╔╝███████╗███████║╚██████╗███████╗██║ ╚████║   ██║       ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗╚█████╔╝███████║
 * ╚═════╝ ╚══════╝╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝        ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ ╚════╝ ╚══════╝
 * 
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX GAME CORE v1.0.0 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This is the main game controller that coordinates all game systems and manages the game loop.
 * It integrates all vector-based rendering, physics, and game mechanics.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: OMEGA-1
 */

'use strict';

/**
 * SnowballDescent main game class
 */
class SnowballDescent {
    /**
     * Create a new SnowballDescent game instance
     */
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.gameOverState = false;
        this.score = 0;
        this.highScore = 0;
        this.lastScoreIncrease = 0;
        this.difficulty = 0;
        this.message = '';
        this.messageTimeout = null;
        
        // Performance tracking
        this.fps = 0;
        this.frameTime = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // ms
        this.lastFpsUpdate = 0;
        
        // Game systems
        this.snowball = null;
        this.obstacleGenerator = null;
        this.particleSystem = null;
        this.collisionSystem = null;
        this.terrain = null;
        this.background = null;
        this.uiRenderer = null;
        
        // Animation frame ID for cancellation
        this.animationId = null;
        
        // Initialize the game
        this.init();
    }
    
    /**
     * Initialize the game systems
     */
    init() {
        // Load high score from localStorage if available
        this.loadHighScore();
        
        // Set up canvas size
        this.resizeCanvas();
        
        // Create game systems
        this.particleSystem = new ParticleSystem(this);
        this.collisionSystem = new CollisionSystem(this);
        this.terrain = new TerrainGenerator(this);
        this.background = new BackgroundRenderer(this);
        this.uiRenderer = new UIRenderer(this);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show start screen
        this.showStartScreen();
    }
    
    /**
     * Resize canvas to fit window
     */
    resizeCanvas() {
        // Set canvas size to match container
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        
        // Redraw if game is paused
        if (this.isPaused) {
            this.draw();
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Start button
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => this.startGame());
        }
        
        // Restart button
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
        }
        
        // Window resize
        if (GameConfig.system.autoResize) {
            window.addEventListener('resize', () => this.resizeCanvas());
        }
        
        // Blur/focus events for pausing
        if (GameConfig.system.pauseOnBlur) {
            window.addEventListener('blur', () => this.pauseGame());
            window.addEventListener('focus', () => this.resumeGame());
        }
        
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            // Pause on Escape key
            if (e.key === 'Escape' && this.isPlaying) {
                if (this.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            }
            
            // Skip animation/auto-start with Space key
            if (e.key === ' ' || e.key === 'Enter') {
                if (!this.isPlaying && !this.gameOverState) {
                    this.startGame();
                } else if (this.gameOverState) {
                    this.restartGame();
                }
            }
        });
    }
    
    /**
     * Start the game
     */
    startGame() {
        // Hide start screen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.add('hidden');
        }
        
        // Reset game state
        this.score = 0;
        this.lastScoreIncrease = 0;
        this.difficulty = 0;
        this.gameOverState = false;
        
        // Create game objects
        this.snowball = new Snowball(this);
        this.obstacleGenerator = new ObstacleGenerator(this);
        
        // Clear any existing particles
        this.particleSystem.clear();
        
        // Reset terrain
        this.terrain.reset();
        
        // Start game loop
        this.isPlaying = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        
        // Add some initial snowfall
        this.particleSystem.createSnowfall(20);
        
        // Show welcome message
        this.showMessage('GO!', 1500);
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        // Hide game over screen
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        
        // Start a new game
        this.startGame();
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.isPaused = true;
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Show pause message
        this.showMessage('PAUSED', 0);
        
        // Draw paused state
        this.draw();
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (!this.isPlaying || !this.isPaused) return;
        
        this.isPaused = false;
        
        // Clear pause message
        this.clearMessage();
        
        // Reset frame time to prevent large deltaTime
        this.lastFrameTime = performance.now();
        
        // Restart game loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Game over
     */
    gameOver() {
        this.isPlaying = false;
        this.gameOverState = true;
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // Show game over screen
        this.showGameOverScreen();
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        // Calculate delta time
        this.frameTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Convert to seconds
        const deltaTime = this.frameTime / 1000;
        
        // Cap delta time to prevent spiraling
        const cappedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Update FPS counter
        this.updateFps(timestamp);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.update(cappedDeltaTime);
        
        // Render frame
        this.draw();
        
        // Continue game loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Generate background snowfall occasionally
        if (Math.random() < 0.1) {
            this.particleSystem.createSnowfall(1);
        }
        
        // Update difficulty based on score
        this.updateDifficulty();
        
        // Update game objects
        this.background.update(deltaTime);
        this.terrain.update(this.obstacleGenerator.speed);
        this.obstacleGenerator.update(deltaTime);
        
        // Apply physics forces to the snowball
        this.collisionSystem.applyGravity(this.snowball, deltaTime);
        this.collisionSystem.applyAirResistance(this.snowball, deltaTime);
        
        // Check for collision with terrain before updating snowball position
        const terrainCollision = this.collisionSystem.checkTerrainCollision(this.snowball, this.terrain);
        
        // Update snowball after terrain collision check
        this.snowball.update(deltaTime);
        
        // Clear previous collision results
        this.collisionSystem.clearCollisions();
        
        // Check collisions with obstacles and collectibles
        if (this.obstacleGenerator && this.obstacleGenerator.obstacles.length > 0) {
            // Get potential collision pairs using broad phase
            const collisionObjects = [
                ...this.obstacleGenerator.obstacles,
                ...this.obstacleGenerator.collectibles
            ];
            
            // Check each obstacle/collectible against the snowball
            for (let i = 0; i < collisionObjects.length; i++) {
                const object = collisionObjects[i];
                
                // Skip inactive objects
                if (!object.active) continue;
                
                // Create circle representation for collision check
                const circle1 = {
                    position: this.snowball.position,
                    radius: this.snowball.size,
                    velocity: this.snowball.velocity,
                    mass: this.snowball.size * 5  // Mass proportional to size
                };
                
                const circle2 = {
                    position: object.position,
                    radius: object.radius || object.size,
                    velocity: object.velocity || new Vector2(0, 0),
                    mass: object.mass || 1
                };
                
                // Check for collision
                const collision = this.collisionSystem.checkCircleCollision(circle1, circle2);
                
                if (collision) {
                    // Resolve physics collision
                    this.collisionSystem.resolveCircleCollision(circle1, circle2, collision);
                    
                    // Update game object properties after physics resolution
                    this.snowball.position = circle1.position;
                    this.snowball.velocity = circle1.velocity;
                    object.position = circle2.position;
                    
                    // Handle gameplay effects of collision
                    if (object.type === 'obstacle') {
                        // Handle obstacle collision
                        this.snowball.hitObstacle(object);
                        
                        // Create impact particles
                        this.particleSystem.createExplosion(
                            object.position.x,
                            object.position.y,
                            '#ffffff',
                            object.size * 2
                        );
                        
                        // Deactivate the obstacle if it's destroyed
                        if (object.health <= 0) {
                            object.active = false;
                        }
                    } else if (object.type === 'collectible') {
                        // Handle collectible collection
                        this.snowball.collectSnow(object.value);
                        object.active = false;
                        
                        // Create collection particles
                        this.particleSystem.createSnowBurst(
                            object.position.x,
                            object.position.y,
                            object.size * 2
                        );
                        
                        // Add score
                        this.addScore(object.points || 10);
                    }
                }
            }
            
            // Filter out inactive objects
            this.obstacleGenerator.obstacles = this.obstacleGenerator.obstacles.filter(o => o.active);
            this.obstacleGenerator.collectibles = this.obstacleGenerator.collectibles.filter(c => c.active);
        }
        
        // Update particle system
        this.particleSystem.update();
        
        // Check if snowball has fallen off bottom of screen
        if (this.snowball.position.y > this.canvas.height + this.snowball.size * 2) {
            this.gameOver();
        }
    }
    
    /**
     * Render the frame
     */
    draw() {
        // Draw background
        this.ctx.fillStyle = GameConfig.render.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background elements
        this.background.render(this.ctx);
        
        // Draw terrain
        this.terrain.render(this.ctx);
        
        // Draw particles behind objects
        this.particleSystem.render(this.ctx);
        
        // Draw obstacles and collectibles
        if (this.obstacleGenerator) {
            this.obstacleGenerator.render(this.ctx);
        }
        
        // Draw snowball
        if (this.snowball) {
            this.snowball.render(this.ctx);
        }
        
        // Draw UI elements
        this.uiRenderer.render(this.ctx);
        
        // Draw message if any
        this.drawMessage();
        
        // Draw pause overlay if paused
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }
    
    /**
     * Update FPS counter
     * @param {number} timestamp - Current timestamp
     */
    updateFps(timestamp) {
        // Count frames
        this.frameCount++;
        
        // Update FPS every interval
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            // Calculate FPS
            this.fps = (this.frameCount * 1000) / (timestamp - this.lastFpsUpdate);
            
            // Reset counters
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }
    }
    
    /**
     * Update difficulty based on score
     */
    updateDifficulty() {
        // Base difficulty on score
        const scoreMilestones = GameConfig.scoring.scoreMilestones;
        
        // Find current difficulty level based on score
        let newDifficulty = 0;
        for (let i = 0; i < scoreMilestones.length; i++) {
            if (this.score >= scoreMilestones[i]) {
                newDifficulty = i + 1;
            } else {
                break;
            }
        }
        
        // Update difficulty if changed
        if (newDifficulty !== this.difficulty) {
            this.difficulty = newDifficulty;
        }
    }
    
    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore(points) {
        // Base score
        this.score += points;
        
        // Track last score increase for milestone detection
        this.lastScoreIncrease = this.score;
        
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = Math.floor(this.score);
            
            // Apply animation
            scoreElement.classList.remove('size-up');
            void scoreElement.offsetWidth; // Trigger reflow
            scoreElement.classList.add('size-up');
        }
    }
    
    /**
     * Show a temporary message
     * @param {string} text - Message text
     * @param {number} duration - Message duration in ms (0 for indefinite)
     */
    showMessage(text, duration = 2000) {
        // Clear any existing message and timeout
        this.clearMessage();
        
        // Set new message
        this.message = text;
        
        // Update message element
        const messageElement = document.getElementById('gameMessage');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.classList.add('visible');
        }
        
        // Set timeout to clear message if duration is not 0
        if (duration > 0) {
            this.messageTimeout = setTimeout(() => {
                this.clearMessage();
            }, duration);
        }
    }
    
    /**
     * Clear the current message
     */
    clearMessage() {
        // Clear timeout if any
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        
        // Clear message
        this.message = '';
        
        // Update message element
        const messageElement = document.getElementById('gameMessage');
        if (messageElement) {
            messageElement.classList.remove('visible');
        }
    }
    
    /**
     * Draw the current message
     */
    drawMessage() {
        if (!this.message) return;
        
        // Draw message text
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Position in center of screen
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        // Draw text with outline for better visibility
        this.ctx.strokeText(this.message, x, y);
        this.ctx.fillText(this.message, x, y);
        this.ctx.restore();
    }
    
    /**
     * Draw pause overlay
     */
    drawPauseOverlay() {
        this.ctx.save();
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        // Instructions
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.fillText('Press ESC to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        this.ctx.restore();
    }
    
    /**
     * Show the start screen
     */
    showStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Show the game over screen
     */
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
            
            // Update final score
            const finalScoreElement = document.getElementById('finalScore');
            if (finalScoreElement) {
                finalScoreElement.textContent = Math.floor(this.score);
            }
            
            // Update high score
            const highScoreElement = document.getElementById('highScore');
            if (highScoreElement) {
                highScoreElement.textContent = Math.floor(this.highScore);
            }
        }
    }
    
    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        if (GameConfig.system.saveHighScore) {
            try {
                localStorage.setItem('snowballDescent_highScore', this.highScore.toString());
            } catch (e) {
                console.warn('Failed to save high score:', e);
            }
        }
    }
    
    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        if (GameConfig.system.saveHighScore) {
            try {
                const savedScore = localStorage.getItem('snowballDescent_highScore');
                if (savedScore) {
                    this.highScore = parseFloat(savedScore);
                }
            } catch (e) {
                console.warn('Failed to load high score:', e);
            }
        }
    }
}

// Create game instance when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the game
    window.game = new SnowballDescent();
    
    /**
     * ================================================================================
     * ::CODEX:: AUTO-START PROTOCOL v1.2.2 - ZARIGATA INTEGRATION MODULE
     * ================================================================================
     * This auto-start code ensures smooth launching from the ZARIGATA portal.
     * It automatically starts the game after a short delay to ensure all resources
     * are loaded properly and the player is ready.
     * ================================================================================
     */
    setTimeout(() => {
        // Check if game initialized properly
        if (window.game && !window.game.isPlaying && !window.game.gameOverState) {
            console.log('::CODEX AUTO-START:: Initiating Snowball Descent launch sequence');
            
            // Auto start the game
            const startButton = document.getElementById('startButton');
            if (startButton) {
                // Simulate click on start button
                startButton.click();
                console.log('::CODEX AUTO-START:: Game launched successfully');
            } else {
                // Direct start if button not found
                window.game.startGame();
                console.log('::CODEX AUTO-START:: Game launched directly (no button found)');
            }
        }
    }, 1500); // 1.5 second delay for smooth transition
});
