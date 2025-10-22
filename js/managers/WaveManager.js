/**
 * Clase WaveManager para gestionar las oleadas de enemigos
 * Controla el spawn, progresión y timing de las oleadas
 */

class WaveManager {
    /**
     * Constructor del WaveManager
     * @param {Array} waveData - Datos de configuración de las oleadas
     */
    constructor(waveData = WAVE_DATA) {
        // Configuración de oleadas
        this.waveData = [...waveData];
        this.totalWaves = this.waveData.length;
        
        // Estado actual
        this.currentWave = 0;
        this.waveInProgress = false;
        this.waveComplete = false;
        this.allWavesComplete = false;
        
        // Control de spawn
        this.enemiesSpawned = 0;
        this.enemiesToSpawn = 0;
        this.spawnQueue = [];
        this.lastSpawnTime = 0;
        this.nextSpawnTime = 0;
        
        // Timing
        this.waveStartTime = 0;
        this.timeBetweenWaves = GAME_CONFIG.WAVE_INTERVAL;
        this.waveCountdown = 0;
        this.isCountingDown = false;
        
        // Estadísticas
        this.stats = {
            totalEnemiesSpawned: 0,
            totalWavesCompleted: 0,
            averageWaveTime: 0,
            fastestWave: Infinity,
            slowestWave: 0
        };
        
        // Referencias a entidades del juego
        this.enemies = [];
        this.onEnemySpawn = null; // Callback para cuando se spawna un enemigo
        this.onWaveStart = null; // Callback para cuando inicia una oleada
        this.onWaveComplete = null; // Callback para cuando se completa una oleada
        this.onAllWavesComplete = null; // Callback para cuando se completan todas las oleadas
        
        console.log(`WaveManager inicializado con ${this.totalWaves} oleadas`);
    }
    
    /**
     * Actualiza el WaveManager cada frame
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en ms
     * @param {Array} currentEnemies - Array de enemigos actualmente en el juego
     */
    update(deltaTime, currentEnemies) {
        this.enemies = currentEnemies;
        
        // Actualizar countdown entre oleadas
        if (this.isCountingDown) {
            this.updateCountdown(deltaTime);
        }
        
        // Procesar spawn de enemigos si hay oleada en progreso
        if (this.waveInProgress) {
            this.processEnemySpawning(deltaTime);
            this.checkWaveCompletion();
        }
        
        // Verificar si todas las oleadas están completas
        this.checkAllWavesComplete();
    }
    
    /**
     * Inicia la siguiente oleada
     * @param {boolean} manual - Si la oleada fue iniciada manualmente
     * @returns {boolean} True si se pudo iniciar la oleada
     */
    startNextWave(manual = false) {
        // Verificar si se puede iniciar una nueva oleada
        if (this.waveInProgress || this.allWavesComplete) {
            return false;
        }
        
        // Verificar si hay oleadas disponibles
        if (this.currentWave >= this.totalWaves) {
            this.completeAllWaves();
            return false;
        }
        
        // Detener countdown si se inicia manualmente
        if (manual && this.isCountingDown) {
            this.isCountingDown = false;
            this.waveCountdown = 0;
        }
        
        // Iniciar oleada
        this.initializeWave();
        
        console.log(`Iniciando oleada ${this.currentWave + 1}/${this.totalWaves}`);
        
        // Ejecutar callback
        if (this.onWaveStart) {
            this.onWaveStart(this.currentWave + 1, this.getCurrentWaveData());
        }
        
        return true;
    }
    
    /**
     * Inicializa la oleada actual
     */
    initializeWave() {
        const waveData = this.getCurrentWaveData();
        if (!waveData) return;
        
        // Configurar estado de oleada
        this.waveInProgress = true;
        this.waveComplete = false;
        this.waveStartTime = Date.now();
        
        // Preparar cola de spawn
        this.prepareSpawnQueue(waveData);
        
        // Resetear contadores
        this.enemiesSpawned = 0;
        this.lastSpawnTime = Date.now();
        this.nextSpawnTime = this.lastSpawnTime + this.getNextSpawnDelay();
    }
    
