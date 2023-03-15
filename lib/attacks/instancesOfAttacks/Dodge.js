class Dodge extends Attack{

    setup(){
        this.dodgeTime =   this.boss.dodgeTime;
        this.speed =       this.boss.dodgeSpeed;
        this.maxDistance = this.boss.distanceToDodge;
        this.minDistance = this.boss.minimumDistanceToDodge;

        this.isDodge = true;
        this.canInvis = true;
        this.difficulty = this.boss.dodgePower;

        this.windupSpeed = this.boss.runSpeed;
    }

    canAttack(strictness = 1){
        
        return (
            isBetween(this.distanceToPlayer, this.minDistance * strictness, this.maxDistance / strictness) ||
            this.boss.tooCloseToGhost
        );
    }

    canContinueCombo(){
        
        return this.canAttack(0.5);
    }

    delayAttack(){
        
        if(this.distanceToPlayer < this.maxDistance * 1.3){

            this.boss.minDistance = this.boss.normalMaxDistance;
            this.boss.maxDistance = Infinity;

            this.boss.velocity = this.boss.vectorToPlayer.multiply(-1);
            this.boss.speed = this.speed;
            time.delayedFunction(this, 'finishAttack', this.dodgeTime);
        }
        else{
            this.finishAttack();
        }
    }
}

class ShootDodge extends Dodge{
    delayAttack(){
        super.delayAttack();
        this.shootBullet(this.boss.velocity.angle + Math.PI, 120);
    }
}

class SideDodge extends Dodge{
    delayAttack(){
        super.delayAttack();
        this.boss.velocity.angle = this.boss.vectorToPlayer.angle;
        
        this.boss.speed = this.speed;
        this.boss.minDistance = 0;
        this.boss.maxDistance = Infinity;
    }
}