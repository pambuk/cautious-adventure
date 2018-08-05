import {Player} from '../game-objects/player';

export class BeachScene extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-drowning', 'assets/drowning.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.visitors = [];
        this.add.image(80, 90, 'bg');

        this.score = 0;
        this.scoreDisplay = this.add.text(10, 10, this.score, {fontSize: '18px'});

        // visitor
        this.visitor = this.physics.add.sprite(100, 170, 'visitor-drowning');
        this.visitor.body.setSize(7, 8);

        // player
        this.player = new Player(this, 300, 250, 'player');
        this.add.existing(this.player);

        this.physics.add.overlap(this.player, this.visitor, () => {
            this.score += 10;
            this.scoreDisplay.setText(this.score);
            this.visitor.disableBody(true);
        }, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: 'drowning',
            frames: this.anims.generateFrameNames('visitor-drowning', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: 1
        });
    }

    update(time, delta) {
        this.visitor.play('drowning', true);
        this.player.update(this.cursors, time, delta);
    }

}