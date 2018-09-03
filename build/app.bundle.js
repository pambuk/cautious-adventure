webpackJsonp([0],{

/***/ 1075:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BeachScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _player = __webpack_require__(1076);

var _smartVisitor = __webpack_require__(1077);

var _wave = __webpack_require__(1078);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEBUG = false;

var BeachScene = exports.BeachScene = function (_Phaser$Scene) {
    _inherits(BeachScene, _Phaser$Scene);

    function BeachScene() {
        _classCallCheck(this, BeachScene);

        return _possibleConstructorReturn(this, (BeachScene.__proto__ || Object.getPrototypeOf(BeachScene)).call(this, { key: 'BeachScene' }));
    }

    _createClass(BeachScene, [{
        key: 'create',
        value: function create(data) {
            var _this2 = this;

            this.runIntro = false;

            this.audio = this.sound.add('waves');
            if (!this.audio.isPlaying) {
                this.audio.play({ loop: true });
            }

            this.whistleSound = this.sound.add('whistle');

            this.cameraScroll = 250;
            this.gameStarted = false;
            this.deaths = 0;
            this.maxDeaths = 5;
            this.dayEndsAt = 16;
            this.dayNumber = data.dayNumber ? data.dayNumber : 1;
            this.saveBounty = 9 + this.dayNumber;

            this.bg = this.add.image(0, 0, 'bg').setOrigin(0);

            this.addClouds(data);
            this.menuScene = this.scene.get('MenuScene');

            this.visitors = this.physics.add.group();
            this.generateVisitors(6 + this.dayNumber + Phaser.Math.Between(0, this.dayNumber));

            this.waves = this.physics.add.group();
            this.generateWaves();

            // player
            this.player = new _player.Player(this, 300, 250 + this.cameraScroll, 'player');
            this.add.existing(this.player);

            this.score = data.score ? data.score : 0;
            this.scoreDisplay = this.add.bitmapText(10, 10 + this.cameraScroll, 'gameFont', this.score, 18);

            this.dayTimer = 3600 * 8;

            this.dayTimerDisplay = this.add.bitmapText(300, 10 + this.cameraScroll, 'gameFont', this.getTimerDisplay(this.dayTimer), 18);
            this.dayTimerDisplay.visible = false;

            this.deathsDisplay = this.add.text(120, 10 + this.cameraScroll, this.deaths, { fontSize: '18px' });

            this.gameOverDisplay = this.add.bitmapText(100, 100 + this.cameraScroll, 'gameFont', 'GAME OVER', 24);
            this.gameOverDisplay.visible = false;

            this.introTextDisplay = this.add.bitmapText(145, 100, 'gameFont', 'Day ' + this.dayNumber, 24);
            this.introTextDisplay.alpha = 0;

            this.startDay();

            var clockTimer = this.time.addEvent({
                delay: 1000,
                callback: function callback() {
                    if (_this2.gameStarted === true) {
                        if (DEBUG) {
                            _this2.dayTimer += 1800;
                        } else {
                            _this2.dayTimer += 300;
                        }

                        _this2.dayTimerDisplay.setText(_this2.getTimerDisplay(_this2.dayTimer));

                        if (DEBUG) {
                            _this2.dayEndsAt = 9;
                        }

                        if (Math.floor(_this2.dayTimer / 3600) === _this2.dayEndsAt) {
                            console.log('day ends');

                            clockTimer.destroy();
                            _this2.nextLevel();
                        }

                        // waves
                        if (_this2.percentage(100)) {
                            var wave = _this2.waves.get();
                            wave.start();
                        }
                    }
                },
                repeat: -1
            });

            if (this.dayNumber === 1) {
                this.createAnimations();
            }

            this.cornCart = this.physics.add.sprite(500, 290 + this.cameraScroll, 'corn-cart');
            this.cornCartRunning = false;

            this.physics.add.overlap(this.player, this.visitors, function (player, visitor) {
                if (visitor.state === 'drowning') {
                    _this2.score += visitor.bounty;
                    _this2.scoreDisplay.setText(_this2.score);
                    visitor.bounty = 0;
                    visitor.z = 1;
                    visitor.donut = _this2.add.image(visitor.x, visitor.y + 1, 'donut');
                    if (visitor.state !== 'returning') {
                        visitor.returnToBlanket();
                    }
                }
            }, null, this);

            this.physics.add.overlap(this.player, this.smartVisitor, function (player, visitor) {
                if (visitor.state === 'drowning') {
                    _this2.score += visitor.bounty;
                    _this2.scoreDisplay.setText(_this2.score);
                    visitor.bounty = 0;
                    visitor.z = 1;
                    visitor.donut = _this2.add.image(visitor.x, visitor.y + 1, 'donut');
                    if (visitor.state !== 'returning') {
                        visitor.returnToBlanket();
                    }
                }
            });

            this.physics.add.overlap(this.player, this.cornCart, function () {
                _this2.player.stamina += 5;
                if (_this2.player.stamina > 10) {
                    _this2.player.stamina = 10;
                }

                _this2.player.staminaDisplay.setText(_this2.player.getStaminaForDisplay(_this2.player.stamina));
            });

            this.physics.add.overlap(this.visitors, this.waves, function (visitor, wave) {
                if (wave.drowny && (visitor.state === 'swimming' || visitor.state === 'go-swimming')) {
                    visitor.state = 'drowning';
                }
            });

            this.cursors = this.input.keyboard.createCursorKeys();

            this.scoreDisplay.visible = false;
            this.deathsDisplay.visible = false;
            this.player.staminaDisplay.visible = false;
        }
    }, {
        key: 'update',
        value: function update(time, delta) {
            this.player.update(this.cursors, time, delta);
            this.visitors.runChildUpdate = true;
            this.waves.runChildUpdate = true;

            this.sendCornCart();
            this.gameOver();

            if (this.runIntro === true) {
                this.scrollCamera();
            }

            if (this.cameras.main.scrollY < 130) {
                this.menuScene.moveCloud(this.cloud1, this.cloud1reflection);
                this.menuScene.moveCloud(this.cloud2, this.cloud2reflection);
            }

            this.visitors.children.iterate(function (visitor) {
                visitor.depth = visitor.y;
            });
        }
    }, {
        key: 'generateWaves',
        value: function generateWaves() {
            for (var i = 0; i < 10; i++) {
                var wave = new _wave.Wave(this, 0, 0 + this.cameraScroll, 'wave');
                this.waves.add(wave);
            }
        }
    }, {
        key: 'scrollCamera',
        value: function scrollCamera() {
            if (this.cameras.main.scrollY !== 250) {
                this.cameras.main.scrollY += 1;
            } else {
                if (this.gameStarted === false) {
                    if (!DEBUG) {
                        this.visitors.getChildren().forEach(function (visitor) {
                            visitor.canMakeDecisions = true;
                        });
                    }

                    this.runIntro = false;
                    this.gameStarted = true;
                    this.physics.world.setBounds(0, 250, 400, 300);
                    this.player.setCollideWorldBounds(true);

                    this.scoreDisplay.visible = true;
                    this.deathsDisplay.visible = true;
                    this.player.staminaDisplay.visible = true;
                    this.dayTimerDisplay.visible = true;
                }
            }
        }
    }, {
        key: 'gameOver',
        value: function gameOver() {
            if (this.deaths >= 5) {
                this.scene.manager.pause('BeachScene');
                this.gameOverDisplay.visible = true;
            }
        }
    }, {
        key: 'sendCornCart',
        value: function sendCornCart() {
            var _this3 = this;

            if (this.cornCartRunning === false) {
                this.cornCartRunning = true;

                this.cornCart.play('corn-cart-rides');
                this.physics.moveTo(this.cornCart, 0, 290 + this.cameraScroll, 40);
            }

            if (Math.floor(this.cornCart.x) <= 0) {
                this.cornCart.setVelocity(0, 0);
                this.cornCart.x = 500;
                this.time.addEvent({
                    delay: Phaser.Math.Between(15000, 30000),
                    callback: function callback() {
                        return _this3.cornCartRunning = false;
                    }
                });
            }
        }
    }, {
        key: 'createAnimations',
        value: function createAnimations() {
            this.anims.create({
                key: 'visitor-walk',
                frames: this.anims.generateFrameNames('visitor-2-walk', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'drowning',
                frames: this.anims.generateFrameNames('visitor-drowning', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: 1
            });

            this.anims.create({
                key: 'visitor-1-resting',
                frames: this.anims.generateFrameNames('visitor-1-resting', { start: 0 })
            });

            this.anims.create({
                key: 'visitor-2-resting',
                frames: this.anims.generateFrameNames('visitor-2-resting', { start: 0 })
            });

            this.anims.create({
                key: 'visitor-2-drowning-2',
                frames: this.anims.generateFrameNames('visitor-2-drowning-2', { start: 0, end: 5 }),
                frameRate: 6
            });

            this.anims.create({
                key: 'corn-cart-rides',
                frames: this.anims.generateFrameNames('corn-cart', { start: 0, end: 2 }),
                repeat: -1
            });

            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNames('player', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'player-idle',
                frames: this.anims.generateFrameNames('player-idle', { start: 0, end: 5 }),
                frameRate: 2,
                repeat: -1
            });

            this.anims.create({
                key: 'swim',
                frames: this.anims.generateFrameNames('player-swim', { start: 0, end: 3 }),
                frameRate: 9,
                repeat: -1
            });

            this.anims.create({
                key: 'visitor-idle',
                frames: this.anims.generateFrameNames('visitor-2-walk', { end: 0 }),
                frameRate: 0
            });

            this.anims.create({
                key: 'wave-start',
                frames: this.anims.generateFrameNames('wave', { end: 0 }),
                frameRate: 0
            });

            this.anims.create({
                key: 'wave-end',
                frames: this.anims.generateFrameNames('wave', { start: 11 }),
                frameRate: 0
            });

            this.anims.create({
                key: 'wave-moving',
                frames: this.anims.generateFrameNames('wave', { start: 0, end: 11 }),
                frameRate: 8,
                repeat: 1
            });
        }
    }, {
        key: 'generateVisitors',
        value: function generateVisitors(count) {
            for (var i = 0; i < count; i++) {
                var x = Phaser.Math.Between(20, 380);
                var y = Phaser.Math.Between(230, 280);
                var visitorType = Phaser.Math.Between(1, 2);
                // let visitor = new Visitor(this, x, y + 250, `visitor-${visitorType}-resting`);
                var visitor = new _smartVisitor.SmartVisitor(this, x, y + 250, 'visitor-' + visitorType + '-resting');

                visitor.type = visitorType;
                visitor.saveBounty = this.saveBounty;
                visitor.bounty = this.saveBounty;

                if (Math.random() >= 0.5) {
                    visitor.flipX = true;
                }

                this.visitors.add(visitor);
                this.add.existing(visitor);
            }
        }
    }, {
        key: 'getTimerDisplay',
        value: function getTimerDisplay(seconds) {
            var hours = Math.floor(seconds / 3600).toString();
            var minutes = Math.floor(seconds % 3600 / 60).toString();

            hours = hours.padStart(2, '0');
            minutes = minutes.padStart(2, '0');

            return hours + ':' + minutes;
        }
    }, {
        key: 'nextLevel',
        value: function nextLevel() {
            var _this4 = this;

            this.whistleSound.play();
            this.visitors.getChildren().forEach(function (visitor) {
                visitor.canMakeDecisions = false;

                if (visitor.state !== 'resting' && visitor.state !== 'returning') {
                    visitor.healthDisplay.visible = false;
                    visitor.returnToBlanket();
                }
            });

            this.cameras.main.fade(3000, 0, 0, 0, true, function (camera, progress) {
                if (1 === progress) {
                    _this4.audio.stop();

                    _this4.scene.start('BeachScene', {
                        dayNumber: ++_this4.dayNumber,
                        score: _this4.score,
                        cloud1x: Phaser.Math.Between(200, 400),
                        cloud2x: Phaser.Math.Between(0, 200),
                        cloud1speed: _this4.cloud1.cloudSpeed,
                        cloud2speed: _this4.cloud2.cloudSpeed
                    });
                }
            });
        }
    }, {
        key: 'startDay',
        value: function startDay() {
            this.introTimer = this.time.addEvent(this.getIntroTimerConfig());
        }
    }, {
        key: 'getIntroTimerConfig',
        value: function getIntroTimerConfig() {
            var _this5 = this;

            return {
                delay: 1000,
                callback: function callback() {
                    _this5.tweens.add({
                        targets: _this5.introTextDisplay,
                        alpha: 1,
                        duration: 2000,
                        onComplete: function onComplete() {
                            _this5.runIntro = true;
                        }
                    });
                }
            };
        }
    }, {
        key: 'addClouds',
        value: function addClouds(data) {
            this.cloud1 = this.add.image(data.cloud1x, -5, 'cloud-1').setOrigin(0);
            this.cloud2 = this.add.image(data.cloud2x, -5, 'cloud-2').setOrigin(0);
            this.cloud1.cloudSpeed = data.cloud1speed;
            this.cloud2.cloudSpeed = data.cloud2speed;

            this.cloud1reflection = this.add.image(this.cloud1.x, 130, 'cloud-1').setOrigin(0).setScale(1, -1);
            this.cloud1reflection.tint = 0x5555ff;

            this.cloud2reflection = this.add.image(this.cloud2.x, 130, 'cloud-2').setOrigin(0).setScale(1, -1);
            this.cloud2reflection.tint = 0x5555ff;
        }
    }, {
        key: 'percentage',
        value: function percentage(desired) {
            return Phaser.Math.Between(0, 100) < desired;
        }
    }]);

    return BeachScene;
}(Phaser.Scene);

/***/ }),

/***/ 1076:
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

        _this.cameraScroll = scene.cameraScroll;
        scene.physics.add.existing(_this);
        _this.body.setSize(5, 5);
        _this.playerSpeed = 2;
        _this.stamina = 10;
        _this.animationKey = 'walk';
        _this.staminaDisplay = scene.add.text(45, 10 + scene.cameraScroll, _this.getStaminaForDisplay(_this.stamina), { fontSize: '10px' });

        _this.createEmitters(scene);

        scene.time.addEvent({
            delay: 1000,
            callback: function callback() {
                if (_this.keys.shift.isDown && _this.stamina > 0) {
                    _this.setStamina(_this.stamina - 1);
                } else if (!_this.keys.shift.isDown && _this.stamina < 10) {
                    _this.setStamina(_this.stamina + .5);
                }
            },
            repeat: -1
        });
        return _this;
    }

    _createClass(Player, [{
        key: 'update',
        value: function update(keys, time, delta) {
            this.keys = keys;

            if (this.y < 195 + this.cameraScroll) {
                this.animationKey = 'swim';
            } else {
                this.animationKey = 'walk';
            }

            if (keys.left.isDown) {
                this.x -= this.playerSpeed;
                this.flipX = true;
                this.anims.play(this.animationKey, true);
            } else if (keys.right.isDown) {
                this.x += this.playerSpeed;
                this.flipX = false;
                this.anims.play(this.animationKey, true);
            }

            if (keys.up.isDown) {
                this.y -= this.playerSpeed;
                this.anims.play(this.animationKey, true);
            } else if (keys.down.isDown) {
                this.y += this.playerSpeed;
                this.anims.play(this.animationKey, true);
            }

            if (!keys.left.isDown && !keys.right.isDown && !keys.up.isDown && !keys.down.isDown) {
                if (this.animationKey === 'walk') {
                    this.anims.play('player-idle', true);
                    this.sandEmitter.stop();
                }
            }

            if (keys.shift.isDown && this.stamina > 0) {
                this.playerSpeed = 2.5 * (delta * 30 / 1000);

                if (this.animationKey === 'walk') {
                    this.sandEmitter.emitParticle();
                }
            } else {
                this.playerSpeed = 2 * (delta * 30 / 1000);
            }
        }
    }, {
        key: 'createEmitters',
        value: function createEmitters(scene) {
            this.sandEmitter = scene.add.particles('sand').createEmitter({
                speed: 10,
                maxParticles: 70,
                y: 6, x: -1,
                lifespan: 300
            });

            this.sandEmitter.startFollow(this);
        }
    }, {
        key: 'getStaminaForDisplay',
        value: function getStaminaForDisplay(stamina) {
            return '.'.repeat(stamina);
        }
    }, {
        key: 'setStamina',
        value: function setStamina(current) {
            this.stamina = current;
            this.staminaDisplay.setText(this.getStaminaForDisplay(this.stamina));
        }
    }]);

    return Player;
}(Phaser.Physics.Arcade.Sprite);

