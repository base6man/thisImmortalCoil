class ShotgunKnight extends Knight{
    constructor(){
        super();
        this.name = 'shotgunKnight';

        this.doesWalls = true;
        this.difficultyMultiplier = 0.7;
        this.delayBetweenWalls = 4 / this.agressiveness;
        this.delay = 0.15 / this.agressiveness;

        this.dashAttackSpeed = 25;
        
        this.minimumDistanceToDodge = 60;

        this.minDistance = 0;
        this.maxDistance = 80;
    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('shield',
        [
            [new Shield(this)]
        ]));

        comboList.push(new Combo('stopPistol',
        [
            [new StopPistol(this, 0.4, 1)],
            [new StopPistol(this, 0.2, 1), new FreeWave(this, 1.5)],
            [new LongDashAttack(this, 0.1, 0, 'dashAttack')]
        ]));

        comboList.push(new Combo('shieldSpread',
        [
            [new ShieldSpread(this, 0.4, 1)],
            [new ShieldSpread(this, 0.6, 1), new DashAttack(this, 0.4, 0, 'dashAttack')]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 0.2, 0)]
        ]));

        comboList.push(new Combo('laser',
        [
            [new SpreadLaser(this, 0.8)]
        ]));

        comboList.push(new Combo('rapid',
        [
            [new Rapid(this, 0.8)],
            [new SoldierRapid(this, 0.4, 0, 'dashAttack')]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }
}