class Player extends PhysicsObject{

    constructor(startPos, p){

        super(startPos);
        this.p = p;

        this.collider = new BoxCollider(this, 12, 12);
        this.collider.layer = 'player';
        this.name = 'player';

        this.speedMult = 70;

        this.canDash = true;
        this.stopDashSpeed = 0.3;

        this.dashTime = 0.25;
        this.isDashing = false;
        
        this.timeAtDashStart = 0;
        this.timeOfLastHit = 0;

        this.stopDashTimeMultiplier = 1;

        this.phaseThrough = false;
        
        this.teleportIFrames = 0.15;
        this.teleportStartTime = 0;
        this.teleportInvincibleCooldown = 0.15;

        this.reflect = false;
        this.reflectCollider;

        this.attackObject;

        this.friction = 10;
        this.speed = this.runSpeed;

        this.maxHealth = maxPlayerHealth;
        this.health = this.maxHealth;
        this.healthBar = scene.createHudHealthBar(this, this.health, true);
        this.otherHealthBar = scene.createHealthBar(this, this.health, true);
        this.allBossesPerfect = true;

        this.knockbackSpeed = 10;
        this.invincible = false;
        this.knockbackTime = 0.05;
        this.knockedBack = false;

        this.teleporting = false;
        this.minGhostTime = 0.1;
        this.ghostCanRelease;
        this.ghost;

        this.headImage = new Head(this, playerHeads);
        this.bodyImage = new Body(this, 'player');

        this.quoteList;
        this.quoteIndex;
        this.textbox;

        this.hasNotMoved = true;
        this.freezedInput = new Vector(0, 0);

        this.battleStartQuotes = [
            "You again?",
            "Where is my body?",
            "I won't be stopped.",
            "I've had enough of this place.",
            "You can't keep me here.",
            "I won't accept this."
        ]
    }

    get runSpeed(){         return 0.8 * (1 + runSpeedBoost/2); }
    get dashSpeed(){        return 3.0 * (1 + dashSpeedBoost/2); }
    get endTeleportSpeed(){ return 4.2; }

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

    onBattleStart(){
                    
        let index = randRangeInt(0, this.battleStartQuotes.length-1);
        this.textbox = scene.createTypedTextbox([this.battleStartQuotes[index]]);

        time.delayedFunction(this, 'endQuote', this.textbox.timeToType + 0.3);
    }

    update(){
        if(!this.knockedBack) {
            this.velocity = this.updateVelocity(); 
        }
        if(this.hasNotMoved && (this.velocity.x != 0 || this.velocity.y != 0)) this.initialMovement();

        this.bodyImage.update();
        this.headImage.update();

        this.dash();
        this.teleport();
        this.update_attack();

        super.update();
        if(this.ghost) {
            this.ghost.update();
            if(this.canMergeWithGhost()) {
                this.ghost.delete();
                this.ghost = null;
            }
        }
    }

    get transparency(){
        return 0;
    }
    
    updateImage(){
        if(this.ghost) this.ghost.updateImage();

        this.bodyImage.updateImage();
        this.headImage.updateImage();

        if(this.textbox) this.textbox.update(this.textboxPosition.x, this.textboxPosition.y);
    }

    createDialougue(quoteList){
        time.stopFunctions(this, 'iterateDialougue');

        for(let i of quoteList){
            time.delayedFunction(this, 'iterateDialougue', i.quoteTime, [i.quote]);
        }
    }

    iterateDialougue(quote){
        this.textbox = scene.createTypedTextbox(quote);
    }

    endQuote(){
        // This is another sample comment
        this.textbox.delete();
        this.textbox = null;
    }

    onInitialMovement(quoteList){
        this.initialMovementList = quoteList;
    }

    initialMovement(){
        this.hasNotMoved = false;
        if(this.initialMovementList){
            console.log(this.initialMovementList);
            time.stopFunctions(this, 'iterateDialougue');
            time.delayedFunction(this, 'createDialougue', 1.5, [this.initialMovementList]);
        }
    }

    get textboxPosition(){
        let pos = this.position.copy();
        return new Vector(pos.x+4, pos.y+4);
    }

