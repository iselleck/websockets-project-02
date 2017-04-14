// Character class
class Character {
  constructor(hash) {
    this.hash = hash; // character's unique id
    // last time this character was updated
    this.lastUpdate = new Date().getTime();
    this.x = 250; // x location of character on screen
    this.y = 100; // y location of character on screen
    this.prevX = this.x; // last known x location of character
    this.prevY = this.y; // last known y location of character
    this.destX = this.x; // destination x location of character
    this.destY = this.y; // destination y location of character
    this.height = 100; // height of character
    this.radius = 20; // width of character
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
    this.direction = 0; // direction character is facing
    this.moveLeft = false; // if character is moving left
    this.moveRight = false; // if character is moving right
    this.moveDown = false; // if character is moving down
    this.moveUp = false; // if character is moving up
    this.canMove = true;
    this.isthrusting = false; // check if moving forward
    this.thrust = 0.1;
    this.turnSpeed = 0.001;
    this.angle = 0;
    this.velX = 0; //velocity x
    this.velY = 0; // velocity y
    this.pointLength = 30;
    this.px = 0;
    this.py = 0;
  }
}

module.exports = Character;


