export var nextFrame = window.requestAnimationFrame ? window.requestAnimationFrame : function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
    window.setTimeout(function() {
        callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
}
