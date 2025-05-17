/**
 *  ██████╗ ██████╗ ██╗     ██╗     ██╗███████╗██╗ ██████╗ ███╗   ██╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
 * ██╔════╝██╔═══██╗██║     ██║     ██║██╔════╝██║██╔═══██╗████╗  ██║    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
 * ██║     ██║   ██║██║     ██║     ██║███████╗██║██║   ██║██╔██╗ ██║    ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
 * ██║     ██║   ██║██║     ██║     ██║╚════██║██║██║   ██║██║╚██╗██║    ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
 * ╚██████╗╚██████╔╝███████╗███████╗██║███████║██║╚██████╔╝██║ ╚████║    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
 *  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
 *
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX COLLISION SYSTEM v1.5.7 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module handles advanced collision detection and response for the Snowball Descent game.
 * It implements optimized algorithms for circle-based and vector-based collisions.
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: GAMMA-6
 */

'use strict';

/**
 * CollisionSystem class for handling game physics collisions
 */
class CollisionSystem {
    /**
     * Create a new collision system
     * @param {Object} game - Reference to the main game object
     */
    constructor(game) {
        this.game = game;
        this.physics = GameConfig.physics;
        this.collisionResults = [];
    }
    
    /**
     * Check and resolve collisions between snowball and terrain
     * @param {Snowball} snowball - Player snowball object
     * @param {TerrainGenerator} terrain - Terrain generator object
     * @returns {boolean} True if collision detected and resolved
     */
    checkTerrainCollision(snowball, terrain) {
        // Skip if no terrain or snowball
        if (!terrain || !snowball || !terrain.segments) return false;
        
        // Check each terrain segment
        let collided = false;
        
        for (let i = 0; i < terrain.segments.length; i++) {
            const segment = terrain.segments[i];
            
            // Create line segment vectors
            const lineStart = new Vector2(segment.x1, segment.y1);
            const lineEnd = new Vector2(segment.x2, segment.y2);
            
            // Check collision with line segment
            if (Collision.circleLineSegment(snowball.position, snowball.size, lineStart, lineEnd)) {
                this.resolveTerrainCollision(snowball, lineStart, lineEnd);
                collided = true;
                
                // Create impact particles
                if (this.game.particleSystem) {
                    const midX = (segment.x1 + segment.x2) / 2;
                    const midY = (segment.y1 + segment.y2) / 2;
                    this.game.particleSystem.createImpact(midX, midY);
                }
                
                // Only resolve one collision per frame for performance
                break;
            }
        }
        
        return collided;
    }
    
    /**
     * Resolve collision between snowball and terrain
     * @param {Snowball} snowball - Player snowball object
     * @param {Vector2} lineStart - Start point of line segment
     * @param {Vector2} lineEnd - End point of line segment
     */
    resolveTerrainCollision(snowball, lineStart, lineEnd) {
        // Calculate normal vector of the line segment
        const lineVector = Vector2.subtract(lineEnd, lineStart);
        const lineLength = lineVector.magnitude();
        
        // Get normal vector (perpendicular to line)
        const normal = new Vector2(-lineVector.y / lineLength, lineVector.x / lineLength);
        
        // Get closest point on line to circle center
        const circleToLineStart = Vector2.subtract(snowball.position, lineStart);
        const projection = circleToLineStart.dot(lineVector) / lineLength;
        
        // Clamp projection to line segment
        const clampedProjection = Math.max(0, Math.min(lineLength, projection));
        
        // Calculate closest point on line
        const closestPoint = new Vector2(
            lineStart.x + (lineVector.x / lineLength) * clampedProjection,
            lineStart.y + (lineVector.y / lineLength) * clampedProjection
        );
        
        // Calculate penetration depth
        const penetrationVector = Vector2.subtract(snowball.position, closestPoint);
        const penetrationDepth = penetrationVector.magnitude() - snowball.size;
        
        // Only resolve if actually penetrating
        if (penetrationDepth < 0) {
            // Normalize the penetration vector
            penetrationVector.normalize();
            
            // Move snowball out of collision
            snowball.position.add(penetrationVector.clone().multiply(-penetrationDepth));
            
            // Reflect velocity with energy loss
            const dotProduct = snowball.velocity.dot(penetrationVector);
            
            // Only bounce if moving toward the surface
            if (dotProduct < 0) {
                // Calculate reflection vector
                const reflection = Vector2.subtract(
                    snowball.velocity,
                    penetrationVector.clone().multiply(2 * dotProduct)
                );
                
                // Apply bounce with energy loss
                snowball.velocity = reflection.multiply(1 - this.physics.bounceEnergyLoss);
                
                // Apply slope effect - adjust horizontal velocity based on slope
                const slopeAngle = Math.atan2(lineVector.y, lineVector.x);
                snowball.velocity.x += Math.sin(slopeAngle) * this.physics.slopeEffect;
            }
        }
    }
    
