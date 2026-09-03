class piece {
    constructor(scene, x, y) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        const shapes = [
            // Square
            [
                [0, 0],
                [1, 0],
                [0, 1],
                [1, 1]
            ],

            // Vertical
            [
                [0, 0],
                [0, 1],
                [0, 2]
            ],

            // long L 1
            [
                [0, 0],
                [0, 1],
                [0, 2],
                [1, 0]
            ],

            // long L 2
            [
                [0, 0],
                [1, 1],
                [1, 2],
                [1, 0]
            ],

            // Horizontal
            [
                [0, 0],
                [1, 0],
                [2, 0]
            ],

            // L
            [
                [0, 0],
                [1, 0],
                [0, 1]
            ],

            // T
            [
                [1, 0],
                [0, 1],
                [1, 1],
                [2, 1]
            ]
        ];

        const shape = Phaser.Utils.Array.GetRandom(shapes);

        this.blocks = [];

        for (const position of shape) {
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
}