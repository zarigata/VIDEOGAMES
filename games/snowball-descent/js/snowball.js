/**
 * ███████╗███╗   ██╗ ██████╗ ██╗    ██╗██████╗  █████╗ ██╗     ██╗        ███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
 * ██╔════╝████╗  ██║██╔═══██╗██║    ██║██╔══██╗██╔══██╗██║     ██║        ██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
 * ███████╗██╔██╗ ██║██║   ██║██║ █╗ ██║██████╔╝███████║██║     ██║        █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  
 * ╚════██║██║╚██╗██║██║   ██║██║███╗██║██╔══██╗██╔══██║██║     ██║        ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  
 * ███████║██║ ╚████║╚██████╔╝╚███╔███╔╝██████╔╝██║  ██║███████╗███████╗    ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
 * ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝    ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
 *                                                                                                                          
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX PHYSICS SYSTEM v3.4.9 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module handles the player's snowball physics, rendering, and state management.
 * It implements vector-based simulation for realistic movement and collision response.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: BETA-5
 */

'use strict';

/**
 * Snowball class representing the player-controlled snowball
 */
class Snowball {
    /**
     * Create a new snowball instance
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.config = GameConfig.player;
        this.physicsConfig = GameConfig.physics;
        
        // Position and physics properties
        this.position = new Vector2(
            game.canvas.width * this.config.startPosition.x, 
            game.canvas.height * this.config.startPosition.y
        );
        this.velocity = new Vector2(0, this.physicsConfig.minVelocity);
        this.acceleration = new Vector2(0, this.physicsConfig.gravity);
        
        // Snowball state properties
        this.size = this.config.initialSize;
        this.targetSize = this.size; // For smooth size transitions
        this.rotation = 0;
        this.isColliding = false;
        this.invincible = false;
        this.invincibilityTimer = null;
        
        // Visual properties for rendering
        this.details = [];
        this.generateDetails();
        this.trail = [];
        this.trailCounter = 0;
        
        // Input state
        this.input = {
            left: false,
            right: false
        };
        
        // Initialize the snowball
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for player input
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch controls
        const leftControl = document.getElementById('leftControl');
        const rightControl = document.getElementById('rightControl');
        
        if (leftControl) {
            leftControl.addEventListener('touchstart', () => { this.input.left = true; });
            leftControl.addEventListener('touchend', () => { this.input.left = false; });
            leftControl.addEventListener('mousedown', () => { this.input.left = true; });
            leftControl.addEventListener('mouseup', () => { this.input.left = false; });
        }
        
        if (rightControl) {
            rightControl.addEventListener('touchstart', () => { this.input.right = true; });
            rightControl.addEventListener('touchend', () => { this.input.right = false; });
            rightControl.addEventListener('mousedown', () => { this.input.right = true; });
            rightControl.addEventListener('mouseup', () => { this.input.right = false; });
        }
    }
    
    /**
     * Handle keyboard key down events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.input.left = true;
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            this.input.right = true;
        }
    }
    
    /**
     * Handle keyboard key up events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.input.left = false;
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            this.input.right = false;
        }
    }
    
    /**
     * Generate random details inside the snowball for visual effect
     */
    generateDetails() {
        // Clear existing details
        this.details = [];
        
        // Only generate details if enabled in config
        if (!GameConfig.render.snowballDetail) return;
        
        // Number of details scales with snowball size
        const detailCount = Math.floor(this.size / 3);
        
        for (let i = 0; i < detailCount; i++) {
            // Random position within the snowball
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (this.size * 0.8);
            
            // Add detail at random position within the snowball
            this.details.push({
                position: new Vector2(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                ),
                size: Math.random() * 2 + 1,
                color: Math.random() > 0.7 ? '#c7e5e6' : '#b0d2d3'
            });
        }
    }
    
    /**
     * Update the snowball state for the current frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Apply controls
        this.handleControls(deltaTime);
        
        // Apply physics
        this.applyPhysics(deltaTime);
        
        // Keep snowball on screen
        this.constrainToScreen();
        
        // Update rotation based on movement
        this.updateRotation(deltaTime);
        
        // Smooth size transitions
        this.smoothSizeTransition(deltaTime);
        
        // Update trail effect
        this.updateTrail();
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Apply player controls to snowball movement
     * @param {number} deltaTime - Time since last frame in seconds
     */
    handleControls(deltaTime) {
        // Calculate control speed based on size if enabled
        let controlSpeed = this.config.controlSpeed;
        if (this.config.speedWithSize) {
            // Larger snowballs move slower
            controlSpeed -= this.size * this.config.sizeSpeedFactor;
            // Ensure minimum control speed
            controlSpeed = Math.max(controlSpeed, this.config.controlSpeed * 0.4);
        }
        
        // Apply horizontal movement from input
        if (this.input.left) {
            this.velocity.x -= controlSpeed;
        }
        if (this.input.right) {
            this.velocity.x += controlSpeed;
        }
        
        // Apply friction to horizontal movement
        this.velocity.x *= (1 - this.physicsConfig.friction);
    }
    