    /**
     * Prepara la cola de spawn basada en los datos de la oleada
     * @param {Object} waveData - Datos de la oleada actual
     */
    prepareSpawnQueue(waveData) {
        this.spawnQueue = [];
        this.enemiesToSpawn = 0;
        
        // Procesar cada tipo de enemigo en la oleada
        for (const enemyGroup of waveData.enemies) {
            for (let i = 0; i < enemyGroup.count; i++) {
                this.spawnQueue.push({
                    type: enemyGroup.type,
                    spawnTime: this.enemiesToSpawn * enemyGroup.spawnInterval
                });
                this.enemiesToSpawn++;
            }
        }
        
        // Mezclar la cola para variedad (opcional)
        if (this.shouldShuffleSpawnOrder()) {
            this.shuffleSpawnQueue();
        }
        
        console.log(`Cola de spawn preparada: ${this.enemiesToSpawn} enemigos`);
    }
    
    /**
     * Determina si se debe mezclar el orden de spawn
     * @returns {boolean} True si se debe mezclar
     */
    shouldShuffleSpawnOrder() {
        // Mezclar solo en oleadas avanzadas para mayor desafío
        return this.currentWave >= 3;
    }
    
    /**
     * Mezcla la cola de spawn manteniendo intervalos apropiados
     */
    shuffleSpawnQueue() {
        // Algoritmo Fisher-Yates para mezclar
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }
        
