class AnimationManager{
    /**
     * @param {Array} animations An array of animations, each with a parent, name, animator, and canRun
     */

    constructor(animations){
        this.animations = animations;
        this.currentAnimation;
    }

    update(){
        // First animations take precedence
        let alreadyRunningAnAnimation = false;

        for(let i in this.animations){
            if(this.animations[i].canRun && !alreadyRunningAnAnimation){

                alreadyRunningAnAnimation = true;
                if(this.animations[i].animation != this.currentAnimation){
                    
                    if(this.currentAnimation){
                        this.currentAnimation.stop();
                    }
                    
                    this.animations[i].animation.run();
                    this.currentAnimation = this.animations[i].animation;
                }
            }
        }

        console.assert(this.currentAnimation, this.animations);
    }

    draw(x, y, rotation = 'right', transparency = 0){
        console.assert(this.currentAnimation, this.animations);

        if(!this.currentAnimation.canRotate) rotation = 'right';
        this.currentAnimation.currentImage.draw(x, y, rotation, transparency);
    }
}

class PresetAnimationManager extends AnimationManager{
    constructor(parent, name){
        super(null);
        this.parent = parent;
        let listOfAnimations = [];
        
        if(name == 'guard' || name == 'hardGuard')
        {
            /*
            let attackAnimation = {
                parent: this.parent, 
                name: 'attack',
                animation: new Animator('attack', bossImages.guardAttack, 0.3),
                get canRun(){
                    return this.parent.attackAnimation && !this.parent.isDodging;
                }
            }
            listOfAnimations.push(attackAnimation);
            */
            
            let idleAnimation = {
                parent: this.parent,
                name: 'idle',
                animation: new Animator('idle', bossImages.guardIdle, 0.8),
                get canRun(){
                    return !this.parent.diagonal;
                }
            }
            listOfAnimations.push(idleAnimation);
            
            let diagonalAnimation = {
                parent: this.parent,
                name: 'diagonal',
                animation: new Animator('diagonal', bossImages.guardDiagonal, 0.8),
                get canRun(){
                    return this.parent.diagonal;
                }
            }
            listOfAnimations.push(diagonalAnimation);
        }
        else if(name == 'soldier')
        {
            let attackAnimation = {
                parent: this.parent, 
                name: 'attack',
                animation: new Animator('attack', bossImages.soldierAttack, 0.3),
                get canRun(){
                    return this.parent.attackAnimation && this.parent.currentAttack.melee && !this.parent.diagonal;
                }
            }
            listOfAnimations.push(attackAnimation);
            
            let diagonalAttackAnimation = {
                parent: this.parent, 
                name: 'diagonalAttack',
                animation: new Animator('diagonalAttack', bossImages.soldierAttackDiagonal, 0.3),
                get canRun(){
                    return this.parent.attackAnimation && this.parent.currentAttack.melee && this.parent.diagonal;
                }
            }
            listOfAnimations.push(diagonalAttackAnimation);
    
            let normalAnimation = {
                parent: this.parent, 
                name: 'normal',
                animation: new Animator('normal', bossImages.soldier, 0.3),
                get canRun(){
                    return !this.parent.diagonal;
                }
            }
            listOfAnimations.push(normalAnimation);
    
            let diagonalAnimation = {
                parent: this.parent, 
                name: 'diagonal',
                animation: new Animator('diagonal', bossImages.soldierDiagonal, 0.3),
                get canRun(){
                    return this.parent.diagonal;
                }
            }
            listOfAnimations.push(diagonalAnimation);
        }
        else if (name == 'clocksmith')
        {
            let botAnimation = {
                parent: this.parent,
                name: 'bot',
                animation: new Animator('bot', bossImages.bot, 1),
                get canRun(){
                    return this.parent.isBot;
                }
            }
            listOfAnimations.push(botAnimation);

            
            let idleAnimation = {
                parent: this.parent,
                name: 'idle',
                animation: new Animator('idle', clocksmithImages.normal, 0.8),
                get canRun(){
                    return true;
                }
            }
            listOfAnimations.push(idleAnimation);
        }
        else if (name == 'samurai')
        {

            let idleAnimation = {
                parent: this.parent,
                name: 'idle',
                animation: new Animator('idle', bossImages.samurai, 0.8),
                get canRun(){
                    //return this.parent.slant() == 0 || this.parent.slant() == 4;
                    return true;
                }
            }
            listOfAnimations.push(idleAnimation);
        }
        else if (name == 'knight')
        {
            let normalAnimation = {
                parent: this.parent,
                name: 'normal',
                animation: new Animator('normal', bossImages.knight, 0.8),
                get canRun(){
                    return !this.parent.diagonal;
                }
            }
            listOfAnimations.push(normalAnimation);
            
            let diagonalAnimation = {
                parent: this.parent,
                name: 'diagonal',
                animation: new Animator('diagonal', bossImages.knightDiagonal, 0.8),
                get canRun(){
                    return this.parent.diagonal;
                }
            }
            listOfAnimations.push(diagonalAnimation);
        }
        else if (name == 'bot'){
            
            let botAnimation = {
                parent: this.parent,
                name: 'bot',
                animation: new Animator('bot', bossImages.bot, 1),
                get canRun(){
                    return true;
                }
            }
            listOfAnimations.push(botAnimation);
        }
        else{
            console.log("Can't do a preset animation for an unnamed animation");
        }
        
        this.animations = listOfAnimations
    }
}