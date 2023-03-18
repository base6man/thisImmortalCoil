'use strict';

// Token:
// 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

// electron-packager "C:\Users\keato\Documents\thisImmortalCoil" --platform=win32 --arch=x64 myApplicationBuilt --electron-version 1.4.3
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Imports P5. Instantiates the sketch at the bottom of this file.
const p5 = require('p5');
const fs = require('fs')
const {ipcRenderer} = require('electron')

let scene, transition, functionObject;

let skipIntro = true, introSpeed = 1, canPlayIntro = false;
let transitionFont, textboxFont;

let attackImage, diagonalAttackImage, stillAttackImage;
let attackDissapateImage, diagonalDissapateImage;
let shieldAttackImage, shieldDiagonalImage;
let playerAttackImage, playerDiagonalAttackImage, playerAttackDissipateImage;
let playerHumanImage;

let bigRedButtonImage;
let usableFloorImage, rootFloorImage, floorImageList, dirtyFloorImage;

let playerHeads;
let playerRunRight, playerIdle, playerRunLeft, playerRunUp, playerRunDown, playerRunUpRight, playerRunUpLeft;

let guardIdle, guardAttack, guardDiagonal;
let guardHeads, samuraiHeads;
let guardRunSide, guardRunDown, samuraiRun;
let botImage;
let clocksmithImage, clocksmithSwitch, clocksmithReverseSwitch;
let soldierImage, soldierDiagonal, soldierAttack, soldierAttackDiagonal;
let samuraiImage;
let knightImage, knightDiagonal;

let castleImages;

let nullImage;
let allImages, allHeads, directions;

let bossImages = {}
let playerImages = {}
let clocksmithImages = {}
let attackImages = {}
let guardImages = {}

let imagesExist = false;

let lagMultiplier = 1;
let time;
let isFirstFrame = true;
let globalTimescale = 0.9/lagMultiplier;
let steps = 2;
let collisionSteps = 2;

let pixelSize;

let maxPlayerHealth = 3;
let runSpeedBoost   = 1;
let dashSpeedBoost  = 1;
let ghostSpeedBoost = 1;

let cutsceneMult = 1.25;

let songs, creditsSong;
let currentSong, currentSongName, previousSong;
let songVolume = 0.5; // 0.5
let currentSongVolume;

let voiceEffects;
let whoosh, hit, hitBoss;
let whooshVolume = 0.6;

let staticVolume = 0.0;
let songSwitchTimeTotal;
let songSwitchTime;

let difficulty = 1;
let runNumber = 0;

try{
  fs.readFile("lib/SaveData.txt", function(err, data) {
      if(err) return console.error(err);
      let saveFileContents = data.toString();
  
      let fileArray = saveFileContents.split(/\r?\n/);
  
      if(fileArray[0]) deathDifficulties = fileArray[0].split(",");
      if(fileArray[1]) deathBosses = fileArray[1].split(",");
      if(fileArray[2]) hardMode = fileArray[2] === 'true';
      console.log(deathDifficulties, deathBosses, hardMode)
  });
}
catch{
  console.log("Nope! No save!")
}

let deathDifficulties = []
let hardMode = false;
let deathBosses = []

function getDeathCount(){ 
  return deathDifficulties.length; 
}
function getMaxDifficulty(){
  let maxDifficulty = 0;
  for(let i of deathDifficulties)
    if(i > maxDifficulty) maxDifficulty = i;

  return maxDifficulty;
}
function numDeathDifficulties(dif){
  let valueToReturn = 0;
  for(let i of deathDifficulties)
    if(i == dif) valueToReturn++

  return valueToReturn;
}
function numDeathDifficultiesRange(min, max){
  let valueToReturn = 0;
  for(let i of deathDifficulties)
    if(isBetweenInclusive(i, min, max)) valueToReturn++

  return valueToReturn;
}


CanvasRenderingContext2D.willReadFrequently = true;


