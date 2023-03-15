class Time{

    constructor(p, parent = null){
        this.parent = parent;
        this.p = p;

        this.runTime = 0;
        this.frameCount = 0;
        this.deltaTime;

        this.waitFunc = [];

        this.maxTimeStep = 0.25;

        this.hitStopMultiplier = 1;

        //this.previousFrameSongRunTime = 0;
    }

    update(){
        // Counts with the song if a scene is not active
        /*
        if(scene){
            
        }
        else if (currentSong)
            this.deltaTime = currentSong.currentTime() - this.previousFrameSongRunTime;
        else{
            this.deltaTime = 0;
        }*/
        let inCutscene = 1;
        if(scene && scene.isInCutscene) inCutscene = cutsceneMult;

        this.deltaTime = Math.min(this.p.deltaTime / 1000, this.maxTimeStep) * globalTimescale * this.hitStopMultiplier / steps / inCutscene;
        
        this.runTime += this.deltaTime;
        this.frameCount += 1 / steps;
        
        this.isLooping = true;
        for(let i = this.waitFunc.length - 1; i >= 0; i--){
            this.loopIndex = i;

            if(this.waitFunc[i] && this.waitFunc[i].startTime < this.runTime){

                let tempFunc = this.waitFunc[i];
                this.waitFunc.splice(i, 1);

                try{
                    tempFunc.parent[tempFunc.funcName](...tempFunc.args);
                }
                catch(e){
                    console.log(tempFunc.funcName, tempFunc, e);
                    throw(e);
                }
            }
        }
        this.isLooping = false;

        /*
        if(currentSong)
            this.previousFrameSongRunTime = currentSong.currentTime();
        else{ this.previousFrameSongRunTime = 0; }
        */
    }

    get totalDeltaTime(){
        return this.deltaTime * steps;
    }

    get frameRate(){
        return 1 / (this.deltaTime * steps / globalTimescale / this.hitStopMultiplier);
    }

    get songTime(){
        if(!this.startSongTime) return null;
        return this.runTime - this.startSongTime;
    }

    delayedFunction(parent, funcName, waitTime, args = [], outsideOfScene = false){
        console.assert(isNumber(waitTime), parent, funcName, waitTime);
        const newElement = {
            parent, funcName, args, outsideOfScene,
            startTime: waitTime + this.runTime
        }
        return this.waitFunc.push(newElement);
    }

    isWaiting(parent, funcName){
        return this.waitingFunctions(parent, funcName).length > 0;
    }

    stop(waitfuncObj) {
        return this.waitFunc.splice(this.waitFunc.indexOf(waitfuncObj), 1);
    }

    waitingFunctions(parent, funcName){
        let newWaitFunc = [];
        for(let i in this.waitFunc){
            if((this.waitFunc[i].funcName == funcName || !funcName) && (this.waitFunc[i].parent == parent || !parent)){
                newWaitFunc.push(this.waitFunc[i]);
            }
        }
        return newWaitFunc;
    }

    stopFunctions(parent, funcName){
        let removedList = this.waitFunc.filter(item => (funcName == item.funcName || !funcName) && (item.parent == parent || !parent));
        this.waitFunc = this.waitFunc.filter(item => !((funcName == item.funcName || !funcName) && (item.parent == parent || !parent)));
        return removedList;
    }

    stopFunctionsWithKeyword(parent, keyword){

        let removedList = this.waitFunc.filter(item => keyword.test(item.funcName) && (item.parent == parent || parent));
        this.waitFunc = this.waitFunc.filter(item => !(keyword.test(item.funcName) && (item.parent == parent || parent)));
        return removedList;
    }

    stopAllFunctions(){
        let removedList = [...this.waitFunc];
        this.waitFunc = [];
        return removedList;
    }

    stopFunctionsWithinScene(){
        let removedList = this.waitFunc.filter(item => !item.outsideOfScene);
        this.waitFunc = this.waitFunc.filter(item => item.outsideOfScene);
        return removedList;
    }
    
    hitStop(time, speed = 0.01, freezeCamera = true){
        this.hitStopMultiplier = speed;
        if(freezeCamera) scene.mainCamera.freeze();
        
        this.stopFunctions(this, 'stopHitStop');
        this.delayedFunction(this, 'stopHitStop', time*speed);
    }

    stopHitStop(){
        this.stopFunctions(this, 'stopHitStop');
        this.hitStopMultiplier = 1;
        scene.mainCamera.unfreeze();
    }

    setSpeed(speed){
        this.hitStopMultiplier = speed;
    }
}