/**
 * Datos del camino para el juego Tower Defense
 * Define las coordenadas del camino que seguirán los enemigos
 */

/**
 * Array de coordenadas que define el camino principal
 * Los enemigos seguirán este camino desde el inicio hasta el final
 */
const PATH_COORDINATES = [
    // Punto de inicio (izquierda)
    { x: -20, y: 300 },
    
    // Primera sección horizontal
    { x: 100, y: 300 },
    
    // Primera curva hacia arriba
    { x: 200, y: 300 },
    { x: 200, y: 200 },
    
    // Segunda sección horizontal
    { x: 200, y: 150 },
    { x: 400, y: 150 },
    
    // Segunda curva hacia abajo
    { x: 500, y: 150 },
    { x: 500, y: 250 },
    
    // Tercera sección horizontal
    { x: 500, y: 350 },
    { x: 650, y: 350 },
    
    // Curva final hacia arriba
    { x: 700, y: 350 },
    { x: 700, y: 250 },
    
    // Recta final hacia la salida
    { x: 700, y: 200 },
    { x: 820, y: 200 } // Punto de salida (derecha)
];

/**
 * Configuración adicional del camino
 */
const PATH_CONFIG = {
    // Ancho visual del camino
    width: 40,
    
    // Color del camino
    color: '#D7CCC8',
    
    // Color del borde del camino
    borderColor: '#A1887F',
    
    // Ancho del borde
    borderWidth: 2,
    
    // Puntos de spawn y objetivo
    spawnPoint: { x: -20, y: 300 },
    targetPoint: { x: 820, y: 200 },
    
    // Configuración para suavizado de curvas
    smoothing: {
        enabled: true,
        tension: 0.3
    }
};

/**
 * Calcula la longitud total del camino
 * @returns {number} Longitud total en pixels
 */
function calculatePathLength() {
    let totalLength = 0;
    
    for (let i = 1; i < PATH_COORDINATES.length; i++) {
        const prev = PATH_COORDINATES[i - 1];
        const curr = PATH_COORDINATES[i];
        totalLength += distance(prev.x, prev.y, curr.x, curr.y);
    }
    
    return totalLength;
}

/**
 * Obtiene la posición en el camino basada en un porcentaje de progreso
 * @param {number} progress - Progreso del 0 al 1
 * @returns {Object} Objeto con x, y y ángulo de dirección
 */
function getPositionOnPath(progress) {
    // Asegurar que el progreso esté entre 0 y 1
    progress = clamp(progress, 0, 1);
    
    if (progress === 0) {
        const start = PATH_COORDINATES[0];
        const next = PATH_COORDINATES[1];
        return {
            x: start.x,
            y: start.y,
            angle: angleBetween(start.x, start.y, next.x, next.y)
        };
    }
    
    if (progress === 1) {
        const end = PATH_COORDINATES[PATH_COORDINATES.length - 1];
        const prev = PATH_COORDINATES[PATH_COORDINATES.length - 2];
        return {
            x: end.x,
            y: end.y,
            angle: angleBetween(prev.x, prev.y, end.x, end.y)
        };
    }
    
    // Calcular la distancia total del camino
    const totalLength = calculatePathLength();
    const targetDistance = progress * totalLength;
    
    let currentDistance = 0;
    
    // Encontrar el segmento correcto del camino
    for (let i = 1; i < PATH_COORDINATES.length; i++) {
        const prev = PATH_COORDINATES[i - 1];
        const curr = PATH_COORDINATES[i];
        const segmentLength = distance(prev.x, prev.y, curr.x, curr.y);
        
        if (currentDistance + segmentLength >= targetDistance) {
            // Interpolar dentro de este segmento
            const segmentProgress = (targetDistance - currentDistance) / segmentLength;
            
            return {
                x: lerp(prev.x, curr.x, segmentProgress),
                y: lerp(prev.y, curr.y, segmentProgress),
                angle: angleBetween(prev.x, prev.y, curr.x, curr.y)
            };
        }
        
        currentDistance += segmentLength;
    }
    
    // Fallback al final del camino
    const end = PATH_COORDINATES[PATH_COORDINATES.length - 1];
    const prev = PATH_COORDINATES[PATH_COORDINATES.length - 2];
    return {
        x: end.x,
        y: end.y,
        angle: angleBetween(prev.x, prev.y, end.x, end.y)
    };
}

/**
 * Verifica si una posición está en el camino
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} tolerance - Tolerancia en pixels (por defecto el ancho del camino)
 * @returns {boolean} True si la posición está en el camino
 */
function isOnPath(x, y, tolerance = PATH_CONFIG.width / 2) {
    for (let i = 1; i < PATH_COORDINATES.length; i++) {
        const prev = PATH_COORDINATES[i - 1];
        const curr = PATH_COORDINATES[i];
        
        // Calcular la distancia del punto a la línea del segmento
        const distanceToSegment = distancePointToLineSegment(x, y, prev.x, prev.y, curr.x, curr.y);
        
        if (distanceToSegment <= tolerance) {
            return true;
        }
    }
    
    return false;
}

/**
 * Calcula la distancia de un punto a un segmento de línea
 * @param {number} px - X del punto
 * @param {number} py - Y del punto
 * @param {number} x1 - X del inicio del segmento
 * @param {number} y1 - Y del inicio del segmento
 * @param {number} x2 - X del final del segmento
 * @param {number} y2 - Y del final del segmento
 * @returns {number} Distancia mínima al segmento
 */
function distancePointToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
        // El segmento es un punto
        return distance(px, py, x1, y1);
    }
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    return distance(px, py, xx, yy);
}

/**
 * Obtiene todos los puntos del camino para renderizado
 * @returns {Array} Array de coordenadas del camino
 */
function getPathPoints() {
    return [...PATH_COORDINATES];
}

/**
 * Obtiene la configuración del camino
 * @returns {Object} Configuración del camino
 */
function getPathConfig() {
    return { ...PATH_CONFIG };
}

// Exportar funciones y datos para compatibilidad con módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PATH_COORDINATES,
        PATH_CONFIG,
        calculatePathLength,
        getPositionOnPath,
        isOnPath,
        distancePointToLineSegment,
        getPathPoints,
        getPathConfig
    };
}