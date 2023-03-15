class InvisSamurai extends Samurai{
    constructor(){
        super();

        this.runSpeed = 3;
        this.dashAttackSpeed = 18;
        this.sidestepSpeed = 20;
        
        this.knockbackSpeed = 60;
        this.knockbackTime = 0.2;
        
        this.difficultyMultiplier = 0.95;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =  1 + (this.difficulty-1)/2;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/7;
        this.dodgePower =     1 + (this.difficulty-1)/8;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('run',
        [
            [new Run(this, 0.6)],
            [new Wave(this, 2.5, 1, 'wave'), new MediumShortDashAttack(this, 0.5, 0, 'dashAttack')]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new SamuraiDashAttack(this, 0.5, 0), new ShieldSpread(this, 1.0)]
        ]));

        comboList.push(new Combo('wave',
        [
            [new Wave(this, 2.5, 1)],
            [new Wave(this, 1.0, 1)]
        ]));

        comboList.push(new Combo('homing',
        [
            [new Homing(this, 0.4, 0), new SoldierRapid(this, 1.2)]
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

    get invisible(){
        return this.isAttacking && this.currentAttack.canInvis;
    }
}