webpackJsonp([0],{

/***/ 1099:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BeachScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _player = __webpack_require__(1100);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BeachScene = exports.BeachScene = function (_Phaser$Scene) {
    _inherits(BeachScene, _Phaser$Scene);

    function BeachScene() {
        _classCallCheck(this, BeachScene);

        return _possibleConstructorReturn(this, (BeachScene.__proto__ || Object.getPrototypeOf(BeachScene)).call(this));
    }

    _createClass(BeachScene, [{
        key: 'preload',
        value: function preload() {
            this.load.image('bg', 'assets/background.png');
            this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('visitor-drowning', 'assets/drowning.png', { frameWidth: 16, frameHeight: 16 });
        }
    }, {
        key: 'create',
        value: function create() {
            var _this2 = this;

            this.visitors = [];
            this.add.image(80, 90, 'bg');

            this.score = 0;
            this.scoreDisplay = this.add.text(10, 10, this.score, { fontSize: '18px' });

            // visitor
            this.visitor = this.physics.add.sprite(100, 170, 'visitor-drowning');
            this.visitor.body.setSize(7, 8);

            // player
            this.player = new _player.Player(this, 300, 250, 'player');
            this.add.existing(this.player);

            this.physics.add.overlap(this.player, this.visitor, function () {
                _this2.score += 10;
                _this2.scoreDisplay.setText(_this2.score);
                _this2.visitor.disableBody(true);
            }, null, this);

            this.cursors = this.input.keyboard.createCursorKeys();

            this.anims.create({
                key: 'drowning',
                frames: this.anims.generateFrameNames('visitor-drowning', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: 1
            });
        }
    }, {
        key: 'update',
        value: function update(time, delta) {
            this.visitor.play('drowning', true);
            this.player.update(this.cursors, time, delta);
        }
    }]);

    return BeachScene;
}(Phaser.Scene);

/***/ }),

/***/ 1100:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Player = exports.Player = function (_Phaser$Physics$Arcad) {
    _inherits(Player, _Phaser$Physics$Arcad);

    function Player(scene, x, y, texture) {
        _classCallCheck(this, Player);

        var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, scene, x, y, texture));

        scene.physics.add.existing(_this);
        _this.setCollideWorldBounds(true);
        _this.body.setSize(5, 5);
        _this.playerSpeed = 2;
        _this.stamina = 10;
        // this.staminaDisplay =

        _this.createEmitters(scene);

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNames('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNames('player', { start: 0 }),
            frameRate: 0
        });
        return _this;
    }

    _createClass(Player, [{
        key: 'update',
        value: function update(keys, time, delta) {

            if (keys.left.isDown) {
                this.x -= this.playerSpeed;
                this.flipX = true;
                this.anims.play('walk', true);
            } else if (keys.right.isDown) {
                this.x += this.playerSpeed;
                this.flipX = false;
                this.anims.play('walk', true);
            }

            if (keys.up.isDown) {
                this.y -= this.playerSpeed;
                this.anims.play('walk', true);
            } else if (keys.down.isDown) {
                this.y += this.playerSpeed;
                this.anims.play('walk', true);
            }

            if (!keys.left.isDown && !keys.right.isDown && !keys.up.isDown && !keys.down.isDown) {
                this.anims.play('idle');
                this.sandEmitter.stop();
            }

            if (keys.shift.isDown) {
                this.playerSpeed = 2.5 * (delta * 30 / 1000);
                this.sandEmitter.emitParticle();
            } else {
                this.playerSpeed = 2 * (delta * 30 / 1000);
            }
        }
    }, {
        key: 'createEmitters',
        value: function createEmitters(scene) {
            scene.textures.generate('sand', { data: ['6'], pixelWidth: 1, pixelHeight: 1 });
            this.sandEmitter = scene.add.particles('sand').createEmitter({
                speed: 10,
                maxParticles: 70,
                y: 6, x: -1,
                lifespan: 300
            });

            this.sandEmitter.startFollow(this);
        }
    }]);

    return Player;
}(Phaser.Physics.Arcade.Sprite);

/***/ }),

/***/ 436:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(211);
module.exports = __webpack_require__(458);


/***/ }),

/***/ 458:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(213);

var _beachScene = __webpack_require__(1099);

var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scene: _beachScene.BeachScene,
    zoom: 2,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
};
// import {SimpleScene} from './scenes/simple-scene';


new Phaser.Game(config);

/***/ })

},[436]);