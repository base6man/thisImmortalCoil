class Wall extends PhysicsObject{
    /**
     * 
     * @param {Vector} firstCorner One corner of the rectangle, representing 2 edges
     * @param {Vector} secondCorner The opposite corner, representing the other 2 edges
     */
    constructor(x1, y1, x2, y2, p){
        let x = (x1 + x2)/2;
        let y = (y1 + y2)/2;
        super(new Vector(x, y));

        this.width = Math.abs(x2 - x1);
        this.height = Math.abs(y2 - y1);

        this.collider = new BoxCollider(this, this.width, this.height);
        this.collider.static = true;
        this.collider.layer = 'wall';

        this.canvas = new Canvas(null, p, this.width, this.height);
        this.canvas.name = 'wall';
        if(!isFirstFrame) this.canvas.setup();

        this.index = scene.walls.length;
        scene.walls.push(this);
    }

    resetAndSetupImage(){
        this.canvas.reset();
        this.canvas.setup();
    }

    updateImage(){
        this.canvas.draw(this.position.x, this.position.y);
    }

    delete(){
        scene.walls.splice(this.index, 1);
        this.collider.delete();
        time.stopFunctions(this, null);
        for(let i = this.index; i < scene.walls.length; i++){
          scene.walls[i].moveDownOneIndex();
        }

        for(let i in scene.walls){
            console.assert(scene.walls[i].index == i);
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}