    /**
     * Apply physics calculations to the snowball
     * @param {number} deltaTime - Time since last frame in seconds
     */
    applyPhysics(deltaTime) {
        // Apply gravity
        this.acceleration.y = this.physicsConfig.gravity;
        
        // Apply terrain slope effect if enabled
        if (this.game.terrain && GameConfig.terrain.slopeEffect) {
            const slopeAngle = this.game.terrain.getSlopeAngleAt(this.position.x);
            this.acceleration.x = Math.sin(slopeAngle) * this.physicsConfig.slopeEffect;
        }
        
        // Apply acceleration to velocity
        this.velocity.add(this.acceleration);
        
        // Apply air resistance
        this.velocity.multiply(1 - this.physicsConfig.airResistance);
        
        // Ensure minimum velocity for continuous movement
        if (this.velocity.y < this.physicsConfig.minVelocity) {
            this.velocity.y = this.physicsConfig.minVelocity;
        }
        
        // Limit maximum velocity
        this.velocity.limit(this.physicsConfig.maxVelocity);
        
        // Apply velocity to position
        this.position.add(this.velocity);
    }
    
    /**
     * Keep the snowball within the screen boundaries
     */
    constrainToScreen() {
        // Constrain horizontal position
        if (this.position.x < this.size) {
            this.position.x = this.size;
            this.velocity.x *= -this.physicsConfig.bounceEnergyLoss;
        } else if (this.position.x > this.game.canvas.width - this.size) {
            this.position.x = this.game.canvas.width - this.size;
            this.velocity.x *= -this.physicsConfig.bounceEnergyLoss;
        }
        
        // Constrain vertical position (top only, bottom is handled by game logic)
        if (this.position.y < this.size) {
            this.position.y = this.size;
            this.velocity.y *= -this.physicsConfig.bounceEnergyLoss;
        }
    }
    
    /**
     * Update the rotation based on movement
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateRotation(deltaTime) {
        // Rotate based on horizontal velocity
        this.rotation += this.velocity.x * this.config.rotationSpeed;
        
        // Normalize rotation to keep it within reasonable bounds
        this.rotation %= (Math.PI * 2);
    }
    
    /**
     * Smoothly transition the snowball size towards the target size
     * @param {number} deltaTime - Time since last frame in seconds
     */
    smoothSizeTransition(deltaTime) {
        if (this.size !== this.targetSize) {
            // Gradually adjust size towards target
            const step = (this.targetSize - this.size) * 0.1;
            this.size += step;
            
            // If size is close enough to target, snap to it
            if (Math.abs(this.size - this.targetSize) < 0.1) {
                this.size = this.targetSize;
            }
            
            // Regenerate details when size changes significantly
            if (Math.abs(step) > 0.5) {
                this.generateDetails();
            }
        }
    }
    
