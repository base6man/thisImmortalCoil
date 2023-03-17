class Textbox{
    // Terrible design
    // I don't know how I'll do speech. Perhpas subtitiles, but that seems stilted
    // They would have to have spoken lines.
    // That's hard
    //
    // A textbox should be made new each time it is changed
    // You can persist it through frames if you want, though
    // It will not persist between frames, nor will it build itself
    // I'll make a code for that later
    
    /**
     * @param {Array} quoteArray An array of the quote to be spoken, broken up by lines
     * @param {Number} x Starting x value of the quote
     * @param {Number} y Starting y value of the quote
     */
    constructor(quoteArray, p, x = null, y = null){
        this.quotes = quoteArray;
        this.position = new Vector(x, y);

        this.textSize = 36/5 * pixelSize;
        this.p = p;

        this.index = scene.textboxes.length;
        scene.textboxes.push(this);

        console.assert(typeof this.quotes[0] == 'string', this.quotes);

        p.push();
        {
            p.textSize(this.textSize);
            p.textFont(textboxFont);
    
            this.maxHeight = this.quotes.length * (this.textSize-12) + 10 + pixelSize;
            this.maxWidth = 1;
            for(let i in this.quotes){
                if(p.textWidth(this.quotes[i]) > this.maxWidth){
                    this.maxWidth = p.textWidth(this.quotes[i]) + 7 + 3*pixelSize;
                }
            }
    
            this.canvas = p.createGraphics(this.maxWidth, this.maxHeight);
        }
        p.pop();

    }

    update(x = this.position.x, y = this.position.y){
        this.position.x = x;
        this.position.y = y;
        this.hasUpdated = true;
    }

    updateImage(x = this.position.x, y = this.position.y, quotes = this.quotes){

        if(!this.hasUpdated){
            time.delayedFunction(this, 'delete', 0); // Delete at end of frame
            return;
        }
        this.hasUpdated = false;

        this.canvas.textSize(this.textSize);
        this.canvas.textFont(textboxFont);
        this.canvas.textAlign(this.p.LEFT, this.p.TOP);
        
        const p = pixelSize;
        this.canvas.noStroke();
        this.canvas.fill(0);
        this.canvas.rect(2*p, 2*p, this.maxWidth-2*p, this.maxHeight-2*p);
        this.canvas.rect(0, 0, this.maxWidth-p, this.maxHeight-p);
        this.canvas.fill(255);
        this.canvas.rect(p, p, this.maxWidth-3*p, this.maxHeight-3*p)

        x += this.maxWidth/2/p;
        y += this.maxHeight/2/p;

        this.canvas.fill(0);
        let noText = true;
        for(let i in quotes){
            this.canvas.text(quotes[i], 7, i*(this.textSize-12)-5);
            if(this.quotes[i].length > 0) noText = false;
        }
        if(noText) return;

        scene.drawImage(x, y, this.canvas);
    }

    delete(){
        scene.textboxes.splice(this.index, 1);

        for(let i = this.index; i < scene.textboxes.length; i++){
            scene.textboxes[i].moveDownOneIndex();
          }
  
          for(let i in scene.textboxes){
              console.assert(scene.textboxes[i].index == i);
          }
    }

    moveDownOneIndex(){
        this.index--;
    }
}

class TypedTextbox extends Textbox{
    constructor(quoteArray, p, x, y, voice = voiceEffects.sam, typingSpeed = 350){
        super(quoteArray, p, x, y);

        this.talkingEffect = playSound(voice, 0.8);

        // In words per minute
        this.typingSpeed = typingSpeed;
        this.numLetters = 1;
        
        this.startTime = time.runTime;
        this.hasStoppedTime = false;

        this.noText = true;
        for(let i in this.quotes)
            if(this.quotes[i].length > 0) this.noText = false;

        if(scene.fastForwarding && !this.noText) {
            scene.stopFastForward();
        }
    }

    get timePerLetter(){
        return 60/(5*this.typingSpeed);
    }

    get timeToType(){
        let length = 0;
        for(let i of this.quotes)
            length += i.length;
        
        return this.timePerLetter*length;
    }

    updateImage(x, y){
        this.numLetters += time.totalDeltaTime / this.timePerLetter;

        let lettersLeft = this.numLetters;
        let quote = [];

        let i;
        for(i in this.quotes){
            console.assert(typeof this.quotes[i] == 'string', this.quotes[i], i, this.quotes)

            if(this.quotes[i].length <= lettersLeft){
                quote[i] = this.quotes[i];
                lettersLeft -= this.quotes[i].length;
            }
            else{
                quote[i] = this.quotes[i].substring(0, lettersLeft);
                lettersLeft = 0;
            }
        }

        if(this.startTime + this.timeToType <= time.runTime && !this.hasStoppedTime) {
            this.talkingEffect.pause();
            if(scene.fastForwarding && !this.noText) scene.stopFastForward();
            this.hasStoppedTime = true;
        }

        super.updateImage(x, y, quote);
    }

    delete(){
        super.delete();
        this.talkingEffect.pause();
    }
}