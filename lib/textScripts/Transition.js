class Transition{
    /**
    * 
    * @param {Array} quoteList An array of strings, the intro text
    */
    constructor(quoteList, p, withinScene = false, castsShadow = false){
        this.quoteList = quoteList;
        this.withinScene = withinScene;
        this.castsShadow = castsShadow;
        this.p = p;

        this.quote = '';
        this.image;
        this.imageOffset;

        this.quoteTimeMultiplier = 1;

        this.startingShadowStrength = 280;
        this.minimumShadowStrength = 110;
        this.shadowStrengthChangePerSecond = 100;

        this.fadingShadow = false;

        this.isFirstFrame = true;
        this.index = 0;
    }

    addQuote(newQuote){
        this.quoteList.push(newQuote);
        // If this is the first quote
        if(this.quoteList.length == 1) this.makeNewQuote(0);
    }

    makeNewQuote(index){
        this.index = index;

        this.quote = this.quoteList[index].quote;
        this.image = this.quoteList[index].image;
        this.imageOffset = this.quoteList[index].offset;
        this.imageVelocity = this.quoteList[index].velocity;

        console.assert(this.quote, this.quoteList, index);

        this.quoteTime = this.findQuoteTime(index);

        if(time.songTime) this.lastSongTime = time.songTime;
        else{   this.lastSongTime = 0; }
    }
    /*
    findQuoteTime(index){
        if(this.quoteList[index].quoteTime) return this.quoteList[index].quoteTime / introSpeed;
        else{ return this.quoteTimeMultiplier * (1.3 + this.quote.length / 30) / introSpeed; }
    }
    */
    get timeSinceLastQuote(){
        if(this.lastImageWasTheSame()) return 999;
        console.assert(this.quoteList)
        return time.runTime - this.quoteList[this.index].quoteTime;
    }

    get timeUntilNextQuote(){
        if(this.nextImageIsTheSame()) return 999;
        return this.quoteList[Number(this.index)+1].quoteTime - time.runTime;
    }

    get shadowStrength(){
        if(this._shadowStrength) return this._shadowStrength;
        let shadow = this.startingShadowStrength - this.shadowStrengthChangePerSecond*Math.min(this.timeSinceLastQuote, this.timeUntilNextQuote);
        return Math.max(this.minimumShadowStrength, shadow);
    }

    set shadowStrength(newShadowStrength){
        this._shadowStrength = newShadowStrength;
    }

    nextImageIsTheSame(){
        if(!this.quoteList[Number(this.index)+1]) return true;
        if(!this.quoteList[this.index].image) return false;
        return this.quoteList[this.index].image == this.quoteList[Number(this.index)+1].image;
    }

    lastImageWasTheSame(){
        if(!this.quoteList[this.index-1]) return false;
        if(!this.quoteList[this.index].image) return false;
        return this.quoteList[this.index].image == this.quoteList[this.index-1].image;
    }

    fadeShadow(){
        // Sets it in place
        this.shadowStrength = this.shadowStrength;
        this.fadingShadow = true;
    }

    doFirstFrame(){
        this.isFirstFrame = false;

        for(let i in this.quoteList){
            let quoteTime = this.quoteList[i].quoteTime;
            time.delayedFunction(this, 'makeNewQuote', quoteTime, [i]);
        }
    }

    update(quote = this.quote){
        if(this.isFirstFrame) this.doFirstFrame();
        /*
        if(this.shadowStrength > this.minimumShadowStrength + this.shadowStrengthChangePerSecond * time.deltaTime){
            this.shadowStrength -= this.shadowStrengthChangePerSecond * time.deltaTime;
        }
        */
        if(this.fadingShadow)
            this.shadowStrength -= this.shadowStrengthChangePerSecond*time.deltaTime;
       

        if(this.imageVelocity)
            this.imageOffset = this.imageOffset.add(this.imageVelocity.multiply(time.deltaTime));
        
        if(this.image)  {
            this.p.push();
            this.p.imageMode(CENTER);
            this.p.image(this.image, width/2 + this.imageOffset.x, height/2 - this.imageOffset.y);
            this.p.pop();
        }

        this.p.push();
        {
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(40);
            this.p.textLeading(80);
            this.p.fill(255);
            this.p.noStroke();
            this.p.textFont(transitionFont);
    
            this.p.text(quote, this.p.width/2, this.p.height-100);
        }
        this.p.pop();
        
        if(this.castsShadow){
            this.p.push();
            this.p.fill(0, 0, 0, this.shadowStrength);
            this.p.noStroke();
            this.p.rect(0, 0, this.p.width, this.p.height);
            this.p.pop();
        }
    }

    error(){
        throw error;
    }
}

class TypedTransition extends Transition{
    constructor(quoteList, p, withinScene, castsShadow){
        super(quoteList, p, withinScene, castsShadow);

        // In words per minute
        this.typingSpeed = 110;
        this.quoteTimeMultiplier = 1;

        let totalTime = 0;
        for(let i of quoteList){
            totalTime += i.quoteTime;
        }
    }

    get timePerLetter(){
        return 60/(5*this.typingSpeed);
    }

    makeNewQuote(index){
        super.makeNewQuote(index);
        this.numLetters = 1;
    }

    update(){
        this.numLetters += time.totalDeltaTime / this.timePerLetter;
        let quote = this.quote.substring(0, this.numLetters);
        super.update(quote);
    }

    findQuoteTime(index){
        if(this.quoteList[index].quoteTime) return this.quoteList[index].quoteTime / introSpeed;
        else{ return this.timePerLetter * this.quoteTimeMultiplier * this.quoteList[index].length; }
    }
}