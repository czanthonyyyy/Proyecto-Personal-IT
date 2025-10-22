# Design Document

## Overview

Tower Defense: Última Defensa will be implemented as a web-based game using HTML5 Canvas for rendering and vanilla JavaScript for game logic. The architecture follows a modular, object-oriented design with clear separation of concerns between game entities, managers, and systems.

## Architecture

### Core Architecture Pattern
The game follows a **Component-Entity-System (CES)** inspired architecture with the following main layers:

1. **Game Core Layer**: Main game loop, state management, and coordination
2. **Entity Layer**: Game objects (Enemies, Towers, Projectiles)
3. **Manager Layer**: Specialized systems (Wave, Economy, UI management)
4. **Rendering Layer**: Canvas-based rendering and visual effects
5. **Input Layer**: User interaction handling and validation

### File Structure
```
tower-defense/
├── index.html                 # Main HTML entry point
├── css/
│   ├── style.css             # Game canvas and layout styles
│   └── ui.css                # UI components and HUD styles
├── js/
│   ├── main.js               # Application entry point and initialization
│   ├── game.js               # Main game class and game loop
│   ├── entities/
│   │   ├── Enemy.js          # Enemy entity class
│   │   ├── Tower.js          # Tower entity class
│   │   └── Projectile.js     # Projectile entity class
│   ├── managers/
│   │   ├── WaveManager.js    # Wave spawning and progression
│   │   ├── EconomyManager.js # Currency and cost management
│   │   └── UIManager.js      # User interface updates
│   ├── map/
│   │   ├── Map.js            # Map rendering and grid system
│   │   └── pathData.js       # Path coordinates and validation
│   └── utils/
│       ├── constants.js      # Game configuration constants
│       └── helpers.js        # Utility functions
```

## Components and Interfaces

### Game Class (game.js)
**Responsibilities**: Main game loop, state coordination, input handling

```javascript
class Game {
    constructor(canvas)
    init()                    // Initialize all game systems
    update(deltaTime)         // Update all game entities and systems
    render()                  // Render all visual elements
    handleClick(x, y)         // Process player input
    handleMouseMove(x, y)     // Handle hover effects
    checkGameOver()           // Evaluate end conditions
    reset()                   // Reset game state
}
```

**Key Properties**:
- `gameState`: Current state (PLAYING, PAUSED, GAME_OVER, VICTORY)
- `entities`: Collections of enemies, towers, and projectiles
- `managers`: References to all manager instances
- `selectedTowerType`: Currently selected tower for placement

### Entity Classes

#### Enemy Class (entities/Enemy.js)
**Responsibilities**: Enemy behavior, movement, health management

```javascript
class Enemy {
    constructor(type, path)
    update(deltaTime)         // Update position and state
    render(ctx)              // Draw enemy and health bar
    takeDamage(damage)       // Apply damage and check death
    move()                   // Move along path
    isAlive()                // Check if enemy is still active
    getDistanceToEnd()       // Calculate remaining path distance
}
```

**Properties**:
- `type`: Enemy variant (BASIC, TANK, FAST)
- `health`, `maxHealth`: Current and maximum health points
- `speed`: Movement speed in pixels per second
- `reward`: Currency awarded when destroyed
- `position`: Current {x, y} coordinates
- `pathIndex`: Current position in path array
- `pathProgress`: Interpolation between path points

#### Tower Class (entities/Tower.js)
**Responsibilities**: Target acquisition, shooting, range management

```javascript
class Tower {
    constructor(type, x, y)
    update(enemies)          // Find targets and shoot
    render(ctx)              // Draw tower and effects
    findTarget(enemies)      // Select optimal enemy target
    shoot()                  // Create projectile
    canShoot()               // Check fire rate cooldown
    isInRange(enemy)         // Check if enemy is within range
    showRange(ctx)           // Render range indicator
}
```

**Properties**:
- `type`: Tower variant (BASIC, SNIPER, AREA)
- `damage`: Damage per shot
- `range`: Attack range in pixels
- `fireRate`: Shots per second
- `cost`: Purchase price
- `position`: Grid-aligned {x, y} coordinates
- `lastShotTime`: Timestamp for fire rate control
- `target`: Currently targeted enemy

#### Projectile Class (entities/Projectile.js)
**Responsibilities**: Movement toward target, collision detection, damage application

```javascript
class Projectile {
    constructor(x, y, target, damage, speed, splash = false)
    update(deltaTime)        // Move toward target
    render(ctx)              // Draw projectile
    hasHit()                 // Check collision with target
    dealDamage(enemies)      // Apply damage (single or splash)
    isActive()               // Check if projectile should continue existing
}
```

### Manager Classes

#### WaveManager Class (managers/WaveManager.js)
**Responsibilities**: Wave progression, enemy spawning, timing control

```javascript
class WaveManager {
    constructor(waveData)
    startWave()              // Begin current wave
    update(deltaTime)        // Handle spawning timing
    spawnEnemy()             // Create and add enemy to game
    isWaveComplete()         // Check if all enemies spawned and eliminated
    nextWave()               // Advance to next wave
    getCurrentWaveInfo()     // Get wave display information
}
```

