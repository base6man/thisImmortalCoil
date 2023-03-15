class Samurai extends Boss{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        this.name = 'samurai';

        this.runSpeed = 7;
        this.dashAttackSpeed = 25;
        this.sidestepSpeed = 30;

        this.difficultyMultiplier = 0.8;

        this.normalMinDistance = 50;
        this.normalMaxDistance = 120;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;

        this.speed = this.runSpeed;
        this.normalFriction = 3;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 60 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 80 * (this.dodgePower + 4)/5;

        this.dodgeDist = 70 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.4;
        
        this.health = 3;
        
        this.knockbackSpeed = 40;
        this.knockbackTime = 0.1;
        
        this.normalLookAheadTime = 0.6;
        this.lookAheadTime = this.normalLookAheadTime;

        this.head = new Head(this, samuraiHeads);
        this.head.timeToSwitch = 1.0;
        
        this.body = new Body(this, 'samurai');
        this.hasHeadAndBody = true;

        this.song = 'sounds/beep.wav'
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =  1 + (this.difficulty-1)/2;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     0;
        this.localSpeedMult = 1 + (this.difficulty-1)/7;
        this.dodgePower =     1 + (this.difficulty-1)/8;
    }
    
    get animationName(){
        if(this.diagonal && this.direction == 'up')    return 'right';
        if(this.diagonal && this.direction == 'right') return 'right';
        if(this.diagonal && this.direction == 'left')  return 'left';
        if(this.diagonal && this.direction == 'down')  return 'left';
        if(this.direction == 'up')    return 'up';
        if(this.direction == 'right') return 'right';
        if(this.direction == 'left')  return 'left';
        if(this.direction == 'down')  return 'idle';
        return 'idle';
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('dodge',
        [
            [new SideDodge(this, 0.2)]
        ]));

        comboList.push(new Combo('bluePistol',
        [
            [new BluePistol(this, 0.4, 0), new SamuraiDashAttack(this, 1.2, 0, 'dashAttack'), new Rapid(this, 0.4)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new SamuraiDashAttack(this, 0.5, 0), new ShortLaser(this, 1.0)]
        ]));

        comboList.push(new Combo('laser',
        [
            [new ShortLaser(this, 0.6)]
        ]))

        comboList.push(new Combo('homing',
        [
            [new Homing(this, 0.6, 0), new Rapid(this, 1.2)]
        ]));

        comboList.push(new Combo('bounceShot',
        [
            [new BouncePistol(this, 1.2)],
            [new Laser(this, 0.4)]
        ]));

        let spread = new Combo('shieldSpread',
        [
            [new ShieldSpread(this, 0.5)],
            [new BouncePistol(this, 0.6), new SamuraiDashAttack(this, 0.2, 1), new SideDodge(this), new FreeWave(this, 1.8)]
        ]);
        comboList.push(spread);
        this.attackManager.firstCombo = spread;

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }

    endKnockback(){
        super.endKnockback();
        this.attackManager.startAttacking();
    }
}