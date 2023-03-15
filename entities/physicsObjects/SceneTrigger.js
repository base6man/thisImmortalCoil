class SceneTrigger extends PhysicsObject{
    constructor(x1, y1, x2, y2, functionName){
        let x = (x1 + x2)/2;
        let y = (y1 + y2)/2;
        super(new Vector(x, y));

        this.width = Math.abs(x2 - x1);
        this.height = Math.abs(y2 - y1);

        this.collider = new BoxCollider(this, this.width, this.height);
        this.collider.static = true;
        this.collider.isTrigger = true;
        this.collider.layer = 'sceneTrigger';
        
        scene.sceneTriggers.push(this);

        this.functionName = functionName;
    }

    onTriggerCollision(other){
        console.log(this.functionName);
        time.delayedFunction(scene, this.functionName, 0);
        this.delete();
    }
    
    delete(){
        let myIndex = scene.sceneTriggers.indexOf(this);
        scene.sceneTriggers.splice(myIndex, 1);
        this.collider.delete();
        time.stopFunctions(this, null);
    }
}