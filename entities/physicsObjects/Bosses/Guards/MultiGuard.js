class MultiGuard extends Guard{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        this.name = 'multiGuard';
        
        this.difficultyMultiplier = 0.95;

        this.maxBots = 2 + this.difficulty/4;
        this.botClockwise = false;

        this.runSpeed = 4;

        this.normalMinDistance = 50;
        this.normalMaxDistance = 60;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.canTeleport = false;
        this.timeTouchingWall = 0;
        this.instantTeleport = false;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =     1 + (this.difficulty-1)/3;
        this.attackPower =       1 + (this.difficulty-1)/6;
    }

    createAttackManager(){
        super.createAttackManager();
        this.attackManager.startAttacking();
    }

    update(){
        super.update();
        if(this.myBots.length < this.maxBots && time.waitingFunctions(this, 'createBot').length == 0){
            time.delayedFunction(this, 'createBot', 1.0)
        }
        
        if(this.isOnEdgeOfArena) {
            this.timeTouchingWall += time.deltaTime;
            if(this.timeTouchingWall > 1.0) this.teleportThroughWalls();
        }
        else{
            this.timeTouchingWall = 0;
        }
    }

    createBot(){
        let botVelocity;
        let myVelocity = this.velocity.copy();
        if(this.botClockwise){
            botVelocity = new Vector(myVelocity.y, -1*myVelocity.x);
            this.botClockwise = false;
        }
        else{
            botVelocity = new Vector(-1*myVelocity.y, myVelocity.x);
            this.botClockwise = true;
        }
        botVelocity.magnitude = this.speed;

        let bot = new GuardBot(this.arenaCenter, this.arenaSize);
        bot.position = this.position.add(botVelocity.divide(60));
        bot.velocity = botVelocity;
        
        bot.parent = this;
        bot.setIndex();

        this.myBots.push(bot);

    }

    updateVelocity(){
        return super.updateVelocity();
    }

    isOnEdgeOfArena(){
        if(this.position.x >= this.arenaRight - this.collider.width / 2)
            return true;
        if(this.position.y >= this.arenaTop - this.collider.height / 2)
            return true;
        if(this.position.x <= this.arenaLeft + this.collider.width / 2)
            return true;
        if(this.position.y <= this.arenaBottom + this.collider.height / 2)
            return true;
    }

    teleportThroughWalls(){
        super.teleportThroughWalls();

        this.timeTouchingWall = 0;
    }
}