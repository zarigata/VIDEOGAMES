/**
 * ██╗   ██╗███████╗ ██████╗████████╗ ██████╗ ██████╗     ███╗   ███╗ █████╗ ████████╗██╗  ██╗
 * ██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗    ████╗ ████║██╔══██╗╚══██╔══╝██║  ██║
 * ██║   ██║█████╗  ██║        ██║   ██║   ██║██████╔╝    ██╔████╔██║███████║   ██║   ███████║
 * ╚██╗ ██╔╝██╔══╝  ██║        ██║   ██║   ██║██╔══██╗    ██║╚██╔╝██║██╔══██║   ██║   ██╔══██║
 *  ╚████╔╝ ███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║    ██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║
 *   ╚═══╝  ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
 * 
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * :: CODEX VECTOR MATHEMATICS LIBRARY v2.5.1 - ZARIGATA DEVELOPMENT UNIT X99 ::::::::::::::::::::::
 * ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 * 
 * This module provides all vector mathematics operations needed for the vector-based rendering
 * and physics in the Snowball Descent game. It includes:
 * 
 * - Vector creation and manipulation
 * - Collision detection utilities
 * - Physics calculations
 * - Geometric transformations
 * - Optimized math routines for game performance
 * 
 * CORE DEVELOPER: ZARI X99 UNIT
 * REVISION DATE: 2025-05-17
 * OPTIMIZATION LEVEL: GAMMA-7
 */

// Use strict mode for better error handling and performance
'use strict';

// Vector2 class for 2D vector operations
class Vector2 {
    /**
     * Create a new 2D vector
     * @param {number} x - X component of the vector
     * @param {number} y - Y component of the vector
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Create a vector from angle and magnitude
     * @param {number} angle - Angle in radians
     * @param {number} magnitude - Length of the vector
     * @returns {Vector2} New vector with specified angle and magnitude
     */
    static fromAngle(angle, magnitude = 1) {
        return new Vector2(
            magnitude * Math.cos(angle),
            magnitude * Math.sin(angle)
        );
    }
    
    /**
     * Create a deep copy of this vector
     * @returns {Vector2} New vector with same components
     */
    clone() {
        return new Vector2(this.x, this.y);
    }
    
    /**
     * Add another vector to this vector
     * @param {Vector2} v - Vector to add
     * @returns {Vector2} This vector after addition
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    /**
     * Static method to add two vectors and return a new vector
     * @param {Vector2} v1 - First vector
     * @param {Vector2} v2 - Second vector
     * @returns {Vector2} New vector that is the sum of v1 and v2
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }
    
    /**
     * Subtract another vector from this vector
     * @param {Vector2} v - Vector to subtract
     * @returns {Vector2} This vector after subtraction
     */
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    /**
     * Static method to subtract two vectors and return a new vector
     * @param {Vector2} v1 - First vector
     * @param {Vector2} v2 - Second vector to subtract from first
     * @returns {Vector2} New vector that is v1 - v2
     */
    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
    
    /**
     * Multiply this vector by a scalar
     * @param {number} scalar - Value to multiply the vector by
     * @returns {Vector2} This vector after multiplication
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    /**
     * Divide this vector by a scalar
     * @param {number} scalar - Value to divide the vector by
     * @returns {Vector2} This vector after division
     */
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }
    
    /**
     * Calculate the magnitude (length) of this vector
     * @returns {number} Magnitude of the vector
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    /**
     * Calculate the magnitude squared (faster than magnitude)
     * @returns {number} Magnitude squared of the vector
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    
    /**
     * Normalize this vector (make its length 1)
     * @returns {Vector2} This vector after normalization
     */
    normalize() {
        const mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
    
    /**
     * Calculate dot product of this vector with another vector
     * @param {Vector2} v - Other vector
     * @returns {number} Dot product result
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    /**
     * Calculate cross product magnitude of this vector with another vector
     * @param {Vector2} v - Other vector
     * @returns {number} Cross product magnitude
     */
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }
    
    /**
     * Calculate the angle of this vector in radians
     * @returns {number} Angle in radians
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    /**
     * Calculate angle between this vector and another vector
     * @param {Vector2} v - Other vector
     * @returns {number} Angle between vectors in radians
     */
    angleBetween(v) {
        return Math.atan2(this.cross(v), this.dot(v));
    }
    
    /**
     * Rotate this vector by an angle
     * @param {number} angle - Angle to rotate by in radians
     * @returns {Vector2} This vector after rotation
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * Set the components of this vector
     * @param {number} x - New x component
     * @param {number} y - New y component
     * @returns {Vector2} This vector after setting components
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    /**
     * Limit the magnitude of this vector
     * @param {number} max - Maximum magnitude
     * @returns {Vector2} This vector after limiting
     */
    limit(max) {
        const magSq = this.magnitudeSquared();
        if (magSq > max * max) {
            this.divide(Math.sqrt(magSq)).multiply(max);
        }
        return this;
    }
    
    /**
     * Calculate distance between this vector and another vector
     * @param {Vector2} v - Other vector
     * @returns {number} Distance between vectors
     */
    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate distance squared between this vector and another vector (faster than distance)
     * @param {Vector2} v - Other vector
     * @returns {number} Distance squared between vectors
     */
    distanceSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }
    
    /**
     * Linear interpolation between this vector and another vector
     * @param {Vector2} v - Target vector
     * @param {number} t - Interpolation parameter (0-1)
     * @returns {Vector2} This vector after interpolation
     */
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }
    
    /**
     * Static method to linearly interpolate between two vectors
     * @param {Vector2} v1 - Start vector
     * @param {Vector2} v2 - End vector
     * @param {number} t - Interpolation parameter (0-1)
     * @returns {Vector2} New interpolated vector
     */
    static lerp(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }
    
    /**
     * Reflect this vector off a surface with given normal
     * @param {Vector2} normal - Surface normal vector (should be normalized)
     * @returns {Vector2} This vector after reflection
     */
    reflect(normal) {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }
    
    /**
     * Get a string representation of this vector
     * @returns {string} String representation
     */
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
}

