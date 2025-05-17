/**
 * ██████╗  █████╗ ████████╗ █████╗  ██████╗██╗     ███████╗     ██████╗ ███████╗███╗   ██╗███████╗██████╗  █████╗ ████████╗ ██████╗ ██████╗ 
 * ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔════╝██║     ██╔════╝    ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
 * ██████╔╝███████║   ██║   ███████║██║     ██║     █████╗      ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ██████╔╝███████║   ██║   ██║   ██║██████╔╝
 * ██╔═══╝ ██╔══██║   ██║   ██╔══██║██║     ██║     ██╔══╝      ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║   ██║   ██║   ██║██╔══██╗
 * ██║     ██║  ██║   ██║   ██║  ██║╚██████╗███████╗███████╗    ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║  ██║   ██║   ╚██████╔╝██║  ██║
 * ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝     ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
 * 
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX OBSTACLE GENERATION SYSTEM v2.7.4 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module handles the generation and management of obstacles and collectibles.
 * It uses procedural generation to create a dynamic, endless game environment.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: ALPHA-3
 */

'use strict';

/**
 * ObstacleGenerator class for creating and managing game obstacles
 */
class ObstacleGenerator {
    /**
     * Create a new obstacle generator
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.config = GameConfig.spawn;
        
        // Collections for game objects
        this.obstacles = [];
        this.snowPatches = [];
        
        // Tracking variables
        this.lastObstacleY = 0;
        this.speed = this.config.initialSpeed;
        this.nextObstacleDistance = this.getRandomObstacleDistance();
        this.distanceTraveled = 0;
        
        // Seeded random generator for consistent obstacle patterns
        this.seed = Date.now();
        
        // Initialize random obstacles and snow
        this.generateInitialObjects();
    }
    
    /**
     * Get a seeded random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number between min and max
     */
    seededRandom(min, max) {
        // Simple LCG random number generator
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        
        return min + rnd * (max - min);
    }
    
    /**
     * Generate initial obstacles and snow patches
     */
    generateInitialObjects() {
        // Generate initial obstacles
        for (let i = 0; i < 5; i++) {
            this.generateObstacle(this.game.canvas.height * (0.3 + i * 0.15));
        }
        
        // Generate initial snow patches
        for (let i = 0; i < 10; i++) {
            this.generateSnowPatch();
        }
    }
    
