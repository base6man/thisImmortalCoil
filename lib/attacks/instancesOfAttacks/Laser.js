class Laser extends Attack{

    setup(){
        this.minDistanceFromCenter = this.boss.arenaSize.magnitude * 0.5;
        this.speed = this.boss.shootSpeed / 2;

        this.velocityAdjustMultiplier = 0.06 * this.difficulty;

        this.canInvis = true;
    }

    canAttack(){
        
        return (
            (this.boss.position.magnitude > this.minDistanceFromCenter || 
            this.target.position.magnitude > this.minDistanceFromCenter) && 
            isBetween(this.distanceToPlayer, 80, 110)
        );
    }

    canContinueCombo(){
        
        return (
            isBetween(this.distanceToPlayer, 50, 110)
        );
    }

    delayAttack(delay = 1, duration = 2){

        delay = delay/this.agressiveness;
        let shootTime = 0.04;
        let numShots = Math.floor(duration / shootTime);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay);
        }
        time.delayedFunction(this, 'finishAttack', duration + delay);
    }

    shootBullet(){
        let bulletVelocity = new Vector(1, 0);
        bulletVelocity.angle = this.angleToPlayer;
        
        let velocityVector = this.target.velocity.copy();
        velocityVector.magnitude = 0.05 * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);
        bulletVelocity = bulletVelocity.add(velocityVector);

        let myBullet = super.shootBullet(bulletVelocity.angle, 160);
        if(myBullet && myBullet.isStillAlive){
            myBullet.timeAlive = 3;
        }
        return myBullet;
    }
}

class FastLaser extends Laser{
    delayAttack(){
        super.delayAttack(0, 2);
    }
}

class ShortLaser extends Laser{
    delayAttack(){
        super.delayAttack(0.2, 1);
    }
}

class ShieldLaser extends Laser{
    setup(){
        
        this.velocityAdjustMultiplier = 1;
    }

    canAttack(){
        return isBetween(this.distanceToPlayer, 80, 120);
    }

    canContinueCombo(){
        return this.distanceToPlayer > 75;
    }

    delayAttack(){
        super.delayAttack(0.2, 0.3);
    }

    shootBullet(){
        let myBullet = super.shootBullet();
        if(myBullet && myBullet.isStillAlive) myBullet.makeBlueBullet();
    }
}

class SpreadLaser extends Laser{

    canAttack(){
        return this.distanceToPlayer > 70;
    }

    canContinueCombo(){
        return isBetween(this.distanceToPlayer, 60, 110);
    }

    shootBullet(){
        let myBullet = super.shootBullet();
        if(myBullet && myBullet.isStillAlive) myBullet.velocity.angle += randRange(-0.5, 0.5);
    }
}