    dash(){
        if(this.freezePosition) return;

        if((KeyReader.space || gamepadAPI.buttonPressed('RT') || gamepadAPI.buttonPressed('A')) && this.canDash){

            this.canDash = false;
            this.isDashing = true;
            this.timeAtDashStart = time.runTime;
            
            if(!this.ghost) this.ghost = new Ghost(this.ghostPosition, new Vector(0, 0), this.p, true);

            if(this.dashType == 1){
                this.speed = 4;
                this.velocity.magnitude = 4 * this.speedMult;

                this.phaseThrough = true;

                time.delayedFunction(this, 'endDash', this.dashTime * 1.5);
            }
            else if(this.dashType == 3){
                this.speed = 6;
                this.velocity.magnitude = this.speedMult * 6;
                this.reflect = true;

                this.reflectCollider = new BoxCollider(this, 9, 9);
                this.collider.layer = 'player';
                
                time.delayedFunction(this, 'stopDash', this.dashTime*2/3);
                time.delayedFunction(this, 'stopInvincible', this.dashIFrames);
            }
            else{
                this.speed = this.dashSpeed;
                this.velocity.magnitude = this.dashSpeed * this.speedMult;
                this.phaseThrough = true;

                if(this.dashType == 2)
                    this.attack(0.8, false, true);
                else{ this.attack(0.3); }
                
                time.delayedFunction(this, 'stopDash', this.dashTime);
            }

        }

        if(this.isDashing && !(KeyReader.holdSpace || gamepadAPI.buttonPressed('RT', true) || gamepadAPI.buttonPressed('A', true))){
            this.stopDash();
            if(this.attackObject && this.attackObject.isStillAlive) this.endAttack();
        }
    }

    stopInvincible(){
        this.phaseThrough = false;
        this.reflect = false;

        if(this.reflectCollider){
            this.reflectCollider.delete();
            this.reflectCollider = null;
        }
    }

    stopDash(){
        time.stopFunctions(this, 'stopDash');
        time.stopFunctions(this, 'endDash');
        
        time.stopFunctions(this, 'stopInvincible');
        this.stopInvincible();

        this.isDashing = false;

        this.speed = this.stopDashSpeed;
        this.velocity.magnitude = this.stopDashSpeed * this.speedMult;

        time.delayedFunction(this, 'endDash', this.stopDashTimeMultiplier * this.timeDashing);

    }

    get timeDashing(){
        return time.runTime - this.timeAtDashStart;
    }

    endDash(){
        this.isDashing = false;
        this.canDash = true;

        this.speed = this.runSpeed;
    }

    set speed(newSpeed){
        this._speed = newSpeed * this.speedMult;
    }

    get speed(){
        return this._speed;
    }

    get dashType(){
        return scene.dashType
    }

    ghostCooldown(){
        this.ghostCanRelease = true;
    }

    get ghostPosition(){
        return new Vector(this.position.x, this.position.y+2.5);
    }
    
    teleport(){
        if(this.freezePosition) return;
        
        if(!this.teleporting && this.ghostKeysPressed()){
            this.teleporting = true;

            this.teleportStartTime = time.runTime;

            if(!this.ghost) 
                this.ghost = new Ghost(this.ghostPosition, this.velocity, this.p);
            else{ 
                this.ghost.startControlling();
            }

            this.ghostCanRelease = false;
            time.delayedFunction(this, 'ghostCooldown', this.minGhostTime);
        }
        else if (this.teleporting && !this.ghostKeysPressed() && this.ghostCanRelease){
            this.teleporting = false;

            this.position = this.ghost.position;
            this.velocity = this.ghost.velocity.copy();
            this.velocity.magnitude = this.endTeleportSpeed * this.speedMult;

            this.ghost.delete();
            this.ghost = null;
            this.attack(0.15);

            //console.log(this.teleportStartTime, time.runTime - this.teleportStartTime);
            if(time.runTime - this.teleportStartTime > this.teleportInvincibleCooldown){
                this.phaseThrough = true;
                time.delayedFunction(this, 'stopInvincible', this.teleportIFrames);
                //console.log('invincible');
            }
        }
    }

