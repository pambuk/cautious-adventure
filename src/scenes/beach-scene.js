import { Player } from '../game-objects/player';
import { Visitor } from '../game-objects/visitor';
import { Physics } from 'phaser';

export class BeachScene extends Phaser.Scene {

    preload() {
        this.load.image('bg', 'assets/background2.png');
        // this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-drowning', 'assets/visitor-2-drowning.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player-swim', 'assets/dude-swimming.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-1-resting', 'assets/visitor-1-resting.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-2-resting', 'assets/visitor-2-resting.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-2-walk', 'assets/visitor-2-walk.png', { frameHeight: 16, frameWidth: 16 });
        this.load.spritesheet('visitor-2-drowning-2', 'assets/visitor-2-drowning-2.png', { frameHeight: 16, frameWidth: 16 });
        this.load.spritesheet('player-idle', 'assets/dude-idle.png', { frameHeight: 16, frameWidth: 16 });
        this.load.spritesheet('corn-cart', 'assets/corn-cart.png', { frameHeight: 16, frameWidth: 16 });

        this.load.image('donut', 'assets/donut.png');
        this.load.image('blanket', 'assets/blanket-green.png');

        this.load.audio('waves', ['assets/ocean-waves.wav']);
    }

    create() {
        this.runIntro = false;

        let audio = this.sound.add('waves');
        audio.play({ loop: true });

        this.cameraScroll = 250;
        this.gameStarted = false;
        this.deaths = 0;
        this.maxDeaths = 5;
        this.dayEndsAt = 16;

        this.bg = this.add.image(0, 0, 'bg').setOrigin(0);
        this.visitors = this.physics.add.group();
        this.generateVisitors(10);

        // player
        this.player = new Player(this, 300, 250 + this.cameraScroll, 'player');
        this.add.existing(this.player);

        this.score = 0;
        this.scoreDisplay = this.add.text(10, 10 + this.cameraScroll, this.score, { fontSize: '18px' });

        this.dayTimer = 3600 * 8;

        this.dayTimerDisplay = this.add.text(350, 10 + this.cameraScroll, this.getTimerDisplay(this.dayTimer), {fontSize: '18px'});
        this.dayTimerDisplay.visible = false;

        this.deathsDisplay = this.add.text(120, 10 + this.cameraScroll, this.deaths, { fontSize: '18px' });
        
        this.gameOverDisplay = this.add.text(140, 100 + this.cameraScroll, 'GAME OVER', { fontSize: '24px' });
        this.gameOverDisplay.visible = false;

        this.introTextDisplay = this.add.text(180, 100, "Day 1", { fontSize: '24px' });
        this.introTextDisplay.alpha = 0;

        this.time.addEvent({
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
        });

        let clockTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.gameStarted === true) {
                    this.dayTimer += 300;
                    this.dayTimerDisplay.setText(this.getTimerDisplay(this.dayTimer));

                    // this.dayEndsAt = 9;
                    if (Math.floor(this.dayTimer / 3600) === this.dayEndsAt) {
                        console.log('day ends');

                        clockTimer.destroy();
                        this.nextLevel();
                    }
                }
            },
            repeat: -1
        });

        this.createAnimations();

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
                    visitor.returnToShore();
                }
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.cornCart, () => {
            this.player.stamina += 5;
            if (this.player.stamina > 10) {
                this.player.stamina = 10;
            }

            this.player.staminaDisplay.setText(this.player.getStaminaForDisplay(this.player.stamina));
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
    }

    scrollCamera() {
        if (this.cameras.main.scrollY !== 250) {
            this.cameras.main.scrollY += 1;
        } else {
            if (this.gameStarted === false) {
                this.visitors.getChildren().forEach(visitor => {
                    visitor.canMakeDecisions = true;
                });

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
            this.scene.manager.pause('default');
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
    }

    generateVisitors(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(20, 380);
            let y = Phaser.Math.Between(230, 280);
            let visitorType = Phaser.Math.Between(1, 2);
            let visitor = new Visitor(this, x, y + 250, `visitor-${visitorType}-resting`);
            visitor.type = visitorType;

            if (Math.random() >= 0.5) {
                visitor.flipX = true;
            }

            this.visitors.add(visitor);
            this.add.existing(visitor);
        }
    }

    getTimerDisplay(seconds) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor(seconds % 3600 / 60).toString();

        minutes = minutes.padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    nextLevel() {
        this.scene.manager.pause('default');
    }
}