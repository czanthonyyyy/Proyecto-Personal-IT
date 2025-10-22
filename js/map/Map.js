/**
 * Clase Map para manejar el renderizado del mapa, grid y camino
 * Responsable de la visualización del terreno de juego
 */

class Map {
    constructor() {
        this.width = MAP_CONFIG.width;
        this.height = MAP_CONFIG.height;
        this.gridSize = MAP_CONFIG.gridSize;
        this.backgroundColor = MAP_CONFIG.backgroundColor;
        this.gridColor = MAP_CONFIG.gridColor;
        this.gridOpacity = MAP_CONFIG.gridOpacity;
        
        // Configuración del camino
        this.pathConfig = getPathConfig();
        this.pathPoints = getPathPoints();
        
        // Grid para validación de torres
        this.gridCols = Math.floor(this.width / this.gridSize);
        this.gridRows = Math.floor(this.height / this.gridSize);
        
        // Matriz para rastrear posiciones ocupadas
        this.occupiedCells = this.initializeOccupiedCells();
        
        // Cache para optimización de renderizado
        this.pathCache = null;
        this.gridCache = null;
        
        console.log(`Mapa inicializado: ${this.gridCols}x${this.gridRows} celdas`);
    }
    
    /**
     * Inicializa la matriz de celdas ocupadas
     * @returns {Array} Matriz 2D de celdas ocupadas
     */
    initializeOccupiedCells() {
        const cells = [];
        
        for (let row = 0; row < this.gridRows; row++) {
            cells[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                const pixelPos = gridToPixel(col, row);
                
                // Marcar celdas del camino como ocupadas
                const isPath = isOnPath(pixelPos.pixelX, pixelPos.pixelY, this.pathConfig.width / 2 + 10);
                
                cells[row][col] = {
                    occupied: isPath,
                    isPath: isPath,
                    hasTower: false,
                    towerType: null
                };
            }
        }
        
        return cells;
    }
    
    /**
     * Renderiza todo el mapa
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {boolean} showGrid - Si mostrar el grid o no
     */
    render(ctx, showGrid = true) {
        // Renderizar fondo
        this.renderBackground(ctx);
        
        // Renderizar camino
        this.renderPath(ctx);
        
        // Renderizar grid si está habilitado
        if (showGrid) {
            this.renderGrid(ctx);
        }
    }
    
    /**
     * Renderiza el fondo del mapa
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderBackground(ctx) {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Renderiza el camino
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderPath(ctx) {
        if (this.pathPoints.length < 2) return;
        
        ctx.save();
        
        // Renderizar el camino principal
        ctx.strokeStyle = this.pathConfig.color;
        ctx.lineWidth = this.pathConfig.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        
        for (let i = 1; i < this.pathPoints.length; i++) {
            ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        
        ctx.stroke();
        
        // Renderizar borde del camino
        if (this.pathConfig.borderWidth > 0) {
            ctx.strokeStyle = this.pathConfig.borderColor;
            ctx.lineWidth = this.pathConfig.width + this.pathConfig.borderWidth * 2;
            
            ctx.beginPath();
            ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
            
            for (let i = 1; i < this.pathPoints.length; i++) {
                ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
            }
            
            ctx.stroke();
            
            // Volver a dibujar el camino encima
            ctx.strokeStyle = this.pathConfig.color;
            ctx.lineWidth = this.pathConfig.width;
            
            ctx.beginPath();
            ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
            
            for (let i = 1; i < this.pathPoints.length; i++) {
                ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
            }
            
            ctx.stroke();
        }
        
        // Renderizar indicadores de inicio y fin
        this.renderPathMarkers(ctx);
        
        ctx.restore();
    }
    
    /**
     * Renderiza los marcadores de inicio y fin del camino
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderPathMarkers(ctx) {
        const startPoint = this.pathPoints[0];
        const endPoint = this.pathPoints[this.pathPoints.length - 1];
        
        // Marcador de inicio (verde)
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', startPoint.x, startPoint.y);
        
        // Marcador de fin (rojo)
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.fillText('F', endPoint.x, endPoint.y);
    }
    
    /**
     * Renderiza el grid
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = this.gridColor;
        ctx.globalAlpha = this.gridOpacity;
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza indicadores de validez para colocación de torres
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} mouseX - Coordenada X del mouse
     * @param {number} mouseY - Coordenada Y del mouse
     * @param {string} towerType - Tipo de torre seleccionada
     */
    renderPlacementPreview(ctx, mouseX, mouseY, towerType) {
        if (!towerType) return;
        
        const gridPos = pixelToGrid(mouseX, mouseY);
        const isValid = this.isValidTowerPlacement(gridPos.gridX, gridPos.gridY);
        const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY);
        
