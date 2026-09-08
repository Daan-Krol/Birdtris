class bird {
    constructor(scene, x, y) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.direction = 1;

        this.fruitEaten = 0;
        this.ticksSinceProgress = 0;

        this.sprite = scene.add.image(0, 0, "bird");
        this.sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);

        this.updatePosition();
    }

    updatePosition() {
        this.sprite.x =
            GRID_X +
            this.x * CELL_SIZE +
            CELL_SIZE / 2;

        this.sprite.y =
            GRID_Y +
            this.y * CELL_SIZE +
            CELL_SIZE / 2;
    }

    flipDirection() {
        this.direction *= -1;
        this.sprite.setFlipX(this.direction === -1);
    }

    move() {
        if (!this.checkIfFruit()) {
            return;
        }

        // Every tick that doesn't end in eating fruit counts against the
        // bird's "stuck" clock. It's fine for the bird to bounce off walls
        // and revisit tiles while patrolling — this only cares about
        // whether it's actually making progress toward fruit.
        this.ticksSinceProgress++;

        if (this.ticksSinceProgress > bird.STUCK_TICKS) {
            this.destroy();
            return;
        }

        // Fall if there is empty space underneath
        // Check what's underneath the bird
        if (this.y < GRID_HEIGHT - 1) {
            const belowBlock = this.scene.board[this.y + 1][this.x];

            // Fruit underneath → eat it
            if (belowBlock !== null && belowBlock.type === "fruit") {
                belowBlock.eat();
                this.scene.board[this.y + 1][this.x] = null;

                this.fruitEaten++;
                this.scene.addScore(200);
                this.scene.scoreText.setText("Score: " + this.scene.score);

                this.y++;
                this.updatePosition();
                return;
            }

            // Empty space underneath → fall
            if (belowBlock === null) {
                this.y++;
                this.updatePosition();
                return;
            }
        }

        // Try to move horizontally
        const nextX = this.x + this.direction;

        // Wall → turn around
        if (nextX < 0 || nextX >= GRID_WIDTH) {
            this.flipDirection()

            return;
        }
        
        // Check what's next to the bird
        const nextBlock = this.scene.board[this.y][nextX];

        if (nextBlock !== null) {
            if (nextBlock.type === "fruit") {
                nextBlock.eat();
                this.scene.board[this.y][nextX] = null;
                this.scene.delayGravityAbove(nextX, this.y);

                this.fruitEaten++;
                this.ticksSinceProgress = 0;
                this.scene.addScore(200);
                this.scene.scoreText.setText("Score: " + this.scene.score);

                this.x = nextX;
                this.updatePosition();
                return;
            }

            // Normal block → turn around
            this.flipDirection();

            const otherX = this.x + this.direction;

            if (otherX < 0 || otherX >= GRID_WIDTH) {
                this.destroy();
                return;
            }

            const otherBlock = this.scene.board[this.y][otherX];

            if (otherBlock !== null) {
                if (otherBlock.type === "fruit") {
                    otherBlock.eat();
                    this.scene.board[this.y][otherX] = null;
                    this.scene.delayGravityAbove(otherX, this.y);

                    this.fruitEaten++;
                    this.ticksSinceProgress = 0;
                    this.scene.addScore(200);
                    this.scene.scoreText.setText("Score: " + this.scene.score);

                    this.x = otherX;
                    this.updatePosition();
                    return;
                }

                this.destroy();
            }

            return;
        }

        this.x = nextX;
        this.updatePosition();
    }

    checkIfFruit() {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const block = this.scene.board[y][x];

                if (block !== null && block.type === "fruit") {
                    return true;
                }
            }
        }

        this.destroy();
        return false;
    }

    destroy() {
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.5,
            duration: 250,
            yoyo: true,
            onComplete: () => {
                this.sprite.destroy();
                const index = this.scene.birds.indexOf(this);
                if (index !== -1) {
                    this.scene.birds.splice(index, 1);
                }
            }
        });
    }

}

// How many ticks a bird can go without eating fruit before it's considered
// stuck and disappears. At TICK_RATE = 2 (game.js), 20 ticks is 10 seconds.
bird.STUCK_TICKS = 15;