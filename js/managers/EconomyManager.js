/**
 * Clase EconomyManager para gestionar la economía del juego
 * Controla el dinero, transacciones, recompensas y validaciones de compra
 */

class EconomyManager {
    /**
     * Constructor del EconomyManager
     * @param {number} startingMoney - Dinero inicial del jugador
     */
    constructor(startingMoney = GAME_CONFIG.STARTING_MONEY) {
        // Estado económico
        this.money = startingMoney;
        this.startingMoney = startingMoney;
        
        // Historial de transacciones
        this.transactions = [];
        this.maxTransactionHistory = 100; // Límite de transacciones guardadas
        
        // Estadísticas económicas
        this.stats = {
            totalEarned: 0,
            totalSpent: 0,
            enemiesKilledForMoney: 0,
            towersBuilt: 0,
            averageEarningsPerEnemy: 0,
            biggestTransaction: 0,
            totalTransactions: 0
        };
        
        // Multiplicadores y bonificaciones
        this.earningsMultiplier = 1.0;
        this.costMultiplier = 1.0;
        this.bonusActive = false;
        this.bonusEndTime = 0;
        
        // Callbacks para eventos económicos
        this.onMoneyChanged = null;
        this.onPurchase = null;
        this.onEarnings = null;
        this.onInsufficientFunds = null;
        
        console.log(`EconomyManager inicializado con $${this.money}`);
    }
    
    /**
     * Actualiza el EconomyManager cada frame
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en ms
     */
    update(deltaTime) {
        // Verificar si hay bonificaciones temporales activas
        this.updateBonuses(deltaTime);
        
        // Limpiar historial de transacciones si es necesario
        this.cleanupTransactionHistory();
    }
    
    /**
     * Actualiza las bonificaciones temporales
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateBonuses(deltaTime) {
        if (this.bonusActive && Date.now() > this.bonusEndTime) {
            this.deactivateBonus();
        }
    }
    
    /**
     * Añade dinero al jugador
     * @param {number} amount - Cantidad a añadir
     * @param {string} source - Fuente del dinero (enemy_kill, wave_bonus, etc.)
     * @param {Object} metadata - Información adicional sobre la transacción
     * @returns {number} Nueva cantidad total de dinero
     */
    addMoney(amount, source = 'unknown', metadata = {}) {
        if (amount <= 0) {
            console.warn('Intento de añadir cantidad negativa o cero:', amount);
            return this.money;
        }
        
        // Aplicar multiplicador de ganancias
        const finalAmount = Math.floor(amount * this.earningsMultiplier);
        
        // Actualizar dinero
        const previousMoney = this.money;
        this.money += finalAmount;
        
        // Registrar transacción
        this.recordTransaction('income', finalAmount, source, metadata);
        
        // Actualizar estadísticas
        this.updateEarningsStats(finalAmount, source);
        
        console.log(`+$${finalAmount} (${source}). Total: $${this.money}`);
        
        // Ejecutar callback
        if (this.onMoneyChanged) {
            this.onMoneyChanged(this.money, previousMoney, finalAmount, 'income');
        }
        
        if (this.onEarnings) {
            this.onEarnings(finalAmount, source, metadata);
        }
        
        return this.money;
    }
    
    /**
     * Gasta dinero del jugador
     * @param {number} amount - Cantidad a gastar
     * @param {string} purpose - Propósito del gasto (tower_purchase, upgrade, etc.)
     * @param {Object} metadata - Información adicional sobre la transacción
     * @returns {boolean} True si se pudo realizar la transacción
     */
    spendMoney(amount, purpose = 'unknown', metadata = {}) {
        if (amount <= 0) {
            console.warn('Intento de gastar cantidad negativa o cero:', amount);
            return false;
        }
        
        // Aplicar multiplicador de costos
        const finalAmount = Math.floor(amount * this.costMultiplier);
        
        // Verificar si hay suficiente dinero
        if (!this.canAfford(finalAmount)) {
            console.log(`Fondos insuficientes. Necesario: $${finalAmount}, Disponible: $${this.money}`);
            
            if (this.onInsufficientFunds) {
                this.onInsufficientFunds(finalAmount, this.money, purpose);
            }
            
            return false;
        }
        
        // Realizar transacción
        const previousMoney = this.money;
        this.money -= finalAmount;
        
        // Registrar transacción
        this.recordTransaction('expense', finalAmount, purpose, metadata);
        
        // Actualizar estadísticas
        this.updateSpendingStats(finalAmount, purpose);
        
        console.log(`-$${finalAmount} (${purpose}). Total: $${this.money}`);
        
        // Ejecutar callbacks
        if (this.onMoneyChanged) {
            this.onMoneyChanged(this.money, previousMoney, -finalAmount, 'expense');
        }
        
        if (this.onPurchase) {
            this.onPurchase(finalAmount, purpose, metadata);
        }
        
        return true;
    }
    