var gamepadAPI = {
  controller: {},
  connected: false,
  connect: function(evt) {
    gamepadAPI.controller = evt.gamepad;
    gamepadAPI.connected = true;
    userStartAudio();
  },
  disconnect: function(evt) {
    gamepadAPI.connected = false;
    delete gamepadAPI.controller;
  },
  update: function() {
    // clear the buttons cache
    gamepadAPI.buttonsCache = [];
    // move the buttons status from the previous frame to the cache
    for(var k=0; k<gamepadAPI.buttonsStatus.length; k++) {
      gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    }
    // clear the buttons status
    gamepadAPI.buttonsStatus = [];
    // get the gamepad object
    var c = gamepadAPI.controller || {};
    c = navigator.getGamepads()[c.index];
  
    // loop through buttons and push the pressed ones to the array
    var pressed = [];
    if(c.buttons) {
      for(var b=0,t=c.buttons.length; b<t; b++) {
        if(c.buttons[b].pressed) {
          pressed.push(gamepadAPI.buttons[b]);
        }
      }
    }
    // loop through axes and push their values to the array
    var axes = [];
    if(c.axes) {
      for(var a=0,x=c.axes.length; a<x; a++) {
        axes.push(c.axes[a].toFixed(2));
      }
    }
    // assign received values
    gamepadAPI.axesStatus = axes;
    gamepadAPI.buttonsStatus = pressed;
    gamepadAPI.controller = c;
    // return buttons for debugging purposes
    return pressed;
  },
  buttonPressed: function(button, hold) {
    var newPress = false;
    // loop through pressed buttons
    for(var i=0,s=gamepadAPI.buttonsStatus.length; i<s; i++) {
      // if we found the button we're looking for...
      if(gamepadAPI.buttonsStatus[i] == button) {
        // set the boolean variable to true
        newPress = true;
        // if we want to check the single press
        if(!hold) {
          // loop through the cached states from the previous frame
          for(var j=0,p=gamepadAPI.buttonsCache.length; j<p; j++) {
            // if the button was already pressed, ignore new press
            if(gamepadAPI.buttonsCache[j] == button) {
              newPress = false;
            }
          }
        }
      }
    }
    return newPress;
  },
  buttons: [
    'A', 'B', 'X', 'Y',
    'LB', 'RB', 'LT', 'RT',
    'Start', 'Options', 
    'L3', 'R3',
    'Dpad_Up', 'Dpad_Down', 'Dpad_Left', 'Dpad_Right'
  ],
  buttonsCache: [],
  buttonsStatus: [],
  axesStatus: []
};

window.addEventListener("gamepadconnected", gamepadAPI.connect);
window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);

let layerMap = [
  {a: 'player',     b: 'enemyAttack'},
  {a: 'player',     b: 'wall'},
  {a: 'player',     b: 'blueBullet'},
  {a: 'player',     b: 'sceneTrigger'},
  {a: 'boss',       b: 'playerAttack'},
  {a: 'boss',       b: 'wall'},
  {a: 'boss',       b: 'player'},
  {a: 'ghost',      b: 'wall'},
  {a: 'shieldGhost',b: 'enemyAttack'},
  {a: 'shieldGhost',b: 'blueBullet'},
  {a: 'npc',        b: 'playerAttack'},
  {a: 'playerAttack', b: 'attackTrigger'},
  {a: 'playerAttack', b: 'enemyAttack'}
]

function isBetween(num, a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return num > min && num < max;
};

function isBetweenInclusive(num, a, b) {
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return num >= min && num <= max;
}

function includesKeyword(array, keyword){
  for(i in array){
    if(keyword.test(array[i])) {return true; }
  }
  return false;
}

function isNumber(num){
  return (num > 0 || num <= 0) && typeof num == 'number';
}

function isRealNumber(num){
  return typeof num == 'number' && (num < 0 || num >= 0) && (num != Infinity || num != -Infinity);
}

function randRange(min, max){
  return Math.random() * (max - min) + min;
}
function randRangeInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const varToString = varObj => Object.keys(varObj)[0];

function killScene(newTransition = new Transition([], p), timeUntilNextScene){
  time.stopFunctionsWithinScene();
  transition = newTransition;
  scene = null;

  time.delayedFunction(functionObject, 'createAndSetupScene', timeUntilNextScene, [], true);
}

function playSong(song, oldSong, volume, switchTime = 1){

  songSwitchTimeTotal = switchTime; 
  songSwitchTime = -0.5;

  if(song){
    if(currentSongName == song) return;

    currentSongName = song;
    currentSong = new Audio(song);

    if(volume) currentSong.volume = volume;
    //currentSong.play();
    currentSong.loop = true;
  }
  else{
    currentSong = null;
    currentSongName = null;
  }

  if(oldSong){
    previousSong = oldSong;
    //oldSong.pause();
    //oldSong.currentTime = 0;
  }

  //time.previousFrameSongRunTime = 0;
}

