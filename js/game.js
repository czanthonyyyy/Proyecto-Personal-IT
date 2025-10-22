/**
 * Clase Game principal que coordina todos los sistemas del juego Tower Defense
 * Maneja el bucle principal, estado del juego y coordinación entre sistemas
 */

class Game {
    /**
     * Constructor de la clase Game
     * @param {HTMLCanvasElement} canvas - Canvas del juego
     */
    constructor(canvas) {
        // Referencias del canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Estado del juego
        this.gameState = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.gameStartTime = 0;
        this.lastUpdateTime = 0;
        
        // Entidades del juego
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        
        // Sistemas del juego
        this.map = null;
        this.waveManager = null;
        this.economyManager = null;
        this.uiManager = null;
        
        // Estado del jugador
        this.lives = GAME_CONFIG.STARTING_LIVES;
        this.selectedTowerType = null;
        this.mousePosition = { x: 0, y: 0 };
        this.showingTowerPreview = false;
        
        // Configuración de rendimiento
        this.targetFPS = GAME_CONFIG.TARGET_FPS;
        this.frameTime = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsCounter = 0;
        this.lastFPSUpdate = 0;
        
        // Estadísticas del juego
        this.stats = {
            gameStartTime: 0,
            totalPlayTime: 0,
            enemiesSpawned: 0,
            enemiesKilled: 0,
            towersBuilt: 0,
            projectilesFired: 0,
            moneyEarned: 0,
            moneySpent: 0,
            wavesCompleted: 0,
            livesLost: 0
        };
        
        // Configuración de debug
        this.debugMode = PERFORMANCE_CONFIG.debugMode;
        this.showFPS = false;
        this.showEntityCount = false;
        
        console.log('Game inicializado');
    }
    
    /**
     * Inicializa todos los sistemas del juego
     */
    init() {
        try {
            // Inicializar sistemas
            this.initializeSystems();
            
            // Configurar callbacks
            this.setupCallbacks();
            
            // Configurar estado inicial
            this.setupInitialState();
            
            console.log('Juego inicializado correctamente');
            
        } catch (error) {
            console.error('Error al inicializar el juego:', error);
            throw error;
        }
    }
    
    /**
     * Inicializa todos los sistemas del juego
     */
    initializeSystems() {
        // Inicializar mapa
        this.map = new Map();
        
        // Inicializar gestores
        this.waveManager = new WaveManager();
        this.economyManager = new EconomyManager();
        this.uiManager = new UIManager(this);
        
        console.log('Sistemas inicializados');
    }
    
    /**
     * Configura los callbacks entre sistemas
     */
    setupCallbacks() {
        // Callbacks del WaveManager
        this.waveManager.setCallbacks({
            onEnemySpawn: (enemy) => this.handleEnemySpawn(enemy),
            onWaveStart: (waveNumber, waveData) => this.handleWaveStart(waveNumber, waveData),
            onWaveComplete: (waveNumber, time, waveData) => this.handleWaveComplete(waveNumber, time, waveData),
            onAllWavesComplete: (stats) => this.handleAllWavesComplete(stats)
        });
        
        // Callbacks del EconomyManager
        this.economyManager.setCallbacks({
            onMoneyChanged: (newMoney, oldMoney, change, type) => this.handleMoneyChanged(newMoney, oldMoney, change, type),
            onPurchase: (amount, purpose, metadata) => this.handlePurchase(amount, purpose, metadata),
            onEarnings: (amount, source, metadata) => this.handleEarnings(amount, source, metadata),
            onInsufficientFunds: (needed, available, purpose) => this.handleInsufficientFunds(needed, available, purpose)
        });
    }
    
    /**
     * Configura el estado inicial del juego
     */
    setupInitialState() {
        // Resetear estadísticas
        this.stats.gameStartTime = Date.now();
        this.gameStartTime = Date.now();
        
        // Estado inicial
        this.gameState = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.lives = GAME_CONFIG.STARTING_LIVES;
        
        // Limpiar entidades
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        
        console.log('Estado inicial configurado');
    }
    
