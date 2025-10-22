/**
 * Funciones de utilidad para el juego Tower Defense
 * Contiene funciones matemáticas, de conversión y helpers generales
 */

/**
 * Calcula la distancia euclidiana entre dos puntos
 * @param {number} x1 - Coordenada X del primer punto
 * @param {number} y1 - Coordenada Y del primer punto
 * @param {number} x2 - Coordenada X del segundo punto
 * @param {number} y2 - Coordenada Y del segundo punto
 * @returns {number} La distancia entre los dos puntos
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula la distancia al cuadrado entre dos puntos (más eficiente para comparaciones)
 * @param {number} x1 - Coordenada X del primer punto
 * @param {number} y1 - Coordenada Y del primer punto
 * @param {number} x2 - Coordenada X del segundo punto
 * @param {number} y2 - Coordenada Y del segundo punto
 * @returns {number} La distancia al cuadrado entre los dos puntos
 */
function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Convierte coordenadas de pixel a coordenadas de grid
 * @param {number} pixelX - Coordenada X en pixels
 * @param {number} pixelY - Coordenada Y en pixels
 * @returns {Object} Objeto con propiedades gridX y gridY
 */
function pixelToGrid(pixelX, pixelY) {
    return {
        gridX: Math.floor(pixelX / GAME_CONFIG.GRID_SIZE),
        gridY: Math.floor(pixelY / GAME_CONFIG.GRID_SIZE)
    };
}

/**
 * Convierte coordenadas de grid a coordenadas de pixel (centro de la celda)
 * @param {number} gridX - Coordenada X del grid
 * @param {number} gridY - Coordenada Y del grid
 * @returns {Object} Objeto con propiedades pixelX y pixelY
 */
function gridToPixel(gridX, gridY) {
    return {
        pixelX: gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
        pixelY: gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2
    };
}

/**
 * Verifica si un punto está dentro de los límites del canvas
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {boolean} True si está dentro de los límites
 */
function isWithinBounds(x, y) {
    return x >= 0 && x < GAME_CONFIG.CANVAS_WIDTH && 
           y >= 0 && y < GAME_CONFIG.CANVAS_HEIGHT;
}

/**
 * Verifica si una posición de grid es válida
 * @param {number} gridX - Coordenada X del grid
 * @param {number} gridY - Coordenada Y del grid
 * @returns {boolean} True si la posición de grid es válida
 */
function isValidGridPosition(gridX, gridY) {
    const maxGridX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.GRID_SIZE);
    const maxGridY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.GRID_SIZE);
    
    return gridX >= 0 && gridX < maxGridX && gridY >= 0 && gridY < maxGridY;
}

/**
 * Calcula el ángulo entre dos puntos en radianes
 * @param {number} x1 - Coordenada X del primer punto
 * @param {number} y1 - Coordenada Y del primer punto
 * @param {number} x2 - Coordenada X del segundo punto
 * @param {number} y2 - Coordenada Y del segundo punto
 * @returns {number} El ángulo en radianes
 */
function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convierte radianes a grados
 * @param {number} radians - Ángulo en radianes
 * @returns {number} Ángulo en grados
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Convierte grados a radianes
 * @param {number} degrees - Ángulo en grados
 * @returns {number} Ángulo en radianes
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Interpola linealmente entre dos valores
 * @param {number} start - Valor inicial
 * @param {number} end - Valor final
 * @param {number} t - Factor de interpolación (0-1)
 * @returns {number} Valor interpolado
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Limita un valor entre un mínimo y máximo
 * @param {number} value - Valor a limitar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor limitado
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Genera un entero aleatorio entre min y max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Entero aleatorio
 */
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica si dos círculos se intersectan
 * @param {number} x1 - Centro X del primer círculo
 * @param {number} y1 - Centro Y del primer círculo
 * @param {number} r1 - Radio del primer círculo
 * @param {number} x2 - Centro X del segundo círculo
 * @param {number} y2 - Centro Y del segundo círculo
 * @param {number} r2 - Radio del segundo círculo
 * @returns {boolean} True si los círculos se intersectan
 */
function circlesIntersect(x1, y1, r1, x2, y2, r2) {
    const dist = distance(x1, y1, x2, y2);
    return dist <= (r1 + r2);
}

/**
 * Verifica si un punto está dentro de un círculo
 * @param {number} pointX - Coordenada X del punto
 * @param {number} pointY - Coordenada Y del punto
 * @param {number} circleX - Centro X del círculo
 * @param {number} circleY - Centro Y del círculo
 * @param {number} radius - Radio del círculo
 * @returns {boolean} True si el punto está dentro del círculo
 */
function pointInCircle(pointX, pointY, circleX, circleY, radius) {
    return distance(pointX, pointY, circleX, circleY) <= radius;
}

/**
 * Verifica si un punto está dentro de un rectángulo
 * @param {number} pointX - Coordenada X del punto
 * @param {number} pointY - Coordenada Y del punto
 * @param {number} rectX - Coordenada X del rectángulo
 * @param {number} rectY - Coordenada Y del rectángulo
 * @param {number} rectWidth - Ancho del rectángulo
 * @param {number} rectHeight - Alto del rectángulo
 * @returns {boolean} True si el punto está dentro del rectángulo
 */
function pointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
    return pointX >= rectX && pointX <= rectX + rectWidth &&
           pointY >= rectY && pointY <= rectY + rectHeight;
}

/**
 * Normaliza un vector 2D
 * @param {number} x - Componente X del vector
 * @param {number} y - Componente Y del vector
 * @returns {Object} Vector normalizado con propiedades x e y
 */
function normalize(x, y) {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) {
        return { x: 0, y: 0 };
    }
    return {
        x: x / length,
        y: y / length
    };
}

/**
 * Calcula la magnitud de un vector 2D
 * @param {number} x - Componente X del vector
 * @param {number} y - Componente Y del vector
 * @returns {number} Magnitud del vector
 */
function magnitude(x, y) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada como moneda
 */
function formatMoney(amount) {
    return '$' + amount.toString();
}

/**
 * Formatea un tiempo en milisegundos a formato MM:SS
 * @param {number} milliseconds - Tiempo en milisegundos
 * @returns {string} Tiempo formateado
 */
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Crea una copia profunda de un objeto
 * @param {Object} obj - Objeto a copiar
 * @returns {Object} Copia del objeto
 */
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepCopy(item));
    }
    
    const copy = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    
    return copy;
}

/**
 * Debounce function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función debounced
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en milisegundos
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exportar funciones para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        distance,
        distanceSquared,
        pixelToGrid,
        gridToPixel,
        isWithinBounds,
        isValidGridPosition,
        angleBetween,
        radiansToDegrees,
        degreesToRadians,
        lerp,
        clamp,
        randomBetween,
        randomIntBetween,
        circlesIntersect,
        pointInCircle,
        pointInRect,
        normalize,
        magnitude,
        formatMoney,
        formatTime,
        deepCopy,
        debounce,
        throttle
    };
}