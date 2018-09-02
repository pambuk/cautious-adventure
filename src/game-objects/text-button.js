// export class TextButton extends Phaser.GameObjects.Text {
export class TextButton extends Phaser.GameObjects.BitmapText {
    constructor(scene, x, y, font, text, size, callback) {
        super(scene, x, y, font, text, size);
        this
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                this.enterButtonHoverState();
                callback();
            });
    }

    enterButtonActiveState() {
        this.setStyle({fill: '#0ff'});
    }

    enterButtonHoverState() {
        // this.setStyle({fill: '#ff0'});
        this.setStyle({fill: '#0ff'});
    }

    enterButtonRestState() {
        this.setStyle({fill: '#0f0'});
    }
}