    ghostKeysPressed(){
        return (
            KeyReader.j  || KeyReader.k || KeyReader.l || KeyReader.i || 
            this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(this.p.DOWN_ARROW) || 
            this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(this.p.RIGHT_ARROW) ||
            Math.abs(gamepadAPI.axesStatus[2]) > 0.1 || Math.abs(gamepadAPI.axesStatus[3]) > 0.1
        );
    }

    canMergeWithGhost(){
        return (
            this.ghost.position.subtract(this.position).magnitude < 4 && 
            this.ghost.doNotControl && 
            this.timeDashing > 0.02 && time.runTime - this.timeOfLastHit > 0.02
        );
    }

    updateVelocity(){
        let frictionEffect = time.deltaTime * this.friction;
        let newVelocity = this.velocity.addWithFriction(this.input, frictionEffect);

        return newVelocity;
    }

    get input(){

        let input = new Vector(0, 0);

        if(this.freezePosition) 
            input = this.freezedInput.multiply(this.speed);
        else
        {
            if(gamepadAPI.connected) input = new Vector(gamepadAPI.axesStatus[0], -gamepadAPI.axesStatus[1]);
    
            if(KeyReader.w) input.y++
            if(KeyReader.s) input.y--
            if(KeyReader.d) input.x++
            if(KeyReader.a) input.x--

            // Put between 1 and -1 bounds
            input.x = Math.max(Math.min(input.x, 1), -1);
            input.y = Math.max(Math.min(input.y, 1), -1);
    
            let inputMagnitude = Math.min(input.magnitude, 1);
    
            input.magnitude = this.speed * inputMagnitude;
        }

        return input;
    }

    freeze(){
        this.freezePosition = true;
        this.ghost = null;
        this.teleporting = false;
        this.endDash();
        this.endAttack();
    }

    unfreeze(){
        this.speed = this.runSpeed;
        this.freezedInput = new Vector(0, 0);
        this.freezePosition = false;
        this.velocity = this.freezedInput.multiply(this.speed);
    }

    setInput(newInput){
        this.freezedInput = newInput;
    }

    attack(duration, melee = true, reverse = false){

        if(!melee){
            let bulletVelocity = this.velocity.copy();
            bulletVelocity.magnitude = 150;
            if(reverse) bulletVelocity.angle += Math.Math.PI;

            let myBullet = new Bullet(7.5, this.position, bulletVelocity, true, true);
            myBullet.makePlayerRangedAttack();
            myBullet.angleTowardBoss(Math.PI/4);
            myBullet.timeAlive = duration;
        }
        else{
            if(this.attackObject && this.attackObject.isStillAlive) this.attackObject.dissapate();
            // Offset done later
            this.attackObject = new Bullet(7.5, this.position, new Vector(0, 0), true);
            this.attackObject.makePlayerAttack(this);
            time.delayedFunction(this, 'endAttack', duration);
        }

        scene.mainCamera.createShake(0.5);
    }

    update_attack(){
        if(this.attackObject){
            this.offset = this.velocity.copy();
            this.offset.magnitude = 7;
            this.attackObject.position = this.position.add(this.offset);
        }
    }

    endAttack(){
        time.stopFunctions(this, 'endAttack');
        if(this.attackObject) this.attackObject.dissapate();
    }

    bossIsKilled(boss, canHeal = true){
        if(this.health != this.maxHealth)
            this.allBossesPerfect = false;
        if((boss.healsPlayer || !boss) && canHeal) this.regenHealth(1); 

        console.log(boss, boss.healsPlayer);
    }

    finalBossIsKilled(boss){

        this.bossIsKilled(boss, false);
        this.regenHealth();

        if(this.allBossesPerfect)
            this.addMaxHealth(1);
    }

