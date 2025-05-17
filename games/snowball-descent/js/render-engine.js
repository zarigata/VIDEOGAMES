/**
 * ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗     ███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
 * ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗    ██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
 * ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝    █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  
 * ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗    ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  
 * ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║    ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
 * ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
 * 
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX VECTOR RENDERING SYSTEM v2.9.1 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module provides all rendering functionality for the vector-based Snowball Descent game.
 * It handles drawing all game elements using vector graphics only, without any images or sprites.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: EPSILON-4
 */

'use strict';

/**
 * TerrainGenerator class for procedural terrain
 */
class TerrainGenerator {
    /**
     * Create a new terrain generator
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.config = GameConfig.terrain;
        this.renderConfig = GameConfig.render;
        
        // Terrain segments
        this.segments = [];
        
        // Tracking variables
        this.lastX = 0;
        this.lastY = 0;
        this.totalScroll = 0;
        
        // Noise seed for Perlin noise
        this.noiseSeed = Math.random() * 1000;
        
        // Initialize terrain
        this.generateInitialTerrain();
    }
    
    /**
     * Initialize the terrain with segments
     */
    generateInitialTerrain() {
        // Start with flat terrain
        this.lastX = 0;
        this.lastY = this.game.canvas.height * 0.7; // Start 70% down the screen
        
        // Generate initial terrain segments
        const screenSegments = Math.ceil(this.game.canvas.width / this.config.terrainSegmentSize);
        const totalSegments = screenSegments * (this.config.generationAhead + 1);
        
        for (let i = 0; i < totalSegments; i++) {
            this.generateNextSegment();
        }
    }
    
    /**
     * Generate the next terrain segment
     */
    generateNextSegment() {
        const segmentSize = this.config.terrainSegmentSize;
        const nextX = this.lastX + segmentSize;
        
        // Calculate y-position using noise for smooth hills
        let nextY;
        if (this.config.usePerlinNoise) {
            // Smooth terrain using Perlin-like noise
            nextY = this.lastY + this.getNoise(this.lastX * this.config.hillFrequency) * this.config.hillAmplitude * 100;
        } else {
            // Simple random terrain
            const variance = 5 * this.config.hillAmplitude;
            nextY = this.lastY + (Math.random() * variance * 2 - variance);
        }
        
        // Ensure terrain stays within reasonable bounds
        const minY = this.game.canvas.height * 0.5;
        const maxY = this.game.canvas.height * 0.9;
        nextY = Math.max(minY, Math.min(maxY, nextY));
        
        // Add segment
        this.segments.push({
            x1: this.lastX,
            y1: this.lastY,
            x2: nextX,
            y2: nextY,
            // Add decorative details
            hasTree: Math.random() < 0.05 && this.renderConfig.backgroundDetails,
            hasRock: Math.random() < 0.07 && this.renderConfig.backgroundDetails
        });
        
        // Update last position
        this.lastX = nextX;
        this.lastY = nextY;
    }
    
    /**
     * Get a noise value at given position (simplified Perlin-like noise)
     * @param {number} x - Position to get noise at
     * @returns {number} Noise value (-1 to 1)
     */
    getNoise(x) {
        // Simplified noise function
        return Math.sin(x + this.noiseSeed) * 
               Math.cos(x * 0.7 + this.noiseSeed * 0.5) * 
               Math.sin(x * 0.3 + this.noiseSeed * 0.2);
    }
    
