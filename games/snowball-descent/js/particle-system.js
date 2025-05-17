/**
 * ██████╗  █████╗ ██████╗ ████████╗██╗ ██████╗██╗     ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
 * ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║██╔════╝██║     ██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
 * ██████╔╝███████║██████╔╝   ██║   ██║██║     ██║     █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
 * ██╔═══╝ ██╔══██║██╔══██╗   ██║   ██║██║     ██║     ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
 * ██║     ██║  ██║██║  ██║   ██║   ██║╚██████╗███████╗███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
 * ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
 * 
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX PARTICLE SYSTEM v1.8.3 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module provides a vector-based particle system for visual effects including:
 * - Snow collection effects
 * - Obstacle collision explosions
 * - Trail particles
 * - Ambient snow falling in the background
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: DELTA-2
 */

'use strict';

/**
 * Particle class for individual particles
 */
class Particle {
    /**
     * Create a new particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {number} size - Particle size
     * @param {string} color - Particle color
     * @param {number} lifespan - Particle lifespan in frames
     * @param {string} type - Particle type
     */
    constructor(x, y, vx, vy, size, color, lifespan, type = 'default') {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.acceleration = new Vector2(0, 0);
        this.size = size;
        this.initialSize = size;
        this.color = color;
        this.alpha = 1;
        this.lifespan = lifespan;
        this.age = 0;
        this.type = type;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    /**
     * Update particle state
     */
    update() {
        // Update position based on velocity
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        
        // Age the particle
        this.age++;
        
        // Update alpha based on age
        this.alpha = Math.max(0, 1 - (this.age / this.lifespan));
        
        // Update size based on type
        if (this.type === 'explosion') {
            // Explosion particles shrink over time
            this.size = this.initialSize * (1 - (this.age / this.lifespan));
        } else if (this.type === 'snow') {
            // Snow particles keep their size
            this.size = this.initialSize;
        } else if (this.type === 'collection') {
            // Collection particles grow then shrink
            const halfLife = this.lifespan / 2;
            if (this.age < halfLife) {
                this.size = this.initialSize * (1 + (this.age / halfLife) * 0.5);
            } else {
                this.size = this.initialSize * (1.5 - ((this.age - halfLife) / halfLife) * 1.5);
            }
        }
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Apply damping to velocity if needed
        if (this.type === 'explosion' || this.type === 'collection') {
            this.velocity.multiply(0.95);
        }
        
        // Check if particle is dead
        return this.age >= this.lifespan;
    }
    
    /**
     * Render particle to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        ctx.save();
        
        // Set global alpha for fading
        ctx.globalAlpha = this.alpha;
        
        // Translate to particle position
        ctx.translate(this.position.x, this.position.y);
        
        // Rotate if needed
        if (this.type === 'explosion' || this.type === 'snowflake') {
            ctx.rotate(this.rotation);
        }
        
        // Draw based on particle type
        if (this.type === 'snowflake') {
            // Draw snowflake shape
            this.drawSnowflake(ctx);
        } else if (this.type === 'explosion') {
            // Draw explosion particle
            this.drawExplosion(ctx);
        } else if (this.type === 'collection') {
            // Draw collection particle
            this.drawCollection(ctx);
        } else {
            // Draw default circular particle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Draw a snowflake particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawSnowflake(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 4;
        
        // Draw a simple snowflake with 6 arms
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(-this.size * Math.cos(angle), -this.size * Math.sin(angle));
            ctx.lineTo(this.size * Math.cos(angle), this.size * Math.sin(angle));
            ctx.stroke();
        }
    }
    
    /**
     * Draw an explosion particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawExplosion(ctx) {
        // Glow effect if enabled
        if (GameConfig.render.glowEffects) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size * 2;
        }
        
        ctx.fillStyle = this.color;
        
        // Draw an irregular shape for explosion particles
        ctx.beginPath();
        const points = 5;
        const variance = 0.4;
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radiusOffset = 1 - variance / 2 + Math.random() * variance;
            const x = Math.cos(angle) * this.size * radiusOffset;
            const y = Math.sin(angle) * this.size * radiusOffset;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Draw a collection particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawCollection(ctx) {
        // Glow effect if enabled
        if (GameConfig.render.glowEffects) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = this.size;
        }
        
        ctx.fillStyle = this.color;
        
        // Draw a star shape for collection particles
        ctx.beginPath();
        const points = 6;
        const innerRadius = this.size * 0.4;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? this.size : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * ParticleSystem class to manage all particles
 */
class ParticleSystem {
    /**
     * Create a new particle system
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.config = GameConfig.system;
        this.renderConfig = GameConfig.render;
    }
    
    /**
     * Update all particles
     */
    update() {
        // Update existing particles and remove dead ones
        for (let i = this.particles.length - 1; i >= 0; i--) {
            // Update particle and check if it's dead
            if (this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
    
    /**
     * Create an explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Color of explosion
     * @param {number} size - Size of explosion
     */
    createExplosion(x, y, color, size) {
        // Number of particles based on size
        const count = Math.min(30, Math.floor(size / 2));
        
        for (let i = 0; i < count; i++) {
            // Skip if at particle limit
            if (this.particles.length >= this.config.particleLimit) break;
            
            // Random velocity in all directions
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const particleSize = Math.random() * (size / 5) + 2;
            
            // Random lifespan
            const lifespan = 20 + Math.random() * 30;
            
            // Create particle
            const particle = new Particle(
                x, y, vx, vy, 
                particleSize, 
                color, 
                lifespan, 
                'explosion'
            );
            
            // Add gravity
            particle.acceleration.y = 0.05;
            
            // Add to particles array
            this.particles.push(particle);
        }
    }
    
    /**
     * Create a collection effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Color of collection
     * @param {number} size - Size of collection
     */
    createCollection(x, y, color, size) {
        // Number of particles based on size
        const count = Math.min(20, Math.floor(size / 3));
        
        for (let i = 0; i < count; i++) {
            // Skip if at particle limit
            if (this.particles.length >= this.config.particleLimit) break;
            
            // Random velocity upward with spread
            const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/4;
            const speed = 1 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const particleSize = Math.random() * (size / 4) + 2;
            
            // Random lifespan
            const lifespan = 30 + Math.random() * 20;
            
            // Create particle
            const particle = new Particle(
                x, y, vx, vy, 
                particleSize, 
                color, 
                lifespan, 
                'collection'
            );
            
            // Add slight gravity
            particle.acceleration.y = 0.03;
            
            // Add to particles array
            this.particles.push(particle);
        }
    }
    
    /**
     * Create a trail effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Color of trail
     * @param {number} size - Size of trail
     */
    createTrail(x, y, color, size) {
        // Skip if at particle limit
        if (this.particles.length >= this.config.particleLimit) return;
        
        // Slight random velocity
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = (Math.random() - 0.5) * 0.5 - 0.2; // Slight upward bias
        
        // Random size
        const particleSize = size * (0.2 + Math.random() * 0.3);
        
        // Random lifespan
        const lifespan = 10 + Math.random() * 20;
        
        // Create particle
        const particle = new Particle(
            x, y, vx, vy, 
            particleSize, 
            color, 
            lifespan, 
            'default'
        );
        
        // Add to particles array
        this.particles.push(particle);
    }
    
    /**
     * Create a snowfall effect in the background
     * @param {number} count - Number of snowflakes to create
     */
    createSnowfall(count) {
        for (let i = 0; i < count; i++) {
            // Skip if at particle limit
            if (this.particles.length >= this.config.particleLimit) break;
            
            // Random position across the screen
            const x = Math.random() * this.game.canvas.width;
            const y = -10 - Math.random() * 50; // Start above the screen
            
            // Random velocity downward with some sideways drift
            const vx = (Math.random() - 0.5) * 0.5;
            const vy = 0.5 + Math.random() * 1;
            
            // Random size
            const size = 1 + Math.random() * 3;
            
            // Random lifespan based on position - enough to reach bottom
            const lifespan = Math.floor((this.game.canvas.height + 50) / vy);
            
            // Random color variation
            const colorIndex = Math.floor(Math.random() * this.renderConfig.particleColors.length);
            const color = this.renderConfig.particleColors[colorIndex];
            
            // Create snowflake particle
            const particle = new Particle(
                x, y, vx, vy, 
                size, 
                color, 
                lifespan, 
                'snowflake'
            );
            
            // Add slight gravity and random wind
            particle.acceleration.y = 0.01;
            particle.acceleration.x = (Math.random() - 0.5) * 0.01;
            
            // Add to particles array
            this.particles.push(particle);
        }
    }
    
    /**
     * Create particles for hill impact
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createImpact(x, y) {
        // Number of particles
        const count = 10;
        
        for (let i = 0; i < count; i++) {
            // Skip if at particle limit
            if (this.particles.length >= this.config.particleLimit) break;
            
            // Random velocity with upward bias
            const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI;
            const speed = 1 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const size = 1 + Math.random() * 2;
            
            // Random lifespan
            const lifespan = 10 + Math.random() * 15;
            
            // Create snow particle
            const particle = new Particle(
                x, y, vx, vy, 
                size, 
                GameConfig.render.snowColor, 
                lifespan, 
                'default'
            );
            
            // Add gravity
            particle.acceleration.y = 0.1;
            
            // Add to particles array
            this.particles.push(particle);
        }
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
}

// Export the ParticleSystem class
window.ParticleSystem = ParticleSystem;
