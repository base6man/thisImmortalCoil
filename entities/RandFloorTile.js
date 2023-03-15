class RandFloorTile extends FloorTile{
    constructor(images, minX=-Infinity, minY=-Infinity, maxX=Infinity, maxY=Infinity){
        super(null, minX, minY, maxX, maxY);

        this.images = images;
        this.width =  (this.images[0].image.width);
        this.height = (this.images[0].image.height);
        
        this.seed = [];
        for(let i = 0; i < 1000; i++){
            this.seed.push(randRange(0, 1));
        }
    }

    setProbabilities(){
        this.totalSpawnRate = 0;

        for(let i of this.images) {
            i.minToSpawn = this.totalSpawnRate;
            this.totalSpawnRate += i.spawnRate;
            i.maxToSpawn = this.totalSpawnRate;
        }
    }

    updateImage(){
        let count = 0;

        for(let x = this.startX; x <= this.endX; x += this.width){
            for(let y = this.startY; y <= this.endY; y += this.height){

                console.assert(Math.floor(x) == x && Math.floor(y) == y, this.width, this.height);

                // Here is the random number generator
                // I used the most random thing I could think of:
                // seed[10*x*seed[y]] + seed[10*y*seed[x]]
                // The rest is all just fluff
                this.setProbabilities();

                let a = Math.abs(Math.ceil(this.seed[Math.abs(x % 1000)]*y*10) % 1000);
                let b = Math.abs(Math.ceil(this.seed[Math.abs(y % 1000)]*x*10) % 1000);

                let spawnNum = (this.seed[a] + this.seed[b])* this.totalSpawnRate / 2;

                let myImage, hasDecided = false, noRotate;
                for(let i of this.images){
                    if(isBetweenInclusive(spawnNum, i.minToSpawn, i.maxToSpawn) && !hasDecided){

                        noRotate = i.noRotate;
                        myImage = i.image;
                        hasDecided = true;
                    }
                }

                let rotation = 'right'
                if(!noRotate) {
                    let possibleRotations = ['right', 'left', 'up', 'down'];
                    let index = Math.floor(this.seed[a + b] * 4);

                    rotation = possibleRotations[index];
                }

                myImage.draw(x, y, rotation);
                count++;
            }
        }

    }

    get startX(){
        let temp = Math.max(scene.mainCamera.leftEdge - this.width, this.minX);
        temp -= temp % this.width;
        return temp;
    }

    get startY(){
        let temp = Math.max(scene.mainCamera.bottomEdge - this.height, this.minY);
        temp -= temp % this.width;
        return temp;
    }

    get endX(){
        let temp = Math.min(scene.mainCamera.rightEdge + this.width, this.maxX);
        temp -= temp % this.width;
        return temp;
    }

    get endY(){
        let temp = Math.min(scene.mainCamera.topEdge + this.height, this.maxY);
        temp -= temp % this.width;
        return temp;
    }
}