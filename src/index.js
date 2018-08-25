import 'phaser';
import { BeachScene } from "./scenes/beach-scene";

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scene: BeachScene,
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

new Phaser.Game(config);
