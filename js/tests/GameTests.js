/**
 * Tests unitarios para los componentes principales del juego
 */

// Tests para funciones de utilidad
testRunner.addTest('Helper Functions - Distance Calculation', () => {
    const dist = distance(0, 0, 3, 4);
    testRunner.assertApproxEqual(dist, 5, 0.001, 'Distance calculation should be correct');
});

testRunner.addTest('Helper Functions - Grid Conversion', () => {
    const gridPos = pixelToGrid(128, 192);
    testRunner.assertEqual(gridPos.gridX, 2, 'Grid X should be 2');
    testRunner.assertEqual(gridPos.gridY, 3, 'Grid Y should be 3');
    
    const pixelPos = gridToPixel(2, 3);
    testRunner.assertEqual(pixelPos.pixelX, 160, 'Pixel X should be 160');
    testRunner.assertEqual(pixelPos.pixelY, 224, 'Pixel Y should be 224');
});

testRunner.addTest('Helper Functions - Angle Calculation', () => {
    const angle = angleBetween(0, 0, 1, 1);
    testRunner.assertApproxEqual(angle, Math.PI / 4, 0.001, 'Angle should be π/4');
});

testRunner.addTest('Helper Functions - Lerp', () => {
    const result = lerp(0, 10, 0.5);
    testRunner.assertEqual(result, 5, 'Lerp should return midpoint');
});

testRunner.addTest('Helper Functions - Clamp', () => {
    testRunner.assertEqual(clamp(5, 0, 10), 5, 'Value within range should be unchanged');
    testRunner.assertEqual(clamp(-5, 0, 10), 0, 'Value below range should be clamped to min');
    testRunner.assertEqual(clamp(15, 0, 10), 10, 'Value above range should be clamped to max');
});

// Tests para Enemy
testRunner.addTest('Enemy - Creation and Properties', () => {
    const enemy = new Enemy('BASIC');
    
    testRunner.assertNotNull(enemy, 'Enemy should be created');
    testRunner.assertEqual(enemy.type, 'BASIC', 'Enemy type should be BASIC');
    testRunner.assertEqual(enemy.health, ENEMY_TYPES.BASIC.health, 'Health should match config');
    testRunner.assertTrue(enemy.isAlive(), 'Enemy should be alive initially');
    testRunner.assertFalse(enemy.hasReachedEnd(), 'Enemy should not have reached end initially');
});

testRunner.addTest('Enemy - Damage System', () => {
    const enemy = new Enemy('BASIC');
    const initialHealth = enemy.health;
    
    const killed = enemy.takeDamage(50);
    testRunner.assertFalse(killed, 'Enemy should not be killed by 50 damage');
    testRunner.assertEqual(enemy.health, initialHealth - 50, 'Health should be reduced');
    testRunner.assertTrue(enemy.isAlive(), 'Enemy should still be alive');
    
    const killed2 = enemy.takeDamage(100);
    testRunner.assertTrue(killed2, 'Enemy should be killed by additional 100 damage');
    testRunner.assertFalse(enemy.isAlive(), 'Enemy should be dead');
    testRunner.assertEqual(enemy.health, 0, 'Health should be 0');
});

testRunner.addTest('Enemy - Path Progress', () => {
    const enemy = new Enemy('BASIC');
    
    testRunner.assertEqual(enemy.getPathProgress(), 0, 'Initial path progress should be 0');
    testRunner.assertTrue(enemy.getDistanceToEnd() > 0, 'Distance to end should be positive');
    
    // Simular movimiento
    enemy.pathProgress = 0.5;
    enemy.updatePositionFromPath();
    
    testRunner.assertEqual(enemy.getPathProgress(), 0.5, 'Path progress should be updated');
});

// Tests para Tower
testRunner.addTest('Tower - Creation and Properties', () => {
    const tower = new Tower('BASIC', 100, 100);
    
    testRunner.assertNotNull(tower, 'Tower should be created');
    testRunner.assertEqual(tower.type, 'BASIC', 'Tower type should be BASIC');
    testRunner.assertEqual(tower.damage, TOWER_TYPES.BASIC.damage, 'Damage should match config');
    testRunner.assertEqual(tower.position.x, 100, 'X position should be correct');
    testRunner.assertEqual(tower.position.y, 100, 'Y position should be correct');
});