**Wave Configuration**:
- Wave data stored as arrays defining enemy types, counts, and spawn intervals
- Progressive difficulty through increased enemy counts and stronger types
- Configurable spawn delays and wave intervals

#### EconomyManager Class (managers/EconomyManager.js)
**Responsibilities**: Currency tracking, transaction validation, cost management

```javascript
class EconomyManager {
    constructor(startingMoney = 500)
    addMoney(amount)         // Increase player currency
    spendMoney(amount)       // Decrease player currency
    canAfford(cost)          // Validate purchase capability
    getMoney()               // Get current currency amount
    getTransactionHistory()  // Track spending patterns (optional)
}
```

#### UIManager Class (managers/UIManager.js)
**Responsibilities**: HUD updates, button states, user feedback

```javascript
class UIManager {
    constructor(game)
    update()                 // Refresh all UI elements
    updateHUD()              // Update lives, money, wave info
    updateTowerButtons()     // Enable/disable based on affordability
    showGameOver()           // Display end game screen
    showVictory()            // Display victory screen
    handleTowerSelection()   // Process tower type selection
}
```

## Data Models

### Enemy Types Configuration
```javascript
const ENEMY_TYPES = {
    BASIC: {
        health: 100,
        speed: 60,        // pixels per second
        reward: 10,
        color: '#4CAF50',
        size: 20
    },
    TANK: {
        health: 300,
        speed: 30,
        reward: 25,
        color: '#9E9E9E',
        size: 25
    },
    FAST: {
        health: 60,
        speed: 120,
        reward: 15,
        color: '#F44336',
        size: 18
    }
};
```

### Tower Types Configuration
```javascript
const TOWER_TYPES = {
    BASIC: {
        damage: 25,
        range: 100,
        fireRate: 2,      // shots per second
        cost: 100,
        color: '#2196F3',
        projectileSpeed: 200
    },
    SNIPER: {
        damage: 80,
        range: 180,
        fireRate: 0.8,
        cost: 250,
        color: '#9C27B0',
        projectileSpeed: 400
    },
    AREA: {
        damage: 40,
        range: 80,
        fireRate: 1.2,
        cost: 175,
        color: '#FF9800',
        projectileSpeed: 150,
        splashRadius: 50
    }
};
```

### Wave Configuration
```javascript
const WAVE_DATA = [
    { enemies: [{ type: 'BASIC', count: 10, interval: 1000 }] },
    { enemies: [{ type: 'BASIC', count: 15, interval: 800 }] },
    { enemies: [
        { type: 'BASIC', count: 10, interval: 800 },
        { type: 'TANK', count: 3, interval: 2000 }
    ]},
    // ... progressive wave definitions
];
```

### Map and Grid System
```javascript
const MAP_CONFIG = {
    width: 800,
    height: 600,
    gridSize: 64,
    path: [
        {x: 0, y: 300},
        {x: 200, y: 300},
        {x: 200, y: 150},
        {x: 500, y: 150},
        {x: 500, y: 450},
        {x: 800, y: 450}
    ]
};
```

## Error Handling

### Input Validation
- **Tower Placement**: Validate grid position, path collision, and existing tower conflicts
- **Purchase Validation**: Check currency availability before allowing tower construction
- **Click Handling**: Ensure clicks are within canvas bounds and on valid targets

### Game State Management
- **Null Reference Protection**: Check entity existence before operations
- **Boundary Validation**: Ensure entities remain within canvas bounds
- **Memory Management**: Remove destroyed entities from arrays to prevent memory leaks

### Performance Safeguards
- **Frame Rate Monitoring**: Implement frame rate limiting and performance warnings
- **Entity Limits**: Cap maximum simultaneous entities to maintain performance
- **Collision Optimization**: Use spatial partitioning for efficient collision detection

## Testing Strategy

### Unit Testing Approach
- **Entity Behavior**: Test individual enemy movement, tower targeting, and projectile collision
- **Manager Functions**: Validate wave progression, economy transactions, and UI updates
- **Utility Functions**: Test helper functions for distance calculation and grid conversion

### Integration Testing
- **Game Loop**: Verify proper coordination between all systems during gameplay
- **User Interaction**: Test complete tower placement and enemy elimination workflows
- **State Transitions**: Validate game over, victory, and restart functionality

### Performance Testing
- **Load Testing**: Test with maximum expected entities (50 enemies, 20 towers)
- **Memory Testing**: Verify proper cleanup of destroyed entities
- **Frame Rate Testing**: Ensure consistent 60 FPS under normal conditions

### Browser Compatibility
- **Canvas Support**: Test rendering across modern browsers
- **Input Handling**: Verify mouse events work consistently
- **Performance**: Test on various devices and screen sizes

## Rendering Strategy

### Canvas Layers
1. **Background Layer**: Map, grid, and path rendering
2. **Entity Layer**: Enemies, towers, and projectiles
3. **UI Layer**: Health bars, range indicators, and effects
4. **HUD Layer**: Interface elements and text overlays

### Optimization Techniques
- **Dirty Rectangle**: Only redraw changed areas when possible
- **Object Pooling**: Reuse projectile and effect objects
- **Culling**: Skip rendering for off-screen entities
- **Efficient Collision**: Use bounding boxes before precise collision detection

This design provides a solid foundation for implementing all requirements while maintaining code clarity, performance, and extensibility.