    /**
     * Update obstacles and snow patches
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Increase speed over time
        this.updateSpeed(deltaTime);
        
        // Move obstacles and remove those that are off-screen
        this.updateObstacles(deltaTime);
        
        // Move snow patches and remove those that are off-screen
        this.updateSnowPatches(deltaTime);
        
        // Generate new obstacles as needed
        this.generateNewObstacles();
        
        // Generate new snow patches as needed
        this.ensureSnowPatchCount();
    }
    
    /**
     * Increase scroll speed over time
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateSpeed(deltaTime) {
        // Gradually increase speed up to maximum
        if (this.speed < this.config.maxSpeed) {
            this.speed += this.config.speedIncrease * deltaTime;
            
            // Clamp to maximum speed
            if (this.speed > this.config.maxSpeed) {
                this.speed = this.config.maxSpeed;
            }
        }
        
        // Also increase speed based on score milestones if enabled
        if (GameConfig.scoring.levelProgression && this.game.score) {
            const milestones = GameConfig.scoring.scoreMilestones;
            for (let i = 0; i < milestones.length; i++) {
                // Add speed boost at each milestone
                if (this.game.score > milestones[i] && this.game.score - this.game.lastScoreIncrease <= milestones[i]) {
                    this.speed += 0.2;
                    
                    // Show level up message
                    this.game.showMessage("LEVEL UP!", 2000);
                    break;
                }
            }
        }
    }
    
    /**
     * Update and move obstacles
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateObstacles(deltaTime) {
        // Move all obstacles upward based on speed
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle
            obstacle.position.y -= this.speed;
            
            // Remove if off-screen
            if (obstacle.position.y < -obstacle.radius * 2) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Check collision with player snowball
            if (this.game.snowball && this.game.snowball.checkCollision(obstacle)) {
                // Collision detected - reduce snowball size
                const survived = this.game.snowball.shrink(obstacle.damage);
                
                // Create "explosion" particle effect at collision point
                this.game.particleSystem.createExplosion(
                    obstacle.position.x,
                    obstacle.position.y,
                    obstacle.color,
                    10 + obstacle.radius
                );
                
                // Remove obstacle after collision
                this.obstacles.splice(i, 1);
                
                // Check if snowball is too small now
                if (!survived) {
                    this.game.gameOver();
                }
            }
        }
        
        // Track distance traveled for obstacle generation
        this.distanceTraveled += this.speed;
    }
    
    /**
     * Update and move snow patches
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateSnowPatches(deltaTime) {
        // Move all snow patches upward based on speed
        for (let i = this.snowPatches.length - 1; i >= 0; i--) {
            const snow = this.snowPatches[i];
            
            // Move snow patch
            snow.position.y -= this.speed;
            
            // Remove if off-screen
            if (snow.position.y < -snow.radius * 2) {
                this.snowPatches.splice(i, 1);
                continue;
            }
            
            // Check collision with player snowball
            if (this.game.snowball && this.game.snowball.checkCollision(snow)) {
                // Collision detected - increase snowball size
                this.game.snowball.grow(snow.value);
                
                // Create "collection" particle effect
                this.game.particleSystem.createCollection(
                    snow.position.x,
                    snow.position.y,
                    GameConfig.render.snowColor,
                    snow.radius
                );
                
                // Increase score
                this.game.addScore(snow.value * (1 + GameConfig.scoring.sizeMultiplier * this.game.snowball.size / 10));
                
                // Remove snow patch after collection
                this.snowPatches.splice(i, 1);
            }
        }
    }
    
    /**
     * Generate new obstacles when needed
     */
    generateNewObstacles() {
        // Check if it's time to spawn a new obstacle
        if (this.distanceTraveled >= this.nextObstacleDistance) {
            // Reset distance and get next spawn distance
            this.distanceTraveled = 0;
            this.nextObstacleDistance = this.getRandomObstacleDistance();
            
            // Generate new obstacle at bottom of screen
            this.generateObstacle(this.game.canvas.height + 50);
        }
    }
    
    /**
     * Ensure there are enough snow patches on screen
     */
    ensureSnowPatchCount() {
        // Keep a minimum number of snow patches based on density
        const targetCount = Math.floor(this.config.snowDensity * (1 + this.game.difficulty * 0.2));
        
        while (this.snowPatches.length < targetCount) {
            this.generateSnowPatch();
        }
    }
    
    /**
     * Generate a random obstacle
     * @param {number} y - Y position for the obstacle
     */
    generateObstacle(y) {
        // Choose obstacle type
        const typeIndex = Math.floor(this.seededRandom(0, this.config.obstacleTypes.length));
        const type = this.config.obstacleTypes[typeIndex];
        
        // Determine base size based on type
        let baseSize, color, damage;
        
        switch (type) {
            case 'rock':
                baseSize = 20;
                color = GameConfig.render.obstacleColors.rock;
                damage = 2;
                break;
            case 'tree':
                baseSize = 25;
                color = GameConfig.render.obstacleColors.tree;
                damage = 3;
                break;
            case 'house':
                baseSize = 40;
                color = GameConfig.render.obstacleColors.house;
                damage = 5;
                break;
            case 'fence':
                baseSize = 15;
                color = GameConfig.render.obstacleColors.fence;
                damage = 1;
                break;
            default:
                baseSize = 20;
                color = GameConfig.render.obstacleColors.rock;
                damage = 2;
        }
        
        // Randomize size within variance
        const sizeVariance = baseSize * this.config.obstacleSizeVariance;
        const radius = baseSize + this.seededRandom(-sizeVariance, sizeVariance);
        
        // Randomize x position, avoid edges
        const minX = radius + 10;
        const maxX = this.game.canvas.width - radius - 10;
        const x = this.seededRandom(minX, maxX);
        
        // Create the obstacle
        const obstacle = {
            position: new Vector2(x, y),
            velocity: new Vector2(0, 0),
            radius: radius,
            type: type,
            color: color,
            damage: damage,
            rotation: this.seededRandom(0, Math.PI * 2),
            vertices: this.generateObstacleVertices(type, radius)
        };
        
        // Add to obstacles array
        this.obstacles.push(obstacle);
        
        // Update last obstacle position
        this.lastObstacleY = y;
    }
    