/***/ }),

/***/ 1077:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SmartVisitor = exports.SmartVisitor = function (_Phaser$Physics$Arcad) {
    _inherits(SmartVisitor, _Phaser$Physics$Arcad);

    function SmartVisitor(scene, x, y, texture) {
        _classCallCheck(this, SmartVisitor);

        var _this = _possibleConstructorReturn(this, (SmartVisitor.__proto__ || Object.getPrototypeOf(SmartVisitor)).call(this, scene, x, y, texture));

        scene.physics.add.existing(_this);
        _this.cameraScroll = scene.cameraScroll;

        // states: resting, walking, swimming, drowning, returning
        _this.state = 'resting';
        _this.saveBounty = 0;
        _this.bounty = _this.saveBounty;
        _this.origin = { x: x, y: y };
        _this.chanceToDrown = 0.003;
        _this.speed = .8;
        _this.topSpeed = .8;
        _this.walkSpeed = .7;

        _this.canMakeDecisions = false;
        _this.targetLocation = {};
        _this.blanket = scene.add.image(_this.x, _this.y, 'blanket');
        _this.blanket.setDepth(0);

        _this.maxHealth = 5;
        _this.health = _this.maxHealth;
        _this.healthDisplay = _this.scene.add.text(-100, -100, '.'.repeat(Math.floor(_this.health)));

        var timer = scene.time.addEvent({
            delay: 1000,
            callback: function callback() {
                if (_this.state === 'drowning' && _this.health > 0) {
                    _this.health -= .5;
                    _this.healthDisplay.setText('.'.repeat(Math.floor(_this.health)));
                }

                if (_this.health === 0) {
                    _this.destroy();
                    timer.destroy();
                    scene.deaths++;

                    if (scene.deaths > scene.maxDeaths) {
                        scene.deaths = scene.maxDeaths;
                    }

                    scene.deathsDisplay.setText(scene.deaths);
                }
            },
            repeat: -1
        });

        // decision timer
        scene.time.addEvent({
            delay: 1000,
            callback: function callback() {
                if (_this.canMakeDecisions) {
                    switch (_this.state) {
                        case 'resting':
                            _this.speed = _this.topSpeed;

                            if (_this.percentage(15)) {
                                _this.state = 'go-swimming';

                                // pick sea location
                                _this.pickSwimmingLocation();
                            } else if (_this.percentage(10)) {
                                _this.state = 'walking';
                                _this.speed = _this.walkSpeed;

                                // pick beach location
                                _this.pickBeachLocation();
                            }

                            break;
                        case 'swimming':
                            if (_this.percentage(1)) {
                                _this.state = 'drowning';
                            } else if (_this.percentage(15)) {
                                _this.state = 'go-swimming';
                                _this.pickSwimmingLocation(true);
                            } else if (_this.percentage(50)) {
                                _this.state = 'go-resting';
                                _this.returnToBlanket();
                            }

                            break;
                        case 'returning':
                            break;
                        case 'idle':
                            if (_this.percentage(15)) {
                                _this.state = 'walking';
                                _this.pickBeachLocation();
                            } else if (_this.percentage(50)) {
                                _this.state = 'returning';
                                _this.returnToBlanket();
                            }

                            break;
                    }
                }
            },
            repeat: -1
        });
        return _this;
    }

    _createClass(SmartVisitor, [{
        key: 'update',
        value: function update(time, delta) {
            this.actOnDecision();

            if (this.state === 'drowning') {
                this.healthDisplay.visible = true;
                this.healthDisplay.x = this.x;
                this.healthDisplay.y = this.y;
                this.targetLocation = {};
            }

            if (this.y < 190 + this.cameraScroll) {
                if (this.state === 'drowning') {
                    this.play('visitor-2-drowning-2', true);
                } else {
                    this.play('drowning', true);
                }
            } else if (this.state === 'idle') {
                this.play('visitor-idle');
            } else if (this.state !== 'resting') {
                if (this.targetLocation.x > this.x) {
                    this.flipX = false;
                } else {
                    this.flipX = true;
                }

                this.play('visitor-walk', true);
                if (this.donut) {
                    this.donut.destroy();
                }
            } else if (this.state === 'resting') {
                this.play('visitor-' + this.type + '-resting', true);
            }
        }
    }, {
        key: 'pickSwimmingLocation',
        value: function pickSwimmingLocation() {
            var goNear = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (goNear) {
                var dxCandidate = Phaser.Math.Between(-40, 40);
                var dyCandidate = Phaser.Math.Between(-40, 40);

                if (this.x + dxCandidate > 0 && this.x + dxCandidate < 400) {
                    this.targetLocation.x = this.x + dxCandidate;
                } else {
                    this.targetLocation.x = this.x;
                }

                if (this.y + dyCandidate < 200 + this.cameraScroll && this.y + dyCandidate > this.cameraScroll) {
                    this.targetLocation.y = this.y + dyCandidate;
                } else {
                    this.targetLocation.y = this.y;
                }
            } else {
                this.targetLocation.x = Phaser.Math.Between(0, 400);
                this.targetLocation.y = Phaser.Math.Between(20 + this.scene.cameraScroll, 200 + this.scene.cameraScroll);
            }
        }
    }, {
        key: 'pickBeachLocation',
        value: function pickBeachLocation() {
            this.targetLocation.x = Phaser.Math.Between(0, 400);
            this.targetLocation.y = Phaser.Math.Between(200 + this.scene.cameraScroll, 300 + this.scene.cameraScroll);
        }
    }, {
        key: 'actOnDecision',
        value: function actOnDecision() {
            if (Object.keys(this.targetLocation).length > 0) {
                this.goTo(this.targetLocation);

                if ((this.state === 'go-swimming' || this.state === 'walking') && this.arrived(this.targetLocation)) {
                    this.targetLocation = {};
                    if (this.state === 'go-swimming') {
                        this.state = 'swimming';
                    }

                    if (this.state === 'walking') {
                        this.state = 'idle';
                    }
                }

                if (this.state === 'returning' && this.arrived(this.targetLocation)) {
                    if (this.donut) {
                        this.donut.destroy();
                    }
                    this.state = 'resting';
                    this.targetLocation = {};

                    // visitor can go swimming again
                    this.canMakeDecisions = true;
                    this.bounty = this.saveBounty;
                    this.chanceToDrown -= 0.001;

                    this.play('visitor-2-resting', true);

                    if (Math.random() > .5) {
                        this.flipX = true;
                    }

                    this.health = this.maxHealth;
                    this.healthDisplay.setText('.'.repeat(Math.floor(this.health)));
                }

                if (this.state === 'returning' && this.donut) {
                    this.donut.y = this.y;
                    this.donut.x = this.x;

                    this.healthDisplay.visible = false;
                }
            }
        }
    }, {
        key: 'arrived',
        value: function arrived(target) {
            var flooredX = Math.floor(this.x);
            var flooredY = Math.floor(this.y);

            if ([flooredX - 1, flooredX, flooredX + 1].includes(Math.floor(target.x)) && [flooredY - 1, flooredY, flooredY + 1].includes(Math.floor(target.y))) {
                return true;
            }

            return false;
        }
    }, {
        key: 'goTo',
        value: function goTo(target) {
            // direction towards target
            var toPointX = target.x - this.x;
            var toPointY = target.y - this.y;

            // normalize
            var toPointLength = Math.sqrt(toPointX * toPointX + toPointY * toPointY);
            toPointX = toPointX / toPointLength;
            toPointY = toPointY / toPointLength;

            // move towards target
            if (!isNaN(toPointX) && !isNaN(toPointY)) {
                this.x += toPointX * this.speed;
                this.y += toPointY * this.speed;
            }
        }
    }, {
        key: 'returnToBlanket',
        value: function returnToBlanket() {
            this.state = 'returning';
            this.targetLocation = { x: this.blanket.x, y: this.blanket.y };
        }
    }, {
        key: 'percentage',
        value: function percentage(desired) {
            return Phaser.Math.Between(0, 100) < desired;
        }
    }]);

    return SmartVisitor;
}(Phaser.Physics.Arcade.Sprite);

