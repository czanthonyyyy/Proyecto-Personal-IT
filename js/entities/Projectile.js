/**
 * Clase Projectile para representar proyectiles en el juego Tower Defense
 * Maneja el movimiento, colisiones, daño y efectos visuales de los proyectiles
 */

class Projectile {
    /**
     * Constructor de la clase Projectile
     * @param {number} x - Coordenada X inicial
     * @param {number} y - Coordenada Y inicial
     * @param {Enemy} target - Enemigo objetivo
     * @param {number} damage - Daño que inflige el proyectil
     * @param {number} speed - Velocidad del proyectil en pixels/segundo
     * @param {boolean} splash - Si el proyectil hace daño de área
     * @param {number} splashRadius - Radio del daño de área
     */
    constructor(x, y, target, damage, speed, splash = false, splashRadius = 0) {
        // Propiedades de posición
        this.position = { x: x, y: y };
        this.startPosition = { x: x, y: y };
        
        // Propiedades de objetivo y movimiento
        this.target = target;
        this.targetPosition = target ? { ...target.getPosition() } : { x: x, y: y };
        this.speed = speed;
        this.velocity = { x: 0, y: 0 };
        
        // Propiedades de combate
        this.damage = damage;
        this.splash = splash;
        this.splashRadius = splashRadius;
        
        // Estado del proyectil
        this.active = true;
        this.hasHit = false;
        this.markedForRemoval = false;
        
        // Propiedades visuales
        this.size = 6;
        this.color = '#FFD700';
        this.trailLength = 5;
        this.trail = [];
        
        // Efectos especiales
        this.rotationAngle = 0;
        this.glowIntensity = 1.0;
        
        // Propiedades de tiempo y distancia
        this.timeAlive = 0;
        this.maxLifetime = 5000; // 5 segundos máximo de vida
        this.distanceTraveled = 0;
        this.maxDistance = 1000; // Distancia máxima antes de autodestruirse
        
        // Predicción de movimiento del objetivo
        this.useTargetPrediction = true;
        this.predictionTime = 0.5; // Segundos de predicción
        
        // Calcular velocidad inicial
        this.calculateInitialVelocity();
        
        // ID único para debugging
        this.id = Math.random().toString(36).substr(2, 9);
        
        console.log(`Proyectil creado con ID: ${this.id}, daño: ${this.damage}, splash: ${this.splash}`);
    }
    
