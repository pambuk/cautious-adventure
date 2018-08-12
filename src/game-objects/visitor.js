export class Visitor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.physics.add.existing(this);

        // states: resting, walking, swimming, drowning, returning
        this.state = 'resting';
        this.bounty = 10;
        this.origin = { x, y };
        this.z = 1;
        this.chanceToDrown = 0.003;

        this.canMakeDecisions = true;
        this.targetLocation = {};
        // this.graphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xaa00aa } });
        this.blanket = scene.add.image(this.x, this.y, 'blanket');
    }

    update(time, delta) {
        this.pickTarget();
        this.actOnDecision();

        if (this.y < 200) {
            this.play('drowning', true);
        } else if (this.state !== 'resting') {
            this.play('visitor-walk', true);
            if (this.donut) {
                this.donut.destroy();
            }
        } else if (this.state === 'resting') {
            this.play(`visitor-${this.type}-resting`, true);
        }
    }

    pickTarget() {
        if (Object.keys(this.targetLocation).length === 0 && this.canMakeDecisions) {
            let dice = Math.random();

            if (dice >= 0 && dice <= this.chanceToDrown) {
                // take a swim
                this.targetLocation = {
                    x: this.origin.x + Phaser.Math.Between(-30, 30), 
                    y: this.origin.y - Phaser.Math.Between(100, 200)
                };
                this.play('visitor-walk');
                this.state = 'walking';
                if (this.flipX) {
                    this.flipX = false;
                }
            }
        }
    }

    actOnDecision() {
        if (Object.keys(this.targetLocation).length > 0) {
            this.goTo(this.targetLocation);

            if (this.state === 'walking' && this.arrived(this.targetLocation)) {
                this.targetLocation = {};
                this.canMakeDecisions = false;
                this.state = 'drowning';
            }

            if (this.state === 'returning' && this.arrived(this.targetLocation)) {
                this.donut.destroy();
                this.state = 'resting';
                this.targetLocation = {};

                // visitor can go swimming again
                this.canMakeDecisions = true;
                this.bounty = 10;
                this.chanceToDrown -= 0.001;

                this.play(`visitor-2-resting`, true);
            }

            if (this.state === 'returning' && this.donut) {
                this.donut.y = this.y;
                this.donut.x = this.x;
            }
        }
    }

    arrived(target) {
        return this.getBounds().contains(target.x, target.y);
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

    returnToShore() {
        this.state = 'returning';
        // this.targetLocation = this.origin;
        this.targetLocation = { x: this.blanket.x, y: this.blanket.y + 8 };
    }
}