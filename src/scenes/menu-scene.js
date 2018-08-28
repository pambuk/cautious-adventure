import { TextButton } from "../game-objects/text-button";

export class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('bg', 'assets/background2.png');
        this.load.audio('waves', ['assets/ocean-waves.wav']);
    }

    create(data) {
        let audio = this.sound.add('waves');
        if (!audio.isPlaying) {
            audio.play({ loop: true });
        }

        this.bg = this.add.image(0, 0, 'bg').setOrigin(0);

        // button
        let startButton = new TextButton(this, 180, 100, 'START', null, () => {
            this.scene.start('BeachScene');
        });

        this.add.existing(startButton);
    }

    update(time, delta) {
    }

}