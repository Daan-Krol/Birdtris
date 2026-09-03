class block {
    constructor(scene, x, y) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.locked = false;

        this.type = Math.random() < 0.66 ? "leaf" : "log";

        const color = this.type === "leaf"
            ? 0x55aa55
            : 0x8b5a2b;

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