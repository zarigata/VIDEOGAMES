/*
 * =========================================================
 * ██████╗ ███╗   ██╗ ██████╗ ██╗    ██╗██████╗  █████╗ ██╗     ██╗     
 * ██╔════╝ ████╗  ██║██╔═══██╗██║    ██║██╔══██╗██╔══██╗██║     ██║     
 * ╚█████╗  ██╔██╗ ██║██║   ██║██║ █╗ ██║██████╔╝███████║██║     ██║     
 * ╠═══██╗  ██║╚██╗██║██║   ██║██║███╗██║██╔══██╗██╔══██║██║     ██║     
 * ██████╔╝ ██║ ╚████║╚██████╔╝╚███╔███╔╝██████╔╝██║  ██║███████╗███████╗
 * ╚═════╝  ╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
 * =========================================================
 * ZARIGATA CODEX v2.3.7 || DESCNT.JS || VECTOR EDITION
 * =========================================================
 * ::ID::          [X299-VEC2-DESCENT-ZERO]
 * ::RELEASE::     [ZARIGATA PREMIUM VECTOR COLLECTION]
 * ::REVISION::    [17/05/2025-ECX4]
 * ::VERIFIED::    [ZARI-UNIT-X99]
 */

// ===== GAME CONFIGURATION =====
const CONFIG = {
    // Display
    WIDTH: 800,
    HEIGHT: 600,
    FPS: 60,
    
    // Colors (Game Boy palette)
    COLORS: {
        BACKGROUND: '#0f380f',    // Dark green
        SNOWBALL: '#9bbc0f',      // Light green
        SNOWBALL_SHADOW: '#8bac0f',
        TERRAIN: '#306230',
        TERRAIN_SHADOW: '#1a2e1a',
        SNOW: '#e0f8e0',
        OBSTACLE: '#8b0000',
        TEXT: '#9bbc0f',
        TEXT_SHADOW: '#0f380f',
        UI_BG: 'rgba(15, 56, 15, 0.85)',
        UI_BORDER: '#306230'
    },
    
    // Physics
    GRAVITY: 0.5,
    FRICTION: 0.98,
    AIR_RESISTANCE: 0.99,
    BOUNCE: 0.6,
    
    // Snowball
    SNOWBALL: {
        START_RADIUS: 15,
        MAX_RADIUS: 50,
        MIN_RADIUS: 5,
        GROWTH_RATE: 0.5,     // Size increase per snowflake
        SHRINK_AMOUNT: 5,     // Size decrease per obstacle hit
        MAX_SPEED: 15,
        JUMP_FORCE: -10,
        CONTROL_FORCE: 0.5
    },
    
    // Terrain
    TERRAIN: {
        SEGMENT_LENGTH: 50,
        AMPLITUDE: 100,
        DETAIL: 0.05,
        MIN_SLOPE: -0.8,
        MAX_SLOPE: 0.8
    },
    
    // Game
    SNOWFLAKES: 20,          // Number of snowflakes on screen
    OBSTACLES: 5,            // Number of obstacles on screen
    SCORE_PER_METER: 10,     // Points per meter traveled
    SNOWFLAKE_POINTS: 100,   // Points per snowflake collected
    COMBO_MULTIPLIER: 1.2,   // Score multiplier for consecutive snowflakes
    INVULNERABILITY_TIME: 1000 // ms after hit before can be hit again
};

