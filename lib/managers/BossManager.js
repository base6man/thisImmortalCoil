class BossManager{
    constructor(p){
        this.p = p;
        this.bosses = [];

        this.hasBeenInRoom = false;
        this.hasSpawned

        this.bossIndex = 0;
        this.bossNumber;

        this.bossesThatCannotSpawn = [];

        this.bossOrder = [
            {boss: 'guard', num: 1},

            {boss: 'clocksmith', num: 1.5},
            {boss: 'soldier', num: 2},

            {boss: 'knight', num: 2.5},
            {boss: 'soldier', num: 3},
            {boss: 'clocksmith', num: 3},

            {boss: 'attackClocksmith', min: 3.5, max: 4},
            {boss: 'shotgunKnight', min: 3.5, max: 4},
            {boss: 'invisSamurai', min: 3.5, max: 4},
            {boss: 'captainSoldier', min: 3.5, max: 4},

            {boss: 'hardGuard', num: 4.5},
            {boss: 'hardGuard', num: 5}
        ];
        if(getMaxDifficulty() > 2 && getMaxDifficulty() < 3.5)
            this.bossOrder.push({boss: 'samurai', num: 3});

    }

    get numBosses(){
        if(runNumber == 0) return 1;
        if(runNumber == 1 || runNumber == 2) return 2;
        if(runNumber == 3) return 3;
        if(runNumber == 4) return 1;
    }

    update(){
        for(let i in this.bosses) this.bosses[i].update();

        
        if(scene.player.position.insideOf(new Vector(-200, -120), new Vector(200, 120)) && !this.hasBeenInRoom){

            /*
            this.hasBeenInRoom = true;
            this.spawnBoss();
            */
        }
        
    }

    get willSpawnAnotherBoss(){
        return this.bossIndex < this.numBosses;
    }

    get timeUntilNextBoss(){
        return 40 / Math.sqrt(difficulty);
    }

    bossToCreate(name){
        this.nameOfBoss = name;
        switch(name){
            case 'guard':           return new Guard();
            case 'multiGuard':      return new MultiGuard();
            case 'soldier':         return new Soldier();
            case 'clocksmith':      return new Clocksmith();
            case 'attackClocksmith':return new AttackClocksmith();
            case 'knight':          return new Knight();
            case 'samurai':         return new Samurai();
            case 'shotgunKnight':   return new ShotgunKnight();
            case 'invisSamurai':    return new InvisSamurai();
            case 'captainSoldier':  return new CaptainSoldier();
            case 'hardGuard':       return new HardGuard();
            default: console.assert(false, name);
        }
    }

    sameBoss(first, second, repeat = false){
        if(first == 'hardGuard' && second == 'hardGuard') return false;

        if(first == second) return true;
        if(first == 'soldier' && second == 'captainSoldier') return true;
        if(first == 'clocksmith' && second == 'attackClocksmith') return true;
        if(first == 'knight' && second == 'shotgunKnight') return true;
        if(first == 'samurai' && second == 'invisSamurai') return true;
        if(!repeat && this.sameBoss(second, first, true)) return true;
        return false;
    }

    updateImage(){
        for(let i in this.bosses) this.bosses[i].updateImage();
    }

    bossIsHit(boss){
        let index = this.bosses.indexOf(boss);
    }

    spawnBoss(npc, wall){
        if(this.bossIndex >= this.numBosses) return;
        
        const myDifficulty = Math.round(difficulty*2)/2;
        
        if(wall && !this.wall) {
            this.wall = wall;
        }
        else if (!this.wall){
            this.wall = new Wall(-100, 120, 100, 1000, this.p);
        }
        let otherWall = new Wall(-20, -120, 20, -1000, this.p);
        
        let newBoss;
        if(npc) {
            // Change boss type here
            newBoss = this.bossToCreate(npc.name);
            if(myDifficulty >= 3) this.bossesThatCannotSpawn.push(npc.name);

            this.bosses.push(newBoss);
            newBoss.position = npc.position;
            npc.delete();
            
            scene.endCutscene();
            scene.updateSong(newBoss.song, 1.0, newBoss.songIsInstant);
        }
        else{   
            
            scene.player.createDialougue([
                new Quote([''], 1)
            ]);

            let possibleBosses = [];
            for(let i of this.bossOrder){
                if(isBetweenInclusive(myDifficulty, i.min, i.max) || myDifficulty == i.num) possibleBosses.push(i);
            }
    
            let bossIsNew;
            let index;
            while(!bossIsNew){
                index = randRangeInt(0, possibleBosses.length - 1);
                bossIsNew = true;
                console.log(possibleBosses[index].boss, index, possibleBosses);
    
                for(let i of this.bossesThatCannotSpawn)
                    if(this.sameBoss(i, possibleBosses[index].boss)) bossIsNew = false;
            }
            
            console.assert(possibleBosses[index] && possibleBosses[index].boss, possibleBosses[index]);
            const name = possibleBosses[index].boss;

            if(myDifficulty >= 3) this.bossesThatCannotSpawn.push(name);

            // Change boss type here
            newBoss = this.bossToCreate(name);
            this.bosses.push(newBoss);

            newBoss.position = new Vector(0, 0); 
            
            if(randRange(0, 1) > 1){
                //time.delayedFunction(scene.player, 'onBattleStart', 0.3);
            }
            else{
                newBoss.willSayStartText();
                time.delayedFunction(newBoss, 'sayStartText', 0.3);
            }

            if(runNumber == 2 || runNumber == 3)
                scene.updateSong();
            else if(this.bossIndex == 0 || runNumber == 1)
                scene.updateSong(newBoss.song);
        }

        this.bossIndex++;
        scene.bulletsCannotSpawn = false;
    }

    killBoss(index){
        let oldBoss = this.bosses.splice(index, 1)[0];

        if(this.bosses.length == 0){
            scene.referenceBosses = [];
            
            const myDifficulty = Math.round(difficulty*4)/4;
            console.log("difficulty:", myDifficulty)

            if(myDifficulty == 1.5 && getMaxDifficulty() <= 1 && !hardMode) {
                scene.orderlyIntro();
                scene.player.bossIsKilled(oldBoss);
            }
            else if (myDifficulty == 2 && getMaxDifficulty() <= 1.5 && !hardMode) {
                time.delayedFunction(this.wall, 'delete', 12);
                scene.player.createDialougue([
                    new Quote(['This place.'], 0),
                    new Quote(["The people that work here.", "It's all distorted."], 1.5),
                    new Quote(["Dot... Why did you bring me here?"], 5),
                    new Quote(["How could you do this to a loved one?"], 8),
                    new Quote([""], 11)
                ]);

                scene.transition = new TypedTransition([
                    new Quote("Opening Door...", 10),
                    new Quote(" ", 13)
                ], this.p)
            }
            else if (myDifficulty == 4 && getMaxDifficulty() <= 3.5 && !hardMode){
                console.log("Second dot intro!");
                scene.secondDotIntro();
                scene.player.bossIsKilled(oldBoss);
            }
            else if(this.bossIndex < this.numBosses) {

                time.delayedFunction(this, 'spawnBoss', 1);
                scene.player.bossIsKilled(oldBoss);
            }
            else if (this.bossIndex >= this.numBosses){
                
                this.wall.delete();
                scene.player.finalBossIsKilled(oldBoss);
            }
        }
        else{
            for(let i = index; i < this.bosses.length; i++){
                this.bosses[i].moveDownOneIndex();
            }

            scene.player.bossIsKilled(oldBoss);
        }

        for(let i of scene.bullets)
            i.dissapate();
    }
}