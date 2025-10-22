/**
 * Clase UIManager para gestionar la interfaz de usuario del juego
 * Controla el HUD, botones, estados visuales y feedback al usuario
 */

class UIManager {
    /**
     * Constructor del UIManager
     * @param {Game} game - Referencia al objeto Game principal
     */
    constructor(game) {
        this.game = game;
        
        // Referencias a elementos del DOM
        this.elements = {
            // HUD elements
            lives: document.getElementById('lives'),
            money: document.getElementById('money'),
            wave: document.getElementById('wave'),
            enemies: document.getElementById('enemies'),
            
            // Tower buttons
            basicTower: document.getElementById('basicTower'),
            sniperTower: document.getElementById('sniperTower'),
            areaTower: document.getElementById('areaTower'),
            
            // Control buttons
            startWave: document.getElementById('startWave'),
            pauseGame: document.getElementById('pauseGame'),
            resetGame: document.getElementById('resetGame'),
            
            // Overlay screens
            gameOverScreen: document.getElementById('gameOverScreen'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            restartBtn: document.getElementById('restartBtn')
        };
        
        // Estado de la UI
        this.selectedTowerType = null;
        this.isPaused = false;
        this.gameOver = false;
        
        // Cache de valores para optimización
        this.cachedValues = {
            lives: -1,
            money: -1,
            wave: '',
            enemies: -1
        };
        
        // Configuración de animaciones
        this.animations = {
            moneyChange: {
                active: false,
                startTime: 0,
                duration: 500,
                startValue: 0,
                endValue: 0,
                element: null
            },
            damageNumbers: []
        };
        
        // Tooltips y feedback
        this.tooltips = new Map();
        this.notifications = [];
        
        // Verificar que todos los elementos existen
        this.validateElements();
        
        // Configurar event listeners específicos de UI
        this.setupUIEventListeners();
        
        console.log('UIManager inicializado');
    }
    
    /**
     * Valida que todos los elementos del DOM existan
     */
    validateElements() {
        const missingElements = [];
        
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                missingElements.push(key);
            }
        }
        
