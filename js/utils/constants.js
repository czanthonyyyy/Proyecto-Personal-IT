/**
 * Constantes de configuración del juego Tower Defense
 * Contiene todas las configuraciones de enemigos, torres, mapa y juego
 */

// Configuración general del juego
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    GRID_SIZE: 64,
    STARTING_LIVES: 20,
    STARTING_MONEY: 500,
    TOTAL_WAVES: 10,
    WAVE_INTERVAL: 8000, // 8 segundos entre oleadas
    ENEMY_SPAWN_INTERVAL: 1000 // 1 segundo entre enemigos
};

// Estados del juego
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WAVE_COMPLETE: 'wave_complete',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// Tipos de enemigos
const ENEMY_TYPES = {
    BASIC: {
        name: 'Básico',
        health: 100,
        maxHealth: 100,
        speed: 60, // pixels por segundo
        reward: 10,
        color: '#4CAF50',
        size: 20,
        pathSpeed: 1.0 // Multiplicador de velocidad en el camino
    },
    TANK: {
        name: 'Tanque',
        health: 300,
        maxHealth: 300,
        speed: 30,
        reward: 25,
        color: '#9E9E9E',
        size: 25,
        pathSpeed: 0.8
    },
    FAST: {
        name: 'Rápido',
        health: 60,
        maxHealth: 60,
        speed: 120,
        reward: 15,
        color: '#F44336',
        size: 18,
        pathSpeed: 1.5
    }
};

// Tipos de torres
const TOWER_TYPES = {
    BASIC: {
        name: 'Torre Básica',
        damage: 25,
        range: 100,
        fireRate: 2.0, // disparos por segundo
        cost: 100,
        color: '#2196F3',
        size: 40,
        projectileSpeed: 200,
        projectileColor: '#64B5F6',
        projectileSize: 6,
        splash: false,
        splashRadius: 0
    },
    SNIPER: {
        name: 'Torre Sniper',
        damage: 80,
        range: 180,
        fireRate: 0.8,
        cost: 250,
        color: '#9C27B0',
        size: 40,
        projectileSpeed: 400,
        projectileColor: '#BA68C8',
        projectileSize: 8,
        splash: false,
        splashRadius: 0
    },
    AREA: {
        name: 'Torre de Área',
        damage: 40,
        range: 80,
        fireRate: 1.2,
        cost: 175,
        color: '#FF9800',
        size: 40,
        projectileSpeed: 150,
        projectileColor: '#FFB74D',
        projectileSize: 10,
        splash: true,
        splashRadius: 50
    }
};

// Configuración del mapa
const MAP_CONFIG = {
    width: GAME_CONFIG.CANVAS_WIDTH,
    height: GAME_CONFIG.CANVAS_HEIGHT,
    gridSize: GAME_CONFIG.GRID_SIZE,
    backgroundColor: '#388E3C', // Verde césped
    pathColor: '#D7CCC8', // Marrón claro
    gridColor: '#BDBDBD', // Gris suave
    pathWidth: 40,
    gridOpacity: 0.3
};

