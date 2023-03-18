//const { ipcRenderer, remote } = require( "electron" );

class Scene{
    constructor(p, startingPlayerPosition = new Vector(94, -347)){
        this.p = p;
        this.startingPlayerPosition = startingPlayerPosition;

        this.player; 
        this.mainCamera;
        this.bossManager;
        this.bullets = [];
        this.walls = [];
        this.colliders = [];
        this.npcs = [];
        this.sceneTriggers = [];
        this.textboxes = [];
        this.floor;
        this.baseFloor;

        this.isFirstFrame = true;
        this.frameRateList = [];

        this.textBoxHeight = 20;
        this.quote = '';

        this.sceneEndText = 'loading...'
        this.runCredits;
        this.gameOver = false;

        this.uiElements = [];
        this.timeSinceLastHit = 999;

        this.referenceBosses = [];

        this.dashType = 0;
        this.ghostType = 0;

        this.bulletCannotSpawn = false;
        this.playerIsDead = false;
        this.transition;

        this.isInCutscene = false;
        this.fastForwarding = false;

        this.coverScreen = 0;
        this.coverScreenChange = 0;
        this.coverScreenColor = this.p.color(0, 0, 0);
        this.displayFloor = true;

        this.buttonPressed = false;

        this.isGlitched = false;
        this.glitchSeedX;
        this.glitchSeedY;
        this.glitchSeedIndex;

        time.stopSynch();
    }