function playSongInstant(song, oldSong, volume){
  //if(oldSong) console.log(oldsong);
  if(song){
    if(currentSongName == song) return;

    currentSongName = song;
    currentSong = new Audio(song);

    if(volume) currentSong.volume = volume;
    currentSong.play();
    currentSong.volume *= songVolume;
    currentSong.loop = true;
    
    console.log(currentSong);
    songSwitchTime = 99;
  }
  if(oldSong){
    previousSong = oldSong;
    oldSong.pause();
    oldSong.currentTime = 0;
    console.log(previousSong);
  }
}

function playSound(sound, volume = 1.0, loop = false){
  let audioSound = new Audio(sound);
  audioSound.volume = whooshVolume;
  audioSound.play();
  audioSound.volume = volume;
  if(loop) audioSound.loop = true;

  return audioSound;
}

//Starting out sketch and
//injecting p5, as the param p, into our sketch function.
const sketch = (p) => {

  p.preload = () => {
    playerIdle = [
      p.loadImage("images/playerImages/idle0.png")
    ]
    playerRunRight = [
      p.loadImage('images/playerImages/right0.png'),
      p.loadImage('images/playerImages/right1.png'),
      p.loadImage('images/playerImages/right2.png'),
      p.loadImage('images/playerImages/right3.png')
    ]
    playerRunLeft = [
      p.loadImage('images/playerImages/left0.png'),
      p.loadImage('images/playerImages/left1.png'),
      p.loadImage('images/playerImages/left2.png'),
      p.loadImage('images/playerImages/left3.png')
    ]
    playerRunUp = [
      p.loadImage('images/playerImages/idle3.png'),
      p.loadImage('images/playerImages/idle2.png'),
      p.loadImage('images/playerImages/idle1.png'),
      p.loadImage("images/playerImages/idle0.png")
    ]
    playerRunDown = [
      p.loadImage('images/playerImages/idle1.png'),
      p.loadImage('images/playerImages/idle2.png'),
      p.loadImage('images/playerImages/idle3.png'),
      p.loadImage('images/playerImages/idle0.png')
    ]
  
    playerHeads = {
      left:     p.loadImage('images/playerImages/leftHead.png'),
      right:    p.loadImage('images/playerImages/rightHead.png'),
      up:       p.loadImage('images/playerImages/upHead.png'),
      down:     p.loadImage('images/playerImages/downHead.png'),
      upLeft:   p.loadImage('images/playerImages/upLeftHead.png'),
      upRight:  p.loadImage('images/playerImages/upRightHead.png'),
      downLeft: p.loadImage('images/playerImages/downLeftHead.png'),
      downRight:p.loadImage('images/playerImages/downRightHead.png'),
      normal:   p.loadImage('images/playerImages/head.png')
    }
  
    
    dirtyFloorImage = [
      {image: p.loadImage("images/floorImages/dirtyFloor/dirtyTile.png"), spawnRate: 2},
      {image: p.loadImage("images/floorImages/dirtyFloor/outletTile.png"), spawnRate: 0.1},
      {image: p.loadImage("images/floorImages/dirtyFloor/scifiTile.png"), spawnRate: 1},
      {image: p.loadImage("images/floorImages/dirtyFloor/electricalTile.png"), spawnRate: 0.1},
      {image: p.loadImage("images/floorImages/dirtyFloor/stoneTile.png"), spawnRate: 0.2},
      {image: p.loadImage("images/floorImages/dirtyFloor/squareTile.png"), spawnRate: 0.4},
      {image: p.loadImage("images/floorImages/dirtyFloor/susTile.png"), spawnRate: 0.02}
    ]
    

    floorImageList = [
      p.loadImage("images/floorImages/cleanFloor/simpleTile.png"),
      p.loadImage("images/floorImages/cleanFloor/crackedTile.png"),
      p.loadImage("images/floorImages/cleanFloor/crackedTile1.png"),
      p.loadImage("images/floorImages/cleanFloor/crackedTile2.png"),
      p.loadImage("images/floorImages/cleanFloor/rustedTile.png"),
      p.loadImage("images/floorImages/cleanFloor/rustedTile1.png"),
      p.loadImage("images/floorImages/cleanFloor/rustedTile2.png"),
      p.loadImage("images/floorImages/cleanFloor/electricalTile.png"),
      p.loadImage("images/floorImages/cleanFloor/nullTile.png")
    ]

    
    bigRedButtonImage = [
      p.loadImage("images/floorImages/bigRedButton.png"),
      p.loadImage("images/floorImages/bigRedButton1.png"),
      p.loadImage("images/floorImages/bigRedButton2.png"),
      p.loadImage("images/floorImages/bigRedButton1.png"),
      p.loadImage("images/floorImages/bigRedButtonPressed.png")
    ]

    attackImage = [
      p.loadImage("images/attackImages/newAttack.png")
    ]
    diagonalAttackImage = [
      p.loadImage("images/attackImages/newDiagonal.png")
    ]
    stillAttackImage = [
      p.loadImage("images/attackImages/stillAttack.png")
    ]
    attackDissapateImage = [
      p.loadImage("images/attackImages/attackDissapate(0).png"),
      p.loadImage("images/attackImages/attackDissapate(1).png")
    ]
    shieldAttackImage = [
      p.loadImage("images/attackImages/shieldAttack.png")
    ]
    shieldDiagonalImage = [
      p.loadImage("images/attackImages/shieldDiagonal.png")
    ]
    playerAttackImage = [
      p.loadImage("images/attackImages/playerAttack.png")
    ]
    playerDiagonalAttackImage = [
      p.loadImage("images/attackImages/playerDiagonal.png")
    ]
    playerAttackDissipateImage = [
      p.loadImage("images/attackImages/playerAttackDissapate(0).png"),
      p.loadImage("images/attackImages/playerAttackDissapate(1).png")
    ]

    playerHumanImage = [
      p.loadImage("images/playerImages/samuraiNew.png")
    ]
  
    
    guardIdle = [
      p.loadImage("images/bossImages/guardImages/newGuard.png")
    ]
    guardDiagonal = [
      p.loadImage("images/bossImages/guardImages/newGuardDiagonal.png")
    ]
    guardAttack = [
      p.loadImage("images/bossImages/guardImages/guardAttack(0).png")
    ]
    
    guardHeads = {
      left:     p.loadImage('images/bossImages/guardImages/leftHead.png'),
      right:    p.loadImage('images/bossImages/guardImages/rightHead.png'),
      up:       p.loadImage('images/bossImages/guardImages/upHead.png'),
      down:     p.loadImage('images/bossImages/guardImages/downHead.png'),
      upLeft:   p.loadImage('images/bossImages/guardImages/upLeftHead.png'),
      upRight:  p.loadImage('images/bossImages/guardImages/upRightHead.png'),
      downLeft: p.loadImage('images/bossImages/guardImages/leftHead.png'),
      downRight:p.loadImage('images/bossImages/guardImages/rightHead.png'),
      normal:   p.loadImage('images/bossImages/guardImages/downHead.png')
    }
    
    samuraiHeads = {
      left:     p.loadImage('images/bossImages/samuraiImages/leftHead.png'),
      right:    p.loadImage('images/bossImages/samuraiImages/rightHead.png'),
      up:       p.loadImage('images/bossImages/samuraiImages/upHead.png'),
      down:     p.loadImage('images/bossImages/samuraiImages/head.png'),
      upLeft:   p.loadImage('images/bossImages/samuraiImages/upLeftHead.png'),
      upRight:  p.loadImage('images/bossImages/samuraiImages/upRightHead.png'),
      downLeft: p.loadImage('images/bossImages/samuraiImages/leftHead.png'),
      downRight:p.loadImage('images/bossImages/samuraiImages/rightHead.png'),
      normal:   p.loadImage('images/bossImages/samuraiImages/head.png')
    }
  
    guardRunSide = [
      p.loadImage('images/bossImages/guardImages/side0.png'),
      p.loadImage('images/bossImages/guardImages/side1.png')
    ]
    guardRunDown = [
      p.loadImage('images/bossImages/guardImages/down0.png'),
      p.loadImage('images/bossImages/guardImages/down1.png')
    ]

    samuraiRun = [
      p.loadImage('images/bossImages/samuraiImages/wheel0.png'),
      p.loadImage('images/bossImages/samuraiImages/wheel1.png')
    ]
  
    clocksmithImage = [
      p.loadImage("images/bossImages/clocksmithImages/clocksmith(0).png")
    ]
    clocksmithSwitch = [
      p.loadImage("images/bossImages/clocksmithImages/clocksmithSwitch(0).png"),
      p.loadImage("images/bossImages/clocksmithImages/clocksmithSwitch(1).png")
    ]
    clocksmithReverseSwitch = [
      p.loadImage("images/bossImages/clocksmithImages/clocksmithSwitch(1).png"),
      p.loadImage("images/bossImages/clocksmithImages/clocksmithSwitch(0).png")
    ]
    botImage = [
      p.loadImage("images/bossImages/clocksmithImages/bot(0).png")
    ]
  
    soldierImage = [
      p.loadImage("images/bossImages/soldierImages/soldierImage.png")
    ]
    soldierDiagonal = [
      p.loadImage("images/bossImages/soldierImages/soldierDiagonal.png")
    ]
    soldierAttack = [
      p.loadImage("images/bossImages/soldierImages/soldierAttack.png")
    ]
    soldierAttackDiagonal = [
      p.loadImage("images/bossImages/soldierImages/soldierAttackDiagonal.png")
    ]
    samuraiImage = [
      p.loadImage("images/bossImages/samuraiImages/samuraiImage.png")
    ]
    knightImage = [
      p.loadImage("images/bossImages/knightImages/knight.png")
    ]
    knightDiagonal = [
      p.loadImage("images/bossImages/knightImages/knightDiagonal.png")
    ]
  
    castleImages = [
      p.loadImage("images/castleImages/castle.png"),
      p.loadImage("images/castleImages/garden.png"),
      p.loadImage("images/castleImages/diningHall.png"),
      p.loadImage("images/castleImages/vault.png"),
      p.loadImage("images/castleImages/walls.png")
    ]
  
    transitionFont = p.loadFont("images/fonts/transitionFont.ttf");
    textboxFont =    p.loadFont("images/fonts/textboxFont.ttf");
    
    songs = [
      "sounds/onTheTrain.wav",
      "sounds/factoryTheme.wav",
      "sounds/myHistoryAsAWriter.wav",
      "sounds/beep.wav",
      "sounds/lament.wav"
    ]
  
    
    creditsSong = "sounds/mortimerKeep.wav";
    
    whoosh = "sounds/whoosh.wav";
    hit = "sounds/hit.mp3";
    hitBoss = "sounds/hitBoss.mp3";
    
    voiceEffects = {
      sam: "sounds/voiceSam.wav",
      dot: "sounds/voiceDot.wav",
      operator: "sounds/voiceOperator.wav",
      orderly: "sounds/voiceOrderly.wav",
      technician: "sounds/voiceTechnician.wav",
      surgeon: "sounds/voiceSurgeon.wav"
    }
    functionObject = new FunctionObject(p);
    
  }

  p.setup = () => {
    // Create the canvas
    time = new Time(p);

    p.createCanvas(p.windowWidth, p.windowHeight);
    pixelSize = Math.floor((p.width + p.height)/500);

    directions = [
      'left', 'right', 'up', 'down', 'normal',
      'downLeft', 'downRight', 'upLeft', 'upRight'
    ]
    allHeads = [
      playerHeads, guardHeads, samuraiHeads
    ]
    for(let i in allHeads){
      for(let j in directions){
        allHeads[i][directions[j]] = new Canvas(allHeads[i][directions[j]], p);
      }
    }
  
    allImages = [
      floorImageList, bigRedButtonImage,
      playerIdle, playerRunLeft, playerRunUp, playerRunUpRight, playerRunUpLeft, playerRunDown,
      attackImage, diagonalAttackImage, stillAttackImage, attackDissapateImage, 
      shieldAttackImage, shieldDiagonalImage,
      playerAttackImage, playerDiagonalAttackImage, playerAttackDissipateImage,
      playerHumanImage,
      guardIdle, guardAttack, guardDiagonal,
      guardRunSide, guardRunDown, samuraiRun,
      soldierImage, soldierDiagonal, soldierAttack, soldierAttackDiagonal,
      clocksmithImage, clocksmithSwitch, clocksmithReverseSwitch,
      samuraiImage, 
      knightImage, knightDiagonal,
      botImage
    ];
    for(let i in allImages){
      for(let j in allImages[i]){
        allImages[i][j] = new Canvas(allImages[i][j], p);
      }
    }

    imagesExist = true;

    rootFloorImage = {
      simple: floorImageList[0],
      cracked: floorImageList[1],
      cracked1: floorImageList[2],
      cracked2: floorImageList[3],
      rusted: floorImageList[4],
      rusted1: floorImageList[5],
      rusted2: floorImageList[6],
      electrical: floorImageList[7],
      null: floorImageList[8]
    }
  
    for(let i in playerRunRight) playerRunRight[i] = new Canvas(playerRunRight[i], p, 0, 0, true);
    for(let i in dirtyFloorImage) dirtyFloorImage[i].image = new Canvas(dirtyFloorImage[i].image, p)
  
    nullImage = [new Canvas(null, p, 1, 1)];
    nullImage[0].addBox(0, 0, 1, 1, p.color(0, 0, 0, 0));
  
    CanvasRenderingContext2D.willReadFrequently = false;
  
    attackImages = {
      normal: attackImage,
      diagonal: diagonalAttackImage,
      still: stillAttackImage,
      dissapate: attackDissapateImage,
      shield: shieldAttackImage,
      shieldDiagonal: shieldDiagonalImage,
      player: playerAttackImage,
      playerDiagonal: playerDiagonalAttackImage,
      playerDissapate: playerAttackDissipateImage
    }
  
    playerImages = {
      idle: playerIdle,
      runRight: playerRunRight,
      runLeft: playerRunLeft,
      runUp: playerRunUp,
      runDown: playerRunDown,
      runUpRight: playerRunUpRight,
      runUpLeft: playerRunUpLeft
    }
  
    bossImages = {
      guardIdle,
      guardAttack,
      guardDiagonal,
      bot: botImage,
      invis: nullImage,
      soldier: soldierImage,
      soldierDiagonal,
      soldierAttack,
      soldierAttackDiagonal,
      samurai: samuraiImage,
      knight: knightImage,
      knightDiagonal
    }
  
    guardImages = {
      side: guardRunSide,
      down: guardRunDown
    }
  
    clocksmithImages = {
      normal: clocksmithImage,
      switch: clocksmithSwitch,
      reverseSwitch: clocksmithReverseSwitch
    }

    functionObject.createScene();
    
    //getAudioContext().suspend();
  };
    
  // Start draws all images
  // Do not move this to setup
  function setupImages(){
    for(let i in allImages){
      for(let j in allImages[i]){
        allImages[i][j].setup();
      }
    }
  
    for(let i in allHeads){
      for(let j in directions){
        allHeads[i][directions[j]].setup();
      }
    }
    for(let i in playerRunRight) playerRunRight[i].setup();
    for(let i in usableFloorImage) usableFloorImage[i].image.setup();
    for(let i in dirtyFloorImage) dirtyFloorImage[i].image.setup();
  }
  

  p.draw = () => {
    p.background(0);
  
    if(!canPlayIntro){
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(40);
      p.textLeading(80);
      p.fill(255);
      p.noStroke();
      p.textFont(transitionFont);
  
      p.text('Press SPACE to begin', p.width/2, p.height-100);
  
      p.pop();

      if(KeyReader.holdSpace) {
        canPlayIntro = true;
        functionObject.setupScene();
      }
      return;
    }
  


    for(let lagCount = 0; lagCount < lagMultiplier; lagCount++){
  
      let startTime = new Date();
      let imageCount = 0;
      let imageTime;
      let updateTime;
  
      if(gamepadAPI.connected){
        gamepadAPI.update();
      }
    
      if(isFirstFrame){
        setupImages();
        isFirstFrame = false;
      }
    
      if(!transition && !scene.transition){
        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(40);
        p.textLeading(80);
        p.fill(255);
        p.noStroke();
        p.textFont(transitionFont);
  
        p.text("The game has glitched.\nHit the fullscreen button to fix.\nYou can then hit it again if you want.", p.width/2, p.height-150);
        p.pop();
      }
      
      if(scene){
        updateTime = scene.update();
        imageTime = scene.updateImage();
        scene.updateExtras();
        scene.checkForGameOver();
      }
      else{
        time.update();
        if(transition) transition.update();
      }
    
      let endTime = new Date();
      if(endTime - startTime > 100) console.log(updateTime, imageTime);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    pixelSize = Math.floor((p.width + p.height)/500);

    if(imagesExist){
      functionObject.resetImages();
      if(scene) scene.resetAndSetupImages();
      setupImages();
    }
  }
}

//Instantiates P5 sketch to keep it out of the global scope.
const app = new p5(sketch);