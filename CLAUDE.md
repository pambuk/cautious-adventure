# CLAUDE.md - AI Assistant Guide for Cautious Adventure

## Project Overview

**Cautious Adventure** is a retro-style lifeguard game built with Phaser 3. Players control a lifeguard who must rescue drowning beach visitors across progressively difficult days. The game features pixel art graphics, day-based progression, stamina management, and dynamic wave systems.

- **Created**: August 2018 for One Game A Month challenge
- **Live Demo**: https://pambuk.github.io/cautious-adventure/build/
- **License**: MIT
- **Author**: pambuk (wojtek.zymonik@gmail.com)

## Technology Stack

### Core Technologies
- **Game Engine**: Phaser 3.0.0 (HTML5 game framework)
- **Language**: JavaScript (ES6+)
- **Package Manager**: npm/yarn
- **Build Tool**: Webpack 5.94.0
- **Transpiler**: Babel (babel-preset-env, babel-preset-es2015)

### Key Dependencies
```json
{
  "phaser": "^3.0.0",
  "webfontloader": "^1.6.28"
}
```

### Development Tools
- webpack-dev-server for local development
- babel-loader for ES6+ transpilation
- copy-webpack-plugin for asset management
- html-webpack-plugin for HTML generation

## Codebase Structure

```
cautious-adventure/
├── src/
│   ├── index.js                    # Game entry point, Phaser config
│   ├── scenes/
│   │   ├── menu-scene.js          # Main menu with asset preloading
│   │   └── beach-scene.js         # Main gameplay scene
│   └── game-objects/
│       ├── player.js              # Player/lifeguard character
│       ├── visitor.js             # Legacy visitor (unused)
│       ├── smart-visitor.js       # AI-controlled beach visitor
│       ├── wave.js                # Wave hazard object
│       └── text-button.js         # UI button component
├── assets/                        # Game assets (images, audio, fonts)
│   ├── *.png                      # Sprite sheets and images
│   ├── *.wav                      # Sound effects
│   └── fonts/                     # Bitmap fonts
├── build/                         # Production build output
├── defs/
│   └── phaser.d.ts               # Phaser TypeScript definitions
├── webpack.config.js             # Webpack configuration
├── .babelrc                      # Babel configuration
├── package.json                  # Project dependencies
└── index.html                    # HTML template

```

## Architecture Patterns

### Game Configuration (src/index.js)
- **Canvas Size**: 400x300 pixels @ 2x zoom
- **Renderer**: Phaser.AUTO (WebGL with Canvas fallback)
- **Physics**: Arcade physics system (simple 2D physics)
- **Scene Order**: MenuScene → BeachScene

```javascript
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scene: [MenuScene, BeachScene],
    zoom: 2,
    render: { pixelArt: true },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};
```

### Scene Architecture

#### MenuScene (menu-scene.js)
- **Purpose**: Asset preloading, main menu display
- **Key Methods**:
  - `preload()`: Loads all game assets (sprites, audio, fonts)
  - `create()`: Sets up menu UI and cloud animations
  - `update()`: Animates clouds continuously
- **Asset Loading**: All game assets are loaded here before gameplay begins
- **Navigation**: Press any key to start BeachScene

#### BeachScene (beach-scene.js)
- **Purpose**: Main gameplay scene
- **Key State Variables**:
  - `dayNumber`: Current day (increases difficulty)
  - `score`: Player's accumulated score
  - `deaths`: Number of drowned visitors (max 5 = game over)
  - `dayTimer`: In-game time (8am-4pm, 8 hours)
  - `gameStarted`: Boolean flag for game state
  - `cameraScroll`: Y-offset (250) for camera transitions

- **Game Loop Structure**:
  1. Camera scroll from intro → gameplay view (y=0 → y=250)
  2. Timer ticks every second, advances game clock
  3. Waves spawn randomly (percentage-based)
  4. Day ends at 16:00 (4pm), transitions to next day
  5. Game over at 5 deaths

### Game Object Patterns

All game objects extend `Phaser.Physics.Arcade.Sprite`:

#### Player (player.js)
- **Movement**: Arrow keys (cursor keys)
- **Sprint**: Shift key (depletes stamina)
- **Stamina System**:
  - 5 units max
  - Depletes 0.5/sec while sprinting
  - Regenerates 0.2/sec when not sprinting
  - Refilled at corn cart
