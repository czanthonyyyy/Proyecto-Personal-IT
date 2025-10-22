/**
 * Sistema de partículas para efectos visuales
 * Maneja explosiones, efectos de impacto y animaciones
 */

class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.gravity = 0.1;
        this.friction = 0.98;
        this.alpha = 1;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000;
        
        // Actualizar posición
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        
        // Aplicar gravedad y fricción
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Reducir vida
        this.life -= deltaTime;
        
        // Calcular alpha basado en vida restante
        this.alpha = this.life / this.maxLife;
        
        return this.life > 0;
    }
    
    render(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = PERFORMANCE_CONFIG.maxParticles || 200;
    }
    
    /**
     * Crea una explosión de partículas
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {string} color - Color de las partículas
     * @param {number} count - Número de partículas
     * @param {number} intensity - Intensidad de la explosión
     */
    createExplosion(x, y, color = '#FF6B35', count = 12, intensity = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = (2 + Math.random() * 4) * intensity;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 500 + Math.random() * 500;
            const size = 2 + Math.random() * 3;
            
            this.addParticle(new Particle(x, y, vx, vy, life, color, size));
        }
    }
    
    /**
     * Crea partículas de impacto
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {number} angle - Ángulo de impacto
     * @param {string} color - Color de las partículas
     */
    createImpact(x, y, angle, color = '#FFD700') {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const spreadAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(spreadAngle) * speed;
            const vy = Math.sin(spreadAngle) * speed;
            const life = 300 + Math.random() * 200;
            const size = 1 + Math.random() * 2;
            
            this.addParticle(new Particle(x, y, vx, vy, life, color, size));
        }
    }
    
    /**
     * Crea partículas de daño de área
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {number} radius - Radio del área
     * @param {string} color - Color de las partículas
     */
    createAreaDamage(x, y, radius, color = '#FF9800') {
        const count = Math.floor(radius / 5);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            const speed = 0.5 + Math.random() * 1.5;
            const vx = (Math.random() - 0.5) * speed;
            const vy = (Math.random() - 0.5) * speed - 1;
            const life = 400 + Math.random() * 300;
            const size = 1 + Math.random() * 2;
            
            this.addParticle(new Particle(px, py, vx, vy, life, color, size));
        }
    }
    
    /**
     * Añade una partícula al sistema
     * @param {Particle} particle - Partícula a añadir
     */
    addParticle(particle) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Remover la más antigua
        }
        this.particles.push(particle);
    }
    
    /**
     * Actualiza todas las partículas
     * @param {number} deltaTime - Tiempo transcurrido en ms
     */
    update(deltaTime) {
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime)
        );
    }
    
    /**
     * Renderiza todas las partículas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
    
    /**
     * Limpia todas las partículas
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * Obtiene el número de partículas activas
     * @returns {number} Número de partículas
     */
    getParticleCount() {
        return this.particles.length;
    }
}

// Instancia global del sistema de partículas
const particleSystem = new ParticleSystem();