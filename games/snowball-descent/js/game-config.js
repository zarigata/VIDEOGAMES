/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║ SNOWBALL DESCENT - GAME CONFIGURATION                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ CODEX VERSION: 3.7.2 | ZARIGATA DEVELOPMENT UNIT X99                      ║
 * ║ CREATED: 2025-05-17 | PLATFORM: CROSS-PLATFORM VECTOR ENGINE             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * This configuration file defines all game parameters, making it easy to
 * balance and tune the gameplay experience without modifying core logic.
 * 
 * CATEGORY LEGEND:
 * [PHYSICS] - Physics simulation parameters
 * [SCORING] - Point system and rewards
 * [RENDER]  - Visual appearance settings
 * [SPAWN]   - Object generation parameters
 * [PLAYER]  - Snowball player settings
 * [SYSTEM]  - Core system configurations
 */

const GameConfig = {
    /**
     * [SYSTEM] Core game system settings
     */
    system: {
        fps: 60,                     // Target frames per second
        mobileDetection: true,       // Auto-detect mobile devices
        debugMode: false,            // Show debug information when true
        pauseOnBlur: true,           // Pause game when window loses focus
        autoResize: true,            // Automatically handle window resizing
        saveHighScore: true,         // Save high score to localStorage
        showFps: false,              // Display FPS counter
        soundEnabled: true,          // Enable sound effects
        particleLimit: 100,          // Maximum number of particles
    },
    
    /**
     * [PHYSICS] Physics simulation parameters
     */
    physics: {
        gravity: 0.2,                // Downward force
        friction: 0.02,              // Surface friction
        airResistance: 0.001,        // Air resistance factor
        bounceEnergyLoss: 0.3,       // Energy lost on bounce (0-1)
        maxVelocity: 12,             // Maximum velocity in any direction
        minVelocity: 0.5,            // Minimum downward velocity
        collisionPrecision: 2,       // Number of collision checks per frame
        physicsIterations: 3,        // Physics solver iterations per frame
        slopeEffect: 0.8,            // How much slopes affect horizontal movement
    },
    
    /**
     * [PLAYER] Snowball player settings
     */
    player: {
        initialSize: 10,             // Starting radius of snowball
        maxSize: 100,                // Maximum possible snowball radius
        minSize: 5,                  // Minimum snowball size before game over
        growthFactor: 0.2,           // How quickly snowball grows when collecting snow
        shrinkFactor: 1.5,           // How quickly snowball shrinks when hitting obstacles
        controlSpeed: 0.3,           // Horizontal movement speed
        speedWithSize: true,         // Whether size affects speed
        sizeSpeedFactor: 0.01,       // How much size affects speed
        startPosition: { x: 0.5, y: 0.1 }, // Starting position (ratio of screen)
        rotationSpeed: 0.05,         // How fast the snowball rotates when moving
        trailInterval: 3,            // Frames between trail particle spawns
        invincibilityTime: 1000,     // Milliseconds of invincibility after hit
    },
    
    /**
     * [SCORING] Point system and rewards
     */
    scoring: {
        baseSnowValue: 10,           // Base points for collecting snow
        sizeMultiplier: 0.5,         // Points multiplier based on current size
        obstacleBonus: 50,           // Bonus for surviving near obstacle miss
        speedBonus: 0.2,             // Speed bonus multiplier
        comboSystem: true,           // Enable combo system for successive collections
        comboTimeWindow: 1000,       // Milliseconds to maintain combo
        comboMultiplierMax: 5,       // Maximum combo multiplier
        levelProgression: true,      // Increase difficulty based on score
        scoreMilestones: [500, 1000, 2500, 5000, 10000], // Score thresholds for difficulty increases
    },
    
    /**
     * [RENDER] Visual appearance settings
     */
    render: {
        snowballColor: '#e0f8ff',    // Main snowball color
        snowballOutline: '#306230',  // Snowball outline color
        snowballDetail: true,        // Add detail to snowball
        backgroundColor: '#0f380f',  // Background color
        skyColor: '#306230',         // Sky color
        groundColor: '#9bbc0f',      // Ground color
        obstacleColors: {
            rock: '#706458',         // Rock color
            tree: '#248232',         // Tree color
            house: '#d64161',        // House color
            fence: '#8c5e38',        // Fence color
        },
        snowColor: '#e0f8ff',        // Snow particle color
        particleColors: ['#e0f8ff', '#c7e5e6', '#b0d2d3'], // Various particle colors
        cloudColors: ['#b5d8d0', '#9fc9c1'], // Cloud colors
        trailEffect: true,           // Show trail behind snowball
        parallaxLayers: 3,           // Number of background parallax layers
        backgroundDetails: true,     // Add trees and details to background
        useGradients: true,          // Use color gradients for better visuals
        outlineWidth: 2,             // Width of vector outline strokes
        shadowsEnabled: true,        // Enable simple shadow effects
        glowEffects: true,           // Enable glow effects for certain elements
    },
    
    /**
     * [SPAWN] Object generation parameters
     */
    spawn: {
        initialSpeed: 1.5,           // Initial scrolling speed
        maxSpeed: 6,                 // Maximum scrolling speed
        speedIncrease: 0.0005,       // How quickly speed increases over time
        snowDensity: 15,             // Density of collectable snow (higher = more snow)
        obstacleDensity: 2,          // Density of obstacles (higher = more obstacles)
        obstacleSizeVariance: 0.4,   // Size variance for obstacles (0-1)
        obstacleTypes: ['rock', 'tree', 'house', 'fence'], // Available obstacle types
        verticalVariance: 0.6,       // Vertical position variance
        minObstacleDistance: 150,    // Minimum distance between obstacles
        maxObstacleDistance: 500,    // Maximum distance between obstacles
        snowClusteringFactor: 0.5,   // Tendency of snow to appear in clusters (0-1)
        specialObstacleProbability: 0.05, // Probability of special obstacle spawn
    },
    
    /**
     * [TERRAIN] Terrain generation settings
     */
    terrain: {
        hillAmplitude: 0.3,          // Hill height variance (0-1)
        hillFrequency: 0.01,         // Hill frequency (higher = more hills)
        terrainSmoothness: 0.8,      // Terrain smoothness (0-1)
        terrainDetail: 3,            // Level of detail for terrain
        slopeEffect: true,           // Whether slopes affect gameplay
        terrainSegmentSize: 20,      // Size of each terrain segment in pixels
        generationAhead: 2,          // Generate terrain this many screens ahead
        retainBehind: 1,             // Retain terrain this many screens behind
        usePerlinNoise: true,        // Use Perlin noise for more natural terrain
    }
};

// Platform detection for adjusting settings
(function() {
    // Detect if running on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Apply mobile-specific adjustments if needed
    if (isMobile && GameConfig.system.mobileDetection) {
        GameConfig.system.fps = 30; // Lower framerate for mobile
        GameConfig.render.backgroundDetails = false; // Simpler background
        GameConfig.render.parallaxLayers = 2; // Fewer parallax layers
        GameConfig.system.particleLimit = 50; // Fewer particles
        GameConfig.physics.physicsIterations = 2; // Fewer physics iterations
        
        // Adjust player controls for touch
        GameConfig.player.controlSpeed = 0.4; // More responsive controls
    }
    
    // Automatically adjust settings based on performance capability
    const performanceAdjust = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                // WebGL not supported, reduce visual settings
                GameConfig.render.shadowsEnabled = false;
                GameConfig.render.glowEffects = false;
                GameConfig.render.useGradients = false;
                GameConfig.system.particleLimit = 30;
            }
        } catch (e) {
            console.warn('Performance detection failed:', e);
        }
    };
    
    // Run performance adjustment
    performanceAdjust();
})();