    /**
     * Update terrain based on scroll speed
     * @param {number} scrollSpeed - Speed to scroll terrain
     */
    update(scrollSpeed) {
        // Scroll all segments leftward
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].x1 -= scrollSpeed;
            this.segments[i].x2 -= scrollSpeed;
        }
        
        // Remove off-screen segments
        while (this.segments.length > 0 && this.segments[0].x2 < -this.config.terrainSegmentSize) {
            this.segments.shift();
            this.totalScroll += this.config.terrainSegmentSize;
        }
        
        // Generate new segments as needed
        const screenSegments = Math.ceil(this.game.canvas.width / this.config.terrainSegmentSize);
        const targetSegments = screenSegments * (this.config.generationAhead + this.config.retainBehind);
        
        while (this.segments.length < targetSegments) {
            this.generateNextSegment();
        }
    }
    
    /**
     * Get slope angle at a specific x-position
     * @param {number} x - X position to get slope at
     * @returns {number} Slope angle in radians
     */
    getSlopeAngleAt(x) {
        // Find the segment containing the x-position
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.x1 <= x && segment.x2 >= x) {
                // Calculate slope angle
                const dx = segment.x2 - segment.x1;
                const dy = segment.y2 - segment.y1;
                return Math.atan2(dy, dx);
            }
        }
        
        // Default to flat if not found
        return 0;
    }
    
    /**
     * Render the terrain to the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (this.segments.length === 0) return;
        
        ctx.save();
        
        // Draw sky gradient
        if (this.renderConfig.useGradients) {
            const skyGradient = ctx.createLinearGradient(0, 0, 0, this.game.canvas.height * 0.7);
            skyGradient.addColorStop(0, this.renderConfig.skyColor);
            skyGradient.addColorStop(1, '#203020');
            
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height * 0.7);
        } else {
            ctx.fillStyle = this.renderConfig.skyColor;
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height * 0.7);
        }
        
        // Draw terrain path
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x1, this.segments[0].y1);
        
        // Draw each segment
        for (let i = 0; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x2, this.segments[i].y2);
        }
        
        // Complete the terrain shape
        ctx.lineTo(this.segments[this.segments.length-1].x2, this.game.canvas.height);
        ctx.lineTo(this.segments[0].x1, this.game.canvas.height);
        ctx.closePath();
        
        // Fill terrain
        if (this.renderConfig.useGradients) {
            const terrainGradient = ctx.createLinearGradient(0, this.game.canvas.height * 0.5, 0, this.game.canvas.height);
            terrainGradient.addColorStop(0, this.renderConfig.groundColor);
            terrainGradient.addColorStop(1, '#306230');
            
            ctx.fillStyle = terrainGradient;
        } else {
            ctx.fillStyle = this.renderConfig.groundColor;
        }
        ctx.fill();
        
        // Draw terrain outline
        ctx.strokeStyle = '#0f380f';
        ctx.lineWidth = this.renderConfig.outlineWidth;
        ctx.stroke();
        
        // Draw terrain details
        this.renderTerrainDetails(ctx);
        
        ctx.restore();
    }
    
    /**
     * Render decorative details on the terrain
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderTerrainDetails(ctx) {
        // Only render details if enabled
        if (!this.renderConfig.backgroundDetails) return;
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            
            // Draw a tree at this segment
            if (segment.hasTree) {
                const treeX = (segment.x1 + segment.x2) / 2;
                const treeY = (segment.y1 + segment.y2) / 2;
                const treeHeight = 20 + Math.random() * 10;
                
                // Tree trunk
                ctx.fillStyle = this.renderConfig.obstacleColors.tree;
                ctx.fillRect(treeX - 2, treeY - treeHeight, 4, treeHeight);
                
                // Tree top (triangle)
                ctx.beginPath();
                ctx.moveTo(treeX, treeY - treeHeight - 15);
                ctx.lineTo(treeX - 10, treeY - treeHeight);
                ctx.lineTo(treeX + 10, treeY - treeHeight);
                ctx.closePath();
                ctx.fill();
            }
            
            // Draw a rock at this segment
            if (segment.hasRock) {
                const rockX = (segment.x1 + segment.x2) / 2 + (Math.random() * 10 - 5);
                const rockY = (segment.y1 + segment.y2) / 2 - 5;
                const rockSize = 5 + Math.random() * 5;
                
                ctx.fillStyle = this.renderConfig.obstacleColors.rock;
                ctx.beginPath();
                ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    /**
     * Reset the terrain generator
     */
    reset() {
        this.segments = [];
        this.totalScroll = 0;
        this.noiseSeed = Math.random() * 1000;
        this.generateInitialTerrain();
    }
}