        // Reajustar tiempos de spawn después de mezclar
        this.spawnQueue.forEach((enemy, index) => {
            enemy.spawnTime = index * 800; // 800ms base entre enemigos mezclados
        });
    }
    
    /**
     * Procesa el spawn de enemigos
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    processEnemySpawning(deltaTime) {
        if (this.enemiesSpawned >= this.enemiesToSpawn) return;
        
        const currentTime = Date.now();
        
        // Verificar si es tiempo de spawnar el siguiente enemigo
        if (currentTime >= this.nextSpawnTime) {
            this.spawnNextEnemy();
        }
    }
    
    /**
     * Spawna el siguiente enemigo en la cola
     */
    spawnNextEnemy() {
        if (this.enemiesSpawned >= this.spawnQueue.length) return;
        
        const enemyData = this.spawnQueue[this.enemiesSpawned];
        
        // Crear enemigo
        const enemy = new Enemy(enemyData.type);
        
        // Ejecutar callback de spawn
        if (this.onEnemySpawn) {
            this.onEnemySpawn(enemy);
        }
        
        // Actualizar contadores
        this.enemiesSpawned++;
        this.stats.totalEnemiesSpawned++;
        
        // Programar siguiente spawn
        this.lastSpawnTime = Date.now();
        this.nextSpawnTime = this.lastSpawnTime + this.getNextSpawnDelay();
        
        console.log(`Enemigo ${enemy.type} spawneado (${this.enemiesSpawned}/${this.enemiesToSpawn})`);
    }
    
    /**
     * Calcula el delay hasta el siguiente spawn
     * @returns {number} Delay en milisegundos
     */
    getNextSpawnDelay() {
        if (this.enemiesSpawned >= this.spawnQueue.length) {
            return 0;
        }
        
        const nextEnemy = this.spawnQueue[this.enemiesSpawned];
        const currentEnemy = this.spawnQueue[this.enemiesSpawned - 1];
        
        if (!currentEnemy) {
            return nextEnemy.spawnTime;
        }
        
        return Math.max(500, nextEnemy.spawnTime - currentEnemy.spawnTime); // Mínimo 500ms
    }
    
    /**
     * Verifica si la oleada actual está completa
     */
    checkWaveCompletion() {
        if (this.waveComplete) return;
        
        // Verificar si todos los enemigos han sido spawneados
        const allSpawned = this.enemiesSpawned >= this.enemiesToSpawn;
        
        // Verificar si no quedan enemigos vivos
        const noEnemiesAlive = this.enemies.length === 0 || 
                              this.enemies.every(enemy => !enemy.isAlive());
        
        if (allSpawned && noEnemiesAlive) {
            this.completeCurrentWave();
        }
    }
    
    /**
     * Completa la oleada actual
     */
    completeCurrentWave() {
        if (this.waveComplete) return;
        
        this.waveComplete = true;
        this.waveInProgress = false;
        
        // Calcular estadísticas de la oleada
        const waveTime = Date.now() - this.waveStartTime;
        this.updateWaveStats(waveTime);
        
        // Avanzar a la siguiente oleada
        this.currentWave++;
        this.stats.totalWavesCompleted++;
        
        console.log(`Oleada ${this.currentWave}/${this.totalWaves} completada en ${Math.round(waveTime / 1000)}s`);
        
        // Ejecutar callback
        if (this.onWaveComplete) {
            this.onWaveComplete(this.currentWave, waveTime, this.getCurrentWaveData());
        }
        
        // Iniciar countdown para la siguiente oleada si no es la última
        if (this.currentWave < this.totalWaves) {
            this.startWaveCountdown();
        }
    }
    
    /**
     * Actualiza las estadísticas de oleadas
     * @param {number} waveTime - Tiempo que tomó completar la oleada
     */
    updateWaveStats(waveTime) {
        // Actualizar tiempo promedio
        const totalTime = this.stats.averageWaveTime * (this.stats.totalWavesCompleted - 1) + waveTime;
        this.stats.averageWaveTime = totalTime / this.stats.totalWavesCompleted;
        
        // Actualizar récords
        if (waveTime < this.stats.fastestWave) {
            this.stats.fastestWave = waveTime;
        }
        if (waveTime > this.stats.slowestWave) {
            this.stats.slowestWave = waveTime;
        }
    }
    
    /**
     * Inicia el countdown entre oleadas
     */
    startWaveCountdown() {
        this.isCountingDown = true;
        this.waveCountdown = this.timeBetweenWaves;
        
        console.log(`Countdown iniciado: ${this.waveCountdown / 1000}s hasta la siguiente oleada`);
    }
    
    /**
     * Actualiza el countdown entre oleadas
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateCountdown(deltaTime) {
        if (!this.isCountingDown) return;
        
        this.waveCountdown -= deltaTime;
        
        if (this.waveCountdown <= 0) {
            this.isCountingDown = false;
            this.waveCountdown = 0;
            
            // Auto-iniciar siguiente oleada
            this.startNextWave(false);
        }
    }
    
    /**
     * Verifica si todas las oleadas están completas
     */
    checkAllWavesComplete() {
        if (this.allWavesComplete) return;
        
        if (this.currentWave >= this.totalWaves && !this.waveInProgress) {
            this.completeAllWaves();
        }
    }
    
    /**
     * Completa todas las oleadas
     */
    completeAllWaves() {
        if (this.allWavesComplete) return;
        
        this.allWavesComplete = true;
        this.isCountingDown = false;
        
        console.log('¡Todas las oleadas completadas!');
        
        // Ejecutar callback
        if (this.onAllWavesComplete) {
            this.onAllWavesComplete(this.stats);
        }
    }
    
    /**
     * Obtiene los datos de la oleada actual
     * @returns {Object|null} Datos de la oleada o null si no hay más oleadas
     */
    getCurrentWaveData() {
        if (this.currentWave >= this.waveData.length) {
            return null;
        }
        return this.waveData[this.currentWave];
    }
    
    /**
     * Obtiene información de la oleada actual para mostrar en UI
     * @returns {Object} Información de la oleada
     */
    getCurrentWaveInfo() {
        return {
            currentWave: this.currentWave + 1,
            totalWaves: this.totalWaves,
            waveInProgress: this.waveInProgress,
            enemiesSpawned: this.enemiesSpawned,
            enemiesToSpawn: this.enemiesToSpawn,
            enemiesRemaining: Math.max(0, this.enemiesToSpawn - this.enemiesSpawned),
            isCountingDown: this.isCountingDown,
            countdownTime: Math.max(0, Math.ceil(this.waveCountdown / 1000)),
            allWavesComplete: this.allWavesComplete,
            canStartWave: !this.waveInProgress && !this.allWavesComplete && this.currentWave < this.totalWaves
        };
    }
    
    /**
     * Obtiene el progreso total del juego
     * @returns {number} Progreso del 0 al 1
     */
    getGameProgress() {
        return Math.min(1, this.currentWave / this.totalWaves);
    }
    
    /**
     * Obtiene las estadísticas del WaveManager
     * @returns {Object} Estadísticas completas
     */
    getStats() {
        return {
            ...this.stats,
            currentWave: this.currentWave + 1,
            totalWaves: this.totalWaves,
            gameProgress: this.getGameProgress(),
            averageWaveTimeFormatted: formatTime(this.stats.averageWaveTime),
            fastestWaveFormatted: this.stats.fastestWave !== Infinity ? formatTime(this.stats.fastestWave) : 'N/A',
            slowestWaveFormatted: formatTime(this.stats.slowestWave)
        };
    }
    
    /**
     * Configura los callbacks del WaveManager
     * @param {Object} callbacks - Objeto con funciones callback
     */
    setCallbacks(callbacks) {
        if (callbacks.onEnemySpawn) this.onEnemySpawn = callbacks.onEnemySpawn;
        if (callbacks.onWaveStart) this.onWaveStart = callbacks.onWaveStart;
        if (callbacks.onWaveComplete) this.onWaveComplete = callbacks.onWaveComplete;
        if (callbacks.onAllWavesComplete) this.onAllWavesComplete = callbacks.onAllWavesComplete;
    }
    
    /**
     * Pausa el WaveManager
     */
    pause() {
        // Pausar spawning y countdown
        this.isPaused = true;
    }
    
    /**
     * Reanuda el WaveManager
     */
    resume() {
        // Reanudar spawning y countdown
        this.isPaused = false;
        
        // Ajustar tiempos para compensar la pausa
        const currentTime = Date.now();
        if (this.waveInProgress) {
            this.nextSpawnTime = currentTime + this.getNextSpawnDelay();
        }
    }
    
    /**
     * Resetea el WaveManager a su estado inicial
     */
    reset() {
        // Resetear estado
        this.currentWave = 0;
        this.waveInProgress = false;
        this.waveComplete = false;
        this.allWavesComplete = false;
        
        // Resetear spawn
        this.enemiesSpawned = 0;
        this.enemiesToSpawn = 0;
        this.spawnQueue = [];
        this.lastSpawnTime = 0;
        this.nextSpawnTime = 0;
        
        // Resetear timing
        this.waveStartTime = 0;
        this.waveCountdown = 0;
        this.isCountingDown = false;
        this.isPaused = false;
        
        // Resetear estadísticas
        this.stats = {
            totalEnemiesSpawned: 0,
            totalWavesCompleted: 0,
            averageWaveTime: 0,
            fastestWave: Infinity,
            slowestWave: 0
        };
        
        // Limpiar referencias
        this.enemies = [];
        
        console.log('WaveManager reseteado');
    }
    
    /**
     * Obtiene información de debug del WaveManager
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            currentWave: this.currentWave + 1,
            totalWaves: this.totalWaves,
            waveInProgress: this.waveInProgress,
            enemiesSpawned: this.enemiesSpawned,
            enemiesToSpawn: this.enemiesToSpawn,
            spawnQueueLength: this.spawnQueue.length,
            isCountingDown: this.isCountingDown,
            countdownTime: Math.round(this.waveCountdown),
            allWavesComplete: this.allWavesComplete,
            stats: this.stats
        };
    }
}