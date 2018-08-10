import { Player } from '../game-objects/player';
import { Visitor } from '../game-objects/visitor';

export class BeachScene extends Phaser.Scene {

    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-drowning', 'assets/visitor-2-drowning.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player-swim', 'assets/dude-swimming.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-1-resting', 'assets/visitor-1-resting.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-2-resting', 'assets/visitor-2-resting.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('visitor-2-walk', 'assets/visitor-2-walk.png', { frameHeight: 16, frameWidth: 16 });
        this.load.image('donut', 'assets/donut.png');
        this.load.image('blanket', 'assets/blanket-green.png');
    }

    create() {
        this.visitors = this.physics.add.group();
        this.add.image(80, 90, 'bg');
        this.score = 0;
        this.scoreDisplay = this.add.text(10, 10, this.score, { fontSize: '18px' });

        this.generateVisitors(3);
        this.createAnimations();

        // player
        this.player = new Player(this, 300, 250, 'player');
        this.add.existing(this.player);

        this.physics.add.overlap(this.player, this.visitors, (player, visitor) => {
            if (visitor.state === 'drowning') {
                this.score += visitor.bounty;
                this.scoreDisplay.setText(this.score);
                visitor.bounty = 0;
                visitor.z = 1;

                // ??? why is donut misplaced sometimes? because of flipX === true
                visitor.donut = this.add.image(visitor.x, visitor.y + 1, 'donut');
                if (visitor.state !== 'returning') {
                    visitor.returnToShore();
                }
            }
        }, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update(time, delta) {
        this.player.update(this.cursors, time, delta);
        this.visitors.runChildUpdate = true;
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
            frames: this.anims.generateFrameNames('visitor-1-resting', {start: 0})
        });

        this.anims.create({
            key: 'visitor-2-resting',
            frames: this.anims.generateFrameNames('visitor-2-resting', {start: 0})
        });
    }

    generateVisitors(count) {
        for (let i = 0; i < count; i++) {
            let x = this.getRandomIntInclusive(20, 380);
            let y = this.getRandomIntInclusive(230, 280);
            let visitorType = this.getRandomIntInclusive(1, 2);
            let visitor = new Visitor(this, x, y, `visitor-${visitorType}-resting`);
            visitor.type = visitorType;

            if (Math.random() >= 0.5) {
                visitor.flipX = true;
            }

            this.visitors.add(visitor);
            this.add.existing(visitor);
        }
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}