class Npc extends PhysicsObject{
    constructor(name, startingPosition, voice, actionList){
        super(startingPosition, new Vector(0, 0));
        this.actionList = actionList;
        this.voice = voice;

        this.acceleration = new Acceleration(0, 0);
        
        this.target = scene.player;

        this.name = name;
        this.animationManager = new PresetAnimationManager(this, name);

        let index = 0;
        let waitTime;

        while(index < this.actionList.length){
            let textboxList = []
            let newVelocity, newPosition, newAcceleration;
            while(!isNumber(this.actionList[index])){
    
                const action = this.actionList[index]
                console.assert(index < this.actionList.length, 'Action lists must end with numbers!');

                if(action == 'delete'){
                    waitTime = this.actionList[index+1]
                    time.delayedFunction(this, 'delete', waitTime);
                    return;
                }
                else if(action == 'faceTowardPlayer')
                    newVelocity.angle = this.position.subtract(scene.player.position).angle;
                else if(typeof action == 'string')
                    textboxList.push(action);
                else if(action.type == 'velocity')
                    newVelocity = action.copy();
                else if(action.type == 'position')
                    newPosition = action.copy();
                else if (action.type == 'acceleration')
                    newAcceleration = action.copy();
    
                index++
            }
            waitTime = this.actionList[index]
            console.assert(isNumber(waitTime));
;
            time.delayedFunction(this, 'excecuteAction', waitTime, [textboxList, newVelocity, newPosition, newAcceleration]);

            index++
        }
    }

    update(){
        super.update();
        this.velocity = this.velocity.add(this.acceleration.multiply(time.deltaTime));
    }

    updateImage(){
        this.animationManager.update();
        this.animationManager.draw(this.position.x, this.position.y, this.direction);
        
        if(this.textbox) this.textbox.update(this.position.x+4, this.position.y+4);
    }

    excecuteAction(textboxList, newVelocity, newPosition, newAcceleration){
        if(newVelocity)     this.velocity = newVelocity.copy();
        if(newPosition)     this.position = newPosition.copy();
        if(newAcceleration) this.acceleration = newAcceleration.copy();
        
        if(newPosition) console.log(newPosition, this.position);

        if(textboxList.length > 0)
            this.textbox = scene.createTypedTextbox(textboxList, null, null, this.voice, this.typingSpeed);
    }

    delete(){
        let deathIndex = scene.npcs.indexOf(this);
        scene.npcs.splice(deathIndex, 1);
    }

    set typingSpeed(newTypingSpeed){
        this._typingSpeed = newTypingSpeed;
    }
    
    get direction(){
        return this.vectorToPlayer.direction;
    }

    get vectorToPlayer(){
        return this.target.position.subtract(this.position);
    }

    get diagonal(){
        return this.vectorToPlayer.diagonal;
    }
}