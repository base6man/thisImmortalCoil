class AttackClocksmithBot extends ClocksmithBot{
    constructor(arenaCenter, arenaSize){
        super(arenaCenter, arenaSize);

        this.runSpeed = 4;

        this.difficultyMultiplier = 0.4;

        this.minimumDistanceToDodge = 35 * this.dodgePower;
        this.dashAttackSpeed = 20;
    }

    setDifficulty(){
        super.setDifficulty();
        this.agressiveness =  1 + (this.difficulty-1)/6;
        this.attackPower =    1 + (this.difficulty-1)/6;
        this.shootSpeed =     this.runSpeed;
        this.localSpeedMult = 1 + (this.difficulty-1)/3;
        this.dodgePower =     1 + (this.difficulty-1)/3;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []


        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 1.5, 0)]
        ]));
        
        comboList.push(new Combo('homing',
        [
            [new Homing(this, 2, 0)]
        ]));
        
        comboList.push(new Combo('dashAttack',
        [
            [new DashAttack(this, 3)],
            [new ShortDashAttack(this, 1, 1)]
        ]));
        
        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(0);
    }
}