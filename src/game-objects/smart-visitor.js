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
        this.z = 1;
        this.chanceToDrown = 0.003;

        this.canMakeDecisions = false;
        this.targetLocation = {};
        this.blanket = scene.add.image(this.x, this.y, 'blanket');

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

                    scene.deathsDisplay.setText(scene.deaths);
                }
            },
            repeat: -1
        });

        // decision timer
        // this.inProgress = false;
        scene.time.addEvent({
            delay: 1000,
            callback: () => {
                // if (this.canMakeDecisions && false === this.inProgress) {
                if (this.canMakeDecisions) {
                    switch (this.state) {
                        case 'resting':
                            console.log('case: resting');
                            if (this.percentage(20)) {
                                console.log('resting -> go swimming, 20%');

                                this.state = 'go-swimming';

                                // pick sea location
                                this.pickSwimmingLocation();
                            }
                            // else if (this.percentage(20)) {
                            //     console.log('resting -> go for a walk, 20%');
                            //     this.state = 'walking';
                            //     // pick beach location
                            // this.pickBeachLocation();
                            // }

                            break;
                        case 'swimming':
                            console.log('case: swimming');
                            if (this.percentage(50)) {
                                this.state = 'go-swimming';
                                this.pickSwimmingLocation(true);
                            } else {
                                this.state = 'go-resting';
                                this.returnToShore();
                            }

                            break;
                    }

                }
            },
            repeat: -1
        });
    }

    pickSwimmingLocation(goNear = false) {
        if (goNear) {
            let dxCandidate = Phaser.Math.Between(-40, 40);
            let dyCandidate = Phaser.Math.Between(-40, 40);

            if (this.x + dxCandidate > 0 && this.x + dxCandidate < 400) {
                this.targetLocation.x = this.x + dxCandidate;
            }

            if (this.y + dyCandidate < 200 + this.cameraScroll && this.y + dyCandidate > this.cameraScroll) {
                this.targetLocation.y = this.y + dyCandidate;
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

    update(time, delta) {
        // this.pickTarget();
        this.actOnDecision();

        if (this.y < 195 + this.cameraScroll) {
            if (this.state === 'drowning') {
                this.play('visitor-2-drowning-2', true);
            } else {
                this.play('drowning', true);
            }
        } else if (this.state !== 'resting') {
            this.play('visitor-walk', true);
            if (this.donut) {
                this.donut.destroy();
            }
        } else if (this.state === 'resting') {
            this.play(`visitor-${this.type}-resting`, true);
        }
    }

    // pickTarget() {
    //     if (Object.keys(this.targetLocation).length === 0 && this.canMakeDecisions) {
    //         let dice = Math.random();

    //         if (dice >= 0 && dice <= this.chanceToDrown) {
    //             // take a swim
    //             this.targetLocation = {
    //                 x: this.origin.x + Phaser.Math.Between(-30, 30),
    //                 y: this.origin.y - Phaser.Math.Between(100, 200)
    //             };
    //             this.play('visitor-walk');
    //             this.state = 'walking';
    //             if (this.flipX) {
    //                 this.flipX = false;
    //             }
    //         }
    //     }
    // }

    actOnDecision() {
        if (Object.keys(this.targetLocation).length > 0) {
            // console.log('actOnDecision, goTo', this.targetLocation);

            this.goTo(this.targetLocation);

            if (
                (this.state === 'go-swimming' || this.state === 'go-walking') && this.arrived(this.targetLocation)
            ) {
                console.log('aod if, first');

                this.targetLocation = {};
                // this.canMakeDecisions = false;
                if (this.state === 'go-swimming') {
                    this.state = 'swimming';
                }
                // this.healthDisplay.visible = true;
                // this.healthDisplay.x = this.x;
                // this.healthDisplay.y = this.y;
            }

            if (this.state === 'returning' && this.arrived(this.targetLocation)) {

                console.log('aod if, second');

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
                console.log('aod if, third');

                this.donut.y = this.y;
                this.donut.x = this.x;

                this.healthDisplay.visible = false;
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
        // this.targetLocation = { x: this.blanket.x, y: this.blanket.y + 8 };
        this.targetLocation = { x: this.blanket.x, y: this.blanket.y + 8 };
    }

    percentage(desired) {
        return Phaser.Math.Between(0, 100) < desired;
    }
}