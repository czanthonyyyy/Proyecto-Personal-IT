/**
 * Clase Tower para representar torres defensivas en el juego Tower Defense
 * Maneja el targeting, disparo, renderizado y comportamiento de las torres
 */

class Tower {
    /**
     * Constructor de la clase Tower
     * @param {string} type - Tipo de torre (BASIC, SNIPER, AREA)
     * @param {number} x - Coordenada X de la torre
     * @param {number} y - Coordenada Y de la torre
     */
    constructor(type, x, y) {
        // Validar tipo de torre
        if (!TOWER_TYPES[type]) {
            throw new Error(`Tipo de torre inválido: ${type}`);
        }
        
        this.type = type;
        this.config = { ...TOWER_TYPES[type] };
        
        // Propiedades de combate
        this.damage = this.config.damage;
        this.range = this.config.range;
        this.fireRate = this.config.fireRate; // disparos por segundo
        this.cost = this.config.cost;
        
        // Propiedades de proyectil
        this.projectileSpeed = this.config.projectileSpeed;
        this.projectileColor = this.config.projectileColor;
        this.projectileSize = this.config.projectileSize;
        this.splash = this.config.splash;
        this.splashRadius = this.config.splashRadius;
        
        // Propiedades visuales
        this.color = this.config.color;
        this.size = this.config.size;
        
        // Propiedades de posición
        this.position = { x: x, y: y };
        this.gridPosition = pixelToGrid(x, y);
        
        // Sistema de targeting
        this.target = null;
        this.targetingMode = 'closest_to_end'; // 'closest_to_end', 'closest_to_tower', 'strongest', 'weakest'
        
        // Sistema de disparo
        this.lastShotTime = 0;
        this.shotCooldown = 1000 / this.fireRate; // milisegundos entre disparos
        this.canShoot = true;
        
        // Estado de la torre
        this.active = true;
        this.selected = false;
        this.showRange = false;
        
        // Efectos visuales
        this.rotationAngle = 0;
        this.targetAngle = 0;
        this.rotationSpeed = 5; // radianes por segundo
        this.muzzleFlash = 0;
        
        // Estadísticas
        this.stats = {
            enemiesKilled: 0,
            totalDamageDealt: 0,
            shotsFired: 0,
            shotsHit: 0,
            timeActive: 0
        };
        
        // ID único para debugging
        this.id = Math.random().toString(36).substr(2, 9);
        
        console.log(`Torre ${this.type} creada en (${x}, ${y}) con ID: ${this.id}`);
    }
    
    /**
     * Actualiza la torre cada frame
     * @param {Array} enemies - Array de enemigos en el juego
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en ms
     */
    update(enemies, deltaTime) {
        if (!this.active) return;
        
        // Actualizar estadísticas
        this.stats.timeActive += deltaTime;
        
        // Actualizar efectos visuales
        this.updateVisualEffects(deltaTime);
        
        // Buscar objetivo
        this.findTarget(enemies);
        
        // Rotar hacia el objetivo
        this.updateRotation(deltaTime);
        
        // Disparar si es posible
        this.attemptShoot(deltaTime);
    }
    
    /**
     * Busca el mejor objetivo entre los enemigos disponibles
     * @param {Array} enemies - Array de enemigos disponibles
     */
    findTarget(enemies) {
        // Limpiar objetivo actual si no es válido
        if (this.target && (!this.target.isAlive() || !this.isInRange(this.target))) {
            this.target = null;
        }
        
        // Si ya tenemos un objetivo válido, mantenerlo
        if (this.target && this.target.isAlive() && this.isInRange(this.target)) {
            return;
        }
        
        // Buscar nuevo objetivo
        const validTargets = enemies.filter(enemy => 
            enemy.isAlive() && this.isInRange(enemy)
        );
        
        if (validTargets.length === 0) {
            this.target = null;
            return;
        }
        
        // Seleccionar objetivo basado en el modo de targeting
        this.target = this.selectBestTarget(validTargets);
    }
    
    /**
     * Selecciona el mejor objetivo según el modo de targeting
     * @param {Array} validTargets - Array de objetivos válidos
     * @returns {Enemy|null} El mejor objetivo o null
     */
    selectBestTarget(validTargets) {
        if (validTargets.length === 0) return null;
        
        switch (this.targetingMode) {
            case 'closest_to_end':
                // Priorizar enemigo más cercano al final del camino
                return validTargets.reduce((best, current) => 
                    current.getDistanceToEnd() < best.getDistanceToEnd() ? current : best
                );
                
            case 'closest_to_tower':
                // Priorizar enemigo más cercano a la torre
                return validTargets.reduce((best, current) => {
                    const currentDist = distance(
                        this.position.x, this.position.y,
                        current.position.x, current.position.y
                    );
                    const bestDist = distance(
                        this.position.x, this.position.y,
                        best.position.x, best.position.y
                    );
                    return currentDist < bestDist ? current : best;
                });
                
            case 'strongest':
                // Priorizar enemigo con más salud
                return validTargets.reduce((best, current) => 
                    current.health > best.health ? current : best
                );
                
            case 'weakest':
                // Priorizar enemigo con menos salud
                return validTargets.reduce((best, current) => 
                    current.health < best.health ? current : best
                );
                
            default:
                return validTargets[0];
        }
    }
    
