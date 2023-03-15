class Canvas{
    /**
     * @param {Object} image The image associated with the canvas
     * @param {Number} width Box width if no image, does nothing if an image is provided
     * @param {Number} height Box height if no image, does nothing if an image is provided
     */
    constructor(image, p, width = 0, height = 0, flip = false){
        this.p = p;
        this.image = image;
        if(this.image){
            this.width = this.image.width;
            this.height = this.image.height;

            console.assert(this.width > 0 && this.height > 0, 'Cannot load image with a width or height of zero');
        }
        else{
            this.width = width;
            this.height = height;
        }
        this.name = 'No name set';
        
        this.canvas = p.createGraphics(this.width*pixelSize, this.height*pixelSize);

        this.isSetUp = false;

        this.flip = flip;
    }

    setup(){
        if(this.image){
            this.addImage(this.image, this.rotation);
        }
        else{
            this.addBox();
        }

        this.isSetUp = true;
    }

    draw(x, y, rotation = 'right', transparency = 0){
        console.assert(this.isSetUp, this.name);
        scene.drawImage(x, y, this.canvas, rotation, transparency);
    }

    drawOnScreen(x, y){
        console.assert(this.isSetUp, this.name);
        this.p.image(this.canvas, x, y);
    }

    /*
    drawInTransition(x, y){
        imageMode(CENTER);
        image(this.canvas, x, height-y);
        imageMode(CORNER);
    }*/

    addBox(x = 0, y = 0, width = this.canvas.width/pixelSize, height = this.canvas.height/pixelSize, color = 0){
        this.canvas.noStroke();
        this.canvas.fill(color);
        this.canvas.rect(x*pixelSize, y*pixelSize, width*pixelSize, height*pixelSize);
    }

    addImage(img, rotation = 'right'){
        
        img.loadPixels();

        this.canvas.noStroke();
        let pixel = pixelSize; // I use this a ton, so I'm shortening it

        let x, y;
        // Iterate through both the image's height and width
        for(y = 0; y < this.height; y++){
            for(x = 0; x < this.width; x++){
                this.p.push();

                let tempX = x;
                if(this.flip){
                    x = this.width-x-1;
                }

                // Load pixels into a p5 color
                let r = img.pixels[y*this.width*4 + x*4];
                let g = img.pixels[y*this.width*4 + x*4+1];
                let b = img.pixels[y*this.width*4 + x*4+2];
                let a = img.pixels[y*this.width*4 + x*4+3];
                
                let clr = this.p.color(r, g, b, a);
                clr.setAlpha(a * 255);
                this.canvas.fill(clr);
                
                let finalX, finalY;
                // Peraps I can import numerical directions; that would be nice
                // This is terrible code, but I don't know how to make it better
                switch(rotation){
                case 'up':
                    finalX = y*pixel;
                    finalY = -x*pixel + (width-1)*pixel;
                    //canvas.rect(y*pixel, -x*pixel + (img.width-1)*pixel, pixel);
                    break;
                case 'left':
                    finalX = -x*pixel + (width-1)*pixel;
                    finalY = -y*pixel + (height-1)*pixel;
                    //canvas.rect(-x*pixel + (img.width-1)*pixel, -y*pixel + (img.height-1)*pixel, pixel);
                    break;
                case 'down':
                    finalX = -y*pixel + (height-1)*pixel;
                    finalY = x*pixel;
                    //canvas.rect(-y*pixel + (img.height-1)*pixel, x*pixel, pixel);
                    break;
                case 'right':
                    finalX = x*pixel;
                    finalY = y*pixel;
                    //canvas.rect(x*pixel, y*pixel, pixel);
                    break;
                default:
                    console.log('Image rotation has reached an impossible state.');
                }
                
                this.canvas.rect(finalX, finalY, pixel, pixel);

                x = tempX;
                this.p.pop();
            }
        }
    }
}