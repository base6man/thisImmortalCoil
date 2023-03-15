class Sidestep extends Attack{
    
    setup(){
        this.speed = this.boss.sidestepSpeed;
        this.windupSpeed = this.boss.runSpeed;

        this.minDistance = this.boss.distanceToDodge;
        this.maxDistance = this.minDistance * 1.5;

        this.isDodge = true;
        this.dodgeTime = this.boss.dodgeTime;

        this.canInvis = true;
        
        this.name = 'run';

        this.minDistance = 0;
        this.maxDistance = Infinity;
    }

    canAttack(strictness = 1){
        return (
            isBetween(this.distanceToPlayer, this.minDistance * strictness, this.maxDistance / strictness) &&
            this.combo.numAttacks < 2
        );
    }

    canContinueCombo(){
        return this.canAttack(0.5);
    }

    delayAttack(retreat){
        this.boss.speed = this.speed;

        this.boss.minDistance = this.minDistance;
        this.boss.maxDistance = this.maxDistance;
        
        if(retreat)                  this.boss.velocity.angle = this.vectorToPlayer.angle + Math.PI;
        else if(this.boss.clockwise) this.boss.velocity.angle = this.vectorToPlayer.angle - Math.PI/2;
        else{                        this.boss.velocity.angle = this.vectorToPlayer.angle + Math.PI/2; }
        
        time.delayedFunction(this, 'finishAttack', this.dodgeTime);
    }
}

class Run extends Sidestep{
    setup(){
        super.setup();

        this.minDodgeTime = 0.5;
        this.dodgeTime = 1;
        this.canCancel;
        this.timeDodging;

        this.agression = 0;
        this.speed = this.boss.runSpeed * 1.5;

        this.minDistance = 0;
        this.maxDistance = 100;
    }

    canAttack(){
        return this.parent.timeSinceLastInvinAttack > 0.6 * this.agressiveness;
    }
    
    canContinueCombo(){
        return this.parent.timeSinceLastInvinAttack > 0.3 * this.agressiveness;
    }

    delayAttack(){
        this.canCancel = false;
        time.delayedFunction(this, 'nowCanCancel', this.minDodgeTime);

        this.boss.clockwise = !this.boss.clockwise;
        if(this.parent.attackDelay > 0) {
            this.minDistance = Infinity;
            this.maxDistance = Infinity;
            super.delayAttack();
            this.retreat = true;
        }
        else{ super.delayAttack(); }
    }

    update(){
        super.update();

        if(this.canCancel && this.isUpdating){
            if(this.retreat && this.distanceToPlayer > 130) this.finishAttack();
            if(isBetween(this.distanceToPlayer, 90, 120) || this.distanceToPlayer < 70) this.finishAttack();
        }
    }

    nowCanCancel(){
        this.canCancel = true;

    }
}