    /**
     * Verifica si un enemigo está dentro del rango de la torre
     * @param {Enemy} enemy - Enemigo a verificar
     * @returns {boolean} True si está en rango
     */
    isInRange(enemy) {
        const dist = distance(
            this.position.x, this.position.y,
            enemy.position.x, enemy.position.y
        );
        return dist <= this.range;
    }
    
    /**
     * Actualiza la rotación de la torre hacia su objetivo
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateRotation(deltaTime) {
        if (!this.target) return;
        
        // Calcular ángulo hacia el objetivo
        this.targetAngle = angleBetween(
            this.position.x, this.position.y,
            this.target.position.x, this.target.position.y
        );
        
        // Rotar suavemente hacia el objetivo
        const angleDiff = this.targetAngle - this.rotationAngle;
        
        // Normalizar la diferencia de ángulo
        let normalizedDiff = angleDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
        while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
        
        // Aplicar rotación suave
        const rotationStep = this.rotationSpeed * (deltaTime / 1000);
        
        if (Math.abs(normalizedDiff) < rotationStep) {
            this.rotationAngle = this.targetAngle;
        } else {
            this.rotationAngle += Math.sign(normalizedDiff) * rotationStep;
        }
        
        // Normalizar el ángulo de rotación
        while (this.rotationAngle > Math.PI) this.rotationAngle -= 2 * Math.PI;
        while (this.rotationAngle < -Math.PI) this.rotationAngle += 2 * Math.PI;
    }
    
    /**
     * Intenta disparar si las condiciones son apropiadas
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    attemptShoot(deltaTime) {
        // Verificar si puede disparar
        if (!this.canShoot()) return;
        
        // Verificar si tiene objetivo válido
        if (!this.target || !this.target.isAlive() || !this.isInRange(this.target)) {
            return;
        }
        
        // Verificar si está apuntando correctamente (tolerancia de 0.1 radianes)
        const angleDiff = Math.abs(this.targetAngle - this.rotationAngle);
        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        
        if (normalizedDiff > 0.1) return;
        
        // Disparar
        this.shoot();
    }
    
    /**
     * Ejecuta el disparo de la torre
     * @returns {Projectile|null} El proyectil creado o null si no se pudo disparar
     */
    shoot() {
        if (!this.canShoot() || !this.target) return null;
        
        // Crear proyectil
        const projectile = new Projectile(
            this.position.x,
            this.position.y,
            this.target,
            this.damage,
            this.projectileSpeed,
            this.splash,
            this.splashRadius
        );
        
        // Actualizar estado de disparo
        this.lastShotTime = Date.now();
        this.muzzleFlash = 100; // Efecto visual por 100ms
        
        // Actualizar estadísticas
        this.stats.shotsFired++;
        
        console.log(`Torre ${this.id} disparó a enemigo ${this.target.id}`);
        
        return projectile;
    }
    
    /**
     * Verifica si la torre puede disparar
     * @returns {boolean} True si puede disparar
     */
    canShoot() {
        const currentTime = Date.now();
        return (currentTime - this.lastShotTime) >= this.shotCooldown;
    }
    
