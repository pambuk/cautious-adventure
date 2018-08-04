import {Player} from '../game-objects/player';

export class BeachScene extends Phaser.Scene {

    constructor() {
        super();
        this.playerSpeed = 1;
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-drowning', 'assets/drowning.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.add.image(320, 240, 'bg');

        this.visitor = this.add.sprite(200, 300, 'visitor-drowning');
        // this.player = this.add.sprite(400, 400, 'player');
        this.player = new Player(this, 400, 400, 'player');
        this.add.existing(this.player);

        this.textures.generate('sand', { data: ['6'], pixelWidth: 1, pixelHeight: 1 });
        // this.textures.generate('water', { data: ['1'], pixelWidth: 1, pixelHeight: 1 });
        this.sandEmitter = this.add.particles('sand').createEmitter({
            speed: 10,
            maxParticles: 70,
            y: 6, x: -1,
            lifespan: 300
        });
        this.sandEmitter.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', { start: 0 }),
            frameRate: 0
        });

        this.anims.create({
            key: 'drowning',
            frames: this.anims.generateFrameNames('visitor-drowning', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: 1
        });
    }

    update(time, delta) {
        // console.log(time, delta);
        this.visitor.play('drowning', true);

        if (this.cursors.left.isDown) {
            this.player.x -= this.playerSpeed;
            this.player.flipX = true;
            this.player.anims.play('walk', true);

        } else if (this.cursors.right.isDown) {
            this.player.x += this.playerSpeed;
            this.player.flipX = false;
            this.player.anims.play('walk', true);
        }

        if (this.cursors.up.isDown) {
            this.player.y -= this.playerSpeed;
            this.player.anims.play('walk', true);
        } else if (this.cursors.down.isDown) {
            this.player.y += this.playerSpeed;
            this.player.anims.play('walk', true);
        }

        if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.player.anims.play('idle');
            this.sandEmitter.stop();
        }

        if (this.cursors.shift.isDown) {
            // this.playerSpeed = 2.5;
            this.playerSpeed = 2.5 * ((delta * 30) / 1000);
            this.sandEmitter.emitParticle();
        } else {
            this.playerSpeed = 2 * ((delta * 30) / 1000);
            // this.playerSpeed = 2;
        }

    }
}