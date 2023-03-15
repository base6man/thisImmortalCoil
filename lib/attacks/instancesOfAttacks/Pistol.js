class Pistol extends Attack{

    setup(){
        this.velocityCurve = 0.8;
        this.agression = 0.5;
        this.bulletSpeed = 100;
    }

    canAttack(){
        
        return (
            isBetween(this.distanceToPlayer, 50, 75) &&
            isBetween(this.futureDistanceToPlayer, 50, 75)
        );
    }

    canContinueCombo(){
        
        return (
            isBetween(this.distanceToPlayer, 45, 90)
        );
    }

    attack(){
        super.attack();
    }

    get shootAngle(){
        
        let velocityCurve = this.velocityCurve * this.target.velocity.magnitude / (this.target.runSpeed * this.target.speedMult);

        let bulletVector = this.vectorToPlayer;
        bulletVector.magnitude = 1;

        let playerVelocity = this.target.velocity.copy();
        playerVelocity.magnitude = velocityCurve;

        bulletVector = bulletVector.add(playerVelocity);

        return bulletVector.angle;
    }

    delayAttack(){
        this.shootBullet(this.shootAngle, this.bulletSpeed);
        this.finishAttack();
    }
}

class BluePistol extends Pistol{

    canAttack(){
        return this.boss.tooCloseToGhost || this.boss.tooCloseToPlayer;
    }

    canContinueCombo(){
        return this.boss.tooCloseToGhost || this.boss.tooCloseToPlayer;
    }

    delayAttack(){
        let tempTarget = this.target;
        if(this.boss.ghost){
            let distanceToGhost = this.boss.ghost.position.subtract(this.boss.position).magnitude;
            if(distanceToGhost < this.distanceToPlayer) this.target = this.boss.ghost;
        }
        
        let myBullet = this.shootBullet(this.shootAngle, this.bulletSpeed, 0, '', false);
        if(myBullet && myBullet.isStillAlive) myBullet.makeBlueBullet();
        this.finishAttack();

        this.target = tempTarget;
    }
}

class BouncePistol extends Pistol{
    setup(){
        super.setup();
        this.bulletSpeed = 160;
    }

    canAttack(){
        return isBetween(this.distanceToPlayer, 90, 110);
    }

    canContinueCombo(){
        return this.distanceToPlayer > 75;
    }
    
    delayAttack(){
        let myBullet = this.shootBullet(this.shootAngle, this.bulletSpeed, 0, 'bounce', false);
        if(myBullet && myBullet.isStillAlive)
            myBullet.bounceAcceleration = 1.15;
        this.finishAttack();
    }
}

class StopPistol extends Pistol{
    setup(){
        super.setup();
        this.timeToStop = 1;
        this.agression = 1;

        this.velocityCurve = 0.3;

        this.numBullets = Math.min(Math.floor(2.5 * this.difficulty), 7);

        this.bulletSpeed = 60;
        this.speedInacuraccy = 40;
        this.angleInacuraccy = Math.PI/4;
    }

    canAttack(){
        return isBetween(this.distanceToPlayer, 75, 100);
    }

    canContinueCombo(){
        return isBetween(this.distanceToPlayer, 60, 120);
    }

    delayAttack(){
        let speed = this.bulletSpeed + randRange(-this.speedInacuraccy, this.speedInacuraccy);
        let angle = this.shootAngle  + randRange(-this.angleInacuraccy, this.angleInacuraccy);

        let myBullet = this.shootBullet(angle, speed, 0, '', false);
        if(myBullet && myBullet.isStillAlive)
            myBullet.acceleration = -1 * speed / this.timeToStop;
            
        time.delayedFunction(this, 'stopBullet', this.timeToStop, [myBullet]);

        this.finishAttack();
    }

    stopBullet(bullet){
        if(!bullet) return;
        bullet.velocity.magnitude = 0;
        bullet.acceleration = 0;
        bullet.homing = 0;
    }
}