testRunner.addTest('Tower - Range Detection', () => {
    const tower = new Tower('BASIC', 100, 100);
    const enemy = new Enemy('BASIC');
    
    // Enemigo dentro del rango
    enemy.position.x = 150;
    enemy.position.y = 100;
    testRunner.assertTrue(tower.isInRange(enemy), 'Enemy should be in range');
    
    // Enemigo fuera del rango
    enemy.position.x = 300;
    enemy.position.y = 100;
    testRunner.assertFalse(tower.isInRange(enemy), 'Enemy should be out of range');
});

testRunner.addTest('Tower - Targeting System', () => {
    const tower = new Tower('BASIC', 100, 100);
    const enemy1 = new Enemy('BASIC');
    const enemy2 = new Enemy('BASIC');
    
    // Configurar enemigos
    enemy1.position.x = 120;
    enemy1.position.y = 100;
    enemy1.pathProgress = 0.8; // Más cerca del final
    
    enemy2.position.x = 130;
    enemy2.position.y = 100;
    enemy2.pathProgress = 0.5; // Más lejos del final
    
    const enemies = [enemy1, enemy2];
    tower.findTarget(enemies);
    
    testRunner.assertEqual(tower.target, enemy1, 'Tower should target enemy closest to end');
});

// Tests para Projectile
testRunner.addTest('Projectile - Creation and Movement', () => {
    const enemy = new Enemy('BASIC');
    enemy.position.x = 200;
    enemy.position.y = 100;
    
    const projectile = new Projectile(100, 100, enemy, 25, 200);
    
    testRunner.assertNotNull(projectile, 'Projectile should be created');
    testRunner.assertEqual(projectile.damage, 25, 'Damage should be correct');
    testRunner.assertTrue(projectile.isActive(), 'Projectile should be active');
    testRunner.assertFalse(projectile.hasHit, 'Projectile should not have hit initially');
});

testRunner.addTest('Projectile - Collision Detection', () => {
    const enemy = new Enemy('BASIC');
    enemy.position.x = 100;
    enemy.position.y = 100;
    
    const projectile = new Projectile(95, 95, enemy, 25, 200);
    
    testRunner.assertTrue(projectile.checkCollisionWithEnemy(enemy), 'Projectile should collide with close enemy');
    
    enemy.position.x = 200;
    enemy.position.y = 200;
    testRunner.assertFalse(projectile.checkCollisionWithEnemy(enemy), 'Projectile should not collide with distant enemy');
});

// Tests para EconomyManager
testRunner.addTest('EconomyManager - Money Management', () => {
    const economy = new EconomyManager(500);
    
    testRunner.assertEqual(economy.getMoney(), 500, 'Initial money should be 500');
    
    economy.addMoney(100, 'test');
    testRunner.assertEqual(economy.getMoney(), 600, 'Money should increase');
    
    const success = economy.spendMoney(200, 'test');
    testRunner.assertTrue(success, 'Should be able to spend money');
    testRunner.assertEqual(economy.getMoney(), 400, 'Money should decrease');
    
    const failure = economy.spendMoney(500, 'test');
    testRunner.assertFalse(failure, 'Should not be able to spend more than available');
    testRunner.assertEqual(economy.getMoney(), 400, 'Money should remain unchanged');
});

testRunner.addTest('EconomyManager - Affordability Check', () => {
    const economy = new EconomyManager(100);
    
    testRunner.assertTrue(economy.canAfford(50), 'Should be able to afford 50');
    testRunner.assertTrue(economy.canAfford(100), 'Should be able to afford 100');
    testRunner.assertFalse(economy.canAfford(150), 'Should not be able to afford 150');
});

testRunner.addTest('EconomyManager - Tower Purchase', () => {
    const economy = new EconomyManager(500);
    const initialMoney = economy.getMoney();
    
    const success = economy.processTowerPurchase('BASIC', 100, 100);
    testRunner.assertTrue(success, 'Should be able to purchase basic tower');
    
    const expectedCost = TOWER_TYPES.BASIC.cost;
    testRunner.assertEqual(economy.getMoney(), initialMoney - expectedCost, 'Money should be deducted');
});

