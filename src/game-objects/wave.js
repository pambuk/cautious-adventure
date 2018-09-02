export class Wave extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        console.log('wave created');

        super(scene, x, y, texture);
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.cameraScroll = scene.cameraScroll;
        this.destination = null;
        this.setVisible(false);
        this.setActive(false);
        // start, move, end
        this.state = 'start';
        this.drowny = true;
    }

    start() {
        console.log('wave start');
        this.x = Phaser.Math.Between(0, 400);
        this.y = Phaser.Math.Between(this.cameraScroll - 50, 130 + this.cameraScroll);

        this.setActive(true);
        this.setVisible(true);
        this.play('wave-start');
        this.drowny = true;

        this.destination = {x: this.x, y: this.y + 70};
    }

    update() {
        if (this.destination && Math.floor(this.y) !== this.destination.y) {
            this.y += .8;
            this.play('wave-moving', true);
            this.state = 'moving';

            if (Phaser.Math.Difference(this.y, this.destination.y) < 15) {
                this.play('wave-end');
                this.drowny = false;
            }
        } else if (this.destination && Math.floor(this.y) === this.destination.y) {
            this.state = 'end';
            this.setVisible(false);
            this.setActive(false);
            this.destination = null;
        }
    }
}