    /**
     * Update trail effect behind the snowball
     */
    updateTrail() {
        // Only add trail particles at specified intervals
        this.trailCounter++;
        if (this.trailCounter >= this.config.trailInterval) {
            this.trailCounter = 0;
            
            // Add new trail particle if trail effect is enabled
            if (GameConfig.render.trailEffect) {
                this.trail.push({
                    position: this.position.clone(),
                    size: this.size * 0.8,
                    opacity: 0.5,
                    age: 0
                });
                
                // Limit trail length based on size
                const maxTrailLength = Math.floor(10 + this.size / 5);
                while (this.trail.length > maxTrailLength) {
                    this.trail.shift();
                }
            }
        }
        
        // Age and fade out trail particles
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const trail = this.trail[i];
            trail.age += 1;
            trail.opacity -= 0.02;
            trail.size *= 0.97;
            
            // Remove old trail particles
            if (trail.opacity <= 0) {
                this.trail.splice(i, 1);
            }
        }
    }
    
    /**
     * Update the game UI with current snowball info
     */
    updateUI() {
        // Update size display
        const sizeElement = document.getElementById('snowballSize');
        if (sizeElement) {
            sizeElement.textContent = Math.floor(this.size);
        }
    }
    
    /**
     * Grow the snowball when collecting snow
     * @param {number} amount - Amount to grow by
     */
    grow(amount) {
        // Increase target size
        this.targetSize += this.config.growthFactor * amount;
        
        // Limit maximum size
        if (this.targetSize > this.config.maxSize) {
            this.targetSize = this.config.maxSize;
        }
        
        // Apply size-up animation to size display
        const sizeElement = document.getElementById('snowballSize');
        if (sizeElement) {
            sizeElement.classList.remove('size-up');
            // Trigger reflow to restart animation
            void sizeElement.offsetWidth;
            sizeElement.classList.add('size-up');
        }
    }
    
    /**
     * Shrink the snowball when hitting obstacles
     * @param {number} amount - Amount to shrink by
     * @returns {boolean} True if snowball still exists, false if too small
     */
    shrink(amount) {
        // Only shrink if not invincible
        if (this.invincible) return true;
        
        // Decrease target size
        this.targetSize -= this.config.shrinkFactor * amount;
        
        // Apply size-down animation to size display
        const sizeElement = document.getElementById('snowballSize');
        if (sizeElement) {
            sizeElement.classList.remove('size-down');
            // Trigger reflow to restart animation
            void sizeElement.offsetWidth;
            sizeElement.classList.add('size-down');
        }
        
        // Start invincibility period
        this.setInvincible(true);
        
        // Check if snowball is too small to continue
        if (this.targetSize < this.config.minSize) {
            return false; // Trigger game over
        }
        
        return true;
    }
    
    /**
     * Set invincibility state for the snowball
     * @param {boolean} isInvincible - Whether the snowball should be invincible
     */
    setInvincible(isInvincible) {
        this.invincible = isInvincible;
        
        // Clear existing timer if any
        if (this.invincibilityTimer) {
            clearTimeout(this.invincibilityTimer);
        }
        
        // Set timer to disable invincibility after delay
        if (isInvincible) {
            this.invincibilityTimer = setTimeout(() => {
                this.invincible = false;
                this.invincibilityTimer = null;
            }, this.config.invincibilityTime);
        }
    }
    
    /**
     * Check collision with obstacle
     * @param {Object} obstacle - Obstacle to check collision with
     * @returns {boolean} True if collision occurred
     */
    checkCollision(obstacle) {
        // Skip collision check if invincible
        if (this.invincible) return false;
        
        // Use collision utility from vector-math.js
        return Collision.circleCircle(
            this.position,
            this.size,
            obstacle.position,
            obstacle.radius
        );
    }
    
    /**
     * Resolve collision with obstacle
     * @param {Object} obstacle - Obstacle to resolve collision with
     */
    resolveCollision(obstacle) {
        // Get collision response data
        const response = Collision.circleCircleResponse(
            this.position,
            this.size,
            obstacle.position,
            obstacle.radius
        );
        
        if (!response) return; // No collision
        
        // Apply collision resolution
        const { normal, penetration } = response;
        
        // Move snowball out of obstacle
        this.position.add(normal.clone().multiply(penetration * 0.5));
        
        // Bounce velocity off the normal
        const dotProduct = this.velocity.dot(normal);
        if (dotProduct < 0) {
            this.velocity.subtract(normal.clone().multiply(dotProduct * (1 + this.physicsConfig.bounceEnergyLoss)));
        }
    }
    
    /**
     * Render the snowball to the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // First render trail
        this.renderTrail(ctx);
        
        // Save context state
        ctx.save();
        
        // Draw with a pulsing effect if invincible
        if (this.invincible) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        }
        
        // Draw the snowball
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Draw snowball shadow if enabled
        if (GameConfig.render.shadowsEnabled) {
            ctx.beginPath();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';
        }
        
        // Draw the main snowball body
        ctx.beginPath();
        ctx.fillStyle = GameConfig.render.snowballColor;
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw snowball outline
        ctx.lineWidth = GameConfig.render.outlineWidth;
        ctx.strokeStyle = GameConfig.render.snowballOutline;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw details if enabled
        if (GameConfig.render.snowballDetail) {
            this.details.forEach(detail => {
                ctx.beginPath();
                ctx.fillStyle = detail.color;
                ctx.arc(
                    detail.position.x,
                    detail.position.y,
                    detail.size,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });
        }
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Render the snowball's trail
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderTrail(ctx) {
        // Only render if trail effect is enabled
        if (!GameConfig.render.trailEffect) return;
        
        // Render each trail particle
        this.trail.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = GameConfig.render.snowballColor;
            ctx.beginPath();
            ctx.arc(
                particle.position.x,
                particle.position.y,
                particle.size,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        });
    }
}

// Export the Snowball class
window.Snowball = Snowball;