// Tests para WaveManager
testRunner.addTest('WaveManager - Initialization', () => {
    const waveManager = new WaveManager();
    
    testRunner.assertNotNull(waveManager, 'WaveManager should be created');
    testRunner.assertEqual(waveManager.currentWave, 0, 'Should start at wave 0');
    testRunner.assertFalse(waveManager.waveInProgress, 'No wave should be in progress initially');
    testRunner.assertFalse(waveManager.allWavesComplete, 'All waves should not be complete initially');
});

testRunner.addTest('WaveManager - Wave Info', () => {
    const waveManager = new WaveManager();
    const info = waveManager.getCurrentWaveInfo();
    
    testRunner.assertEqual(info.currentWave, 1, 'Current wave should be 1 (1-indexed)');
    testRunner.assertEqual(info.totalWaves, WAVE_DATA.length, 'Total waves should match data');
    testRunner.assertTrue(info.canStartWave, 'Should be able to start wave initially');
});

// Tests para Map
testRunner.addTest('Map - Grid System', () => {
    const map = new Map();
    
    testRunner.assertNotNull(map, 'Map should be created');
    
    const dimensions = map.getGridDimensions();
    testRunner.assertTrue(dimensions.cols > 0, 'Should have columns');
    testRunner.assertTrue(dimensions.rows > 0, 'Should have rows');
});

testRunner.addTest('Map - Tower Placement Validation', () => {
    const map = new Map();
    
    // Test valid position (should be away from path)
    const validPos = map.isValidTowerPlacement(1, 1);
    // Note: This might be true or false depending on path configuration
    testRunner.assertTrue(typeof validPos === 'boolean', 'Should return boolean');
    
    // Test invalid position (out of bounds)
    const invalidPos = map.isValidTowerPlacement(-1, -1);
    testRunner.assertFalse(invalidPos, 'Out of bounds should be invalid');
    
    const invalidPos2 = map.isValidTowerPlacement(1000, 1000);
    testRunner.assertFalse(invalidPos2, 'Out of bounds should be invalid');
});

// Tests para Path Data
testRunner.addTest('Path Data - Path Calculation', () => {
    const pathLength = calculatePathLength();
    testRunner.assertTrue(pathLength > 0, 'Path length should be positive');
    
    const startPos = getPositionOnPath(0);
    testRunner.assertNotNull(startPos, 'Should get position at start');
    testRunner.assertNotNull(startPos.x, 'Start position should have x');
    testRunner.assertNotNull(startPos.y, 'Start position should have y');
    
    const endPos = getPositionOnPath(1);
    testRunner.assertNotNull(endPos, 'Should get position at end');
    
    const midPos = getPositionOnPath(0.5);
    testRunner.assertNotNull(midPos, 'Should get position at middle');
});

testRunner.addTest('Path Data - Path Validation', () => {
    const pathPoints = getPathPoints();
    testRunner.assertTrue(pathPoints.length >= 2, 'Path should have at least 2 points');
    
    // Test first and last points
    const firstPoint = pathPoints[0];
    const lastPoint = pathPoints[pathPoints.length - 1];
    
    testRunner.assertNotNull(firstPoint.x, 'First point should have x coordinate');
    testRunner.assertNotNull(firstPoint.y, 'First point should have y coordinate');
    testRunner.assertNotNull(lastPoint.x, 'Last point should have x coordinate');
    testRunner.assertNotNull(lastPoint.y, 'Last point should have y coordinate');
});

// Test de integración básico
testRunner.addTest('Integration - Enemy and Tower Interaction', () => {
    const tower = new Tower('BASIC', 100, 100);
    const enemy = new Enemy('BASIC');
    
    // Colocar enemigo en rango
    enemy.position.x = 120;
    enemy.position.y = 100;
    
    // Simular targeting
    tower.findTarget([enemy]);
    testRunner.assertEqual(tower.target, enemy, 'Tower should target the enemy');
    
    // Simular disparo
    if (tower.canShoot()) {
        const projectile = tower.shoot();
        testRunner.assertNotNull(projectile, 'Tower should create projectile');
        testRunner.assertEqual(projectile.target, enemy, 'Projectile should target the enemy');
    }
});

console.log('✨ Tests cargados. Ejecuta testRunner.runAllTests() para correr todos los tests.');