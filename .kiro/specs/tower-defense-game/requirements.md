# Requirements Document

## Introduction

Tower Defense: Última Defensa is a web-based tower defense game where players strategically place defensive towers to eliminate waves of enemies advancing along a predefined path. The objective is to prevent enemies from reaching the end of the path while managing resources and surviving increasingly difficult waves.

## Glossary

- **Game_System**: The main tower defense game application
- **Canvas**: HTML5 canvas element used for game rendering (800x600 pixels)
- **Enemy**: Hostile units that move along the path toward the player's base
- **Tower**: Defensive structures that players place to attack enemies
- **Projectile**: Ammunition fired by towers at enemies
- **Wave**: A group of enemies spawned in sequence
- **Grid**: The tile-based system for tower placement validation
- **Path**: The predefined route enemies follow from spawn to base
- **Economy_System**: The in-game currency management system
- **UI_System**: The user interface displaying game information and controls

## Requirements

### Requirement 1

**User Story:** As a player, I want to see enemies moving along a predefined path, so that I can plan my tower placement strategy.

#### Acceptance Criteria

1. THE Game_System SHALL render a visible path from spawn point to base on the Canvas
2. WHEN an Enemy is spawned, THE Game_System SHALL move the Enemy along the predefined Path at its designated speed
3. WHILE an Enemy is moving, THE Game_System SHALL display the Enemy's health bar above the unit
4. IF an Enemy reaches the end of the Path, THEN THE Game_System SHALL remove one life from the player and destroy the Enemy
5. THE Game_System SHALL support at least three Enemy types with different health, speed, and reward values

### Requirement 2

**User Story:** As a player, I want to place towers on valid grid positions, so that I can defend against incoming enemies.

#### Acceptance Criteria

1. THE Game_System SHALL display a grid overlay with 64x64 pixel cells for tower placement
2. WHEN a player clicks on a valid grid cell, THE Game_System SHALL place the selected Tower type at that position
3. THE Game_System SHALL prevent tower placement on Path tiles or occupied grid cells
4. WHILE hovering over a grid cell, THE Game_System SHALL show a visual preview of tower placement validity
5. THE Game_System SHALL support at least three Tower types with different damage, range, fire rate, and cost attributes

### Requirement 3

**User Story:** As a player, I want towers to automatically attack enemies within range, so that I don't need to manually control each tower.

#### Acceptance Criteria

1. WHEN an Enemy enters a Tower's range, THE Game_System SHALL automatically target that Enemy
2. THE Game_System SHALL prioritize the Enemy closest to the Path end when multiple targets are available
3. WHEN a Tower fires, THE Game_System SHALL create a Projectile that travels toward the target Enemy
4. IF a Projectile hits its target Enemy, THEN THE Game_System SHALL apply damage and destroy the Projectile
5. WHILE a Tower is selected, THE Game_System SHALL display the Tower's attack range visually

### Requirement 4

**User Story:** As a player, I want to face progressively challenging waves of enemies, so that the game remains engaging and difficult.

#### Acceptance Criteria

1. THE Game_System SHALL spawn enemies in waves with 5-10 second intervals between waves
2. WHEN a wave begins, THE Game_System SHALL spawn the designated number and types of enemies for that wave
3. THE Game_System SHALL increase wave difficulty by adding more enemies or stronger enemy types
4. WHEN all enemies in a wave are eliminated or have reached the base, THE Game_System SHALL mark the wave as complete
5. THE Game_System SHALL support at least 10 progressive waves with increasing difficulty

### Requirement 5

**User Story:** As a player, I want to manage my in-game currency, so that I can make strategic decisions about tower purchases.

#### Acceptance Criteria

1. THE Game_System SHALL initialize the player with 500 currency units at game start
2. WHEN an Enemy is destroyed, THE Game_System SHALL add the Enemy's reward value to the player's currency
3. WHEN a player purchases a Tower, THE Game_System SHALL deduct the Tower's cost from available currency
4. THE Game_System SHALL prevent tower purchases when insufficient currency is available
5. THE Game_System SHALL display current currency amount in the UI_System at all times

### Requirement 6

**User Story:** As a player, I want to see game information and controls in a clear interface, so that I can monitor my progress and make informed decisions.

#### Acceptance Criteria

1. THE UI_System SHALL display player lives, current currency, wave number, and remaining enemies
2. THE UI_System SHALL provide buttons for each Tower type showing their cost and availability status
3. WHEN insufficient currency is available, THE UI_System SHALL disable the corresponding tower purchase button
4. THE UI_System SHALL provide a button to manually start the next wave
5. THE UI_System SHALL display game over or victory messages when appropriate conditions are met

### Requirement 7

**User Story:** As a player, I want clear win and lose conditions, so that I understand when the game ends and can restart if desired.

#### Acceptance Criteria

1. WHEN player lives reach zero, THE Game_System SHALL trigger a game over state
2. WHEN all waves are completed successfully, THE Game_System SHALL trigger a victory state
3. THE Game_System SHALL display appropriate end-game messages for both victory and defeat
4. THE Game_System SHALL provide a restart option when the game ends
5. THE Game_System SHALL reset all game state variables when restarting

### Requirement 8

**User Story:** As a player, I want smooth and responsive gameplay, so that I can enjoy the gaming experience without technical issues.

#### Acceptance Criteria

1. THE Game_System SHALL maintain 60 frames per second during normal gameplay
2. THE Game_System SHALL handle up to 50 simultaneous enemies without performance degradation
3. THE Game_System SHALL respond to player input within 100 milliseconds
4. THE Game_System SHALL use efficient collision detection algorithms for projectile-enemy interactions
5. THE Game_System SHALL properly clean up destroyed game objects to prevent memory leaks