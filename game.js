const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const CELL_SIZE = 48;

const GRID_WIDTH = 8;
const GRID_HEIGHT = 12;

const GRID_PIXEL_WIDTH = GRID_WIDTH * CELL_SIZE;
const GRID_PIXEL_HEIGHT = GRID_HEIGHT * CELL_SIZE;

const GRID_X = (GAME_WIDTH - GRID_PIXEL_WIDTH) / 2;
const GRID_Y = (GAME_HEIGHT - GRID_PIXEL_HEIGHT) / 2;

const TICK_RATE = 2;
const TICK_DELAY = 1000 / TICK_RATE;


class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        this.score = 0;

        this.scoreText = this.add.text(20, 50, "Score: 0", {
            fontSize: "24px",
            color: "#ffffff"
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.board = [];
        this.birds = [];

        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.board[y] = [];

            for (let x = 0; x < GRID_WIDTH; x++) {
                this.board[y][x] = null;
            }
        }

        this.spawnBlock();

        this.tickCount = 0;

        this.tickText = this.add.text(20, 20, "Tick: 0", {
            fontSize: "24px",
            color: "#ffffff"
        });
        
        this.drawGrid();
        this.startGameTick();
    }

    startGameTick() {
        this.time.addEvent({
            delay: TICK_DELAY,
            callback: this.gameTick,
            callbackScope: this,
            loop: true
        });
    }

    gameTick() {
        this.tickCount++;
        this.tickText.setText("Tick: " + this.tickCount);

        // Copy the array before iterating: a bird's move() can call
        // destroy(), which removes it from this.birds mid-loop.
        for (const activeBird of [...this.birds]) {
            activeBird.move();
        }

        this.gravityStep();

        this.moveBlockDown();
    }

    drawGrid() {
        const graphics = this.add.graphics();

        graphics.lineStyle(1, 0x555555, 1);

        for (let x = 0; x <= GRID_WIDTH; x++) {
            const xPosition = GRID_X + x * CELL_SIZE;

            graphics.lineBetween(
                xPosition,
                GRID_Y,
                xPosition,
                GRID_Y + GRID_PIXEL_HEIGHT
            );
        }

        for (let y = 0; y <= GRID_HEIGHT; y++) {
            const yPosition = GRID_Y + y * CELL_SIZE;

            graphics.lineBetween(
                GRID_X,
                yPosition,
                GRID_X + GRID_PIXEL_WIDTH,
                yPosition
            );
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.moveBlockX(-1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.moveBlockX(1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.moveBlockDown();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.piece.rotate(this);
        }

    }

    spawnBlock() {
        const spawnX = 3;
        const spawnY = 0;

        if (this.board[spawnY][spawnX] !== null) {
            console.log("GAME OVER");
            this.scene.restart();
            return;
        }

        this.piece = new piece(this, spawnX, spawnY);
    }

    // Single source of truth for "is this cell blocked". The bird is NOT
    // stored in this.board — it's only tracked via bird.x/bird.y — so any
    // code that checked this.board[y][x] directly was blind to the bird and
    // would let the falling piece or gravity pass right through it.
    isOccupied(x, y) {
        if (this.board[y][x] !== null) {
            return true;
        }

        return this.birds.some(b => b.x === x && b.y === y);
    }

    // Whenever a board cell that used to hold a locked block becomes empty
    // because of the bird (spawning on top of a stack, or eating a fruit
    // that had a block resting above it), tag the contiguous run of blocks
    // directly above that cell so they get one tick of grace before gravity
    // touches them — same treatment in both cases, not just at spawn.
    // Stops at the first gap, since anything above a gap isn't resting on
    // this column and doesn't need protecting.
    delayGravityAbove(x, y) {
        for (let row = y - 1; row >= 0; row--) {
            const aboveBlock = this.board[row][x];

            if (aboveBlock === null) {
                break;
            }

            aboveBlock.gravityDelay = 1;
        }
    }

    moveBlockDown() {
        let canMove = true;

        for (const block of this.piece.blocks) {
            const nextY = block.y + 1;

            if (nextY >= GRID_HEIGHT) {
                canMove = false;
                break;
            }

            if (this.isOccupied(block.x, nextY)) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.piece.moveDown();
        }
        else {
            this.lockPiece();
        }
    }

    moveBlockX(direction) {
        let canMove = true;

        for (const block of this.piece.blocks) {
            const nextX = block.x + direction;

            if (nextX < 0 || nextX >= GRID_WIDTH) {
                canMove = false;
                break;
            }

            if (this.isOccupied(nextX, block.y)) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.piece.x += direction;

            for (const block of this.piece.blocks) {
                block.x += direction;
                block.updatePosition();
            }
        }
    }

    lockPiece() {
        for (const block of this.piece.blocks) {
            block.lock();

            if (block.type === "bird") {
                this.board[block.y][block.x] = null;
                this.delayGravityAbove(block.x, block.y);

                this.birds.push(new bird(this, block.x, block.y));

                block.destroy();
            }
            else {
                this.board[block.y][block.x] = block;
            }
        }

        let linesCleared = this.checkLines();

        this.settleGravity();

        linesCleared += this.checkLines();

        this.score += this.calculateScore(linesCleared);

        this.scoreText.setText("Score: " + this.score);

        this.spawnBlock();
    }

    checkLines() {
        let linesCleared = 0;

        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            let full = true;

            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.board[y][x] === null) {
                    full = false;
                    break;
                }
            }

            if (full) {
                this.clearLine(y);
                linesCleared++;

                // Check this same row again because the row above
                // has just fallen into it.
                y++;
            }
        }

        return linesCleared;
    }

    clearLine(y) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            this.board[y][x].destroy();
            this.board[y][x] = null;
        }

        for (let row = y - 1; row >= 0; row--) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const block = this.board[row][x];

                if (block !== null) {
                    block.y++;
                    block.updatePosition();
                }

                this.board[row + 1][x] = block;
            }
        }

        for (let x = 0; x < GRID_WIDTH; x++) {
            this.board[0][x] = null;
        }
    }
    
    // Moves every eligible block down by AT MOST one row. Called every game
    // tick to give a gradual, staggered fall instead of an instant snap —
    // this is also what makes the bird's old position visibly hang for a
    // tick before the stack above it drops. Only THIS function consumes
    // gravityDelay (settleGravity() respects it but never decrements it),
    // since delay is meant to count down in real game ticks, not in however
    // many times gravity happens to get resolved around a single lock event.
    gravityStep() {
        for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const block = this.board[y][x];

                if (block === null) {
                    continue;
                }

                if (block.gravityDelay > 0) {
                    block.gravityDelay--;
                    continue;
                }

                if (!this.isOccupied(x, y + 1)) {
                    this.board[y][x] = null;
                    this.board[y + 1][x] = block;

                    block.y++;
                    block.updatePosition();
                }
            }
        }
    }

    // Fully resolves gravity — repeats passes until nothing can fall any
    // further. Used right after a line clear so checkLines() is always
    // looking at a fully-settled board. Still respects gravityDelay, so
    // blocks protecting the bird's gap stay put even during a full settle.
    settleGravity() {
        let moved = true;

        while (moved) {
            moved = false;

            for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const block = this.board[y][x];

                    if (block === null) {
                        continue;
                    }

                    if (block.gravityDelay > 0) {
                        continue;
                    }

                    if (!this.isOccupied(x, y + 1)) {
                        this.board[y][x] = null;
                        this.board[y + 1][x] = block;

                        block.y++;
                        block.updatePosition();

                        moved = true;
                    }
                }
            }
        }
    }

    calculateScore(lines) {
        const SCORE_BY_LINES = {
            1: 100,
            2: 250,
            3: 500,
            4: 800
        };

        return SCORE_BY_LINES[lines] || 0;
    }

}


const config = {
    type: Phaser.AUTO,

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    backgroundColor: "#111111",

    scene: GameScene
};


new Phaser.Game(config);