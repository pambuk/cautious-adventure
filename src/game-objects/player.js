export class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.body.setSize(5, 5);
        this.playerSpeed = 2;
        this.stamina = 10;
        // this.staminaDisplay =

        this.createEmitters(scene);

        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNames('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNames('player', { start: 0 }),
            frameRate: 0
        });
    }

    update(keys, time, delta) {

        if (keys.left.isDown) {
            this.x -= this.playerSpeed;
            this.flipX = true;
            this.anims.play('walk', true);
        } else if (keys.right.isDown) {
            this.x += this.playerSpeed;
            this.flipX = false;
            this.anims.play('walk', true);
        }

        if (keys.up.isDown) {
            this.y -= this.playerSpeed;
            this.anims.play('walk', true);
        } else if (keys.down.isDown) {
            this.y += this.playerSpeed;
            this.anims.play('walk', true);
        }

        if (!keys.left.isDown && !keys.right.isDown && !keys.up.isDown && !keys.down.isDown) {
            this.anims.play('idle');
            this.sandEmitter.stop();
        }

        if (keys.shift.isDown) {
            this.playerSpeed = 2.5 * ((delta * 30) / 1000);
            this.sandEmitter.emitParticle();
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
}