    /**
     * Actualiza los efectos visuales de la torre
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateVisualEffects(deltaTime) {
        // Reducir efecto de muzzle flash
        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= deltaTime;
            if (this.muzzleFlash < 0) {
                this.muzzleFlash = 0;
            }
        }
    }
    
    /**
     * Renderiza la torre en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Renderizar rango si está seleccionada o en preview
        if (this.showRange || this.selected) {
            this.renderRange(ctx);
        }
        
        // Trasladar al centro de la torre
        ctx.translate(this.position.x, this.position.y);
        
        // Renderizar base de la torre
        this.renderBase(ctx);
        
        // Rotar para el cañón
        ctx.rotate(this.rotationAngle);
        
        // Renderizar cañón
        this.renderCannon(ctx);
        
        // Renderizar efectos especiales
        this.renderSpecialEffects(ctx);
        
        ctx.restore();
        
        // Renderizar información adicional
        if (this.selected) {
            this.renderInfo(ctx);
        }
    }
    
    /**
     * Renderiza el rango de la torre
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderRange(ctx) {
        ctx.save();
        
        // Círculo de rango
        ctx.strokeStyle = VISUAL_CONFIG.rangeIndicator.borderColor;
        ctx.fillStyle = VISUAL_CONFIG.rangeIndicator.color;
        ctx.lineWidth = VISUAL_CONFIG.rangeIndicator.borderWidth;
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Renderiza la base de la torre
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderBase(ctx) {
        // Base principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde de la base
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Indicador de selección
        if (this.selected) {
            ctx.strokeStyle = VISUAL_CONFIG.selection.borderColor;
            ctx.lineWidth = VISUAL_CONFIG.selection.borderWidth;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Letra identificadora del tipo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const typeChar = this.type.charAt(0);
        ctx.fillText(typeChar, 0, 0);
    }
    
    /**
     * Renderiza el cañón de la torre
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderCannon(ctx) {
        const cannonLength = this.size * 0.8;
        const cannonWidth = this.size * 0.2;
        
        // Cañón principal
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
        
        // Borde del cañón
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
        
        // Efecto de muzzle flash
        if (this.muzzleFlash > 0) {
            ctx.fillStyle = '#FFFF00';
            ctx.globalAlpha = this.muzzleFlash / 100;
            ctx.beginPath();
            ctx.arc(cannonLength, 0, cannonWidth / 2 + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Renderiza efectos especiales según el tipo de torre
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderSpecialEffects(ctx) {
        ctx.save();
        
        switch (this.type) {
            case 'SNIPER':
                // Efecto de mira láser para sniper
                if (this.target) {
                    ctx.strokeStyle = 'rgba(156, 39, 176, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    
                    const targetRelativeX = this.target.position.x - this.position.x;
                    const targetRelativeY = this.target.position.y - this.position.y;
                    
                    ctx.beginPath();
                    ctx.moveTo(this.size / 2, 0);
                    ctx.lineTo(targetRelativeX, targetRelativeY);
                    ctx.stroke();
                }
                break;
                
            case 'AREA':
                // Efecto de área de splash
                if (this.muzzleFlash > 0 && this.splashRadius > 0) {
                    ctx.strokeStyle = 'rgba(255, 152, 0, 0.3)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.splashRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
                
            case 'BASIC':
            default:
                // Sin efectos especiales para torre básica
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza información de la torre cuando está seleccionada
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderInfo(ctx) {
        const infoX = this.position.x + this.size / 2 + 10;
        const infoY = this.position.y - this.size / 2;
        
        ctx.save();
        
        // Fondo de información
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(infoX, infoY, 120, 80);
        
        // Borde
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, 120, 80);
        
        // Texto de información
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const info = [
            `Tipo: ${this.config.name}`,
            `Daño: ${this.damage}`,
            `Rango: ${this.range}`,
            `Cadencia: ${this.fireRate}/s`,
            `Eliminados: ${this.stats.enemiesKilled}`,
            `Disparos: ${this.stats.shotsFired}`,
            `Precisión: ${this.getAccuracy()}%`
        ];
        
        info.forEach((line, index) => {
            ctx.fillText(line, infoX + 5, infoY + 5 + index * 11);
        });
        
        ctx.restore();
    }
    
    /**
     * Calcula la precisión de la torre
     * @returns {number} Precisión como porcentaje
     */
    getAccuracy() {
        if (this.stats.shotsFired === 0) return 0;
        return Math.round((this.stats.shotsHit / this.stats.shotsFired) * 100);
    }
    
    /**
     * Registra un impacto exitoso
     */
    registerHit() {
        this.stats.shotsHit++;
    }
    
    /**
     * Registra la eliminación de un enemigo
     * @param {number} damageDealt - Daño total infligido
     */
    registerKill(damageDealt) {
        this.stats.enemiesKilled++;
        this.stats.totalDamageDealt += damageDealt;
    }
    
    /**
     * Selecciona o deselecciona la torre
     * @param {boolean} selected - Estado de selección
     */
    setSelected(selected) {
        this.selected = selected;
        this.showRange = selected;
    }
    
    /**
     * Cambia el modo de targeting de la torre
     * @param {string} mode - Nuevo modo de targeting
     */
    setTargetingMode(mode) {
        const validModes = ['closest_to_end', 'closest_to_tower', 'strongest', 'weakest'];
        if (validModes.includes(mode)) {
            this.targetingMode = mode;
            console.log(`Torre ${this.id} cambió modo de targeting a: ${mode}`);
        }
    }
    
    /**
     * Obtiene la posición de la torre
     * @returns {Object} Coordenadas x e y
     */
    getPosition() {
        return { ...this.position };
    }
    
    /**
     * Obtiene la posición en el grid
     * @returns {Object} Coordenadas gridX y gridY
     */
    getGridPosition() {
        return { ...this.gridPosition };
    }
    
    /**
     * Obtiene el costo de la torre
     * @returns {number} Costo de construcción
     */
    getCost() {
        return this.cost;
    }
    
    /**
     * Obtiene las estadísticas de la torre
     * @returns {Object} Objeto con estadísticas
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Obtiene información de debug de la torre
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            id: this.id,
            type: this.type,
            position: `(${Math.round(this.position.x)}, ${Math.round(this.position.y)})`,
            gridPosition: `(${this.gridPosition.gridX}, ${this.gridPosition.gridY})`,
            target: this.target ? this.target.id : 'none',
            targetingMode: this.targetingMode,
            canShoot: this.canShoot(),
            stats: this.stats
        };
    }
    
    /**
     * Desactiva la torre
     */
    deactivate() {
        this.active = false;
        this.target = null;
    }
    
    /**
     * Activa la torre
     */
    activate() {
        this.active = true;
    }
}