    /**
     * Generate vertices for vector-based obstacle rendering
     * @param {string} type - Type of obstacle
     * @param {number} radius - Size of obstacle
     * @returns {Array} Array of vertices
     */
    generateObstacleVertices(type, radius) {
        const vertices = [];
        
        switch (type) {
            case 'rock':
                // Create jagged rock shape
                const rockPoints = 7;
                for (let i = 0; i < rockPoints; i++) {
                    const angle = (i / rockPoints) * Math.PI * 2;
                    const radiusVariance = 0.3; // 30% variance
                    const r = radius * (1 - radiusVariance / 2 + this.seededRandom(0, radiusVariance));
                    vertices.push({
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r
                    });
                }
                break;
            
            case 'tree':
                // Triangle shape for tree
                vertices.push({ x: 0, y: -radius * 1.2 }); // Top
                vertices.push({ x: -radius * 0.8, y: radius * 0.4 }); // Bottom left
                vertices.push({ x: radius * 0.8, y: radius * 0.4 }); // Bottom right
                // Tree trunk
                vertices.push({ x: radius * 0.2, y: radius * 0.4 });
                vertices.push({ x: radius * 0.2, y: radius * 0.8 });
                vertices.push({ x: -radius * 0.2, y: radius * 0.8 });
                vertices.push({ x: -radius * 0.2, y: radius * 0.4 });
                break;
            
            case 'house':
                // House shape
                vertices.push({ x: -radius * 0.8, y: -radius * 0.2 }); // Roof left
                vertices.push({ x: 0, y: -radius * 0.8 }); // Roof peak
                vertices.push({ x: radius * 0.8, y: -radius * 0.2 }); // Roof right
                vertices.push({ x: radius * 0.8, y: radius * 0.8 }); // Bottom right
                vertices.push({ x: -radius * 0.8, y: radius * 0.8 }); // Bottom left
                break;
            
            case 'fence':
                // Fence shape
                vertices.push({ x: -radius * 0.8, y: -radius * 0.6 }); // Top left
                vertices.push({ x: radius * 0.8, y: -radius * 0.6 }); // Top right
                vertices.push({ x: radius * 0.8, y: -radius * 0.2 }); // Upper right
                vertices.push({ x: -radius * 0.8, y: -radius * 0.2 }); // Upper left
                // Posts
                vertices.push({ x: -radius * 0.6, y: -radius * 0.2 });
                vertices.push({ x: -radius * 0.4, y: -radius * 0.2 });
                vertices.push({ x: -radius * 0.4, y: radius * 0.8 });
                vertices.push({ x: -radius * 0.6, y: radius * 0.8 });
                
                vertices.push({ x: radius * 0.4, y: -radius * 0.2 });
                vertices.push({ x: radius * 0.6, y: -radius * 0.2 });
                vertices.push({ x: radius * 0.6, y: radius * 0.8 });
                vertices.push({ x: radius * 0.4, y: radius * 0.8 });
                break;
            
            default:
                // Fallback to circle
                const points = 8;
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    vertices.push({
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius
                    });
                }
        }
        
