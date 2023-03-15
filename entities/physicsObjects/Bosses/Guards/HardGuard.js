class HardGuard extends Guard{
    constructor(){
        super();

        this.runSpeed = 7;
        this.normalFriction = 1.5;

        this.sidestepSpeed = 20;
        this.dashAttackSpeed = 25;

        this.minimumDistanceToDodge = 40;

        this.difficultyMultiplier = 0.8;

        
        if(this.globalDifficulty == 4.5) {
            this.difficultyMultiplier = 0.3;
            this.health = 1;
            this.addTwoHealth = true;
        }
        

        this.speed = this.runSpeed;
        this.friction = this.normalFriction;

        this.startTextList = [
            "You're breaking my heart, Sam!",
            "Sam, stop!. For my sake, stop!",
            "I can't lose you! I won't lose you!",
            "I won't let you do this, Sam!"
        ]

        this.deathTextList = ["Sam..."]

        if(this.addTwoHealth) 
            this.deathTextList = ["No..!"]
        

        this.song = 'sounds/lament.wav';
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []
    
        
        let dodge = new Combo('dodge',
        [
            [new ShootDodge(this), new ShortDashAttack(this, 0.5), new Sidestep(this)]
        ]);
        comboList.push(dodge);
        this.attackManager.firstCombo = dodge;
    
        comboList.push(new Combo('rapid',
        [
            [new Rapid(this, 0.4)],
            [new Strafe(this, 0.8, 0, 'strafe'), new ShortLaser(this, 1), new Rapid(this, 0.6, 1)]
        ]));
    
        comboList.push(new Combo('quad',
        [
            [new Quad(this, 1, 1), new Diagonal(this, 1, 2)],
            [new FastDiagonal(this, 0.5, 2), new EightWay(this, 0.5, 3)],
            [new FastQuad(this, 0.5, 1), new EightWay(this, 0.5, 3)]
        ]));
        
        comboList.push(new Combo('homing',
        [
            [new Homing(this, 0.8)],
            [new Homing(this, 0.5, 1), new Strafe(this, 0.6, 0, 'strafe'), new FreeWave(this, 1.0)]
        ]));
        
        comboList.push(new Combo('strafe',
        [
            [new Strafe(this, 0.8, 0), new Pistol(this, 0.6, 0, 'pistol')]
        ]));
    
        comboList.push(new Combo('pistol',
        [
            [new BluePistol(this)],
            [new ShortDashAttack(this, 1.0), new BluePistol(this, 1.0, 1), new Sidestep(this, 1.0), new Rapid(this, 1.0), new Homing(this, 1.0, 1, 'homing')]
        ]));
    
        comboList.push(new Combo('wave',
        [
            [new Wave(this, 1.2, 1)],
            [new Wave(this, 1.2, 1), new SoldierRapid(this, 0.6)]
        ]));
        
    
        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(0);
    }

    willSayStartText(){
        if(!this.addTwoHealth) return;
        super.willSayStartText();
    }

    sayStartText(){
        if(!this.addTwoHealth) return;
        super.sayStartText();
    }

    doFirstFrame(){
        super.doFirstFrame();
        
        this.healthBar.delete();
        this.otherHealthBar.delete();

        this.healthBar = scene.createHealthBar(this, 3);
        this.otherHealthBar = scene.createHudHealthBar(this, 3);
    }

    displayHealth(){
        if(this.addTwoHealth){
            this.healthBar.display(this.health+2);
            this.otherHealthBar.display(this.health+2);
        }
        else{ super.displayHealth(); }
    }

    getHitAndDie(){
        super.getHitAndDie();
        scene.updateSong(this.song, 0.6, true);
        if(this.addTwoHealth){
            
            /*
            scene.npcs.push(new Npc('guard', this.position, voiceEffects.dot, 
            [
                "Not yet.", 0.8,
                "delete", 2.2
            ]));
            */

            time.delayedFunction(scene, "blinkOutToNewScene", 0.2);
        }
        else{
            scene.displayFloor = true;
            scene.finalDotOutro(this.position);
        }
    }

    endPlayerFreeze(){
        if(this.addTwoHealth){
            this.target.freeze();
            this.target.velocity.divide(40);
            this.target.freezedInput.divide(10);
        }
        else{
            this.target.freezedInput = new Vector(0, 0);
        }
    }
}