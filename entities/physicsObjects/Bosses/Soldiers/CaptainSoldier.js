class CaptainSoldier extends Soldier{
    constructor(parent = null){
        super();
        this.runSpeed = 5;
        this.sidestepSpeed = 5;

        this.difficultyMultiplier = 0.6;
        this.health = 2;

        this.parent = parent;
        this.otherBosses = [];

        this.velocity = new Vector(200, 0);
        this.velocity.angle = randRange(0, 2*Math.PI);
        
        if(!this.parent){
            let bot = new CaptainSoldier(this)
            scene.bossManager.bosses.push(bot);
            this.otherBosses.push(bot);
        }
    }

    setIndex(){
        if(this.parent) this.index = this.parent.myBots.length;
    }

    setDifficulty(){
        super.setDifficulty();
        this.shootSpeed =     this.runSpeed*1/2;
        this.agressiveness =  1 + (this.difficulty-1)/2;
    }

    createAttackManager(){
        
        this.attackManager = new AttackManager(this);
        let comboList = []

        
        comboList.push(new Combo('dodge',
        [
            [new ShootDodge(this, 0.1)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new FakeDashAttack(this, 0.8)],
            [new ShortDashAttack(this, 0.3, 1), new ShootDodge(this, 0.1), new Rapid(this, 0.5)]
        ]));

        comboList.push(new Combo('pistol', 
        [
            [new Pistol(this, 0.5, 0), new FakeDashAttack(this, 0.6, 1, 'dashAttack')]
        ]));

        comboList.push(new Combo('rapid',
        [
            [new Rapid(this, 0.8)]
        ]));

        comboList.push(new Combo('homing',
        [
            [new Homing(this, 0.5)]
        ]));
        
        
        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(3/this.agressiveness);
    }

    get clockwise(){
        return this._clockwise;
    }

    set clockwise(doesNothing){
        this._clockwise = true;
    }

    get vectorToPlayer(){
        let vector = this.target.position.subtract(this.position);
        vector.angle += Math.PI/6;
        return vector;
    }

    doFirstFrame(){
        super.doFirstFrame();
        if(this.parent){
            this.otherBosses.push(this.parent);
            for(let i of this.parent.otherBosses){
                if(i != this) this.otherBosses.push(i);
            }
        }
    }

    update(){
        super.update();

        if(this.children)
            for(let i of this.children) i.update();
    }

    updateImage(){
        super.updateImage();

        if(this.children)
            for(let i of this.children) i.updateImage();
    }

    killBoss(){
        this.healsPlayer = true;
        for(let i of this.otherBosses)
            if(i.isAlive) this.healsPlayer = false;

        super.killBoss(false, this.healsPlayer);
    }
}