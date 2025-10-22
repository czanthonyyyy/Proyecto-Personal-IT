/**
 * Punto de entrada principal de la aplicación Tower Defense
 * Inicializa el canvas y el juego cuando la página se carga
 */

// Variables globales
let game;
let canvas;
let ctx;

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando Tower Defense: Última Defensa...');
    
    // Obtener el canvas y contexto
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('No se pudo encontrar el canvas del juego');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas');
        return;
    }
    
    // Configurar el canvas
    setupCanvas();
    
    // Crear e inicializar el juego
    try {
        game = new Game(canvas);
        game.init();
        console.log('Juego inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar el juego:', error);
        showError('Error al cargar el juego. Por favor, recarga la página.');
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Iniciar el bucle del juego
    startGameLoop();
});

/**
 * Configura las propiedades del canvas
 */
function setupCanvas() {
    // Asegurar que el canvas tenga las dimensiones correctas
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    // Configurar propiedades de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    console.log(`Canvas configurado: ${canvas.width}x${canvas.height}`);
}

/**
 * Configura todos los event listeners del juego
 */
function setupEventListeners() {
    // Event listeners del canvas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    
    // Event listeners de los botones de torres
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.addEventListener('click', handleTowerButtonClick);
    });
    
    // Event listeners de controles del juego
    const startWaveBtn = document.getElementById('startWave');
    const pauseBtn = document.getElementById('pauseGame');
    const resetBtn = document.getElementById('resetGame');
    const restartBtn = document.getElementById('restartBtn');
    
    if (startWaveBtn) startWaveBtn.addEventListener('click', handleStartWave);
    if (pauseBtn) pauseBtn.addEventListener('click', handlePauseGame);
    if (resetBtn) resetBtn.addEventListener('click', handleResetGame);
    if (restartBtn) restartBtn.addEventListener('click', handleRestartGame);
    
    // Event listeners del teclado
    document.addEventListener('keydown', handleKeyDown);
    
    console.log('Event listeners configurados');
}

/**
 * Maneja los clics en el canvas
 */
function handleCanvasClick(event) {
    if (!game) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Ajustar coordenadas si el canvas está escalado
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const gameX = x * scaleX;
    const gameY = y * scaleY;
    
    game.handleClick(gameX, gameY);
}

/**
 * Maneja el movimiento del mouse sobre el canvas
 */
function handleCanvasMouseMove(event) {
    if (!game) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const gameX = x * scaleX;
    const gameY = y * scaleY;
    
    game.handleMouseMove(gameX, gameY);
}

/**
 * Maneja cuando el mouse sale del canvas
 */
function handleCanvasMouseLeave() {
    if (!game) return;
    game.handleMouseLeave();
}

/**
 * Maneja los clics en los botones de torres
 */
function handleTowerButtonClick(event) {
    if (!game) return;
    
    const towerType = event.currentTarget.dataset.tower;
    if (towerType) {
        game.selectTowerType(towerType);
        
        // Actualizar estado visual de los botones
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
    }
}

/**
 * Maneja el botón de iniciar oleada
 */
function handleStartWave() {
    if (!game) return;
    game.startNextWave();
}

/**
 * Maneja el botón de pausa
 */
function handlePauseGame() {
    if (!game) return;
    game.togglePause();
    
    const btn = document.getElementById('pauseGame');
    if (btn) {
        btn.textContent = game.isPaused() ? 'Reanudar' : 'Pausar';
    }
}

/**
 * Maneja el botón de reiniciar
 */
function handleResetGame() {
    if (!game) return;
    
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        game.reset();
        
        // Resetear UI
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const pauseBtn = document.getElementById('pauseGame');
        if (pauseBtn) pauseBtn.textContent = 'Pausar';
    }
}

/**
 * Maneja el botón de reiniciar desde la pantalla de game over
 */
function handleRestartGame() {
    if (!game) return;
    
    game.reset();
    hideGameOverScreen();
    
    // Resetear UI
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

/**
 * Maneja las teclas presionadas
 */
function handleKeyDown(event) {
    if (!game) return;
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            handleStartWave();
            break;
        case 'KeyP':
            event.preventDefault();
            handlePauseGame();
            break;
        case 'KeyR':
            event.preventDefault();
            if (event.ctrlKey) {
                handleResetGame();
            }
            break;
        case 'Escape':
            event.preventDefault();
            // Deseleccionar torre
            game.selectTowerType(null);
            document.querySelectorAll('.tower-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            break;
        case 'Digit1':
            event.preventDefault();
            document.getElementById('basicTower').click();
            break;
        case 'Digit2':
            event.preventDefault();
            document.getElementById('sniperTower').click();
            break;
        case 'Digit3':
            event.preventDefault();
            document.getElementById('areaTower').click();
            break;
    }
}

/**
 * Inicia el bucle principal del juego
 */
function startGameLoop() {
    let lastTime = 0;
    
    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        if (game) {
            try {
                game.update(deltaTime);
                game.render();
            } catch (error) {
                console.error('Error en el bucle del juego:', error);
                showError('Error durante el juego. Intenta reiniciar.');
                return;
            }
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
    console.log('Bucle del juego iniciado');
}

/**
 * Muestra la pantalla de game over
 */
function showGameOverScreen(isVictory = false, message = '') {
    const overlay = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const messageEl = document.getElementById('gameOverMessage');
    
    if (overlay && title && messageEl) {
        title.textContent = isVictory ? '¡Victoria!' : 'Game Over';
        messageEl.textContent = message || (isVictory ? 
            '¡Has defendido tu base exitosamente!' : 
            'Los enemigos han llegado a tu base');
        
        overlay.classList.remove('hidden');
    }
}

/**
 * Oculta la pantalla de game over
 */
function hideGameOverScreen() {
    const overlay = document.getElementById('gameOverScreen');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
    alert('Error: ' + message);
}

// Exponer funciones globales necesarias
window.showGameOverScreen = showGameOverScreen;
window.hideGameOverScreen = hideGameOverScreen;