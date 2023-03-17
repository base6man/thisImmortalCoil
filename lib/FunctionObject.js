class FunctionObject{
  constructor(p){
      this.p = p;
  }
  
  createScene(startingPlayerPosition){
      scene = new Scene(this.p, startingPlayerPosition);
  }

  setupScene(){
    scene.setup();
  }

  resetImages(){
    for(let i in allImages){
      for(let j in allImages[i]){
        allImages[i][j].reset();
      }
    }
  
    for(let i in allHeads){
      for(let j in directions){
        allHeads[i][directions[j]].reset();
      }
    }
    for(let i in playerRunRight) playerRunRight[i].reset();
    for(let i in usableFloorImage) usableFloorImage[i].image.reset();
    for(let i in dirtyFloorImage) dirtyFloorImage[i].image.reset();
  }
}