    /**
     * Verifica si el jugador puede permitirse una compra
     * @param {number} cost - Costo a verificar
     * @returns {boolean} True si puede permitírselo
     */
    canAfford(cost) {
        const finalCost = Math.floor(cost * this.costMultiplier);
        return this.money >= finalCost;
    }
    
    /**
     * Obtiene el costo final después de aplicar multiplicadores
     * @param {number} baseCost - Costo base
     * @returns {number} Costo final
     */
    getFinalCost(baseCost) {
        return Math.floor(baseCost * this.costMultiplier);
    }
    
    /**
     * Obtiene las ganancias finales después de aplicar multiplicadores
     * @param {number} baseEarnings - Ganancias base
     * @returns {number} Ganancias finales
     */
    getFinalEarnings(baseEarnings) {
        return Math.floor(baseEarnings * this.earningsMultiplier);
    }
    
    /**
     * Registra una transacción en el historial
     * @param {string} type - Tipo de transacción (income/expense)
     * @param {number} amount - Cantidad de la transacción
     * @param {string} source - Fuente o propósito de la transacción
     * @param {Object} metadata - Información adicional
     */
    recordTransaction(type, amount, source, metadata) {
        const transaction = {
            id: this.generateTransactionId(),
            type: type,
            amount: amount,
            source: source,
            metadata: metadata,
            timestamp: Date.now(),
            balanceAfter: this.money
        };
        
        this.transactions.push(transaction);
        this.stats.totalTransactions++;
        
        // Actualizar mayor transacción
        if (amount > this.stats.biggestTransaction) {
            this.stats.biggestTransaction = amount;
        }
    }
    
    /**
     * Genera un ID único para la transacción
     * @returns {string} ID de transacción
     */
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Actualiza las estadísticas de ganancias
     * @param {number} amount - Cantidad ganada
     * @param {string} source - Fuente de las ganancias
     */
    updateEarningsStats(amount, source) {
        this.stats.totalEarned += amount;
        
        if (source === 'enemy_kill') {
            this.stats.enemiesKilledForMoney++;
            this.stats.averageEarningsPerEnemy = this.stats.totalEarned / this.stats.enemiesKilledForMoney;
        }
    }
    
    /**
     * Actualiza las estadísticas de gastos
     * @param {number} amount - Cantidad gastada
     * @param {string} purpose - Propósito del gasto
     */
    updateSpendingStats(amount, purpose) {
        this.stats.totalSpent += amount;
        
        if (purpose === 'tower_purchase') {
            this.stats.towersBuilt++;
        }
    }
    
    /**
     * Procesa la recompensa por eliminar un enemigo
     * @param {Enemy} enemy - Enemigo eliminado
     * @returns {number} Cantidad de dinero ganada
     */
    processEnemyKillReward(enemy) {
        const baseReward = enemy.getReward();
        const finalReward = this.getFinalEarnings(baseReward);
        
        this.addMoney(finalReward, 'enemy_kill', {
            enemyType: enemy.type,
            enemyId: enemy.id,
            baseReward: baseReward,
            multiplier: this.earningsMultiplier
        });
        
        return finalReward;
    }
    
    /**
     * Procesa la compra de una torre
     * @param {string} towerType - Tipo de torre
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {boolean} True si se pudo comprar
     */
    processTowerPurchase(towerType, x, y) {
        if (!TOWER_TYPES[towerType]) {
            console.error('Tipo de torre inválido:', towerType);
            return false;
        }
        
        const baseCost = TOWER_TYPES[towerType].cost;
        const finalCost = this.getFinalCost(baseCost);
        
        return this.spendMoney(finalCost, 'tower_purchase', {
            towerType: towerType,
            position: { x: x, y: y },
            baseCost: baseCost,
            multiplier: this.costMultiplier
        });
    }
    
    /**
     * Activa una bonificación temporal
     * @param {number} earningsMultiplier - Multiplicador de ganancias
     * @param {number} duration - Duración en milisegundos
     */
    activateBonus(earningsMultiplier, duration) {
        this.earningsMultiplier = earningsMultiplier;
        this.bonusActive = true;
        this.bonusEndTime = Date.now() + duration;
        
        console.log(`Bonificación activada: ${earningsMultiplier}x ganancias por ${duration / 1000}s`);
    }
    
    /**
     * Desactiva la bonificación actual
     */
    deactivateBonus() {
        this.earningsMultiplier = 1.0;
        this.bonusActive = false;
        this.bonusEndTime = 0;
        
        console.log('Bonificación desactivada');
    }
    
    /**
     * Obtiene el dinero actual
     * @returns {number} Cantidad actual de dinero
     */
    getMoney() {
        return this.money;
    }
    
    /**
     * Obtiene el dinero formateado como string
     * @returns {string} Dinero formateado
     */
    getFormattedMoney() {
        return formatMoney(this.money);
    }
    