- **Animation States**: 'walk', 'swim', 'player-idle'
- **Speed**:
  - Normal: 2 units/frame
  - Sprint: 2.5 units/frame (delta-adjusted)
- **Special Effects**: Sand particle emitter when sprinting on beach

#### SmartVisitor (smart-visitor.js)
- **AI State Machine**:
  - `resting`: On blanket, idle
  - `walking`: Moving on beach
  - `go-swimming`: Traveling to water
  - `swimming`: In water
  - `drowning`: Needs rescue
  - `returning`: Being rescued/returning to blanket

- **Decision Making**: Timer-based (1 second intervals)
  - 15% chance to go swimming from resting
  - 10% chance to walk from resting
  - 1% chance to drown while swimming (base rate)
  - 50% chance to return from swimming

- **Health System**:
  - 5 HP max
  - Loses 0.5 HP/sec while drowning
  - Visual health display (dots: '.....')
  - Dies at 0 HP, increments scene.deaths

- **Bounty System**:
  - Save bounty: 9 + dayNumber points
  - Award given once per rescue
  - Reset when visitor returns to blanket

#### Wave (wave.js)
- **Spawn**: Random x position, sea area
- **Movement**: Vertical movement (0.8 units/frame)
- **States**: 'start' → 'moving' → 'end'
- **Hazard Window**: `drowny=true` during movement, false near end
- **Pool System**: 15 wave objects pre-created, reused

### State Management

#### Scene Data Passing
BeachScene uses scene data for persistence between days:
```javascript
this.scene.start('BeachScene', {
    dayNumber: ++this.dayNumber,
    score: this.score,
    cloud1x: Phaser.Math.Between(200, 400),
    cloud2x: Phaser.Math.Between(0, 200),
    cloud1speed: this.cloud1.cloudSpeed,
    cloud2speed: this.cloud2.cloudSpeed
});
```

#### Game State Flags
- `gameStarted`: Prevents visitor decisions during intro
- `runIntro`: Controls camera scroll animation
- `cornCartRunning`: Prevents multiple corn carts
- `canMakeDecisions`: Enables/disables visitor AI

### Physics & Collision Detection

#### Collision Groups
```javascript
// Player ↔ Visitors (drowning rescue)
this.physics.add.overlap(this.player, this.visitors, rescueCallback);

// Player ↔ Corn Cart (stamina refill)
this.physics.add.overlap(this.player, this.cornCart, refillCallback);

// Visitors ↔ Waves (trigger drowning)
this.physics.add.overlap(this.visitors, this.waves, drowningCallback);
```

#### World Bounds
- Before intro: No bounds (camera scrolls)
- During gameplay: `setBounds(0, 250, 400, 300)`
- Player has `setCollideWorldBounds(true)`

### Animation System

Animations are created once in BeachScene.createAnimations() on day 1:

**Key Animations**:
- `walk` / `swim`: Player movement (10 FPS)
- `player-idle`: Standing still (2 FPS)
- `visitor-walk`: Walking animation (10 FPS)
- `drowning`: Drowning animation (4 FPS)
- `wave-moving`: Wave animation (8 FPS)
- `corn-cart-rides`: Cart movement animation

**Sprite Sheets**:
- Most sprites: 16x16 pixels
- Waves: 32x32 pixels
- Frame-based animations using `frameWidth` and `frameHeight`

### Timer Systems

#### Clock Timer (1000ms interval)
- Advances in-game time (+900 seconds/tick, or +1800 in DEBUG)
- Spawns waves (percentage-based)
- Ends day at 16:00

#### Stamina Timer (1000ms interval)
- Player stamina management
- Runs continuously throughout gameplay

#### Visitor Decision Timer (1000ms interval per visitor)
- AI decision making
- State transitions
- Only active when `canMakeDecisions=true`

#### Visitor Health Timer (1000ms interval per visitor)
- Health depletion while drowning
- Death handling

### Depth/Z-Index Management

```javascript
// Visitors sorted by Y position for proper overlap
this.visitors.children.iterate((visitor) => {
    visitor.depth = visitor.y;
});

// Blankets always at depth 0 (behind everything)
this.blanket.setDepth(0);
```

## Development Workflow

### Running Locally
```bash
# Install dependencies
npm install  # or yarn install

# Start dev server (http://localhost:8080)
npm run dev  # or yarn run dev
```

### Building for Production
```bash
# Build to ./build directory
npm run build  # or yarn run build
```