    /**
     * Bucle principal de actualización del juego
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización en ms
     */
    update(deltaTime) {
        // No actualizar si está pausado
        if (this.isPaused || this.gameState === GAME_STATES.GAME_OVER) {
            return;
        }
        
        // Actualizar estadísticas de tiempo
        this.updateTimeStats(deltaTime);
        
        // Actualizar sistemas
        this.updateSystems(deltaTime);
        
        // Actualizar entidades
        this.updateEntities(deltaTime);
        
        // Procesar colisiones y interacciones
        this.processInteractions();
        
        // Limpiar entidades muertas
        this.cleanupEntities();
        
        // Verificar condiciones de juego
        this.checkGameConditions();
        
        // Actualizar contador de FPS
        this.updateFPSCounter();
    }
    
    /**
     * Actualiza las estadísticas de tiempo
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateTimeStats(deltaTime) {
        this.stats.totalPlayTime += deltaTime;
    }
    
    /**
     * Actualiza todos los sistemas del juego
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateSystems(deltaTime) {
        // Actualizar WaveManager
        this.waveManager.update(deltaTime, this.enemies);
        
        // Actualizar EconomyManager
        this.economyManager.update(deltaTime);
        
        // Actualizar UIManager
        this.uiManager.update(this.getGameState());
        
        // Actualizar sistema de partículas
        if (typeof particleSystem !== 'undefined') {
            particleSystem.update(deltaTime);
        }
    }
    
    /**
     * Actualiza todas las entidades del juego
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateEntities(deltaTime) {
        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            
            // Verificar si llegó al final
            if (enemy.hasReachedEnd() && enemy.isAlive()) {
                this.handleEnemyReachedEnd(enemy);
            }
        });
        
        // Actualizar torres
        this.towers.forEach(tower => {
            tower.update(this.enemies, deltaTime);
            
            // Procesar disparos
            if (tower.canShoot() && tower.target) {
                const projectile = tower.shoot();
                if (projectile) {
                    this.projectiles.push(projectile);
                    this.stats.projectilesFired++;
                }
            }
        });
        
        // Actualizar proyectiles
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime, this.enemies);
        });
    }
    
    /**
     * Procesa las interacciones entre entidades
     */
    processInteractions() {
        // Procesar impactos de proyectiles
        this.projectiles.forEach(projectile => {
            if (projectile.hasHit && !projectile.processed) {
                // Marcar como procesado para evitar múltiples procesamientos
                projectile.processed = true;
                
                // Registrar hit en la torre que disparó
                if (projectile.tower) {
                    projectile.tower.registerHit();
                }
            }
        });
    }
    
