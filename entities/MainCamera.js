class MainCamera{
    /**
     * @param {Number} width display width, in pixels
     * @param {Number} height display height, in pixels
     */
    constructor(p){
        this.startPos = new Vector(0, 0);
        this.endPos = new Vector(0, 150);
        this.offset;
        this.offsetMagnitude = 60;

        this.position = this.targetPos;
        this.p = p;
        
        this.speedMult = 1;
        // Speed in a getter

        this.isFrozen = false;
        this.freezeTarget;

        this.name = 'mainCamera';

        this.shakeVector = new Vector(0.01, 0);
        this.shakeMultiplier = 1;
        this.maxShakeMagnitude = 5;
        this.updateShake();
    }

    update(){
        this.freezeTarget = null;
        if(this.isFrozen) return;

        //let hitStopMultiplier = (time.hitStopMultiplier + 1)/2;
        let hitStopMultiplier = 1;

        this.position = this.position.lerp(this.targetPos, this.speed * time.deltaTime / hitStopMultiplier);

        this.position = this.position.add(this.shakeVector);

        this.keepPlayerOnScreen();
    }

    keepPlayerOnScreen(){
        if(this.player.position.y - this.position.y > this.height/2 - 5)
            this.position.y = this.player.position.y - this.height/2 + 5;
        if(this.player.position.y - this.position.y < -this.height/2 + 5)
            this.position.y = this.player.position.y + this.height/2 - 5;
        if(this.player.position.x - this.position.x > this.width/2 - 5)
            this.position.x = this.player.position.x - this.width/2 + 5;
        if(this.player.position.x - this.position.x < -this.width/2 + 5)
            this.position.x = this.player.position.x + this.width/2 - 5;
    }

    updateImage(){
        // Nothing!
    }

    freeze(){
        this.isFrozen = true;
        if(this.freezeTarget)  this.position = this.freezeTarget.position.add(this.position).divide(2);
    }

    unfreeze(){
        this.isFrozen = false;
        this.speedMult = 1/2;
        time.delayedFunction(this, 'returnToNormalSpeed', 0.5);
    }

    returnToNormalSpeed(){
        this.speedMult = 1;
    }

    get pixelPosition(){
        return this.position.multiply(pixelSize);
    }

    setOffset(){
        if(this.player.direction == 'right'){
            if(this.player.diagonal == true) { return new Vector(1, -1); }
            else{ return new Vector(1, 0); }
        }
        else if(this.player.direction == 'up'){
            if(this.player.diagonal == true) { return new Vector(1, 1); }
            else{ return new Vector(0, 1); }
        }
        else if(this.player.direction == 'left'){
            if(this.player.diagonal == true) { return new Vector(-1, 1); }
            else{ return new Vector(-1, 0); }
        }
        else if(this.player.direction == 'down'){
            if(this.player.diagonal == true) { return new Vector(-1, -1); }
            else{ return new Vector(0, -1); }
        }
        else{ return new Vector(0, 0); }
    }

    get speed(){
        let _speed = 2;

        return _speed * this.speedMult;
    }

    get player(){
        return scene.player;
    }

    get targets(){
        let targetList = [];
        
        targetList.push(this.player.position);

        for(let i of scene.referenceBosses){
            if(i.isMainBoss) targetList.push(i.position);
        }
        
        if (!scene.bossManager.willSpawnAnotherBoss && targetList.length == 1 && this.player.position < 130)
            targetList.push(this.endPos);
        

        return targetList;
    }

    get targetPos(){
        if(this._targetPos) return this._targetPos;

        let sumOfPositions = new Vector(0, 0);
        for(let i of this.targets){
            sumOfPositions = sumOfPositions.add(i);
        }

        let averageTarget = sumOfPositions.divide(this.targets.length);

        if(this.targets.length == 1){
            let offset = this.setOffset();
            offset.magnitude = this.offsetMagnitude * Math.min(this.player.velocity.magnitude / this.player.speed, 1);
            averageTarget = averageTarget.add(offset);
        }

        return averageTarget;
    }

    set targetPos(new_targetPos){
        this._targetPos = new_targetPos;
        this.shakeVector = new Vector(0, 0);
        time.stopFunctions(this, 'updateShake');
    }

    updateShake(){
        if(!this.isFrozen){
            this.shakeVector.magnitude = 0.5 * this.shakeVector.magnitude;
            this.shakeVector.angle += 0.6;
        }
        time.delayedFunction(this, 'updateShake', 1/20);
    }

    createShake(magnitude = 1){
        this.shakeVector.magnitude = Math.min(
            this.shakeVector.magnitude + magnitude*this.shakeMultiplier, 
            this.maxShakeMagnitude
        );
        this.shakeVector.angle = randRange(0, 2*Math.PI);
    }

    get width(){
        return this.p.width/pixelSize;
    }
    get height(){
        return this.p.height/pixelSize;
    }

    get topEdge(){
        return this.position.y + this.p.height / 2 / pixelSize;
    }
    get leftEdge(){
        return this.position.x - this.p.width / 2 / pixelSize;
    }
    get rightEdge(){
        return this.position.x + (this.p.width / 2 - (this.p.width - this.width*pixelSize)) / pixelSize;
    }
    get bottomEdge(){
        return this.position.y - (this.p.height / 2 + (this.p.height - this.height*pixelSize)) / pixelSize;
    }

    isOffScreen(image, x, y){
        return !(
            x < this.width*pixelSize + image.width/4 && 
            x > -image.width/4*pixelSize && 
            y < this.height*pixelSize + image.height/4 && 
            y > -image.height/4*pixelSize
        );
    }
}