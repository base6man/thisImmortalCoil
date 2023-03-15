const KeyReader = new Proxy({
    space: {
        code: 32,
        canRepeat: false
    },
    holdSpace: {
        code: 32,
        canRepeat: true
    }
}, {
    get(obj, target) {
        /*
        const key = obj[target] ?? {
            code: target.charCodeAt(0) - 32,
            canRepeat: true
        };
        */
        let key;
        if(obj[target])
            key = obj[target];
        else{
            key = {
                code: target.charCodeAt(0) - 32,
                canRepeat: true
            }
        }

        if (scene.p.keyIsDown(key.code)) {
            if (key.pressedLastFrame && !key.canRepeat) return false;
            key.pressedLastFrame = true;
            return true;
        }
        else{
            key.pressedLastFrame = false;
            return false;
        }
    }
});