    /**
     * Calcula la velocidad inicial del proyectil hacia el objetivo
     */
    calculateInitialVelocity() {
        let targetPos = this.targetPosition;
        
        // Usar predicción de movimiento si está habilitada y el objetivo está vivo
        if (this.useTargetPrediction && this.target && this.target.isAlive()) {
            targetPos = this.predictTargetPosition();
        }
        
        // Calcular dirección hacia el objetivo
        const dx = targetPos.x - this.position.x;
        const dy = targetPos.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalizar y aplicar velocidad
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
            
            // Calcular ángulo de rotación
            this.rotationAngle = Math.atan2(dy, dx);
        } else {
            // Si no hay distancia, el proyectil no se mueve
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.active = false;
        }
    }
    
    /**
     * Predice la posición futura del objetivo
     * @returns {Object} Posición predicha del objetivo
     */
    predictTargetPosition() {
        if (!this.target || !this.target.isAlive()) {
            return this.targetPosition;
        }
        
        const currentPos = this.target.getPosition();
        const targetVelocity = this.calculateTargetVelocity();
        
        // Calcular tiempo estimado de llegada
        const distanceToTarget = distance(
            this.position.x, this.position.y,
            currentPos.x, currentPos.y
        );
        const timeToReach = distanceToTarget / this.speed;
        
        // Usar el menor entre el tiempo calculado y el tiempo de predicción
        const predictionTime = Math.min(timeToReach, this.predictionTime);
        
        return {
            x: currentPos.x + targetVelocity.x * predictionTime,
            y: currentPos.y + targetVelocity.y * predictionTime
        };
    }
    
    /**
     * Calcula la velocidad actual del objetivo
     * @returns {Object} Velocidad del objetivo en x e y
     */
    calculateTargetVelocity() {
        if (!this.target || !this.target.direction) {
            return { x: 0, y: 0 };
        }
        
        const targetSpeed = this.target.speed * this.target.pathSpeed;
        return {
            x: this.target.direction.x * targetSpeed,
            y: this.target.direction.y * targetSpeed
        };
    }
    
    /**
     * Actualiza el proyectil cada frame
     * @param {number} deltaTime - Tiempo transcurrido desde el último frame en ms
     * @param {Array} enemies - Array de enemigos para detección de colisiones
     */
    update(deltaTime, enemies) {
        if (!this.active) return;
        
        // Actualizar tiempo de vida
        this.timeAlive += deltaTime;
        
        // Verificar tiempo máximo de vida
        if (this.timeAlive > this.maxLifetime) {
            this.destroy();
            return;
        }
        
        // Actualizar posición
        this.updatePosition(deltaTime);
        
        // Actualizar trail
        this.updateTrail();
        
        // Verificar colisiones
        this.checkCollisions(enemies);
        
        // Verificar límites del mapa
        this.checkBounds();
        
        // Actualizar efectos visuales
        this.updateVisualEffects(deltaTime);
    }
    
    /**
     * Actualiza la posición del proyectil
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updatePosition(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // Actualizar posición basada en velocidad
        const oldX = this.position.x;
        const oldY = this.position.y;
        
        this.position.x += this.velocity.x * deltaSeconds;
        this.position.y += this.velocity.y * deltaSeconds;
        
        // Calcular distancia recorrida
        const moveDistance = distance(oldX, oldY, this.position.x, this.position.y);
        this.distanceTraveled += moveDistance;
        
        // Verificar distancia máxima
        if (this.distanceTraveled > this.maxDistance) {
            this.destroy();
            return;
        }
        
        // Recalcular velocidad si el objetivo sigue vivo (homing missile effect)
        if (this.target && this.target.isAlive() && this.useTargetPrediction) {
            this.adjustTrajectory();
        }
    }
    
    /**
     * Ajusta la trayectoria del proyectil hacia el objetivo móvil
     */
    adjustTrajectory() {
        if (!this.target || !this.target.isAlive()) return;
        
        const currentTargetPos = this.target.getPosition();
        const predictedPos = this.predictTargetPosition();
        
        // Calcular nueva dirección
        const dx = predictedPos.x - this.position.x;
        const dy = predictedPos.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Aplicar corrección suave (no cambio brusco de dirección)
            const correctionFactor = 0.1; // 10% de corrección por frame
            
            const newVelX = (dx / dist) * this.speed;
            const newVelY = (dy / dist) * this.speed;
            
            this.velocity.x = lerp(this.velocity.x, newVelX, correctionFactor);
            this.velocity.y = lerp(this.velocity.y, newVelY, correctionFactor);
            
            // Actualizar ángulo de rotación
            this.rotationAngle = Math.atan2(this.velocity.y, this.velocity.x);
        }
    }
    
    /**
     * Actualiza el trail del proyectil
     */
    updateTrail() {
        // Agregar posición actual al trail
        this.trail.push({ ...this.position });
        
        // Limitar longitud del trail
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
    }
    
    /**
     * Verifica colisiones con enemigos
     * @param {Array} enemies - Array de enemigos
     */
    checkCollisions(enemies) {
        if (!this.active || this.hasHit) return;
        
        // Verificar colisión con el objetivo principal
        if (this.target && this.target.isAlive()) {
            if (this.checkCollisionWithEnemy(this.target)) {
                this.hit(this.target, enemies);
                return;
            }
        }
        
        // Verificar colisión con otros enemigos (en caso de que el objetivo original haya muerto)
        if (!this.target || !this.target.isAlive()) {
            for (const enemy of enemies) {
                if (enemy.isAlive() && this.checkCollisionWithEnemy(enemy)) {
                    this.hit(enemy, enemies);
                    return;
                }
            }
        }
    }
    
    /**
     * Verifica colisión con un enemigo específico
     * @param {Enemy} enemy - Enemigo a verificar
     * @returns {boolean} True si hay colisión
     */
    checkCollisionWithEnemy(enemy) {
        const enemyBounds = enemy.getBounds();
        const dist = distance(
            this.position.x, this.position.y,
            enemyBounds.x, enemyBounds.y
        );
        
        return dist <= (enemyBounds.radius + this.size / 2);
    }
    
    /**
     * Maneja el impacto del proyectil
     * @param {Enemy} hitEnemy - Enemigo impactado
     * @param {Array} allEnemies - Todos los enemigos para daño de área
     */
    hit(hitEnemy, allEnemies) {
        if (this.hasHit) return;
        
        this.hasHit = true;
        
        console.log(`Proyectil ${this.id} impactó enemigo ${hitEnemy.id}`);
        
        // Aplicar daño directo
        const killed = hitEnemy.takeDamage(this.damage);
        
        // Aplicar daño de área si corresponde
        if (this.splash && this.splashRadius > 0) {
            this.applySplashDamage(hitEnemy, allEnemies);
        }
        
        // Crear efecto de explosión
        this.createExplosionEffect();
        
        // Marcar para destrucción
        this.destroy();
    }
    
    /**
     * Aplica daño de área alrededor del punto de impacto
     * @param {Enemy} centerEnemy - Enemigo en el centro de la explosión
     * @param {Array} allEnemies - Todos los enemigos
     */
    applySplashDamage(centerEnemy, allEnemies) {
        const splashDamage = Math.floor(this.damage * 0.7); // 70% del daño original
        
        for (const enemy of allEnemies) {
            if (!enemy.isAlive() || enemy === centerEnemy) continue;
            
            const dist = distance(
                this.position.x, this.position.y,
                enemy.position.x, enemy.position.y
            );
            
            if (dist <= this.splashRadius) {
                // Calcular daño basado en distancia (más cerca = más daño)
                const damageMultiplier = 1 - (dist / this.splashRadius);
                const finalDamage = Math.floor(splashDamage * damageMultiplier);
                
                if (finalDamage > 0) {
                    enemy.takeDamage(finalDamage);
                    console.log(`Daño de área: ${finalDamage} a enemigo ${enemy.id}`);
                }
            }
        }
    }
    
    /**
     * Crea efecto visual de explosión
     */
    createExplosionEffect() {
        // Crear explosión con partículas
        if (typeof particleSystem !== 'undefined') {
            if (this.splash) {
                // Explosión de área más grande
                particleSystem.createExplosion(this.position.x, this.position.y, '#FF9800', 16, 1.5);
                particleSystem.createAreaDamage(this.position.x, this.position.y, this.splashRadius, '#FFB74D');
            } else {
                // Explosión normal
                particleSystem.createExplosion(this.position.x, this.position.y, this.color, 8, 1);
            }
        }
        
        console.log(`Explosión en (${Math.round(this.position.x)}, ${Math.round(this.position.y)})`);
    }
    
    /**
     * Verifica si el proyectil está fuera de los límites del mapa
     */
    checkBounds() {
        if (!isWithinBounds(this.position.x, this.position.y)) {
            console.log(`Proyectil ${this.id} salió de los límites del mapa`);
            this.destroy();
        }
    }
    
    /**
     * Actualiza efectos visuales del proyectil
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    updateVisualEffects(deltaTime) {
        // Efecto de pulsación del brillo
        const pulseSpeed = 0.005; // Velocidad de pulsación
        this.glowIntensity = 0.7 + 0.3 * Math.sin(this.timeAlive * pulseSpeed);
    }
    
    /**
     * Renderiza el proyectil en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Renderizar trail
        this.renderTrail(ctx);
        
        // Trasladar al centro del proyectil
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según la dirección
        ctx.rotate(this.rotationAngle);
        
        // Renderizar el proyectil principal
        this.renderProjectile(ctx);
        
        // Renderizar efectos especiales
        this.renderSpecialEffects(ctx);
        
        ctx.restore();
    }
    
    /**
     * Renderiza el trail del proyectil
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        
        for (let i = 1; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            const size = (this.size / 2) * alpha;
            
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = this.color;
            
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza el proyectil principal
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderProjectile(ctx) {
        // Efecto de brillo
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * this.glowIntensity;
        
        // Cuerpo principal del proyectil
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo brillante
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Forma específica según tipo de proyectil
        if (this.splash) {
            // Proyectil de área - forma de estrella
            this.renderStarShape(ctx);
        } else {
            // Proyectil normal - forma de bala
            this.renderBulletShape(ctx);
        }
    }
    
    /**
     * Renderiza forma de bala para proyectiles normales
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderBulletShape(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Renderiza forma de estrella para proyectiles de área
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderStarShape(ctx) {
        const spikes = 6;
        const outerRadius = this.size / 2;
        const innerRadius = this.size / 4;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Renderiza efectos especiales del proyectil
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderSpecialEffects(ctx) {
        // Efecto de área de splash si corresponde
        if (this.splash && this.splashRadius > 0) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.arc(0, 0, this.splashRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    /**
     * Destruye el proyectil
     */
    destroy() {
        this.active = false;
        this.markedForRemoval = true;
        console.log(`Proyectil ${this.id} destruido`);
    }
    
    /**
     * Verifica si el proyectil está activo
     * @returns {boolean} True si está activo
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Verifica si el proyectil está marcado para remoción
     * @returns {boolean} True si está marcado para remoción
     */
    isMarkedForRemoval() {
        return this.markedForRemoval;
    }
    
    /**
     * Obtiene la posición actual del proyectil
     * @returns {Object} Coordenadas x e y
     */
    getPosition() {
        return { ...this.position };
    }
    
    /**
     * Obtiene información de debug del proyectil
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            id: this.id,
            position: `(${Math.round(this.position.x)}, ${Math.round(this.position.y)})`,
            target: this.target ? this.target.id : 'none',
            damage: this.damage,
            splash: this.splash,
            splashRadius: this.splashRadius,
            speed: this.speed,
            timeAlive: Math.round(this.timeAlive),
            distanceTraveled: Math.round(this.distanceTraveled),
            active: this.active,
            hasHit: this.hasHit
        };
    }
}