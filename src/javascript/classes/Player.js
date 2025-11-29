const X_VELOCITY = 150;
const Y_VELOCITY = 150;

class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.velocity = velocity;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };

    this.image = new Image();
    this.imageLoaded = false;
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = "./images/princess.png";

    this.currentFrame = 0;
    this.elapsedTime = 0;

    this.sprites = {
      walkDown: {
        positionX: 0,
        positionY: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkUp: {
        positionX: 16,
        positionY: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkLeft: {
        positionX: 32,
        positionY: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkRight: {
        positionX: 48,
        positionY: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
    };

    this.currentSprite = this.sprites.walkDown;
    this.isInvincible = false;
    this.elapsedInvincibilityTime = 0;
    this.invincibilityInterval = 0.8;
  }

  receiveHit() {
    if (this.isInvincible) return;

    this.isInvincible = true;
  }

  draw(c) {
    if (!this.imageLoaded) return;

    // Draw player image when loaded
    c.drawImage(
      this.image,
      this.currentSprite.positionX,
      this.currentSprite.height * this.currentFrame,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;

    this.elapsedTime += deltaTime;

    if (this.isInvincible) {
      this.elapsedInvincibilityTime += deltaTime;

      if (this.elapsedInvincibilityTime >= this.invincibilityInterval) {
        this.isInvincible = false;
        this.elapsedInvincibilityTime = 0;
      }
    }

    const frameDuration = 0.15; // Duration for each frame in seconds

    if (this.elapsedTime > frameDuration) {
      // Update animation frame
      this.currentFrame =
        (this.currentFrame + 1) % this.currentSprite.frameCount;
      this.elapsedTime -= frameDuration;
    }

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);

    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime;
  }

  handleInput(keys) {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.currentSprite.frameCount = 4;

    if (keys.d.pressed) {
      this.currentSprite = this.sprites.walkRight;
      this.velocity.x = X_VELOCITY;
    } else if (keys.a.pressed) {
      this.currentSprite = this.sprites.walkLeft;
      this.velocity.x = -X_VELOCITY;
    } else if (keys.w.pressed) {
      this.currentSprite = this.sprites.walkUp;
      this.velocity.y = -Y_VELOCITY;
    } else if (keys.s.pressed) {
      this.currentSprite = this.sprites.walkDown;
      this.velocity.y = Y_VELOCITY;
    } else {
      this.currentSprite.frameCount = 1;
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // Check if a collision exists on all axes
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer;
          break;
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer;

          break;
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // If a collision exists
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y + collisionBlock.height + buffer;
          break;
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y - this.height - buffer;
          break;
        }
      }
    }
  }
}
