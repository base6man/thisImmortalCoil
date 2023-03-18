class KilledPlayer extends Player{
    constructor(startPos){
        super(startPos);

        this.velocity = new Vector(0, 0);
        this.startTime = time.runTime;

        this.knockbackSpeed = 3;
        this.knockbackTime = 0.75;
        
        this.friction = 2;

        this.headImage.timeToSwitch = Infinity;
    }

    get runSpeed(){ return 0.8; }

    get transparency(){
        return (time.runTime - this.startTime)/4;
    }

    attack(){ }
    dash(){ }
    teleport(){ }

    update(){
        super.update();
        if(this.transparency >= 1) scene.gameOver = true;
    }
    
    updateImage(){
        this.headImage.updateImage(this.transparency);
    }
}