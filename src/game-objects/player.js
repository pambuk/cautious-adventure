export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.cameraScroll = scene.cameraScroll;
        scene.physics.add.existing(this);
        this.body.setSize(5, 5);
        this.playerSpeed = 2;
        this.stamina = 5;
        this.animationKey = 'walk';
        this.createEmitters(scene);

        scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.keys.shift.isDown && this.stamina > 0) {
                    this.setStamina(this.stamina - .5);
                } else if (!this.keys.shift.isDown && this.stamina < 5) {
                    this.setStamina(this.stamina + .2);
                }
            },
            repeat: -1
        });
    }

    update(keys, time, delta) {
        this.keys = keys;

        if (this.y < 195 + this.cameraScroll) {
            this.animationKey = 'swim';
        } else {
            this.animationKey = 'walk';
        }

        if (keys.left.isDown) {
            this.x -= this.playerSpeed;
            this.flipX = true;
            this.anims.play(this.animationKey, true);
        } else if (keys.right.isDown) {
            this.x += this.playerSpeed;
            this.flipX = false;
            this.anims.play(this.animationKey, true);
        }

        if (keys.up.isDown) {
            this.y -= this.playerSpeed;
            this.anims.play(this.animationKey, true);
        } else if (keys.down.isDown) {
            this.y += this.playerSpeed;
            this.anims.play(this.animationKey, true);
        }

        if (!keys.left.isDown && !keys.right.isDown && !keys.up.isDown && !keys.down.isDown) {
            if (this.animationKey === 'walk') {
                this.anims.play('player-idle', true);
                this.sandEmitter.stop();
            }
        }

        if (keys.shift.isDown && this.stamina > 0) {
            this.playerSpeed = 2.5 * ((delta * 30) / 1000);

            if (this.animationKey === 'walk') {
                this.sandEmitter.emitParticle();
            }
        } else {
            this.playerSpeed = 2 * ((delta * 30) / 1000);
        }
    }

    createEmitters(scene) {
        this.sandEmitter = scene.add.particles('sand').createEmitter({
            speed: 10,
            maxParticles: 70,
            y: 6, x: -1,
            lifespan: 300
        });

        this.sandEmitter.startFollow(this);
    }

    setStamina(current) {
        if (current < 0) {
            current = 0;
        } else if (current > 5) {
            current = 5;
        }

        this.stamina = current;
        this.scene.displayStamina();
    }
}