// ===== GAME STATE =====
const Game = {
    // Initialize game
    init() {
        // Get canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Load high score from localStorage
        this.highScore = parseInt(localStorage.getItem('snowballHighScore')) || 0;
        
        // Initialize UI elements
        this.scoreElement = document.getElementById('score');
        this.sizeElement = document.getElementById('size');
        this.highScoreElement = document.getElementById('high-score');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalHighScoreElement = document.getElementById('final-high-score');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start the game
        this.reset();
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.keys.up = true;
                    this.keys.space = true;
                    break;
                case 'Escape':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    if (this.isGameOver) this.reset();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.keys.up = false;
                    this.keys.space = false;
                    break;
            }
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
            
            if (x < this.canvas.width / 2) {
                this.keys.left = true;
                this.keys.right = false;
            } else {
                this.keys.right = true;
                this.keys.left = false;
            }
            
            this.keys.up = true;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.left = false;
            this.keys.right = false;
            this.keys.up = false;
        }, { passive: false });
        
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
            
            if (x < this.canvas.width / 2) {
                this.keys.left = true;
                this.keys.right = false;
            } else {
                this.keys.right = true;
                this.keys.left = false;
            }
            
            this.keys.up = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.up = false;
        });
        
        // Start button
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        this.restartButton.addEventListener('click', () => {
            this.reset();
        });
    },
    
    // Resize canvas to fit window
    resize() {
        const width = Math.min(window.innerWidth, CONFIG.WIDTH);
        const height = Math.min(window.innerHeight, CONFIG.HEIGHT);
        
        const scale = Math.min(width / CONFIG.WIDTH, height / CONFIG.HEIGHT);
        
        this.canvas.style.width = `${CONFIG.WIDTH * scale}px`;
        this.canvas.style.height = `${CONFIG.HEIGHT * scale}px`;
        
        // Set actual size in memory (scaled for retina displays)
        const scaleFactor = window.devicePixelRatio || 1;
        this.canvas.width = CONFIG.WIDTH * scaleFactor;
        this.canvas.height = CONFIG.HEIGHT * scaleFactor;
        
        // Scale the context to ensure correct drawing operations
        this.ctx.scale(scaleFactor, scaleFactor);
    },
    
    // Reset game state
    reset() {
        // Reset game state
        this.isRunning = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        
        // Reset stats
        this.stats = {
            snowflakesCollected: 0,
            obstaclesHit: 0,
            distanceTraveled: 0,
            maxSpeed: 0,
            currentCombo: 0,
            maxCombo: 0,
            lastSnowflakeTime: 0
        };
        
        // Reset camera
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            offsetX: 0,
            offsetY: 0,
            shakeTime: 0,
            shakeIntensity: 0
        };
        
        // Generate terrain
        this.terrain = Terrain.generate();
        
        // Create snowflakes
        this.snowflakes = [];
        for (let i = 0; i < CONFIG.SNOWFLAKES; i++) {
            this.snowflakes.push(new Snowflake());
        }
        
        // Create obstacles
        this.obstacles = [];
        for (let i = 0; i < CONFIG.OBSTACLES; i++) {
            this.spawnObstacle();
        }
        
        // Create snowball
        this.snowball = new Snowball(100, 100);
        
        // Clear particles
        this.particles = [];
        
        // Update UI
        this.updateUI();
        
        // Show start screen
        document.getElementById('start-screen').style.display = 'flex';
        this.gameOverElement.style.display = 'none';
    },
    
    // Start the game
    startGame() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // Hide start screen
        document.getElementById('start-screen').style.display = 'none';
        
        // Start game loop
        this.gameLoop();
    },
    
    // Game over
    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snowballHighScore', this.highScore);
        }
        
        // Show game over screen
        this.finalScoreElement.textContent = this.score;
        this.finalHighScoreElement.textContent = this.highScore;
        this.gameOverElement.style.display = 'flex';
        
        // Add final particles
        for (let i = 0; i < 50; i++) {
            this.addParticles(
                this.snowball.x + (Math.random() - 0.5) * 50,
                this.snowball.y + (Math.random() - 0.5) * 50,
                5,
                10,
                20,
                CONFIG.COLORS.SNOWBALL
            );
        }
    },
    
    // Toggle pause
    togglePause() {
        if (!this.isRunning || this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (!this.isPaused) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    },
    
    // Spawn a new obstacle
    spawnObstacle() {
        // Find a good y position on the terrain
        const x = CONFIG.WIDTH + Math.random() * 500;
        const terrainY = this.getTerrainHeight(x);
        
        // Create obstacle above the terrain
        const obstacle = new Obstacle(x, terrainY - 50);
        this.obstacles.push(obstacle);
    },
    
    // Get terrain height at x position
    getTerrainHeight(x) {
        if (this.terrain.length < 2) return CONFIG.HEIGHT * 0.7;
        
        // Find the segment that contains x
        for (let i = 1; i < this.terrain.length; i++) {
            if (x >= this.terrain[i-1].x && x <= this.terrain[i].x) {
                // Linear interpolation between points
                const t = (x - this.terrain[i-1].x) / (this.terrain[i].x - this.terrain[i-1].x);
                return this.terrain[i-1].y * (1 - t) + this.terrain[i].y * t;
            }
        }
        
        // If x is outside terrain, return last point's y
        return this.terrain[this.terrain.length - 1].y;
    },
    
    // Add particles
    addParticles(x, y, count, size, speed, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    },
    
    // Update UI
    updateUI() {
        if (!this.scoreElement) return;
        
        this.scoreElement.textContent = this.score;
        this.sizeElement.textContent = Math.floor(this.snowball.radius);
        this.highScoreElement.textContent = this.highScore;
    },
    
    // Main game loop
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Calculate delta time
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.update();
        
        // Draw everything
        this.draw();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    },
    
    // Update game state
    update() {
        if (this.isGameOver) return;
        
        // Update camera
        this.updateCamera();
        
        // Update terrain
        Terrain.update(this.terrain);
        
        // Update snowball
        this.snowball.update(this.deltaTime);
        
        // Check collision with terrain
        this.checkTerrainCollision();
        
        // Update snowflakes
        for (const flake of this.snowflakes) {
            flake.update();
            
            // Check collision with snowball
            const dx = flake.x - this.snowball.x;
            const dy = flake.y - this.snowball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.snowball.radius + flake.size / 2) {
                // Collect snowflake
                this.collectSnowflake(flake);
            }
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (!obstacle.update()) {
                // Remove if off screen
                this.obstacles.splice(i, 1);
                this.spawnObstacle();
                continue;
            }
            
            // Check collision with snowball
            if (obstacle.checkCollision(this.snowball.x, this.snowball.y, this.snowball.radius)) {
                if (this.snowball.hit()) {
                    // Game over
                    return;
                }
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Spawn new snowflakes if needed
        while (this.snowflakes.length < CONFIG.SNOWFLAKES) {
            this.snowflakes.push(new Snowflake());
        }
        
        // Update score based on distance
        this.distance += 1;
        if (this.distance % 10 === 0) {
            this.score += 1;
        }
        
        // Update UI
        this.updateUI();
    },
    
    // Update camera position
    updateCamera() {
        // Follow snowball with some lead room
        this.camera.targetX = this.snowball.x - CONFIG.WIDTH * 0.3;
        this.camera.targetY = this.snowball.y - CONFIG.HEIGHT * 0.5;
        
        // Smooth camera follow
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.05;
        
        // Apply camera shake
        if (this.camera.shakeTime > 0) {
            this.camera.shakeTime -= this.deltaTime * 1000; // Convert to ms
            this.camera.offsetX = (Math.random() - 0.5) * this.camera.shakeIntensity * 2;
            this.camera.offsetY = (Math.random() - 0.5) * this.camera.shakeIntensity * 2;
        } else {
            this.camera.offsetX = 0;
            this.camera.offsetY = 0;
        }
        
        // Keep camera within level bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.terrain[this.terrain.length-1].x - CONFIG.WIDTH * 0.7));
        this.camera.y = Math.max(0, Math.min(this.camera.y, CONFIG.HEIGHT * 0.5));
    },
    
    // Check collision with terrain
    checkTerrainCollision() {
        if (this.terrain.length < 2) return;
        
        // Find the segment the snowball is on
        for (let i = 1; i < this.terrain.length; i++) {
            if (this.snowball.x >= this.terrain[i-1].x && this.snowball.x <= this.terrain[i].x) {
                // Get terrain height at snowball's x position
                const t = (this.snowball.x - this.terrain[i-1].x) / (this.terrain[i].x - this.terrain[i-1].x);
                const terrainY = this.terrain[i-1].y * (1 - t) + this.terrain[i].y * t;
                
                // Check if snowball is below terrain
                if (this.snowball.y + this.snowball.radius > terrainY) {
                    // Collision detected
                    this.snowball.y = terrainY - this.snowball.radius;
                    this.snowball.vy = 0;
                    this.snowball.isOnGround = true;
                    
                    // Add some particles when landing
                    if (Math.abs(this.snowball.vy) > 2) {
                        this.addParticles(
                            this.snowball.x,
                            this.snowball.y + this.snowball.radius,
                            5,
                            2,
                            5,
                            CONFIG.COLORS.SNOW
                        );
                    }
                } else {
                    this.snowball.isOnGround = false;
                }
                
                break;
            }
        }
    },
    
    // Collect a snowflake
    collectSnowflake(flake) {
        // Remove the snowflake
        const index = this.snowflakes.indexOf(flake);
        if (index > -1) {
            this.snowflakes.splice(index, 1);
        }
        
        // Grow snowball
        this.snowball.grow(0.5);
        
        // Add score
        this.score += CONFIG.SNOWFLAKE_POINTS * (1 + this.stats.currentCombo * 0.1);
        
        // Update combo
        this.stats.currentCombo++;
        this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.currentCombo);
        this.stats.lastSnowflakeTime = Date.now();
        
        // Add particles
        this.addParticles(
            flake.x,
            flake.y,
            10,
            2,
            5,
            CONFIG.COLORS.SNOW
        );
    },
    
    // Draw everything
    draw() {
        // Save context
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(
            Math.floor(-this.camera.x - this.camera.offsetX),
            Math.floor(-this.camera.y - this.camera.offsetY)
        );
        
        // Draw sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
        skyGradient.addColorStop(1, '#1E90FF'); // Dodger blue
        
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, CONFIG.WIDTH * 2, CONFIG.HEIGHT);
        
        // Draw distant mountains
        this.drawMountains();
        
        // Draw terrain
        Terrain.draw(this.ctx, this.terrain);
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }
        
        // Draw snowflakes
        for (const flake of this.snowflakes) {
            flake.draw(this.ctx);
        }
        
        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw snowball (on top of everything else)
        this.snowball.draw(this.ctx);
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI (always on top)
        this.drawUI();
    },
    
    // Draw distant mountains
    drawMountains() {
        const mountainCount = 5;
        const mountainWidth = CONFIG.WIDTH * 2 / mountainCount;
        
        for (let i = 0; i < mountainCount; i++) {
            const x = i * mountainWidth + (this.camera.x * 0.2) % mountainWidth - mountainWidth;
            const height = 150 + Math.sin(i * 100) * 30;
            
            this.ctx.fillStyle = i % 2 === 0 ? '#4682B4' : '#5F9EA0'; // SteelBlue / CadetBlue
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, CONFIG.HEIGHT);
            this.ctx.lineTo(x + mountainWidth * 0.5, CONFIG.HEIGHT - height);
            this.ctx.lineTo(x + mountainWidth, CONFIG.HEIGHT);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Snow caps
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.moveTo(x + mountainWidth * 0.3, CONFIG.HEIGHT - height * 0.7);
            this.ctx.lineTo(x + mountainWidth * 0.5, CONFIG.HEIGHT - height);
            this.ctx.lineTo(x + mountainWidth * 0.7, CONFIG.HEIGHT - height * 0.7);
            this.ctx.closePath();
            this.ctx.fill();
        }
    },
    
    // Draw UI
    drawUI() {
        // Score display
        this.ctx.fillStyle = 'rgba(15, 56, 15, 0.8)';
        this.ctx.strokeStyle = CONFIG.COLORS.UI_BORDER;
        this.ctx.lineWidth = 2;
        
        // Score background
        this.ctx.beginPath();
        this.ctx.roundRect(10, 10, 200, 60, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Score text
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 16px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 35);
        this.ctx.fillText(`SIZE: ${Math.floor(this.snowball.radius)}`, 20, 55);
        
        // Combo meter (if combo > 0)
        if (this.stats.currentCombo > 0) {
            const comboTimeLeft = 2000 - (Date.now() - this.stats.lastSnowflakeTime);
            const comboPercent = Math.max(0, comboTimeLeft / 2000);
            
            if (comboTimeLeft > 0) {
                // Combo background
                this.ctx.fillStyle = 'rgba(15, 56, 15, 0.8)';
                this.ctx.beginPath();
                this.ctx.roundRect(10, 80, 200, 30, 5);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Combo text
                this.ctx.fillStyle = '#FFD700'; // Gold
                this.ctx.fillText(`COMBO x${this.stats.currentCombo}`, 20, 100);
                
                // Combo meter
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                this.ctx.fillRect(20, 110, 180 * comboPercent, 5);
            } else {
                // Combo ended
                this.stats.currentCombo = 0;
            }
        }
    }
};

