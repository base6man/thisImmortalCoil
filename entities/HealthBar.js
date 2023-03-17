class HealthBar{
    constructor(parent, maxHealth, isPlayer, p){
        this.parent = parent;
        this.offset = new Vector(5, 4);
        this.p = p;

        this.isPlayer = isPlayer;
        
        this.color;
        if(this.isPlayer) this.color = p.color(20, 230, 20);
        else{ this.color = p.color(230, 20, 230); }

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.previousHealth;

        this.shouldDisplay = false;
        this.displayingPreviousValue = true;

        this.index = scene.uiElements.length;
        scene.uiElements.push(this);

        this.healthTileWidth = 1;
        this.healthTileHeight = 2;
        this.spaceBetweenTiles = 1;

        this.displayTime = 2;
        this.switchTime = 0.8;

        this.createCanvases();

        this.healthCanvas.name = 'healthBar';
        this.previousHealthCanvas.name = 'previousHealthBar';

        this.isFirstFrame = true;
    }

    resetAndSetup(){
        this.createCanvases();
        this.doFirstFrame();
    }

    createCanvases(){
        this.totalWidth = this.maxHealth * (this.healthTileWidth + this.spaceBetweenTiles) + this.spaceBetweenTiles;
        this.totalHeight = this.healthTileHeight + 2 * this.spaceBetweenTiles;

        this.healthCanvas = new Canvas(null, this.p, this.totalWidth, this.totalHeight);
        this.previousHealthCanvas = new Canvas(null, this.p, this.totalWidth, this.totalHeight);
    }

    doFirstFrame(){
        this.isFirstFrame = false;
    }

    updateImage(){
        if(this.isFirstFrame)
            this.doFirstFrame();
        
        if(this.shouldDisplay && !this.parent.invisible) {
            if(this.displayingPreviousValue) this.previousHealthCanvas.draw(this.position.x, this.position.y);
            else{ this.healthCanvas.draw(this.position.x, this.position.y); }
        }
    }
    
    display(newHealth){
        if(this.isFirstFrame){
            time.delayedFunction(this, 'display', 0, [newHealth]);
            return;
        }


        this.shouldDisplay = true;
        this.previousHealth = this.health;
        this.health = newHealth;

        this.canSwitch = true;
        this.displayingPreviousValue = true;

        this.updateCanvas(this.healthCanvas, this.health);
        this.updateCanvas(this.previousHealthCanvas, this.previousHealth);

        time.stopFunctions(this, 'stopDisplay');
        time.stopFunctions(this, 'stopSwitching');
        time.stopFunctions(this, 'switchToNew');
        
        time.delayedFunction(this, 'stopDisplay', this.displayTime);
        time.delayedFunction(this, 'stopSwitching', this.switchTime);
        time.delayedFunction(this, 'switchToNew', 0.25);
    }

    updateCanvas(image, health){

        image.addBox(0, 0, this.totalWidth, this.totalHeight, 255);

        for(let i = 0; i < health; i++){
            image.addBox(
                this.spaceBetweenTiles + i * (this.healthTileWidth + this.spaceBetweenTiles), 
                this.spaceBetweenTiles, 
                this.healthTileWidth, 
                this.healthTileHeight, 
                this.color
            );
        }

        image.isSetUp = true;
    }

    stopDisplay(){
        this.shouldDisplay = false;
    }

    stopSwitching(){
        this.canSwitch = false;
    }

    switchToNew(){
        this.displayingPreviousValue = false;
        if(this.canSwitch) time.delayedFunction(this, 'switchToPrevious', 0.25);
    }

    switchToPrevious(){
        this.displayingPreviousValue = true;
        if(this.shouldDisplay) time.delayedFunction(this, 'switchToNew', 0.25);
    }

    get position(){
        return this.parent.position.add(this.offset);
    }

    delete(){
        
        scene.uiElements.splice(this.index, 1);
        time.stopFunctions(this, null);

        for(let i = this.index; i < scene.uiElements.length; i++){
          scene.uiElements[i].moveDownOneIndex();
        }

        for(let i in scene.uiElements){
            console.assert(scene.uiElements[i].index == i);
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}

class HudHealthBar extends HealthBar{
    constructor(parent, maxHealth, isPlayer=false, p){
        super(parent, maxHealth, isPlayer, p);

        this.redColor = p.color(255, 0, 0);
        this.yellowColor = p.color(255, 255, 0);

        this.healthTileWidth = 2;
        this.healthTileHeight = 3;
        this.spaceBetweenTiles = 1;
        
        this.createCanvases();
    }

    createCanvases(){
        this.totalWidth = this.maxHealth * (this.healthTileWidth + this.spaceBetweenTiles) + this.spaceBetweenTiles + 5;
        this.totalHeight = this.healthTileHeight + 2 * this.spaceBetweenTiles + 4;

        this.healthCanvas = new Canvas(null, this.p, this.totalWidth, this.totalHeight);
        this.previousHealthCanvas = new Canvas(null, this.p, this.totalWidth, this.totalHeight);
    }

    doFirstFrame(){
        super.doFirstFrame();

        this.updateCanvas(this.healthCanvas, this.health);
        this.updateCanvas(this.previousHealthCanvas, this.health);
    }

    get shouldDisplay(){
        return true;
    }

    set shouldDisplay(parameter){ }

    get offset(){
        if(this.isPlayer) return new Vector(0, 0);

        let index = scene.bossManager.bosses.indexOf(this.parent);
        if(index == -1) return new Vector(0, 0);

        return new Vector(0, (this.totalHeight)*pixelSize*index);
    }

    set offset(parameter){ }

    get position(){
        let x, y;
        if(this.isPlayer) x = 0;
        else{ x = this.p.width - (this.totalWidth) * pixelSize; }

        y = 0;
        return new Vector(x, y).add(this.offset);
    }

    stopSwitching(){
        if(this.health == 1 && this.isPlayer){
            this.updateCanvas(this.healthCanvas, 1, this.redColor);
            this.updateCanvas(this.previousHealthCanvas, 1, this.yellowColor);
        }
        else{
            this.canSwitch = false;
        }
    }

    updateCanvas(image, health, myColor = this.color){

        image.addBox(1, 1, this.totalWidth-3, this.totalHeight-2, this.p.color(125, 50, 0));
        image.addBox(this.totalWidth-2, 2, 1, this.totalHeight-4, this.p.color(125, 50, 0));
        image.addBox(2, 2, this.totalWidth-5, this.totalHeight-4, 255);

        for(let i = 0; i < health; i++){
            image.addBox(
                this.spaceBetweenTiles + i * (this.healthTileWidth + this.spaceBetweenTiles) + 2, 
                this.spaceBetweenTiles + 2, 
                this.healthTileWidth, 
                this.healthTileHeight, 
                myColor
            );
        }

        image.isSetUp = true;
    }

    updateImage(){
        if(this.isFirstFrame)
            this.doFirstFrame();

        if(this.displayingPreviousValue) this.previousHealthCanvas.drawOnScreen(this.position.x, this.position.y);
        else{                            this.healthCanvas.drawOnScreen(this.position.x, this.position.y);}
    }
}