class Vector{
    /**
     * @Param {Number} x Vector's x value
     * @Param {Number} y Vector's y value
     */

    constructor(x, y){
        this.x = x;
        this.y = y;

        this.type = 'vector';
    }

    add(other)     { return new Vector(this.x + other.x, this.y + other.y); }
    subtract(other){ return new Vector(this.x - other.x, this.y - other.y); }
    multiply(other){ return new Vector(this.x * other, this.y * other);     }
    divide(other)  { return new Vector(this.x / other, this.y / other);     }
    
    invert(){ 
        const newVector = new Vector(1/this.x, 1/this.y); 

        // If it was 0 it should now be infinity, but code doesn't like infinity
        if(newVector.x > 9999)  newVector.x = 9999;
        if(newVector.x < -9999) newVector.x = -9999;
        if(newVector.y > 9999)  newVector.y = 9999;
        if(newVector.y < -9999) newVector.y = -9999;

        return newVector;
    }

    addWithFriction(other, friction){
        return (this.add(other.multiply(friction))).divide(1 + friction);
    }

    toString(){
        return this.x + ', ' + this.y;
    }

    get magnitude(){
        return Math.sqrt(this.sqrMagnitude);
    }

    get sqrMagnitude(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    set magnitude(newMag){
        let currentMag = this.magnitude;

        if(currentMag){
            this.x *= newMag / currentMag;
            this.y *= newMag / currentMag;
        }
    }

    get angle(){
        let angle = Math.atan2(this.y, this.x);
        if(angle < 0) angle += 2*Math.PI;
        return angle;
    }

    set angle(_angle){
        let currentMag = this.magnitude;

        if(currentMag){
            this.x = Math.cos(_angle) * currentMag;
            this.y = Math.sin(_angle) * currentMag;
        }
    }

    setAngle(_angle){
        let currentMag = this.magnitude;

        let newVector = new Vector(0, 0);
        if(currentMag){
            newVector.x = Math.cos(_angle) * currentMag;
            newVector.y = Math.sin(_angle) * currentMag;
        }
        return newVector;
    }

    isVector(){
        return isNumber(this.x) && isNumber(this.y);
    }

    insideOf(firstCorner, secondCorner){
        return isBetween(this.x, firstCorner.x, secondCorner.x) && isBetween(this.y, firstCorner.y, secondCorner.y);
    }

    lerp(other, time){
        return new Vector(this.internalLerp(this.x, other.x, time), this.internalLerp(this.y, other.y, time));
    }

    internalLerp (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    };

    rotate(angleChange){
        this.angle += angleChange;
    }

    copy(){
        return new Vector(this.x, this.y);
    }

    get direction(){
        return this.findDirection().direction;
    }

    get diagonal(){
        return this.findDirection().diagonal;
    }
      
    findDirection(theta = this.angle){

        if(theta >= Math.PI/8 && theta < Math.PI*3/8){
            return {direction: 'up', diagonal: true};
        }
        else if (theta >= Math.PI*3/8 && theta < Math.PI*5/8){
            return {direction: 'up', diagonal: false};
        }
        else if (theta >= Math.PI*5/8 && theta < Math.PI*7/8){
            return {direction: 'left', diagonal: true};
        }
        else if (theta >= Math.PI*15/8 || theta < Math.PI*1/8){
            return {direction: 'right', diagonal: false};
        }
        else if (theta >= Math.PI*13/8 && theta < Math.PI*15/8){
            return {direction: 'right', diagonal: true};
        }
        else if (theta >= Math.PI*11/8 && theta < Math.PI*13/8){
            return {direction: 'down', diagonal: false};
        }
        else if (theta >= Math.PI*9/8 && theta < Math.PI*11/8){
            return {direction: 'down', diagonal: true};
        }
        else{
            return {direction: 'left', diagonal: false};
        }

    }
}

class Position extends Vector{
    constructor(x, y){
        super(x, y);
        this.type = 'position';
    }
}

class Velocity extends Vector{
    constructor(x, y){
        super(x, y);
        this.type = 'velocity';
    }

    setAngle(_angle){
        let vector = super.setAngle(_angle);
        return new Velocity(vector.x, vector.y)
    }
}

class Acceleration extends Vector{
    constructor(x, y){
        super(x, y);
        this.type = 'acceleration';
    }

    setAngle(_angle){
        let vector = super.setAngle(_angle);
        return new Acceleration(vector.x, vector.y)
    }
}

class Angle{
    constructor(num){
        this.angle = num;
        this.type = 'angle';
    }
}