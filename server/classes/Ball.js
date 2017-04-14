// Ball class
class Ball {
  constructor(createdAt) {
    this.createdAt = createdAt; // Ball timestamp
    // last time this character was updated
    this.lastUpdate = new Date().getTime();
    this.x = 250; // x location of character on screen
    this.y = 250; // y location of character on screen
    this.prevX = 0; // last known x location of character
    this.prevY = 0; // last known y location of character
    this.destX = 1; // destination x location of character
    this.destY = 1; // destination y location of character
    this.radius = 15; // height of character
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
    this.direction = 0; // direction character is facing
    this.sAngle = 0; // start angle
    this.eAngle = 2*Math.PI; // end angle 
    this.canBounce = false; // only applies if type bounce 
    this.numBounce = 0; //int to change if i want to alter num of bounces 
    this.type = 'normal'; // type of ball it is 
    this.color = '#000';
    this.canWrap = false;
    this.index = 0;
    this.speed = 1;
  }
}

module.exports = Ball;


