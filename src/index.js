import 'phaser';
import { BeachScene } from "./scenes/beach-scene";
import { MenuScene } from './scenes/menu-scene';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scene: [MenuScene, BeachScene],
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