const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const CELL_SIZE = 48;

const GRID_WIDTH = 8;
const GRID_HEIGHT = 12;

const GRID_PIXEL_WIDTH = GRID_WIDTH * CELL_SIZE;
const GRID_PIXEL_HEIGHT = GRID_HEIGHT * CELL_SIZE;

const GRID_X = (GAME_WIDTH - GRID_PIXEL_WIDTH) / 2;
const GRID_Y = (GAME_HEIGHT - GRID_PIXEL_HEIGHT) / 2;

const TICK_RATE = 1;
const TICK_DELAY = 1000 / TICK_RATE;


class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.board = [];

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
    }

    spawnBlock() {
        const spawnX = 3;
        const spawnY = 0;

        if (this.board[spawnY][spawnX] !== null) {
            console.log("GAME OVER");
            this.scene.restart()
            return;
        }

        this.piece = new piece(this, spawnX, spawnY);
    }
    

    moveBlockDown() {
        let canMove = true;

        for (const block of this.piece.blocks) {
            const nextY = block.y + 1;

            if (nextY >= GRID_HEIGHT) {
                canMove = false;
                break;
            }

            if (this.board[nextY][block.x] !== null) {
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

            if (this.board[block.y][nextX] !== null) {
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
            this.board[block.y][block.x] = block;
        }

        this.checkLines();
        this.spawnBlock();
    }

    checkLines() {
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
            }
        }
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

        this.checkLines();
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