/**
 * BackgroundRenderer class for rendering background elements
 */
class BackgroundRenderer {
    /**
     * Create a new background renderer
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.renderConfig = GameConfig.render;
        
        // Background elements
        this.clouds = [];
        this.stars = [];
        
        // Initialize background elements
        this.generateClouds();
        this.generateStars();
    }
    
    /**
     * Generate cloud elements
     */
    generateClouds() {
        const cloudCount = 5;
        
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.push({
                x: Math.random() * this.game.canvas.width,
                y: 50 + Math.random() * 100,
                width: 50 + Math.random() * 100,
                height: 20 + Math.random() * 30,
                speed: 0.1 + Math.random() * 0.2,
                color: this.renderConfig.cloudColors[Math.floor(Math.random() * this.renderConfig.cloudColors.length)]
            });
        }
    }
    
    /**
     * Generate star elements
     */
    generateStars() {
        const starCount = 30;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * (this.game.canvas.height * 0.5),
                size: 1 + Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Update background elements
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update clouds
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            
            // Move cloud
            cloud.x -= cloud.speed;
            
            // Wrap around when off-screen
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.game.canvas.width + cloud.width;
                cloud.y = 50 + Math.random() * 100;
            }
        }
        
        // Update star twinkle
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            star.twinkle += 0.05;
        }
    }
    
    /**
     * Render background elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Only render stars if it's a night scene (not implemented in this version)
        // this.renderStars(ctx);
        
        // Render clouds
        this.renderClouds(ctx);
    }
    
    /**
     * Render cloud elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderClouds(ctx) {
        ctx.save();
        
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            
            ctx.fillStyle = cloud.color;
            
            // Draw cloud shape (multiple overlapping circles)
            const baseY = cloud.y;
            const baseX = cloud.x;
            const width = cloud.width;
            const height = cloud.height;
            
            // Draw cloud circles
            ctx.beginPath();
            ctx.arc(baseX, baseY, height * 0.5, 0, Math.PI * 2);
            ctx.arc(baseX + width * 0.2, baseY - height * 0.1, height * 0.7, 0, Math.PI * 2);
            ctx.arc(baseX + width * 0.4, baseY + height * 0.1, height * 0.6, 0, Math.PI * 2);
            ctx.arc(baseX + width * 0.7, baseY, height * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Render star elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderStars(ctx) {
        ctx.save();
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // Twinkle effect
            const alpha = 0.5 + Math.sin(star.twinkle) * 0.5;
            ctx.globalAlpha = alpha;
            
            // Draw star
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Reset the background renderer
     */
    reset() {
        this.clouds = [];
        this.stars = [];
        this.generateClouds();
        this.generateStars();
    }
}

/**
 * UIRenderer class for rendering UI elements
 */
class UIRenderer {
    /**
     * Create a new UI renderer
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Render UI elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Only render in-game UI when playing
        if (!this.game.isPlaying) return;
        
        // Render score
        this.renderScore(ctx);
        
        // Render size meter
        this.renderSizeMeter(ctx);
        
        // Render FPS counter if enabled
        if (GameConfig.system.showFps && this.game.fps) {
            this.renderFps(ctx);
        }
    }
    
    /**
     * Render score display
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderScore(ctx) {
        ctx.save();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE: ${Math.floor(this.game.score)}`, 20, 20);
        
        ctx.restore();
    }
    
    /**
     * Render snowball size meter
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSizeMeter(ctx) {
        ctx.save();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SIZE: ${Math.floor(this.game.snowball.size)}`, 20, 50);
        
        ctx.restore();
    }
    
    /**
     * Render FPS counter
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderFps(ctx) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`FPS: ${Math.round(this.game.fps)}`, this.game.canvas.width - 20, 20);
        
        ctx.restore();
    }
}

// Bundle all rendering classes for export
window.TerrainGenerator = TerrainGenerator;
window.BackgroundRenderer = BackgroundRenderer;
window.UIRenderer = UIRenderer;
