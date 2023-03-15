class Wave extends Attack{
    
    setup(){
        this.maxAttacks = Math.min(Math.floor(1*this.difficulty), 3);
        this.speed = 0;
        this.bulletAcceleration = 200;

        this.canInvis = true;
    }

    canAttack(){
        
        return(
            isBetween(this.distanceToPlayer, 90, 110) &&
            isBetween(this.futureDistanceToPlayer, 100, 120)
        );
    }

    canContinueCombo(){
        
        return(
            isBetween(this.distanceToPlayer, 90, 120) &&
            this.combo.numAttacks < this.maxAttacks
        );
    }

    delayAttack(){
        for(let i = 0; i < 2*Math.PI; i += Math.PI/40){
            let myBullet = this.shootBullet(i, 1, 0, false);
            if(myBullet && myBullet.isStillAlive) {
                myBullet.acceleration = 200;
                myBullet.timeAlive = 2;
            }
        }
        this.finishAttack();
    }
}

class SoldierWave extends Wave{
    
    canAttack(){
        return(
            this.distanceToPlayer > 80
        );
    }

    canAttack(){
        return(
            this.distanceToPlayer > 70
        );
    }
}

class FreeWave extends Wave{
    canAttack(){        return true; }
    canContinueCombo(){ return true; }
}

class FreeSlowWave extends FreeWave{
    setup(){
        super.setup();
        this.bulletAcceleration = 100;
    }
}