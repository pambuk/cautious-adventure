import {TextButton} from "../game-objects/text-button";

export class SimpleScene extends Phaser.Scene {

    create() {

        this.clickCount = 0;
        this.clickCountText = this.add.text(100, 200, '');

        this.incrementButton = new TextButton(this, 100, 100, 'Increment', {fill: '#0f0'}, () => this.incrementClickCount());
        this.add.existing(this.incrementButton);

        this.decrementButton = new TextButton(this, 100, 150, 'Decrement', {fill: '#0f0'}, () => this.decrementClickCount());
        this.add.existing(this.decrementButton);

        this.updateClickCountText();
    }

    incrementClickCount() {
        this.clickCount++;
        this.updateClickCountText();
    }

    decrementClickCount() {
        this.clickCount--;
        this.updateClickCountText();
    }

    updateClickCountText() {
        this.clickCountText.setText(`Button clicked ${this.clickCount} times`);
    }
}