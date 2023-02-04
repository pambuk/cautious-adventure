export class SmartVisitor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.physics.add.existing(this);
        this.cameraScroll = scene.cameraScroll;

        // states: resting, walking, swimming, drowning, returning
        this.state = 'resting';
        this.saveBounty = 0;
        this.bounty = this.saveBounty;
        this.origin = { x, y };
        this.chanceToDrown = 0.003;
        this.speed = .8;
        this.topSpeed = .8;
        this.walkSpeed = .7;
        this.swimSpeed = .5;

        this.canMakeDecisions = false;
        this.targetLocation = {};
        this.blanket = scene.add.image(this.x, this.y, 'blanket');
        this.blanket.setDepth(0);

        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.healthDisplay = this.scene.add.text(-100, -100, '.'.repeat(Math.floor(this.health)));

        let timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.state === 'drowning' && this.health > 0) {
                    this.health -= .5;
                    this.healthDisplay.setText('.'.repeat(Math.floor(this.health)));
                }

                if (this.health === 0) {
                    this.destroy();
                    timer.destroy();
                    scene.deaths++;

                    if (scene.deaths > scene.maxDeaths) {
                        scene.deaths = scene.maxDeaths;
                    }

                    scene.displayDeaths();
                }
            },
            repeat: -1
        });

        // decision timer
        scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.canMakeDecisions) {
                    switch (this.state) {
                        case 'resting':
                            this.speed = this.topSpeed;

                            if (this.percentage(15)) {
                                this.state = 'go-swimming';

                                // pick sea location
                                this.pickSwimmingLocation();
                            }
                            else if (this.percentage(10)) {
                                this.state = 'walking';
                                this.speed = this.walkSpeed;

                                // pick beach location
                                this.pickBeachLocation();
                            }

                            break;
                        case 'swimming':
                            this.speed = this.swimSpeed;

                            if (this.percentage(1)) {
                                this.state = 'drowning';
                            } else if (this.percentage(15)) {
                                this.state = 'go-swimming';
                                this.pickSwimmingLocation(true);
                            } else if (this.percentage(50)) {
                                this.state = 'go-resting';
                                this.returnToBlanket();
                            }

                            break;
                        case 'returning':
                            break;
                        case 'idle':
                            if (this.percentage(15)) {
                                this.state = 'walking';
                                this.pickBeachLocation();
                            } else if (this.percentage(50)) {
                                this.state = 'returning';
                                this.returnToBlanket();
                            }

                            break;
                    }

                }
            },
            repeat: -1
        });
    }

    update(time, delta) {
        this.actOnDecision();

        if (this.state === 'drowning') {
            this.healthDisplay.visible = true;
            this.healthDisplay.x = this.x;
            this.healthDisplay.y = this.y;
            this.targetLocation = {};
        }

        if (this.y < 190 + this.cameraScroll) {
            if (this.state === 'drowning') {
                this.play('visitor-2-drowning-2', true);
            } else {
                this.play('drowning', true);
            }
        } else if (this.state === 'idle') {
            this.play('visitor-idle');

        } else if (this.state !== 'resting') {
            if (this.targetLocation.x > this.x) {
                this.flipX = false;
            } else {
                this.flipX = true;
            }

            this.play('visitor-walk', true);
            if (this.donut) {
                this.donut.destroy();
            }
        } else if (this.state === 'resting') {
            this.play(`visitor-${this.type}-resting`, true);
        }
    }

    pickSwimmingLocation(goNear = false) {
        if (goNear) {
            let dxCandidate = Phaser.Math.Between(-40, 40);
            let dyCandidate = Phaser.Math.Between(-40, 40);

            if (this.x + dxCandidate > 0 && this.x + dxCandidate < 400) {
                this.targetLocation.x = this.x + dxCandidate;
            } else {
                this.targetLocation.x = this.x;
            }

            if (this.y + dyCandidate < 200 + this.cameraScroll && this.y + dyCandidate > this.cameraScroll) {
                this.targetLocation.y = this.y + dyCandidate;
            } else {
                this.targetLocation.y = this.y;
            }
        } else {
            this.targetLocation.x = Phaser.Math.Between(0, 400);
            this.targetLocation.y = Phaser.Math.Between(
                20 + this.scene.cameraScroll, 200 + this.scene.cameraScroll
            );
        }
    }

    pickBeachLocation() {
        this.targetLocation.x = Phaser.Math.Between(0, 400);
        this.targetLocation.y = Phaser.Math.Between(
            200 + this.scene.cameraScroll, 300 + this.scene.cameraScroll
        );
    }

    actOnDecision() {
        if (Object.keys(this.targetLocation).length > 0) {
            this.goTo(this.targetLocation);

            if (
                (this.state === 'go-swimming' || this.state === 'walking') && this.arrived(this.targetLocation)
            ) {
                this.targetLocation = {};
                if (this.state === 'go-swimming') {
                    this.state = 'swimming';
                }

                if (this.state === 'walking') {
                    this.state = 'idle';
                }
            }

            if (this.state === 'returning' && this.arrived(this.targetLocation)) {
                if (this.donut) {
                    this.donut.destroy();
                }
                this.state = 'resting';
                this.targetLocation = {};

                // visitor can go swimming again
                this.canMakeDecisions = true;
                this.bounty = this.saveBounty;
                this.chanceToDrown -= 0.001;

                this.play(`visitor-2-resting`, true);

                if (Math.random() > .5) {
                    this.flipX = true;
                }

                this.health = this.maxHealth;
                this.healthDisplay.setText('.'.repeat(Math.floor(this.health)));
            }

            if (this.state === 'returning' && this.donut) {
                this.donut.y = this.y;
                this.donut.x = this.x;

                this.healthDisplay.visible = false;
            }
        }
    }

    arrived(target) {
        let flooredX = Math.floor(this.x);
        let flooredY = Math.floor(this.y);

        if (
            [flooredX - 1, flooredX, flooredX + 1].includes(Math.floor(target.x)) &&
            [flooredY - 1, flooredY, flooredY + 1].includes(Math.floor(target.y))
        ) {
            return true;
        }

        return false;
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
        if (!isNaN(toPointX) && !isNaN(toPointY)) {
            this.x += toPointX * this.speed;
            this.y += toPointY * this.speed;
        }
    }

    returnToBlanket() {
        this.state = 'returning';
        this.targetLocation = { x: this.blanket.x, y: this.blanket.y };
    }

    percentage(desired) {
        return Phaser.Math.Between(0, 100) < desired;
    }
}