    /**
     * Obtiene las estadísticas económicas
     * @returns {Object} Estadísticas completas
     */
    getStats() {
        const netWorth = this.stats.totalEarned - this.stats.totalSpent;
        const efficiency = this.stats.totalSpent > 0 ? 
                          (this.stats.totalEarned / this.stats.totalSpent) : 0;
        
        return {
            ...this.stats,
            currentMoney: this.money,
            netWorth: netWorth,
            efficiency: efficiency,
            earningsMultiplier: this.earningsMultiplier,
            costMultiplier: this.costMultiplier,
            bonusActive: this.bonusActive,
            bonusTimeRemaining: this.bonusActive ? 
                               Math.max(0, this.bonusEndTime - Date.now()) : 0
        };
    }
    
    /**
     * Obtiene el historial de transacciones recientes
     * @param {number} limit - Número máximo de transacciones a devolver
     * @returns {Array} Array de transacciones
     */
    getRecentTransactions(limit = 10) {
        return this.transactions
            .slice(-limit)
            .reverse(); // Más recientes primero
    }
    
    /**
     * Obtiene transacciones filtradas por tipo
     * @param {string} type - Tipo de transacción (income/expense)
     * @param {number} limit - Límite de resultados
     * @returns {Array} Array de transacciones filtradas
     */
    getTransactionsByType(type, limit = 50) {
        return this.transactions
            .filter(transaction => transaction.type === type)
            .slice(-limit)
            .reverse();
    }
    
    /**
     * Limpia el historial de transacciones antiguas
     */
    cleanupTransactionHistory() {
        if (this.transactions.length > this.maxTransactionHistory) {
            const excess = this.transactions.length - this.maxTransactionHistory;
            this.transactions.splice(0, excess);
        }
    }
    
    /**
     * Configura los callbacks del EconomyManager
     * @param {Object} callbacks - Objeto con funciones callback
     */
    setCallbacks(callbacks) {
        if (callbacks.onMoneyChanged) this.onMoneyChanged = callbacks.onMoneyChanged;
        if (callbacks.onPurchase) this.onPurchase = callbacks.onPurchase;
        if (callbacks.onEarnings) this.onEarnings = callbacks.onEarnings;
        if (callbacks.onInsufficientFunds) this.onInsufficientFunds = callbacks.onInsufficientFunds;
    }
    
    /**
     * Establece multiplicadores personalizados
     * @param {number} earningsMultiplier - Multiplicador de ganancias
     * @param {number} costMultiplier - Multiplicador de costos
     */
    setMultipliers(earningsMultiplier = 1.0, costMultiplier = 1.0) {
        this.earningsMultiplier = Math.max(0.1, earningsMultiplier);
        this.costMultiplier = Math.max(0.1, costMultiplier);
        
        console.log(`Multiplicadores actualizados: Ganancias ${this.earningsMultiplier}x, Costos ${this.costMultiplier}x`);
    }
    
    /**
     * Resetea el EconomyManager a su estado inicial
     */
    reset() {
        // Resetear dinero
        this.money = this.startingMoney;
        
        // Limpiar historial
        this.transactions = [];
        
        // Resetear estadísticas
        this.stats = {
            totalEarned: 0,
            totalSpent: 0,
            enemiesKilledForMoney: 0,
            towersBuilt: 0,
            averageEarningsPerEnemy: 0,
            biggestTransaction: 0,
            totalTransactions: 0
        };
        
        // Resetear multiplicadores y bonificaciones
        this.earningsMultiplier = 1.0;
        this.costMultiplier = 1.0;
        this.bonusActive = false;
        this.bonusEndTime = 0;
        
        console.log(`EconomyManager reseteado a $${this.money}`);
    }
    
    /**
     * Obtiene información de debug del EconomyManager
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            money: this.money,
            earningsMultiplier: this.earningsMultiplier,
            costMultiplier: this.costMultiplier,
            bonusActive: this.bonusActive,
            bonusTimeRemaining: this.bonusActive ? 
                               Math.max(0, this.bonusEndTime - Date.now()) : 0,
            transactionCount: this.transactions.length,
            stats: this.stats
        };
    }
    
    /**
     * Exporta los datos económicos para guardado
     * @returns {Object} Datos serializables
     */
    exportData() {
        return {
            money: this.money,
            stats: this.stats,
            transactions: this.transactions.slice(-20), // Solo las últimas 20 transacciones
            earningsMultiplier: this.earningsMultiplier,
            costMultiplier: this.costMultiplier
        };
    }
    
    /**
     * Importa datos económicos desde un guardado
     * @param {Object} data - Datos a importar
     */
    importData(data) {
        if (data.money !== undefined) this.money = data.money;
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.transactions) this.transactions = [...data.transactions];
        if (data.earningsMultiplier) this.earningsMultiplier = data.earningsMultiplier;
        if (data.costMultiplier) this.costMultiplier = data.costMultiplier;
        
        console.log('Datos económicos importados');
    }
}