/**
 * Collision detection utilities
 */
const Collision = {
    /**
     * Check if point is inside circle
     * @param {Vector2} point - Point to check
     * @param {Vector2} circleCenter - Center of the circle
     * @param {number} radius - Radius of the circle
     * @returns {boolean} True if point is inside circle
     */
    pointInCircle(point, circleCenter, radius) {
        return point.distanceSquared(circleCenter) <= radius * radius;
    },
    
    /**
     * Check if two circles are colliding
     * @param {Vector2} c1Center - Center of first circle
     * @param {number} c1Radius - Radius of first circle
     * @param {Vector2} c2Center - Center of second circle
     * @param {number} c2Radius - Radius of second circle
     * @returns {boolean} True if circles are colliding
     */
    circleCircle(c1Center, c1Radius, c2Center, c2Radius) {
        const minDistance = c1Radius + c2Radius;
        return c1Center.distanceSquared(c2Center) <= minDistance * minDistance;
    },
    
    /**
     * Check if circle is colliding with line segment
     * @param {Vector2} circleCenter - Center of the circle
     * @param {number} radius - Radius of the circle
     * @param {Vector2} lineStart - Start point of line segment
     * @param {Vector2} lineEnd - End point of line segment
     * @returns {boolean} True if circle and line segment are colliding
     */
    circleLineSegment(circleCenter, radius, lineStart, lineEnd) {
        // Vector from line start to end
        const lineVector = Vector2.subtract(lineEnd, lineStart);
        // Vector from line start to circle center
        const circleVector = Vector2.subtract(circleCenter, lineStart);
        
        // Project circle center onto line
        const lineLength = lineVector.magnitude();
        const unitLine = new Vector2(lineVector.x / lineLength, lineVector.y / lineLength);
        const projection = circleVector.dot(unitLine);
        
        // Find closest point on line segment to circle center
        let closestPoint;
        if (projection <= 0) {
            closestPoint = lineStart.clone();
        } else if (projection >= lineLength) {
            closestPoint = lineEnd.clone();
        } else {
            closestPoint = Vector2.add(lineStart, unitLine.multiply(projection));
        }
        
        // Check if distance from circle center to closest point is less than radius
        return circleCenter.distanceSquared(closestPoint) <= radius * radius;
    },
    
    /**
     * Get collision normal and penetration depth between two circles
     * @param {Vector2} c1Center - Center of first circle
     * @param {number} c1Radius - Radius of first circle
     * @param {Vector2} c2Center - Center of second circle
     * @param {number} c2Radius - Radius of second circle
     * @returns {Object|null} Collision data or null if no collision
     */
    circleCircleResponse(c1Center, c1Radius, c2Center, c2Radius) {
        const distanceVec = Vector2.subtract(c2Center, c1Center);
        const distance = distanceVec.magnitude();
        const minDistance = c1Radius + c2Radius;
        
        if (distance >= minDistance) return null;
        
        // Calculate collision normal
        let normal;
        if (distance > 0) {
            normal = new Vector2(distanceVec.x / distance, distanceVec.y / distance);
        } else {
            // Circles are at exact same position, use arbitrary normal
            normal = new Vector2(1, 0);
        }
        
        // Calculate penetration depth
        const penetration = minDistance - distance;
        
        return {
            normal,
            penetration
        };
    }
};

// Export the Vector2 class and Collision utilities
window.Vector2 = Vector2;
window.Collision = Collision;