        return vertices;
    }
    
    /**
     * Generate a random snow patch
     */
    generateSnowPatch() {
        // Random size
        const radius = 5 + Math.random() * 10;
        
        // Random position, avoid edges
        const minX = radius + 10;
        const maxX = this.game.canvas.width - radius - 10;
        const x = minX + Math.random() * (maxX - minX);
        
        // Position below screen or randomly on screen for initial generation
        let y;
        if (this.snowPatches.length < 5) {
            // Initial generation - place throughout screen
            y = Math.random() * this.game.canvas.height;
        } else {
            // Normal generation - place below screen
            y = this.game.canvas.height + radius + Math.random() * 50;
        }
        
        // Create snow patch with random value proportional to size
        const value = Math.ceil(radius / 3);
        
        // Create the snow patch
        const snowPatch = {
            position: new Vector2(x, y),
            radius: radius,
            value: value,
            pulse: Math.random() * Math.PI * 2, // For visual effect
            vertices: this.generateSnowVertices(radius)
        };
        
        // Add to snow patches array
        this.snowPatches.push(snowPatch);
    }
    
    /**
     * Generate vertices for vector-based snow rendering
     * @param {number} radius - Size of snow patch
     * @returns {Array} Array of vertices
     */
    generateSnowVertices(radius) {
        const vertices = [];
        const points = 8;
        
        // Create slightly irregular circle for snow
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radiusVariance = 0.2; // 20% variance
            const r = radius * (1 - radiusVariance / 2 + Math.random() * radiusVariance);
            vertices.push({
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r
            });
        }
        
        return vertices;
    }
    
    /**
     * Get random distance between obstacles
     * @returns {number} Distance value
     */
    getRandomObstacleDistance() {
        // Base distance based on config
        const min = this.config.minObstacleDistance;
        const max = this.config.maxObstacleDistance;
        
        // Adjust based on current speed
        const speedFactor = this.speed / this.config.initialSpeed;
        const adjustedMin = min / speedFactor;
        const adjustedMax = max / speedFactor;
        
        // Random distance
        return adjustedMin + Math.random() * (adjustedMax - adjustedMin);
    }
    
    /**
     * Render all obstacles and snow patches
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Render snow patches
        this.renderSnowPatches(ctx);
        
        // Render obstacles
        this.renderObstacles(ctx);
    }
    
    /**
     * Render obstacles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderObstacles(ctx) {
        this.obstacles.forEach(obstacle => {
            ctx.save();
            ctx.translate(obstacle.position.x, obstacle.position.y);
            ctx.rotate(obstacle.rotation);
            
            // Draw shadow if enabled
            if (GameConfig.render.shadowsEnabled) {
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                
                // Draw filled shape with shadow
                ctx.beginPath();
                if (obstacle.vertices && obstacle.vertices.length > 0) {
                    // Draw polygon shape if vertices are defined
                    ctx.moveTo(obstacle.vertices[0].x, obstacle.vertices[0].y);
                    for (let i = 1; i < obstacle.vertices.length; i++) {
                        ctx.lineTo(obstacle.vertices[i].x, obstacle.vertices[i].y);
                    }
                    ctx.closePath();
                } else {
                    // Fallback to circle
                    ctx.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.restore();
            }
            
            // Draw filled shape
            ctx.fillStyle = obstacle.color;
            ctx.beginPath();
            if (obstacle.vertices && obstacle.vertices.length > 0) {
                // Draw polygon shape if vertices are defined
                ctx.moveTo(obstacle.vertices[0].x, obstacle.vertices[0].y);
                for (let i = 1; i < obstacle.vertices.length; i++) {
                    ctx.lineTo(obstacle.vertices[i].x, obstacle.vertices[i].y);
                }
                ctx.closePath();
            } else {
                // Fallback to circle
                ctx.arc(0, 0, obstacle.radius, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = GameConfig.render.outlineWidth;
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    /**
     * Render snow patches
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSnowPatches(ctx) {
        this.snowPatches.forEach(snow => {
            ctx.save();
            ctx.translate(snow.position.x, snow.position.y);
            
            // Pulse animation
            snow.pulse += 0.05;
            const scale = 1 + Math.sin(snow.pulse) * 0.1;
            ctx.scale(scale, scale);
            
            // Draw glow effect if enabled
            if (GameConfig.render.glowEffects) {
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.globalAlpha = 0.7 + Math.sin(snow.pulse) * 0.3;
            }
            
            // Draw snow patch
            ctx.fillStyle = GameConfig.render.snowColor;
            ctx.beginPath();
            if (snow.vertices && snow.vertices.length > 0) {
                // Draw polygon shape if vertices are defined
                ctx.moveTo(snow.vertices[0].x, snow.vertices[0].y);
                for (let i = 1; i < snow.vertices.length; i++) {
                    ctx.lineTo(snow.vertices[i].x, snow.vertices[i].y);
                }
                ctx.closePath();
            } else {
                // Fallback to circle
                ctx.arc(0, 0, snow.radius, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = GameConfig.render.outlineWidth * 0.7;
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    /**
     * Reset the obstacle generator
     */
    reset() {
        this.obstacles = [];
        this.snowPatches = [];
        this.speed = this.config.initialSpeed;
        this.distanceTraveled = 0;
        this.lastObstacleY = 0;
        this.nextObstacleDistance = this.getRandomObstacleDistance();
        
        // Generate initial obstacles and snow
        this.generateInitialObjects();
    }
}

// Export the ObstacleGenerator class
window.ObstacleGenerator = ObstacleGenerator;
