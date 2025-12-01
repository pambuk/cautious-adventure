export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)

    this.cameraScroll = scene.cameraScroll
    scene.physics.add.existing(this)
    this.body.setSize(5, 5)
    this.playerSpeed = 2
    this.stamina = 5
    this.animationKey = "walk"

    // Field of view properties
    this.facingDirection = { x: 0, y: -1 } // Default facing up
    this.fovAngle = 120 // Field of view angle in degrees
    this.fovDistance = 150 // Maximum view distance in pixels

    this.createEmitters(scene)

    scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.keys.shift.isDown && this.stamina > 0) {
          this.setStamina(this.stamina - 0.5)
        } else if (!this.keys.shift.isDown && this.stamina < 5) {
          this.setStamina(this.stamina + 0.2)
        }
      },
      repeat: -1,
    })
  }

  update(keys, time, delta) {
    this.keys = keys

    if (this.y < 195 + this.cameraScroll) {
      this.animationKey = "swim"
    } else {
      this.animationKey = "walk"
    }

    // Track movement for facing direction
    let moved = false
    let moveX = 0
    let moveY = 0

    if (keys.left.isDown) {
      this.x -= this.playerSpeed
      this.flipX = true
      this.anims.play(this.animationKey, true)
      moveX = -1
      moved = true
    } else if (keys.right.isDown) {
      this.x += this.playerSpeed
      this.flipX = false
      this.anims.play(this.animationKey, true)
      moveX = 1
      moved = true
    }

    if (keys.up.isDown) {
      this.y -= this.playerSpeed
      this.anims.play(this.animationKey, true)
      moveY = -1
      moved = true
    } else if (keys.down.isDown) {
      this.y += this.playerSpeed
      this.anims.play(this.animationKey, true)
      moveY = 1
      moved = true
    }

    // Update facing direction based on movement
    if (moved) {
      // Normalize the direction vector
      const length = Math.sqrt(moveX * moveX + moveY * moveY)
      if (length > 0) {
        this.facingDirection.x = moveX / length
        this.facingDirection.y = moveY / length
      }
    }

    if (
      !keys.left.isDown &&
      !keys.right.isDown &&
      !keys.up.isDown &&
      !keys.down.isDown
    ) {
      if (this.animationKey === "walk") {
        this.anims.play("player-idle", true)
        this.sandEmitter.stop()
      }
    }

    if (keys.shift.isDown && this.stamina > 0) {
      this.playerSpeed = 2.5 * ((delta * 30) / 1000)

      if (this.animationKey === "walk") {
        this.sandEmitter.emitParticle()
      }
    } else {
      this.playerSpeed = 2 * ((delta * 30) / 1000)
    }
  }

  createEmitters(scene) {
    this.sandEmitter = scene.add.particles("sand").createEmitter({
      speed: 10,
      maxParticles: 70,
      lifespan: 300,
    })

    this.sandEmitter.startFollow(this, -1, 6)
  }

  setStamina(current) {
    if (current < 0) {
      current = 0
    } else if (current > 5) {
      current = 5
    }

    this.stamina = current
    this.scene.displayStamina()
  }

  /**
   * Check if a target position is within the player's field of view
   * @param {number} targetX - X coordinate of the target
   * @param {number} targetY - Y coordinate of the target
   * @returns {boolean} - True if target is visible in FOV
   */
  isInFieldOfView(targetX, targetY) {
    // Calculate vector from player to target
    const toTargetX = targetX - this.x
    const toTargetY = targetY - this.y

    // Calculate distance to target
    const distance = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY)

    // Check if target is within view distance
    if (distance > this.fovDistance) {
      return false
    }

    // If target is very close (within 30 pixels), always visible
    if (distance < 30) {
      return true
    }

    // Normalize the toTarget vector
    const toTargetNormX = toTargetX / distance
    const toTargetNormY = toTargetY / distance

    // Calculate dot product between facing direction and direction to target
    const dotProduct = this.facingDirection.x * toTargetNormX + this.facingDirection.y * toTargetNormY

    // Convert FOV angle to radians and calculate the minimum dot product for the cone
    const halfFovRadians = (this.fovAngle / 2) * (Math.PI / 180)
    const minDotProduct = Math.cos(halfFovRadians)

    // Target is visible if it's within the FOV cone
    return dotProduct >= minDotProduct
  }
}
