class DashAttack extends Attack{

    setup(){
        this.friction = 0;

        this.windupSpeed = this.boss.shootSpeed;
        this.speed = this.boss.dashAttackSpeed / this.boss.localSpeedMult;
        this.lookAheadTime = 0.5;

        this.melee = true;

        this.name = 'dashAttack';
        this.hitInvinciblePlayer = true;
        this.makeSoldierInvincible = false;
    }

    canAttack(){
        return true;
    }

    canContinueCombo(){
        return isBetween(this.distanceToPlayer, 70, 110);
    }

    delayAttack(isFake = false){

        this.boss.minDistance = 0;
        this.boss.maxDistance = 0;
        this.boss.friction = this.friction;
        
        this.lookAheadTime = this.distanceToPlayer / 200;
        this.boss.velocity.angle = this.futureVectorToPlayer.angle;

        this.boss.speed = this.speed;
        
        let dashTime;
        if(isFake){
            dashTime = this.distanceToPlayer / this.boss.speed * 2/5;
        }
        else{
            dashTime = this.distanceToPlayer / this.boss.speed;

            let myBullet = this.shootBullet(this.boss.velocity.angle, this.boss.speed, 8, '', false);
            if(myBullet && myBullet.isStillAlive) {
                myBullet.timeAlive = dashTime;
                myBullet.melee = true;
                myBullet.hitInvinciblePlayer = this.hitInvinciblePlayer;
            }
        }

        time.delayedFunction(this, 'startInvincible', dashTime - 0.1);
        time.delayedFunction(this, 'finishAttack', dashTime);
    }

    update(){
        super.update();
        if(this.isAttacking && this.distanceToPlayer < 15) this.finishAttack();
    }

    startInvincible(){
        this.makeSoldierInvincible = true;
    }

    finishAttack(){
        time.stopFunctions(this, 'startInvincible');
        this.makeSoldierInvincible = false;
        super.finishAttack();
    }
}

class ShortDashAttack extends DashAttack{

    setup(){
        super.setup();
        this.maxDistance = this.boss.minimumDistanceToDodge;
        this.maxAttacks = Math.min(Math.floor(2*this.difficulty), 4);
        this.maxParentDelay = 0.4;

        this.distanceToNotAttack = this.maxDistance * 2;
        
        this.hitInvinciblePlayer = false;
    }

    canAttack(){
        return this.distanceToPlayer < this.maxDistance;
    }

    canContinueCombo(){
        return this.distanceToPlayer < 70 && this.combo.numAttacks < this.maxAttacks;
    }

    delayAttack(){
        if(this.distanceToPlayer < this.distanceToNotAttack){
            super.delayAttack();
        }
        else{
            this.finishAttack();
        }
    }
}

class MediumShortDashAttack extends DashAttack{
    canAttack(){
        return this.distanceToPlayer < 90;
    }
    
    canContinueCombo(){
        return this.distanceToPlayer < 100;
    }
}

class SamuraiDashAttack extends ShortDashAttack{
    setup(){
        super.setup();
        this.distanceToNotAttack = this.maxDistance * 1.2;
    }
}

class LongDashAttack extends DashAttack{
    canAttack(){
        return this.distanceToPlayer > 110;
    }

    canContinueCombo(){
        return this.distanceToPlayer > 90;
    }
}

class FakeDashAttack extends DashAttack{

    setup(){
        super.setup();
        
        this.isFake = false;
        //if(randRange(0, 1) > 0.5) this.isFake = true;
        if(this.isFake){
            this.differentComboDestination = 'sidestep';
            this.destination = 1;
        }
    }

    delayAttack(){
        super.delayAttack(this.isFake);
    }

    finishAttack(){
        super.finishAttack(this.isFake);
    }
}