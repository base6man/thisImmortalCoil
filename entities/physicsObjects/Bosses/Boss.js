class Boss extends PhysicsObject{
    /**
     * @param {Vector} arenaCenter Starting position, also center of arena. Can change starting position later by editing position
     * @param {Vector} arenaSize Size of the arena, in a vector
     */
     constructor(arenaCenter = new Vector(0, 0), arenaSize = new Vector(400, 240)){
        
        super(arenaCenter);
        this.collider = new BoxCollider(this, 9, 9);
        this.collider.layer = 'boss';
        this.name = 'boss';
        this.collider.name = 'boss';

        this.speedMult = 8;
        this.clockwise = true;

        this.difficultyMultiplier = 1;
        
        this.agressiveness =     1;
        this.attackPower =       1;
        this.shootSpeed =        0;
        this.localSpeedMult =    1;
        this.dodgePower =        1;
        this.maxComboCounter =   4;

        this.difficultyChange = 0.5;

        
        this.minimumDistanceToShield = 0;
        this.distanceToShield;
        this.minimumDistanceToDodge = 0;
        this.distanceToDodge;

        this.dodgeDist;
        this.dodgeTime;
        this.dodging = false;

        this.invincible = false;
        this.health = 3;

        this.knockbackSpeed;
        this.knockbackTime;
        this.knockedBack = false;

        this.arenaRight = arenaCenter.x + arenaSize.x/2;
        this.arenaTop = arenaCenter.y + arenaSize.y/2;
        this.arenaLeft = arenaCenter.x - arenaSize.x/2;
        this.arenaBottom = arenaCenter.y - arenaSize.y/2;

        this.arenaCenter = arenaCenter.copy();
        this.arenaSize = arenaSize.copy();

        this.target = scene.player;
        this.healsPlayer = true;

        this.myWall;

        this.repelForce = 20;

        this.myBots = [];
        this.isMainBoss = true;
        scene.referenceBosses.push(this);

        this.isAllowedToSwitch = true;
        this.timeBetweenSwitching = 0.1;
        this.criticalTime = 0.6;
        this.isTouchingWall = false;

        this.normalLookAheadTime;
        this.lookAheadTime;

        this.createAnimations();

        this.isFirstFrame = true;
        this.isAlive = true;

        this.textbox;
        this.deathTextList = [
            'Filler text'
        ]
        this.startTextList = [
            'Start text'
        ]

        this.deathColor = scene.p.color(230, 220, 220);

        this.song;
        this.songIsInstant = false;

        this.counterAttack = false;

        this.freezePosition;
        this.freezeVelocity;
        this.transparency= 0;
        
        this.hasHeadAndBody = false;
    }

    setDifficulty(){
        // Do nothing!
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        this.attackManager.addComboList([]);
    }
    
    createAnimations(){
        this.animationManager = new PresetAnimationManager(this, 'guard');
    }
    
    get animationName(){
        if(this.diagonal && this.direction == 'right') return 'downRight';
        if(this.diagonal && this.direction == 'up')    return 'upRight';
        if(this.diagonal && this.direction == 'down')  return 'downLeft';
        if(this.diagonal && this.direction == 'left')  return 'upLeft';
        if(this.direction == 'up')    return 'up';
        if(this.direction == 'right') return 'right';
        if(this.direction == 'left')  return 'left';
        if(this.direction == 'down')  return 'down';
        return 'idle';
    }

    doFirstFrame(){
        this.setDifficulty();
        
        this.createAttackManager();
        this.attackManager.balanceAttacks();
        if(this.isMainBoss)
            this.otherHealthBar = scene.createHudHealthBar(this, this.health);
        this.healthBar = scene.createHealthBar(this, this.health);

        this.isFirstFrame = false;
    }

    willSayStartText(){
        this.counterAttack = true;
        this.freezePosition = this.position.copy();
    }

    sayStartText(){        
        let index = randRangeInt(0, this.startTextList.length-1)
        let text = this.startTextList[index]
        this.textbox = scene.createTypedTextbox([text]);

        time.delayedFunction(this, 'startMoving', this.textbox.timeToType + 0.5);
    }

    startMoving(){
        this.endInvincibility();
        this.freezePosition = false;
        this.textbox.delete();
        this.textbox.delete();
        this.textbox = null;
    }

    update(){
        if(this.freezePosition) {
            this.position = this.freezePosition.copy();
            return;
        }
        if(this.freezeVelocity) {
            this.position = this.position.add(this.freezeVelocity.multiply(time.deltaTime));
            this.transparency += time.deltaTime*2;
            return;
        }
        
        if(this.hasHeadAndBody && !this.invisible){
            this.body.update();
            this.head.update();
        }

        if(this.isFirstFrame) this.doFirstFrame();

        if(!this.knockedBack) this.velocity = this.updateVelocity(); 
        this.attackManager.update();
        super.update();
        
        this.seeIfIShouldReverseDirections(this.criticalTime);

        for(let i of this.myBots) i.update();

        this.positionLastFrame = this.position.copy();

    }

    updateVelocity(){

        let frictionEffect = time.deltaTime * this.friction;
        let movementVector;

        if(this.isTouchingWall){
            movementVector = this.position.subtract(this.arenaCenter).multiply(-1);
        }
        else if(this.distanceToPlayer > this.maxDistance){
            movementVector = this.vectorToPlayer;
        }
        else if (this.distanceToPlayer > this.minDistance){
            if(this.clockwise){
                movementVector = new Vector(this.vectorToPlayer.y, -this.vectorToPlayer.x);
            }
            else{
                movementVector = new Vector(-this.vectorToPlayer.y, this.vectorToPlayer.x);
            }
        }
        else{
            movementVector = this.vectorToPlayer.multiply(-1);
        }
        
        movementVector.magnitude = 1;

        for(let i of scene.referenceBosses){
            if(i != this){
                let repelVector = this.position.subtract(i.position).invert().multiply(this.repelForce);
                movementVector = movementVector.add(repelVector);
            }
        }
        let tempVector = movementVector.copy();

        movementVector.magnitude = this.speed;

        let newVelocity = this.velocity.addWithFriction(movementVector, frictionEffect);
        console.assert(newVelocity.isVector(), tempVector, frictionEffect, this.speed);

        return newVelocity;
    }

    seeIfIShouldReverseDirections(criticalTime){
        let futurePosition = this.position.add(this.velocity.multiply(criticalTime));
        if(
            !this.isAttacking &&
            this.isAllowedToSwitch &&
            (futurePosition.x > this.arenaRight  - this.collider.width/2 ||
             futurePosition.x < this.arenaLeft   + this.collider.width/2 ||
             futurePosition.y > this.arenaTop    - this.collider.height/2 ||
             futurePosition.y < this.arenaBottom + this.collider.height/2)
            ){
                this.clockwise = !this.clockwise;
                this.isAllowedToSwitch = false;
                time.delayedFunction(this, 'canSwitchAgain', this.timeBetweenSwitching);
            }
    }

    canSwitchAgain(){
        this.isAllowedToSwitch = true;
    }

    updateImage(){

        for(let i of this.myBots) i.updateImage();

        if(this.hasHeadAndBody && !this.invisible){
            this.body.updateImage();
            this.head.updateImage();
        }
        else if(!this.invisible){
            this.animationManager.update();
            this.animationManager.draw(this.position.x, this.position.y, this.direction, this.transparency);
        }

        if(this.textbox) this.textbox.update(this.position.x+4, this.position.y+4);
        
        // Right now, I'm also using this as a lateUpdate function because I'm too lazy to actually code one
        // If this comes back to bite me, hopefully I can find this comment
        // No late update stuff now (phew)
    }

    finishAttack(){
        // For a delayed time function; will probably use a lot
        // Also returns lots of other variables to their normal state
        this.returnToRunSpeed();
    }
    
    returnToRunSpeed(){
        this.speed = this.runSpeed;
        this.friction = this.normalFriction;
        this.maxDistance = this.normalMaxDistance;
        this.minDistance = this.normalMinDistance;
        this.lookAheadTime = this.normalLookAheadTime;
        this.attackAnimation = false;
        this.windupAnimation = false;
    }

    get difficulty(){
        let newDifficultyMult = this.difficultyMultiplier * (1.2 - this.timesPlayerDiedToThis/10);

        return difficulty * newDifficultyMult + 3 * hardMode;
    }

    get globalDifficulty(){
        return Math.round(difficulty*2)/2;
    }

    get timesPlayerDiedToThis(){
        let count = 0;
        for(let i of deathBosses){
            if(i == this.name) count++
        }
        if(count == 0) count--
        return count;
    }

    get ghost(){
        return this.target.ghost;
    }

    get tooCloseToGhost(){
        if(!this.ghost) return false;
        return this.ghost.position.subtract(this.position).magnitude < this.distanceToDodge;
    }

    get tooCloseToPlayer(){
        return this.distanceToPlayer < this.distanceToDodge && this.distanceToPlayer > this.minimumDistanceToDodge;
    }

    get direction(){
        if(this.freezeVelocity) return this.freezeVelocity.direction;
        return this.vectorToPlayer.direction;
    }

    get diagonal(){
        return this.vectorToPlayer.diagonal;
    }

    get dodgeSpeed(){
        return this.dodgeDist / this.dodgeTime / this.speedMult / this.localSpeedMult;
    }

    get distanceToPlayer(){
        return this.vectorToPlayer.magnitude;
    }

    get futureDistanceToPlayer(){
        return this.futureVectorToPlayer.magnitude;
    }

    get vectorToPlayer(){
        return this.target.position.subtract(this.position);
    }

    get futureVectorToPlayer(){
        return this.vectorToPlayer.add(this.target.velocity.multiply(this.lookAheadTime));
    }

    get angleToPlayer(){
        return this.vectorToPlayer.angle;
    }

    get futureAngleToPlayer(){
        return this.futureVectorToPlayer.angle;
    }

    get futurePlayerPosition(){
        return this.target.position.add(this.target.velocity);
    }

    get speed(){
        return this.maxSpeed;
    }

    set speed(_speed){

        console.assert(isNumber(_speed));
        this.maxSpeed = _speed * this.speedMult * this.localSpeedMult;
        this.velocity.magnitude = this.speed;
    }

    set trueSpeed(_speed){
        console.assert(isNumber(_speed));
        this.maxSpeed = _speed;
        this.velocity.magnitude = this.speed;
    }

    get isAttacking(){
        if(!this.attackManager) return false;
        return this.attackManager.isAttacking;
    }

    get shieldIsOffset(){
        if(!this.currentAttack) return false;
        return this.currentAttack.melee;
    }

    get isDodging(){
        if(!this.currentAttack) return false;
        return this.currentAttack.isDodge;
    }

    get currentAttack(){
        if(!this.attackManager) return null;
        return this.attackManager.currentAttack;
    }

    endInvincibility(){
        this.invincible = false;
        this.counterAttack = false;
    }

    getKnockedBack(){

        this.finishAttack();
        this.attackManager.waitForSeconds(1/this.agressiveness);

        let knockbackVector = this.vectorToPlayer;
        knockbackVector.angle += Math.PI;
        knockbackVector.magnitude = this.knockbackSpeed * this.speedMult;

        this.velocity = knockbackVector;
        
        this.knockedBack = true;
        time.delayedFunction(this, 'endKnockback', this.knockbackTime);
    }

    endKnockback(){
        this.knockedBack = false;
        this.velocity.magnitude = this.speed;
    }

    onTriggerCollision(other){

        if(other.collider.layer == 'playerAttack'){

            if(this.counterAttack){
                let newVector = new Vector(0, 10);
                newVector.angle = this.angleToPlayer;
                let newBullet = new Bullet(9, this.position, new Vector(0, 0));
                newBullet.timeAlive = 0.1;
                newBullet.hitInvinciblePlayer = false;
            }
            else if(!this.invincible){

                this.health -= 1;

                if(this.health <= 0 && this.isMainBoss){
                    this.getHitAndDie();
                }
                else if (this.health <= 0 && !this.isMainBoss){
                    this.killBoss();
                    scene.mainCamera.createShake();
                }
                else{
                    if(this.isMainBoss){
                        scene.mainCamera.createShake(1.5);

                        time.hitStop(0.1, 0.03);
                        scene.glitch();
                        time.delayedFunction(scene, "unglitch", 0.03);
                        scene.timeSinceLastHit = 0;

                        this.target.velocity = new Vector(0, 0);

                        playSound(hitBoss);
                        scene.bossManager.bossIsHit(this);
                    }
                    else{
                        scene.mainCamera.createShake();
                    }

                    this.invincible = true;
                    time.delayedFunction(this, 'endInvincibility', this.healthBar.switchTime);

                    this.getKnockedBack();

                    this.displayHealth();

                    this.target.startInvinicibility(0.2);
                }
            }
            else{
                other.dissapate();
            }
        }
    }

    getHitAndDie(flashEffect = true){
        this.invincible = true;
        this.returnToRunSpeed();
        this.freezePosition = this.position.copy();
        this.collider.delete();
        
        for(let i of this.myBots) i.killBoss(true);

        if(flashEffect){
        
            let index = randRangeInt(0, this.deathTextList.length-1);
            this.textbox = scene.createTypedTextbox([this.deathTextList[index]]);
            this.textbox.typingSpeed = 350 * 6;

            let freezeInput = this.vectorToPlayer.copy();
            freezeInput.magnitude = 1;
            freezeInput.angle += Math.PI;
    
            this.target.setInput(freezeInput);
            this.target.speed = 5;
            this.target.velocity.magnitude = 5 * this.target.speedMult;
            this.target.freeze();
    
            time.hitStop(1.3, 0.1, false);
    
            scene.mainCamera.targetPos = this.position;
    
            scene.coverScreenColor = this.deathColor;
            scene.coverScreen = 1.2;
            scene.coverScreenChange = -0.01
            
            time.delayedFunction(this, 'endPlayerFreeze', 0.13);
        }

        time.delayedFunction(this, 'killBoss', 0.5);

        scene.killBulletsInRange(this.arenaCenter, 9999);
        scene.bulletsCannotSpawn = true;

        this.isAlive = false;

        this.displayHealth();
        this.healthBar.stopDisplay();
    }

    displayHealth(){
                    
        this.healthBar.display(this.health);
        if(this.otherHealthBar)
            this.otherHealthBar.display(this.health);
    }

    leave(){
        this.freezePosition = null;
        this.freezeVelocity = this.position.subtract(scene.mainCamera.position);
        this.freezeVelocity.magnitude = 50;
    }

    onColliderCollision(other){
        if(other.collider.layer == 'wall'){
            this.isTouchingWall = true;
            time.stopFunctions(this, 'notTouchingWall');
            time.delayedFunction(this, 'notTouchingWall', 1);
        }
    }

    notTouchingWall(){
        this.isTouchingWall = false;
    }

    endPlayerFreeze(){
        this.target.unfreeze();
        
        this.target.speed = this.target.dashSpeed;
        this.target.velocity.magnitude = this.target.dashSpeed * this.target.speedMult;
        this.phaseThrough = true;
        
        time.delayedFunction(this.target, 'endDash', 0.15);
    }

    killBoss(hasKilledMainBoss = false, incrementsDifficulty = true){
        this.isAlive = false;

        this.healthBar.delete();
        if(this.otherHealthBar)
            this.otherHealthBar.delete();
        if(this.collider) this.collider.delete();

        scene.referenceBosses.splice(scene.referenceBosses.indexOf(this), 1);

        if(!this.isMainBoss && !hasKilledMainBoss)
            this.parent.killChildBoss(this.index);
        else if (this.isMainBoss){
            scene.bossManager.killBoss(scene.bossManager.bosses.indexOf(this));
        }
        
        if(this.isMainBoss && incrementsDifficulty) {
            difficulty += this.difficultyChange;
        }

        scene.mainCamera.targetPos = null;
    }

    killChildBoss(index){

        this.myBots.splice(index, 1);

        for(let i in this.myBots){
            this.myBots[i].index = i;
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}