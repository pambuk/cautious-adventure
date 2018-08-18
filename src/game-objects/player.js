export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.cameraScroll = scene.cameraScroll;
        scene.physics.add.existing(this);
        this.body.setSize(5, 5);
        this.playerSpeed = 2;
        this.stamina = 10;
        this.animationKey = 'walk';
        this.staminaDisplay = scene.add.text(45, 10 + scene.cameraScroll, this.getStaminaForDisplay(this.stamina), { fontSize: '10px' });

        this.createEmitters(scene);
        this.createAnimations(scene);

        scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.keys.shift.isDown && this.stamina > 0) {
                    this.setStamina(this.stamina - 1);
                } else if (!this.keys.shift.isDown && this.stamina < 10) {
                    this.setStamina(this.stamina + .5);
                }
            },
            repeat: -1
        });
    }

    update(keys, time, delta) {
        this.keys = keys;

        // @todo would it make more sense to introduce states, like 'in-water', 'on-land'?

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
        scene.textures.generate('sand', { data: ['6'], pixelWidth: 1, pixelHeight: 1 });
        this.sandEmitter = scene.add.particles('sand').createEmitter({
            speed: 10,
            maxParticles: 70,
            y: 6, x: -1,
            lifespan: 300
        });

        this.sandEmitter.startFollow(this);
    }

    createAnimations(scene) {
        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNames('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'player-idle',
            frames: scene.anims.generateFrameNames('player-idle', { start: 0, end: 5 }),
            frameRate: 2,
            repeat: -1
        });

        scene.anims.create({
            key: 'swim',
            frames: scene.anims.generateFrameNames('player-swim', { start: 0, end: 3 }),
            frameRate: 9,
            repeat: -1
        });
    }

    getStaminaForDisplay(stamina) {
        return '.'.repeat(stamina);
    }

    setStamina(current) {
        this.stamina = current;
        this.staminaDisplay.setText(this.getStaminaForDisplay(this.stamina));
    }
}