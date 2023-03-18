class Knight extends Boss{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        this.name = 'knight';

        this.runSpeed = 3;
        this.dashAttackSpeed = 18;

        this.difficultyMultiplier = 0.8;
        
        this.normalMinDistance = 100;
        this.normalMaxDistance = 200;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 14;
        this.friction = this.normalFriction;

        this.minimumDistanceToDodge = 40 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 70 * (this.dodgePower + 4)/5;
        this.dodgeDist = 40 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.2;
        
        this.health = 3;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.1;

        this.normalLookAheadTime = 1;
        this.lookAheadTime = this.normalLookAheadTime;
        
        this.doesWalls = true;
        this.delayBetweenWalls = 2 / this.agressiveness;
        this.delay = 0.12 / this.attackPower;

        this.song = 'sounds/myHistoryAsAWriter.wav'
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =  1 + (this.difficulty-1)*2/3;
        this.attackPower =    1 + (this.difficulty-1)/4;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/8;
        this.localSpeedMult = 1 + (this.difficulty-1)/4;
        this.dodgePower =     1 + (this.difficulty-1)/3;
        
        if(this.doesWalls) this.createWalls();
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('shield',
        [
            [new Shield(this)]
        ]));

        comboList.push(new Combo('teleport',
        [
            [new Teleport(this, 2.5)]
        ]));

        comboList.push(new Combo('stopPistol',
        [
            [new StopPistol(this, 0.6)]
        ]));

        comboList.push(new Combo('shieldSpread',
        [
            [new ShieldSpread(this, 0.8)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new MediumShortDashAttack(this, 0.2)]
        ]));

        comboList.push(new Combo('laser',
        [
            [new ShieldLaser(this, 0.8)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }

    createAnimations(){
        this.animationManager = new PresetAnimationManager(this, 'knight');
    }

    createWalls(){
        let fullDelay = 0;
        let speed = 70;

        time.stopFunctions(this, 'createWalls');
        time.stopFunctions(this, 'createWallBullet');

        for(let i = 0; i < this.arenaSize.x-8; i+=12){
            fullDelay += this.delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaLeft+i+8, this.arenaTop), new Vector(0, -speed), 'down']);
        }
        fullDelay += this.delayBetweenWalls;

        for(let i = 0; i < this.arenaSize.y-8; i+=12){
            fullDelay += this.delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaRight, this.arenaTop-i-8), new Vector(-speed, 0), 'left']);
        }
        fullDelay += this.delayBetweenWalls;

        for(let i = 0; i < this.arenaSize.x-8; i+=12){
            fullDelay += this.delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaRight-i-8, this.arenaBottom), new Vector(0, speed), 'up']);
        }
        fullDelay += this.delayBetweenWalls;

        for(let i = 0; i < this.arenaSize.y-8; i+=12){
            fullDelay += this.delay;
            time.delayedFunction(this, 'createWallBullet', fullDelay, [new Vector(this.arenaLeft, this.arenaBottom+i+8), new Vector(speed, 0), 'right']);
        }
        fullDelay += this.delayBetweenWalls;
        
        time.delayedFunction(this, 'createWalls', fullDelay);
    }

    createWallBullet(position, velocity, rotation){
        let myBullet = new Bullet(7.5, position, velocity);
        myBullet.timeAlive = Infinity;
        myBullet.melee = true;
        myBullet.trueRotation = rotation;
        myBullet.timeAlive = 7;
    }

    killBoss(){
        super.killBoss();
        time.stopFunctions(this, 'createWalls');
        time.stopFunctions(this, 'createWallBullet');
    }
}