        ctx.save();
        
        // Color basado en validez
        const color = isValid ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)';
        const borderColor = isValid ? '#4CAF50' : '#F44336';
        
        // Renderizar celda de preview
        ctx.fillStyle = color;
        ctx.fillRect(
            gridPos.gridX * this.gridSize,
            gridPos.gridY * this.gridSize,
            this.gridSize,
            this.gridSize
        );
        
        // Borde de la celda
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            gridPos.gridX * this.gridSize,
            gridPos.gridY * this.gridSize,
            this.gridSize,
            this.gridSize
        );
        
        // Preview de la torre si es válida
        if (isValid && TOWER_TYPES[towerType]) {
            const towerConfig = TOWER_TYPES[towerType];
            
            // Torre preview
            ctx.fillStyle = towerConfig.color;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(pixelPos.pixelX, pixelPos.pixelY, towerConfig.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Rango preview
            ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pixelPos.pixelX, pixelPos.pixelY, towerConfig.range, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Verifica si una posición de grid es válida para colocar una torre
     * @param {number} gridX - Coordenada X del grid
     * @param {number} gridY - Coordenada Y del grid
     * @returns {boolean} True si es válida
     */
    isValidTowerPlacement(gridX, gridY) {
        // Verificar límites del grid
        if (!isValidGridPosition(gridX, gridY)) {
            return false;
        }
        
        // Verificar si la celda está ocupada
        if (gridY >= 0 && gridY < this.gridRows && gridX >= 0 && gridX < this.gridCols) {
            return !this.occupiedCells[gridY][gridX].occupied;
        }
        
        return false;
    }
    
    /**
     * Marca una celda como ocupada por una torre
     * @param {number} gridX - Coordenada X del grid
     * @param {number} gridY - Coordenada Y del grid
     * @param {string} towerType - Tipo de torre
     */
    occupyCell(gridX, gridY, towerType) {
        if (gridY >= 0 && gridY < this.gridRows && gridX >= 0 && gridX < this.gridCols) {
            this.occupiedCells[gridY][gridX].occupied = true;
            this.occupiedCells[gridY][gridX].hasTower = true;
            this.occupiedCells[gridY][gridX].towerType = towerType;
        }
    }
    
    /**
     * Libera una celda ocupada por una torre
     * @param {number} gridX - Coordenada X del grid
     * @param {number} gridY - Coordenada Y del grid
     */
    freeCell(gridX, gridY) {
        if (gridY >= 0 && gridY < this.gridRows && gridX >= 0 && gridX < this.gridCols) {
            const cell = this.occupiedCells[gridY][gridX];
            if (!cell.isPath) {
                cell.occupied = false;
                cell.hasTower = false;
                cell.towerType = null;
            }
        }
    }
    
    /**
     * Obtiene información de una celda
     * @param {number} gridX - Coordenada X del grid
     * @param {number} gridY - Coordenada Y del grid
     * @returns {Object|null} Información de la celda o null si está fuera de límites
     */
    getCellInfo(gridX, gridY) {
        if (gridY >= 0 && gridY < this.gridRows && gridX >= 0 && gridX < this.gridCols) {
            return { ...this.occupiedCells[gridY][gridX] };
        }
        return null;
    }
    
    /**
     * Convierte coordenadas de pixel a grid
     * @param {number} pixelX - Coordenada X en pixels
     * @param {number} pixelY - Coordenada Y en pixels
     * @returns {Object} Coordenadas de grid
     */
    pixelToGrid(pixelX, pixelY) {
        return pixelToGrid(pixelX, pixelY);
    }
    
    /**
     * Convierte coordenadas de grid a pixel (centro de celda)
     * @param {number} gridX - Coordenada X del grid
     * @param {number} gridY - Coordenada Y del grid
     * @returns {Object} Coordenadas de pixel
     */
    gridToPixel(gridX, gridY) {
        return gridToPixel(gridX, gridY);
    }
    
    /**
     * Obtiene las dimensiones del grid
     * @returns {Object} Objeto con cols y rows
     */
    getGridDimensions() {
        return {
            cols: this.gridCols,
            rows: this.gridRows
        };
    }
    
    /**
     * Resetea el mapa a su estado inicial
     */
    reset() {
        this.occupiedCells = this.initializeOccupiedCells();
        console.log('Mapa reseteado');
    }
}