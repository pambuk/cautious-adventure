import { Player } from '../game-objects/player';
import { SmartVisitor } from '../game-objects/smart-visitor';

const DEBUG = false;

export class BeachScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BeachScene' });
    }

    create(data) {
        this.runIntro = false;

        let audio = this.sound.add('waves');
        if (!audio.isPlaying) {
            audio.play({ loop: true });
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
        // this.wave = this.physics.add.sprite(200, 100 + this.cameraScroll, 'wave');

        // player
        this.player = new Player(this, 300, 250 + this.cameraScroll, 'player');
        this.add.existing(this.player);

        this.score = data.score ? data.score : 0;
        this.scoreDisplay = this.add.text(10, 10 + this.cameraScroll, this.score, { fontSize: '18px' });

        this.dayTimer = 3600 * 8;

        this.dayTimerDisplay = this.add.text(340, 10 + this.cameraScroll, this.getTimerDisplay(this.dayTimer), { fontSize: '18px' });
        this.dayTimerDisplay.visible = false;

        this.deathsDisplay = this.add.text(120, 10 + this.cameraScroll, this.deaths, { fontSize: '18px' });

        this.gameOverDisplay = this.add.text(140, 100 + this.cameraScroll, 'GAME OVER', { fontSize: '24px' });
        this.gameOverDisplay.visible = false;

        this.introTextDisplay = this.add.text(170, 100, `Day ${this.dayNumber}`, { fontSize: '24px' });
        this.introTextDisplay.alpha = 0;

        this.startDay();

        let clockTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.gameStarted === true) {
                    if (DEBUG) {
                        this.dayTimer += 1800;
                    } else {
                        this.dayTimer += 300;
                    }

                    this.dayTimerDisplay.setText(this.getTimerDisplay(this.dayTimer));

                    // this.dayEndsAt = 9;
                    if (DEBUG) {
                        this.dayEndsAt = 9;
                    }

                    if (Math.floor(this.dayTimer / 3600) === this.dayEndsAt) {
                        console.log('day ends');

                        clockTimer.destroy();
                        this.nextLevel();
                    }

                    // waves
                    if (this.percentage(100)) {

                        // this.waves.add(this.physics.add.sprite(200, 100 + this.cameraScroll, 'wave'));
                        // this.waves.get()

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

        this.physics.add.overlap(this.player, this.visitors, (player, visitor) => {
            if (visitor.state === 'drowning') {
                this.score += visitor.bounty;
                this.scoreDisplay.setText(this.score);
                visitor.bounty = 0;
                visitor.z = 1;
                visitor.donut = this.add.image(visitor.x, visitor.y + 1, 'donut');
                if (visitor.state !== 'returning') {
                    visitor.returnToBlanket();
                }
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.smartVisitor, (player, visitor) => {
            if (visitor.state === 'drowning') {
                this.score += visitor.bounty;
                this.scoreDisplay.setText(this.score);
                visitor.bounty = 0;
                visitor.z = 1;
                visitor.donut = this.add.image(visitor.x, visitor.y + 1, 'donut');
                if (visitor.state !== 'returning') {
                    visitor.returnToBlanket();
                }
            }

        });

        this.physics.add.overlap(this.player, this.cornCart, () => {
            this.player.stamina += 5;
            if (this.player.stamina > 10) {
                this.player.stamina = 10;
            }

            this.player.staminaDisplay.setText(this.player.getStaminaForDisplay(this.player.stamina));
        });

        this.physics.add.overlap(this.visitors, this.waves, (visitor, wave) => {
            console.log('wave overlap', visitor, wave);

        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreDisplay.visible = false;
        this.deathsDisplay.visible = false;
        this.player.staminaDisplay.visible = false;
    }

    update(time, delta) {
        this.player.update(this.cursors, time, delta);
        this.visitors.runChildUpdate = true;

        this.sendCornCart();
        this.gameOver();

        if (this.runIntro === true) {
            this.scrollCamera();
        }
    
        if (this.cameras.main.scrollY < 130) {
            this.menuScene.moveCloud(this.cloud1, this.cloud1reflection);
            this.menuScene.moveCloud(this.cloud2, this.cloud2reflection);
        }

        this.moveWaves();

        this.visitors.children.iterate((visitor) => {
            visitor.depth = visitor.y;
        });
    }

    moveWaves() {

    }

    scrollCamera() {
        if (this.cameras.main.scrollY !== 250) {
            this.cameras.main.scrollY += 1;
        } else {
            if (this.gameStarted === false) {
                if (!DEBUG) {
                    this.visitors.getChildren().forEach(visitor => {
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

    gameOver() {
        if (this.deaths >= 5) {
            this.scene.manager.pause('BeachScene');
            this.gameOverDisplay.visible = true;
        }
    }

    sendCornCart() {
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
                callback: () => this.cornCartRunning = false
            });
        }
    }

    createAnimations() {
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
            frames: this.anims.generateFrameNames('wave', {end: 0}),
            frameRate: 0
        });

        this.anims.create({
            key: 'wave-end',
            frames: this.anims.generateFrameNames('wave', {start: 11}),
            frameRate: 0
        })

        this.anims.create({
            key: 'wave-moving',
            frames: this.anims.generateFrameNames('wave', {start: 0, end: 11}),
            frameRate: 8,
            repeat: -1
        });
    }

    generateVisitors(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(20, 380);
            let y = Phaser.Math.Between(230, 280);
            let visitorType = Phaser.Math.Between(1, 2);
            // let visitor = new Visitor(this, x, y + 250, `visitor-${visitorType}-resting`);
            let visitor = new SmartVisitor(this, x, y + 250, `visitor-${visitorType}-resting`);

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

    getTimerDisplay(seconds) {
        let hours = Math.floor(seconds / 3600).toString();
        let minutes = Math.floor(seconds % 3600 / 60).toString();

        hours = hours.padStart(2, '0');
        minutes = minutes.padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    nextLevel() {
        this.whistleSound.play();
        this.visitors.getChildren().forEach(visitor => {
            visitor.canMakeDecisions = false;

            if (visitor.state !== 'resting' && visitor.state !== 'returning') {
                visitor.healthDisplay.visible = false;
                visitor.returnToBlanket();
            }
        });

        this.cameras.main.fade(3000, 0, 0, 0, true, (camera, progress) => {
            if (1 === progress) {
                this.scene.start('BeachScene', {
                    dayNumber: ++this.dayNumber,
                    score: this.score,
                    cloud1x: Phaser.Math.Between(200, 400),
                    cloud2x: Phaser.Math.Between(0, 200),
                    cloud1speed: this.cloud1.cloudSpeed,
                    cloud2speed: this.cloud2.cloudSpeed
                });
            }
        });
    }

    startDay() {
        this.introTimer = this.time.addEvent(this.getIntroTimerConfig());
    }

    getIntroTimerConfig() {
        return {
            delay: 1000,
            callback: () => {
                this.tweens.add({
                    targets: this.introTextDisplay,
                    alpha: 1,
                    duration: 2000,
                    onComplete: () => {
                        this.runIntro = true;
                    }
                })
            }
        };
    }

    addClouds(data) {
        this.cloud1 = this.add.image(data.cloud1x, -5, 'cloud-1').setOrigin(0);
        this.cloud2 = this.add.image(data.cloud2x, -5, 'cloud-2').setOrigin(0);
        this.cloud1.cloudSpeed = data.cloud1speed;
        this.cloud2.cloudSpeed = data.cloud2speed;

        this.cloud1reflection = this.add.image(this.cloud1.x, 130, 'cloud-1').setOrigin(0).setScale(1, -1);
        this.cloud1reflection.tint = 0x5555ff;

        this.cloud2reflection = this.add.image(this.cloud2.x, 130, 'cloud-2').setOrigin(0).setScale(1, -1);
        this.cloud2reflection.tint = 0x5555ff;
    }

    percentage(desired) {
        return Phaser.Math.Between(0, 100) < desired;
    }
}