/***/ }),

/***/ 1078:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Wave = exports.Wave = function (_Phaser$Physics$Arcad) {
    _inherits(Wave, _Phaser$Physics$Arcad);

    function Wave(scene, x, y, texture) {
        _classCallCheck(this, Wave);

        console.log('wave created');

        var _this = _possibleConstructorReturn(this, (Wave.__proto__ || Object.getPrototypeOf(Wave)).call(this, scene, x, y, texture));

        scene.physics.add.existing(_this);
        scene.add.existing(_this);

        _this.cameraScroll = scene.cameraScroll;
        _this.destination = null;
        _this.setVisible(false);
        _this.setActive(false);
        // start, move, end
        _this.state = 'start';
        _this.drowny = true;
        return _this;
    }

    _createClass(Wave, [{
        key: 'start',
        value: function start() {
            console.log('wave start');
            this.x = Phaser.Math.Between(0, 400);
            this.y = Phaser.Math.Between(this.cameraScroll - 50, 125 + this.cameraScroll);

            this.setActive(true);
            this.setVisible(true);
            this.play('wave-start');
            this.drowny = true;

            this.destination = { x: this.x, y: this.y + 70 };
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.destination && Math.floor(this.y) !== this.destination.y) {
                this.y += .8;
                this.play('wave-moving', true);
                this.state = 'moving';

                if (Phaser.Math.Difference(this.y, this.destination.y) < 15) {
                    this.play('wave-end');
                    this.drowny = false;
                }
            } else if (this.destination && Math.floor(this.y) === this.destination.y) {
                this.state = 'end';
                this.setVisible(false);
                this.setActive(false);
                this.destination = null;
            }
        }
    }]);

    return Wave;
}(Phaser.Physics.Arcade.Sprite);

