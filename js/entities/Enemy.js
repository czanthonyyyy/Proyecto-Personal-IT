/**
 * Clase Enemy para representar enemigos en el juego Tower Defense
 * Maneja el movimiento, salud, renderizado y comportamiento de los enemigos
 */

class Enemy {
    /**
     * Constructor de la clase Enemy
     * @param {string} type - Tipo de enemigo (BASIC, TANK, FAST)
     * @param {Array} path - Array de coordenadas del camino a seguir
     */
    constructor(type, path = null) {
        // Validar tipo de enemigo
        if (!ENEMY_TYPES[type]) {
            throw new Error(`Tipo de enemigo inválido: ${type}`);
        }
        
        this.type = type;
        this.config = { ...ENEMY_TYPES[type] };
        
        // Propiedades de salud
        this.health = this.config.health;
        this.maxHealth = this.config.maxHealth;
        
        // Propiedades de movimiento
        this.speed = this.config.speed;
        this.pathSpeed = this.config.pathSpeed;
        
        // Propiedades de recompensa
        this.reward = this.config.reward;
        
        // Propiedades visuales
        this.color = this.config.color;
        this.size = this.config.size;
        
        // Propiedades de posición y movimiento
        this.position = { x: 0, y: 0 };
        this.pathProgress = 0; // Progreso del 0 al 1 en el camino
        this.direction = { x: 1, y: 0 }; // Vector de dirección normalizado
        this.angle = 0; // Ángulo de rotación en radianes
        
        // Estado del enemigo
        this.alive = true;
        this.reachedEnd = false;
        this.markedForRemoval = false;
        
        // Efectos visuales
        this.damageFlash = 0; // Timer para efecto de daño
        this.healthBarVisible = true;
        
        // Inicializar posición en el camino
        this.updatePositionFromPath();
        
        // ID único para debugging
        this.id = Math.random().toString(36).substr(2, 9);
        
        console.log(`Enemigo ${this.type} creado con ID: ${this.id}`);
    }
    
    /**
     * Actualiza el enemigo cada frame
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en ms
     */
    update(deltaTime) {
        if (!this.alive || this.reachedEnd) {
            return;
        }
        
        // Actualizar efectos visuales
        this.updateVisualEffects(deltaTime);
        
        // Mover el enemigo
        this.move(deltaTime);
        
        // Verificar si llegó al final
        this.checkEndReached();
    }
    
    /**
     * Mueve el enemigo a lo largo del camino
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    move(deltaTime) {
        if (!this.alive || this.reachedEnd) return;
        
        // Calcular la distancia a mover basada en la velocidad y tiempo
        const moveDistance = (this.speed * this.pathSpeed * deltaTime) / 1000;
        
        // Calcular el progreso basado en la longitud total del camino
        const totalPathLength = calculatePathLength();
        const progressIncrement = moveDistance / totalPathLength;
        
        // Actualizar progreso en el camino
        this.pathProgress += progressIncrement;
        
        // Limitar el progreso entre 0 y 1
        this.pathProgress = clamp(this.pathProgress, 0, 1);
        
        // Actualizar posición basada en el progreso
        this.updatePositionFromPath();
    }
    
    /**
     * Actualiza la posición del enemigo basada en su progreso en el camino
     */
    updatePositionFromPath() {
        const pathData = getPositionOnPath(this.pathProgress);
        
        this.position.x = pathData.x;
        this.position.y = pathData.y;
        this.angle = pathData.angle;
        
        // Actualizar vector de dirección
        this.direction.x = Math.cos(this.angle);
        this.direction.y = Math.sin(this.angle);
    }
    
    /**
     * Verifica si el enemigo ha llegado al final del camino
     */
    checkEndReached() {
        if (this.pathProgress >= 1.0) {
            this.reachedEnd = true;
            this.alive = false;
            console.log(`Enemigo ${this.id} llegó al final del camino`);
        }
    }
    
