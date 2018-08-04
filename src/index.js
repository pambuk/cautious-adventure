import 'phaser';
// import {SimpleScene} from './scenes/simple-scene';
import {BeachScene} from "./scenes/beach-scene";

const config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    scene: BeachScene,
    zoom: 2,
    render: {
        pixelArt: true,
    }
};

new Phaser.Game(config);