### Webpack Dev Server
- **Entry Point**: src/index.js
- **Output**: build/app.bundle.js
- **Code Splitting**:
  - app.bundle.js (game code)
  - production-dependencies.bundle.js (Phaser)
- **Content Base**: build/ directory
- **Asset Copying**: Copies index.html and assets/** to build/

### Build Configuration Notes

**Important**: The webpack config uses deprecated plugins:
- `webpack.optimize.CommonsChunkPlugin` (deprecated in webpack 4+)
- `CopyWebpackPlugin` old syntax

**Babel Configuration**:
- Uses preset: 'es2015' (legacy, equivalent to 'env')
- Transpiles all code in src/ directory

## Coding Conventions

### File Organization
- One class per file
- Class names match file names (PascalCase → kebab-case)
- Export classes using ES6 export syntax

### Class Structure
```javascript
export class ClassName extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.physics.add.existing(this);
        // Initialize properties
    }

    update(time, delta) {
        // Frame-by-frame logic
    }
}
```

### Naming Conventions
- **Classes**: PascalCase (Player, SmartVisitor, BeachScene)
- **Variables**: camelCase (dayNumber, gameStarted, targetLocation)
- **Constants**: SCREAMING_SNAKE_CASE (DEBUG)
- **Methods**: camelCase (generateVisitors, pickSwimmingLocation)

### State Management Pattern
- State stored as string: `this.state = 'swimming'`
- Switch statements for state-based behavior
- Timer-based state transitions

### Scene Communication
- `this.scene.get('SceneName')` to access other scenes
- Pass data via `this.scene.start('SceneName', dataObject)`
- Share state through scene data parameter

### Helper Methods
```javascript
// Percentage-based probability
percentage(desired) {
    return Phaser.Math.Between(0, 100) < desired;
}

// Arrival detection (±1 pixel tolerance)
arrived(target) {
    let flooredX = Math.floor(this.x);
    let flooredY = Math.floor(this.y);
    return [flooredX - 1, flooredX, flooredX + 1].includes(Math.floor(target.x)) &&
           [flooredY - 1, flooredY, flooredY + 1].includes(Math.floor(target.y));
}
```

## Asset Management

### Asset Naming
- Sprite sheets: `{object}-{animation}.png`
  - Example: `visitor-2-drowning.png`, `dude-swimming.png`
- Sound effects: `{sound}.wav`
  - Example: `ocean-waves.wav`, `whistle.wav`
- Fonts: Bitmap fonts with .png + .xml

### Asset Loading Pattern
All assets loaded in MenuScene.preload():
```javascript
// Sprite sheets with frame dimensions
this.load.spritesheet('key', 'path.png', { frameWidth: 16, frameHeight: 16 });

// Images
this.load.image('key', 'path.png');

// Audio (multiple formats for compatibility)
this.load.audio('key', ['path.wav']);

// Bitmap fonts
this.load.bitmapFont('key', 'font.png', 'font.xml');
```

### Procedural Textures
```javascript
// Create solid color textures
this.textures.generate('sand', {
    data: ['6'],  // Color palette index
    pixelWidth: 1,
    pixelHeight: 1
});
```

## Game Balance & Configuration

### Difficulty Scaling
- **Visitors per day**: 6 + dayNumber + random(0, dayNumber)
- **Save bounty**: 9 + dayNumber points
- **Day duration**: 8 hours (8am-4pm game time)
- **Real time per day**: ~8 minutes (900 game-seconds/second)

### Key Constants
```javascript
const CAMERA_SCROLL = 250;        // Y-offset for scenes
const MAX_DEATHS = 5;             // Game over threshold
const DAY_LENGTH_HOURS = 8;       // 8am-4pm
const DAY_STARTS_AT = 8;          // 8am
const DAY_ENDS_AT = 16;           // 4pm
const WAVE_POOL_SIZE = 15;        // Pre-created wave objects
const VISITOR_SPAWN_MARGIN = 15;  // Minimum distance between visitors
```

### DEBUG Mode
Toggle in beach-scene.js:
```javascript
const DEBUG = false;  // Set to true for testing
```

Debug features:
- Faster time progression
- Day ends at 9am (for quick testing)
- "Add" button to spawn visitors
- Visitors can make decisions immediately

## Common Development Tasks

### Adding a New Game Object
1. Create file in `src/game-objects/{name}.js`
2. Extend `Phaser.Physics.Arcade.Sprite`
3. Implement constructor with scene, x, y, texture
4. Add `scene.physics.add.existing(this)`
5. Implement `update(time, delta)` if needed
6. Import and instantiate in scene

### Adding a New Animation
1. Load sprite sheet in MenuScene.preload()
2. Create animation in BeachScene.createAnimations()
3. Play animation: `this.anims.play('key', true)`

### Modifying Difficulty
1. **Visitor count**: Line 37 in beach-scene.js
   ```javascript
   this.generateVisitors(6 + this.dayNumber + Phaser.Math.Between(0, this.dayNumber));
   ```
2. **Bounty**: Line 29 in beach-scene.js
   ```javascript
   this.saveBounty = 9 + this.dayNumber;
   ```
3. **Drowning chance**: Line 12 in smart-visitor.js
   ```javascript
   this.chanceToDrown = 0.003;
   ```

### Adding Collision Detection
```javascript
this.physics.add.overlap(
    objectA,           // Sprite or Group
    objectB,           // Sprite or Group
    callbackFunction,  // (objA, objB) => {}
    processCallback,   // Optional filter
    callbackContext    // Usually 'this'
);
```

### Scene Transitions
```javascript
// Start new scene (stops current)
this.scene.start('SceneName', { data: value });

// Pause/resume
this.scene.pause('SceneName');
this.scene.resume('SceneName');

// Get another scene
const menuScene = this.scene.get('MenuScene');
```

## Testing & Debugging

### Enabling Debug Mode
Set `DEBUG = true` in beach-scene.js:
- Speeds up time
- Adds visitor spawn button
- Shortens day duration
- Enables visitor AI immediately

### Phaser Debug Physics
In src/index.js:
```javascript
physics: {
    default: 'arcade',
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

### Console Logging
Key debugging points:
- Scene data passed between scenes
- Visitor state transitions
- Collision callbacks
- Timer events

### Browser DevTools
- Use React DevTools or similar for inspecting Phaser game state
- Monitor performance in Performance tab
- Check asset loading in Network tab

## Known Issues & Legacy Code

### Deprecated Dependencies
- `webpack.optimize.CommonsChunkPlugin` (webpack 3 syntax)
- Old `CopyWebpackPlugin` syntax
- Consider upgrading to webpack 5 syntax

### Unused Files
- `src/game-objects/visitor.js`: Legacy visitor (replaced by SmartVisitor)
- `src/game-objects/text-button.js`: Imported but unused in MenuScene

### Code Smells
- Magic numbers throughout (consider extracting to constants)
- No TypeScript despite phaser.d.ts in defs/
- Tight coupling between Player and BeachScene (stamina display)
- No unit tests

### Browser Compatibility
- Targets modern browsers with ES6 support
- Babel transpilation may need adjustment for older browsers
- WebGL preferred, Canvas fallback available

## References & Resources

### Documentation
- Phaser 3 Docs: https://photonstorm.github.io/phaser3-docs
- Game Mechanics: https://gamemechanicexplorer.com/
- Pixel Perfect Rendering: https://gist.github.com/drhayes/ff53b78cceea1cc1b211

### Related Projects
- Original submission: One Game A Month (August 2018)
- Hosted on GitHub Pages

## AI Assistant Guidelines

### When Making Changes
1. **Read First**: Always read files before modifying
2. **Test Locally**: Run `npm run dev` after changes
3. **Check Assets**: Ensure asset paths are correct
4. **Preserve Balance**: Maintain game difficulty curve
5. **Update Animations**: If adding sprites, update createAnimations()
6. **Handle Timers**: Clean up timers in destroy() methods

### Best Practices
- Maintain pixel art aesthetic (16x16 sprites)
- Use object pooling for frequently created objects (like waves)
- Keep frame rate in mind (animations, physics updates)
- Consider mobile performance (avoid too many particles)
- Preserve retro game feel and simplicity

### Common Pitfalls
- Forgetting to add physics to sprites
- Not calling `scene.add.existing()` for custom sprites
- Modifying animations after day 1 (only created once)
- Timer cleanup (can cause memory leaks)
- Camera bounds timing (before/after intro)

### Refactoring Opportunities
- Extract magic numbers to constants/config file
- Convert to TypeScript (types exist but unused)
- Upgrade webpack configuration to v5 syntax
- Add unit tests for game logic
- Separate game balance values into config
- Implement proper state management system
- Add mobile touch controls

---

**Last Updated**: 2025-12-01
**Repository**: https://github.com/pambuk/cautious-adventure