// ===== GAME OBJECTS =====

// ===== GAME OBJECTS =====
class Snowball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.SNOWBALL.START_RADIUS;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.isOnGround = false;
        this.isInvulnerable = false;
        this.lastHit = 0;
    }
    
    update(deltaTime) {
        // Apply gravity
        this.vy += CONFIG.GRAVITY;
        
        // Apply air resistance
        this.vx *= CONFIG.AIR_RESISTANCE;
        this.vy *= CONFIG.AIR_RESISTANCE;
        
        // Handle input
        if (Game.keys.left) {
            this.vx = Math.max(this.vx - CONFIG.SNOWBALL.CONTROL_FORCE, -CONFIG.SNOWBALL.MAX_SPEED);
        }
        if (Game.keys.right) {
            this.vx = Math.min(this.vx + CONFIG.SNOWBALL.CONTROL_FORCE, CONFIG.SNOWBALL.MAX_SPEED);
        }
        
        // Jump
        if ((Game.keys.up || Game.keys.space) && this.isOnGround) {
            this.vy = CONFIG.SNOWBALL.JUMP_FORCE * (this.radius / CONFIG.SNOWBALL.START_RADIUS);
            this.isOnGround = false;
            // Add jump particles
            Game.addParticles(this.x, this.y + this.radius, 5, 2, 5, CONFIG.COLORS.SNOWBALL);
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update rotation based on horizontal movement
        this.rotation += this.vx * 0.05;
        
        // Keep on screen (horizontal)
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -CONFIG.BOUNCE;
        } else if (this.x + this.radius > CONFIG.WIDTH) {
            this.x = CONFIG.WIDTH - this.radius;
            this.vx *= -CONFIG.BOUNCE;
        }
        
        // Check if invulnerability has worn off
        if (this.isInvulnerable && Date.now() - this.lastHit > CONFIG.INVULNERABILITY_TIME) {
            this.isInvulnerable = false;
        }
        
        // Update stats
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        Game.stats.maxSpeed = Math.max(Game.stats.maxSpeed, speed);
    }
    
    draw(ctx) {
        // Draw shadow
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
            this.x - Game.camera.x, 
            this.y - Game.camera.y + this.radius * 0.3, 
            this.radius * 1.1, 
            this.radius * 0.3, 
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.restore();
        
        // Draw snowball
        ctx.save();
        ctx.translate(this.x - Game.camera.x, this.y - Game.camera.y);
        ctx.rotate(this.rotation);
        
        // Main circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        
        // Create gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, 
            -this.radius * 0.3, 
            0, 
            -this.radius * 0.3, 
            -this.radius * 0.3, 
            this.radius * 1.5
        );
        gradient.addColorStop(0, CONFIG.COLORS.SNOWBALL);
        gradient.addColorStop(1, CONFIG.COLORS.SNOWBALL_SHADOW);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add some snow texture
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * this.radius * 0.7;
            const y = Math.sin(angle) * this.radius * 0.7;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add highlight
        ctx.beginPath();
        ctx.arc(
            -this.radius * 0.3, 
            -this.radius * 0.3, 
            this.radius * 0.3, 
            0, 
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // Draw invulnerability effect
        if (this.isInvulnerable) {
            const blink = Math.sin(Date.now() * 0.02) > 0;
            if (blink) {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 1.2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    grow(amount) {
        this.radius = Math.min(this.radius + amount, CONFIG.SNOWBALL.MAX_RADIUS);
        return this.radius;
    }
    
    shrink(amount) {
        this.radius = Math.max(this.radius - amount, CONFIG.SNOWBALL.MIN_RADIUS);
        return this.radius;
    }
    
    hit() {
        if (this.isInvulnerable) return false;
        
        this.isInvulnerable = true;
        this.lastHit = Date.now();
        this.shrink(CONFIG.SNOWBALL.SHRINK_AMOUNT);
        
        // Screen shake
        Game.camera.shakeTime = 300;
        Game.camera.shakeIntensity = 5;
        
        // Reset combo
        Game.stats.currentCombo = 0;
        
        // Add hit particles
        Game.addParticles(this.x, this.y, 10, this.radius * 0.5, 10, CONFIG.COLORS.OBSTACLE);
        
        // Check if game over
        if (this.radius <= CONFIG.SNOWBALL.MIN_RADIUS) {
            Game.gameOver();
            return true;
        }
        
        return false;
    }
}

// ===== TERRAIN GENERATION =====
// ===== SNOWFLAKE CLASS =====
class Snowflake {
    constructor(x, y) {
        this.x = x || Math.random() * CONFIG.WIDTH;
        this.y = y || -10;
        this.size = Math.random() * 3 + 2;
        this.speed = Math.random() * 2 + 1;
        this.amplitude = Math.random() * 2 + 1;
        this.frequency = Math.random() * 0.02 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.5 + 0.5;
    }
    
    update() {
        // Move down
        this.y += this.speed;
        
        // Sway side to side
        this.angle += this.frequency;
        this.x += Math.sin(this.angle) * this.amplitude;
        
        // Reset if off screen
        if (this.y > CONFIG.HEIGHT + 10) {
            this.y = -10;
            this.x = Math.random() * CONFIG.WIDTH;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw snowflake (simple star shape)
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(0, this.size * 0.4);
            ctx.lineTo(0, 0);
            ctx.rotate(Math.PI * 0.4);
            ctx.lineTo(0, this.size * 0.6);
            ctx.lineTo(0, 0);
            ctx.rotate(Math.PI * 0.6);
        }
        
        ctx.fillStyle = CONFIG.COLORS.SNOW;
        ctx.translate(this.x - Game.camera.x, this.y - Game.camera.y);
        ctx.fill();
        ctx.restore();
    }
}

// ===== OBSTACLE CLASS =====
class Obstacle {
    constructor(x, y) {
        this.x = x || CONFIG.WIDTH + 50;
        this.y = y || CONFIG.HEIGHT * 0.7;
        this.width = Math.random() * 30 + 20;
        this.height = Math.random() * 30 + 20;
        this.type = Math.floor(Math.random() * 3); // 0: rock, 1: tree, 2: snowman
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.bounce = 0;
        this.bounceDirection = 1;
    }
    
    update() {
        // Move left with the terrain
        this.x -= 2;
        
        // Bounce effect
        this.bounce += 0.1 * this.bounceDirection;
        if (Math.abs(this.bounce) > 3) {
            this.bounceDirection *= -1;
        }
        
        // Rotate
        this.rotation += this.rotationSpeed;
        
        // Check if off screen
        if (this.x + this.width < Game.camera.x) {
            return false; // Mark for removal
        }
        
        return true;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(
            this.x + this.width / 2 - Game.camera.x, 
            this.y - this.height / 2 + this.bounce - Game.camera.y
        );
        
        ctx.rotate(this.rotation);
        
        switch (this.type) {
            case 0: // Rock
                this.drawRock(ctx);
                break;
            case 1: // Tree
                this.drawTree(ctx);
                break;
            case 2: // Snowman
                this.drawSnowman(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    drawRock(ctx) {
        // Rock shape (irregular polygon)
        ctx.beginPath();
        ctx.moveTo(0, -this.height * 0.4);
        ctx.lineTo(this.width * 0.4, -this.height * 0.2);
        ctx.lineTo(this.width * 0.3, this.height * 0.3);
        ctx.lineTo(-this.width * 0.2, this.height * 0.4);
        ctx.lineTo(-this.width * 0.3, 0);
        ctx.closePath();
        
        // Rock gradient
        const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        gradient.addColorStop(0, '#555555');
        gradient.addColorStop(1, '#222222');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Rock details
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawTree(ctx) {
        // Tree trunk
        ctx.fillStyle = '#5E2C04';
        ctx.fillRect(
            -this.width * 0.1, 
            -this.height * 0.3, 
            this.width * 0.2, 
            this.height * 0.6
        );
        
        // Tree top (triangle)
        ctx.beginPath();
        ctx.moveTo(0, -this.height * 0.5);
        ctx.lineTo(-this.width * 0.4, this.height * 0.1);
        ctx.lineTo(this.width * 0.4, this.height * 0.1);
        ctx.closePath();
        
        // Tree gradient
        const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
        gradient.addColorStop(0, '#1A5F1A');
        gradient.addColorStop(1, '#0A3A0A');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Tree details
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawSnowman(ctx) {
        // Bottom circle
        ctx.beginPath();
        ctx.arc(0, this.height * 0.2, this.width * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.COLORS.SNOWBALL;
        ctx.fill();
        
        // Middle circle
        ctx.beginPath();
        ctx.arc(0, -this.height * 0.1, this.width * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc(0, -this.height * 0.3, this.width * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes and buttons
        ctx.fillStyle = '#000';
        
        // Eyes
        ctx.beginPath();
        ctx.arc(-this.width * 0.05, -this.height * 0.32, 2, 0, Math.PI * 2);
        ctx.arc(this.width * 0.05, -this.height * 0.32, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Buttons
        ctx.beginPath();
        ctx.arc(0, -this.height * 0.2, 2, 0, Math.PI * 2);
        ctx.arc(0, -this.height * 0.1, 2, 0, Math.PI * 2);
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose (carrot)
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.width * 0.05, -this.height * 0.3);
        ctx.lineTo(this.width * 0.15, -this.height * 0.3);
        ctx.lineTo(this.width * 0.05, -this.height * 0.25);
        ctx.closePath();
        ctx.fill();
    }
    
    checkCollision(x, y, radius) {
        // Simple circle-rectangle collision
        const closestX = Math.max(this.x - this.width/2, Math.min(x, this.x + this.width/2));
        const closestY = Math.max(this.y - this.height/2, Math.min(y, this.y + this.height/2));
        
        const distanceX = x - closestX;
        const distanceY = y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
    }
}

// ===== PARTICLE CLASS =====
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * -2 - 1;
        this.color = color || CONFIG.COLORS.SNOW;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.gravity = 0.1;
        this.friction = 0.98;
    }
    
    update() {
        this.speedX *= this.friction;
        this.speedY = (this.speedY + this.gravity) * this.friction;
        
        this.x += this.speedX;
        this.y += this.speedY;
        
        this.life -= this.decay;
        
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x - Game.camera.x, 
            this.y - Game.camera.y, 
            this.size, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
}

// ===== TERRAIN CLASS =====
class Terrain {
    static generate() {
        const terrain = [];
        const segments = Math.ceil(CONFIG.WIDTH / CONFIG.TERRAIN.SEGMENT_LENGTH) + 2;
        let lastY = CONFIG.HEIGHT * 0.7;
        let lastSlope = 0;
        
        for (let i = 0; i < segments; i++) {
            // Generate new point with some randomness
            let x = i * CONFIG.TERRAIN.SEGMENT_LENGTH;
            
            // Calculate new y with Perlin-like noise
            const noise = Math.sin(x * CONFIG.TERRAIN.DETAIL) * CONFIG.TERRAIN.AMPLITUDE;
            let y = CONFIG.HEIGHT * 0.7 + noise;
            
            // Ensure we don't have too steep slopes
            const slope = (y - lastY) / CONFIG.TERRAIN.SEGMENT_LENGTH;
            if (slope < CONFIG.TERRAIN.MIN_SLOPE) {
                y = lastY + CONFIG.TERRAIN.MIN_SLOPE * CONFIG.TERRAIN.SEGMENT_LENGTH;
            } else if (slope > CONFIG.TERRAIN.MAX_SLOPE) {
                y = lastY + CONFIG.TERRAIN.MAX_SLOPE * CONFIG.TERRAIN.SEGMENT_LENGTH;
            }
            
            // Ensure we stay within bounds
            y = Math.max(CONFIG.HEIGHT * 0.3, Math.min(CONFIG.HEIGHT * 0.9, y));
            
            terrain.push({ x, y });
            lastY = y;
            lastSlope = slope;
        }
        
        return terrain;
    }
    
    static update(terrain) {
        // Remove segments that are off screen to the left
        while (terrain.length > 0 && terrain[1].x < Game.camera.x - CONFIG.TERRAIN.SEGMENT_LENGTH * 2) {
            terrain.shift();
        }
        
        // Add new segments to the right
        const lastSegment = terrain[terrain.length - 1];
        if (lastSegment.x < Game.camera.x + CONFIG.WIDTH + CONFIG.TERRAIN.SEGMENT_LENGTH * 2) {
            const noise = Math.sin(lastSegment.x * CONFIG.TERRAIN.DETAIL) * CONFIG.TERRAIN.AMPLITUDE;
            let y = CONFIG.HEIGHT * 0.7 + noise;
            
            // Ensure we don't have too steep slopes
            const lastY = terrain[terrain.length - 1].y;
            const slope = (y - lastY) / CONFIG.TERRAIN.SEGMENT_LENGTH;
            
            if (slope < CONFIG.TERRAIN.MIN_SLOPE) {
                y = lastY + CONFIG.TERRAIN.MIN_SLOPE * CONFIG.TERRAIN.SEGMENT_LENGTH;
            } else if (slope > CONFIG.TERRAIN.MAX_SLOPE) {
                y = lastY + CONFIG.TERRAIN.MAX_SLOPE * CONFIG.TERRAIN.SEGMENT_LENGTH;
            }
            
            // Ensure we stay within bounds
            y = Math.max(CONFIG.HEIGHT * 0.3, Math.min(CONFIG.HEIGHT * 0.9, y));
            
            terrain.push({
                x: lastSegment.x + CONFIG.TERRAIN.SEGMENT_LENGTH,
                y: y
            });
        }
    }
    
    static draw(ctx, terrain) {
        if (terrain.length < 2) return;
        
        // Draw ground
        ctx.beginPath();
        ctx.moveTo(terrain[0].x - Game.camera.x, CONFIG.HEIGHT);
        
        for (let i = 0; i < terrain.length; i++) {
            const point = terrain[i];
            if (i === 0) {
                ctx.lineTo(point.x - Game.camera.x, point.y - Game.camera.y);
            } else {
                // Create smooth curve through points
                const prev = terrain[i - 1];
                const cpx = (prev.x + point.x) / 2;
                const cpy = (prev.y + point.y) / 2;
                
                ctx.quadraticCurveTo(
                    prev.x - Game.camera.x,
                    prev.y - Game.camera.y,
                    cpx - Game.camera.x,
                    cpy - Game.camera.y
                );
            }
        }
        
        // Complete the path
        const last = terrain[terrain.length - 1];
        ctx.lineTo(last.x - Game.camera.x, CONFIG.HEIGHT);
        ctx.closePath();
        
        // Create gradient for terrain
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        gradient.addColorStop(0, CONFIG.COLORS.TERRAIN);
        gradient.addColorStop(1, CONFIG.COLORS.TERRAIN_SHADOW);
        
        // Fill terrain
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw terrain outline
        ctx.beginPath();
        for (let i = 0; i < terrain.length; i++) {
            const point = terrain[i];
            if (i === 0) {
                ctx.moveTo(point.x - Game.camera.x, point.y - Game.camera.y);
            } else {
                // Create smooth curve through points
                const prev = terrain[i - 1];
                const cpx = (prev.x + point.x) / 2;
                const cpy = (prev.y + point.y) / 2;
                
                ctx.quadraticCurveTo(
                    prev.x - Game.camera.x,
                    prev.y - Game.camera.y,
                    cpx - Game.camera.x,
                    cpy - Game.camera.y
                );
            }
        }
        
        // Draw terrain edge
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
