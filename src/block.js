class block {
    constructor(scene, x, y) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.gravityDelay = 0;

        this.locked = false;

        this.type = block.randomType();

        const color = block.COLORS[this.type];

        this.sprite = scene.add.rectangle(
            0,
            0,
            CELL_SIZE,
            CELL_SIZE,
            color
        );

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

    moveDown() {
        this.y++;
        this.updatePosition();
    }

    lock() {
        this.locked = true;
        this.sprite.setAlpha(0.8);
    }

    destroy() {
        this.sprite.destroy();
    }

}


block.BIRD_CUTOFF = 0.1;   // 0.1 - 0        = 10% bird
block.FRUIT_CUTOFF = 0.35;  // 0.35 - 0.1     = 25% fruit
block.LEAF_CUTOFF = 0.999; // 0.999 - 0.35   = 64.9% leaf

block.COLORS = {
    bird: 0xffffff,
    fruit: 0xff5555,
    leaf: 0x55aa55,
    log: 0x8b5a2b
};

block.randomType = function () {
    const random = Math.random();

    if (random < block.BIRD_CUTOFF) {
        return "bird";
    }

    if (random < block.FRUIT_CUTOFF) {
        return "fruit";
    }

    if (random < block.LEAF_CUTOFF) {
        return "leaf";
    }

    return "log";
};