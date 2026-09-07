class piece {
    constructor(scene, x, y) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        const shapes = [
            // Square
            {
                blocks: [
                    [0, 0],
                    [1, 0],
                    [0, 1],
                    [1, 1]
                ],
                pivot: [0.5, 0.5]
            },

            // Vertical
            {
                blocks: [
                    [0, 0],
                    [0, 1],
                    [0, 2]
                ],
                pivot: [0, 1]
            },

            // Long L 1
            {
                blocks: [
                    [0, 0],
                    [0, 1],
                    [0, 2],
                    [1, 0]
                ],
                pivot: [0, 1]
            },

            // Long L 2
            {
                blocks: [
                    [0, 0],
                    [1, 1],
                    [1, 2],
                    [1, 0]
                ],
                pivot: [1, 1]
            },

            // Horizontal
            {
                blocks: [
                    [0, 0],
                    [1, 0],
                    [2, 0]
                ],
                pivot: [1, 0]
            },

            // L
            {
                blocks: [
                    [0, 0],
                    [1, 0],
                    [0, 1]
                ],
                pivot: [0, 0]
            },

            // T
            {
                blocks: [
                    [1, 0],
                    [0, 1],
                    [1, 1],
                    [2, 1]
                ],
                pivot: [1, 1]
            }
        ];

        const shape = Phaser.Utils.Array.GetRandom(shapes);

        this.pivotX = shape.pivot[0];
        this.pivotY = shape.pivot[1];

        this.blocks = [];

        for (const position of shape.blocks) {
            const blockX = x + position[0];
            const blockY = y + position[1];

            this.blocks.push(
                new block(scene, blockX, blockY)
            );
        }
    }

    moveDown() {
        this.y++;

        for (const block of this.blocks) {
            block.y++;
            block.updatePosition();
        }
    }

    rotate(scene) {
        const newPositions = [];

        for (const block of this.blocks) {
            const relativeX = block.x - (this.x + this.pivotX);
            const relativeY = block.y - (this.y + this.pivotY);

            const newX = Math.round(this.x + this.pivotX - relativeY);
            const newY = Math.round(this.y + this.pivotY + relativeX);

            newPositions.push([newX, newY]);
        }

        for (const position of newPositions) {
            const x = position[0];
            const y = position[1];

            if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
                return;
            }

            if (scene.isOccupied(x, y)) {
                return;
            }
        }

        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].x = newPositions[i][0];
            this.blocks[i].y = newPositions[i][1];
            this.blocks[i].updatePosition();
        }
    }

}