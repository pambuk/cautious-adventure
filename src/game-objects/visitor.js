export class Visitor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.physics.add.existing(this);

        // states: resting, walking, swimming, drowning, returning
        this.state = 'resting';
        this.bounty = 10;
        this.origin = { x, y };

        this.canMakeDecisions = true;
        this.targetLocation = {};

        if (Object.keys(this.targetLocation).length === 0) {
            console.log('empty target');
        }

        // this.graphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xaa00aa } });
    }

    update(time, delta) {
        this.pickTarget();
        this.actOnDecision();

        if (this.y < 200) {
            this.play('drowning', true);
        }
    }

    pickTarget() {
        if (Object.keys(this.targetLocation).length === 0 && this.canMakeDecisions) {
            let dice = Math.random();

            if (dice >= 0 && dice <= 0.003) {
                // take a swim
                // console.log('go swimming');
                this.targetLocation = { x: this.origin.x, y: this.origin.y - this.scene.getRandomIntInclusive(100, 200) };
                this.play('visitor-walk');
                if (this.flipX) {
                    this.flipX = false;
                }
            }
        }
    }

    actOnDecision() {
        if (Object.keys(this.targetLocation).length > 0) {
            this.goTo(this.targetLocation);

            // let line = new Phaser.Geom.Line(this.x, this.y, this.targetLocation.x, this.targetLocation.y);
            // this.graphics.strokeLineShape(line);

            if (this.getBounds().contains(this.targetLocation.x, this.targetLocation.y)) {
                this.targetLocation = {};
                this.canMakeDecisions = false;
                this.state = 'drowning';
            }
        }
    }

    goTo(target) {
        // direction towards target
        let toPointX = target.x - this.x;
        let toPointY = target.y - this.y;

        // normalize
        let toPointLength = Math.sqrt(toPointX * toPointX + toPointY * toPointY);
        toPointX = toPointX / toPointLength;
        toPointY = toPointY / toPointLength;

        // move towards target
        this.x += toPointX * 1;
        this.y += toPointY * 1;
    }
}