/***/ }),

/***/ 1079:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MenuScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textButton = __webpack_require__(1080);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MenuScene = exports.MenuScene = function (_Phaser$Scene) {
    _inherits(MenuScene, _Phaser$Scene);

    function MenuScene() {
        _classCallCheck(this, MenuScene);

        return _possibleConstructorReturn(this, (MenuScene.__proto__ || Object.getPrototypeOf(MenuScene)).call(this, { key: 'MenuScene' }));
    }

    _createClass(MenuScene, [{
        key: 'preload',
        value: function preload() {
            this.load.image('bg', 'assets/background2.png');
            this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('visitor-drowning', 'assets/visitor-2-drowning.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('player-swim', 'assets/dude-swimming.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('visitor-1-resting', 'assets/visitor-1-resting.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('visitor-2-resting', 'assets/visitor-2-resting.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet('visitor-2-walk', 'assets/visitor-2-walk.png', { frameHeight: 16, frameWidth: 16 });
            this.load.spritesheet('visitor-2-drowning-2', 'assets/visitor-2-drowning-2.png', { frameHeight: 16, frameWidth: 16 });
            this.load.spritesheet('player-idle', 'assets/dude-idle.png', { frameHeight: 16, frameWidth: 16 });
            this.load.spritesheet('corn-cart', 'assets/corn-cart.png', { frameHeight: 16, frameWidth: 16 });
            this.load.spritesheet('wave', 'assets/wave.png', { frameHeight: 32, frameWidth: 32 });

            this.load.image('donut', 'assets/donut.png');
            this.load.image('blanket', 'assets/blanket-green.png');

            this.load.audio('waves', ['assets/ocean-waves.wav']);
            this.load.audio('whistle', 'assets/whistle.wav');

            if (!this.textures.exists('sand')) {
                this.textures.generate('sand', { data: ['6'], pixelWidth: 1, pixelHeight: 1 });
            }

            this.load.image('cloud-1', 'assets/cloud-1.png');
            this.load.image('cloud-2', 'assets/cloud-2.png');

            this.load.bitmapFont('gameFont', 'assets/fonts/atari-classic.png', 'assets/fonts/atari-classic.xml');
        }
    }, {
        key: 'create',
        value: function create(data) {
            var _this2 = this;

            var audio = this.sound.add('waves');
            if (!audio.isPlaying) {
                audio.play({ loop: true });
            }

            this.bg = this.add.image(0, 0, 'bg').setOrigin(0);
            this.addClouds();
            this.add.bitmapText(160, 100, 'gameFont', 'START', 18);

            var anyKey = this.add.bitmapText(145, 150, 'gameFont', 'press any key', 10);
            this.input.keyboard.on('keyup', function () {
                _this2.scene.start('BeachScene', {
                    cloud1x: _this2.cloud1.x, cloud2x: _this2.cloud2.x,
                    cloud1speed: _this2.cloud1.cloudSpeed,
                    cloud2speed: _this2.cloud2.cloudSpeed
                });
            });

            this.time.addEvent({
                delay: 500,
                callback: function callback() {
                    if (anyKey.visible) {
                        anyKey.setVisible(false);
                    } else {
                        anyKey.setVisible(true);
                    }
                },
                repeat: -1
            });
        }
    }, {
        key: 'update',
        value: function update(time, delta) {
            this.moveCloud(this.cloud1, this.cloud1reflection);
            this.moveCloud(this.cloud2, this.cloud2reflection);
        }
    }, {
        key: 'addClouds',
        value: function addClouds() {
            this.cloud1 = this.add.image(300, -5, 'cloud-1').setOrigin(0);
            this.cloud2 = this.add.image(150, -5, 'cloud-2').setOrigin(0);

            this.cloud1.cloudSpeed = Phaser.Math.FloatBetween(.2, .5);
            this.cloud2.cloudSpeed = Phaser.Math.FloatBetween(.2, .5);

            this.cloud1reflection = this.add.image(300, 130, 'cloud-1').setOrigin(0).setScale(1, -1);
            this.cloud1reflection.tint = 0x5555ff;

            this.cloud2reflection = this.add.image(150, 130, 'cloud-2').setOrigin(0).setScale(1, -1);
            this.cloud2reflection.tint = 0x5555ff;
        }
    }, {
        key: 'moveCloud',
        value: function moveCloud(cloud, reflection) {
            if (cloud.x < -cloud.width) {
                cloud.x = 400 + cloud.width + 50;
                cloud.cloudSpeed = Phaser.Math.FloatBetween(.2, .5);

                if (typeof reflection !== 'undefined') {
                    reflection.x = cloud.x;
                }
            }

            cloud.x -= cloud.cloudSpeed;

            if (typeof reflection !== 'undefined') {
                reflection.x -= cloud.cloudSpeed;
            }
        }
    }]);

    return MenuScene;
}(Phaser.Scene);

/***/ }),

