# 🏰 Tower Defense: Última Defensa

Un juego web de Tower Defense desarrollado en JavaScript vanilla con HTML5 Canvas. Defiende tu base colocando torres estratégicamente para eliminar oleadas de enemigos.

## 🎮 Características del Juego

### Sistemas Principales
- **Sistema de Mapa**: Grid interactivo con camino predefinido y validación de colocación
- **Enemigos**: 3 tipos diferentes (Básico, Tanque, Rápido) con características únicas
- **Torres**: 3 tipos de torres defensivas (Básica, Sniper, Área) con diferentes estrategias
- **Proyectiles**: Sistema de proyectiles con predicción de trayectoria y daño de área
- **Oleadas**: 10 oleadas progresivas con dificultad creciente
- **Economía**: Sistema de dinero con recompensas por eliminar enemigos

### Características Técnicas
- **Rendimiento**: 60 FPS estables con hasta 50 enemigos simultáneos
- **Efectos Visuales**: Sistema de partículas para explosiones y efectos
- **Interfaz**: UI responsiva con feedback visual y animaciones
- **Testing**: Suite de tests unitarios para validar funcionalidad

## 🚀 Cómo Jugar

### Controles
- **Mouse**: Clic para colocar torres y seleccionar
- **Teclas 1-3**: Seleccionar tipos de torres
- **Barra Espaciadora**: Iniciar oleada
- **P**: Pausar/Reanudar
- **Ctrl+R**: Reiniciar juego
- **Escape**: Deseleccionar torre

### Objetivo
Sobrevive a las 10 oleadas de enemigos sin que lleguen más de 20 a tu base. Gana dinero eliminando enemigos y úsalo para construir más torres.

### Tipos de Enemigos
- **🟢 Básico**: Velocidad media, vida baja, recompensa $10
- **⚫ Tanque**: Velocidad lenta, vida alta, recompensa $25  
- **🔴 Rápido**: Velocidad alta, vida baja, recompensa $15

### Tipos de Torres
- **🔵 Torre Básica**: $100 - Disparo rápido, daño bajo, rango medio
- **🟣 Torre Sniper**: $250 - Disparo lento, daño alto, rango largo
- **🟠 Torre de Área**: $175 - Daño splash, rango corto

## 📁 Estructura del Proyecto

```
tower-defense/
├── index.html              # Página principal del juego
├── test.html               # Página de tests unitarios
├── README.md               # Documentación
├── css/
│   ├── style.css          # Estilos principales
│   └── ui.css             # Estilos de interfaz
├── js/
│   ├── main.js            # Punto de entrada
│   ├── game.js            # Clase principal del juego
│   ├── entities/          # Entidades del juego
│   │   ├── Enemy.js       # Clase Enemy
│   │   ├── Tower.js       # Clase Tower
│   │   └── Projectile.js  # Clase Projectile
│   ├── managers/          # Sistemas de gestión
│   │   ├── WaveManager.js # Gestión de oleadas
│   │   ├── EconomyManager.js # Sistema económico
│   │   └── UIManager.js   # Interfaz de usuario
│   ├── map/              # Sistema de mapa
│   │   ├── Map.js        # Clase Map
│   │   └── pathData.js   # Datos del camino
│   ├── utils/            # Utilidades
│   │   ├── constants.js  # Constantes del juego
│   │   ├── helpers.js    # Funciones auxiliares
│   │   └── ParticleSystem.js # Sistema de partículas
│   └── tests/            # Tests unitarios
│       ├── TestRunner.js # Motor de testing
│       └── GameTests.js  # Tests del juego
```

## 🛠️ Tecnologías Utilizadas

- **HTML5 Canvas**: Renderizado del juego
- **JavaScript ES6+**: Lógica del juego (clases, módulos, arrow functions)
- **CSS3**: Estilos y animaciones
- **Arquitectura Modular**: Separación clara de responsabilidades

## 🧪 Testing

El proyecto incluye un sistema completo de tests unitarios:

```bash
# Abrir en navegador
open test.html
```

Los tests cubren:
- Funciones de utilidad matemáticas
- Comportamiento de entidades (Enemy, Tower, Projectile)
- Sistemas de gestión (Economy, Wave, UI)
- Integración entre componentes

## 🎯 Características Implementadas

### ✅ Funcionalidades Básicas (MVP)
- [x] Enemigos se mueven por el camino correctamente
- [x] Torres se pueden colocar y disparan automáticamente
- [x] Sistema de dinero funcional
- [x] 10 oleadas jugables
- [x] Condiciones de Game Over y Victoria
- [x] UI básica con información esencial

### ✅ Características Avanzadas
- [x] Sistema de efectos visuales y partículas
- [x] Animaciones suaves de movimiento
- [x] Múltiples modos de targeting para torres
- [x] Sistema de estadísticas detallado
- [x] Interfaz responsiva
- [x] Tests unitarios completos

## 🚀 Instalación y Ejecución

1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en un navegador web moderno
3. **¡Jugar!** No requiere instalación adicional

### Requisitos
- Navegador web moderno con soporte para:
  - HTML5 Canvas
  - JavaScript ES6+
  - CSS3

## 🎮 Consejos de Estrategia

1. **Economía**: Balancea el gasto en torres con las ganancias por enemigos
2. **Posicionamiento**: Coloca torres en puntos estratégicos del camino
3. **Diversificación**: Usa diferentes tipos de torres para diferentes situaciones
4. **Timing**: Inicia oleadas manualmente cuando estés preparado
5. **Priorización**: Las torres priorizan enemigos más cercanos al final

## 🐛 Debugging

El juego incluye herramientas de debug:
- Información de FPS y entidades (activar en constants.js)
- Consola del navegador con logs detallados
- Sistema de tests para validar funcionalidad

## 📈 Rendimiento

- **Target**: 60 FPS constantes
- **Optimizaciones**: 
  - Limpieza automática de entidades
  - Detección de colisiones eficiente
  - Renderizado optimizado
  - Límites de entidades configurables

## 🤝 Contribuciones

Este es un proyecto educativo. Las mejoras sugeridas incluyen:
- Más tipos de enemigos y torres
- Sistema de mejoras (upgrades)
- Múltiples mapas
- Efectos de sonido
- Guardado de partidas
- Multijugador

## 📄 Licencia

Proyecto educativo de código abierto. Libre para usar y modificar.

---

**¡Disfruta defendiendo tu base!** 🏰⚔️