class FunctionObject{
    constructor(p){
        this.p = p;
    }
    
    createScene(startingPlayerPosition){
        scene = new Scene(this.p, startingPlayerPosition);
        scene.setup();
    }

}