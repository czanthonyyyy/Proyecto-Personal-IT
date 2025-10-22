/**
 * Sistema de testing básico para Tower Defense
 * Ejecuta tests unitarios de los componentes principales
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    /**
     * Añade un test al runner
     * @param {string} name - Nombre del test
     * @param {Function} testFunction - Función del test
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    /**
     * Ejecuta todos los tests
     */
    async runAllTests() {
        console.log('🧪 Iniciando tests unitarios...\n');
        
        this.results = { passed: 0, failed: 0, total: 0 };
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        this.printSummary();
    }
    
    /**
     * Ejecuta un test individual
     * @param {Object} test - Test a ejecutar
     */
    async runTest(test) {
        this.results.total++;
        
        try {
            await test.testFunction();
            console.log(`✅ ${test.name}`);
            this.results.passed++;
        } catch (error) {
            console.log(`❌ ${test.name}`);
            console.log(`   Error: ${error.message}`);
            this.results.failed++;
        }
    }
    
    /**
     * Imprime el resumen de los tests
     */
    printSummary() {
        console.log('\n📊 Resumen de Tests:');
        console.log(`Total: ${this.results.total}`);
        console.log(`Pasados: ${this.results.passed}`);
        console.log(`Fallidos: ${this.results.failed}`);
        console.log(`Porcentaje de éxito: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        
        if (this.results.failed === 0) {
            console.log('🎉 ¡Todos los tests pasaron!');
        } else {
            console.log('⚠️ Algunos tests fallaron. Revisa los errores arriba.');
        }
    }
    
    /**
     * Función de aserción básica
     * @param {boolean} condition - Condición a verificar
     * @param {string} message - Mensaje de error
     */
    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    /**
     * Verifica que dos valores sean iguales
     * @param {*} actual - Valor actual
     * @param {*} expected - Valor esperado
     * @param {string} message - Mensaje de error
     */
    assertEqual(actual, expected, message = `Expected ${expected}, got ${actual}`) {
        if (actual !== expected) {
            throw new Error(message);
        }
    }
    
    /**
     * Verifica que un valor sea aproximadamente igual a otro
     * @param {number} actual - Valor actual
     * @param {number} expected - Valor esperado
     * @param {number} tolerance - Tolerancia
     * @param {string} message - Mensaje de error
     */
    assertApproxEqual(actual, expected, tolerance = 0.001, message = null) {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            const msg = message || `Expected ${expected} ± ${tolerance}, got ${actual} (diff: ${diff})`;
            throw new Error(msg);
        }
    }
    
    /**
     * Verifica que un valor sea verdadero
     * @param {*} value - Valor a verificar
     * @param {string} message - Mensaje de error
     */
    assertTrue(value, message = 'Expected true') {
        if (!value) {
            throw new Error(message);
        }
    }
    
    /**
     * Verifica que un valor sea falso
     * @param {*} value - Valor a verificar
     * @param {string} message - Mensaje de error
     */
    assertFalse(value, message = 'Expected false') {
        if (value) {
            throw new Error(message);
        }
    }
    
    /**
     * Verifica que un valor no sea null o undefined
     * @param {*} value - Valor a verificar
     * @param {string} message - Mensaje de error
     */
    assertNotNull(value, message = 'Expected non-null value') {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }
}

// Instancia global del test runner
const testRunner = new TestRunner();