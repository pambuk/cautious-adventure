import { TextButton } from "../game-objects/text-button";

export class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
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

        this.load.image('donut', 'assets/donut.png');
        this.load.image('blanket', 'assets/blanket-green.png');

        this.load.audio('waves', ['assets/ocean-waves.wav']);
        this.load.audio('whistle', 'assets/whistle.wav');

        if (!this.textures.exists('sand')) {
            this.textures.generate('sand', { data: ['6'], pixelWidth: 1, pixelHeight: 1 });
        }

        this.load.image('cloud-1', 'assets/cloud-1.png');
        this.load.image('cloud-2', 'assets/cloud-2.png');
    }

    create(data) {
        let audio = this.sound.add('waves');
        if (!audio.isPlaying) {
            audio.play({ loop: true });
        }

        this.bg = this.add.image(0, 0, 'bg').setOrigin(0);
        this.cloud1 = this.add.image(300, 0, 'cloud-1').setOrigin(0);
        this.cloud2 = this.add.image(150, 0, 'cloud-2').setOrigin(0);

        this.cloud1reflection = this.add.image(300, 130, 'cloud-1').setOrigin(0).setScale(1, -1);
        this.cloud1reflection.tint = 0x5555ff;

        this.cloud1.cloudSpeed = Phaser.Math.FloatBetween(.2, .5);
        this.cloud2.cloudSpeed = Phaser.Math.FloatBetween(.2, .5);

        // button
        let startButton = new TextButton(this, 180, 100, 'START', null, () => {
            this.scene.start('BeachScene', {
                cloud1x: this.cloud1.x, cloud2x: this.cloud2.x,
                cloud1speed: this.cloud1.cloudSpeed,
                cloud2speed: this.cloud2.cloudSpeed
            });
        });

        this.add.existing(startButton);
    }

    update(time, delta) {
        this.moveCloud(this.cloud1, this.cloud1reflection);
        // this.moveCloud(this.cloud1);
        this.moveCloud(this.cloud2);
    }

    moveCloud(cloud, reflection) {
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

}