    /**
     * Aplica daño al enemigo
     * @param {number} damage - Cantidad de daño a aplicar
     * @returns {boolean} True si el enemigo murió por este daño
     */
    takeDamage(damage) {
        if (!this.alive) return false;
        
        this.health -= damage;
        this.damageFlash = 200; // Activar efecto visual de daño por 200ms
        
        console.log(`Enemigo ${this.id} recibió ${damage} de daño. Salud: ${this.health}/${this.maxHealth}`);
        
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            console.log(`Enemigo ${this.id} eliminado`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Actualiza los efectos visuales del enemigo
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateVisualEffects(deltaTime) {
        // Reducir el efecto de flash de daño
        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
            if (this.damageFlash < 0) {
                this.damageFlash = 0;
            }
        }
    }
    
    /**
     * Renderiza el enemigo en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.alive && this.damageFlash <= 0) return;
        
        ctx.save();
        
        // Trasladar al centro del enemigo
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según la dirección de movimiento
        ctx.rotate(this.angle);
        
        // Aplicar efecto de flash de daño
        if (this.damageFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 10;
        }
        
        // Renderizar el cuerpo del enemigo
        this.renderBody(ctx);
        
        ctx.restore();
        
        // Renderizar barra de salud (sin rotación)
        if (this.healthBarVisible && this.alive) {
            this.renderHealthBar(ctx);
        }
        
        // Renderizar efectos adicionales según el tipo
        this.renderTypeSpecificEffects(ctx);
    }
    
    /**
     * Renderiza el cuerpo principal del enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderBody(ctx) {
        // Cuerpo principal (círculo)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde del enemigo
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Indicador de dirección (triángulo pequeño)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(this.size / 3, 0);
        ctx.lineTo(-this.size / 6, -this.size / 6);
        ctx.lineTo(-this.size / 6, this.size / 6);
        ctx.closePath();
        ctx.fill();
        
        // Letra identificadora del tipo
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const typeChar = this.type.charAt(0);
        ctx.fillText(typeChar, 0, 0);
    }
    
    /**
     * Renderiza la barra de salud del enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        const barWidth = this.size + 10;
        const barHeight = 6;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size / 2 - 15;
        
        // Fondo de la barra de salud
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Salud actual
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Texto de salud (opcional, solo para enemigos grandes)
        if (this.size >= 25) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                `${Math.ceil(this.health)}/${this.maxHealth}`,
                this.position.x,
                barY - 8
            );
        }
    }
    
    /**
     * Renderiza efectos específicos según el tipo de enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderTypeSpecificEffects(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        switch (this.type) {
            case 'TANK':
                // Efecto de armadura para tanques
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2 + 3, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'FAST':
                // Efecto de velocidad para enemigos rápidos
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                
                for (let i = 1; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.arc(-i * 8, 0, this.size / 2 - i, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
                
            case 'BASIC':
            default:
                // Sin efectos especiales para enemigos básicos
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * Verifica si el enemigo está vivo
     * @returns {boolean} True si el enemigo está vivo
     */
    isAlive() {
        return this.alive;
    }
    
    /**
     * Verifica si el enemigo llegó al final del camino
     * @returns {boolean} True si llegó al final
     */
    hasReachedEnd() {
        return this.reachedEnd;
    }
    
    /**
     * Obtiene la posición actual del enemigo
     * @returns {Object} Objeto con coordenadas x e y
     */
    getPosition() {
        return { ...this.position };
    }
    
    /**
     * Obtiene el centro del enemigo (para colisiones)
     * @returns {Object} Objeto con coordenadas x, y y radio
     */
    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            radius: this.size / 2
        };
    }
    
    /**
     * Calcula la distancia restante hasta el final del camino
     * @returns {number} Distancia en pixels hasta el final
     */
    getDistanceToEnd() {
        const totalLength = calculatePathLength();
        return totalLength * (1 - this.pathProgress);
    }
    
    /**
     * Obtiene el progreso actual en el camino
     * @returns {number} Progreso del 0 al 1
     */
    getPathProgress() {
        return this.pathProgress;
    }
    
    /**
     * Obtiene la recompensa por eliminar este enemigo
     * @returns {number} Cantidad de dinero de recompensa
     */
    getReward() {
        return this.reward;
    }
    
    /**
     * Marca el enemigo para ser removido
     */
    markForRemoval() {
        this.markedForRemoval = true;
    }
    
    /**
     * Verifica si el enemigo está marcado para remoción
     * @returns {boolean} True si está marcado para remoción
     */
    isMarkedForRemoval() {
        return this.markedForRemoval;
    }
    
    /**
     * Obtiene información de debug del enemigo
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            id: this.id,
            type: this.type,
            health: `${this.health}/${this.maxHealth}`,
            position: `(${Math.round(this.position.x)}, ${Math.round(this.position.y)})`,
            pathProgress: `${Math.round(this.pathProgress * 100)}%`,
            alive: this.alive,
            reachedEnd: this.reachedEnd,
            distanceToEnd: Math.round(this.getDistanceToEnd())
        };
    }
    
    /**
     * Resetea el enemigo a su estado inicial
     * @param {string} newType - Nuevo tipo de enemigo (opcional)
     */
    reset(newType = null) {
        if (newType && ENEMY_TYPES[newType]) {
            this.type = newType;
            this.config = { ...ENEMY_TYPES[newType] };
        }
        
        this.health = this.config.health;
        this.maxHealth = this.config.maxHealth;
        this.speed = this.config.speed;
        this.pathSpeed = this.config.pathSpeed;
        this.reward = this.config.reward;
        this.color = this.config.color;
        this.size = this.config.size;
        
        this.pathProgress = 0;
        this.alive = true;
        this.reachedEnd = false;
        this.markedForRemoval = false;
        this.damageFlash = 0;
        
        this.updatePositionFromPath();
        
        console.log(`Enemigo ${this.id} reseteado como ${this.type}`);
    }
}