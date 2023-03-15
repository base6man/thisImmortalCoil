class Quad extends Attack{

    setup(){
        this.speed = this.boss.shootSpeed;

        this.canInvis = true;
    }

    canAttack(){
        
        return (
            (this.futureAngleToPlayer % Math.PI/2 < 0.15 || this.futureAngleToPlayer % Math.PI/2 > Math.PI/2 - 0.15) &&
            isBetween(this.distanceToPlayer, 60, 110)
        );
    }

    canContinueCombo(){
        
        return (
            (this.futureAngleToPlayer % Math.PI/2 < Math.PI/8 || this.futureAngleToPlayer % Math.PI/2 > Math.PI/2 - Math.PI/8) &&
            isBetween(this.distanceToPlayer, 50, 120)
        );
    }

    delayAttack(angleInit = 0, isFast = false, angleChange = Math.PI/2){

        let shootTime, delay;
        if(isFast){
            shootTime = 0.08/this.difficulty;
            delay = 0;
        }
        else{
            shootTime = 0.15/this.difficulty;
            delay = 0.12/this.agressiveness;
        }

        // Because it should go in exactly one circle
        let numShots = 2*Math.PI / angleChange;
        console.assert(Math.floor(numShots) == numShots, angleChange, numShots);

        for(let i = 0; i < numShots; i++){
            time.delayedFunction(this, 'shootBullet', shootTime*i+delay, [angleChange*i+angleInit, 0.001, 5]);
        }
        time.delayedFunction(this, 'finishAttack', shootTime*numShots + delay);
        time.delayedFunction(this, 'sendOut', shootTime*numShots + delay);
    }

    shootBullet(angle, speed, offset){
        let myBullet = super.shootBullet(angle, speed, offset, '', false);
        if(myBullet && myBullet.isStillAlive) {
            this.bullets.push(myBullet);
            myBullet.canBeStill = false;
        }
    }

    sendOut(){
        for(let i in this.bullets){
            this.bullets[i].velocity.magnitude = 150;
            this.bullets[i].canBeStill = true;
        }
        this.bullets = [];
    }
}


class FastQuad extends Quad{
    delayAttack(){
        super.delayAttack(0, true);
    }
}


class Diagonal extends Quad{
    canAttack(){
        
        return (
            isBetween(this.futureAngleToPlayer % Math.PI/2, Math.PI/4 - 0.15, Math.PI/4 + 0.15) &&
            isBetween(this.distanceToPlayer, 60, 110)
        );
    }

    canContinueCombo(){
        
        return (
            isBetween(this.futureAngleToPlayer % Math.PI/2, Math.PI/4 - Math.PI/8, Math.PI/4 + Math.PI/8) &&
            isBetween(this.distanceToPlayer, 50, 120)
        );
    }

    delayAttack(isFast = false){
        super.delayAttack(Math.PI/4, isFast);
    }
}


class FastDiagonal extends Diagonal{
    delayAttack(){
        super.delayAttack(true);
    }
}

class EightWay extends Quad{
    setup(){
        this.quad = new Quad(this.boss);
        this.diagonal = new Diagonal(this.boss);
    }

    canAttack(){
        return this.quad.canAttack() || this.diagonal.canAttack();
    }

    canContinueCombo(){
        return this.quad.canContinueCombo() || this.diagonal.canContinueCombo();
    }

    delayAttack(){
        super.delayAttack(0, true, Math.PI/4);
    }
}