    /**
     * Limpia las entidades que deben ser removidas
     */
    cleanupEntities() {
        // Limpiar enemigos muertos o que llegaron al final
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive() && !enemy.hasReachedEnd()) {
                // Enemigo eliminado por torres
                if (!enemy.rewardProcessed) {
                    this.handleEnemyKilled(enemy);
                    enemy.rewardProcessed = true;
                }
                return false;
            }
            if (enemy.hasReachedEnd()) {
                return false;
            }
            return true;
        });
        
        // Limpiar proyectiles inactivos
        this.projectiles = this.projectiles.filter(projectile => {
            return projectile.isActive() && !projectile.isMarkedForRemoval();
        });
    }
    
    /**
     * Verifica las condiciones de victoria y derrota
     */
    checkGameConditions() {
        // Verificar Game Over
        if (this.lives <= 0) {
            this.triggerGameOver(false, 'Te quedaste sin vidas');
            return;
        }
        
        // Verificar Victoria
        const waveInfo = this.waveManager.getCurrentWaveInfo();
        if (waveInfo.allWavesComplete && this.enemies.length === 0) {
            this.triggerGameOver(true, '¡Has defendido tu base exitosamente!');
            return;
        }
    }
    
    /**
     * Actualiza el contador de FPS
     */
    updateFPSCounter() {
        this.frameCount++;
        const currentTime = Date.now();
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fpsCounter = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }
    
    /**
     * Renderiza todo el juego
     */
    render() {
        // Limpiar canvas
        this.clearCanvas();
        
        // Renderizar mapa
        this.map.render(this.ctx, true);
        
        // Renderizar preview de torre si corresponde
        if (this.selectedTowerType && this.showingTowerPreview) {
            this.map.renderPlacementPreview(
                this.ctx,
                this.mousePosition.x,
                this.mousePosition.y,
                this.selectedTowerType
            );
        }
        
        // Renderizar entidades
        this.renderEntities();
        
        // Renderizar información de debug si está habilitada
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }
    
    /**
     * Limpia el canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Renderiza todas las entidades del juego
     */
    renderEntities() {
        // Renderizar torres (primero para que estén debajo)
        this.towers.forEach(tower => tower.render(this.ctx));
        
        // Renderizar proyectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // Renderizar enemigos (último para que estén encima)
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Renderizar partículas (encima de todo)
        if (typeof particleSystem !== 'undefined') {
            particleSystem.render(this.ctx);
        }
    }
    
    /**
     * Renderiza información de debug
     */
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        let y = 10;
        const lineHeight = 15;
        
        // FPS
        if (this.showFPS) {
            this.ctx.fillText(`FPS: ${this.fpsCounter}`, 10, y);
            y += lineHeight;
        }
        
        // Contadores de entidades
        if (this.showEntityCount) {
            this.ctx.fillText(`Enemigos: ${this.enemies.length}`, 10, y);
            y += lineHeight;
            this.ctx.fillText(`Torres: ${this.towers.length}`, 10, y);
            y += lineHeight;
            this.ctx.fillText(`Proyectiles: ${this.projectiles.length}`, 10, y);
            y += lineHeight;
        }
        
        // Estado del juego
        this.ctx.fillText(`Estado: ${this.gameState}`, 10, y);
        y += lineHeight;
        this.ctx.fillText(`Vidas: ${this.lives}`, 10, y);
        y += lineHeight;
        this.ctx.fillText(`Dinero: ${this.economyManager.getFormattedMoney()}`, 10, y);
        
        this.ctx.restore();
    }
    
    /**
     * Maneja los clics del mouse en el canvas
     * @param {number} x - Coordenada X del clic
     * @param {number} y - Coordenada Y del clic
     */
    handleClick(x, y) {
        if (this.gameState === GAME_STATES.GAME_OVER || this.isPaused) {
            return;
        }
        
        // Si hay una torre seleccionada, intentar colocarla
        if (this.selectedTowerType) {
            this.attemptTowerPlacement(x, y);
        } else {
            // Seleccionar torre existente
            this.selectTowerAt(x, y);
        }
    }
    
    /**
     * Intenta colocar una torre en la posición especificada
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    attemptTowerPlacement(x, y) {
        const gridPos = this.map.pixelToGrid(x, y);
        
        // Verificar si la posición es válida
        if (!this.map.isValidTowerPlacement(gridPos.gridX, gridPos.gridY)) {
            console.log('Posición inválida para colocar torre');
            return;
        }
        
        // Verificar si se puede comprar la torre
        if (!this.economyManager.processTowerPurchase(this.selectedTowerType, x, y)) {
            console.log('No hay suficiente dinero para comprar la torre');
            return;
        }
        
        // Crear y colocar la torre
        const pixelPos = this.map.gridToPixel(gridPos.gridX, gridPos.gridY);
        const tower = new Tower(this.selectedTowerType, pixelPos.pixelX, pixelPos.pixelY);
        
        this.towers.push(tower);
        this.map.occupyCell(gridPos.gridX, gridPos.gridY, this.selectedTowerType);
        
        // Actualizar estadísticas
        this.stats.towersBuilt++;
        this.stats.moneySpent += TOWER_TYPES[this.selectedTowerType].cost;
        
        console.log(`Torre ${this.selectedTowerType} colocada en (${pixelPos.pixelX}, ${pixelPos.pixelY})`);
        
        // Deseleccionar torre después de colocar
        this.selectTowerType(null);
    }
    
    /**
     * Selecciona una torre existente en la posición especificada
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    selectTowerAt(x, y) {
        // Deseleccionar todas las torres primero
        this.towers.forEach(tower => tower.setSelected(false));
        
        // Buscar torre en la posición
        const selectedTower = this.towers.find(tower => {
            const towerPos = tower.getPosition();
            const dist = distance(x, y, towerPos.x, towerPos.y);
            return dist <= TOWER_TYPES[tower.type].size / 2;
        });
        
        if (selectedTower) {
            selectedTower.setSelected(true);
            console.log(`Torre ${selectedTower.type} seleccionada`);
        }
    }
    
    /**
     * Maneja el movimiento del mouse
     * @param {number} x - Coordenada X del mouse
     * @param {number} y - Coordenada Y del mouse
     */
    handleMouseMove(x, y) {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
        
        // Mostrar preview si hay torre seleccionada
        this.showingTowerPreview = this.selectedTowerType !== null;
    }
    
    /**
     * Maneja cuando el mouse sale del canvas
     */
    handleMouseLeave() {
        this.showingTowerPreview = false;
    }
    
    /**
     * Selecciona un tipo de torre
     * @param {string} towerType - Tipo de torre a seleccionar
     */
    selectTowerType(towerType) {
        this.selectedTowerType = towerType;
        this.uiManager.selectTowerType(towerType);
        
        // Deseleccionar torres existentes
        this.towers.forEach(tower => tower.setSelected(false));
    }
    
    /**
     * Inicia la siguiente oleada
     */
    startNextWave() {
        this.waveManager.startNextWave(true);
    }
    
    /**
     * Alterna el estado de pausa
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.gameState = GAME_STATES.PAUSED;
            console.log('Juego pausado');
        } else {
            this.gameState = GAME_STATES.PLAYING;
            console.log('Juego reanudado');
        }
    }
    
    /**
     * Verifica si el juego está pausado
     * @returns {boolean} True si está pausado
     */
    isPaused() {
        return this.isPaused;
    }
    
    /**
     * Obtiene el estado actual del juego para la UI
     * @returns {Object} Estado del juego
     */
    getGameState() {
        const waveInfo = this.waveManager.getCurrentWaveInfo();
        
        return {
            // Estado básico
            gameState: this.gameState,
            isPaused: this.isPaused,
            gameOver: this.gameState === GAME_STATES.GAME_OVER,
            
            // Información del jugador
            lives: this.lives,
            money: this.economyManager.getMoney(),
            
            // Información de oleadas
            currentWave: waveInfo.currentWave,
            totalWaves: waveInfo.totalWaves,
            waveInProgress: waveInfo.waveInProgress,
            enemiesRemaining: waveInfo.enemiesRemaining,
            isCountingDown: waveInfo.isCountingDown,
            countdownTime: waveInfo.countdownTime,
            canStartWave: waveInfo.canStartWave,
            allWavesComplete: waveInfo.allWavesComplete,
            
            // Información de entidades
            enemyCount: this.enemies.length,
            towerCount: this.towers.length,
            projectileCount: this.projectiles.length
        };
    }
    
    // Handlers de eventos
    
    /**
     * Maneja el spawn de un nuevo enemigo
     * @param {Enemy} enemy - Enemigo spawneado
     */
    handleEnemySpawn(enemy) {
        this.enemies.push(enemy);
        this.stats.enemiesSpawned++;
        console.log(`Enemigo ${enemy.type} spawneado`);
    }
    
    /**
     * Maneja el inicio de una oleada
     * @param {number} waveNumber - Número de oleada
     * @param {Object} waveData - Datos de la oleada
     */
    handleWaveStart(waveNumber, waveData) {
        console.log(`Oleada ${waveNumber} iniciada`);
        this.uiManager.showNotification(`Oleada ${waveNumber} iniciada`, 'info');
    }
    
    /**
     * Maneja la finalización de una oleada
     * @param {number} waveNumber - Número de oleada
     * @param {number} time - Tiempo que tomó completar
     * @param {Object} waveData - Datos de la oleada
     */
    handleWaveComplete(waveNumber, time, waveData) {
        this.stats.wavesCompleted++;
        
        // Bonificación por completar oleada
        if (waveData.reward) {
            this.economyManager.addMoney(waveData.reward, 'wave_bonus', { waveNumber });
        }
        
        console.log(`Oleada ${waveNumber} completada en ${Math.round(time / 1000)}s`);
        this.uiManager.showNotification(`Oleada ${waveNumber} completada`, 'success');
    }
    
    /**
     * Maneja la finalización de todas las oleadas
     * @param {Object} stats - Estadísticas finales
     */
    handleAllWavesComplete(stats) {
        this.triggerGameOver(true, '¡Has completado todas las oleadas!');
    }
    
    /**
     * Maneja cuando un enemigo llega al final del camino
     * @param {Enemy} enemy - Enemigo que llegó al final
     */
    handleEnemyReachedEnd(enemy) {
        this.lives--;
        this.stats.livesLost++;
        
        console.log(`Enemigo ${enemy.type} llegó al final. Vidas restantes: ${this.lives}`);
        this.uiManager.showNotification(`¡Perdiste una vida! Vidas: ${this.lives}`, 'warning');
        
        // Marcar enemigo como procesado
        enemy.alive = false;
    }
    
    /**
     * Maneja cuando un enemigo es eliminado
     * @param {Enemy} enemy - Enemigo eliminado
     */
    handleEnemyKilled(enemy) {
        this.stats.enemiesKilled++;
        
        // Procesar recompensa
        const reward = this.economyManager.processEnemyKillReward(enemy);
        this.stats.moneyEarned += reward;
        
        console.log(`Enemigo ${enemy.type} eliminado. Recompensa: $${reward}`);
    }
    
    /**
     * Maneja cambios en el dinero
     * @param {number} newMoney - Nueva cantidad
     * @param {number} oldMoney - Cantidad anterior
     * @param {number} change - Cambio
     * @param {string} type - Tipo de cambio
     */
    handleMoneyChanged(newMoney, oldMoney, change, type) {
        // La UI se actualiza automáticamente
    }
    
    /**
     * Maneja compras
     * @param {number} amount - Cantidad gastada
     * @param {string} purpose - Propósito
     * @param {Object} metadata - Metadatos
     */
    handlePurchase(amount, purpose, metadata) {
        if (purpose === 'tower_purchase') {
            console.log(`Torre ${metadata.towerType} comprada por $${amount}`);
        }
    }
    
    /**
     * Maneja ganancias
     * @param {number} amount - Cantidad ganada
     * @param {string} source - Fuente
     * @param {Object} metadata - Metadatos
     */
    handleEarnings(amount, source, metadata) {
        // Efectos visuales manejados por UI
    }
    
    /**
     * Maneja fondos insuficientes
     * @param {number} needed - Cantidad necesaria
     * @param {number} available - Cantidad disponible
     * @param {string} purpose - Propósito
     */
    handleInsufficientFunds(needed, available, purpose) {
        this.uiManager.showNotification(
            `Fondos insuficientes. Necesitas $${needed - available} más`,
            'warning'
        );
    }
    
    /**
     * Activa el game over
     * @param {boolean} isVictory - Si es victoria o derrota
     * @param {string} message - Mensaje
     */
    triggerGameOver(isVictory, message) {
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Calcular estadísticas finales
        const finalStats = {
            ...this.stats,
            totalPlayTime: Date.now() - this.stats.gameStartTime,
            finalMoney: this.economyManager.getMoney(),
            finalLives: this.lives,
            efficiency: this.stats.enemiesKilled / Math.max(1, this.stats.enemiesSpawned)
        };
        
        console.log(isVictory ? 'VICTORIA!' : 'GAME OVER');
        console.log('Estadísticas finales:', finalStats);
        
        // Mostrar pantalla de game over
        this.uiManager.showGameOverScreen(isVictory, message, finalStats);
    }
    
    /**
     * Resetea el juego a su estado inicial
     */
    reset() {
        console.log('Reseteando juego...');
        
        // Resetear sistemas
        this.waveManager.reset();
        this.economyManager.reset();
        this.uiManager.reset();
        this.map.reset();
        
        // Resetear estado
        this.setupInitialState();
        
        // Resetear estadísticas
        this.stats = {
            gameStartTime: Date.now(),
            totalPlayTime: 0,
            enemiesSpawned: 0,
            enemiesKilled: 0,
            towersBuilt: 0,
            projectilesFired: 0,
            moneyEarned: 0,
            moneySpent: 0,
            wavesCompleted: 0,
            livesLost: 0
        };
        
        console.log('Juego reseteado');
    }
    
    /**
     * Obtiene las estadísticas del juego
     * @returns {Object} Estadísticas completas
     */
    getStats() {
        return {
            ...this.stats,
            currentPlayTime: Date.now() - this.stats.gameStartTime,
            waveStats: this.waveManager.getStats(),
            economyStats: this.economyManager.getStats()
        };
    }
    
    /**
     * Obtiene información de debug del juego
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            gameState: this.gameState,
            isPaused: this.isPaused,
            lives: this.lives,
            selectedTowerType: this.selectedTowerType,
            entityCounts: {
                enemies: this.enemies.length,
                towers: this.towers.length,
                projectiles: this.projectiles.length
            },
            performance: {
                fps: this.fpsCounter,
                frameCount: this.frameCount
            },
            systems: {
                wave: this.waveManager.getDebugInfo(),
                economy: this.economyManager.getDebugInfo(),
                ui: this.uiManager.getDebugInfo()
            }
        };
    }
}