    // Setup initializes variables that require operations
    setup() {
        let numSpecialTiles = 7;
        let floorChaos = runNumber * 0.15 / numSpecialTiles; 

        this.player = new Player(this.startingPlayerPosition, this.p);
        this.bossManager = new BossManager(this.p);

        if(runNumber == 5) {
            this.walls = []
            
            new Wall(-1000, 500, -50, 2000, this.p);
            new Wall(50, 500, 1000, 2000, this.p);
            new Wall(-1000, 580, 1000, 2000, this.p);

            floorChaos = 0;
            this.player.position = new Vector(-25, 550);

            this.coverScreen = 1;
            this.coverScreenChange = -1.2
        }
        else{
            new Wall(-1000, -120,   -11.5, -300, this.p);
            new Wall(1000, -120,    11.5, -300, this.p);
    
            new Wall(-1000, -300, -200, 500, this.p);
            new Wall(200, -300,   1000, 500, this.p);
    
            new Wall(-11.5, 500, -1000, 120, this.p);
            new Wall(11.5, 500,  1000, 120, this.p);
    
            new Wall(100, -380,   1000, -300, this.p);
            new Wall(-11.5, -380,   -1000, -300, this.p);
            new Wall(-1000, -380, 1000, -1000, this.p);
    
            new Wall(-1000, 500, -50, 2000, this.p);
            new Wall(50, 500, 1000, 2000, this.p);
            new Wall(-1000, 580, 1000, 2000, this.p);
        }
    
        usableFloorImage = [
            {image: rootFloorImage.null, spawnRate: 1},
            {image: rootFloorImage.cracked, spawnRate: floorChaos},
            {image: rootFloorImage.cracked1, spawnRate: floorChaos},
            {image: rootFloorImage.cracked2, spawnRate: floorChaos},
            {image: rootFloorImage.rusted, spawnRate: floorChaos},
            {image: rootFloorImage.rusted1, spawnRate: floorChaos},
            {image: rootFloorImage.rusted2, spawnRate: floorChaos},
            {image: rootFloorImage.electrical, spawnRate: floorChaos, noRotate: true}
        ]
        let baseFloorImage = [
            {image: rootFloorImage.simple, spawnRate: 1, noRotate: true}
        ]

        this.floor = new RandFloorTile(usableFloorImage);
        this.baseFloor = new RandFloorTile(baseFloorImage);
        
        this.mainCamera = new MainCamera(this.p);
        
        if(runNumber == 0 && getDeathCount()== 1){
            this.player.createDialougue([
                new Quote(["Isn't there another", "way to attack?"], 0.6),
                new Quote([''], 4.0)
            ]);
            
            this.transition = new TypedTransition([
                new Quote('Logging Attack Functions...', 2),
                new Quote('Quantum Step:\n"Use Arrow keys to split your position."', 5),
                new Quote('WARNING: Beta Feature!\n Use at your own risk!', 9.5),
                new Quote(' ', 15.5)
            ], this.p, true);
        }

        if(runNumber == 0 && getDeathCount() == 3){
            this.player.createDialougue([
                new Quote(["I remember so much now."], 1),
                new Quote(["...my life."], 2.5),
                new Quote(["I remember pain."], 4.2),
                new Quote(["Not sudden pain.", "Pain like a long shadow."], 5.5),
                new Quote(["And there was weakness."], 9),
                new Quote(["But now...?"], 10.7),
                new Quote(["Where is that pain?", "Where is the weakness?"], 13),
                new Quote(["Without them I feel..."], 15.7),
                new Quote(["naked."], 18.5),
                new Quote([''], 19.5)
            ]);
        }

        if(runNumber == 0 && hardMode && getDeathCount() == 0)
            this.player.createDialougue([
                new Quote(["Now I can play in hard mode!"], 1),
                new Quote(["This will be much more difficult."], 3),
                new Quote([''], 5.5)
            ]); 
        else if(runNumber == 0 && getDeathCount() == 4)
            this.player.createDialougue([
                new Quote(["I got this."], 1),
                new Quote([''], 2)
            ]);   
        else if(runNumber == 0 && getDeathCount() == 6)
            this.player.createDialougue([
                new Quote(["One more try."], 1),
                new Quote([''], 2)
            ]);
        else if(runNumber == 0 && getDeathCount() == 8)
            this.player.createDialougue([
                new Quote(["Why don't they just lock the door?"], 1),
                new Quote([''], 3)
            ]);

        if(runNumber == 4) {
            this.displayFloor = false;

            this.sceneTriggers.push(new SceneTrigger(24, 549, 26, 551, 'destroySamsComputer'));
            let buttonCollider = new BoxCollider(new PhysicsObject(new Vector(25, 525)), 17, 17);
            buttonCollider.static = true;
            buttonCollider.layer = 'wall'
        }

        if(hardMode) {
            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'spawnBoss'));
            return;
        }

        if(runNumber == 0 && getDeathCount() == 0)
        {
            //new Wall(-20, -300, 20, -280, p);

            this.transition = new TypedTransition([
                new Quote('Initializing...', 0),
                new Quote('Compiling Memory Cache...', 3.5),
                new Quote('Sensory Input Enabled...', 7.7),
                new Quote('Logic Processor Online...', 12.2),
                new Quote('Enabling Motor Functions...', 16.7),
                new Quote('System ready for use.', 21.2),
                new Quote('Use WASD keys to move.', 24.7),
                new Quote(' ', 30)
            ], this.p, true, true);
            time.delayedFunction(this.transition, 'fadeShadow', 3.5+4.2);

            this.player.createDialougue([
                new Quote(['Where am I?'], 11.5),
                new Quote([''], 13.5),
                new Quote(['What is this place?'], 15.8),
                new Quote([''], 18.8),
                new Quote(['I should stand.', 'Get my bearings.'], 21.3),
                new Quote(['Why was that so easy?', 'I feel...'], 26.3),
                new Quote(['Unusual.'], 28.8),
                new Quote(['Last I remember I...'], 29.6),
                new Quote(['...'], 32.6),
                new Quote(["I don't remember."], 33.1),
                new Quote([''], 35.1)
            ]);
            this.player.freeze();
            time.delayedFunction(this.player, 'unfreeze', 3.5+4.2+4.5+4.5+4.0);

            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'dotIntro'));
    
            this.updateSong('sounds/beep(dot).wav');
        }
        else if (runNumber == 1 && getMaxDifficulty() <= 1){
            this.player.createDialougue([
                new Quote(["Dot. Her name was Dot."], 1),
                new Quote(["I remember now."], 3),
                new Quote([''], 5)
            ]);

            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'operatorIntro'));
        }
        else if (runNumber == 2 && getMaxDifficulty() <= 2){

            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'technicianIntro'));
        }
        else if (runNumber == 2 && isBetween(getMaxDifficulty(), 2, 3.5)){
            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'surgeonIntro'));
        }
        else if (runNumber == 3 && getMaxDifficulty() <= 2){
            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'surgeonIntro'));
        }
        else{
            this.sceneTriggers.push(new SceneTrigger(-300, -120, 300, 120, 'spawnBoss'));
        }
    }

    dotIntro(){
        this.isInCutscene = true;

        this.player.createDialougue([
            new Quote([''], 1.3),
            new Quote(['Who are you?'], 4.9),
            new Quote([''], 6),
            new Quote(['My name is Sam.'], 8.4),
            new Quote([''], 10),
            new Quote(["No."], 13.6),
            new Quote(["I've slept too much."], 14.6),
            new Quote([''], 16),
            new Quote(['Get away from me!', "I'll hit you!"], 18.3),
            new Quote([''], 21)
        ]);
        this.player.freeze();
        this.player.setInput(new Vector(0, 1));
        this.player.velocity = new Vector(0, 70);
        time.delayedFunction(this.player, 'unfreeze', 19.5);

        time.delayedFunction(this.player, 'setInput', 0.33, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 13.4, [new Vector(1, 0)]);
        time.delayedFunction(this.player, 'setInput', 14.0, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 18.3, [new Vector(-1, 0)]);
        time.delayedFunction(this.player, 'setInput', 18.5, [new Vector(0, 0)]);


        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('guard', new Vector(0, 20), voiceEffects.dot,
        [
            new Velocity(0, -60), 0,
            'Sam!', 0.8,
            new Velocity(0, 0), 1.2,
            'Why are you up?', "You aren't allowed to be up yet.", 2,
            '', 5,
            "You'll remember later.", "It's normal to forget.", 5.7,
            '', 8.5,
            "It'll help you to go back to sleep.", 9.5,
            "lay down and I'll put you to sleep.", 12,
            new Velocity(0, -40), 13,
            new Velocity(0, 0), 14,
            "", 14.2,
            "Don't be stubborn.", "It's for your own good.", 15.9,
            '', 18.3,
            new Velocity(-40, 0), 18.4,
            new Velocity(0, 0), 18.8
        ]));
        // This is yet a third sample comment

        this.transition = new TypedTransition([
            new Quote('Press SPACE To Attack', 20.5)
        ], this.p);
        
        let bossWall = new Wall(-100, 120, 100, 1000, this.p);

        time.delayedFunction(this.bossManager, 'spawnBoss', 19.7, [this.npcs[npcIndex], bossWall]);
        
    }

    secondDotIntro(){
        this.updateSong("sounds/lament.wav");
        this.isInCutscene = true;

        this.player.createDialougue([
            new Quote(["Dot..."], 0.7),
            new Quote([''], 1.5),
            new Quote(["Dot, I told you not to."], 2.0),
            new Quote([''], 4.0),
            new Quote(["I told you I didn't", "want the prodedure."], 5.0),
            new Quote([''], 7.5),
            new Quote(["I remember enough."], 8.0),
            new Quote(["I didn't sign the form.", "I didn't agree to the transference.", "I don't want my mind in this body."], 9.5),
            new Quote([''], 13.5),
            new Quote(["I know."], 15.5),
            new Quote(["I love you too."], 16.2),
            new Quote([''], 17.8),
            new Quote(["You are my granddaughter...", "But you're not my keeper."], 18),
            new Quote(["You don't get to make", "this decision for me."], 21),
            new Quote(["I'm going."], 24),
            new Quote([''], 25)
        ]);
        this.player.freeze();
        time.delayedFunction(this.player, 'unfreeze', 25);

        let angle = this.player.position.angle;
        let magnitude = 80;
        let startingPosition = new Vector(magnitude, 0).setAngle(angle+Math.PI).add(this.player.position);
        
        time.delayedFunction(this.player, 'setInput', 16.2, [new Vector(0.3, 0).setAngle(angle + Math.PI)]);
        time.delayedFunction(this.player, 'setInput', 17.2, [new Vector(0, 0)]);

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('hardGuard', startingPosition, voiceEffects.dot,
        [
            "You must stop, Sam!", 1.0,
            '', 3.0,
            "You don't understand", "what you are doing!", 3.2,
            '', 5.5,
            "You don't remember yourself," , "you were", 7.0,
            '', 9.0,
            "I'm trying to save you!", 13.0,
            "I love you, Sam.", new Velocity(15, 0).setAngle(angle), 14.5, 
            new Velocity(0, 0), 15.0,
            '', 16.0,
            "Don't do this!", 23.5,
            '', 24.6,
            "No!", 24.8
        ]));

        time.delayedFunction(this.bossManager, 'spawnBoss', 26, [this.npcs[npcIndex]]);
    }

    finalDotOutro(npcPosition){
        this.isInCutscene = true;

        this.player.createDialougue([
            new Quote(["Goodbye, Dot."], 8.0),
            new Quote([''], 9.5)
        ]);
        this.player.freeze();
        time.delayedFunction(this.player, 'unfreeze', 9);
        
        time.delayedFunction(this.player, 'setInput', 17.2, [new Vector(0, 0)]);

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('hardGuard', npcPosition, voiceEffects.dot,
        [
            "no...", 0.5,
            '', 1.2,
            "please don't...", 1.5,
            '', 2.7,
            "I'm begging you...", 2.9,
            '', 4.3,
            "stay with me","please...", 4.5,
            '', 7.5,
            'delete', 9
        ]));

        time.delayedFunction(this, 'endSong', 6.5, [3.5])
    }

    operatorIntro(){
        this.updateSong('sounds/static.wav');
        this.isInCutscene = true;
        
        this.player.createDialougue([
            new Quote([''], 2.0),
            new Quote(["Door's locked."], 2.2),
            new Quote([''], 4.0),
            new Quote(['Did Dot send you?'], 9),
            new Quote([''], 10.6),
            new Quote(["What do you want?"], 12.4),
            new Quote([''], 14.0),
            new Quote(["I'm not tired."], 16.2),
            new Quote([''], 18)
        ]);
        this.player.freeze();
        this.player.setInput(new Vector(0, 1.0));
        this.player.velocity = new Vector(0, 70);
        time.delayedFunction(this.player, 'unfreeze', 19);

        time.delayedFunction(this.player, 'setInput', 2.0, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 10.8, [new Vector(-0.6, 0)]);
        time.delayedFunction(this.player, 'setInput', 11.7, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 12.5, [new Vector(1.0, 0)]);
        time.delayedFunction(this.player, 'setInput', 12.8, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 16.2, [new Vector(1.0, 0)]);
        time.delayedFunction(this.player, 'setInput', 16.7, [new Vector(0, 0)]);

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('clocksmith', new Vector(0, -9999), voiceEffects.operator,
        [
            new Velocity(0, 50), new Position(this.player.position.x, -50), 3.2,
            'So.', 4.5,
            new Velocity(0, 0), 4.4,
            '', 5.7,
            "I hear everything.", 10.89,
            new Velocity(60, 0), 11,
            new Velocity(0, 0), 11.3, 
            '', 13,
            "Come along now, dear.", "I know just what will make you sleepy.", new Velocity(0, 5), 17.2,
            new Velocity(0, 0), 19.5
        ]));
        this.npcs.push(new Npc('bot', new Vector(0, -9999), voiceEffects.operator,
        [
            new Velocity(50, 0), new Position(-150, 50), 5,
            'I heard you were up early.', 5.5,
            new Velocity(0, 0), 6.8,
            '', 7.7,
            "I hear everything.", 10.89,
            new Velocity(0, -60), 11,
            new Velocity(0, 0), 11.3, 
            "You be good now.", "Go back to your room and rest.", new Velocity(-10, 10), 14,
            '', 'delete', 19
        ]));
        this.npcs.push(new Npc('bot', new Vector(0, -9999), voiceEffects.operator,
        [
            new Velocity(-50, 0), new Position(150, 50), 5.5,
            "You know this", "isn't allowed.", 7.4,
            new Velocity(0, 0), 7.5,
            '', 9.5,
            "I'm the operator, dear.", "I hear everything.", 10.1,
            new Velocity(-30, 0), 10.4, 
            new Velocity(0, 0), 12.0, 
            '', 13.2,
            new Velocity(50, 0), 13.3,
            '', 'delete', 15
        ]));
        // I'm also putting a sample comment here.

        let bossWall = new Wall(-100, 120, 100, 1000, this.p);

        time.delayedFunction(this.bossManager, 'spawnBoss', 19.5, [this.npcs[npcIndex], bossWall]);
    }

    orderlyIntro(){
        this.isInCutscene = true;
        currentSong.pause();
        this.updateSong('sounds/outerSpace.wav', 1.0, true);
        
        let angle = this.player.position.angle;
        let magnitude = 50;
        let startingPosition = new Vector(magnitude, 0).setAngle(angle+Math.PI).add(this.player.position);

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('soldier', startingPosition, voiceEffects.orderly,
        [
            "Disobedient!", 0,
            '', 1.2,
            "Rule breaker!", new Velocity(150, 0).setAngle(angle), 1.6,
            new Velocity(0, 0), 1.7,
            '', 3.3,
            "Malcontent.", 5.0,
            "You are making my job difficult.", new Velocity(30, 0).setAngle(angle), 7.0,
            new Velocity(0, 0), 7.3,
            "I am the Orderly.", "I maintain structure.", "You are a disrupter.", 9.0,
            new Velocity(60, 0).setAngle(angle-Math.PI), new Acceleration(30, 0).setAngle(angle), 10.5,
            new Velocity(0, 0), new Acceleration(0, 0), 12,
            '', 13,
            "I will put you to order.", 14.5
        ]));

        this.player.createDialougue([
            new Quote([''], 2.0),
            new Quote(['Who are you?'], 1.0),
            new Quote([''], 1.6),
            new Quote(["Where is Dot?", "I'm starting to remember..."], 3.0),
            new Quote([''], 5.8),
            new Quote(["What is your problem?"], 6.0),
            new Quote([''], 7.5),
            new Quote(["I need to speak with Dot."], 12.5),
            new Quote([''], 15)
        ]);
        this.player.freeze();
        this.player.velocity = new Vector(0, 70);
        time.delayedFunction(this.player, 'unfreeze', 16);
        
        time.delayedFunction(this.player, 'setInput', 1.7, [new Vector(2, 0).setAngle(angle)]);
        time.delayedFunction(this.player, 'setInput', 1.8, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 6.0, [new Vector(0.6, 0).setAngle(angle+Math.PI)]);
        time.delayedFunction(this.player, 'setInput', 6.3, [new Vector(0, 0)]);

        time.delayedFunction(this.bossManager, 'spawnBoss', 16.5, [this.npcs[npcIndex]]);
    }

    technicianIntro(){
        this.updateSong('sounds/myHistoryAsAWriter.wav')
        this.isInCutscene = true;

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('knight', new Vector(scene.player.position.x, 0), voiceEffects.technician,
        [
            'Stop all this fighting, Sam.', "You're scratching up your new body.", 1.0,
            '', 5.5,
            "You insult my work, Sam!", "My designs are elagant.", "Works of art.", 8.0,
            '', 12.5,
            "I am the technician.", "You must take better care of my work.", 13.7,
            new Velocity(35, 0), 16.3,
            new Velocity(0, 0), 16.8,
            '', 17.7,
            "It's curious that you awoke", "before the process was complete.", "Some flaw in our procedure.", 18.0,
            new Velocity(-49, 0), 21.3,
            new Velocity(105, 0), 22.3,
            new Velocity(0, 0), 22.7,
            '', 24.0,
            "I must shut you off.", "And root out the flaw.", 24.5,
            new Velocity(0, 45), 25.5
        ]))
        this.npcs[npcIndex].typingSpeed = 500;

        
        this.player.createDialougue([
            new Quote([''], 0.0),
            new Quote(["This isn't my body.", "I'll destroy this hideous thing."], 5.0),
            new Quote([''], 8.5),
            new Quote(["Who are you that I should care?"], 12.0),
            new Quote([''], 14.2),
            new Quote(["Where is Dot?"], 17.0),
            new Quote([''], 18.5),
            new Quote(["Let me pass!"], 23.5),
            new Quote([''], 25.0)
        ])
        this.player.freeze();
        this.player.velocity = new Vector(0, 70);
        this.player.setInput(new Vector(0, 1));
        time.delayedFunction(this.player, 'unfreeze', 27);

        time.delayedFunction(this.player, 'setInput', 1.0, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 16.0, [new Vector(0.5, 0)]);
        time.delayedFunction(this.player, 'setInput', 16.5, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 21.0, [new Vector(-0.7, 0)]);
        time.delayedFunction(this.player, 'setInput', 22.0, [new Vector(1.5, 0)]);
        time.delayedFunction(this.player, 'setInput', 22.4, [new Vector(0, 0)]);
        time.delayedFunction(this.player, 'setInput', 23.7, [new Vector(0, 0.6)]);
        time.delayedFunction(this.player, 'setInput', 24.0, [new Vector(0, 0)]);
        
        time.delayedFunction(this.bossManager, 'spawnBoss', 27.5, [this.npcs[npcIndex]]);
    }

    surgeonIntro(){
        this.updateSong('sounds/beep(surgeon).wav')
        this.isInCutscene = true;

        let npcIndex = this.npcs.length;
        this.npcs.push(new Npc('samurai', new Vector(0, 0), voiceEffects.surgeon,
        [
            "Hello, Samantha.", 0.7,
            '', 2.5,
            "Yes.", 4.1,
            '', 5.0,
            "Yes.     ", "I fixed you.", 5.9,
            '', 7.5,
            "Absurd.", "Organic vessels are inferior.", 9,
            "Yours was especially inferior.", 11.3, 
            '', 13.6,
            "Your organic vessel was weak.", 14.1,
            '', 16.5,
            "Weakness is obselete.", "Pain is obselete.", "Death is obselete.", 17,
            '', 21,
            "It would be immoral", "for me to let you.", 23,
        ]));
        this.npcs[npcIndex].name == 'invisSamurai'

        this.player.createDialougue([
            new Quote(["I remember you.", "You're the surgeon."], 2.0),
            new Quote(["Dot brought me to you."], 4.5),
            new Quote([''], 6.2),
            new Quote(["I'm returning to my real body."], 7.0),
            new Quote([''], 9.5),
            new Quote(["I don't care."], 13.1),
            new Quote([''], 14.6),
            new Quote(["It was mine."], 16),
            new Quote([''], 17.5),
            new Quote(["It isn't your choice.", "I'm doing it."], 20.5),
            new Quote([''], 23.5)
        ]);
        this.player.freeze();
        this.player.velocity = new Vector(0, 70);
        this.player.setInput(new Vector(0, 1));
        time.delayedFunction(this.player, 'unfreeze', 25.5);

        time.delayedFunction(this.player, 'setInput', 0.8, [new Vector(0, 0)]);
        
        
        time.delayedFunction(this.bossManager, 'spawnBoss', 26, [this.npcs[npcIndex]]);
    }

    dotOutro(){
        
        this.isInCutscene = true;
        this.npcs.push(new Npc('guard', this.position, voiceEffects.dot, 
        [
            "Sam...", 1.0,
            "no...", 1.5,
            "wait...", "please don't...", 2.0,
            "I'm begging you...", "stay with me...", "please...", 3.5
        ]));

        this.player.createDialougue([
            new Quote(["Goodbye, Dot."], 3.7)
        ]);
        this.player.freeze();
        time.delayedFunction(this.player, 'unfreeze', 3.2);
        time.delayedFunction(this, 'endCutscene', 3.7);
    }

    destroySamsComputer(){
        console.log("Runtime upon button press:", time.trueRunTime);

        this.updateSong(creditsSong, 1.0, true);
        time.startSynch();

        this.player.freeze();
        this.coverScreenColor = this.p.color(255, 255, 255);
        this.coverScreenChange = 0.9/255;

        this.buttonPressed = true;

        time.delayedFunction(this, 'throwErrorUponSamsDeath', 1.2);
        time.delayedFunction(this, 'killSceneUponSamsComputerDeath', 12.82);
    }

    throwErrorUponSamsDeath(){
        this.transition = new TypedTransition([
            new Quote('ERROR!\nUNCAUGHT!FATAL!USERNOTFOUND!\nSOLVEIMMED10011100010100000000000000000000000000000', 0),
        ], this.p, true);
        this.transition.typingSpeed = 90;
    }

    killSceneUponSamsComputerDeath(){
        console.log("Runtime at end of scene:", time.trueRunTime);
        this.gameOver = true;
        this.runCredits = true;
        //this.sceneEndText = ' '
    }

    spawnBoss(){
        this.bossManager.spawnBoss();
    }

    stopFastForward(){
        this.fastForwarding = false;
        time.setSpeed(1);
    }

    endCutscene(){
        this.stopFastForward();
        this.isInCutscene = false;
    }

    start(){
        for(let i in this.walls){ this.walls[i].canvas.setup(); }
    }

    update() {
        
        if(this.isFirstFrame){
            this.start();
            this.isFirstFrame = false;
        }

        if(this.playerIsDead){
            for(let stepNum = 0; stepNum < steps; stepNum++){
                time.update();
                this.player.update();
                this.bossManager.update();
            }
            return;
        }

        this.coverScreen += this.coverScreenChange;
    
        let start = new Date();
        for(let stepNum = 0; stepNum < steps; stepNum++){
            time.update();
            this.mainCamera.update();
            this.updateSongVolumes();
            
            this.floor.update();
            this.player.update();

            this.bossManager.update();
            for(let i in this.bullets){ this.bullets[i].update(); }
            for(let i in this.npcs){    this.npcs[i].update(); }
        
            for(let stepNum = 0; stepNum < collisionSteps; stepNum++){
                for(let i in this.colliders){ 
                    this.colliders[i].update(parseInt(i)+1); 
                    if(this.playerIsDead) return;
                }
            }
            
            if(KeyReader.z) time.hitStop(9999);
            if(KeyReader.x) time.stopHitStop();
            if(KeyReader.c) time.setSpeed(2);
            if(KeyReader.v) time.setSpeed(10);
            if(KeyReader.b) time.setSpeed(100);

            if(KeyReader.space && this.isInCutscene){
                time.setSpeed(8);
                this.fastForwarding = true;
            }
            
        }
        let end = new Date();
        
        return end-start;
    }

    updateImage(){
        let start = new Date();
        // Has to be in this order
        // I hate it; I would make it in a different order, but that can't happen

        this.glitchSeedIndex = 0;

        if(this.playerIsDead){
            this.player.updateImage();
            this.mainCamera.updateImage();
            this.bossManager.updateImage();
            return;
        }

        this.mainCamera.updateImage();

        if(this.displayFloor){
            this.baseFloor.updateImage();
            this.floor.updateImage();
        }

        
        if(!this.buttonPressed){
            let buttonIndex = Math.floor((6*time.runTime) % 4);
            bigRedButtonImage[buttonIndex].draw(25, 537.5);
        }
        else{
            bigRedButtonImage[4].draw(25, 537.5)
        }

        for(let i in this.walls){ this.walls[i].updateImage(); }
        this.player.updateImage();
        this.bossManager.updateImage();
        for(let i in this.npcs){        this.npcs[i].updateImage(); }
        for(let i in this.bullets){     this.bullets[i].updateImage(); }
        for(let i in this.textboxes){   this.textboxes[i].updateImage(); }
        for(let i in this.uiElements){ this.uiElements[i].updateImage(); }
        
        let end = new Date();
        return end-start;
    }

    updateExtras(){
        let start = new Date();
        /*
        this.p.push();
        {
            stroke('white');
            strokeWeight(2);
            this.frameRateList.push(time.frameRate);
            for(let i in this.frameRateList){
                point(this.frameRateList.length - i, this.frameRateList[i]);
            }
            strokeWeight(1);
            line(0, 60, 250, 60);

            if(this.frameRateList.length > 250){
                this.frameRateList.splice(0, 1);
            }
        }
        this.p.pop();
        */
        if(this.transition) this.transition.update();

        this.p.push();
        {
            let myColor = this.coverScreenColor;
            myColor.setAlpha(this.coverScreen*255);
            this.p.background(myColor);
        }
        this.p.pop();
        
        let end = new Date();
        return end-start;
    }

    resetAndSetupImages(){
        for(let i of this.walls) i.resetAndSetupImage();
        for(let i of this.uiElements) i.resetAndSetup();
    }

    updateSongVolumes(){
        const s = songSwitchTime;
        const t = songSwitchTimeTotal;

        let hitMultiplier = Math.min(this.timeSinceLastHit, 1);
        this.timeSinceLastHit += time.deltaTime;

        if(previousSong) previousSong.volume = Math.max(Math.min((-s / t + 1) * songVolume, songVolume), 0);

        if((!previousSong || previousSong.volume < songVolume/4) && currentSong && currentSong.paused)  {
            currentSong.play();
            currentSongVolume = currentSong.volume * songVolume;
        }

        if(currentSong && !currentSong.paused){
            if(isNumber(currentSongVolume * hitMultiplier)) currentSong.volume = currentSongVolume * hitMultiplier;
            else{ currentSong.volume = songVolume; }
        }

        if(previousSong && previousSong.volume < 0 && !previousSong.paused) {
            previousSong.pause();
            previousSong.currentTime = 0;
        }

        songSwitchTime += time.deltaTime;
    }


    updateSong(song, volume = 1.0, instant = false){
            
        let oldSong = currentSong;
        let oldSongName = currentSongName;
        if(oldSongName == song && song) return;
        if (oldSongName == songs[runNumber] && !song) return;


        if(instant) playSongInstant(song, oldSong, volume);
        else if(song) playSong(song, oldSong, volume);
        else{ playSong(songs[runNumber], oldSong, volume); }
        
    }

    endSong(timeToEnd){
        if(!timeToEnd){
            playSongInstant(null, currentSong, 1.0);
        }
        playSong(null, currentSong, 1.0, timeToEnd);
    }

    killBulletsInRange(position, radius){
        for(let i of this.bullets){
            let positionDifference = position.subtract(i.position);
            if(positionDifference.magnitude < radius && !i.isShield && !i.melee && !i.playerAttack){
                i.dissapate();
            }
        }
    }

    createHealthBar(parent, maxHealth, isPlayer=false){
        return new HealthBar(parent, maxHealth, isPlayer, this.p)
    }

    createHudHealthBar(parent, maxHealth, isPlayer=false){
        return new HudHealthBar(parent, maxHealth, isPlayer, this.p)
    }

    createTextbox(quoteList, x, y){
        return new Textbox(quoteList, this.p, x, y);
    }

    createTypedTextbox(quoteList, x, y, voice, typingSpeed){
        return new TypedTextbox(quoteList, this.p, x, y, voice, typingSpeed);
    }

    killPlayer(){
        this.playerIsDead = true;
        this.bullets = [];
        this.colliders = [];
        
        for(let i of this.referenceBosses) {
            i.freezePosition = i.position;
            time.delayedFunction(i, 'leave', 1.3);
        }
        this.mainCamera.freezeTarget = this.player;
        this.mainCamera.freeze();

        //time.delayedFunction(this, 'makeTransition', 1.9);
        this.makeTransition();
    }

    makeTransition(){
        this.transition = new TypedTransition([
            new Quote('Game Over. Powering Off...', 0)
        ], this.p, true);
    }

    deleteWall(wall){
        let index = this.walls.indexOf(wall);
        this.walls.splice(index, 1);
    }

    deleteNpc(npc){
        let index = this.npcs.indexOf(npc);
        this.npcs.splice(index, 1);
    }

    get mainBoss(){
        return this.bossManager.bosses[0];
    }

    blinkOutToNewScene(){
        this.coverScreenChange = 0;
        this.coverScreen = 0;
        this.coverScreenColor = this.p.color(0);
        for(let i = 0; i < 0.5; i += 0.1){
            time.delayedFunction(this, 'toggleBlackScreen', i);
        }

        time.delayedFunction(this, 'createInstantScene', 0.65);
    }

    toggleBlackScreen(){
        console.log(this.coverScreen);
        if(this.coverScreen == 1) this.coverScreen = 0;
        else{                     this.coverScreen = 1; }
    }

    createInstantScene(){
        time.stopFunctionsWithinScene();
        runNumber++
        functionObject.createScene(this.player.position);
        functionObject.setupScene();
    }

    checkForGameOver(){
        if(this.player.position.y > 130 && runNumber < 4) this.gameOver = true;
        if(this.gameOver){

            runNumber++

            if(this.playerIsDead){
                deathDifficulties.push(difficulty);
                deathBosses.push(this.bossManager.bosses[0].name);

                runSpeedBoost =   1;
                dashSpeedBoost =  1;
                ghostSpeedBoost = 1;
                runNumber = 0;
                difficulty = 1;
                maxPlayerHealth = 3;
            
                time.stopFunctionsWithinScene();
                
                functionObject.createScene();
                functionObject.setupScene();
            }
            else{
                if(this.runCredits){
                    runNumber = 0;
                    difficulty = 1;
                    maxPlayerHealth = 3;
                    hardMode = true;
                    deathBosses = []
                    deathDifficulties = []

                    let newTransition = new TypedTransition(
                    [
                        new Quote('This Immortal Coil', 0, castleImages[0], new Vector(0, -1300), new Vector(0, 130)),
                        new Quote('A game by Keaton Mitchell', 3.205, castleImages[0], new Vector(0, -883), new Vector(0, 130)), 
                        new Quote('Thanks to all my playtesters,\nthe game is finally out!', 6.41, castleImages[1], new Vector(0, 150), new Vector(0, -50)),
                        new Quote('Israel Sanchez, Harper Mitchell,\nKnox Crain, and many, many more.', 12.82, castleImages[2], new Vector(100, 100), new Vector(-30, -30)),
                        new Quote('Script written by Mitch Mitchell\nIdeas endured by Audrey Mitchell', 19.23, castleImages[3], new Vector(0, 50), new Vector(0, -15)),
                        new Quote('Special Thanks to Deuce Broom for\n fixing a fatal error before launch.', 25.64, castleImages[4]),
                        new Quote('Thanks for playing!', 32.05)
                    ], this.p);
                    newTransition.textSize = 50;
                    newTransition.typingSpeed = 70;
                    killScene(newTransition, 38.46);

                }
                else{
                    killScene(new TypedTransition([
                        new Quote(this.sceneEndText, 0)
                    ], this.p), 1.5);
                }
            }

            ipcRenderer.send( "setMyGlobalVariable", deathDifficulties + "\n" + deathBosses + "\n" + hardMode);
        }
    }

    glitch(){
        this.isGlitched = true;
        this.glitchSeedX = []
        this.glitchSeedY = []
        for(let i = 0; i < 1000; i++){
            this.glitchSeedX.push(randRangeInt(-1, 1));
            this.glitchSeedY.push(randRangeInt(-1, 1));
        }
    }

    unglitch(){
        this.isGlitched = false;
    }

    drawImage(x, y, img, rotation = 'right', transparency = 0){

        if(this.coverScreen == 1) return;

        if(this.isGlitched){
            x += this.glitchSeedX[this.glitchSeedIndex];
            y += this.glitchSeedX[this.glitchSeedIndex];
            this.glitchSeedIndex++
        }

        {
            this.p.push();
        
            console.assert(isNumber(img.width) && isNumber(img.height));
        
            // Map so that 1 unit is 1 pixel
            let x0 = x * pixelSize;
            let y0 = y * pixelSize;
            
            // Reverse the y axis.
            let y1 = -y0;
        
            // Center the image on via the camera
            let x2 = x0 + (this.p.width/2 - scene.mainCamera.pixelPosition.x - img.width/2);
            let y2 = y1 + (this.p.height/2 - (-scene.mainCamera.pixelPosition.y) - img.height/2);
        
            // After this we get some weird rotation stuff
            if(scene.mainCamera.isOffScreen(img, x2, y2)) {
                this.p.pop();
                return;
            }
        
            // Adjust for image rotation
            let x4, y4;
            switch(rotation){
            case 'down':
                this.p.rotate(Math.PI/2);
                x4 = y2;
                y4 = -x2-img.width;
                break;
            case 'left':
                this.p.rotate(Math.PI);
                x4 = -x2-img.width;
                y4 = -y2-img.height;
                break;
            case 'up':
                this.p.rotate(3*Math.PI/2);
                x4 = -y2-img.height;
                y4 = x2;
                break;
            case 'right':
                x4 = x2;
                y4 = y2;
                break;
            default:
                console.log('Image rotation has reached an impossible state.');
            }
            
            let startTime = new Date();
        
            if(transparency != 0) this.p.tint(255, 255*(1-transparency));
            this.p.image(img, x4, y4);
            
            let endTime = new Date();
        
        
            this.p.pop();
        }
    }
}