/***/ 1080:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// export class TextButton extends Phaser.GameObjects.Text {
var TextButton = exports.TextButton = function (_Phaser$GameObjects$B) {
    _inherits(TextButton, _Phaser$GameObjects$B);

    function TextButton(scene, x, y, font, text, size, callback) {
        _classCallCheck(this, TextButton);

        var _this = _possibleConstructorReturn(this, (TextButton.__proto__ || Object.getPrototypeOf(TextButton)).call(this, scene, x, y, font, text, size));

        _this.setInteractive({ useHandCursor: true }).on('pointerover', function () {
            return _this.enterButtonHoverState();
        }).on('pointerout', function () {
            return _this.enterButtonRestState();
        }).on('pointerdown', function () {
            return _this.enterButtonActiveState();
        }).on('pointerup', function () {
            _this.enterButtonHoverState();
            callback();
        });
        return _this;
    }

    _createClass(TextButton, [{
        key: 'enterButtonActiveState',
        value: function enterButtonActiveState() {
            this.setStyle({ fill: '#0ff' });
        }
    }, {
        key: 'enterButtonHoverState',
        value: function enterButtonHoverState() {
            // this.setStyle({fill: '#ff0'});
            this.setStyle({ fill: '#0ff' });
        }
    }, {
        key: 'enterButtonRestState',
        value: function enterButtonRestState() {
            this.setStyle({ fill: '#0f0' });
        }
    }]);

    return TextButton;
}(Phaser.GameObjects.BitmapText);

/***/ }),

/***/ 434:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(210);

var _beachScene = __webpack_require__(1075);

var _menuScene = __webpack_require__(1079);

var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scene: [_menuScene.MenuScene, _beachScene.BeachScene],
    zoom: 2,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

new Phaser.Game(config);

/***/ })

},[434]);