// Configuración de las oleadas
const WAVE_DATA = [
    // Oleada 1: 10 enemigos básicos
    {
        waveNumber: 1,
        enemies: [
            { type: 'BASIC', count: 10, spawnInterval: 1000 }
        ],
        reward: 50
    },
    // Oleada 2: 15 enemigos básicos
    {
        waveNumber: 2,
        enemies: [
            { type: 'BASIC', count: 15, spawnInterval: 800 }
        ],
        reward: 75
    },
    // Oleada 3: 10 básicos + 3 tanques
    {
        waveNumber: 3,
        enemies: [
            { type: 'BASIC', count: 10, spawnInterval: 800 },
            { type: 'TANK', count: 3, spawnInterval: 2000 }
        ],
        reward: 100
    },
    // Oleada 4: 15 básicos + 5 tanques
    {
        waveNumber: 4,
        enemies: [
            { type: 'BASIC', count: 15, spawnInterval: 700 },
            { type: 'TANK', count: 5, spawnInterval: 1800 }
        ],
        reward: 125
    },
    // Oleada 5: 20 básicos + 8 tanques + 2 rápidos
    {
        waveNumber: 5,
        enemies: [
            { type: 'BASIC', count: 20, spawnInterval: 600 },
            { type: 'TANK', count: 8, spawnInterval: 1500 },
            { type: 'FAST', count: 2, spawnInterval: 3000 }
        ],
        reward: 150
    },
    // Oleada 6: 25 básicos + 10 tanques + 5 rápidos
    {
        waveNumber: 6,
        enemies: [
            { type: 'BASIC', count: 25, spawnInterval: 500 },
            { type: 'TANK', count: 10, spawnInterval: 1200 },
            { type: 'FAST', count: 5, spawnInterval: 2500 }
        ],
        reward: 200
    },
    // Oleada 7: 30 básicos + 12 tanques + 8 rápidos
    {
        waveNumber: 7,
        enemies: [
            { type: 'BASIC', count: 30, spawnInterval: 400 },
            { type: 'TANK', count: 12, spawnInterval: 1000 },
            { type: 'FAST', count: 8, spawnInterval: 2000 }
        ],
        reward: 250
    },
    // Oleada 8: 35 básicos + 15 tanques + 12 rápidos
    {
        waveNumber: 8,
        enemies: [
            { type: 'BASIC', count: 35, spawnInterval: 350 },
            { type: 'TANK', count: 15, spawnInterval: 800 },
            { type: 'FAST', count: 12, spawnInterval: 1500 }
        ],
        reward: 300
    },
    // Oleada 9: 40 básicos + 20 tanques + 15 rápidos
    {
        waveNumber: 9,
        enemies: [
            { type: 'BASIC', count: 40, spawnInterval: 300 },
            { type: 'TANK', count: 20, spawnInterval: 600 },
            { type: 'FAST', count: 15, spawnInterval: 1200 }
        ],
        reward: 400
    },
    // Oleada 10: 50 básicos + 25 tanques + 20 rápidos (Final)
    {
        waveNumber: 10,
        enemies: [
            { type: 'BASIC', count: 50, spawnInterval: 250 },
            { type: 'TANK', count: 25, spawnInterval: 500 },
            { type: 'FAST', count: 20, spawnInterval: 1000 }
        ],
        reward: 500
    }
];

// Configuración de efectos visuales
const VISUAL_CONFIG = {
    // Efectos de explosión
    explosion: {
        duration: 300, // milisegundos
        maxRadius: 30,
        color: '#FF5722',
        particles: 8
    },
    
    // Efectos de daño
    damageText: {
        duration: 1000,
        fontSize: 14,
        color: '#F44336',
        velocity: -50 // pixels por segundo hacia arriba
    },
    
    // Efectos de rango de torre
    rangeIndicator: {
        color: 'rgba(33, 150, 243, 0.3)',
        borderColor: '#2196F3',
        borderWidth: 2
    },
    
    // Efectos de selección
    selection: {
        color: 'rgba(231, 76, 60, 0.5)',
        borderColor: '#E74C3C',
        borderWidth: 3
    }
};

// Configuración de audio (para futuras implementaciones)
const AUDIO_CONFIG = {
    enabled: false, // Deshabilitado por defecto
    volume: 0.5,
    sounds: {
        shoot: 'assets/sounds/shoot.wav',
        explosion: 'assets/sounds/explosion.wav',
        enemyDeath: 'assets/sounds/enemy_death.wav',
        waveStart: 'assets/sounds/wave_start.wav',
        gameOver: 'assets/sounds/game_over.wav',
        victory: 'assets/sounds/victory.wav'
    }
};

// Configuración de rendimiento
const PERFORMANCE_CONFIG = {
    maxEnemies: 50,
    maxProjectiles: 100,
    maxParticles: 200,
    cullOffscreen: true,
    useObjectPooling: true,
    debugMode: false
};

// Exportar todas las constantes (para compatibilidad con módulos ES6 si se necesita)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        GAME_STATES,
        ENEMY_TYPES,
        TOWER_TYPES,
        MAP_CONFIG,
        WAVE_DATA,
        VISUAL_CONFIG,
        AUDIO_CONFIG,
        PERFORMANCE_CONFIG
    };
}