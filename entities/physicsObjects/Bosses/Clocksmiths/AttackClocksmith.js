class AttackClocksmith extends Clocksmith{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);
        this.name = 'attackClocksmith';

        this.difficultyMultiplier = 0.6;

        this.newRunSpeed = 0;

        this.botMultiplier = 0.7;
    }

    get runSpeed(){
        if(this.newRunSpeed > 0) return this.newRunSpeed;

        if(this.isBot) return 4;
        return 9;
    }

    set runSpeed(_runSpeed){
        this.newRunSpeed = _runSpeed;
    }
    
    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        
        comboList.push(new Combo('dodge',
        [
            [new Dodge(this, 0.1)]
        ]));

        comboList.push(new Combo('rapid',
        [
            [new Rapid(this, 0.4)],
            [new Strafe(this, 0.8, 0, 'strafe'), new Laser(this, 1), new Rapid(this, 0.6, 1)]
        ]));

        comboList.push(new Combo('quad',
        [
            [new Quad(this, 1, 1), new Diagonal(this, 1, 2)],
            [new FastDiagonal(this, 0.5, 2)],
            [new FastQuad(this, 0.5, 1)]
        ]));
        
        comboList.push(new Combo('homing',
        [
            [new Homing(this, 1.2)],
            [new Homing(this, 0.5, 1), new Strafe(this, 0.6, 0, 'strafe')]
        ]));
        
        comboList.push(new Combo('strafe',
        [
            [new Strafe(this, 0.8, 0), new Pistol(this, 0.6, 0, 'pistol')]
        ]));

        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('wave',
        [
            [new Wave(this, 1.8, 1)],
            [new Wave(this, 1.2, 1), new Laser(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('laser',
        [
            [new Laser(this, 0.8)]
        ]));

        comboList.push(new Combo('eightWay',
        [
            [new EightWay(this, 0.6)]
        ]));
        

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }
    
    createBot(startingPosition, startingVelocity){
        let bot = new AttackClocksmithBot(this.arenaCenter, this.arenaSize, this.difficulty);

        bot.position = startingPosition;
        bot.velocity = startingVelocity;

        bot.parent = this;
        bot.setIndex();

        this.myBots.push(bot);
    }
}