    /**
     * Check and resolve collisions between two circles
     * @param {Object} circle1 - First circle object with position and radius
     * @param {Object} circle2 - Second circle object with position and radius
     * @returns {Object|null} Collision data or null if no collision
     */
    checkCircleCollision(circle1, circle2) {
        // Calculate square of distance between centers
        const dx = circle2.position.x - circle1.position.x;
        const dy = circle2.position.y - circle1.position.y;
        const distanceSquared = dx * dx + dy * dy;
        
        // Calculate square of minimum distance for collision
        const minDistance = circle1.radius + circle2.radius;
        const minDistanceSquared = minDistance * minDistance;
        
        // Check if circles are colliding
        if (distanceSquared < minDistanceSquared) {
            // Calculate collision normal and penetration depth
            const distance = Math.sqrt(distanceSquared);
            
            // Avoid division by zero
            const normalX = distance > 0 ? dx / distance : 1;
            const normalY = distance > 0 ? dy / distance : 0;
            
            // Penetration depth
            const penetrationDepth = minDistance - distance;
            
            // Return collision data
            return {
                normal: new Vector2(normalX, normalY),
                penetration: penetrationDepth
            };
        }
        
        // No collision
        return null;
    }
    
    /**
     * Resolve collision between two circles with physics
     * @param {Object} circle1 - First circle object with position, velocity, and mass
     * @param {Object} circle2 - Second circle object with position, velocity, and mass
     * @param {Object} collision - Collision data with normal and penetration
     */
    resolveCircleCollision(circle1, circle2, collision) {
        // Calculate mass properties
        const mass1 = circle1.mass || 1;
        const mass2 = circle2.mass || 1;
        const totalMass = mass1 + mass2;
        
        // Resolve penetration
        if (collision.penetration > 0) {
            // Distribute penetration resolution based on mass
            const push1 = (mass2 / totalMass) * collision.penetration;
            const push2 = (mass1 / totalMass) * collision.penetration;
            
            // Move objects apart
            circle1.position.subtract(collision.normal.clone().multiply(push1));
            circle2.position.add(collision.normal.clone().multiply(push2));
        }
        
        // Only resolve velocity if both objects have velocity
        if (circle1.velocity && circle2.velocity) {
            // Calculate relative velocity
            const relativeVelocity = Vector2.subtract(circle2.velocity, circle1.velocity);
            
            // Calculate velocity along normal
            const normalVelocity = relativeVelocity.dot(collision.normal);
            
            // Only resolve if objects are moving toward each other
            if (normalVelocity < 0) {
                // Calculate restitution (bounciness)
                const restitution = 1 - this.physics.bounceEnergyLoss;
                
                // Calculate impulse scalar
                const impulseScalar = -(1 + restitution) * normalVelocity / totalMass;
                
                // Apply impulse
                const impulse = collision.normal.clone().multiply(impulseScalar);
                circle1.velocity.subtract(impulse.clone().multiply(mass2));
                circle2.velocity.add(impulse.clone().multiply(mass1));
            }
        }
    }
    
    /**
     * Broad phase collision detection to quickly eliminate distant objects
     * @param {Array} objects - Array of objects with position and radius
     * @returns {Array} Array of potential collision pairs
     */
    broadPhaseCollision(objects) {
        const pairs = [];
        
        // Simple O(n²) check for small number of objects
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const obj1 = objects[i];
                const obj2 = objects[j];
                
                // Calculate square of distance between centers
                const dx = obj2.position.x - obj1.position.x;
                const dy = obj2.position.y - obj1.position.y;
                const distanceSquared = dx * dx + dy * dy;
                
                // Calculate square of maximum distance for potential collision
                const maxDistance = obj1.radius + obj2.radius + obj1.velocity.magnitude() + obj2.velocity.magnitude();
                const maxDistanceSquared = maxDistance * maxDistance;
                
                // Add pair if potentially colliding
                if (distanceSquared < maxDistanceSquared) {
                    pairs.push([obj1, obj2]);
                }
            }
        }
        
        return pairs;
    }
    
    /**
     * Apply gravity to an object
     * @param {Object} object - Object with position and velocity
     * @param {number} deltaTime - Time step in seconds
     */
    applyGravity(object, deltaTime) {
        if (object.velocity) {
            object.velocity.y += this.physics.gravity * deltaTime;
        }
    }
    
    /**
     * Apply air resistance to an object
     * @param {Object} object - Object with velocity
     * @param {number} deltaTime - Time step in seconds
     */
    applyAirResistance(object, deltaTime) {
        if (object.velocity) {
            // Simple air resistance - velocity reduction proportional to velocity squared
            const speed = object.velocity.magnitude();
            
            if (speed > 0) {
                const dragFactor = this.physics.airResistance * speed * deltaTime;
                object.velocity.multiply(1 - dragFactor);
            }
        }
    }
    
    /**
     * Apply friction to an object contacting terrain
     * @param {Object} object - Object with velocity
     * @param {Vector2} normal - Surface normal vector
     * @param {number} deltaTime - Time step in seconds
     */
    applyFriction(object, normal, deltaTime) {
        if (object.velocity) {
            // Calculate tangent vector
            const tangent = new Vector2(-normal.y, normal.x);
            
            // Calculate velocity component along tangent
            const tangentVelocity = object.velocity.dot(tangent);
            
            // Apply friction to tangent component
            const frictionFactor = this.physics.friction * deltaTime;
            const frictionForce = Math.min(Math.abs(tangentVelocity), frictionFactor);
            
            // Determine direction of friction
            const frictionDirection = tangentVelocity > 0 ? -1 : 1;
            
            // Apply friction force
            object.velocity.add(tangent.clone().multiply(frictionForce * frictionDirection));
        }
    }
    
    /**
     * Clear collision data
     */
    clearCollisions() {
        this.collisionResults = [];
    }
}

// Export the CollisionSystem class
window.CollisionSystem = CollisionSystem;