        if (missingElements.length > 0) {
            console.warn('Elementos de UI faltantes:', missingElements);
        }
    }
    
    /**
     * Configura event listeners específicos de la UI
     */
    setupUIEventListeners() {
        // Tooltips para botones de torres
        this.setupTowerTooltips();
        
        // Efectos hover para botones
        this.setupHoverEffects();
        
        // Keyboard shortcuts info
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Configura tooltips para los botones de torres
     */
    setupTowerTooltips() {
        const towerButtons = [
            { element: this.elements.basicTower, type: 'BASIC' },
            { element: this.elements.sniperTower, type: 'SNIPER' },
            { element: this.elements.areaTower, type: 'AREA' }
        ];
        
        towerButtons.forEach(({ element, type }) => {
            if (element) {
                const towerConfig = TOWER_TYPES[type];
                const tooltip = this.createTowerTooltip(towerConfig);
                this.tooltips.set(element, tooltip);
                
                element.addEventListener('mouseenter', (e) => this.showTooltip(e, tooltip));
                element.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }
    
    /**
     * Crea el contenido del tooltip para una torre
     * @param {Object} towerConfig - Configuración de la torre
     * @returns {string} HTML del tooltip
     */
    createTowerTooltip(towerConfig) {
        return `
            <div class="tooltip">
                <h4>${towerConfig.name}</h4>
                <p><strong>Daño:</strong> ${towerConfig.damage}</p>
                <p><strong>Rango:</strong> ${towerConfig.range}</p>
                <p><strong>Cadencia:</strong> ${towerConfig.fireRate}/s</p>
                <p><strong>Costo:</strong> $${towerConfig.cost}</p>
                ${towerConfig.splash ? '<p><strong>Daño de área</strong></p>' : ''}
            </div>
        `;
    }
    
    /**
     * Configura efectos hover para botones
     */
    setupHoverEffects() {
        const buttons = document.querySelectorAll('.tower-btn, .control-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!button.disabled) {
                    button.style.transform = 'translateY(-2px)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }
    
    /**
     * Configura información de atajos de teclado
     */
    setupKeyboardShortcuts() {
        // Agregar títulos con atajos de teclado
        if (this.elements.basicTower) {
            this.elements.basicTower.title = 'Torre Básica (Tecla 1)';
        }
        if (this.elements.sniperTower) {
            this.elements.sniperTower.title = 'Torre Sniper (Tecla 2)';
        }
        if (this.elements.areaTower) {
            this.elements.areaTower.title = 'Torre de Área (Tecla 3)';
        }
        if (this.elements.startWave) {
            this.elements.startWave.title = 'Iniciar Oleada (Barra espaciadora)';
        }
        if (this.elements.pauseGame) {
            this.elements.pauseGame.title = 'Pausar/Reanudar (Tecla P)';
        }
    }
    
    /**
     * Actualiza toda la interfaz de usuario
     * @param {Object} gameState - Estado actual del juego
     */
    update(gameState) {
        // Actualizar HUD
        this.updateHUD(gameState);
        
        // Actualizar botones de torres
        this.updateTowerButtons(gameState);
        
        // Actualizar botones de control
        this.updateControlButtons(gameState);
        
        // Actualizar animaciones
        this.updateAnimations();
        
        // Procesar notificaciones
        this.updateNotifications();
    }
    
    /**
     * Actualiza los elementos del HUD
     * @param {Object} gameState - Estado del juego
     */
    updateHUD(gameState) {
        // Actualizar vidas
        if (gameState.lives !== this.cachedValues.lives) {
            this.updateLives(gameState.lives);
            this.cachedValues.lives = gameState.lives;
        }
        
        // Actualizar dinero con animación
        if (gameState.money !== this.cachedValues.money) {
            this.updateMoney(gameState.money, this.cachedValues.money);
            this.cachedValues.money = gameState.money;
        }
        
        // Actualizar información de oleada
        const waveInfo = `${gameState.currentWave}/${gameState.totalWaves}`;
        if (waveInfo !== this.cachedValues.wave) {
            this.updateWave(waveInfo, gameState.waveInProgress);
            this.cachedValues.wave = waveInfo;
        }
        
        // Actualizar contador de enemigos
        if (gameState.enemiesRemaining !== this.cachedValues.enemies) {
            this.updateEnemies(gameState.enemiesRemaining);
            this.cachedValues.enemies = gameState.enemiesRemaining;
        }
    }
    
    /**
     * Actualiza el display de vidas
     * @param {number} lives - Número actual de vidas
     */
    updateLives(lives) {
        if (!this.elements.lives) return;
        
        this.elements.lives.textContent = lives;
        
        // Efecto visual si las vidas son bajas
        if (lives <= 5) {
            this.elements.lives.style.color = '#e74c3c';
            this.elements.lives.style.fontWeight = 'bold';
            
            if (lives <= 2) {
                this.elements.lives.classList.add('critical');
            }
        } else {
            this.elements.lives.style.color = '';
            this.elements.lives.style.fontWeight = '';
            this.elements.lives.classList.remove('critical');
        }
    }
    
    /**
     * Actualiza el display de dinero con animación
     * @param {number} newMoney - Nueva cantidad de dinero
     * @param {number} oldMoney - Cantidad anterior de dinero
     */
    updateMoney(newMoney, oldMoney) {
        if (!this.elements.money) return;
        
        // Actualizar texto inmediatamente
        this.elements.money.textContent = formatMoney(newMoney);
        
        // Efecto visual basado en el cambio
        const change = newMoney - oldMoney;
        if (change !== 0) {
            this.animateMoneyChange(change);
        }
        
        // Color basado en la cantidad disponible
        if (newMoney < 100) {
            this.elements.money.style.color = '#e74c3c';
        } else if (newMoney < 250) {
            this.elements.money.style.color = '#f39c12';
        } else {
            this.elements.money.style.color = '#27ae60';
        }
    }
    
    /**
     * Anima el cambio de dinero
     * @param {number} change - Cambio en la cantidad de dinero
     */
    animateMoneyChange(change) {
        if (!this.elements.money) return;
        
        // Crear elemento de animación
        const changeElement = document.createElement('span');
        changeElement.className = 'money-change';
        changeElement.textContent = (change > 0 ? '+' : '') + formatMoney(change);
        changeElement.style.color = change > 0 ? '#27ae60' : '#e74c3c';
        
        // Posicionar elemento
        const rect = this.elements.money.getBoundingClientRect();
        changeElement.style.position = 'absolute';
        changeElement.style.left = rect.right + 'px';
        changeElement.style.top = rect.top + 'px';
        changeElement.style.fontSize = '0.9em';
        changeElement.style.fontWeight = 'bold';
        changeElement.style.pointerEvents = 'none';
        changeElement.style.zIndex = '1000';
        
        document.body.appendChild(changeElement);
        
        // Animar
        let opacity = 1;
        let yOffset = 0;
        const animate = () => {
            opacity -= 0.02;
            yOffset -= 1;
            
            changeElement.style.opacity = opacity;
            changeElement.style.transform = `translateY(${yOffset}px)`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(changeElement);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Actualiza el display de oleada
     * @param {string} waveInfo - Información de la oleada
     * @param {boolean} inProgress - Si hay oleada en progreso
     */
    updateWave(waveInfo, inProgress) {
        if (!this.elements.wave) return;
        
        this.elements.wave.textContent = waveInfo;
        
        // Efecto visual si hay oleada en progreso
        if (inProgress) {
            this.elements.wave.style.color = '#e74c3c';
            this.elements.wave.style.fontWeight = 'bold';
        } else {
            this.elements.wave.style.color = '';
            this.elements.wave.style.fontWeight = '';
        }
    }
    
    /**
     * Actualiza el contador de enemigos
     * @param {number} enemiesRemaining - Enemigos restantes
     */
    updateEnemies(enemiesRemaining) {
        if (!this.elements.enemies) return;
        
        this.elements.enemies.textContent = enemiesRemaining;
        
        // Efecto visual basado en la cantidad
        if (enemiesRemaining > 20) {
            this.elements.enemies.style.color = '#e74c3c';
        } else if (enemiesRemaining > 10) {
            this.elements.enemies.style.color = '#f39c12';
        } else {
            this.elements.enemies.style.color = '#27ae60';
        }
    }
    
    /**
     * Actualiza los botones de torres
     * @param {Object} gameState - Estado del juego
     */
    updateTowerButtons(gameState) {
        const towerButtons = [
            { element: this.elements.basicTower, type: 'BASIC' },
            { element: this.elements.sniperTower, type: 'SNIPER' },
            { element: this.elements.areaTower, type: 'AREA' }
        ];
        
        towerButtons.forEach(({ element, type }) => {
            if (!element) return;
            
            const towerConfig = TOWER_TYPES[type];
            const canAfford = gameState.money >= towerConfig.cost;
            const isSelected = this.selectedTowerType === type;
            
            // Actualizar estado del botón
            element.disabled = !canAfford || gameState.gameOver;
            
            // Actualizar clases CSS
            element.classList.toggle('selected', isSelected);
            element.classList.toggle('affordable', canAfford);
            element.classList.toggle('expensive', !canAfford);
            
            // Actualizar opacidad
            element.style.opacity = canAfford ? '1' : '0.5';
        });
    }
    
    /**
     * Actualiza los botones de control
     * @param {Object} gameState - Estado del juego
     */
    updateControlButtons(gameState) {
        // Botón de iniciar oleada
        if (this.elements.startWave) {
            const canStart = gameState.canStartWave && !gameState.gameOver;
            this.elements.startWave.disabled = !canStart;
            
            if (gameState.isCountingDown) {
                this.elements.startWave.textContent = `Iniciar (${gameState.countdownTime}s)`;
            } else if (gameState.waveInProgress) {
                this.elements.startWave.textContent = 'Oleada en Progreso';
            } else if (gameState.allWavesComplete) {
                this.elements.startWave.textContent = 'Juego Completado';
            } else {
                this.elements.startWave.textContent = 'Iniciar Oleada';
            }
        }
        
        // Botón de pausa
        if (this.elements.pauseGame) {
            this.elements.pauseGame.disabled = gameState.gameOver;
            this.elements.pauseGame.textContent = gameState.isPaused ? 'Reanudar' : 'Pausar';
        }
        
        // Botón de reset
        if (this.elements.resetGame) {
            this.elements.resetGame.disabled = false; // Siempre disponible
        }
    }
    
    /**
     * Actualiza las animaciones activas
     */
    updateAnimations() {
        // Actualizar animaciones de cambio de dinero
        if (this.animations.moneyChange.active) {
            const elapsed = Date.now() - this.animations.moneyChange.startTime;
            const progress = Math.min(elapsed / this.animations.moneyChange.duration, 1);
            
            if (progress >= 1) {
                this.animations.moneyChange.active = false;
            }
        }
        
        // Actualizar números de daño flotantes
        this.animations.damageNumbers = this.animations.damageNumbers.filter(damage => {
            damage.timeAlive += 16; // Aproximadamente 60 FPS
            return damage.timeAlive < damage.duration;
        });
    }
    
    /**
     * Actualiza las notificaciones
     */
    updateNotifications() {
        const currentTime = Date.now();
        
        // Filtrar notificaciones expiradas
        this.notifications = this.notifications.filter(notification => {
            return currentTime < notification.expireTime;
        });
    }
    
    /**
     * Selecciona un tipo de torre
     * @param {string} towerType - Tipo de torre a seleccionar
     */
    selectTowerType(towerType) {
        // Deseleccionar torre actual si es la misma
        if (this.selectedTowerType === towerType) {
            this.selectedTowerType = null;
        } else {
            this.selectedTowerType = towerType;
        }
        
        // Actualizar estado visual de los botones
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        if (this.selectedTowerType) {
            const selectedButton = document.querySelector(`[data-tower="${towerType}"]`);
            if (selectedButton) {
                selectedButton.classList.add('selected');
            }
        }
        
        console.log('Torre seleccionada:', this.selectedTowerType);
    }
    
    /**
     * Obtiene el tipo de torre seleccionado
     * @returns {string|null} Tipo de torre seleccionado
     */
    getSelectedTowerType() {
        return this.selectedTowerType;
    }
    
    /**
     * Muestra la pantalla de game over
     * @param {boolean} isVictory - Si es victoria o derrota
     * @param {string} message - Mensaje personalizado
     * @param {Object} stats - Estadísticas del juego
     */
    showGameOverScreen(isVictory, message, stats = {}) {
        if (!this.elements.gameOverScreen) return;
        
        this.gameOver = true;
        
        // Actualizar contenido
        if (this.elements.gameOverTitle) {
            this.elements.gameOverTitle.textContent = isVictory ? '¡Victoria!' : 'Game Over';
            this.elements.gameOverTitle.style.color = isVictory ? '#27ae60' : '#e74c3c';
        }
        
        if (this.elements.gameOverMessage) {
            let fullMessage = message;
            
            // Agregar estadísticas si están disponibles
            if (stats.wavesCompleted !== undefined) {
                fullMessage += `\n\nOleadas completadas: ${stats.wavesCompleted}`;
            }
            if (stats.enemiesKilled !== undefined) {
                fullMessage += `\nEnemigos eliminados: ${stats.enemiesKilled}`;
            }
            if (stats.towersBuilt !== undefined) {
                fullMessage += `\nTorres construidas: ${stats.towersBuilt}`;
            }
            
            this.elements.gameOverMessage.textContent = fullMessage;
        }
        
        // Mostrar pantalla
        this.elements.gameOverScreen.classList.remove('hidden');
        
        // Enfocar botón de reinicio
        if (this.elements.restartBtn) {
            setTimeout(() => this.elements.restartBtn.focus(), 100);
        }
    }
    
    /**
     * Oculta la pantalla de game over
     */
    hideGameOverScreen() {
        if (!this.elements.gameOverScreen) return;
        
        this.gameOver = false;
        this.elements.gameOverScreen.classList.add('hidden');
    }
    
    /**
     * Muestra un tooltip
     * @param {Event} event - Evento del mouse
     * @param {string} content - Contenido del tooltip
     */
    showTooltip(event, content) {
        // Implementación básica de tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'game-tooltip';
        tooltip.innerHTML = content;
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = tooltip.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.width / 2) + 'px';
        tooltip.style.top = (event.clientY - rect.height - 10) + 'px';
        
        this.currentTooltip = tooltip;
    }
    
    /**
     * Oculta el tooltip actual
     */
    hideTooltip() {
        if (this.currentTooltip) {
            document.body.removeChild(this.currentTooltip);
            this.currentTooltip = null;
        }
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación (info, success, warning, error)
     * @param {number} duration - Duración en milisegundos
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message: message,
            type: type,
            expireTime: Date.now() + duration
        };
        
        this.notifications.push(notification);
        
        // Crear elemento visual (implementación básica)
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Resetea la UI a su estado inicial
     */
    reset() {
        // Resetear selección de torre
        this.selectedTowerType = null;
        
        // Resetear estado
        this.isPaused = false;
        this.gameOver = false;
        
        // Limpiar cache
        this.cachedValues = {
            lives: -1,
            money: -1,
            wave: '',
            enemies: -1
        };
        
        // Limpiar animaciones y notificaciones
        this.animations.moneyChange.active = false;
        this.animations.damageNumbers = [];
        this.notifications = [];
        
        // Ocultar pantallas overlay
        this.hideGameOverScreen();
        this.hideTooltip();
        
        // Resetear botones
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = false;
        });
        
        console.log('UIManager reseteado');
    }
    
    /**
     * Obtiene información de debug del UIManager
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        return {
            selectedTowerType: this.selectedTowerType,
            isPaused: this.isPaused,
            gameOver: this.gameOver,
            cachedValues: this.cachedValues,
            activeAnimations: {
                moneyChange: this.animations.moneyChange.active,
                damageNumbers: this.animations.damageNumbers.length
            },
            notifications: this.notifications.length,
            elementsFound: Object.keys(this.elements).filter(key => this.elements[key] !== null).length
        };
    }
}