    addMaxHealth(healthToAdd){
        this.maxHealth += healthToAdd;
        this.healthBar = scene.createHudHealthBar(this, this.maxHealth, true);
        this.otherHealthBar = scene.createHealthBar(this, this.maxHealth, true);

        this.healthBar.health = this.health;
        this.otherHealthBar.health = this.health;

        maxPlayerHealth += 1;

        //Because it can only be called once
        this.allBossesPerfect = false;

        this.regenHealth(healthToAdd);
    }

    regenHealth(healthToRegen = 9999){
        if(this.health >= this.maxHealth) return;

        this.health = Math.min(this.health + healthToRegen, this.maxHealth);
        this.healthBar.display(this.health);
        this.otherHealthBar.display(this.health);
    }

    lookLikeImAtOneHealth(){
        this.healthBar.display(1);
        this.otherHealthBar.display(1);
        this.textbox.delete();
        this.textbox = null;
    }

    startInvinicibility(invinTime){
        this.invincible = true;
        time.delayedFunction(this, 'endInvincibility', invinTime);
    }

    endInvincibility(){
        this.invincible = false;
    }

    endKnockback(){
        this.knockedBack = false;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'enemyAttack' && this.reflect){
            let newVelocity = other.velocity.copy();
            newVelocity.angle += Math.PI;
            newVelocity.magnitude *= 1.5;
            let newPosition = other.position;

            let newBullet = new Bullet(7.5, newPosition, newVelocity, true);
            newBullet.makePlayerRangedAttack();
            newBullet.angleTowardBoss(2*Math.PI);
            newBullet.timeAlive = 2;
            
            scene.mainCamera.createShake(0.5);

            other.dissapate();
            
            scene.killBulletsInRange(this.position, 40);
        }
        else if(other.collider.layer == 'enemyAttack' && (!this.phaseThrough || other.hitInvinciblePlayer)){


            if(!this.invincible){
                
                this.health -= 1;

                if(this.health <= 0){
                    if(randRange(0, 10) < 3 && !this.gotExtraHealth) {
                        this.getHit();

                        this.textbox = scene.createTextbox(['One extra health!']);

                        this.otherHealthBar.shouldDisplay = false;
                        time.delayedFunction(this, 'lookLikeImAtOneHealth', this.healthBar.switchTime);

                        this.health = 1;
                        this.gotExtraHealth = true;
                    }
                    else{
                        this.die(other.position);
                    }
                }
                else{
                    this.getHit();
                }
            }
            else{
                scene.mainCamera.createShake();
            }

            this.doKnockback(other.position);
        }
        else if (other.collider.layer == 'blueBullet'){

            let knockbackVector = this.position.subtract(other.position);
            knockbackVector.magnitude = this.knockbackSpeed * this.speedMult * 1/3;
            this.velocity = knockbackVector;
            
            this.knockedBack = true;
            this.endKnockback();    // delay of zero
        }
    }

    doKnockback(otherPosition){

        let knockbackVector = this.position.subtract(otherPosition);
        knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;

        if(!this.ghost) {
            this.ghost = new Ghost(this.ghostPosition, new Vector(0, 0), this.p, true);

            let ghostKnockbackVector = knockbackVector.copy();
            ghostKnockbackVector.angle += Math.PI;
            ghostKnockbackVector.magnitude = this.ghost.knockbackSpeed;

            this.ghost.velocity = ghostKnockbackVector;
            this.ghost.knockedBack = true;
            time.delayedFunction(this.ghost, 'endKnockback', 0.3);
        }

        this.velocity = knockbackVector;

    }

    getHit(){

        this.invincible = true;
        this.knockedBack = true;
        
        this.healthBar.display(this.health);
        this.otherHealthBar.display(this.health);

        this.timeOfLastHit = time.runTime;

        time.delayedFunction(this, 'endInvincibility', this.healthBar.displayTime);
        time.delayedFunction(this, 'endKnockback', this.knockbackTime);

        scene.mainCamera.createShake(3);
        scene.mainCamera.freezeTarget = this;
        time.hitStop(0.1);

        scene.killBulletsInRange(this.position, 100);
    }

    die(otherPosition){
        scene.killPlayer();
        scene.player = new DeadPlayer(this.position);
        scene.player.doKnockback(otherPosition);
    }
}