class Clocksmith extends Boss{
    constructor(){
        super();
        this.name = 'clocksmith';

        this.position = new Vector(this.arenaCenter.x, this.arenaTop - 50);

        // runSpeed is in a getter
        this.newRunSpeed;
        this.dashAttackSpeed = 20;

        this.speed = this.runSpeed;
        this.normalFriction = 4;
        this.friction = this.normalFriction;

        this.difficultyMultiplier = 1.0;
        this.botMultiplier = 0.8;

        this.wasBotLastFrame;
        this.timeOfBotChange = time.runTime;
        this.botMultiplier = 1;
        
        this.minimumDistanceToDodge = 20 * this.dodgePower;
        
        this.health = 3;

        this.normalMinDistance = Math.max(100 / this.dodgePower, 60);
        this.normalMaxDistance = Math.max(120 / this.dodgePower, 100);
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;
        
        this.knockbackSpeed = 70;
        this.knockbackTime = 0.2;
        
        this.normalLookAheadTime = 0.8;
        this.lookAheadTime = this.normalLookAheadTime;

        this.myBots = [];

        this.startTextList = [
            "In ill thoughts again?",
            "Stop being silly. You must sleep.",
            "This is for your own good.",
            "This hurts me more than it hurts you."
        ]

        this.deathTextList = [
            'Help!!!'
        ]

        this.song = 'sounds/factoryTheme.wav';
        this.songIsInstant = true;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =  1 + (this.difficulty-1)/4;
        this.attackPower =    1 + (this.difficulty-1)/5;
        this.shootSpeed =     this.runSpeed;
        this.localSpeedMult = 1 + (this.difficulty-1)/3;
        this.dodgePower =     1 + (this.difficulty-1)/8;
        this.botCooldown =    8 / (1 + (this.difficulty-1)/5);

    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 0.5, 0)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }
    
    createAnimations(){
        this.animationManager = new PresetAnimationManager(this, 'clocksmith');
    }

    get runSpeed(){
        if(this.newRunSpeed > 0) return this.newRunSpeed;

        if(this.isBot) return 1;
        return 7;
    }

    set runSpeed(_runSpeed){
        this.newRunSpeed = _runSpeed;
    }

    get isBot(){
        if(this.distanceToPlayer > this.minDistance) return true;
        return false;
    }

    doFirstFrame(){
        super.doFirstFrame();
        this.createBotsCircle(45, 2*Math.PI, 3*this.attackPower, 2*Math.PI / 3.5/this.attackPower/2);
    }

    update(){
        super.update();

        if(this.isBot != this.botLastFrame){
            this.timeOfBotChange = time.runTime;
            this.botLastFrame = this.isBot;
        }
    }

    createBotsCircle(distance, angleChange, numBots, offset = 0, startingVelocity = new Vector(0, 0)){
        numBots = Math.floor(numBots*this.botMultiplier);
        let startAngle = this.angleToPlayer - angleChange/2 + offset;

        for(let i = 0; i < numBots; i++){
            let angle = startAngle + i*angleChange/numBots;
            
            let botPosition = new Vector(distance, 0);
            botPosition.angle = angle;
            botPosition = botPosition.add(this.position);

            if(
                botPosition.insideOf(
                    new Vector(this.arenaRight, this.arenaTop), 
                    new Vector(this.arenaLeft, this.arenaBottom))
            ){
                this.createBot(botPosition, startingVelocity);
            }
        }

        time.delayedFunction(this, 'createBotsCircle', this.botCooldown, [30, Math.PI, 1.5*this.attackPower]);
    }

    createBot(startingPosition, startingVelocity){
        console.assert(startingPosition && startingVelocity, startingPosition, startingVelocity);
        
        let bot = new ClocksmithBot(this.arenaCenter, this.arenaSize, this.difficulty);

        bot.position = startingPosition;
        bot.velocity = startingVelocity;

        bot.parent = this;
        bot.setIndex();

        this.myBots.push(bot);
    }

    killBoss(){
        super.killBoss();
        time.stopFunctions(this, 'createBotsCircle');
    }
    
    endKnockback(){
        super.endKnockback();
        this.healthBar.stopDisplay();
        this.teleportAway();

        time.stopFunctions(this, 'createBotsCircle')
        this.createBotsCircle(20, 2*Math.PI, 2.5*this.attackPower);
    }

    teleportAway(){
        this.position = this.arenaCenter;

        let newVector = new Vector(1, 0);
        newVector.magnitude = this.arenaSize.y/2 - 25;
        newVector.angle = this.angleToPlayer + Math.PI;

        this.position = this.arenaCenter.add(newVector);
    }
}