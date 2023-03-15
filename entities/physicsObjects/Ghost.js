class Ghost extends PhysicsObject{
    constructor(startingPosition, startingVelocity, p, doNotControl = false){
        super(startingPosition, startingVelocity);
        this.p = p;

        this.speed = 0;
        this.speed = this.calculateSpeed(0);
        this.friction = 10;

        if(this.ghostType == 1){
            this.velocity = this.input;
            this.velocity.magnitude = Math.max(this.speed, 1);
        }
        
        this.knockbackSpeed = 80;
        this.knockbackTime = 0.2;
        this.knockedBack;
        
        this.doNotControl = doNotControl;

        time.delayedFunction(this, 'createShieldCollider', 0.2);

        this.otherCollider = new BoxCollider(this, 12, 6);
        this.otherCollider.layer = 'ghost';
        
        this.head = new Head(this, playerHeads);
        this.head.offset = new Vector(0, -2.5);

        this.startTime = time.runTime;
    }

    startControlling(){
        this.doNotControl = false;
        this.startTime = time.runTime;
    }

    createShieldCollider(){
        this.collider = new BoxCollider(this, 15, 15);
        this.collider.layer = 'shieldGhost';
    }

    get speedMult(){
        return 1 + ghostSpeedBoost/2.5;
    }

    get transparency(){
        return Math.min(0.1 + (time.runTime - this.startTime)/3, 0.75);
    }

    get animationName(){
        if(this.input.x > 0.5 && this.input.y > 0.5) return 'upRight';
        if(this.input.x < -0.5 && this.input.y > 0.5) return 'upLeft';
        if(this.input.x > 0.5 && this.input.y < -0.5) return 'downRight';
        if(this.input.x < -0.5 && this.input.y < -0.5) return 'downLeft';
        if(this.input.y > 0.5) return 'up';
        if(this.input.x > 0.5) return 'right';
        if(this.input.x < -0.5) return 'left';
        if(this.input.y < -0.5) return 'down';
        return 'idle';
    }

    update(){
        if(!this.p) return;
        
        if(!this.knockedBack) this.velocity = this.updateVelocity();
        super.update();
        this.speed = this.calculateSpeed(time.runTime - this.startTime - 0.3);

        this.head.update();
    }

    updateImage(){
        if(!this.p) return;
        
        this.head.updateImage(this.transparency);
    }

    updateVelocity(){
        let frictionEffect = time.deltaTime * this.friction;
        let newVelocity = this.velocity.addWithFriction(this.input, frictionEffect);

        return newVelocity;
    }

    get ghostType(){
        return 0;
    }

    get vectorToBoss(){
        let closestBossIndex = -1;
        let closestBossDistance = 99999;
        
        for(let i in scene.referenceBosses){
            let boss = scene.referenceBosses[i];
            let vectorToBoss = boss.position.subtract(this.position);

            if(vectorToBoss.magnitude < closestBossDistance && boss.isMainBoss){
                closestBossIndex = i;
                closestBossDistance = vectorToBoss.magnitude;
            }
        }
        if(closestBossIndex == -1) return new Vector(0, 0);
        
        let myBoss = scene.referenceBosses[closestBossIndex];

        let vectorToBoss = myBoss.position.subtract(this.position);

        return vectorToBoss;
    }

    normalizedVectorToBoss(magnitude){
        
        let vectorToBoss = this.vectorToBoss.copy();
        vectorToBoss.magnitude = magnitude;
        return vectorToBoss;
    }

    get input(){
        if(this.doNotControl) {
            let myInput = scene.player.position.subtract(this.position);
            myInput.magnitude = this.speed;
            return myInput;
        }


        let input = new Vector(0, 0);
        if(gamepadAPI.connected) input = new Vector(gamepadAPI.axesStatus[2], -gamepadAPI.axesStatus[3]);

        if(KeyReader.i || this.p.keyIsDown(this.p.UP_ARROW))    input.y++
        if(KeyReader.k || this.p.keyIsDown(this.p.DOWN_ARROW))  input.y--
        if(KeyReader.l || this.p.keyIsDown(this.p.RIGHT_ARROW)) input.x++
        if(KeyReader.j || this.p.keyIsDown(this.p.LEFT_ARROW))  input.x--

        // Put between 1 and -1 bounds
        input.x = Math.max(Math.min(input.x, 1), -1);
        input.y = Math.max(Math.min(input.y, 1), -1);

        if(this.ghostType == 1) input = input.add(this.normalizedVectorToBoss(0.4));
        let inputMagnitude = Math.min(input.magnitude, 1);

        input.magnitude = this.speed * inputMagnitude;

        return input;
    }

    delete(){
        if(this.collider) this.collider.delete();
        if(this.otherCollider) this.otherCollider.delete();
        time.stopFunctions(this, 'createShieldCollider');
    }

    endKnockback(){
        this.knockedBack = false;
    }

    calculateSpeed(x){
        if(!this.p) return;
        
        let newSpeedMult = 1;
        if(this.p.keyIsDown(this.p.SHIFT)) newSpeedMult = 0.5;
        newSpeedMult *= this.speedMult;

        if(this.doNotControl) return Math.min(Math.max(this.speed, scene.player.velocity.magnitude*1/2), 200);

        //if(this.ghostType == 0) return newSpeedMult * ((110 / (1 + Math.exp(5*x))) + 30);

        /*
        if(this.ghostType == 1 && !(this.vectorToBoss.magnitude > 0)) return speedMult * 80*Math.pow(Math.max(4*(x), 0), 0.3) + 20;
        else if (this.ghostType == 1) return speedMult * Math.pow(Math.max(4*(x+0.2), 0), 0.5) * Math.min(this.vectorToBoss.magnitude, 50) * 1.5 + 10;
        

        if(this.ghostType == 2) return speedMult * (25 / (1 + Math.exp(4*(x-0.3))))*(25 / (1 + Math.exp(-4*(x-0.3))));
        */

        return newSpeedMult * (150 / (1 + Math.exp(3*x))) + 45;
    }

    // Only for people trying to track the ghost as if it were the player
    // Do not use these variables
    get runSpeed(){ return 150;}
}